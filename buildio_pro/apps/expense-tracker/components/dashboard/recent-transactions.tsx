import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/category-icons";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  date: Date | string;
  description?: string;
  category?: { name: string };
  type: "income" | "expense";
  name: string;
  meta?: any;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  className?: string;
}

export function RecentTransactions({
  transactions,
  isLoading,
  className,
}: RecentTransactionsProps) {
  return (
    <Card className={cn("col-span-1", className)}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          You made {transactions.length} transactions this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent transactions found.
          </div>
        ) : (
          <div className="space-y-8">
            {transactions.map((transaction) => {
              const Icon = getCategoryIcon(transaction.category?.name || transaction.meta?.label);
              const colorClass = getCategoryColor(transaction.category?.name || transaction.meta?.label);
              const isIncome = transaction.type === "income";

              return (
                <div key={transaction.id} className="flex items-center">
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center mr-4", colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category?.name || transaction.meta?.label || "Uncategorized"}
                    </p>
                  </div>
                  <div className={cn("ml-auto font-medium", isIncome ? "text-green-600" : "text-red-600")}>
                    {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
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
