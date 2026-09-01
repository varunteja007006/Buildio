import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";
import { StatementsPage } from "@/components/pages/statements";

export const metadata: Metadata = {
  title: `Statements | ${appConfig.name}`,
  description: "Generate and review statements for your expenses and income.",
};

export default StatementsPage;
