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
  ComboboxValue,
  type ComboboxOption,
} from "@workspace/ui/components/combobox";
import { cn } from "@workspace/ui/lib/utils";

interface ComboboxSelectProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
}

function ComboboxSelect({
  options,
  value = "",
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  clearable = false,
  className,
}: Readonly<ComboboxSelectProps>) {
  const selected = options.find((opt) => opt.value === value) ?? null;

  return (
    <Combobox
      items={options}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.searchValue ?? option.label}
      value={selected}
      onValueChange={(option) => {
        if (clearable && option && option.value === value) {
          onValueChange("");
        } else {
          onValueChange(option ? option.value : "");
        }
      }}
      disabled={disabled}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !selected && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <ComboboxValue placeholder={placeholder} />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { ComboboxSelect };
