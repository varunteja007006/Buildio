/** Chunk size for splitting content before embedding */
export const CHUNK_SIZE = 1000;

/** Overlap between consecutive chunks */
export const CHUNK_OVERLAP = 200;

/** Split text into overlapping chunks */
export function chunkContent(text: string, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + size;
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }

  return chunks;
}

/** Truncate content to a preview length */
export function truncateContent(content: string, maxLength = 200): string {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}…`;
}
