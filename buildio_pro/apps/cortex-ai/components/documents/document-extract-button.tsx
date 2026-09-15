"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { ActionButton } from "@/components/documents/action-button";
import { ExtractDocumentsDialog } from "@/components/documents/extract-dialog";

/**
 * Per-document "Extract" action: opens the same dialog as the bulk Extract
 * (template, model, auto-ingest toggle) scoped to this single document.
 */
export function DocumentExtractButton({
  documentId,
  filename,
}: {
  documentId: string;
  filename: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionButton
        label={`Extract from ${filename}`}
        icon={Sparkles}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExtractDocumentsDialog
          open={open}
          onOpenChange={setOpen}
          documentIds={[documentId]}
        />
      )}
    </>
  );
}
