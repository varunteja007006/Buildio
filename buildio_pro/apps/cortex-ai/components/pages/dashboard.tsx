"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Bot,
  Coins,
  FileText,
  Flag,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

import {
  formatDateTime,
  formatNumber,
  truncate,
} from "@/api/audit-logs/helpers";
import { useDashboard } from "@/api/dashboard/query";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { RiskBadge } from "@/components/audit-logs/risk-badge";

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardDescription>{label}</CardDescription>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const stats = data?.stats;
  const recentLogs = data?.recentLogs ?? [];

  return (
    <>
      <AppBreadcrumb segments={[{ label: "Dashboard" }]} />

      <div className="flex w-full flex-1 flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Conversations"
            value={formatNumber(stats?.threads ?? 0)}
            icon={<MessageSquare className="size-4" />}
            loading={isLoading}
          />
          <StatCard
            label="Messages"
            value={formatNumber(stats?.messages ?? 0)}
            icon={<Bot className="size-4" />}
            loading={isLoading}
          />
          <StatCard
            label="Documents"
            value={formatNumber(stats?.documents ?? 0)}
            icon={<FileText className="size-4" />}
            loading={isLoading}
          />
          <StatCard
            label="Tokens used"
            value={formatNumber(stats?.totalTokens ?? 0)}
            icon={<Coins className="size-4" />}
            loading={isLoading}
          />
          <StatCard
            label="Flagged queries"
            value={formatNumber(stats?.flaggedQueries ?? 0)}
            icon={<Flag className="size-4" />}
            loading={isLoading}
          />
          <StatCard
            label="Blocked queries"
            value={formatNumber(stats?.blockedQueries ?? 0)}
            icon={<ShieldAlert className="size-4" />}
            loading={isLoading}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              The latest chat turns in this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No chat activity yet.{" "}
                <Link
                  href="/dashboard/chat"
                  className="underline underline-offset-4"
                >
                  Start a conversation
                </Link>
                .
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {recentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span
                        className="truncate text-sm"
                        title={log.userQuery ?? ""}
                      >
                        {truncate(log.userQuery, 80)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)} · {log.model ?? "—"}
                      </span>
                    </div>
                    <RiskBadge
                      severity={log.guardrailSeverity}
                      flagged={log.guardrailFlagged}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
