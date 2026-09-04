export type ExpenseRecord = {
  id: string;
  name: string;
  date: Date;
  amount: number;
  category?: { name: string; id: string };
  budget?: { name: string; id: string };
  isRecurring: boolean;
};
