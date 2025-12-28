"use client";

import * as React from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import { Eye } from "lucide-react";

import { useIncomeDetails } from "@/hooks";

import { AuditDateBlock } from "@/components/atoms/audit-date-block";

interface IncomeDetailsProps {
  incomeId: string;
}

export function IncomeDetails({ incomeId }: IncomeDetailsProps) {
  const { data: income, isLoading, isError } = useIncomeDetails(incomeId);

  const renderContent = () => {
    if (isError) {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Error loading income details
            </div>
          </CardContent>
        </Card>
      );
    }

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

    return (
      <>
        <div>
          <p>{income.name || "Untitled Income"}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold text-green-600">
              ${Number(income.incomeAmount).toFixed(2)}
            </span>
          </div>
        </div>

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
          <AuditDateBlock
            createdAt={income.createdAt}
            updatedAt={income.updatedAt}
            deletedAt={income.deletedAt}
          />
        </div>
      </>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Income Details</DialogTitle>
          <DialogDescription>
            View detailed information about this income record.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
