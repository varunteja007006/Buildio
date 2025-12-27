"use client";

import * as React from "react";

import { IncomeAnalyticsCard } from "./income-analytics-card";
import { IncomeListTable } from "./income-list-table";

export function IncomeListComponent() {
  return (
    <div className="space-y-6">
      <IncomeAnalyticsCard />
      <IncomeListTable />
    </div>
  );
}
