import type { IngestResponse } from "./types";

export async function ingestDocuments(): Promise<IngestResponse> {
  const response = await fetch("/api/ingest", { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? `HTTP ${response.status}`);
  }
  return response.json();
}
