"use client";

import * as React from "react";

import {
  IncomeSourceAnalyticsCard,
  IncomeSourceListTable,
  IncomeSourceForm,
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
