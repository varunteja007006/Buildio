import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

import { EventList } from "@/components/organisms/event/event-list";

export const metadata: Metadata = {
  title: `Events | ${appConfig.name}`,
  description: "Plan and track budgets for events and special occasions.",
};

export default function EventsPage() {
  return <EventList />;
}
