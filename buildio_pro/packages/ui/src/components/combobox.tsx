"use client";

import React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Base combobox option interface.
 * Extend this to add domain-specific properties.
 */
export interface ComboboxOption {
  value: string;
  label: string;
  searchValue?: string;
}

interface ComboboxProps<T extends ComboboxOption = ComboboxOption> {
  // State
  value?: string;
  onValueChange: (value: string) => void;

  // Data
  options: T[];

  // Display
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;

  // Rendering
  renderOption?: (option: T) => React.ReactNode;
  renderTrigger?: (option: T | undefined) => React.ReactNode;

  // Behavior
  disabled?: boolean;
  clearable?: boolean;

  // Styling
  className?: string;
}

/**
 * Generic standalone combobox component.
 *
 * Features:
 * - Full-text search functionality
 * - Extensible for domain-specific use cases
 * - Custom render functions for options and trigger
 * - Support for clearable selections
 * - Consistent width between trigger and dropdown
 * - Accessible keyboard navigation
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "1", label: "Option 1" },
 *   { value: "2", label: "Option 2" },
 * ];
 *
 * <Combobox
 *   value={selected}
 *   onValueChange={setSelected}
 *   options={options}
 *   placeholder="Choose..."
 * />
 * ```
 */
export default function Combobox<T extends ComboboxOption = ComboboxOption>({
  value = "",
  onValueChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  renderOption,
  renderTrigger,
  disabled = false,
  clearable = false,
  className,
}: Readonly<ComboboxProps<T>>) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    if (clearable && selectedValue === value) {
      onValueChange("");
    } else {
      onValueChange(selectedValue);
    }
    setOpen(false);
  };

  const handleTriggerClick = () => {
    if (clearable && value && !open) {
      // If clicking trigger while open, just toggle popover
      return;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          disabled={disabled}
          onClick={handleTriggerClick}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {renderTrigger ? (
            renderTrigger(selectedOption)
          ) : (
            <>
              {selectedOption ? selectedOption.label : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
          {!renderTrigger && (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        sideOffset={4}
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.searchValue || option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {renderOption ? renderOption(option) : option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
