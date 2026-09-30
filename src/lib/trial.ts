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
    },
    access: [
      { id: "netsuite", name: "NetSuite · read-only role", category: "ERP", status: "PENDING", updatedAtHoursAgo: 28 },
      { id: "ramp", name: "Ramp · approver access", category: "FINTECH", status: "PROVISIONED", updatedAtHoursAgo: 12 },
      { id: "slack", name: "Slack · connect channel", category: "COMMUNICATION", status: "PROVISIONED", updatedAtHoursAgo: 8 },
      { id: "workspace", name: "Secure workspace", category: "SECURITY", status: "PROVISIONED", updatedAtHoursAgo: 24 },
    ],
    customerTasks: {
      setup: [
        { id: "workspace-ready", label: "Review secure workspace protocols", completed: true },
        { id: "erp-access", label: "Provision NetSuite read-only seat", completed: false },
        { id: "expense-access", label: "Confirm Ramp approver access", completed: true },
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
        { id: "authenticate-netsuite", label: "Authenticate NetSuite SSO access", completed: false },
        { id: "confirm-ramp", label: "Confirm Ramp approver access", completed: true },
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
      { id: "access-netsuite", message: "NetSuite read-only access pending for 28 hours", source: "ACCESS", day: 2, resolved: false },
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
  | { type: "operator-nudge"; message: string }
  | { type: "resolve-escalation"; id: string }
  | { type: "convert" }
  | { type: "reset" };

export function createInitialState(): TrialOSState {
  const trial = structuredClone(trialTemplates[0]);
  return { activeRole: "operator", activeDay: trial.initialDay, trial, accessBaseline: Object.fromEntries(trial.access.map((item) => [item.id, item.updatedAtHoursAgo])) };
}

export function trialReducer(state: TrialOSState, action: TrialAction): TrialOSState {
  if (action.type === "role") return { ...state, activeRole: action.role };
  if (action.type === "template") {
    const template = trialTemplates.find((item) => item.id === action.id);
    if (!template) return state;
    const trial = structuredClone(template);
    return { ...state, activeDay: trial.initialDay, trial, accessBaseline: Object.fromEntries(trial.access.map((item) => [item.id, item.updatedAtHoursAgo])) };
  }
  if (action.type === "reset") {
    const template = trialTemplates.find((item) => item.id === state.trial.id) ?? trialTemplates[0];
    const trial = structuredClone(template);
    return { ...state, activeDay: trial.initialDay, trial, accessBaseline: Object.fromEntries(trial.access.map((item) => [item.id, item.updatedAtHoursAgo])) };
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
    return { ...state, activeDay: day, trial: { ...state.trial, access, escalations } };
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
    trial.interventions = [...trial.interventions, { id: `intervention-${Date.now()}`, message: action.message, day: state.activeDay }];
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
  }

  trial.telemetry = { ...trial.telemetry };
  return { ...state, trial };
}
