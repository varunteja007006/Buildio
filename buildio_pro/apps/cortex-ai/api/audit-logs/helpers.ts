/** Format an ISO date string for display */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Format a possibly-null number, falling back to an em dash */
export function formatNumber(value: number | null): string {
  return value == null ? "—" : value.toLocaleString();
}

/** Format a millisecond duration */
export function formatMs(value: number | null): string {
  return value == null ? "—" : `${Math.round(value)} ms`;
}

/** Format a wall-clock duration: sub-second as ms, otherwise seconds */
export function formatDuration(value: number | null): string {
  if (value == null) return "—";
  if (value < 1000) return `${Math.round(value)}ms`;
  return `${(value / 1000).toFixed(1)}s`;
}

/** Format a token count compactly for table cells (12,340 → "12.3k") */
export function formatTokensCompact(value: number | null): string {
  if (value == null) return "—";
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1)}k`;
}

/** Truncate long text for table cells */
export function truncate(text: string | null, maxLength = 80): string {
  if (!text) return "—";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/** Pretty-print an unknown JSON value for display */
export function prettyJson(value: unknown): string {
  if (value == null) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
