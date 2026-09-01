"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Progress } from "@workspace/ui/components/progress";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  CircleDollarSign,
  Clock,
  CreditCard,
  Landmark,
  PiggyBank,
  Receipt,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  useCardIntelligence,
  useCashFlow,
  useCommitments,
  useEmiSummary,
  useIncomeSavings,
  useLeakage,
} from "@/hooks";

const chartTheme = {
  debit: { label: "Outflow", color: "var(--chart-1)" },
  credit: { label: "Inflow", color: "var(--chart-2)" },
  committed: { label: "Committed", color: "var(--chart-3)" },
  discretionary: { label: "Discretionary", color: "var(--chart-4)" },
  income: { label: "Income", color: "var(--chart-2)" },
  expense: { label: "Expense", color: "var(--chart-1)" },
} as ChartConfig;

function formatCompactCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount))
    return "0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

const currencyTooltip = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value);
  return formatCurrency(Number.isNaN(num) ? 0 : num);
};

function CardSkeleton() {
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

function EmptyState({
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

function Stat({
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

function runwayTone(runwayMonths: number | null) {
  if (runwayMonths === null) return "text-muted-foreground";
  if (runwayMonths < 3) return "text-destructive";
  if (runwayMonths < 6) return "text-amber-600";
  return "text-emerald-600";
}

function CashFlowCard() {
  const { data, isLoading } = useCashFlow();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-4" /> Cash flow per account
        </CardTitle>
        <CardDescription>
          Monthly inflow/outflow, runway and deficit months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No account data yet"
            description="Upload and extract a bank statement to see cash flow, runway and deficit months."
          />
        ) : (
          <div className="space-y-6">
            {data.map((account) => (
              <div
                key={account.bankAccountId}
                className="space-y-4 rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {account.accountName ?? "Account"}
                  </p>
                  {account.runwayMonths !== null && (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        runwayTone(account.runwayMonths),
                      )}
                    >
                      {account.runwayMonths.toFixed(1)} mo runway
                    </span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat
                    icon={Wallet}
                    label="Current balance"
                    value={
                      account.currentBalance !== null
                        ? formatCurrency(account.currentBalance)
                        : "-"
                    }
                  />
                  <Stat
                    icon={ArrowDownCircle}
                    label="Avg monthly burn"
                    value={formatCurrency(account.avgMonthlyBurn)}
                    tone="negative"
                  />
                  <Stat
                    icon={Clock}
                    label="Runway"
                    value={
                      account.runwayMonths !== null
                        ? `${account.runwayMonths.toFixed(1)} mo`
                        : "-"
                    }
                    tone={
                      account.runwayMonths !== null && account.runwayMonths < 3
                        ? "warning"
                        : "default"
                    }
                  />
                  <Stat
                    icon={ShieldAlert}
                    label="Deficit months"
                    value={String(account.deficitMonths)}
                    tone={account.deficitMonths > 0 ? "negative" : "default"}
                  />
                </div>

                <ChartContainer config={chartTheme} className="h-48 w-full">
                  <BarChart data={account.months} margin={{ top: 4 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={formatCompactCurrency}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent formatter={currencyTooltip} />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="debit" fill="var(--color-debit)" radius={4} />
                    <Bar
                      dataKey="credit"
                      fill="var(--color-credit)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmiSummaryCard() {
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

function CardIntelligenceCard() {
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
                    <p className="font-medium">{card.accountName ?? "Card"}</p>
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

function SavingsRateCard() {
  const { data, isLoading } = useIncomeSavings();
  const monthly = data?.monthly ?? [];
  const latest = monthly[monthly.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4" /> Income & savings rate
        </CardTitle>
        <CardDescription>Monthly income vs expense</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : monthly.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No income or expense data yet"
            description="Extract statements and record income to see your monthly savings rate."
          />
        ) : (
          <div className="space-y-4">
            {latest && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                  icon={ArrowUpCircle}
                  label={`Income (${latest.month})`}
                  value={formatCurrency(latest.income)}
                  tone="positive"
                />
                <Stat
                  icon={ArrowDownCircle}
                  label={`Expenses (${latest.month})`}
                  value={formatCurrency(latest.expense)}
                  tone="negative"
                />
                <Stat
                  icon={PiggyBank}
                  label="Savings rate"
                  value={`${(latest.savingsRate * 100).toFixed(0)}%`}
                  tone={latest.savingsRate >= 0 ? "positive" : "negative"}
                />
              </div>
            )}
            <ChartContainer config={chartTheme} className="h-48 w-full">
              <BarChart data={monthly} margin={{ top: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={formatCompactCurrency}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={currencyTooltip} />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommitmentsCard() {
  const { data, isLoading } = useCommitments();
  const latest = data?.[data.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed vs discretionary</CardTitle>
        <CardDescription>
          Committed outflow (EMIs, recurring, insurance)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No spend data yet"
            description="Extract statements to break down spending into committed and discretionary."
          />
        ) : (
          <div className="space-y-4">
            {latest && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                  icon={PiggyBank}
                  label={`Committed (${latest.month})`}
                  value={formatCurrency(latest.committed)}
                />
                <Stat
                  icon={Wallet}
                  label={`Discretionary (${latest.month})`}
                  value={formatCurrency(latest.discretionary)}
                />
                <Stat
                  icon={TrendingDown}
                  label="Committed ratio"
                  value={`${(latest.committedRatio * 100).toFixed(0)}%`}
                  tone={latest.committedRatio > 0.5 ? "warning" : "default"}
                />
              </div>
            )}
            {data.length > 1 && (
              <ChartContainer config={chartTheme} className="h-40 w-full">
                <BarChart data={data} margin={{ top: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={formatCompactCurrency}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={currencyTooltip} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="committed"
                    stackId="a"
                    fill="var(--color-committed)"
                    radius={0}
                  />
                  <Bar
                    dataKey="discretionary"
                    stackId="a"
                    fill="var(--color-discretionary)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeakageCard() {
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

export function InsightsPage() {
  return (
    <div className="space-y-6">
      <CashFlowCard />
      <div className="grid gap-6 lg:grid-cols-2">
        <EmiSummaryCard />
        <CardIntelligenceCard />
        <SavingsRateCard />
        <CommitmentsCard />
      </div>
      <LeakageCard />
    </div>
  );
}
