import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { FormCheckbox } from "@workspace/ui/components/forms/FormCheckbox";
import { FormCurrencyInput } from "@workspace/ui/components/forms/FormCurrencyInput";
import { FormCurrencySelect } from "@workspace/ui/components/forms/FormCurrencySelect";
import { FormDatePicker } from "@workspace/ui/components/forms/FormDatePicker";
import { FormInput } from "@workspace/ui/components/forms/FormInput";
import { FormSelect } from "@workspace/ui/components/forms/FormSelect";
import { FormTextarea } from "@workspace/ui/components/forms/FormTextarea";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Textarea: FormTextarea,
    Select: FormSelect,
    Checkbox: FormCheckbox,
    DatePicker: FormDatePicker,
    CurrencyInput: FormCurrencyInput,
    CurrencySelect: FormCurrencySelect,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext };
