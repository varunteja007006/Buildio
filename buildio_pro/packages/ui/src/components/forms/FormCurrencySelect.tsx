import React from "react";

import { CurrencyPicker } from "@workspace/ui/components/currency-picker";
import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/forms/FormBase";
import { useFieldContext } from "@workspace/ui/components/forms/hooks";

interface FormCurrencySelectProps extends FormControlProps {
  currencyPlaceholder?: string;
}

export function FormCurrencySelect({
  currencyPlaceholder = "Currency",
  ...props
}: FormCurrencySelectProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const currencySelectRef = React.useRef<HTMLDivElement>(null);

  return (
    <FormBase {...props}>
      <CurrencyPicker
        ref={currencySelectRef}
        placeholder={currencyPlaceholder}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(currency) => field.handleChange(currency.code)}
        aria-invalid={isInvalid}
      />
    </FormBase>
  );
}
