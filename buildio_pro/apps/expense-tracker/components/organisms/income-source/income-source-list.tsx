"use client";

import * as React from "react";

import { IncomeSourceFormComponent } from "./income-source-form-dialog";
import { IncomeSourceAnalyticsCard } from "./income-source-analytics-card";
import { IncomeSourceListTable } from "./income-source-list-table";

export function IncomeSourceListComponent() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <IncomeSourceFormComponent mode="create" />
      </div>
      <div>
        <IncomeSourceListTable />
      </div>

      <div>
        <IncomeSourceAnalyticsCard />
      </div>
    </div>
  );
}
