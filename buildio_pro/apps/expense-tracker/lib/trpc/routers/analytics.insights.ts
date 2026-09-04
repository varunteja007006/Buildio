import { and, desc, eq, isNull } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  numericToNumber,
  StatementMetadata,
} from "./analytics.helpers";

export const getEmiSummary = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      eq(dbSchema.financialTransaction.isEmi, true),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
    with: { bankAccount: true },
  });

  const byAccount = new Map<
    string,
    {
      bankAccountId: string;
      accountName: string | null;
      emis: Map<
        string,
        {
          merchant: string;
          monthlyInstallment: number;
          installmentNumber: number | null;
          totalInstallments: number | null;
        }
      >;
    }
  >();

  for (const transaction of transactions) {
    const accountId = transaction.bankAccountId ?? "unknown";
    let entry = byAccount.get(accountId);
    if (!entry) {
      entry = {
        bankAccountId: accountId,
        accountName: transaction.bankAccount?.name ?? null,
        emis: new Map(),
      };
      byAccount.set(accountId, entry);
    }
    const merchant = transaction.merchantName ?? "unknown";
    entry.emis.set(merchant, {
      merchant,
      monthlyInstallment: numericToNumber(transaction.amount),
      installmentNumber: transaction.emiInstallmentNumber,
      totalInstallments: transaction.emiTotalInstallments,
    });
  }

  return Array.from(byAccount.values()).map((account) => {
    let totalMonthlyInstallment = 0;
    let totalPendingInstallments = 0;
    let totalOutstanding = 0;
    const emis = Array.from(account.emis.values()).map((emi) => {
      totalMonthlyInstallment += emi.monthlyInstallment;
      const pending =
        emi.totalInstallments !== null && emi.installmentNumber !== null
          ? Math.max(0, emi.totalInstallments - emi.installmentNumber)
          : 0;
      totalPendingInstallments += pending;
      totalOutstanding += pending * emi.monthlyInstallment;
      return {
        merchant: emi.merchant,
        monthlyInstallment: emi.monthlyInstallment,
        installmentNumber: emi.installmentNumber,
        totalInstallments: emi.totalInstallments,
        pendingInstallments: pending,
      };
    });
    return {
      bankAccountId: account.bankAccountId,
      accountName: account.accountName,
      emis,
      totalMonthlyInstallment,
      totalPendingInstallments,
      totalOutstanding,
    };
  });
});

export const getCardIntelligence = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const statements = await db.query.statementUpload.findMany({
    where: and(
      eq(dbSchema.statementUpload.userId, user.id),
      eq(dbSchema.statementUpload.documentType, "credit_card"),
    ),
    orderBy: desc(dbSchema.statementUpload.uploadedAt),
  });

  const byAccount = new Map<
    string,
    { latest: (typeof statements)[number]; statements: typeof statements }
  >();

  for (const statement of statements) {
    const transactions = await db.query.financialTransaction.findMany({
      where: and(
        eq(dbSchema.financialTransaction.userId, user.id),
        eq(dbSchema.financialTransaction.statementUploadId, statement.id),
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
    });

    const accountId = transactions[0]?.bankAccountId ?? "unknown";
    const entry = byAccount.get(accountId) ?? {
      latest: statement,
      statements: [],
    };
    entry.statements.push(statement);
    const currentDate = (
      entry.latest.statementMetadata as StatementMetadata | null
    )?.statementDate;
    const candidateDate = (
      statement.statementMetadata as StatementMetadata | null
    )?.statementDate;
    if (candidateDate && (!currentDate || candidateDate > currentDate)) {
      entry.latest = statement;
    }
    byAccount.set(accountId, entry);
  }

  const accounts = await db.query.userBankAccount.findMany({
    where: eq(dbSchema.userBankAccount.user_id, user.id),
  });
  const accountNames = new Map(accounts.map((a) => [a.id, a.name]));

  return Array.from(byAccount.entries()).map(([bankAccountId, entry]) => {
    const meta = (entry.latest.statementMetadata ?? {}) as StatementMetadata;
    const creditLimit = meta.creditLimit ?? null;
    const availableCredit = meta.availableCredit ?? null;
    const utilization =
      creditLimit && availableCredit !== null
        ? (creditLimit - availableCredit) / creditLimit
        : null;

    return {
      bankAccountId,
      accountName: accountNames.get(bankAccountId) ?? null,
      utilization,
      creditLimit,
      availableCredit,
      totalAmountDue: meta.totalAmountDue ?? null,
      minimumAmountDue: meta.minimumAmountDue ?? null,
      paymentDueDate: meta.paymentDueDate ?? null,
      statementDate: meta.statementDate ?? null,
      rewards: meta.rewards ?? null,
      statementCount: entry.statements.length,
    };
  });
});
