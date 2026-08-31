import type { ReactNode } from "react";
import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Income Sources | ${appConfig.name}`,
  description: "Manage the sources of your income.",
};

export default function IncomeSourcesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
