"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Document } from "@/api/documents/types";

const FOLDER_PAGE_SIZE = 25;

export function PaginatedFileList({
  docs,
  depth,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  docs: Document[];
  depth: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}) {
  const [visible, setVisible] = useState(FOLDER_PAGE_SIZE);
  const sentinelRef = useRef<HTMLLIElement | null>(null);

  // Reset visible when docs length shrinks (e.g. filter) — keep at least one page
  useEffect(() => {
    if (docs.length < visible)
      setVisible(Math.max(FOLDER_PAGE_SIZE, docs.length));
  }, [docs.length, visible]);

  const visibleDocs = docs.slice(0, visible);
  const canShowMoreLocal = visible < docs.length;
  const canFetchMoreGlobal =
    !canShowMoreLocal && !!hasNextPage && docs.length > 0;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // If we can show more locally, observe to auto-expand; if need global fetch, also observe
    if (!canShowMoreLocal && !canFetchMoreGlobal) return;
    if (isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (canShowMoreLocal) {
          setVisible((v) => Math.min(v + FOLDER_PAGE_SIZE, docs.length));
        } else if (canFetchMoreGlobal) {
          fetchNextPage?.();
        }
      },
      { rootMargin: "200px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    canShowMoreLocal,
    canFetchMoreGlobal,
    isFetchingNextPage,
    docs.length,
    fetchNextPage,
  ]);

  if (docs.length === 0) return null;

  return (
    <>
      {visibleDocs.map((doc) => (
        <FileRow key={doc.id} doc={doc} depth={depth} />
      ))}
      {(canShowMoreLocal || canFetchMoreGlobal) && (
        <li
          ref={sentinelRef}
          className="flex items-center justify-center py-1"
          style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
        >
          {isFetchingNextPage ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Loading…
            </span>
          ) : canShowMoreLocal ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() =>
                setVisible((v) => Math.min(v + FOLDER_PAGE_SIZE, docs.length))
              }
            >
              Show more
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => fetchNextPage?.()}
            >
              Load more from server
            </Button>
          )}
        </li>
      )}
    </>
  );
}

function FileRow({ doc, depth }: { doc: Document; depth: number }) {
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <span className="w-4" />
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{doc.filename}</span>
        <span className="ml-auto shrink-0">
          <Badge
            variant={doc.ingested ? "default" : "secondary"}
            className="text-xs"
          >
            {doc.ingested ? "Ingested" : "Pending"}
          </Badge>
        </span>
      </div>
    </li>
  );
}
