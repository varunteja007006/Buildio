import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Spinner } from "@workspace/ui/components/spinner";

export function ErrorScreen() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Error loading the content</EmptyTitle>
        <EmptyDescription>
          There was an error while loading the content. Please try again later.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
