export function parseFileSize(size: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };
  const match = size
    .trim()
    .toUpperCase()
    .match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/);
  if (!match) return 10 * 1024 * 1024; // default 10MB
  const value = parseFloat(match[1]);
  const unit = match[2];
  return Math.round(value * (units[unit] ?? units.MB));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val % 1 === 0 ? val : val.toFixed(1)} ${sizes[i]}`;
}

export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "" || accept.trim() === "*") return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const fileExt = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const mime = file.type.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) return fileExt === token;
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -2);
      return mime.startsWith(prefix + "/");
    }
    // exact mime or fallback to extension check
    if (mime === token) return true;
    // allow token like "application/pdf" to match extension .pdf
    if (token.includes("/")) return false;
    return false;
  });
}
