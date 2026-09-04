"use client";

import { ChartConfig } from "@workspace/ui/components/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export const chartTheme = {
  debit: { label: "Outflow", color: "var(--chart-1)" },
  credit: { label: "Inflow", color: "var(--chart-2)" },
  committed: { label: "Committed", color: "var(--chart-3)" },
  discretionary: { label: "Discretionary", color: "var(--chart-4)" },
  income: { label: "Income", color: "var(--chart-2)" },
  expense: { label: "Expense", color: "var(--chart-1)" },
} as ChartConfig;

export function formatCompactCurrency(
  amount: number | null | undefined,
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount))
    return "0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export const currencyTooltip = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value);
  return formatCurrency(Number.isNaN(num) ? 0 : num);
};

export function CardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Empty>
      <EmptyContent>
        <EmptyMedia variant="icon">
          <Icon className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}

export function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string | null;
  tone?: "default" | "positive" | "negative" | "warning";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3.5">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          tone === "positive" && "bg-emerald-500/10 text-emerald-600",
          tone === "negative" && "bg-red-500/10 text-red-600",
          tone === "warning" && "bg-amber-500/10 text-amber-600",
          tone === "default" && "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
        {sub && <p className="text-muted-foreground truncate text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export function runwayTone(runwayMonths: number | null) {
  if (runwayMonths === null) return "text-muted-foreground";
  if (runwayMonths < 3) return "text-destructive";
  if (runwayMonths < 6) return "text-amber-600";
  return "text-emerald-600";
}
