import type { ReactNode } from "react";
import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Create Expense Category | ${appConfig.name}`,
  description: "Add a new expense category to organize your spending.",
};

export default function CreateExpenseCategoryLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
