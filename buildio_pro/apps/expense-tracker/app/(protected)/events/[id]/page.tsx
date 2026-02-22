import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { EventDetails } from "@/components/organisms/event";

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8">
      <Link href="/events">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      <EventDetails eventId={id} />
    </div>
  );
}
