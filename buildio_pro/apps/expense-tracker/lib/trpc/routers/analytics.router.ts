import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "../init";

const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  return new Date(parseInt(year!), parseInt(month!) - 1).toLocaleString(
    "default",
    { month: "short", year: "numeric" },
  );
};

type StatementMetadata = {
  creditLimit?: number | null;
  availableCredit?: number | null;
  totalAmountDue?: number | null;
  minimumAmountDue?: number | null;
  paymentDueDate?: string | null;
  statementDate?: string | null;
  rewards?: { earned?: number | null; unit?: string | null } | null;
};

export const analyticsRouter = createTRPCRouter({
  getEmiSummary: protectedProcedure.query(async ({ ctx }) => {
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
  }),

  getCashFlow: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transactions = await db.query.financialTransaction.findMany({
      where: and(
        eq(dbSchema.financialTransaction.userId, user.id),
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
      with: { bankAccount: true },
      orderBy: (t, { asc }) => asc(t.transactionDate),
    });

    const byAccount = new Map<
      string,
      {
        accountName: string | null;
        byMonth: Map<
          string,
          { debit: number; credit: number; lastBalance: number | null }
        >;
      }
    >();

    for (const transaction of transactions) {
      if (transaction.transactionType === "transfer") continue;
      const accountId = transaction.bankAccountId ?? "unknown";
      let account = byAccount.get(accountId);
      if (!account) {
        account = {
          accountName: transaction.bankAccount?.name ?? null,
          byMonth: new Map(),
        };
        byAccount.set(accountId, account);
      }
      const key = monthKey(new Date(transaction.transactionDate));
      const month = account.byMonth.get(key) ?? {
        debit: 0,
        credit: 0,
        lastBalance: null,
      };
      const amount = numericToNumber(transaction.amount);
      if (transaction.direction === "debit") {
        month.debit += amount;
      } else {
        month.credit += amount;
      }
      if (transaction.balanceAfter) {
        month.lastBalance = numericToNumber(transaction.balanceAfter);
      }
      account.byMonth.set(key, month);
    }

    return Array.from(byAccount.entries()).map(([bankAccountId, account]) => {
      const months = Array.from(account.byMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([rawDate, m]) => ({
          month: monthLabel(rawDate),
          rawDate,
          debit: m.debit,
          credit: m.credit,
          net: m.credit - m.debit,
          closingBalance: m.lastBalance,
        }));

      const debitMonths = months.map((m) => m.debit);
      const avgMonthlyBurn =
        debitMonths.length > 0
          ? debitMonths.reduce((a, b) => a + b, 0) / debitMonths.length
          : 0;
      const currentBalance = months[months.length - 1]?.closingBalance ?? null;
      const runwayMonths =
        currentBalance !== null && avgMonthlyBurn > 0
          ? currentBalance / avgMonthlyBurn
          : null;
      const deficitMonths = months.filter((m) => m.credit < m.debit).length;

      return {
        bankAccountId,
        accountName: account.accountName,
        currentBalance,
        avgMonthlyBurn,
        runwayMonths,
        deficitMonths,
        months,
      };
    });
  }),

  getCardIntelligence: protectedProcedure.query(async ({ ctx }) => {
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
  }),

  getCategoryAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transactions = await db.query.financialTransaction.findMany({
      where: and(
        eq(dbSchema.financialTransaction.userId, user.id),
        eq(dbSchema.financialTransaction.direction, "debit"),
        isNotNull(dbSchema.financialTransaction.categoryId),
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
      with: { category: { with: { parent: true } } },
    });

    const heatmap = new Map<string, Map<string, number>>();
    const categoryTotals = new Map<string, number>();
    const merchantTotals = new Map<
      string,
      { amount: number; count: number; recurring: boolean }
    >();

    for (const transaction of transactions) {
      const amount = numericToNumber(transaction.amount);
      const key = monthKey(new Date(transaction.transactionDate));
      const categoryName = transaction.category?.name ?? "unknown";
      let monthRow = heatmap.get(key);
      if (!monthRow) {
        monthRow = new Map();
        heatmap.set(key, monthRow);
      }
      monthRow.set(categoryName, (monthRow.get(categoryName) || 0) + amount);
      categoryTotals.set(
        categoryName,
        (categoryTotals.get(categoryName) || 0) + amount,
      );

      if (transaction.merchantName) {
        const merchant = merchantTotals.get(transaction.merchantName) ?? {
          amount: 0,
          count: 0,
          recurring: false,
        };
        merchant.amount += amount;
        merchant.count += 1;
        merchant.recurring = merchant.recurring || transaction.isRecurring;
        merchantTotals.set(transaction.merchantName, merchant);
      }
    }

    return {
      heatmap: Array.from(heatmap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([rawDate, categories]) => ({
          month: monthLabel(rawDate),
          rawDate,
          categories: Array.from(categories.entries()).map(
            ([category, amount]) => ({ category, amount }),
          ),
        })),
      categoryTotals: Array.from(categoryTotals.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
      topMerchants: Array.from(merchantTotals.entries())
        .map(([merchant, data]) => ({ merchant, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 20),
    };
  }),

  getCommitments: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transactions = await db.query.financialTransaction.findMany({
      where: and(
        eq(dbSchema.financialTransaction.userId, user.id),
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
    });

    const byMonth = new Map<
      string,
      { committed: number; discretionary: number; total: number }
    >();

    for (const transaction of transactions) {
      if (transaction.direction !== "debit") continue;
      const amount = numericToNumber(transaction.amount);
      const key = monthKey(new Date(transaction.transactionDate));
      const month = byMonth.get(key) ?? {
        committed: 0,
        discretionary: 0,
        total: 0,
      };
      month.total += amount;
      const isCommitted =
        transaction.isEmi ||
        transaction.isRecurring ||
        transaction.transactionType === "insurance" ||
        transaction.transactionType === "loan_payment";
      if (isCommitted) {
        month.committed += amount;
      } else {
        month.discretionary += amount;
      }
      byMonth.set(key, month);
    }

    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rawDate, m]) => ({
        month: monthLabel(rawDate),
        rawDate,
        committed: m.committed,
        discretionary: m.discretionary,
        total: m.total,
        committedRatio: m.total > 0 ? m.committed / m.total : 0,
      }));
  }),

  getIncomeSavings: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transactions = await db.query.financialTransaction.findMany({
      where: and(
        eq(dbSchema.financialTransaction.userId, user.id),
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
    });
    const incomes = await db.query.income.findMany({
      where: eq(dbSchema.income.userId, user.id),
      with: { source: true },
    });

    const byMonth = new Map<string, { income: number; expense: number }>();
    const sources = new Map<string, number>();

    for (const transaction of transactions) {
      if (transaction.transactionType === "transfer") continue;
      const key = monthKey(new Date(transaction.transactionDate));
      const month = byMonth.get(key) ?? { income: 0, expense: 0 };
      const amount = numericToNumber(transaction.amount);
      if (
        transaction.direction === "credit" &&
        transaction.transactionType === "income"
      ) {
        month.income += amount;
      } else if (transaction.direction === "debit") {
        month.expense += amount;
      }
      byMonth.set(key, month);
    }

    for (const income of incomes) {
      sources.set(
        income.source?.name ?? "unknown",
        (sources.get(income.source?.name ?? "unknown") || 0) + 1,
      );
    }

    return {
      monthly: Array.from(byMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([rawDate, m]) => ({
          month: monthLabel(rawDate),
          rawDate,
          income: m.income,
          expense: m.expense,
          savingsRate: m.income > 0 ? (m.income - m.expense) / m.income : 0,
        })),
      incomeStreams: Array.from(sources.entries()).map(([source, count]) => ({
        source,
        count,
      })),
    };
  }),

  getLeakage: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transactions = await db.query.financialTransaction.findMany({
      where: and(
        eq(dbSchema.financialTransaction.userId, user.id),
        eq(dbSchema.financialTransaction.direction, "debit"),
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
      with: { linkedTransaction: true },
    });

    const leakage = {
      fee: 0,
      interest: 0,
      cashWithdrawal: 0,
      roundUp: 0,
      total: 0,
    };
    const pendingRefunds: Array<{ merchant: string | null; amount: number }> =
      [];

    for (const transaction of transactions) {
      const amount = numericToNumber(transaction.amount);
      if (transaction.transactionType === "fee") leakage.fee += amount;
      if (transaction.transactionType === "interest")
        leakage.interest += amount;
      if (transaction.transactionType === "cash_withdrawal")
        leakage.cashWithdrawal += amount;
      if (transaction.transactionType === "round_up") leakage.roundUp += amount;
      if (
        transaction.transactionType === "refund" &&
        !transaction.linkedTransaction
      ) {
        pendingRefunds.push({ merchant: transaction.merchantName, amount });
      }
    }
    leakage.total =
      leakage.fee + leakage.interest + leakage.cashWithdrawal + leakage.roundUp;

    return { leakage, pendingRefunds };
  }),

  getInvestments: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const investments = await db.query.investmentTransaction.findMany({
      where: eq(dbSchema.investmentTransaction.userId, user.id),
      with: { transaction: true, platform: true, investmentType: true },
    });

    const byMonth = new Map<string, { invested: number; value: number }>();

    for (const investment of investments) {
      const transaction = investment.transaction;
      const amount = numericToNumber(transaction.amount);
      const value =
        numericToNumber(investment.units) *
        numericToNumber(investment.unitPrice);
      const key = monthKey(new Date(transaction.transactionDate));
      const month = byMonth.get(key) ?? { invested: 0, value: 0 };
      month.invested += amount;
      month.value += value;
      byMonth.set(key, month);
    }

    return {
      monthly: Array.from(byMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([rawDate, m]) => ({
          month: monthLabel(rawDate),
          rawDate,
          invested: m.invested,
          value: m.value,
        })),
      totalInvested: Array.from(byMonth.values()).reduce(
        (a, m) => a + m.invested,
        0,
      ),
      totalValue: Array.from(byMonth.values()).reduce((a, m) => a + m.value, 0),
    };
  }),

  getCrossCutting: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const budgets = await db.query.budget.findMany({
      where: eq(dbSchema.budget.userId, user.id),
    });

    const transactions = await db.query.financialTransaction.findMany({
      where: and(
        eq(dbSchema.financialTransaction.userId, user.id),
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
    });
    const statements = await db.query.statementUpload.findMany({
      where: eq(dbSchema.statementUpload.userId, user.id),
    });

    const monthlySpend = new Map<string, number>();
    const typeCounts = new Map<string, number>();
    for (const transaction of transactions) {
      const key = monthKey(new Date(transaction.transactionDate));
      if (
        transaction.direction === "debit" &&
        transaction.transactionType !== "transfer"
      ) {
        monthlySpend.set(
          key,
          (monthlySpend.get(key) || 0) + numericToNumber(transaction.amount),
        );
      }
      typeCounts.set(
        transaction.transactionType,
        (typeCounts.get(transaction.transactionType) || 0) + 1,
      );
    }

    const duplicatesByHash = new Map<string, number>();
    for (const transaction of transactions) {
      if (!transaction.transactionHash) continue;
      duplicatesByHash.set(
        transaction.transactionHash,
        (duplicatesByHash.get(transaction.transactionHash) || 0) + 1,
      );
    }

    const reviewCount = transactions.filter(
      (t) => numericToNumber(t.extractionConfidence) < 0.8 && !t.reviewedAt,
    ).length;

    return {
      budgets: budgets.map((budget) => ({
        ...budget,
        budgetAmount: numericToNumber(budget.budgetAmount),
        actualSpend:
          monthlySpend.get(monthKey(new Date(budget.startMonth))) ?? 0,
      })),
      monthlySpend: Array.from(monthlySpend.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([rawDate, amount]) => ({
          month: monthLabel(rawDate),
          rawDate,
          amount,
        })),
      dataQuality: {
        statements: statements.length,
        byModel: Array.from(
          new Map(
            statements.map((s) => [
              s.extractionModel ?? "unknown",
              s.extractionModel ?? "unknown",
            ]),
          ).keys(),
        ).map((model) => ({
          model,
          count: statements.filter((s) => s.extractionModel === model).length,
        })),
        reviewCount,
        reviewRate: transactions.length ? reviewCount / transactions.length : 0,
      },
      duplicateCount: Array.from(duplicatesByHash.values()).filter((n) => n > 1)
        .length,
      typeCounts: Array.from(typeCounts.entries()).map(([type, count]) => ({
        type,
        count,
      })),
    };
  }),
});
