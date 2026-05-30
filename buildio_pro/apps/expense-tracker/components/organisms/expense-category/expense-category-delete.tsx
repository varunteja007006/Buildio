import React from "react";

import {
  AlertDialog,
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
import { useDeleteExpenseCategory } from "@/hooks";

export const ExpenseCategoryDelete = ({
  categoryId,
}: {
  categoryId: string;
}) => {
  const deleteMutation = useDeleteExpenseCategory();

  const handleDelete = () => {
    deleteMutation.mutate({ categoryId });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DeleteBtn iconOnly />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {
              "Are you sure you want to delete this expense category? This action cannot be undone."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            disabled={deleteMutation.isPending}
            variant={"destructive"}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
