import type { ReactNode } from "react";
import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Create Budget | ${appConfig.name}`,
  description:
    "Create a new budget to plan and track your spending for a period.",
};

export default function CreateBudgetLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
