"use client";

import { ListFilter } from "lucide-react";
import type { ComponentProps, RefObject } from "react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { SortableOverlay } from "@workspace/ui/components/sortable";
import { cn } from "@workspace/ui/lib/utils";

interface DataTableFilterListTriggerProps extends ComponentProps<"button"> {
  filtersCount: number;
}

export function DataTableFilterListTrigger({
  filtersCount,
  ...props
}: DataTableFilterListTriggerProps) {
  return (
    <Button variant="outline" size="sm" className="font-normal" {...props}>
      <ListFilter className="text-muted-foreground" />
      Filter
      {filtersCount > 0 && (
        <Badge
          variant="secondary"
          className="h-[18.24px] rounded-[3.2px] px-[5.12px] font-mono font-normal text-[10.4px]"
        >
          {filtersCount}
        </Badge>
      )}
    </Button>
  );
}

interface DataTableFilterListHeaderProps {
  filtersCount: number;
  labelId: string;
  descriptionId: string;
}

export function DataTableFilterListHeader({
  filtersCount,
  labelId,
  descriptionId,
}: DataTableFilterListHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h4 id={labelId} className="font-medium leading-none">
        {filtersCount > 0 ? "Filters" : "No filters applied"}
      </h4>
      <p
        id={descriptionId}
        className={cn(
          "text-muted-foreground text-sm",
          filtersCount > 0 && "sr-only",
        )}
      >
        {filtersCount > 0
          ? "Modify filters to refine your rows."
          : "Add filters to refine your rows."}
      </p>
    </div>
  );
}

interface DataTableFilterListActionsProps {
  showReset: boolean;
  addButtonRef: RefObject<HTMLButtonElement | null>;
  onAddFilter: () => void;
  onResetFilters: () => void;
}

export function DataTableFilterListActions({
  showReset,
  addButtonRef,
  onAddFilter,
  onResetFilters,
}: DataTableFilterListActionsProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <Button
        size="sm"
        className="rounded"
        ref={addButtonRef}
        onClick={onAddFilter}
      >
        Add filter
      </Button>
      {showReset ? (
        <Button
          variant="outline"
          size="sm"
          className="rounded"
          onClick={onResetFilters}
        >
          Reset filters
        </Button>
      ) : null}
    </div>
  );
}

export function DataTableFilterListOverlay() {
  return (
    <SortableOverlay>
      <div className="flex items-center gap-2">
        <div className="h-8 min-w-[72px] rounded-sm bg-primary/10" />
        <div className="h-8 w-32 rounded-sm bg-primary/10" />
        <div className="h-8 w-32 rounded-sm bg-primary/10" />
        <div className="h-8 min-w-36 flex-1 rounded-sm bg-primary/10" />
        <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
      </div>
    </SortableOverlay>
  );
}
