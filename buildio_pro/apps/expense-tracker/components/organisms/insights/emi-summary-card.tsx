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
import {
  CircleDollarSign,
  PiggyBank,
  Receipt,
  TrendingDown,
} from "lucide-react";

import { useEmiSummary } from "@/hooks";

import {
  CardSkeleton,
  EmptyState,
  Stat,
} from "./shared";

export function EmiSummaryCard() {
  const { data, isLoading } = useEmiSummary();

  const grandMonthly =
    data?.reduce((sum, a) => sum + a.totalMonthlyInstallment, 0) ?? 0;
  const grandOutstanding =
    data?.reduce((sum, a) => sum + a.totalOutstanding, 0) ?? 0;
  const grandPending =
    data?.reduce((sum, a) => sum + a.totalPendingInstallments, 0) ?? 0;
  const emiCount = data?.reduce((sum, a) => sum + a.emis.length, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="size-4" /> EMIs
        </CardTitle>
        <CardDescription>
          {emiCount > 0
            ? `${emiCount} active ${emiCount === 1 ? "loan" : "loans"} across ${data?.length ?? 0} ${data?.length === 1 ? "account" : "accounts"}`
            : "Loan obligations across accounts"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No EMIs detected"
            description="EMIs recognized in your statements will show up here with remaining installments and outstanding amounts."
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                icon={CircleDollarSign}
                label="Monthly obligation"
                value={formatCurrency(grandMonthly)}
              />
              <Stat
                icon={TrendingDown}
                label="Total outstanding"
                value={formatCurrency(grandOutstanding)}
                sub={`${grandPending} installments pending`}
                tone="warning"
              />
            </div>
            {data.map((account) => (
              <div
                key={account.bankAccountId}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {account.accountName ?? "Account"}
                  </p>
                  <span className="text-muted-foreground text-xs">
                    {formatCurrency(account.totalMonthlyInstallment)}/mo
                  </span>
                </div>
                <div className="space-y-3">
                  {account.emis.map((emi) => {
                    const total = emi.totalInstallments;
                    const paid =
                      emi.installmentNumber !== null
                        ? emi.installmentNumber
                        : null;
                    const progress =
                      total && total > 0 && paid !== null
                        ? Math.min(100, Math.round((paid / total) * 100))
                        : 0;
                    return (
                      <div key={emi.merchant} className="space-y-1.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                          <span className="font-medium text-foreground">
                            {emi.merchant}
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(emi.monthlyInstallment)}/mo ·{" "}
                            {paid !== null
                              ? `${paid}/${total ?? "?"}`
                              : `${total ?? "?"} total`}
                            {emi.pendingInstallments > 0 && (
                              <>
                                {" · "}
                                <span className="text-foreground">
                                  {formatCurrency(
                                    emi.monthlyInstallment *
                                      emi.pendingInstallments,
                                  )}
                                </span>{" "}
                                left
                              </>
                            )}
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-1.5"
                          aria-label={`${progress}% of EMIs paid for ${emi.merchant}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
