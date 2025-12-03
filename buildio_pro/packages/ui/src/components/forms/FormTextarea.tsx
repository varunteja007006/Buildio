import { Textarea } from "@workspace/ui/components/textarea"
import { FormBase, FormControlProps } from "@workspace/ui/components/forms/FormBase"
import { useFieldContext } from "@workspace/ui/components/forms/hooks"

export function FormTextarea(props: Readonly<FormControlProps>) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
    </FormBase>
  )
}
