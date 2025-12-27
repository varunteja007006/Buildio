import { EventFormComponent } from "@/components/organisms/event/event-form-component";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Link href={`/events/${id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
        <p className="text-muted-foreground mb-6">
          Update event details and manage linked expenses
        </p>
      </div>

      <EventFormComponent mode="edit" eventId={id} />
    </div>
  );
}
