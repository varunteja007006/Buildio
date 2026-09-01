import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";
import { InsightsPage } from "@/components/organisms/insights/insights-page";

export const metadata: Metadata = {
  title: `Insights | ${appConfig.name}`,
  description:
    "Understand your spending habits with charts, trends, and insights.",
};

export default InsightsPage;
