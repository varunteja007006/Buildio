"use client";

import * as React from "react";

import { IncomeListTable, IncomeAnalyticsCard, IncomeForm } from ".";

export function IncomeList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <IncomeForm mode="create" />
      </div>
      <IncomeAnalyticsCard />
      <IncomeListTable />
    </div>
  );
}
