import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/forms/FormBase";
import { useFieldContext } from "@workspace/ui/components/forms/hooks";
import { DatePicker } from "@workspace/ui/components/date-picker";

/**
 * Form wrapper for the standalone DatePicker.
 * Integrates with FormBase for consistent styling and validation.
 */
export function FormDatePicker(props: Readonly<FormControlProps>) {
  const field = useFieldContext<Date>();

  return (
    <FormBase {...props}>
      <DatePicker
        value={field.state.value}
        onChange={(date) => {
          if (date) {
            field.handleChange(date);
          }
        }}
        placeholder={props.placeholder || props.label}
        disabled={false}
      />
    </FormBase>
  );
}
