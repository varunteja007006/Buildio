import React from "react";

import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import { useGetUnLinkedExpenses, useLinkingExpenseToEvent } from "@/hooks";

export const EventExpenseLinkForm = ({ eventId }: { eventId: string }) => {
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = React.useState(false);

  const [selectedExpenses, setSelectedExpenses] = React.useState<string[]>([]);

  const { data: unlinkedExpenses } = useGetUnLinkedExpenses(eventId);

  const addExpenseMutation = useLinkingExpenseToEvent({
    onSuccess: () => {
      setSelectedExpenses([]);
      setAddExpenseDialogOpen(false);
    },
  });

  const handleAddExpenses = () => {
    selectedExpenses.forEach((expenseId) => {
      addExpenseMutation.mutate({ eventId, expenseId });
    });
  };

  const disabledBtns = addExpenseMutation.isPending;

  return (
    <Dialog open={addExpenseDialogOpen} onOpenChange={setAddExpenseDialogOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expenses
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Expenses to Event</DialogTitle>
          <DialogDescription>
            Select expenses to link to this event
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {!unlinkedExpenses || unlinkedExpenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No unlinked expenses available
            </p>
          ) : (
            unlinkedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center space-x-2 rounded-md border p-3"
              >
                <Checkbox
                  checked={selectedExpenses.includes(expense.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedExpenses([...selectedExpenses, expense.id]);
                    } else {
                      setSelectedExpenses(
                        selectedExpenses.filter((id) => id !== expense.id),
                      );
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {(expense as any).category?.name || "Uncategorized"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {expense.name}
                  </p>
                </div>
                <p className="font-semibold">
                  ${Number(expense.expenseAmount).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedExpenses([]);
              setAddExpenseDialogOpen(false);
            }}
            disabled={disabledBtns}
          >
            Cancel
          </Button>
          <Button onClick={handleAddExpenses} disabled={disabledBtns}>
            Add {selectedExpenses.length} Expense
            {selectedExpenses.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
