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
