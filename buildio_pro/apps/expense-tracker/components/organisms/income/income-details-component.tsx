"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, Calendar, DollarSign } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface IncomeDetailsComponentProps {
  incomeId: string;
}

export function IncomeDetailsComponent({
  incomeId,
}: IncomeDetailsComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: income, isLoading } = useQuery(
    trpc.income.getIncomeById.queryOptions({ incomeId }),
  ) as { data?: any; isLoading: boolean };

  const deleteMutation = useMutation(
    trpc.income.deleteIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income deleted successfully!");
        router.push("/income");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income");
      },
    }),
  );

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this income record? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate({ incomeId });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading income details...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!income) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Income not found
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = new Date(income.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const updatedDate = new Date(income.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">
              {income.name || "Untitled Income"}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                ${Number(income.incomeAmount).toFixed(2)}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Income Information */}
          <div className="pb-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Income Information</h3>
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Income Name</p>
                <p className="text-base font-medium">{income.name || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-base font-medium text-green-600">
                  ${Number(income.incomeAmount).toFixed(2)}
                </p>
              </div>

              {income.source && (
                <div>
                  <p className="text-sm text-muted-foreground">Income Source</p>
                  <p className="text-base">{income.source.name}</p>
                  {income.source.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {income.source.description}
                    </p>
                  )}
                </div>
              )}

              {income.paymentMethod && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="text-base">{income.paymentMethod.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="text-base">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-base">{updatedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer with Actions */}
      <div className="flex gap-2 px-6 py-4 border-t bg-muted/50">
        <Button variant="outline" onClick={() => router.push("/income")}>
          Back to Income
        </Button>
        <Button onClick={() => router.push(`/income/${incomeId}/edit`)}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Income
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
