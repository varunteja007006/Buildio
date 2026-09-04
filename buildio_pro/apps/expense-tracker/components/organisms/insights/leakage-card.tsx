"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  Receipt,
  ShieldAlert,
  TrendingDown,
  Wallet,
} from "lucide-react";

import { useLeakage } from "@/hooks";

import { CardSkeleton, EmptyState, Stat } from "./shared";

export function LeakageCard() {
  const { data, isLoading } = useLeakage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4" /> Leakage & hygiene
        </CardTitle>
        <CardDescription>
          Fees, interest, cash withdrawals and pending refunds
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : !data ||
          (data.leakage.total === 0 && data.pendingRefunds.length === 0) ? (
          <EmptyState
            icon={ShieldAlert}
            title="No leakage detected"
            description="No fees, interest or outstanding refunds found in your statements. Nice."
          />
        ) : (
          <div className="space-y-4">
            {data.leakage.total > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  icon={Receipt}
                  label="Fees"
                  value={formatCurrency(data.leakage.fee)}
                  tone="negative"
                />
                <Stat
                  icon={TrendingDown}
                  label="Interest paid"
                  value={formatCurrency(data.leakage.interest)}
                  tone="negative"
                />
                <Stat
                  icon={Wallet}
                  label="ATM withdrawals"
                  value={formatCurrency(data.leakage.cashWithdrawal)}
                  tone="warning"
                />
                <Stat
                  icon={CircleDollarSign}
                  label="Round-ups"
                  value={formatCurrency(data.leakage.roundUp)}
                  tone="warning"
                />
              </div>
            )}
            {data.leakage.total > 0 && (
              <div className="flex items-center justify-between gap-2 rounded-lg border p-4">
                <span className="text-muted-foreground text-sm">
                  Total leakage
                </span>
                <span className="text-destructive text-lg font-semibold">
                  {formatCurrency(data.leakage.total)}
                </span>
              </div>
            )}
            {data.pendingRefunds.length > 0 && (
              <div className="space-y-1.5 rounded-lg border p-4">
                <div className="flex items-center gap-2 pb-1">
                  <CalendarClock className="text-muted-foreground size-4" />
                  <p className="font-medium">Pending refunds</p>
                </div>
                {data.pendingRefunds.map((refund, index) => (
                  <div
                    key={index}
                    className="text-muted-foreground flex justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {refund.merchant ?? "Unknown"}
                    </span>
                    <span>{formatCurrency(refund.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
