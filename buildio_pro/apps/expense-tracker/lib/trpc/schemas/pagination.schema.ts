import { z } from "zod";

/**
 * Base pagination input schema
 * - page: 1-based page number (default: 1)
 * - limit: items per page (default: 10, max: 100)
 */
export const paginationInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type PaginationInput = z.infer<typeof paginationInputSchema>;

/**
 * Helper to calculate pagination values on the server
 */
export function calculatePagination(input: PaginationInput, totalItems: number) {
  const { page, limit } = input;
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    offset,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Creates a standardized pagination meta object for responses
 */
export function createPaginationMeta(
  input: PaginationInput,
  totalItems: number,
) {
  const { page, limit } = input;
  const { offset, totalPages, hasNextPage, hasPrevPage } =
    calculatePagination(input, totalItems);

  return {
    limit,
    currentPage: page,
    offset,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

export type PaginationMeta = ReturnType<typeof createPaginationMeta>;
