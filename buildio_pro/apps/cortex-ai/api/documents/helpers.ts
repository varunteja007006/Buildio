import type { Document } from "./types";

/** Truncate a file hash for display */
export function truncateHash(hash: string, maxLength = 16): string {
  return hash.length > maxLength ? `${hash.slice(0, maxLength)}…` : hash;
}

/** Format an ISO date string for display */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Status label for ingestion state */
export const INGESTION_STATUS = {
  INGESTED: "Ingested" as const,
  PENDING: "Pending" as const,
} as const;

/** Get a human-readable status label */
export function getIngestionLabel(ingested: boolean): string {
  return ingested ? INGESTION_STATUS.INGESTED : INGESTION_STATUS.PENDING;
}

/** Sort documents by creation date (newest first) */
export function sortByNewest(documents: Document[]): Document[] {
  return [...documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
