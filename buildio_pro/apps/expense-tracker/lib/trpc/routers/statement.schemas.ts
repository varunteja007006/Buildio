import z from "zod";

import { MAX_FILE_SIZE } from "@/lib/storage/s3";

import { paginationInputSchema } from "../schemas/pagination.schema";

export const documentTypeSchema = z.enum([
  "credit_card",
  "bank_statement",
  "income_statement",
  "income_tax_statement",
]);

export const createUploadInput = z.object({
  documentType: documentTypeSchema,
  filename: z.string().trim().min(1, "Filename is required").max(255),
  contentType: z.string().trim().min(1, "Content type is required").max(255),
  fileSize: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(MAX_FILE_SIZE, `File must be smaller than ${MAX_FILE_SIZE} bytes`),
});

export const uploadIdInput = z.object({
  uploadId: z.uuid(),
});

export const renameUploadInput = z.object({
  uploadId: z.uuid(),
  filename: z.string().trim().min(1, "Filename is required").max(255),
});

export const listStatementsInput = paginationInputSchema.extend({
  documentType: documentTypeSchema.optional(),
});

export const processUploadInput = z.object({
  uploadId: z.uuid(),
  model: z.string().trim().min(1).max(255).optional(),
  // Overrides the stored document type (and with it the extraction prompt).
  documentType: documentTypeSchema.optional(),
});
