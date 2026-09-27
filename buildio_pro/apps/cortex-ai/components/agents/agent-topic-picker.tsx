"use client";

import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";

import { useTopics } from "@/api/topics/query";

type AgentTopicPickerProps = {
  selectedTopicIds: string[];
  onChange: (topicIds: string[]) => void;
};

export function AgentTopicPicker({
  selectedTopicIds,
  onChange,
}: AgentTopicPickerProps) {
  const { data, isLoading } = useTopics();
  const topics = data?.topics ?? [];

  const toggle = (topicId: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedTopicIds, topicId]
        : selectedTopicIds.filter((id) => id !== topicId),
    );
  };

  return (
    <div className="grid gap-2">
      <Label>Topics for retrieval</Label>
      <p className="text-xs text-muted-foreground">
        Agent chat searches only content from the attached topics.
      </p>
      <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border p-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading topics…</p>
        ) : topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No topics yet — create topics under Documents first.
          </p>
        ) : (
          topics.map((topic) => (
            <div key={topic.id} className="flex items-center gap-2">
              <Checkbox
                id={`agent-topic-${topic.id}`}
                checked={selectedTopicIds.includes(topic.id)}
                onCheckedChange={(checked) =>
                  toggle(topic.id, checked === true)
                }
              />
              <Label
                htmlFor={`agent-topic-${topic.id}`}
                className="text-sm font-normal"
              >
                {topic.name}
              </Label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}