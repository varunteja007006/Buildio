"use client";

import { DatabaseZap } from "lucide-react";

import { useIngestDocuments } from "@/api/ingest/query";
import { ActionButton } from "@/components/documents/action-button";

/**
 * Per-document "Ingest" action (E3): chunks + embeds the document's latest
 * approved extraction content (or the raw file) into chat retrieval.
 */
export function DocumentIngestButton({ documentId }: { documentId: string }) {
  const ingest = useIngestDocuments();

  return (
    <ActionButton
      label="Ingest document"
      icon={DatabaseZap}
      onClick={() => ingest.mutate({ documentIds: [documentId] })}
      disabled={ingest.isPending}
    />
  );
}
