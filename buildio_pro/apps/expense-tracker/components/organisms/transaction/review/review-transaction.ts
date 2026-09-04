import type {
  TransactionDirection,
  TransactionType,
} from "@/hooks";

export interface ReviewTransaction {
  id: string;
  transactionDate: Date | string;
  amount: number;
  direction: TransactionDirection;
  transactionType: TransactionType;
  merchantName: string | null;
  counterpartyName: string | null;
  description: string | null;
  rawDescription: string | null;
  referenceNumber: string | null;
  balanceAfter: number | null;
  isRecurring: boolean;
  isTransfer: boolean;
  extractionConfidence: number | null;
  needsReview: boolean;
  reviewedAt: Date | string | null;
  categoryId: string | null;
  paymentMethodId: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  category?: { id: string; name: string } | null;
  paymentMethod?: { id: string; name: string } | null;
  statementUpload?: { id: string; originalFilename: string } | null;
}
