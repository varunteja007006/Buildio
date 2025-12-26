import React from "react";

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
import { Button } from "@workspace/ui/components/button";

import { useDeleteIncomeSource } from "@/hooks";
import { DeleteBtn } from "@/components/atoms/delete-btn";

export function IncomeSourceDeleteDialog({ sourceId }: { sourceId: string }) {
  const deleteMutation = useDeleteIncomeSource();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DeleteBtn />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            income source from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              onClick={() => deleteMutation.mutate({ sourceId })}
              disabled={deleteMutation.isPending}
              variant="destructive"
            >
              Confirm
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
