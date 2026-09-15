"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
};

/** Shared Previous/Next pagination footer for audit log tables. */
export function AuditPaginationFooter({
  page,
  pageCount,
  total,
  onPageChange,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <span className="text-xs text-muted-foreground">
        {total > 0 ? `Page ${page} of ${pageCount} · ${total} total` : "0 results"}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft data-icon="inline-start" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        >
          Next
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
