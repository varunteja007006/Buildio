"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  type ComboboxOption,
} from "@workspace/ui/components/combobox";
import { Bot, Loader2 } from "lucide-react";
import { useMemo } from "react";

import type { ChatModelOption } from "@/lib/chat/models";

type ChatModelSelectorProps = {
  models: ChatModelOption[];
  value?: string;
  loading?: boolean;
  saving?: boolean;
  onSelect?: (modelId: string) => void;
};

/** Searchable model picker that shows the currently selected chat model. */
export function ChatModelSelector({
  models,
  value,
  loading = false,
  saving = false,
  onSelect,
}: ChatModelSelectorProps) {
  const options = useMemo<ComboboxOption[]>(
    () =>
      models.map((model) => ({
        value: model.id,
        label: model.label,
        searchValue: `${model.id} ${model.label} ${model.description}`,
      })),
    [models],
  );

  const descriptionByValue = useMemo(
    () => new Map(models.map((model) => [model.id, model.description])),
    [models],
  );

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const displayLabel =
    selected?.label ??
    (value?.includes("/") ? value.slice(value.indexOf("/") + 1) : value) ??
    "Model";

  if (loading && options.length === 0) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-64 justify-between gap-1.5 text-muted-foreground"
        disabled
      >
        <Loader2 className="size-4 animate-spin" />
        <span className="truncate">Loading models…</span>
      </Button>
    );
  }

  return (
    <Combobox
      items={options}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.searchValue ?? option.label}
      value={selected}
      onValueChange={(option) => {
        if (option) onSelect?.(option.value);
      }}
      disabled={options.length === 0}
    >
      <ComboboxTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-64 justify-between gap-1.5 text-muted-foreground"
          />
        }
      >
        {saving ? (
          <Loader2 className="size-4 shrink-0 animate-spin" />
        ) : (
          <Bot className="size-4 shrink-0" />
        )}
        <span className="truncate font-medium text-foreground">
          {displayLabel}
        </span>
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput
          placeholder="Search models…"
          showTrigger={false}
          showClear
        />
        <ComboboxEmpty>No models found</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate">{option.label}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {descriptionByValue.get(option.value) ?? option.value}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
