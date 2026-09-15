"use client";

import { prettyJson } from "@/api/audit-logs/helpers";

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm break-words">{value}</span>
    </div>
  );
}

export function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap">
        {prettyJson(value)}
      </pre>
    </div>
  );
}

export function TextBlock({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
        {value ?? "—"}
      </pre>
    </div>
  );
}
