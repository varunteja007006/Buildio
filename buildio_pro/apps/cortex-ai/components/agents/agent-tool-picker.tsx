"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { useMemo } from "react";

import { useToolboxes } from "@/api/toolboxes/query";
import { toolCatalog } from "@/lib/agents/tool-catalog";

type AgentToolPickerProps = {
  selectedToolKeys: string[];
  selectedToolboxIds: string[];
  onChange: (
    toolKeys: string[],
    toolboxIds: string[],
    droppedToolKeys: string[],
  ) => void;
};

/**
 * Tool picker with the toolbox exclusion rules:
 * - tools inside any toolbox are hidden from the individual list;
 * - attaching a toolbox drops overlapping individual selections.
 */
export function AgentToolPicker({
  selectedToolKeys,
  selectedToolboxIds,
  onChange,
}: AgentToolPickerProps) {
  const { data, isLoading } = useToolboxes(1, 100);
  const toolboxes = useMemo(
    () =>
      (data?.toolboxes ?? []).map((toolbox) => ({
        ...toolbox,
        toolKeys: toolbox.toolKeys ?? [],
      })),
    [data],
  );

  const allToolboxMemberKeys = useMemo(
    () => new Set(toolboxes.flatMap((toolbox) => toolbox.toolKeys)),
    [toolboxes],
  );
  const individualTools = toolCatalog.filter(
    (entry) => !allToolboxMemberKeys.has(entry.key),
  );

  const toggleTool = (toolKey: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedToolKeys, toolKey]
        : selectedToolKeys.filter((key) => key !== toolKey),
      selectedToolboxIds,
      [],
    );
  };

  const toggleToolbox = (toolboxId: string, checked: boolean) => {
    if (!checked) {
      onChange(
        selectedToolKeys,
        selectedToolboxIds.filter((id) => id !== toolboxId),
        [],
      );
      return;
    }
    // Exclusion rule: tools inside the selected toolbox drop out of the
    // individual selection (toolbox takes precedence).
    const toolboxKeys =
      toolboxes.find((toolbox) => toolbox.id === toolboxId)?.toolKeys ?? [];
    const dropped = selectedToolKeys.filter((key) =>
      toolboxKeys.includes(key),
    );
    onChange(
      selectedToolKeys.filter((key) => !toolboxKeys.includes(key)),
      [...selectedToolboxIds, toolboxId],
      dropped,
    );
  };

  return (
    <div className="grid gap-2">
      <Label>Tools</Label>
      <p className="text-xs text-muted-foreground">
        Attach individual tools or whole toolboxes. Tools inside toolboxes are
        not individually attachable.
      </p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading tools…</p>
      ) : (
        <div className="max-h-56 space-y-3 overflow-y-auto rounded-md border p-2">
          {individualTools.length === 0 && toolboxes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tools available.</p>
          ) : null}
          {individualTools.length > 0 ? (
            <div className="space-y-1">
              {individualTools.map((entry) => (
                <div key={entry.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`agent-tool-${entry.key}`}
                    checked={selectedToolKeys.includes(entry.key)}
                    onCheckedChange={(checked) =>
                      toggleTool(entry.key, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`agent-tool-${entry.key}`}
                    className="text-sm font-normal"
                  >
                    {entry.name}
                    <span className="text-muted-foreground">
                      {" "}
                      — {entry.description}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          ) : null}
          {toolboxes.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Toolboxes
              </p>
              {toolboxes.map((toolbox) => (
                <div key={toolbox.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`agent-toolbox-${toolbox.id}`}
                    checked={selectedToolboxIds.includes(toolbox.id)}
                    onCheckedChange={(checked) =>
                      toggleToolbox(toolbox.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`agent-toolbox-${toolbox.id}`}
                    className="flex items-center gap-2 text-sm font-normal"
                  >
                    {toolbox.name}
                    <Badge variant="secondary">
                      {toolbox.toolKeys.length} tools
                    </Badge>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {toolbox.toolKeys
                      .map(
                        (key) =>
                          toolCatalog.find((entry) => entry.key === key)?.name ??
                          key,
                      )
                      .join(", ")}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}