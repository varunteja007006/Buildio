"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "./api";

/** Query key factory for the dashboard domain */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => ["dashboard", "stats"] as const,
};

/** Fetch aggregate dashboard stats and recent activity */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboard,
  });
}
