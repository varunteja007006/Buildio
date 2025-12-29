"use client";

import { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";

import { Loader2, CalendarDays } from "lucide-react";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";

import { EventCard } from ".";
import { EventForm } from "./event-form";
import { useEventsList } from "@/hooks";

export function EventList() {
  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: statusOptions } = useQuery(
    trpc.event.listStatuses.queryOptions(),
  );

  const { data: eventsData, isLoading } = useEventsList({
    limit: 10,
    page,
  });

  const events = eventsData?.data || [];
  const total = eventsData?.meta.totalItems || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <EventForm mode="create" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No events found</h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-sm">
              Events help you track expenses for specific occasions like trips,
              weddings, or renovation projects.
            </p>
            <EventForm mode="create" />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
