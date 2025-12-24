import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { FormInput } from "@workspace/ui/components/forms/FormInput";
import { FormTextarea } from "@workspace/ui/components/forms/FormTextarea";
import { FormSelect } from "@workspace/ui/components/forms/FormSelect";
import { FormCheckbox } from "@workspace/ui/components/forms/FormCheckbox";
import { FormDatePicker } from "@workspace/ui/components/forms/FormDatePicker";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Textarea: FormTextarea,
    Select: FormSelect,
    Checkbox: FormCheckbox,
    DatePicker: FormDatePicker,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext };
