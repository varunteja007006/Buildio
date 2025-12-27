"use client";

import { Control, FieldPath, FieldValues } from "react-hook-form";
import ColorPicker from "@workspace/ui/components/ColorPicker";

interface SimpleColorPickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  required?: boolean;
  onSelectionChange?: (color: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export default function SimpleColorPicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Readonly<SimpleColorPickerProps<TFieldValues, TName>>) {
  return <ColorPicker variant="simple" {...props} />;
}
