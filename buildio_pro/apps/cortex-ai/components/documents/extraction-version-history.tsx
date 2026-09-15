"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { GitCompare, Loader2, X } from "lucide-react";
import { useState } from "react";

import { formatDate } from "@/api/documents/helpers";
import { useExtractionVersions } from "@/api/extractions/query";
import { diffLines } from "@/lib/line-diff";
import { cn } from "@/lib/utils";

type ExtractionVersionHistoryProps = {
  extractionId: string;
  /** Content to diff a selected version against (draft or current) */
  currentContent: string;
};

/** D4: immutable version list. D5: toggle a line diff of a version vs current. */
export function ExtractionVersionHistory({
  extractionId,
  currentContent,
}: ExtractionVersionHistoryProps) {
  const { data, isLoading } = useExtractionVersions(extractionId);
  const [diffVersionId, setDiffVersionId] = useState<string | null>(null);
  const versions = data?.versions ?? [];
  const diffVersion = versions.find((v) => v.id === diffVersionId) ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Loading versions…
      </div>
    );
  }
  if (versions.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No versions recorded.</p>
    );

  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {versions.map((version) => (
          <li
            key={version.id}
            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
          >
            <span className="font-mono text-xs text-muted-foreground">
              v{version.version}
            </span>
            <Badge
              variant={version.source === "ai" ? "secondary" : "default"}
              className="text-xs"
            >
              {version.source === "ai" ? "AI" : "User"}
            </Badge>
            <span className="truncate text-xs text-muted-foreground">
              {formatDate(version.createdAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "ml-auto h-7 gap-1 px-2 text-xs",
                diffVersionId === version.id && "bg-muted",
              )}
              onClick={() =>
                setDiffVersionId((current) =>
                  current === version.id ? null : version.id,
                )
              }
            >
              {diffVersionId === version.id ? (
                <>
                  <X className="size-3" />
                  Close diff
                </>
              ) : (
                <>
                  <GitCompare className="size-3" />
                  Diff vs current
                </>
              )}
            </Button>
          </li>
        ))}
      </ul>
      {diffVersion && (
        <VersionDiff
          before={diffVersion.content}
          after={currentContent}
          label={`v${diffVersion.version} (${diffVersion.source}) vs current`}
        />
      )}
    </div>
  );
}

function VersionDiff({
  before,
  after,
  label,
}: {
  before: string;
  after: string;
  label: string;
}) {
  const lines = diffLines(before, after);
  const changes = lines.filter((l) => l.type !== "same").length;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        {label} — {changes} changed line{changes === 1 ? "" : "s"}
      </p>
      <pre className="scrollbar-elegant max-h-64 overflow-auto rounded-md border bg-muted/40 p-2 font-mono text-xs leading-5">
        {lines.map((line, index) => (
          <div
            key={index}
            className={cn(
              "whitespace-pre-wrap",
              line.type === "add" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
              line.type === "del" && "bg-red-500/10 text-red-700 dark:text-red-400",
            )}
          >
            <span className="select-none text-muted-foreground">
              {line.type === "add" ? "+ " : line.type === "del" ? "- " : "  "}
            </span>
            {line.text || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
