"use client";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarSelection,
  ActionBarSeparator,
  ActionBarItem,
} from "@workspace/ui/components/action-bar";
import { DatabaseZap, Sparkles, X } from "lucide-react";

type DocumentsBulkBarProps = {
  selectedCount: number;
  onClear: () => void;
  onExtract: () => void;
  onIngest: () => void;
  ingestPending?: boolean;
};

/**
 * Floating bulk action bar (shared `ActionBar`) shown while documents are
 * selected in the table or tree. Escape or the close button clears selection.
 */
export function DocumentsBulkBar({
  selectedCount,
  onClear,
  onExtract,
  onIngest,
  ingestPending,
}: DocumentsBulkBarProps) {
  return (
    <ActionBar
      open={selectedCount > 0}
      onOpenChange={(open) => {
        if (!open) onClear();
      }}
    >
      <ActionBarSelection>{selectedCount} selected</ActionBarSelection>
      <ActionBarSeparator />
      <ActionBarGroup>
        <ActionBarItem
          variant="default"
          // Keep the bar (and selection) open while the Extract dialog is up
          onSelect={(event) => event.preventDefault()}
          onClick={onExtract}
        >
          <Sparkles className="size-3.5" />
          Extract
        </ActionBarItem>
        <ActionBarItem
          variant="default"
          onSelect={(event) => event.preventDefault()}
          onClick={onIngest}
          disabled={ingestPending}
        >
          <DatabaseZap className="size-3.5" />
          Ingest
        </ActionBarItem>
      </ActionBarGroup>
      <ActionBarClose aria-label="Clear selection">
        <X className="size-3.5" />
      </ActionBarClose>
    </ActionBar>
  );
}
