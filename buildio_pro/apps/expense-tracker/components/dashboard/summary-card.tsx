import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: LucideIcon;
  description?: string;
  trend?: number; // Percentage change, e.g., 5.2 or -2.1
  trendLabel?: string; // e.g., "from last month"
  className?: string;
  loading?: boolean;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel = "from last month",
  className,
  loading,
}: SummaryCardProps) {
  return (
    <Card className={cn("overflow-hidden relative", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 animate-pulse bg-muted rounded" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {(trend !== undefined || description) && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {trend !== undefined && (
                  <span
                    className={cn(
                      "flex items-center font-medium mr-2",
                      trend > 0
                        ? "text-green-600"
                        : trend < 0
                          ? "text-red-600"
                          : "",
                    )}
                  >
                    {trend > 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(trend)}%
                  </span>
                )}
                <span className="opacity-80">{trendLabel || description}</span>
              </div>
            )}
          </>
        )}
        {/* Background Icon Decoration */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none">
          <Icon className="h-32 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
