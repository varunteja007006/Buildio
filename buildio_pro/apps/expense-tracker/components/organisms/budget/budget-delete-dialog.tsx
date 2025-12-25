"use client";

import * as React from "react";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

interface BudgetDeleteDialogProps {
  budgetId: string;
  budgetName: string;
  onSuccess?: () => void;
}

export function BudgetDeleteDialog({
  budgetId,
  budgetName,
  onSuccess,
}: BudgetDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();

  const deleteMutation = useMutation(
    trpc.budget.deleteBudget.mutationOptions({
      onSuccess: () => {
        toast.success("Budget deleted successfully");
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete budget");
      },
    }),
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{budgetName}</strong>?
            <br />
            <br />
            This action cannot be undone. Note: You cannot delete a budget that
            has linked expenses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteMutation.mutate({ budgetId });
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
