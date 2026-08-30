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
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { AlertTriangle, CreditCard, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
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

const chartColors = {
  debit: "var(--chart-1)",
  credit: "var(--chart-2)",
  committed: "var(--chart-3)",
  discretionary: "var(--chart-4)",
  income: "var(--chart-2)",
  expense: "var(--chart-1)",
};

const ChartTheme = chartColors as ChartConfig;

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="bg-muted flex size-9 items-center justify-center rounded-md">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
        {sub && <p className="text-muted-foreground truncate text-xs">{sub}</p>}
      </div>
    </div>
  );
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
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No account data yet — extract a statement first.
          </p>
        )}
        {data?.map((account) => (
          <div key={account.bankAccountId} className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{account.accountName ?? "Account"}</p>
              <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                <span>
                  Balance:{" "}
                  <span className="text-foreground font-medium">
                    {account.currentBalance !== null
                      ? formatCurrency(account.currentBalance)
                      : "-"}
                  </span>
                </span>
                <span>
                  Avg burn:{" "}
                  <span className="text-foreground font-medium">
                    {formatCurrency(account.avgMonthlyBurn)}
                  </span>
                </span>
                <span>
                  Runway:{" "}
                  <span className="text-foreground font-medium">
                    {account.runwayMonths !== null
                      ? `${account.runwayMonths.toFixed(1)} mo`
                      : "-"}
                  </span>
                </span>
                <span>
                  Deficit months:{" "}
                  <span className="text-foreground font-medium">
                    {account.deficitMonths}
                  </span>
                </span>
              </div>
            </div>
            <ChartContainer config={ChartTheme} className="h-48 w-full">
              <BarChart data={account.months}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="debit" fill={chartColors.debit} radius={4} name="Outflow" />
                <Bar dataKey="credit" fill={chartColors.credit} radius={4} name="Inflow" />
              </BarChart>
            </ChartContainer>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmiSummaryCard() {
  const { data, isLoading } = useEmiSummary();

  const grandMonthly = data?.reduce((sum, a) => sum + a.totalMonthlyInstallment, 0) ?? 0;
  const grandOutstanding = data?.reduce((sum, a) => sum + a.totalOutstanding, 0) ?? 0;
  const grandPending = data?.reduce((sum, a) => sum + a.totalPendingInstallments, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="size-4" /> EMIs
        </CardTitle>
        <CardDescription>Loan obligations across accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No EMIs detected yet.</p>
        )}
        {data && data.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat
                icon={PiggyBank}
                label="Monthly obligation"
                value={formatCurrency(grandMonthly)}
              />
              <Stat
                icon={TrendingDown}
                label="Outstanding"
                value={formatCurrency(grandOutstanding)}
                sub={`${grandPending} installments pending`}
              />
            </div>
            {data.map((account) => (
              <div key={account.bankAccountId} className="space-y-2 rounded-lg border p-4">
                <p className="font-medium">{account.accountName ?? "Account"}</p>
                {account.emis.map((emi) => (
                  <div
                    key={emi.merchant}
                    className="text-muted-foreground flex flex-wrap justify-between gap-2 text-sm"
                  >
                    <span className="text-foreground">{emi.merchant}</span>
                    <span>
                      {formatCurrency(emi.monthlyInstallment)}/mo ·{" "}
                      {emi.installmentNumber ?? "?"}/{emi.totalInstallments ?? "?"} ·{" "}
                      {emi.pendingInstallments} left ·{" "}
                      {formatCurrency(emi.monthlyInstallment * emi.pendingInstallments)}{" "}
                      outstanding
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CardIntelligenceCard() {
  const { data, isLoading } = useCardIntelligence();

  const withUtilization = data?.filter((c) => c.creditLimit) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4" /> Credit cards
        </CardTitle>
        <CardDescription>Utilization, dues and rewards from latest statements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No credit card statements yet.</p>
        )}
        {withUtilization.map((card) => {
          const utilizationPct = card.utilization !== null ? card.utilization * 100 : null;
          const high = utilizationPct !== null && utilizationPct > 30;
          return (
            <div key={card.bankAccountId} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{card.accountName ?? "Card"}</p>
                {utilizationPct !== null && (
                  <span
                    className={`text-sm font-medium ${high ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {utilizationPct.toFixed(0)}% utilization
                  </span>
                )}
              </div>
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span>
                  Limit:{" "}
                  <span className="text-foreground">
                    {card.creditLimit ? formatCurrency(card.creditLimit) : "-"}
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
                    {card.totalAmountDue !== null ? formatCurrency(card.totalAmountDue) : "-"}
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
                  Due date: <span className="text-foreground">{card.paymentDueDate ?? "-"}</span>
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
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {latest && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              icon={TrendingUp}
              label={`Income (${latest.month})`}
              value={formatCurrency(latest.income)}
            />
            <Stat
              icon={TrendingDown}
              label={`Expenses (${latest.month})`}
              value={formatCurrency(latest.expense)}
              sub={`Savings rate: ${(latest.savingsRate * 100).toFixed(0)}%`}
            />
          </div>
        )}
        {monthly.length > 0 && (
          <ChartContainer config={ChartTheme} className="h-48 w-full">
            <BarChart data={monthly}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="income" fill={chartColors.income} radius={4} name="Income" />
              <Bar dataKey="expense" fill={chartColors.expense} radius={4} name="Expense" />
            </BarChart>
          </ChartContainer>
        )}
        {!isLoading && monthly.length === 0 && (
          <p className="text-sm text-muted-foreground">No income or expense data yet.</p>
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
        <CardDescription>Committed outflow (EMIs, recurring, insurance)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
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
            />
          </div>
        )}
        {data && data.length > 1 && (
          <ChartContainer config={ChartTheme} className="h-40 w-full">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="committed" stackId="a" fill={chartColors.committed} radius={0} />
              <Bar
                dataKey="discretionary"
                stackId="a"
                fill={chartColors.discretionary}
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
        {!isLoading && (!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">No spend data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function LeakageCard() {
  const { data, isLoading } = useLeakage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4" /> Leakage & hygiene
        </CardTitle>
        <CardDescription>Fees, interest, cash withdrawals and pending refunds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data && data.leakage.total === 0 && data.pendingRefunds.length === 0 && (
          <p className="text-sm text-muted-foreground">No leakage detected. Nice.</p>
        )}
        {data && data.leakage.total > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat icon={AlertTriangle} label="Fees" value={formatCurrency(data.leakage.fee)} />
            <Stat icon={AlertTriangle} label="Interest paid" value={formatCurrency(data.leakage.interest)} />
            <Stat
              icon={Wallet}
              label="ATM withdrawals"
              value={formatCurrency(data.leakage.cashWithdrawal)}
            />
            <Stat
              icon={TrendingDown}
              label="Total leakage"
              value={formatCurrency(data.leakage.total)}
            />
          </div>
        )}
        {data && data.pendingRefunds.length > 0 && (
          <div className="space-y-1 rounded-lg border p-4">
            <p className="font-medium">Pending refunds</p>
            {data.pendingRefunds.map((refund, index) => (
              <div
                key={index}
                className="text-muted-foreground flex justify-between text-sm"
              >
                <span className="text-foreground">{refund.merchant ?? "Unknown"}</span>
                <span>{formatCurrency(refund.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-muted-foreground text-sm">
          Per-account analytics built from your extracted statements
        </p>
      </div>
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
