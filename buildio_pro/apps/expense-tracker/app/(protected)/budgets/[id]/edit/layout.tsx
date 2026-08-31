import type { ReactNode } from "react";
import { Metadata } from "next";

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
