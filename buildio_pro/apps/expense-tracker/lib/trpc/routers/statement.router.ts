import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";

import {
  DEFAULT_EXTRACTION_MODEL,
  extractStatement,
  ingestStatementExtraction,
  listGatewayModels,
} from "@/lib/ai";
import {
  buildStatementKey,
  deleteStatementObject,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  getStatementObject,
  MAX_FILE_SIZE,
  statementObjectExists,
} from "@/lib/storage/s3";

import { createTRPCRouter, protectedProcedure } from "../init";
import {
  calculatePagination,
  createPaginationMeta,
  paginationInputSchema,
} from "../schemas/pagination.schema";

const documentTypeSchema = z.enum([
  "credit_card",
  "bank_statement",
  "income_statement",
  "income_tax_statement",
]);

const createUploadInput = z.object({
  documentType: documentTypeSchema,
  filename: z.string().trim().min(1, "Filename is required").max(255),
  contentType: z.string().trim().min(1, "Content type is required").max(255),
  fileSize: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(MAX_FILE_SIZE, `File must be smaller than ${MAX_FILE_SIZE} bytes`),
});

const uploadIdInput = z.object({
  uploadId: z.uuid(),
});

const renameUploadInput = z.object({
  uploadId: z.uuid(),
  filename: z.string().trim().min(1, "Filename is required").max(255),
});

const listStatementsInput = paginationInputSchema.extend({
  documentType: documentTypeSchema.optional(),
});

const processUploadInput = z.object({
  uploadId: z.uuid(),
  model: z.string().trim().min(1).max(255).optional(),
  // Overrides the stored document type (and with it the extraction prompt).
  documentType: documentTypeSchema.optional(),
});

export const statementRouter = createTRPCRouter({
  createUpload: protectedProcedure
    .input(createUploadInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const s3Key = buildStatementKey({
        userId: user.id,
        documentType: input.documentType,
        filename: input.filename,
      });

      const [record] = await db
        .insert(dbSchema.statementUpload)
        .values({
          userId: user.id,
          documentType: input.documentType,
          originalFilename: input.filename,
          s3Key,
          contentType: input.contentType,
          fileSize: input.fileSize,
          status: "pending",
        })
        .returning();

      if (!record) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create upload record",
        });
      }

      const uploadUrl = await getPresignedUploadUrl({
        key: s3Key,
        contentType: input.contentType,
      });

      return {
        uploadId: record.id,
        uploadUrl,
      };
    }),

  completeUpload: protectedProcedure
    .input(uploadIdInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const record = await db.query.statementUpload.findFirst({
        where: and(
          eq(dbSchema.statementUpload.id, input.uploadId),
          eq(dbSchema.statementUpload.userId, user.id),
        ),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload record not found",
        });
      }

      const uploaded = await statementObjectExists(record.s3Key);
      if (!uploaded) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File was not uploaded to storage. Please try again.",
        });
      }

      const [updated] = await db
        .update(dbSchema.statementUpload)
        .set({
          status: "uploaded",
          uploadedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.statementUpload.id, input.uploadId))
        .returning();

      return updated;
    }),

  renameUpload: protectedProcedure
    .input(renameUploadInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const record = await db.query.statementUpload.findFirst({
        where: and(
          eq(dbSchema.statementUpload.id, input.uploadId),
          eq(dbSchema.statementUpload.userId, user.id),
        ),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload record not found",
        });
      }

      const [updated] = await db
        .update(dbSchema.statementUpload)
        .set({
          originalFilename: input.filename,
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.statementUpload.id, input.uploadId))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to rename statement",
        });
      }

      return updated;
    }),

  listStatements: protectedProcedure
    .input(listStatementsInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const filters = [eq(dbSchema.statementUpload.userId, user.id)];

      if (input.documentType) {
        filters.push(
          eq(dbSchema.statementUpload.documentType, input.documentType),
        );
      }

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.statementUpload)
        .where(whereClause);

      const totalItems = Number(total?.count ?? 0);
      const { offset } = calculatePagination(input, totalItems);

      const records = await db.query.statementUpload.findMany({
        limit: input.limit,
        offset,
        where: whereClause,
        orderBy: (table, { desc }) => desc(table.createdAt),
      });

      return {
        data: records,
        meta: createPaginationMeta(input, totalItems),
      };
    }),

  getDownloadUrl: protectedProcedure
    .input(uploadIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const record = await db.query.statementUpload.findFirst({
        where: and(
          eq(dbSchema.statementUpload.id, input.uploadId),
          eq(dbSchema.statementUpload.userId, user.id),
        ),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload record not found",
        });
      }

      const downloadUrl = await getPresignedDownloadUrl({
        key: record.s3Key,
      });

      return {
        downloadUrl,
        originalFilename: record.originalFilename,
        contentType: record.contentType,
      };
    }),

  listExtractionModels: protectedProcedure.query(async () => {
    return listGatewayModels();
  }),

  processUpload: protectedProcedure
    .input(processUploadInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const record = await db.query.statementUpload.findFirst({
        where: and(
          eq(dbSchema.statementUpload.id, input.uploadId),
          eq(dbSchema.statementUpload.userId, user.id),
        ),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload record not found",
        });
      }

      if (record.status === "processing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This statement is already being processed.",
        });
      }
      if (record.status === "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Upload the file before processing the statement.",
        });
      }

      const model = input.model ?? DEFAULT_EXTRACTION_MODEL;
      const documentType = input.documentType ?? record.documentType;

      await db
        .update(dbSchema.statementUpload)
        .set({
          status: "processing",
          processingError: null,
          extractionModel: model,
          ...(input.documentType && input.documentType !== record.documentType
            ? { documentType: input.documentType }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.statementUpload.id, input.uploadId));

      try {
        const { buffer, contentType } = await getStatementObject(record.s3Key);

        const extraction = await extractStatement({
          buffer,
          contentType,
          filename: record.originalFilename,
          documentType,
          modelId: model,
        });

        const result = await ingestStatementExtraction({
          userId: user.id,
          statementUploadId: input.uploadId,
          extractionModel: model,
          extraction,
        });

        return {
          model,
          ...result,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to process statement";
        await db
          .update(dbSchema.statementUpload)
          .set({
            status: "failed",
            processingError: message.slice(0, 2000),
            updatedAt: new Date(),
          })
          .where(eq(dbSchema.statementUpload.id, input.uploadId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),

  deleteUpload: protectedProcedure
    .input(uploadIdInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const record = await db.query.statementUpload.findFirst({
        where: and(
          eq(dbSchema.statementUpload.id, input.uploadId),
          eq(dbSchema.statementUpload.userId, user.id),
        ),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload record not found",
        });
      }

      await deleteStatementObject(record.s3Key);

      await db
        .delete(dbSchema.statementUpload)
        .where(eq(dbSchema.statementUpload.id, input.uploadId));

      return { success: true };
    }),
});
