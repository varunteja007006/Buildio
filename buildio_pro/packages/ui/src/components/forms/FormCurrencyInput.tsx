import { Input } from "@workspace/ui/components/input";
import {
  FormBase,
  FormControlProps,
} from "@workspace/ui/components/forms/FormBase";
import { useFieldContext } from "@workspace/ui/components/forms/hooks";
import {
  CurrencyPicker,
  Currency,
} from "@workspace/ui/components/currency-picker";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

interface FormCurrencyInputProps extends FormControlProps {
  showCurrency?: boolean;
  defaultCurrency?: string;
  currencyName?: string;
  onCurrencyChange?: (currency: Currency) => void;
  currencyPlaceholder?: string;
  inputPlaceholder?: string;
  className?: string;
}

export function FormCurrencyInput({
  showCurrency = true,
  defaultCurrency = "USD",
  currencyName,
  onCurrencyChange,
  currencyPlaceholder = "Currency",
  inputPlaceholder = "Amount",
  className,
  ...props
}: FormCurrencyInputProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const currencySelectRef = React.useRef<HTMLDivElement>(null);

  return (
    <FormBase {...props}>
      <div className={cn("flex gap-2 w-full", className)}>
        {showCurrency && (
          <div className="w-32">
            <CurrencyPicker
              ref={currencySelectRef}
              value={defaultCurrency}
              name={currencyName || "currency"}
              placeholder={currencyPlaceholder}
              onChange={onCurrencyChange}
            />
          </div>
        )}
        <Input
          id={field.name}
          name={field.name}
          type="number"
          placeholder={inputPlaceholder}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className="flex-1"
          step="0.01"
          min="0"
        />
      </div>
    </FormBase>
  );
}
