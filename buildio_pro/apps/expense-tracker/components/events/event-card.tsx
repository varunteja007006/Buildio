import React from "react";
import Link from "next/link";
import { format, differenceInDays, isPast } from "date-fns";
import { Calendar, Clock, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";

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
  onDelete: (id: string) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const progress =
    event.estimatedBudget > 0
      ? (event.totalSpent / event.estimatedBudget) * 100
      : 0;

  const daysLeft = event.endDate
    ? differenceInDays(new Date(event.endDate), new Date())
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">
              <Link href={`/events/${event.id}`} className="hover:underline">
                {event.name}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2 h-10">
              {event.description || "No description provided."}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <div className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress 
                value={Math.min(progress, 100)} 
                className={cn("h-2", progress > 100 ? "bg-destructive/20 [&>div]:bg-destructive" : "")}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Spent: <span className="font-medium text-foreground">{formatCurrency(event.totalSpent)}</span>
              </span>
              <span className="text-muted-foreground">
                Budget: <span className="font-medium text-foreground">{formatCurrency(event.estimatedBudget)}</span>
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
                {event.endDate && ` - ${format(new Date(event.endDate), "MMM d")}`}
              </span>
            </div>
            {event.status && (
              <Badge variant="secondary" className="text-xs font-normal">
                {event.status.label}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t bg-muted/20 p-4 mt-auto">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {daysLeft !== null ? (
                    <span className={cn("font-medium", isOverdue ? "text-destructive" : "")}>
                        {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </span>
                ) : (
                    <span className="text-muted-foreground">No deadline</span>
                )}
            </div>
            <div className={cn("text-sm font-medium", event.remaining < 0 ? "text-destructive" : "text-green-600")}>
                {event.remaining < 0 ? "Over: " : "Left: "}
                {formatCurrency(Math.abs(event.remaining))}
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
