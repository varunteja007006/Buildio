import { cn } from "@workspace/ui/lib/utils";
import { Loader2 } from "lucide-react";

export const Spinner = ({ className }: { className?: string }) => {
  return <Loader2 className={cn("animate-spin size-6", className)} />;
};
