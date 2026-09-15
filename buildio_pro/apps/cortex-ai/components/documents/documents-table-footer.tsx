"use client";

import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import type { RefObject } from "react";

type DocumentsTableFooterProps = {
  total: number;
  loadedCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  onLoadMore: () => void;
};

/** Footer counts, infinite-scroll sentinel, and manual "Load more" fallback. */
export function DocumentsTableFooter({
  total,
  loadedCount,
  isLoading,
  isFetching,
  isFetchingNextPage,
  hasNextPage,
  sentinelRef,
  onLoadMore,
}: DocumentsTableFooterProps) {
  return (
    <>
      {/* Footer: count + infinite status */}
      <div className="flex flex-col gap-2.5 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {total > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">{loadedCount}</span>{" "}
              of <span className="font-medium text-foreground">{total}</span>
              {isFetching && !isFetchingNextPage ? " · updating…" : ""}
            </>
          ) : isLoading ? (
            "Loading…"
          ) : (
            "0 results"
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {hasNextPage ? `${total - loadedCount} more` : "All loaded"}
        </div>
      </div>

      {/* Sentinel + manual fallback */}
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden />

      <div className="flex justify-center py-2">
        {isFetchingNextPage ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading more…
          </span>
        ) : hasNextPage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            Load more
          </Button>
        ) : loadedCount > 0 ? (
          <span className="text-xs text-muted-foreground">
            You&apos;ve reached the end
          </span>
        ) : null}
      </div>
    </>
  );
}
