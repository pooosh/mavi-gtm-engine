export type UserRole = "customer" | "candidate" | "operator";
export type TrialHealth = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
export type PulseRating = "GREEN" | "YELLOW" | "RED";
export type AccessStatus = "PROVISIONED" | "PENDING" | "BLOCKED";
export const ACCESS_ATTENTION_HOURS = 24;
export const ACCESS_SLA_WARNING_HOURS = 36;

export interface TrialTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface TrialAccess {
  id: string;
  name: string;
  category: "ERP" | "FINTECH" | "COMMUNICATION" | "SECURITY";
  status: AccessStatus;
  updatedAtHoursAgo: number;
}

export interface TrialWorkspace {
  id: string;
  initialDay: number;
  client: {
    name: string;
    industry: string;
    erp: string;
    timezone: string;
    deliverable: string;
  };
  candidate: {
    handle: string;
    title: string;
    pedigree: string;
    overlap: string;
    tools: string[];
    hallucinationScore: number;
    auditSpeedup: number;
    challenge: string;
  };
  workspace: {
    region: string;
    clipboardDisabled: boolean;
    downloadsDisabled: boolean;
    slackStatus: "ACTIVE" | "PENDING" | "DISABLED";
    slackNudgeDispatched?: boolean;
  };
  access: TrialAccess[];
  customerTasks: { setup: TrialTask[]; delivery: TrialTask[]; close: TrialTask[] };
  candidateTasks: { setup: TrialTask[]; delivery: TrialTask[]; close: TrialTask[] };
  telemetry: {
    ttfvHours: number;
    sentiment: PulseRating | null;
    converted: boolean;
  };
  customerNotes: Array<{ id: string; category: string; note: string; day: number; resolved: boolean }>;
  candidateBlockers: Array<{ id: string; tool: string; issue: string; day: number; resolved: boolean }>;
  escalations: Array<{ id: string; message: string; source: "ACCESS" | "CUSTOMER" | "CANDIDATE"; day: number; resolved: boolean }>;
  interventions: Array<{ id: string; message: string; day: number }>;
}

export const trialTemplates: TrialWorkspace[] = [
  {
    id: "athena",
    initialDay: 2,
    client: {
      name: "Athena Club",
      industry: "D2C · Personal care",
      erp: "NetSuite",
      timezone: "US Eastern",
      deliverable: "Clean up the Shopify sales sheet and reconcile it to NetSuite.",
    },
    candidate: {
      handle: "Candidate M-402",
      title: "Senior Inventory & Revenue Accountant",
      pedigree: "Ex-PwC Audit Senior · 4 yrs",
      overlap: "5 hrs/day · 9:00 AM–2:00 PM ET",
      tools: ["NetSuite", "Ramp", "Shopify", "Excel"],
      hallucinationScore: 96,
      auditSpeedup: 3.4,
      challenge: "Flagged a mismatch between channel return quantities and the NetSuite inventory reconciliation in a synthetic export.",
    },
    workspace: {
      region: "US-East",
      clipboardDisabled: true,
      downloadsDisabled: true,
      slackStatus: "ACTIVE",
      slackNudgeDispatched: false,
    },
    access: [
      { id: "netsuite", name: "NetSuite · read-only role", category: "ERP", status: "PROVISIONED", updatedAtHoursAgo: 8 },
      { id: "ramp", name: "Ramp · approver access", category: "FINTECH", status: "PENDING", updatedAtHoursAgo: 28 },
      { id: "slack", name: "Slack · connect channel", category: "COMMUNICATION", status: "PROVISIONED", updatedAtHoursAgo: 12 },
      { id: "workspace", name: "Secure workspace", category: "SECURITY", status: "PROVISIONED", updatedAtHoursAgo: 24 },
    ],
    customerTasks: {
      setup: [
        { id: "workspace-ready", label: "Review secure workspace protocols", completed: true },
        { id: "erp-access", label: "Provision NetSuite read-only seat", completed: true },
        { id: "expense-access", label: "Confirm Ramp approver access", completed: false },
        { id: "slack-invite", label: "Invite candidate to #finance-temp Slack channel", completed: true },
      ],
      delivery: [
        { id: "share-shopify-export", label: "Share the Shopify sales export and source notes", completed: false },
        { id: "answer-data-questions", label: "Answer candidate questions about the source data", completed: false },
        { id: "review-first-work", label: "Review the first reconciliation with MAVI", completed: false },
      ],
      close: [
        { id: "final-review", label: "Review the completed Shopify reconciliation", completed: false },
        { id: "hire-decision", label: "Decide whether to hire the candidate", completed: false },
      ],
    },
    candidateTasks: {
      setup: [
        { id: "connect-workspace", label: "Connect to the US-East virtual desktop", completed: true },
        { id: "authenticate-netsuite", label: "Authenticate NetSuite SSO access", completed: true },
        { id: "confirm-ramp", label: "Confirm Ramp approver access", completed: false },
        { id: "review-shopify-ledger", label: "Review the Chart of Accounts and Q3 Shopify ledger", completed: true },
      ],
      delivery: [
        { id: "shopify-cleanup", label: "Clean the Shopify sales spreadsheet", completed: false },
        { id: "netsuite-reconcile", label: "Reconcile totals to the NetSuite ledger", completed: false },
        { id: "findings-summary", label: "Summarize exceptions for the finance lead", completed: false },
      ],
      close: [
        { id: "prepare-handoff", label: "Prepare workpapers and handoff notes", completed: false },
        { id: "walkthrough", label: "Walk through findings with the finance lead", completed: false },
      ],
    },
    telemetry: { ttfvHours: 50.4, sentiment: null, converted: false },
    customerNotes: [],
    candidateBlockers: [],
    escalations: [
      { id: "access-ramp", message: "Ramp approver access pending for 28 hours", source: "ACCESS", day: 2, resolved: false },
    ],
    interventions: [],
  },
  {
    id: "tracedata",
    initialDay: 4,
    client: {
      name: "TraceData Systems",
      industry: "B2B SaaS · Data infrastructure",
      erp: "QuickBooks Online",
      timezone: "US Pacific",
      deliverable: "Reconcile Stripe MRR and prepare a sample ASC 606 revenue schedule.",
    },
    candidate: {
      handle: "Candidate S-109",
      title: "Senior Revenue Accountant",
      pedigree: "Ex-Deloitte Advisory · 3.5 yrs",
      overlap: "5 hrs/day · 9:00 AM–2:00 PM PT",
      tools: ["QuickBooks", "Stripe", "Maxio", "Excel"],
      hallucinationScore: 94,
      auditSpeedup: 3.1,
      challenge: "Flagged a 14-month amortization error in a synthetic ASC 606 revenue schedule.",
    },
    workspace: {
      region: "US-West",
      clipboardDisabled: true,
      downloadsDisabled: true,
      slackStatus: "PENDING",
    },
    access: [
      { id: "quickbooks", name: "QuickBooks Online · accountant access", category: "ERP", status: "PROVISIONED", updatedAtHoursAgo: 8 },
      { id: "stripe", name: "Stripe · read-only access", category: "FINTECH", status: "PENDING", updatedAtHoursAgo: 76 },
      { id: "slack", name: "Slack · connect channel", category: "COMMUNICATION", status: "PENDING", updatedAtHoursAgo: 12 },
      { id: "workspace", name: "Secure workspace", category: "SECURITY", status: "PROVISIONED", updatedAtHoursAgo: 20 },
    ],
    customerTasks: {
      setup: [
        { id: "workspace-ready", label: "Review secure workspace protocols", completed: true },
        { id: "erp-access", label: "Provision QuickBooks accountant seat", completed: true },
        { id: "stripe-access", label: "Grant Stripe read-only access", completed: false },
        { id: "slack-invite", label: "Invite candidate to the finance Slack channel", completed: false },
      ],
      delivery: [
        { id: "share-billing-export", label: "Share the Stripe billing export and source notes", completed: false },
        { id: "answer-data-questions", label: "Answer candidate questions about billing data", completed: false },
        { id: "review-first-work", label: "Review the first revenue reconciliation with MAVI", completed: false },
      ],
      close: [
        { id: "preclose", label: "Prepare the pre-close trial balance", completed: false },
        { id: "working-papers", label: "Complete working papers sign-off", completed: false },
      ],
    },
    candidateTasks: {
      setup: [
        { id: "connect-workspace", label: "Connect to the US-West virtual workspace", completed: true },
        { id: "authenticate-quickbooks", label: "Authenticate QuickBooks access", completed: true },
        { id: "confirm-stripe", label: "Confirm Stripe read-only access", completed: false },
        { id: "review-mrr-process", label: "Review the MRR close process", completed: true },
      ],
      delivery: [
        { id: "mrr-reconcile", label: "Reconcile Stripe MRR to QuickBooks", completed: false },
        { id: "revenue-schedule", label: "Prepare the ASC 606 revenue schedule", completed: false },
        { id: "findings-summary", label: "Summarize exceptions for the finance lead", completed: false },
      ],
      close: [
        { id: "prepare-handoff", label: "Prepare workpapers and handoff notes", completed: false },
        { id: "walkthrough", label: "Walk through findings with the finance lead", completed: false },
      ],
    },
    telemetry: { ttfvHours: 76, sentiment: null, converted: false },
    customerNotes: [],
    candidateBlockers: [],
    escalations: [
      { id: "access-stripe", message: "Stripe read-only access pending for 76 hours", source: "ACCESS", day: 4, resolved: false },
    ],
    interventions: [],
  },
  {
    id: "graza",
    initialDay: 3,
    client: {
      name: "Graza",
      industry: "D2C · Packaged goods",
      erp: "Shopify / QuickBooks",
      timezone: "US Eastern",
      deliverable: "Reconcile Shopify Q3 payouts with Chase merchant deposits.",
    },
    candidate: {
      handle: "Candidate G-204",
      title: "Senior E-Commerce Accountant",
      pedigree: "Ex-KPMG Senior Associate · 3 yrs",
      overlap: "5 hrs/day · 9:00 AM–2:00 PM ET",
      tools: ["Shopify", "Chase", "QuickBooks", "Excel"],
      hallucinationScore: 95,
      auditSpeedup: 3.2,
      challenge: "Identified $18,400 in unrecorded 2-day merchant transit reserves in a synthetic batch payout.",
    },
    workspace: {
      region: "US-East",
      clipboardDisabled: true,
      downloadsDisabled: true,
      slackStatus: "ACTIVE",
    },
    access: [
      { id: "quickbooks", name: "QuickBooks Online · accountant", category: "ERP", status: "PROVISIONED", updatedAtHoursAgo: 12 },
      { id: "shopify-export", name: "Shopify · raw sales ledger export", category: "FINTECH", status: "PENDING", updatedAtHoursAgo: 42 },
      { id: "chase", name: "Chase Business · statements", category: "FINTECH", status: "PROVISIONED", updatedAtHoursAgo: 16 },
      { id: "workspace", name: "Secure workspace", category: "SECURITY", status: "PROVISIONED", updatedAtHoursAgo: 30 },
    ],
    customerTasks: {
      setup: [
        { id: "workspace-ready", label: "Review secure workspace protocols", completed: true },
        { id: "quickbooks-access", label: "Grant QuickBooks accountant seat", completed: true },
        { id: "export-data", label: "Authorize Shopify raw sales CSV export", completed: false },
        { id: "slack-invite", label: "Invite candidate to #finance-temp channel", completed: true },
      ],
      delivery: [
        { id: "deposit-review", label: "Review merchant deposit ledger", completed: false },
        { id: "transit-check", label: "Verify merchant transit reserve entries", completed: false },
        { id: "payout-approval", label: "Sign off on Q3 reconciliation draft", completed: false },
      ],
      close: [
        { id: "close-review", label: "Review final reconciliation workpapers", completed: false },
        { id: "hire-decision", label: "Decide on talent retention agreement", completed: false },
      ],
    },
    candidateTasks: {
      setup: [
        { id: "connect-workspace", label: "Connect to the US-East workspace", completed: true },
        { id: "auth-quickbooks", label: "Authenticate QuickBooks access", completed: true },
        { id: "confirm-shopify", label: "Confirm Shopify raw sales data", completed: false },
        { id: "review-chart", label: "Review Chart of Accounts", completed: true },
      ],
      delivery: [
        { id: "reconcile-chase", label: "Reconcile Chase deposits to Shopify payouts", completed: false },
        { id: "flag-transit", label: "Audit 2-day transit reserves", completed: false },
        { id: "summary-memo", label: "Prepare findings memo for controller", completed: false },
      ],
      close: [
        { id: "handoff-notes", label: "Document procedure notes", completed: false },
        { id: "walkthrough", label: "Walk through reconciliation with CFO", completed: false },
      ],
    },
    telemetry: { ttfvHours: 64, sentiment: null, converted: false },
    customerNotes: [],
    candidateBlockers: [
      { id: "shopify-data-missing", tool: "Shopify", issue: "Awaiting client controller authorization for raw order CSV export", day: 3, resolved: false },
    ],
    escalations: [
      { id: "access-shopify-export", message: "Shopify sales ledger withheld pending controller approval (42h waiting)", source: "ACCESS", day: 3, resolved: false },
      { id: "blocker-shopify-data", message: "Candidate idle for 14 hours; client controller is OOO today", source: "CANDIDATE", day: 3, resolved: false },
    ],
    interventions: [],
  },
  {
    id: "hex",
    initialDay: 4,
    client: {
      name: "Hex",
      industry: "B2B SaaS · Analytics",
      erp: "NetSuite",
      timezone: "US Pacific",
      deliverable: "Synthesize NetSuite billing schedules into ASC 606 revenue recognition.",
    },
    candidate: {
      handle: "Candidate H-311",
      title: "Technical Revenue Accountant",
      pedigree: "Ex-EY Tech Practice · 4 yrs",
      overlap: "5 hrs/day · 9:00 AM–2:00 PM PT",
      tools: ["NetSuite", "Snowflake", "Stripe", "Excel"],
      hallucinationScore: 97,
      auditSpeedup: 3.6,
      challenge: "Calculated multi-element contract allocation across usage-based tiered ARR.",
    },
    workspace: {
      region: "US-West",
      clipboardDisabled: true,
      downloadsDisabled: true,
      slackStatus: "ACTIVE",
    },
    access: [
      { id: "netsuite", name: "NetSuite · read-only role", category: "ERP", status: "PROVISIONED", updatedAtHoursAgo: 10 },
      { id: "snowflake-sso", name: "Snowflake · warehouse access", category: "SECURITY", status: "PENDING", updatedAtHoursAgo: 18 },
      { id: "slack", name: "Slack · connect channel", category: "COMMUNICATION", status: "PROVISIONED", updatedAtHoursAgo: 24 },
      { id: "workspace", name: "Secure workspace", category: "SECURITY", status: "PROVISIONED", updatedAtHoursAgo: 20 },
    ],
    customerTasks: {
      setup: [
        { id: "workspace-ready", label: "Review secure workspace protocols", completed: true },
        { id: "netsuite-sso", label: "Grant NetSuite read-only access", completed: true },
        { id: "snowflake-ticket", label: "Approve Snowflake IT access ticket", completed: false },
        { id: "slack-invite", label: "Add candidate to #rev-ops Slack", completed: true },
      ],
      delivery: [
        { id: "share-contracts", label: "Provide enterprise contract sample set", completed: true },
        { id: "review-allocations", label: "Review ASC 606 allocation schedule", completed: false },
        { id: "first-work-check", label: "Confirm draft revenue waterfall", completed: false },
      ],
      close: [
        { id: "audit-memo", label: "Review ASC 606 technical position memo", completed: false },
        { id: "hire-decision", label: "Decide whether to hire candidate", completed: false },
      ],
    },
    candidateTasks: {
      setup: [
        { id: "connect-workspace", label: "Connect to US-West workspace", completed: true },
        { id: "auth-netsuite", label: "Authenticate NetSuite SSO", completed: true },
        { id: "confirm-snowflake", label: "Confirm Snowflake warehouse access", completed: false },
        { id: "review-schedules", label: "Review billing schedules", completed: true },
      ],
      delivery: [
        { id: "waterfall-draft", label: "Build ASC 606 revenue waterfall", completed: false },
        { id: "multi-element-audit", label: "Audit multi-element contract allocations", completed: false },
        { id: "memo-summary", label: "Draft technical accounting memo", completed: false },
      ],
      close: [
        { id: "handoff-workpapers", label: "Prepare workpapers for auditor sign-off", completed: false },
        { id: "walkthrough", label: "Walk through waterfall with VP Finance", completed: false },
      ],
    },
    telemetry: { ttfvHours: 38, sentiment: null, converted: false },
    customerNotes: [],
    candidateBlockers: [],
    escalations: [
      { id: "access-snowflake", message: "Snowflake SSO pending IT provisioning ticket #4091 (18h elapsed)", source: "ACCESS", day: 4, resolved: false },
    ],
    interventions: [],
  },
  {
    id: "feastables",
    initialDay: 5,
    client: {
      name: "Feastables",
      industry: "CPG · Food & Confectionery",
      erp: "NetSuite",
      timezone: "US Central",
      deliverable: "Deliver 3-way match audit between EDI purchase orders and bill receipts.",
    },
    candidate: {
      handle: "Candidate F-108",
      title: "Cost & Inventory Accountant",
      pedigree: "Ex-Grant Thornton · 3 yrs",
      overlap: "5 hrs/day · 8:30 AM–1:30 PM CT",
      tools: ["NetSuite", "SPS Commerce", "Ramp", "Excel"],
      hallucinationScore: 98,
      auditSpeedup: 3.8,
      challenge: "Reconciled distributor freight variance to bill-of-lading records.",
    },
    workspace: {
      region: "US-East",
      clipboardDisabled: true,
      downloadsDisabled: true,
      slackStatus: "ACTIVE",
    },
    access: [
      { id: "netsuite", name: "NetSuite · inventory role", category: "ERP", status: "PROVISIONED", updatedAtHoursAgo: 4 },
      { id: "sps-edi", name: "SPS Commerce · EDI portal", category: "FINTECH", status: "PROVISIONED", updatedAtHoursAgo: 8 },
      { id: "ramp", name: "Ramp · expense viewer", category: "FINTECH", status: "PROVISIONED", updatedAtHoursAgo: 6 },
      { id: "workspace", name: "Secure workspace", category: "SECURITY", status: "PROVISIONED", updatedAtHoursAgo: 24 },
    ],
    customerTasks: {
      setup: [
        { id: "workspace-ready", label: "Review secure workspace protocols", completed: true },
        { id: "netsuite-access", label: "Provision NetSuite inventory seat", completed: true },
        { id: "edi-access", label: "Provision SPS Commerce read-only login", completed: true },
        { id: "slack-invite", label: "Invite candidate to #cpg-finance channel", completed: true },
      ],
      delivery: [
        { id: "share-edi-logs", label: "Share SPS EDI batch run receipts", completed: true },
        { id: "review-variances", label: "Review freight variance exceptions", completed: false },
        { id: "match-approval", label: "Sign off on 3-way match exceptions", completed: false },
      ],
      close: [
        { id: "final-match-pack", label: "Review audit-ready 3-way match package", completed: false },
        { id: "hire-decision", label: "Confirm retainer conversion", completed: false },
      ],
    },
    candidateTasks: {
      setup: [
        { id: "connect-workspace", label: "Connect to US-East desktop", completed: true },
        { id: "auth-netsuite", label: "Authenticate NetSuite credentials", completed: true },
        { id: "auth-edi", label: "Verify EDI batch connection", completed: true },
        { id: "confirm-ramp", label: "Verify Ramp access", completed: true },
      ],
      delivery: [
        { id: "edi-po-audit", label: "Audit PO line items against EDI receipts", completed: true },
        { id: "freight-variance", label: "Reconcile distributor freight billings", completed: false },
        { id: "match-summary", label: "Assemble exception schedule", completed: false },
      ],
      close: [
        { id: "workpapers", label: "Assemble audit workpapers", completed: false },
        { id: "finance-review", label: "Present findings to Controller", completed: false },
      ],
    },
    telemetry: { ttfvHours: 28.5, sentiment: null, converted: false },
    customerNotes: [],
    candidateBlockers: [],
    escalations: [],
    interventions: [],
  },
];

export function getTrialHealth(trial: TrialWorkspace): TrialHealth {
  const overdueAccess = trial.access.some(
    (item) => item.status !== "PROVISIONED" && item.updatedAtHoursAgo > ACCESS_ATTENTION_HOURS,
  );
  const slaWarning = trial.access.some(
    (item) => item.status !== "PROVISIONED" && item.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS,
  );
  const unresolvedEscalation = trial.escalations.some((item) => !item.resolved);
  const unresolvedBlocker = trial.candidateBlockers.some((blocker) => !blocker.resolved);
  const unresolvedReport = trial.customerNotes.some((note) => !note.resolved);

  if (slaWarning) return "OFF_TRACK";
  return overdueAccess || unresolvedEscalation || unresolvedBlocker || unresolvedReport ? "AT_RISK" : "ON_TRACK";
}

export function candidateTaskBlocker(trial: TrialWorkspace, taskId: string): string | null {
  const sourceTaskId = trial.id === "athena" ? "share-shopify-export" : "share-billing-export";
  const sourceReady = trial.customerTasks.delivery.some((task) => task.id === sourceTaskId && task.completed);
  const accessByTask: Record<string, string> = {
    "authenticate-netsuite": "netsuite",
    "authenticate-quickbooks": "quickbooks",
    "confirm-ramp": "ramp",
    "confirm-stripe": "stripe",
  };
  const accessId = accessByTask[taskId];
  const accessLabel = accessId === "netsuite" ? "NetSuite" : accessId === "quickbooks" ? "QuickBooks" : accessId;
  if (accessId && trial.access.some((item) => item.id === accessId && item.status !== "PROVISIONED")) return `Waiting on ${accessLabel} access`;
  if (["shopify-cleanup", "mrr-reconcile", "revenue-schedule"].includes(taskId) && !sourceReady) return "Waiting on customer source data";
  if (taskId === "netsuite-reconcile" && !trial.candidateTasks.delivery.some((task) => task.id === "shopify-cleanup" && task.completed)) return "Complete the Shopify cleanup first";
  if (taskId === "netsuite-reconcile" && trial.access.some((item) => item.id === "netsuite" && item.status !== "PROVISIONED")) return "Waiting on NetSuite access";
  if (taskId === "revenue-schedule" && !trial.candidateTasks.delivery.some((task) => task.id === "mrr-reconcile" && task.completed)) return "Reconcile Stripe MRR first";
  const summaryPrerequisite = trial.id === "athena" ? "netsuite-reconcile" : "revenue-schedule";
  if (taskId === "findings-summary" && !trial.candidateTasks.delivery.some((task) => task.id === summaryPrerequisite && task.completed)) return "Complete the reconciliation first";
  return null;
}

export interface TrialOSState {
  activeRole: UserRole;
  activeDay: number;
  trial: TrialWorkspace;
  accessBaseline: Record<string, number>;
  activity: Array<{ id: number; day: number; message: string }>;
}

function recordActivity(state: TrialOSState, message: string, day = state.activeDay) {
  return [...state.activity.slice(-99), { id: (state.activity.at(-1)?.id ?? 0) + 1, day, message }];
}

export type TrialAction =
  | { type: "role"; role: UserRole }
  | { type: "template"; id: string }
  | { type: "day"; day: number }
  | { type: "task"; phase: keyof TrialWorkspace["customerTasks"]; role: "customer" | "candidate"; id: string }
  | { type: "access"; id: string; status: AccessStatus }
  | { type: "pulse"; rating: PulseRating; note: string }
  | { type: "customer-note"; category: string; note: string }
  | { type: "candidate-blocker"; tool: string; issue: string }
  | { type: "operator-nudge"; message?: string; channel?: "slack" | "email" }
  | { type: "resolve-escalation"; id: string }
  | { type: "convert" }
  | { type: "reset" };

export function createInitialState(): TrialOSState {
  const trial = structuredClone(trialTemplates[0]);
  return { activeRole: "operator", activeDay: trial.initialDay, trial, accessBaseline: Object.fromEntries(trial.access.map((item) => [item.id, item.updatedAtHoursAgo])), activity: [{ id: 0, day: trial.initialDay, message: `${trial.client.name} illustrative trial opened` }] };
}

export function trialReducer(state: TrialOSState, action: TrialAction): TrialOSState {
  if (action.type === "role") return { ...state, activeRole: action.role };
  if (action.type === "template") {
    const template = trialTemplates.find((item) => item.id === action.id);
    if (!template) return state;
    const trial = structuredClone(template);
    return { ...state, activeDay: trial.initialDay, trial, accessBaseline: Object.fromEntries(trial.access.map((item) => [item.id, item.updatedAtHoursAgo])), activity: [{ id: 0, day: trial.initialDay, message: `${trial.client.name} illustrative trial opened` }] };
  }
  if (action.type === "reset") {
    const template = trialTemplates.find((item) => item.id === state.trial.id) ?? trialTemplates[0];
    const trial = structuredClone(template);
    return { ...state, activeDay: trial.initialDay, trial, accessBaseline: Object.fromEntries(trial.access.map((item) => [item.id, item.updatedAtHoursAgo])), activity: [{ id: 0, day: trial.initialDay, message: "Illustrative trial reset" }] };
  }
  if (action.type === "day") {
    const day = Math.max(1, Math.min(14, action.day));
    const access = state.trial.access.map((item) => ({
      ...item,
      updatedAtHoursAgo: item.status === "PROVISIONED" ? item.updatedAtHoursAgo : Math.max(0, (state.accessBaseline[item.id] ?? item.updatedAtHoursAgo) + (day - state.trial.initialDay) * 24),
    }));
    let escalations = [...state.trial.escalations];
    for (const item of access) {
      const id = `access-${item.id}`;
      const exists = escalations.some((entry) => entry.id === id);
      if (item.status !== "PROVISIONED" && item.updatedAtHoursAgo > ACCESS_ATTENTION_HOURS) {
        escalations = exists
          ? escalations.map((entry) => entry.id === id ? { ...entry, message: `${item.name} pending for ${item.updatedAtHoursAgo} hours`, day, resolved: false } : entry)
          : [...escalations, { id, message: `${item.name} pending for ${item.updatedAtHoursAgo} hours`, source: "ACCESS", day, resolved: false }];
      } else if (exists) {
        escalations = escalations.map((entry) => entry.id === id ? { ...entry, resolved: true } : entry);
      }
    }
    return { ...state, activeDay: day, trial: { ...state.trial, access, escalations }, activity: day === state.activeDay ? state.activity : recordActivity(state, `Demo moved to Day ${day}`, day) };
  }

  const trial = { ...state.trial };
  if (action.type === "task") {
    if (action.role === "candidate") {
      const candidateTask = trial.candidateTasks[action.phase].find((task) => task.id === action.id);
      if (candidateTask && !candidateTask.completed && candidateTaskBlocker(state.trial, action.id)) return state;
      trial.candidateTasks = {
        ...trial.candidateTasks,
        [action.phase]: trial.candidateTasks[action.phase].map((task) => task.id === action.id ? { ...task, completed: !task.completed } : task),
      };
    } else {
      if (action.id === "hire-decision" && state.activeDay < 12) return state;
      trial.customerTasks = {
        ...trial.customerTasks,
        [action.phase]: trial.customerTasks[action.phase].map((task) => task.id === action.id ? { ...task, completed: !task.completed } : task),
      };
      const accessTaskIds: Record<string, string> = { "expense-access": "ramp", "stripe-access": "stripe", "erp-access": state.trial.client.erp === "NetSuite" ? "netsuite" : "quickbooks", "slack-invite": "slack" };
      const accessId = accessTaskIds[action.id];
      if (accessId) {
        const task = trial.customerTasks[action.phase].find((item) => item.id === action.id);
        trial.access = trial.access.map((item) => item.id === accessId ? { ...item, status: task?.completed ? "PROVISIONED" : "PENDING" } : item);
        trial.escalations = trial.escalations.map((item) => item.id === `access-${accessId}` ? { ...item, resolved: task?.completed ?? item.resolved } : item);
        if (!task?.completed && accessId === "netsuite") {
          trial.candidateTasks.setup = trial.candidateTasks.setup.map((item) => item.id === "authenticate-netsuite" ? { ...item, completed: false } : item);
          trial.candidateTasks.delivery = trial.candidateTasks.delivery.map((item) => ["netsuite-reconcile", "findings-summary"].includes(item.id) ? { ...item, completed: false } : item);
        }
        if (!task?.completed && accessId === "stripe") {
          trial.candidateTasks.setup = trial.candidateTasks.setup.map((item) => item.id === "confirm-stripe" ? { ...item, completed: false } : item);
          trial.candidateTasks.delivery = trial.candidateTasks.delivery.map((item) => ["mrr-reconcile", "revenue-schedule", "findings-summary"].includes(item.id) ? { ...item, completed: false } : item);
        }
      }
      if (["share-shopify-export", "share-billing-export"].includes(action.id)) {
        const task = trial.customerTasks[action.phase].find((item) => item.id === action.id);
        if (!task?.completed) {
          const downstream = state.trial.id === "athena" ? ["shopify-cleanup", "netsuite-reconcile", "findings-summary"] : ["mrr-reconcile", "revenue-schedule", "findings-summary"];
          trial.candidateTasks.delivery = trial.candidateTasks.delivery.map((item) => downstream.includes(item.id) ? { ...item, completed: false } : item);
        }
      }
    }
  } else if (action.type === "access") {
    trial.access = trial.access.map((item) => item.id === action.id ? { ...item, status: action.status } : item);
    if (action.status === "PROVISIONED") {
      trial.escalations = trial.escalations.map((entry) => entry.id === `access-${action.id}` ? { ...entry, resolved: true } : entry);
      const taskId: Record<string, string> = {
        netsuite: "erp-access",
        ramp: "expense-access",
        quickbooks: "erp-access",
        stripe: "stripe-access",
        slack: "slack-invite",
      };
      trial.customerTasks = {
        ...trial.customerTasks,
        setup: trial.customerTasks.setup.map((task) => task.id === taskId[action.id] ? { ...task, completed: true } : task),
      };
    }
  } else if (action.type === "pulse") {
    trial.telemetry = { ...trial.telemetry, sentiment: action.rating };
    if (action.rating !== "GREEN" || action.note.trim()) {
      const id = `pulse-${Date.now()}`;
      const ratingLabel = action.rating === "RED" ? "Escalation required" : action.rating === "YELLOW" ? "Needs alignment" : "On track";
      trial.customerNotes = [...trial.customerNotes, { id, category: "Day 5 pulse", note: `${ratingLabel}${action.note.trim() ? ` · ${action.note.trim()}` : ""}`, day: state.activeDay, resolved: action.rating === "GREEN" }];
      if (action.rating !== "GREEN") trial.escalations = [...trial.escalations, { id, message: `Customer pulse: ${ratingLabel}`, source: "CUSTOMER", day: state.activeDay, resolved: false }];
    }
  } else if (action.type === "customer-note") {
    const id = `customer-${Date.now()}`;
    trial.customerNotes = [...trial.customerNotes, { id, category: action.category, note: action.note.trim(), day: state.activeDay, resolved: false }];
    trial.escalations = [...trial.escalations, { id: `report-${id}`, message: `Customer raised ${action.category.toLowerCase()} privately`, source: "CUSTOMER", day: state.activeDay, resolved: false }];
  } else if (action.type === "candidate-blocker") {
    const id = `blocker-${Date.now()}`;
    trial.candidateBlockers = [...trial.candidateBlockers, { id, tool: action.tool, issue: action.issue.trim(), day: state.activeDay, resolved: false }];
    trial.escalations = [...trial.escalations, { id, message: `Candidate blocked on ${action.tool}`, source: "CANDIDATE", day: state.activeDay, resolved: false }];
  } else if (action.type === "operator-nudge") {
    const msg =
      action.message ||
      (action.channel === "slack"
        ? "MAVI Trial Bot Block Kit nudge dispatched to #finance-athena"
        : "Automated SLA nudge sent to client");
    trial.interventions = [
      ...trial.interventions,
      { id: `intervention-${Date.now()}`, message: msg, day: state.activeDay },
    ];
    trial.workspace = { ...trial.workspace, slackNudgeDispatched: true };
  } else if (action.type === "resolve-escalation") {
    const noteId = action.id.startsWith("report-") ? action.id.slice("report-".length) : action.id;
    trial.escalations = trial.escalations.map((entry) => entry.id === action.id ? { ...entry, resolved: true } : entry);
    trial.customerNotes = trial.customerNotes.map((note) => note.id === noteId ? { ...note, resolved: true } : note);
    trial.candidateBlockers = trial.candidateBlockers.map((blocker) => blocker.id === action.id ? { ...blocker, resolved: true } : blocker);
    if (action.id.startsWith("access-")) {
      const accessId = action.id.slice("access-".length);
      trial.access = trial.access.map((item) => item.id === accessId ? { ...item, status: "PROVISIONED" } : item);
      const taskId: Record<string, string> = { netsuite: "erp-access", ramp: "expense-access", quickbooks: "erp-access", stripe: "stripe-access", slack: "slack-invite" };
      trial.customerTasks = {
        ...trial.customerTasks,
        setup: trial.customerTasks.setup.map((task) => task.id === taskId[accessId] ? { ...task, completed: true } : task),
      };
    }
  } else if (action.type === "convert") {
    trial.telemetry = { ...trial.telemetry, converted: true };
    trial.customerTasks = {
      ...trial.customerTasks,
      close: trial.customerTasks.close.map((task) => task.id === "hire-decision" ? { ...task, completed: true } : task),
    };
  }

  let message = "";
  if (action.type === "access") {
    const item = trial.access.find((entry) => entry.id === action.id);
    if (item) message = `${item.name}: ${action.status === "PROVISIONED" ? "access provided in demo" : "access pending"}`;
  } else if (action.type === "resolve-escalation") {
    const item = trial.access.find((entry) => action.id === `access-${entry.id}`);
    message = item ? `${item.name}: access provided in demo` : "Operator resolved a private report";
  } else if (action.type === "operator-nudge") message = "Slack follow-up simulated · no message sent";
  else if (action.type === "task") {
    const task = (action.role === "customer" ? trial.customerTasks : trial.candidateTasks)[action.phase].find((entry) => entry.id === action.id);
    if (task) message = `${action.role === "customer" ? "Customer" : "Candidate"} ${task.completed ? "completed" : "reopened"}: ${task.label}`;
  } else if (action.type === "candidate-blocker") message = "Candidate shared a private blocker with MAVI";
  else if (action.type === "customer-note") message = "Customer shared a private note with MAVI";
  else if (action.type === "pulse") message = "Customer submitted a trial progress pulse";
  else if (action.type === "convert") message = "Customer chose to hire in the illustrative demo";
  return { ...state, trial, activity: message ? recordActivity(state, message) : state.activity };
}
