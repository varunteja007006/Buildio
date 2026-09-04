import { createTRPCRouter } from "../init";
import {
  getCashFlow,
  getCategoryAnalytics,
} from "./analytics.cashflow";
import {
  getCardIntelligence,
  getEmiSummary,
} from "./analytics.insights";
import {
  getInvestments,
  getCrossCutting,
} from "./analytics.portfolio";
import {
  getCommitments,
  getIncomeSavings,
  getLeakage,
} from "./analytics.spend";

export const analyticsRouter = createTRPCRouter({
  getEmiSummary,
  getCashFlow,
  getCardIntelligence,
  getCategoryAnalytics,
  getCommitments,
  getIncomeSavings,
  getLeakage,
  getInvestments,
  getCrossCutting,
});
