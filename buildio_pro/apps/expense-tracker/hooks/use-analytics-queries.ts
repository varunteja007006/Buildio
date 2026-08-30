"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc-client";

export function useEmiSummary() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getEmiSummary.queryOptions());
}

export function useCashFlow() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getCashFlow.queryOptions());
}

export function useCardIntelligence() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getCardIntelligence.queryOptions());
}

export function useCategoryAnalytics() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getCategoryAnalytics.queryOptions());
}

export function useCommitments() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getCommitments.queryOptions());
}

export function useIncomeSavings() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getIncomeSavings.queryOptions());
}

export function useLeakage() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getLeakage.queryOptions());
}

export function useInvestments() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getInvestments.queryOptions());
}

export function useCrossCutting() {
  const trpc = useTRPC();
  return useQuery(trpc.analytics.getCrossCutting.queryOptions());
}
