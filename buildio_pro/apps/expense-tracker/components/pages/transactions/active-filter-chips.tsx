"use client";

import { X } from "lucide-react";

import type { ActiveFilterChip } from "./use-transaction-filters";

export function ActiveFilterChips({
  chips,
  onClearAll,
}: {
  chips: ActiveFilterChip[];
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="group inline-flex max-w-64 items-center gap-1.5 rounded-full border bg-muted/50 py-0.5 pr-1.5 pl-2.5 text-xs font-medium transition-colors hover:border-destructive/40 hover:bg-destructive/10"
          title="Remove filter"
        >
          <span className="truncate">{chip.label}</span>
          <X className="size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-destructive" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
