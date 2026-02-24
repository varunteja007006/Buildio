"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, Loader, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Progress } from "@workspace/ui/components/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import { useGetEventById } from "@/hooks";
import { useTRPC } from "@/lib/trpc-client";

import { EventExpenseLinkForm, EventSpendingHistoryChart } from ".";

interface EventDetailsProps {
  eventId: string;
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: event } = useGetEventById(eventId);

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

  if (!event) {
    return <Loader className="size-5 animate-spin" />;
  }

  const progress =
    event.estimatedBudget > 0
      ? (event.totalSpent / event.estimatedBudget) * 100
      : 0;

  const badgeVariant = "outline";
  const badgeLabel = event.status?.label || "Status";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full min-w-6xl">
        <DialogTitle>{event.name}</DialogTitle>
        <DialogDescription>
          {event.description ?? "No description"}
        </DialogDescription>

        <Tabs defaultValue="details" className="w-full">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="details">Account</TabsTrigger>
              <TabsTrigger value="graph">Graph</TabsTrigger>
            </TabsList>

            <EventExpenseLinkForm eventId={eventId} />
          </div>

          <TabsContent className="min-h-[400px] p-2" value="details">
            <div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">
                      {event.totalSpent.toFixed(2)}
                    </p>
                  </div>

                  {event.estimatedBudget > 0 && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Estimated Budget
                        </p>
                        <p className="text-2xl font-bold">
                          {event.estimatedBudget.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Remaining
                        </p>
                        <p
                          className={`text-2xl font-bold ${event.remaining < 0 ? "text-destructive" : "text-green-600"}`}
                        >
                          {event.remaining.toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {event.estimatedBudget > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {progress.toFixed(1)}%
                      </span>
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
                    <span>
                      {format(new Date(event.endDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                </div>
              </div>

              <div className="mt-3">
                <h2 className="text-lg font-semibold mb-1">Linked Expenses</h2>
                {!event.expenses ||
                (Array.isArray(event.expenses) &&
                  (event.expenses as any[]).length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="mb-2 text-sm text-muted-foreground">
                      No expenses linked to this event yet
                    </p>
                    <EventExpenseLinkForm eventId={eventId} />
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
                        <div className="flex items-center gap-6">
                          <p className="font-semibold">
                            ${Number(ee.expense.expenseAmount).toFixed(2)}
                          </p>
                          <Button
                            variant="destructive"
                            size="icon-sm"
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
              </div>
            </div>
          </TabsContent>

          <TabsContent className="min-h-[400px]" value="graph">
            <EventSpendingHistoryChart eventId={eventId} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
