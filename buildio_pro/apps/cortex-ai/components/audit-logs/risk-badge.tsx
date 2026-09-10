import { Badge } from "@workspace/ui/components/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const SEVERITY_VARIANT: Record<string, BadgeVariant> = {
  none: "outline",
  low: "secondary",
  medium: "default",
  high: "destructive",
  critical: "destructive",
};

/** Renders the guardrail risk severity, or an em dash when unscored. */
export function RiskBadge({
  severity,
  flagged = false,
}: {
  severity: string | null;
  flagged?: boolean;
}) {
  if (!severity && !flagged) {
    return <span className="text-muted-foreground">—</span>;
  }

  const value = severity ?? "unknown";

  return (
    <Badge variant={SEVERITY_VARIANT[value] ?? "outline"}>{value}</Badge>
  );
}
