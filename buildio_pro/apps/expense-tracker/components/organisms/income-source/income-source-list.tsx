"use client";

import * as React from "react";

import {
  IncomeSourceAnalyticsCard,
  IncomeSourceForm,
  IncomeSourceListTable,
} from ".";

export function IncomeSourceList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <div>
          <IncomeSourceForm mode="create" />
        </div>
      </div>
      <IncomeSourceAnalyticsCard />
      <IncomeSourceListTable />
    </div>
  );
}
