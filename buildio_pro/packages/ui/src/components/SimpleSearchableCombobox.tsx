"use client";

import { type ComboboxOption } from "@workspace/ui/components/combobox";

import { ComboboxSelect } from "@workspace/ui/components/combobox-select";

/**
 * Simple standalone searchable combobox wrapper.
 *
 * Backward-compatible wrapper around the generic Combobox component.
 */

interface SimpleSearchableComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export default function SimpleSearchableCombobox({
  options,
  value = "",
  onSelect,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
}: Readonly<SimpleSearchableComboboxProps>) {
  const handleSelect = (selectedValue: string) => {
    // Toggle behavior: deselect if clicking the same item
    if (selectedValue === value) {
      onSelect("");
    } else {
      onSelect(selectedValue);
    }
  };

  return (
    <ComboboxSelect
      options={options}
      value={value}
      onValueChange={handleSelect}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      disabled={disabled}
      clearable
      className={className}
    />
  );
}
