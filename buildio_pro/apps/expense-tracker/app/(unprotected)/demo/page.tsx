import { Metadata } from "next";

import React from "react";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Demo | ${appConfig.name}`,
  description:
    "Explore the Expense Tracker live demo and see how it can help you manage your money.",
};

export default function Page() {
  return <div>Page</div>;
}
