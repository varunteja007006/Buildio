"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Plus, Trash2, X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
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
import { Checkbox } from "@workspace/ui/components/checkbox";

import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

interface EventDetailsComponentProps {
  eventId: string;
}

export function EventDetailsComponent({ eventId }: EventDetailsComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const { data: event } = useQuery(
    trpc.event.getEventById.queryOptions({ eventId }),
  );

  const { data: unlinkedExpenses } = useQuery(
    trpc.event.getUnlinkedExpenses.queryOptions({ eventId }),
  );

  const addExpenseMutation = useMutation(
    trpc.event.addExpenseToEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Expenses added successfully");
        setSelectedExpenses([]);
        setAddExpenseDialogOpen(false);
        router.refresh();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to add expenses");
      },
    }),
  );

  const removeExpenseMutation = useMutation(
    trpc.event.removeExpenseFromEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Expense removed successfully");
        router.refresh();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to remove expense");
      },
    }),
  );

  const deleteEventMutation = useMutation(
    trpc.event.deleteEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted successfully");
        router.push("/events");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete event");
      },
    }),
  );

  if (!event) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  const progress =
    event.estimatedBudget > 0
      ? (event.totalSpent / event.estimatedBudget) * 100
      : 0;

  const handleAddExpenses = () => {
    selectedExpenses.forEach((expenseId) => {
      addExpenseMutation.mutate({ eventId, expenseId });
    });
  };

  const badgeVariant = "outline";
  const badgeLabel = event.status?.label || "Status";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            {event.description && (
              <p className="mt-1 text-muted-foreground">{event.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          <Link href={`/events/${eventId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this event? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteEventMutation.mutate({ eventId })}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Budget Overview</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">
                ${event.totalSpent.toFixed(2)}
              </p>
            </div>
            {event.estimatedBudget > 0 && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Estimated Budget
                  </p>
                  <p className="text-2xl font-bold">
                    ${event.estimatedBudget.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p
                    className={`text-2xl font-bold ${event.remaining < 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    ${event.remaining.toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>

          {event.estimatedBudget > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(progress, 100)} />
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Date:</span>
            <span>
              {event.startDate
                ? format(new Date(event.startDate), "MMM dd, yyyy")
                : "Not set"}
            </span>
          </div>
          {event.endDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">End Date:</span>
              <span>{format(new Date(event.endDate), "MMM dd, yyyy")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Linked Expenses</h2>
            <Dialog
              open={addExpenseDialogOpen}
              onOpenChange={setAddExpenseDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
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
                              setSelectedExpenses([
                                ...selectedExpenses,
                                expense.id,
                              ]);
                            } else {
                              setSelectedExpenses(
                                selectedExpenses.filter(
                                  (id) => id !== expense.id,
                                ),
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
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddExpenses}
                    disabled={
                      selectedExpenses.length === 0 ||
                      addExpenseMutation.isPending
                    }
                  >
                    Add {selectedExpenses.length} Expense
                    {selectedExpenses.length !== 1 ? "s" : ""}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!event.expenses ||
          (Array.isArray(event.expenses) &&
            (event.expenses as any[]).length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="mb-2 text-sm text-muted-foreground">
                No expenses linked to this event yet
              </p>
              <Button
                variant="outline"
                onClick={() => setAddExpenseDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expenses
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {(event.expenses as any[]).map((ee) => (
                <div
                  key={ee.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {ee.expense.category?.name || "Uncategorized"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ee.expense.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      ${Number(ee.expense.expenseAmount).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeExpenseMutation.mutate({
                          eventId,
                          expenseId: ee.expense.id,
                        })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
