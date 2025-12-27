import { EventDetailsComponent } from "@/components/organisms/event/event-details-component";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

      <EventDetailsComponent eventId={id} />
    </div>
  );
}
