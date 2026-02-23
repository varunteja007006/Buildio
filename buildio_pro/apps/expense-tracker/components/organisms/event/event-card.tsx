import React from "react";

import Link from "next/link";

import { differenceInDays, format } from "date-fns";
import { Calendar, Clock, Eye } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";

import { EventDeleteDialog, EventDetails, EventForm } from ".";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description?: string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    status?: { label: string; id: string } | null;
    totalSpent: number;
    estimatedBudget: number;
    remaining: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  const progress =
    event.estimatedBudget > 0
      ? (event.totalSpent / event.estimatedBudget) * 100
      : 0;

  const daysLeft = event.endDate
    ? differenceInDays(new Date(event.endDate), new Date())
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <Card className="h-full transition-all hover:shadow-md pb-0">
      <CardHeader>
        <CardTitle className="line-clamp-1">{event.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {event.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress
              value={Math.min(progress, 100)}
              className={cn(
                "h-2",
                progress > 100
                  ? "bg-destructive/20 [&>div]:bg-destructive"
                  : "",
              )}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Spent:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(event.totalSpent)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Budget:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(event.estimatedBudget)}
                </span>
              </span>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {event.startDate
                  ? format(new Date(event.startDate), "MMM d")
                  : "TBD"}
                {event.endDate &&
                  ` - ${format(new Date(event.endDate), "MMM d")}`}
              </span>
            </div>
            {event.status && (
              <Badge variant="secondary" className="text-xs font-normal">
                {event.status.label}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {daysLeft !== null ? (
              <span
                className={cn(
                  "font-medium",
                  isOverdue ? "text-destructive" : "",
                )}
              >
                {isOverdue
                  ? `${Math.abs(daysLeft)} days overdue`
                  : `${daysLeft} days left`}
              </span>
            ) : (
              <span className="text-muted-foreground">No deadline</span>
            )}
          </div>
          <div
            className={cn(
              "text-sm font-medium",
              event.remaining < 0 ? "text-destructive" : "text-green-600",
            )}
          >
            {event.remaining < 0 ? "Over: " : "Left: "}
            {formatCurrency(Math.abs(event.remaining))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 p-4 mt-auto flex justify-end items-center gap-4">
        <EventDetails eventId={event.id} />

        <EventForm
          mode="edit"
          eventId={event.id}
          initialValues={{
            name: event.name,
            description: event.description ?? "",
            estimatedBudget: event.estimatedBudget.toString(),
            startDate: event.startDate ? new Date(event.startDate) : undefined,
            endDate: event.endDate ? new Date(event.endDate) : undefined,
            statusId: event.status?.id,
          }}
        />
        <EventDeleteDialog eventId={event.id} />
      </CardFooter>
    </Card>
  );
}
