"use client";

import * as React from "react";

import { Button } from "@workspace/ui/components/button";
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

import { useRouter } from "next/navigation";
import { AuditDateBlock } from "@/components/atoms/audit-date-block";
import { useDeleteIncomeSource, useIncomeSourceDetails } from "@/hooks";
import { Eye, Loader2 } from "lucide-react";

interface IncomeSourceDetailsComponentProps {
  sourceId: string;
}

export function IncomeSourceDetailsComponent({
  sourceId,
}: IncomeSourceDetailsComponentProps) {
  const router = useRouter();

  const { data: source, isLoading } = useIncomeSourceDetails(sourceId);

  const deleteMutation = useDeleteIncomeSource({
    onSuccess: () => {
      router.push("/income-sources");
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this income source? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate({ sourceId });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      );
    }

    if (!source) {
      return <p className="text-muted-foreground">Income source not found.</p>;
    }

    return (
      <div className="space-y-6">
        {/* Source Information */}
        <div className="pb-6 border-b">
          <div className="grid gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Source Name</p>
              <p className="text-base font-medium">{source.name}</p>
            </div>

            {source.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-base">{source.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Income Records */}
        {source.incomes && source.incomes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Related Income ({source.incomes.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              This source is used by {source.incomes.length} income{" "}
              {source.incomes.length === 1 ? "record" : "records"}.
            </p>
          </div>
        )}

        <AuditDateBlock
          createdAt={source.createdAt}
          updatedAt={source.updatedAt}
          deletedAt={source.deletedAt}
        />

        <div className="mb-10"></div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger disabled={!source} asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Income Source</DialogTitle>
          <DialogDescription>Detailed view</DialogDescription>
        </DialogHeader>

        {renderContent()}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
