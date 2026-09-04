"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface TransactionsPaginationProps {
  meta?: PaginationMeta;
  limit: number;
  onLimitChange: (value: number) => void;
  onPageChange: (page: number) => void;
}

export function TransactionsPagination({
  meta,
  limit,
  onLimitChange,
  onPageChange,
}: TransactionsPaginationProps) {
  if (!meta) return null;

  const { totalPages, currentPage, totalItems } = meta;

  return (
    <>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalItems)} of {totalItems}{" "}
            transactions
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!meta.hasPrevPage}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!meta.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {totalItems > 0 && (
        <div className="mt-2 flex justify-end">
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
