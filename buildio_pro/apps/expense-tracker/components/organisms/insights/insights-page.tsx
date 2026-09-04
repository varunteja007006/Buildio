"use client";

import { CardIntelligenceCard } from "./card-intelligence-card";
import { CashFlowCard } from "./cash-flow-card";
import { CommitmentsCard } from "./commitments-card";
import { EmiSummaryCard } from "./emi-summary-card";
import { LeakageCard } from "./leakage-card";
import { SavingsRateCard } from "./savings-rate-card";

export function InsightsPage() {
  return (
    <div className="space-y-6">
      <CashFlowCard />
      <div className="grid gap-6 lg:grid-cols-2">
        <EmiSummaryCard />
        <CardIntelligenceCard />
        <SavingsRateCard />
        <CommitmentsCard />
      </div>
      <LeakageCard />
    </div>
  );
}
