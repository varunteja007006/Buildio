import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import {
  DEFAULT_EXTRACTION_MODEL,
  extractStatement,
  ingestStatementExtraction,
} from "@/lib/ai";
import { getStatementObject } from "@/lib/storage/s3";

import { protectedProcedure } from "../init";
import { processUploadInput } from "./statement.schemas";

export const processUpload = protectedProcedure
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
        currentExtractionVersion: record.extractionVersion,
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
  });
