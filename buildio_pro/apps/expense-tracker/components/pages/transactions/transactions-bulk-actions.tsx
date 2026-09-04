"use client";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@workspace/ui/components/action-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Loader2, Trash2, X } from "lucide-react";
import * as React from "react";

import { useTransactionBulkDelete } from "@/hooks";

export function TransactionsBulkActions({
  selectedIds,
  onSelectionChange,
}: {
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}) {
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const bulkDelete = useTransactionBulkDelete({
    onSuccess: () => {
      setBulkDeleteOpen(false);
      onSelectionChange(new Set());
    },
  });

  return (
    <>
      <ActionBar
        open={selectedIds.size > 0}
        onOpenChange={(open) => {
          if (!open) onSelectionChange(new Set());
        }}
      >
        <ActionBarSelection>{selectedIds.size} selected</ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem
            variant="destructive"
            disabled={bulkDelete.isPending}
            onClick={() => setBulkDeleteOpen(true)}
          >
            {bulkDelete.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete selected
          </ActionBarItem>
        </ActionBarGroup>
        <ActionBarClose>
          <X className="size-3.5" />
        </ActionBarClose>
      </ActionBar>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transactions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} transaction
              {selectedIds.size === 1 ? "" : "s"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDelete.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkDelete.isPending}
              onClick={() => {
                bulkDelete.mutate({ transactionIds: Array.from(selectedIds) });
              }}
            >
              {bulkDelete.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
