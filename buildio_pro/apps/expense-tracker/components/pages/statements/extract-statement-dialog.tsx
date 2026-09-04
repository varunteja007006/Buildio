"use client";

import { Button } from "@workspace/ui/components/button";
import { ComboboxSelect } from "@workspace/ui/components/combobox-select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Loader2, Sparkles } from "lucide-react";
import * as React from "react";

import {
  useStatementModels,
  useStatementProcess,
  type StatementDocumentType,
} from "@/hooks";

import { documentTypeLabels } from "./constants";

export interface ExtractStatement {
  id: string;
  originalFilename: string;
  documentType: StatementDocumentType;
  extractionModel: string | null;
}

export function ExtractStatementDialog({
  statement,
  open,
  onOpenChange,
}: {
  statement: ExtractStatement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    data: models,
    isLoading: modelsLoading,
    isError: modelsError,
  } = useStatementModels();
  const processMutation = useStatementProcess({
    onSuccess: () => onOpenChange(false),
  });

  const options = React.useMemo(
    () =>
      (models ?? []).map((model) => ({
        value: model.id,
        label: model.id,
        searchValue: `${model.id} ${model.name} ${model.description ?? ""}`,
      })),
    [models],
  );

  const [selectedModel, setSelectedModel] = React.useState("");
  const [selectedType, setSelectedType] =
    React.useState<StatementDocumentType>("bank_statement");

  React.useEffect(() => {
    if (!open || !statement) return;
    setSelectedModel(
      statement.extractionModel ??
        options.find((option) => option.value === "openai/gpt-5.6-luna")
          ?.value ??
        options[0]?.value ??
        "",
    );
    setSelectedType(statement.documentType);
  }, [open, statement, options]);

  const canStart =
    !modelsLoading && Boolean(selectedModel) && Boolean(statement);

  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={contentRef} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Extract transactions</DialogTitle>
          <DialogDescription>
            Parse {statement?.originalFilename ?? "this statement"} into
            normalized transactions using the Vercel AI Gateway.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Document type</Label>
            <Select
              value={selectedType}
              onValueChange={(val) =>
                setSelectedType(val as StatementDocumentType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(documentTypeLabels) as StatementDocumentType[]
                ).map((type) => (
                  <SelectItem key={type} value={type}>
                    {documentTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changing the type re-extracts with that document type&apos;s
              prompt. Each extraction is versioned — the previous version is
              kept as superseded and can be deleted from the statement list.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            {modelsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading available models...
              </div>
            ) : (
              <ComboboxSelect
                container={contentRef}
                options={options}
                value={selectedModel}
                onValueChange={setSelectedModel}
                placeholder="Search and select a model"
                searchPlaceholder="Search by name or provider..."
                emptyMessage="No models returned by the gateway"
              />
            )}
          </div>
          {!modelsLoading && modelsError && (
            <p className="text-xs text-destructive">
              Could not reach the gateway to list models. Verify that
              AI_GATEWAY_API_KEY is configured on the server.
            </p>
          )}
          {!modelsLoading && !modelsError && models && models.length === 0 && (
            <p className="text-xs text-destructive">
              No models were returned by the gateway. Verify that
              AI_GATEWAY_API_KEY is configured on the server.
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={processMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={!canStart || processMutation.isPending}
            onClick={() =>
              statement &&
              processMutation.mutate({
                uploadId: statement.id,
                model: selectedModel,
                documentType: selectedType,
              })
            }
          >
            {processMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {processMutation.isPending ? "Extracting..." : "Start extraction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
