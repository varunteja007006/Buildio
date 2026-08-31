import type { ReactNode } from "react";
import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Budget Details | ${appConfig.name}`,
  description:
    "View your budget progress, spending, and linked expenses.",
};

export default function BudgetDetailLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
