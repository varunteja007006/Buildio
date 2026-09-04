"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Check, Pencil, X } from "lucide-react";
import * as React from "react";

import { useStatementRename } from "@/hooks";

export function StatementFilenameCell({
  uploadId,
  filename,
}: {
  uploadId: string;
  filename: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(filename);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const renameMutation = useStatementRename();

  React.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEditing = () => {
    setValue(filename);
    setEditing(true);
  };

  const cancel = () => {
    setValue(filename);
    setEditing(false);
  };

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === filename) {
      setEditing(false);
      return;
    }
    renameMutation.mutate(
      { uploadId, filename: trimmed },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="h-8 w-56"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          disabled={renameMutation.isPending}
          onClick={save}
          aria-label="Save new filename"
        >
          <Check className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={cancel}
          aria-label="Cancel rename"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex max-w-64 items-center gap-1">
      <span className="min-w-0 flex-1 truncate">{filename}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
        onClick={startEditing}
        aria-label="Rename statement"
      >
        <Pencil className="size-3.5" />
      </Button>
    </div>
  );
}
