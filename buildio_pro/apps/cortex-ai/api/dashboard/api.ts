import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type { DashboardResponse } from "./types";

/** Fetch aggregate dashboard stats and recent activity */
export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>(
    endpoints.dashboard.stats,
  );
  return data;
}
