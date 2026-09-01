import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { cn } from "@workspace/ui/lib/utils";
import { Search } from "lucide-react";
import React from "react";

export function SearchInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <InputGroup className={cn("gap-1", className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput type="search" placeholder="Search..." {...props} />
    </InputGroup>
  );
}
