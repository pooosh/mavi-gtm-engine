export type UserRole = "customer" | "candidate" | "operator";
export type TrialHealth = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
export type PulseRating = "GREEN" | "YELLOW" | "RED";
export type AccessStatus = "PROVISIONED" | "PENDING" | "BLOCKED";

export interface AISupervisionScorecard {
  hallucinationDetectionScore: number;
  auditSpeedupMultiplier: number;
  percentile: string;
  challengeName: string;
  challengeDescription: string;
}

export interface SecurityVMSpec {
  ipRegion: string;
  securityControlsIllustrative: boolean;
  clipboardDisabled: boolean;
  downloadDisabled: boolean;
  slackGuestStatus: "ACTIVE" | "PENDING" | "DISABLED";
  connectionStatus: "Connected" | "Disconnected" | "Connecting";
  latencyMs: number;
}

export interface CandidateDossier {
  handle: string;
  title: string;
  pedigree: string;
  timezoneOverlap: string;
  overlapWindow: string;
  softwareStack: string[];
  aiScorecard: AISupervisionScorecard;
  vmSpec: SecurityVMSpec;
}

export interface SystemAccessItem {
  id: string;
  name: string;
  category: "ERP" | "FINTECH" | "COMMUNICATION" | "SECURITY";
  status: AccessStatus;
  updatedAtHoursAgo: number;
  owner: "Candidate" | "Client IT";
  roleDescription?: string;
  connectionStatusText: "Connected" | "Pending" | "Blocked";
}

export interface MilestoneTask {
  id: string;
  label: string;
  completed: boolean;
  owner: "Client IT" | "Candidate" | "CFO";
  status: "active" | "pending" | "locked" | "completed";
  hoursElapsed?: number;
  blockedReason?: string;
}

export interface MilestonePhase {
  phaseNumber: 1 | 2 | 3;
  name: string;
  title: string;
  dayRange: string;
  status: "ACTIVE" | "LOCKED" | "COMPLETED";
  tasks: MilestoneTask[];
  deliverableSummary: string;
}

export interface AuditStreamEvent {
  id: string;
  timestamp: string;
  message: string;
  type?: "auth" | "sso" | "sla" | "webhook" | "nudge";
  system?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  industry: string;
  erpSystem: string;
  primaryDeliverable: string;
  targetTimezone: string;
}

export interface EscalationItem {
  id: string;
  badge: string;
  target: string;
  blocker: string;
  description: string;
  elapsedHours: number;
  resolved: boolean;
}

export interface TrialState {
  activeRole: UserRole;
  activeDay: number;
  totalDays: number;
  client: ClientProfile;
  candidate: CandidateDossier;
  systemAccess: SystemAccessItem[];
  phases: MilestonePhase[];
  auditStream: AuditStreamEvent[];
  escalation: EscalationItem;
  slaCapacityHours: number;
  slaWarningHours: number;
}

