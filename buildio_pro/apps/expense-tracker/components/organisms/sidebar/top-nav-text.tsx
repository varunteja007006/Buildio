"use client";

import React from "react";
import { usePathname } from "next/navigation";

const pageHeader = {
  settings: {
    title: "Settings",
    description: "Manage your account settings and preferences",
  },
  "income-source": {
    title: "Income Sources",
    description:
      "Manage your income sources like Salary, Freelance, Investments, etc.",
  },
  events: {
    title: "Events",
    description: "Track expenses across multiple months or budgets",
  },
  income: {
    title: "Income",
    description: "Track and manage all your income in one place",
  },
  expenses: {
    title: "Expenses",
    description: "Track and manage all your expenses in one place",
  },
  "expense-categories": {
    title: "Expense Categories",
    description:
      "Manage your expense categories like Groceries, Rent, Travel, etc.",
  },
  budgets: {
    title: "Budgets",
    description: "Manage your monthly and yearly budgets",
  },
  dashboard: {
    title: "Dashboard",
    description: "Overview of your financial activities",
  },
  default: {
    title: "",
    description: "",
  },
};

export default function TopNavText() {
  const pathname = usePathname();

  let activePage = "default";

  const keys = Object.keys(pageHeader);
  for (const key of keys) {
    if (pathname.startsWith(`/${key}`)) {
      activePage = key;
      break;
    }
  }

  return (
    <div>
      <h1 className="text-sm font-bold tracking-tight">
        {pageHeader[activePage]?.title}
      </h1>
      <p className="text-muted-foreground text-xs">
        {pageHeader[activePage]?.description}
      </p>
    </div>
  );
}
