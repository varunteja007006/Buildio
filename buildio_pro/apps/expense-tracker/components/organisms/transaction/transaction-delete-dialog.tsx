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

import { DeleteBtn } from "@/components/atoms/delete-btn";
import { useTransactionDelete } from "@/hooks";

export const TransactionDeleteDialog = ({
  transactionId,
  merchantName,
}: {
  transactionId: string;
  merchantName?: string | null;
}) => {
  const deleteTransaction = useTransactionDelete();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DeleteBtn
          iconOnly
          onClick={(e) => e.stopPropagation()}
        />
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            {merchantName ? <span className="font-medium">{merchantName}</span> : "this transaction"}
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              deleteTransaction.mutate({ transactionId });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
