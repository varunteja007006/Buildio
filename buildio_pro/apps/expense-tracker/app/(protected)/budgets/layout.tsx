import type { ReactNode } from "react";
import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Budgets | ${appConfig.name}`,
  description:
    "Create and track monthly budgets to stay on top of your spending.",
};

export default function BudgetsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
