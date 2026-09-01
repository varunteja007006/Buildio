import { Metadata } from "next";
import type { ReactNode } from "react";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Expense Categories | ${appConfig.name}`,
  description: "Organize your expenses with custom categories.",
};

export default function ExpenseCategoriesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
