"use client";

import * as React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import {
  IncomeSourceAnalyticsCard,
  IncomeSourceListTable,
  IncomeSourceForm,
} from ".";

export function IncomeSourceList() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="analytics" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="listing">Listing</TabsTrigger>
          </TabsList>
          <div>
            <IncomeSourceForm mode="create" />
          </div>
        </div>
        <TabsContent value="analytics">
          <IncomeSourceAnalyticsCard />
        </TabsContent>
        <TabsContent value="listing">
          <IncomeSourceListTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
