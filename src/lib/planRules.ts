// src/lib/planRules.ts
import type { SubscriptionType } from "@/lib/authService";

export type AnalysisDepth = "BASIC" | "ADVANCED";
export type InterviewRealism = "SIMPLE" | "REALISTIC";

export interface PlanCapabilities {
  maxQuestions: number;
  maxFollowUpsPerQuestion: number;
  interviewDurationMinutes: number;

  // Outcome gating (the important part)
  showExactScores: boolean;
  showExactMatchPercentage: boolean;
  allowPdfDownload: boolean;

  // Processing depth
  analysisDepth: AnalysisDepth;
  interviewRealism: InterviewRealism;

  // Cost control
  allowMultipleLanguages: boolean;
}

export const PLAN_RULES: Record<SubscriptionType, PlanCapabilities> = {
  free: {
    maxQuestions: 5,
    maxFollowUpsPerQuestion: 1,
    interviewDurationMinutes: 6,

    showExactScores: false,
    showExactMatchPercentage: false,
    allowPdfDownload: false,

    analysisDepth: "BASIC",
    interviewRealism: "SIMPLE",

    allowMultipleLanguages: false,
  },

  premium: {
    maxQuestions: 15,
    maxFollowUpsPerQuestion: 3,
    interviewDurationMinutes: 15,

    showExactScores: true,
    showExactMatchPercentage: true,
    allowPdfDownload: true,

    analysisDepth: "ADVANCED",
    interviewRealism: "REALISTIC",

    allowMultipleLanguages: true,
  },
};

export function getUserPlan(userSubscription?: SubscriptionType | null): SubscriptionType {
  return userSubscription === "premium" ? "premium" : "free";
}

export function getCapabilities(userSubscription?: SubscriptionType | null): PlanCapabilities {
  const plan = getUserPlan(userSubscription);
  return PLAN_RULES[plan];
}
