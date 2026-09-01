import { Metadata } from "next";
import type { ReactNode } from "react";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Edit Budget | ${appConfig.name}`,
  description: "Update your budget's name, amount, and period.",
};

export default function EditBudgetLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
