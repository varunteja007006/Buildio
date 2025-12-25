import { EventFormComponent } from "@/components/organisms/event/event-form-component";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export default function CreateEventPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Link href="/events">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-muted-foreground mb-6">
          Create a new event to track related expenses across multiple months
          and budgets
        </p>
      </div>

      <EventFormComponent mode="create"/>
    </div>
  );
}
