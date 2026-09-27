"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { ProbeResult } from "@/api/connections/types";
import type { Connection } from "@/api/connections/types";
import {
  ConnectionDetailsForm,
  type DetailsFormState,
} from "@/components/connections/connection-details-form";
import { connectionTypeOptions } from "@/components/connections/connection-types";

type ConnectionDialogProps = {
  connection: Connection | null | undefined;
  step: 1 | 2;
  form: DetailsFormState;
  editing: boolean;
  error: string | null;
  testing: boolean;
  probe: ProbeResult | null;
  canSave: boolean;
  pending: boolean;
  onStepChange: (step: 1 | 2) => void;
  onChange: (field: keyof DetailsFormState, value: string) => void;
  onTest: () => void;
  onSave: () => void;
  onClose: () => void;
};

export function ConnectionDialog({
  connection,
  step,
  form,
  editing,
  error,
  testing,
  probe,
  canSave,
  pending,
  onStepChange,
  onChange,
  onTest,
  onSave,
  onClose,
}: ConnectionDialogProps) {
  return (
    <Dialog open={connection !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b bg-background px-6 py-4">
          <DialogTitle>
            {editing ? "Edit connection" : "New connection"}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 2 — {step === 1 ? "choose a database type" : "connection details"}
          </DialogDescription>
        </DialogHeader>
        <div className="scrollbar-elegant min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {step === 1 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {connectionTypeOptions.map((option) => {
                const Icon = option.icon;
                const selected = option.value === "postgres";
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!option.enabled}
                    onClick={() => option.enabled && onStepChange(2)}
                    className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    } ${option.enabled ? "" : "cursor-not-allowed opacity-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="size-5" />
                      {!option.enabled && (
                        <Badge variant="outline">Coming soon</Badge>
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <ConnectionDetailsForm
              form={form}
              editing={editing}
              error={error}
              testing={testing}
              probe={probe}
              onChange={onChange}
              onTest={onTest}
            />
          )}
        </div>
        <DialogFooter className="shrink-0 gap-2 border-t bg-background px-6 py-4 sm:justify-between">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => onStepChange(2)}>
                Next <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onStepChange(1)}>
                <ArrowLeft data-icon="inline-start" /> Back
              </Button>
              <Button onClick={onSave} disabled={!canSave || pending}>
                {pending ? "Saving..." : "Save connection"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}