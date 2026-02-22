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

import { DeleteBtn } from "@/components/atoms/delete-btn";
import { useDeleteIncome } from "@/hooks";

export const IncomeDeleteDialog = ({ incomeId }: { incomeId: string }) => {
  const deleteMutation = useDeleteIncome();

  const handleDelete = () => deleteMutation.mutate({ incomeId });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DeleteBtn iconOnly />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Income Record</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            income record from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={"destructive"} onClick={handleDelete}>
              Confirm
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
