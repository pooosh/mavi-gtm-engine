/**
 * TypeSafe Jev System 1 Primitives & Decision Types
 * 
 * Jev is TypeSafe's flagship System One model. It returns typed judgments
 * and probabilities (Noul, Score, Choice) rather than generating unconstrained text.
 */

// 1. Noul Primitive (yes/no condition probability, 0 to 1)
export interface JevNoul {
  type: "noul";
  noul: number; // 0 = definitely no, 1 = definitely yes
}

// 2. Score Primitive (probability-weighted score across ordered levels)
export interface JevScore {
  type: "score";
  score: number; // probability-weighted value, normalized 0-100
  probabilities: Record<string, number>;
  confidence: number; // 0 to 1
  legend?: Record<string, string>;
}

// 3. Choice Primitive (one option selected from a closed set with distribution)
export interface JevChoice<T extends string = string> {
  type: "choice";
  choice: T;
  probabilities: Record<T, number>;
  confidence: number; // 0 to 1
}

// System One Action Primitives
export type RecommendedAction =
  | "DISPATCH_SLACK_NUDGE"
  | "REPLAN_OFFLINE_TASK"
  | "MONITOR_SCHEDULE";

// Account Snapshot passed into Jev Evaluation
export interface TrialAccountSnapshot {
  id: string;
  name: string;
  industry: string;
  day: number;
  candidateHandle: string;
  deliverable: string;
  pendingAccess: Array<{
    id: string;
    name: string;
    category: string;
    hoursElapsed: number;
    slaWarningHours: number;
  }>;
  unresolvedEscalations: Array<{
    id: string;
    message: string;
    source: "ACCESS" | "CUSTOMER" | "CANDIDATE";
  }>;
  ttfvHours: number;
  recentActivity?: string;
}

// Evaluated Account Triage result from Jev System 1
export interface JevAccountTriage {
  accountId: string;
  accountName: string;
  industry: string;
  day: number;
  // Core Jev Primitives:
  isCriticalBlocker: JevNoul;
  slaRiskScore: JevScore;
  recommendedAction: JevChoice<RecommendedAction>;
  // Derived metadata
  compositeRisk: number; // 0-100
  priorityRank: number; // 1 = highest urgency
  rationale: string;
  primaryBlocker?: string;
  actionSummary: string;
  suggestedTarget?: string;
  evaluatedAt: string;
  latencyMs: number;
}

// API Triage Request & Response
export interface TriageRequest {
  accounts?: TrialAccountSnapshot[];
}

export interface TriageResponse {
  results: Record<string, JevAccountTriage>;
  orderedAccountIds: string[];
  highestPriorityAccountId: string;
  evaluatedAt: string;
  latencyMs: number;
  isLiveJev: boolean;
  model: string;
  portfolioSummary: {
    totalAccounts: number;
    criticalCount: number;
    atRiskCount: number;
    onTrackCount: number;
    averageRiskScore: number;
  };
}

