import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";
import { Hero } from "@/components/landing/hero";

export const metadata: Metadata = {
  title: appConfig.name,
  description:
    "Track your expenses, income, and budgets in one simple, private ledger. Free forever, no credit card required.",
};

export default function Page() {
  return <Hero />;
}
