import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/forms/FormBase";
import { useFieldContext } from "@workspace/ui/components/forms/hooks";
import { YearPicker } from "@workspace/ui/components/year-picker";

interface FormYearPickerProps extends FormControlProps {
  minYear?: number;
  maxYear?: number;
}

/**
 * Form wrapper for the standalone YearPicker.
 * Integrates with FormBase for consistent styling and validation.
 */
export function FormYearPicker({
  minYear = 1900,
  maxYear = new Date().getFullYear() + 2,
  ...props
}: Readonly<FormYearPickerProps>) {
  const field = useFieldContext<number>();

  return (
    <FormBase {...props}>
      <YearPicker
        value={field.state.value}
        onChange={(year) => {
          if (year !== undefined) {
            field.handleChange(year);
          }
        }}
        placeholder={props.placeholder || props.label}
        minYear={minYear}
        maxYear={maxYear}
        disabled={false}
      />
    </FormBase>
  );
}
