const LIKELY_SENSITIVE_COLUMN =
  /password|secret|token|credential|api.?key|email|phone|mobile|address|birth|ssn|social.?security|card.?number|account.?number/i;

export function isLikelySensitiveColumn(name: string) {
  return LIKELY_SENSITIVE_COLUMN.test(name);
}

export function redactSampleValues(
  description: string,
  samples: { rows: Record<string, unknown>[] }[],
) {
  const values = (value: unknown): string[] => {
    if (value == null) return [];
    if (value instanceof Date) return [value.toISOString()];
    if (Array.isArray(value)) return value.flatMap(values);
    if (typeof value === "object") return Object.values(value).flatMap(values);
    return [String(value)];
  };
  let safeDescription = description;
  for (const { rows } of samples) {
    for (const row of rows) {
      for (const rendered of Object.values(row).flatMap(values)) {
        if (!rendered) continue;
        safeDescription = safeDescription.replaceAll(
          rendered,
          "[sample value omitted]",
        );
      }
    }
  }
  return safeDescription;
}
