import { Metadata } from "next";
import type { ReactNode } from "react";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Expenses | ${appConfig.name}`,
  description: "Track and manage your expenses.",
};

export default function ExpensesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
