"use client";

import React from "react";
import Combobox, { type ComboboxOption } from "./combobox";

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
    <Combobox
      value={value}
      onValueChange={handleSelect}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      disabled={disabled}
      clearable
      className={className}
    />
  );
}
