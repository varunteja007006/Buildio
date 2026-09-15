import path from "node:path";

import type { FilePart, TextPart } from "ai";

/** File extensions extracted inline as plain text. */
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".mdx", ".csv"]);

export class UnsupportedFileError extends Error {
  constructor(extension: string) {
    super(
      `Unsupported file format: ${extension}. Supported: text/markdown/csv and PDF.`,
    );
    this.name = "UnsupportedFileError";
  }
}

export type DocumentFile = {
  bytes: Uint8Array;
  extension: string;
  /** True for PDFs, which are sent to the model as a multimodal file part. */
  isPdf: boolean;
};

/** Fetch the uploaded file bytes from its UploadThing CDN URL. */
export async function fetchDocumentFile(filepath: string): Promise<Uint8Array> {
  if (!filepath.startsWith("https://")) {
    throw new Error("Document has no downloadable file URL");
  }
  const response = await fetch(filepath);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: HTTP ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

/** Load a document's file and classify it for extraction. */
export async function loadDocumentFile(
  filename: string,
  filepath: string,
): Promise<DocumentFile> {
  const extension = path.extname(filename).toLowerCase();
  const bytes = await fetchDocumentFile(filepath);
  const isPdf = extension === ".pdf";
  if (!isPdf && !TEXT_EXTENSIONS.has(extension)) {
    throw new UnsupportedFileError(extension);
  }
  return { bytes, extension, isPdf };
}

/**
 * Build the document content parts for a model message: PDFs become a
 * multimodal file part; text files are inlined with a filename header.
 */
export function buildDocumentParts(file: DocumentFile): (TextPart | FilePart)[] {
  if (file.isPdf) {
    return [
      {
        type: "file",
        data: file.bytes,
        mediaType: "application/pdf",
      },
    ];
  }
  const text = new TextDecoder().decode(file.bytes);
  return [{ type: "text", text }];
}
