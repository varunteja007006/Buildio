"use client";

import { CalendarIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { formatDate } from "@workspace/ui/lib/format";
import { cn } from "@workspace/ui/lib/utils";
import type { ExtendedColumnFilter } from "@workspace/ui/types/data-table";

interface DataTableFilterMenuDateInputProps<TData> {
  filter: ExtendedColumnFilter<TData>;
  inputId: string;
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>,
  ) => void;
  showValueSelector: boolean;
  setShowValueSelector: (value: boolean) => void;
}

export function DataTableFilterMenuDateInput<TData>({
  filter,
  inputId,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector,
}: DataTableFilterMenuDateInputProps<TData>) {
  const inputListboxId = `${inputId}-listbox`;

  const dateValue = Array.isArray(filter.value)
    ? filter.value.filter(Boolean)
    : [filter.value, filter.value].filter(Boolean);

  const startDate = dateValue[0]
    ? new Date(Number(dateValue[0]))
    : undefined;
  const endDate = dateValue[1] ? new Date(Number(dateValue[1])) : undefined;

  const isSameDate =
    startDate &&
    endDate &&
    startDate.toDateString() === endDate.toDateString();

  const displayValue =
    filter.operator === "isBetween" && dateValue.length === 2 && !isSameDate
      ? `${formatDate(startDate, { month: "short" })} - ${formatDate(endDate, { month: "short" })}`
      : startDate
        ? formatDate(startDate, { month: "short" })
        : "Pick date...";

  return (
    <Popover open={showValueSelector} onOpenChange={setShowValueSelector}>
      <PopoverTrigger asChild>
        <Button
          id={inputId}
          aria-controls={inputListboxId}
          variant="ghost"
          size="sm"
          className={cn(
            "h-full rounded-none border px-1.5 font-normal dark:bg-input/30",
            !filter.value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-3.5" />
          <span className="truncate">{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id={inputListboxId}
        align="start"
        className="w-auto p-0"
      >
        {filter.operator === "isBetween" ? (
          <Calendar
            autoFocus
            captionLayout="dropdown"
            mode="range"
            selected={
              dateValue.length === 2
                ? {
                    from: new Date(Number(dateValue[0])),
                    to: new Date(Number(dateValue[1])),
                  }
                : {
                    from: new Date(),
                    to: new Date(),
                  }
            }
            onSelect={(date) => {
              onFilterUpdate(filter.filterId, {
                value: date
                  ? [
                      (date.from?.getTime() ?? "").toString(),
                      (date.to?.getTime() ?? "").toString(),
                    ]
                  : [],
              });
            }}
          />
        ) : (
          <Calendar
            autoFocus
            captionLayout="dropdown"
            mode="single"
            selected={
              dateValue[0] ? new Date(Number(dateValue[0])) : undefined
            }
            onSelect={(date) => {
              onFilterUpdate(filter.filterId, {
                value: (date?.getTime() ?? "").toString(),
              });
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
