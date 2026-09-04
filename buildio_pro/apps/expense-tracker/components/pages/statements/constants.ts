import { Banknote, CreditCard, FileSpreadsheet, Landmark } from "lucide-react";
import * as React from "react";

import type { StatementDocumentType } from "@/hooks";

export const documentTypeLabels: Record<StatementDocumentType, string> = {
  credit_card: "Credit Card",
  bank_statement: "Bank Statement",
  income_statement: "Income Statement",
  income_tax_statement: "Income Tax Statement",
};

export const documentTypeIcons: Record<StatementDocumentType, React.ElementType> =
  {
    credit_card: CreditCard,
    bank_statement: Landmark,
    income_statement: Banknote,
    income_tax_statement: FileSpreadsheet,
  };

export const statusVariants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  uploaded: "secondary",
  processing: "default",
  processed: "default",
  failed: "destructive",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
