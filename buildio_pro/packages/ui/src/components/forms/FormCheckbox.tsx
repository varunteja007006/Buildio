import { useFieldContext } from "@workspace/ui/components/forms/hooks"
import { FormBase, FormControlProps } from "@workspace/ui/components/forms/FormBase"
import { Checkbox } from "@workspace/ui/components/checkbox"

export function FormCheckbox(props: Readonly<FormControlProps>) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props} controlFirst horizontal>
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onBlur={field.handleBlur}
        onCheckedChange={e => field.handleChange(e === true)}
        aria-invalid={isInvalid}
      />
    </FormBase>
  )
}
