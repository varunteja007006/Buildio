export const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  return new Date(parseInt(year!), parseInt(month!) - 1).toLocaleString(
    "default",
    { month: "short", year: "numeric" },
  );
};

export type StatementMetadata = {
  creditLimit?: number | null;
  availableCredit?: number | null;
  totalAmountDue?: number | null;
  minimumAmountDue?: number | null;
  paymentDueDate?: string | null;
  statementDate?: string | null;
  rewards?: { earned?: number | null; unit?: string | null } | null;
};
