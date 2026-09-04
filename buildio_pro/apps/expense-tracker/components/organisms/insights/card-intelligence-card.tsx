"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";
import { CreditCard } from "lucide-react";

import { useCardIntelligence } from "@/hooks";

import { CardSkeleton, EmptyState } from "./shared";

export function CardIntelligenceCard() {
  const { data, isLoading } = useCardIntelligence();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4" /> Credit cards
        </CardTitle>
        <CardDescription>
          Utilization, dues and rewards from latest statements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No credit card statements yet"
            description="Upload a credit card statement to see utilization, dues and rewards."
          />
        ) : (
          <div className="space-y-3">
            {data.map((card) => {
              const utilizationPct =
                card.utilization !== null ? card.utilization * 100 : null;
              const high = utilizationPct !== null && utilizationPct > 30;
              return (
                <div
                  key={card.bankAccountId}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {card.accountName ?? "Card"}
                    </p>
                    <span className="text-muted-foreground text-xs">
                      {card.statementCount}{" "}
                      {card.statementCount === 1 ? "statement" : "statements"}
                    </span>
                  </div>

                  {utilizationPct !== null && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Utilization
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            high ? "text-destructive" : "text-emerald-600",
                          )}
                        >
                          {utilizationPct.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(utilizationPct, 100)}
                        className={cn("h-1.5", high && "bg-red-500/20")}
                        aria-label={`${utilizationPct.toFixed(0)}% credit utilization`}
                      />
                      {high && (
                        <p className="text-xs text-destructive">
                          Utilization above 30% — consider paying down this
                          card.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span>
                      Limit:{" "}
                      <span className="text-foreground">
                        {card.creditLimit
                          ? formatCurrency(card.creditLimit)
                          : "-"}
                      </span>
                    </span>
                    <span>
                      Available:{" "}
                      <span className="text-foreground">
                        {card.availableCredit !== null
                          ? formatCurrency(card.availableCredit)
                          : "-"}
                      </span>
                    </span>
                    <span>
                      Total due:{" "}
                      <span className="text-foreground">
                        {card.totalAmountDue !== null
                          ? formatCurrency(card.totalAmountDue)
                          : "-"}
                      </span>
                    </span>
                    <span>
                      Min due:{" "}
                      <span className="text-foreground">
                        {card.minimumAmountDue !== null
                          ? formatCurrency(card.minimumAmountDue)
                          : "-"}
                      </span>
                    </span>
                    <span>
                      Due date:{" "}
                      <span className="text-foreground">
                        {card.paymentDueDate ?? "-"}
                      </span>
                    </span>
                    {card.rewards?.earned != null && (
                      <span>
                        Rewards:{" "}
                        <span className="text-foreground">
                          {card.rewards.earned} {card.rewards.unit ?? ""}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
