"use client";

import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@workspace/ui/components/form";
import Combobox, { type ComboboxOption } from "./combobox";

/**
 * Form-integrated searchable combobox component for react-hook-form.
 *
 * Wraps the generic Combobox with form field integration.
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "1", label: "Option 1" },
 *   { value: "2", label: "Option 2" },
 * ];
 *
 * <SearchableCombobox
 *   control={form.control}
 *   name="fieldName"
 *   label="Select Option"
 *   options={options}
 * />
 * ```
 */

interface SearchableComboboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  // Form related props
  control: Control<TFieldValues>;
  name: TName;

  // Component props
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  description?: string;
  required?: boolean;

  // Options
  options: ComboboxOption[];
  emptyMessage?: string;

  // Callbacks
  onSelectionChange?: (
    value: string,
    option: ComboboxOption | undefined,
  ) => void;

  // Styling
  className?: string;
  disabled?: boolean;
}

export default function SearchableCombobox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder = "Select an option",
  searchPlaceholder = "Search options...",
  description,
  required = false,
  options = [],
  emptyMessage = "No option found.",
  onSelectionChange,
  className,
  disabled = false,
}: Readonly<SearchableComboboxProps<TFieldValues, TName>>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Combobox
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(value);
                const selectedOption = options.find(
                  (opt) => opt.value === value,
                );
                onSelectionChange?.(value, selectedOption);
              }}
              options={options}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyMessage={emptyMessage}
              disabled={disabled}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
