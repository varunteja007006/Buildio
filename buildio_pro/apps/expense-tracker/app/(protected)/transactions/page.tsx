import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

import { TransactionsPage } from "@/components/pages/transactions";

export const metadata: Metadata = {
  title: `Transactions | ${appConfig.name}`,
  description: "Browse and manage all your income and expense transactions.",
};

export default TransactionsPage;
