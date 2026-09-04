"use client";

import * as React from "react";

import { TransactionsPageContent } from "./transactions/page-content";

export function TransactionsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-16 text-center text-muted-foreground">
          Loading transactions...
        </div>
      }
    >
      <TransactionsPageContent />
    </React.Suspense>
  );
}
