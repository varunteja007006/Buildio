"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Zap } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
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

export function EventListComponent() {
  const router = useRouter();
  const trpc = useTRPC();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: statusOptions } = useQuery(
    trpc.event.listStatuses.queryOptions(),
  );

  const { data: eventsData } = useQuery(
    trpc.event.listEvents.queryOptions({
      limit: 10,
      offset: page * 10,
      statusId: statusFilter === "all" ? undefined : statusFilter,
    }),
  );

  const deleteEventMutation = useMutation(
    trpc.event.deleteEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted successfully");
        router.refresh();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete event");
      },
    }),
  );

  const events = eventsData?.data || [];
  const total = eventsData?.meta.totalItems || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Track expenses across multiple months or budgets
          </p>
        </div>
        <Link href="/events/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions?.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No events found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first event to start tracking expenses
            </p>
            <Link href="/events/create">
              <Button>Create Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => {
              const progress =
                event.estimatedBudget > 0
                  ? (event.totalSpent / event.estimatedBudget) * 100
                  : 0;

              return (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/events/${event.id}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {event.name}
                        </Link>
                        {event.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {event.status?.label || "No Status"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent:</span>
                        <span className="font-medium">
                          ${event.totalSpent.toFixed(2)}
                        </span>
                      </div>
                      {event.estimatedBudget > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Budget:
                            </span>
                            <span className="font-medium">
                              ${event.estimatedBudget.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Remaining:
                            </span>
                            <span
                              className={`font-medium ${event.remaining < 0 ? "text-destructive" : "text-green-600"}`}
                            >
                              ${event.remaining.toFixed(2)}
                            </span>
                          </div>
                          <Progress value={Math.min(progress, 100)} />
                        </>
                      )}
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {event.startDate
                          ? format(new Date(event.startDate), "MMM dd, yyyy")
                          : "No start date"}
                      </span>
                      {event.endDate && (
                        <span>
                          to {format(new Date(event.endDate), "MMM dd, yyyy")}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this event? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteEventMutation.mutate({
                                  eventId: event.id,
                                })
                              }
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
