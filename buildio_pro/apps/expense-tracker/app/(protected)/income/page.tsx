import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

import { IncomeList } from "@/components/organisms/income";

export const metadata: Metadata = {
  title: `Income | ${appConfig.name}`,
  description: "Track and manage your income.",
};

export default function IncomePage() {
  return <IncomeList />;
}
