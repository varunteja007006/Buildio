import React from "react";

import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/forms/FormBase";
import { useFieldContext } from "@workspace/ui/components/forms/hooks";
import {
  CurrencyPicker,
} from "@workspace/ui/components/currency-picker";

interface FormCurrencySelectProps extends FormControlProps {
  showCurrency?: boolean;
  defaultCurrency?: string;
  currencyName?: string;
  currencyPlaceholder?: string;
  inputPlaceholder?: string;
  className?: string;
  showInput?: boolean;
}

export function FormCurrencySelect({
  showCurrency = true,
  showInput = true,
  defaultCurrency = "USD",
  currencyName,
  currencyPlaceholder = "Currency",
  inputPlaceholder = "Amount",
  className,
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
