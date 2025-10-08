import React from "react";

import { Input } from "@workspace/ui/components/input";
import useDebouncedCallback from "@workspace/ui/hooks/useDebouncedCallback.js";

type DebouncedInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value"
> & {
  onChange?: (value: string) => void;
  value?: string;
};

export default function DebouncedInput({
  type,
  value,
  onChange,
  ...props
}: DebouncedInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(value ?? "");

  const debounced = useDebouncedCallback((val: string) => {
    onChange?.(val);
  }, 700);

  // Synchronization effect: Update internal state if the external 'value' prop changes
  React.useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);
  return (
    <div>
      <Input
        type={type}
        value={inputValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const val = event.target.value;
          setInputValue(val);
          debounced(val);
        }}
        {...props}
      />
    </div>
  );
}
