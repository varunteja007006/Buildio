import { Metadata } from "next";
import React from "react";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Feedback | ${appConfig.name}`,
  description:
    "Share your feedback and suggestions to help improve Expense Tracker.",
};

export default function Page() {
  return <div>Page</div>;
}
