"use client";

import * as React from "react";

import { IncomeListTable, IncomeAnalyticsCard } from ".";

export function IncomeList() {
  return (
    <div className="space-y-6">
      <IncomeAnalyticsCard />
      <IncomeListTable />
    </div>
  );
}
