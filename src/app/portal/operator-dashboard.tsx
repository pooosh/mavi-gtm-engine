"use client";

import "./operator-dashboard.css";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  PanelLeft,
  PanelLeftClose,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch } from "react";
import { SlackMark } from "@/components/brand/slack-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlackSimulatorModal } from "@/components/modals/SlackSimulatorModal";
import {
  ACCESS_SLA_WARNING_HOURS,
  getTrialHealth,
  trialTemplates,
} from "@/lib/trial";
import type { TrialAction, TrialOSState, TrialWorkspace } from "@/lib/trial";
import type { JevAccountTriage, TriageResponse } from "@/types/jev";

type DashboardProps = {
  state: TrialOSState;
  dispatch: Dispatch<TrialAction>;
  onPreviewFollowup: (id: string) => void;
  onToast: (message: string) => void;
};

const milestones = [
  { id: "setup", title: "System setup", days: "Days 0–2" },
  { id: "delivery", title: "First work", days: "Days 3–7" },
  { id: "close", title: "Decision", days: "Days 8–14" },
] as const;

// Calibrated Jev fallback triage
const INITIAL_TRIAGE: Record<string, JevAccountTriage> = {
  graza: {
    accountId: "graza",
    accountName: "Graza",
    industry: "D2C · Packaged goods",
    day: 3,
    isCriticalBlocker: { type: "noul", noul: 0.91 },
    slaRiskScore: {
      type: "score",
      score: 88,
      probabilities: { "4": 0.88 },
      confidence: 0.94,
    },
    recommendedAction: {
      type: "choice",
      choice: "DISPATCH_SLACK_NUDGE",
      probabilities: {
        DISPATCH_SLACK_NUDGE: 0.92,
        REPLAN_OFFLINE_TASK: 0.05,
        MONITOR_SCHEDULE: 0.03,
      },
      confidence: 0.94,
    },
    compositeRisk: 89,
    priorityRank: 1,
    rationale:
      "Jev System 1: Client data export overdue by 42h. Candidate is idle; direct Slack ping to client controller is optimal unblocker.",
    primaryBlocker: "Shopify CSV export withheld (42h)",
    actionSummary: "Dispatch automated Slack nudge to Graza controller",
    suggestedTarget: "Shopify raw order ledger",
    evaluatedAt: new Date().toISOString(),
    latencyMs: 118,
  },
  athena: {
    accountId: "athena",
    accountName: "Athena Club",
    industry: "D2C · Personal care",
    day: 2,
    isCriticalBlocker: { type: "noul", noul: 0.84 },
    slaRiskScore: {
      type: "score",
      score: 82,
      probabilities: { "4": 0.82 },
      confidence: 0.91,
    },
    recommendedAction: {
      type: "choice",
      choice: "DISPATCH_SLACK_NUDGE",
      probabilities: {
        DISPATCH_SLACK_NUDGE: 0.89,
        REPLAN_OFFLINE_TASK: 0.07,
        MONITOR_SCHEDULE: 0.04,
      },
      confidence: 0.91,
    },
    compositeRisk: 86,
    priorityRank: 2,
    rationale:
      "Jev System 1: Ramp access exceeded 24h SLA. High probability of candidate idle time on Day 2 without operator nudge.",
    primaryBlocker: "Ramp approver access pending (28h)",
    actionSummary: "Dispatch contextual Slack nudge to Athena Club admin",
    suggestedTarget: "Ramp · approver access",
    evaluatedAt: new Date().toISOString(),
    latencyMs: 118,
  },
  tracedata: {
    accountId: "tracedata",
    accountName: "TraceData Systems",
    industry: "B2B SaaS · Data infrastructure",
    day: 4,
    isCriticalBlocker: { type: "noul", noul: 0.86 },
    slaRiskScore: {
      type: "score",
      score: 78,
      probabilities: { "3": 0.78 },
      confidence: 0.91,
    },
    recommendedAction: {
      type: "choice",
      choice: "DISPATCH_SLACK_NUDGE",
      probabilities: {
        DISPATCH_SLACK_NUDGE: 0.88,
        REPLAN_OFFLINE_TASK: 0.08,
        MONITOR_SCHEDULE: 0.04,
      },
      confidence: 0.91,
    },
    compositeRisk: 80,
    priorityRank: 3,
    rationale:
      "Jev System 1: Stripe read-only access pending for 76h. Urgent client intervention needed to avoid milestone cancellation.",
    primaryBlocker: "Stripe read-only access pending (76h)",
    actionSummary: "Dispatch urgent Slack nudge to TraceData CFO",
    suggestedTarget: "Stripe · read-only access",
    evaluatedAt: new Date().toISOString(),
    latencyMs: 118,
  },
  hex: {
    accountId: "hex",
    accountName: "Hex",
    industry: "B2B SaaS · Analytics",
    day: 4,
    isCriticalBlocker: { type: "noul", noul: 0.44 },
    slaRiskScore: {
      type: "score",
      score: 52,
      probabilities: { "2": 0.65 },
      confidence: 0.83,
    },
    recommendedAction: {
      type: "choice",
      choice: "REPLAN_OFFLINE_TASK",
      probabilities: {
        REPLAN_OFFLINE_TASK: 0.81,
        DISPATCH_SLACK_NUDGE: 0.13,
        MONITOR_SCHEDULE: 0.06,
      },
      confidence: 0.83,
    },
    compositeRisk: 50,
    priorityRank: 4,
    rationale:
      "Jev System 1: Snowflake SSO pending, but synthetic ASC 606 revenue schedule available. Re-routing candidate keeps velocity at 100%.",
    primaryBlocker: "Snowflake SSO pending IT ticket",
    actionSummary: "Re-sequence candidate to offline revenue schedule",
    suggestedTarget: "Snowflake · read-only warehouse",
    evaluatedAt: new Date().toISOString(),
    latencyMs: 118,
  },
  feastables: {
    accountId: "feastables",
    accountName: "Feastables",
    industry: "CPG · Food & Confectionery",
    day: 5,
    isCriticalBlocker: { type: "noul", noul: 0.08 },
    slaRiskScore: {
      type: "score",
      score: 14,
      probabilities: { "0": 0.88 },
      confidence: 0.96,
    },
    recommendedAction: {
      type: "choice",
      choice: "MONITOR_SCHEDULE",
      probabilities: {
        MONITOR_SCHEDULE: 0.92,
        DISPATCH_SLACK_NUDGE: 0.05,
        REPLAN_OFFLINE_TASK: 0.03,
      },
      confidence: 0.96,
    },
    compositeRisk: 12,
    priorityRank: 5,
    rationale:
      "Jev System 1: All access provisioned on schedule. EDI 3-way match draft delivered ahead of time.",
    primaryBlocker: "All systems provisioned",
    actionSummary: "Monitor schedule; all milestones healthy",
    suggestedTarget: "NetSuite & EDI",
    evaluatedAt: new Date().toISOString(),
    latencyMs: 118,
  },
};



// ─────────────────────────────────────────────────────────────────
// Pristine Company-Specific Bento Widgets
// ─────────────────────────────────────────────────────────────────

function CandidateTile({ trial }: { trial: TrialWorkspace }) {
  const workspace = trial.access.find((item) => item.id === "workspace");
  const initial = trial.candidate.handle.replace(/[^A-Z]/g, "").charAt(0) || trial.candidate.handle.charAt(0) || "M";

  return (
    <section className="bento-widget dossier-widget" aria-label="Candidate dossier">
      <div className="bento-widget-heading">
        <h2>Candidate dossier</h2>
        <span className="candidate-monogram">{initial}</span>
      </div>
      <h3>{trial.candidate.handle}</h3>
      <p>{trial.candidate.pedigree}</p>
      <div className="dossier-score">
        <span>AI review score</span>
        <strong className="tabular-nums">
          {trial.candidate.hallucinationScore}
          <small> / 100</small>
        </strong>
      </div>
      <span className="dossier-workspace">
        <ShieldCheck size={13} />
        Workspace {workspace?.status === "PROVISIONED" ? "ready" : "pending"} · simulated
      </span>
      <DialogTrigger asChild>
        <Button className="button-secondary" variant="outline">
          Inspect dossier <ArrowUpRight size={14} />
        </Button>
      </DialogTrigger>
    </section>
  );
}

function SlaWidget({ trial }: { trial: TrialWorkspace }) {
  const pending = trial.access.filter((item) => item.status !== "PROVISIONED");
  const elapsed = Math.max(0, ...pending.map((item) => item.updatedAtHoursAgo));
  const consumed = Math.round((elapsed / ACCESS_SLA_WARNING_HOURS) * 100);
  const breached = elapsed >= ACCESS_SLA_WARNING_HOURS;
  const tone = pending.length ? (breached ? "breached" : "pending") : "clear";
  const circumference = 2 * Math.PI * 42;
  return (
    <section className={`bento-widget sla-widget ${tone}`} aria-label="Access SLA capacity">
      <div className="bento-widget-heading">
        <h2>Access SLA</h2>
        <span className="tabular-nums">
          {elapsed}h / {ACCESS_SLA_WARNING_HOURS}h
        </span>
      </div>
      <div className="sla-dial" role="img" aria-label={`${consumed}% of access SLA consumed`}>
        <svg viewBox="0 0 104 104" aria-hidden="true">
          <circle className="sla-dial-track" cx="52" cy="52" r="42" />
          <circle
            className="sla-dial-progress"
            cx="52"
            cy="52"
            r="42"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - Math.min(consumed, 100) / 100)}
          />
        </svg>
        <div>
          <strong className="tabular-nums">{consumed}%</strong>
          <span>consumed</span>
        </div>
      </div>
      <p className="sla-deadline tabular-nums">
        {pending.length
          ? breached
            ? `${elapsed - ACCESS_SLA_WARNING_HOURS}h past SLA threshold`
            : `${ACCESS_SLA_WARNING_HOURS - elapsed}h until SLA threshold`
          : "All access provided"}
      </p>
      <div className="sla-ttfv">
        <span>First value · estimate</span>
        <b className="tabular-nums">{(trial.telemetry.ttfvHours / 24).toFixed(1)} days</b>
      </div>
    </section>
  );
}

function MilestoneWidget({
  state,
  dispatch,
  onPreviewFollowup,
}: Pick<DashboardProps, "state" | "dispatch" | "onPreviewFollowup">) {
  const { trial, activeDay } = state;
  const current = activeDay <= 2 ? 0 : activeDay <= 7 ? 1 : 2;
  const [inspected, setInspected] = useState<number | null>(null);
  const index = inspected ?? current;
  const phase = milestones[index];
  const customer = trial.customerTasks[phase.id];
  const candidate = trial.candidateTasks[phase.id];
  const ready = trial.access.filter((item) => item.status === "PROVISIONED").length;
  const complete =
    phase.id === "setup"
      ? ready
      : [...customer, ...candidate].filter((task) => task.completed).length;
  const total =
    phase.id === "setup"
      ? trial.access.length
      : customer.length + candidate.length;
  const previewDay =
    index === current ? activeDay : index === 0 ? 2 : index === 1 ? 3 : 8;
  function previewParticipant(role: "customer" | "candidate") {
    if (index !== current) dispatch({ type: "day", day: previewDay });
    dispatch({ type: "role", role });
  }
  return (
    <section className="bento-widget milestone-widget" aria-label="Milestone flight path">
      <div className="bento-widget-heading">
        <h2>Milestone flight path</h2>
        <span>Phase {current + 1} of 3</span>
      </div>
      <div className="milestone-tabs" aria-label="Inspect trial phase">
        {milestones.map((item, position) => (
          <button
            className={index === position ? "is-active" : ""}
            aria-pressed={index === position}
            key={item.id}
            onClick={() => setInspected(position)}
            type="button"
          >
            <span>{item.days}</span>
            <b>{item.title}</b>
            <small>{position === current ? "Active" : position > current ? "Upcoming" : "Earlier"}</small>
          </button>
        ))}
      </div>
      <div className="milestone-summary">
        <strong>
          {phase.id === "setup"
            ? "Access provisioning"
            : phase.id === "delivery"
            ? "First deliverable"
            : "Final review & hire decision"}
        </strong>
        <span className="tabular-nums">
          {complete} of {total} complete
        </span>
      </div>
      {phase.id === "setup" ? (
        <ul className="provisioning-list">
          {trial.access.map((item) => {
            const isReady = item.status === "PROVISIONED";
            const escalation = trial.escalations.find(
              (entry) => entry.id === `access-${item.id}` && !entry.resolved
            );
            return (
              <li key={item.id}>
                <span className={isReady ? "provisioning-ready" : "provisioning-pending"}>
                  {isReady ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                </span>
                <span>{item.name}</span>
                {isReady ? (
                  <small>Provided</small>
                ) : escalation ? (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Review ${item.name} access`}
                    onClick={() => onPreviewFollowup(escalation.id)}
                  >
                    Review
                  </Button>
                ) : (
                  <small>Awaiting customer</small>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="phase-deliverable">
          <p>
            {phase.id === "delivery"
              ? trial.client.deliverable
              : "Review the work, complete the handoff, and record the customer’s hiring decision."}
          </p>
          <ul>
            {candidate.map((task) => (
              <li key={task.id}>
                {task.completed ? <CheckCircle2 size={14} /> : <span className="unchecked-task" />}
                <span>{task.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="milestone-owners">
        <button
          type="button"
          aria-label={`Preview customer checklist on demo Day ${previewDay}: ${phase.title}`}
          onClick={() => previewParticipant("customer")}
        >
          <span>{index === current ? "Customer checklist" : `Customer · Day ${previewDay}`}</span>
          <b className="tabular-nums">
            {customer.filter((task) => task.completed).length}/{customer.length}
          </b>
          <ArrowUpRight size={13} />
        </button>
        <button
          type="button"
          aria-label={`Preview candidate checklist on demo Day ${previewDay}: ${phase.title}`}
          onClick={() => previewParticipant("candidate")}
        >
          <span>{index === current ? "Candidate checklist" : `Candidate · Day ${previewDay}`}</span>
          <b className="tabular-nums">
            {candidate.filter((task) => task.completed).length}/{candidate.length}
          </b>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </section>
  );
}

function ActivityWidget({ state }: { state: TrialOSState }) {
  return (
    <section className="bento-widget activity-widget" aria-label="Trial activity">
      <div className="bento-widget-heading">
        <h2>Trial activity</h2>
        <Badge variant="outline">Demo feed</Badge>
      </div>
      <p className="activity-helper">Actions from this shared trial, as they happen.</p>
      <ol className="trial-activity-list" aria-live="polite" aria-relevant="additions">
        {[...state.activity].reverse().map((item) => (
          <li key={item.id}>
            <span className="activity-point" />
            <span className="activity-day tabular-nums">Day {item.day}</span>
            <p>{item.message}</p>
          </li>
        ))}
      </ol>
      <div className="activity-integration">
        <SlackMark size={17} />
        <div>
          <b>MAVI Trial Bot</b>
          <span>Planned Slack integration · simulation only</span>
        </div>
        <Badge variant="outline">Preview</Badge>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Operator Component: Unified Layout with Slide-Out Accounts Panel
// ─────────────────────────────────────────────────────────────────

export function OperatorDashboard({
  state,
  dispatch,
  onPreviewFollowup,
  onToast,
}: DashboardProps) {
  const { trial } = state;
  const [profileOpen, setProfileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"hub" | "company">("hub");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Jev System 1 Triage data
  const [triageMap, setTriageMap] = useState<Record<string, JevAccountTriage>>(INITIAL_TRIAGE);
  const [evaluating, setEvaluating] = useState(false);
  const [latestLatency, setLatestLatency] = useState(118);

  // Portfolio workspaces state to dynamically reflect issues and resolutions across all accounts
  const [portfolioWorkspaces, setPortfolioWorkspaces] = useState<TrialWorkspace[]>(() =>
    structuredClone(trialTemplates)
  );

  // Sync active trial when modified
  useEffect(() => {
    setPortfolioWorkspaces((prev) =>
      prev.map((acc) => (acc.id === state.trial.id ? state.trial : acc))
    );
  }, [state.trial]);

  // Dedicated Slack Simulator modal
  const [slackModalOpen, setSlackModalOpen] = useState(false);
  const [activeSlackTriage, setActiveSlackTriage] = useState<JevAccountTriage | null>(null);

  // Company specific bento state
  const [selectedEscalationId, setSelectedEscalationId] = useState<string | null>(null);

  // Fetch real-time triage on mount
  useEffect(() => {
    async function loadTriage() {
      try {
        const res = await fetch("/api/triage");
        if (!res.ok) return;
        const data: TriageResponse = await res.json();
        if (data.results) {
          setTriageMap(data.results);
          setLatestLatency(data.latencyMs);
        }
      } catch {
        // Fallback initialized
      }
    }
    loadTriage();
  }, []);

  async function handleRefreshTriage() {
    setEvaluating(true);
    try {
      const snapshots = portfolioWorkspaces.map((acc) => {
        const pending = acc.access
          .filter((a) => a.status !== "PROVISIONED")
          .map((a) => ({
            id: a.id,
            name: a.name,
            category: a.category,
            hoursElapsed: a.updatedAtHoursAgo,
            slaWarningHours: 24,
          }));
        const escalations = acc.escalations
          .filter((e) => !e.resolved)
          .map((e) => ({
            id: e.id,
            message: e.message,
            source: e.source,
          }));
        return {
          id: acc.id,
          name: acc.client.name,
          industry: acc.client.industry,
          day: acc.initialDay,
          candidateHandle: acc.candidate.handle,
          deliverable: acc.client.deliverable,
          pendingAccess: pending,
          unresolvedEscalations: escalations,
          ttfvHours: acc.telemetry.ttfvHours,
          recentActivity: `${acc.candidate.handle} working in ${acc.client.name} trial`,
        };
      });

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: snapshots }),
      });
      if (res.ok) {
        const data: TriageResponse = await res.json();
        setTriageMap(data.results);
        setLatestLatency(data.latencyMs);
        onToast(`Jev evaluated all accounts in ${data.latencyMs}ms · System One`);
      }
    } catch {
      onToast("Fleet evaluation refreshed");
    } finally {
      setEvaluating(false);
    }
  }

  // Pre-calculate issue counts for all 5 accounts dynamically
  const accountsWithIssues = useMemo(() => {
    return portfolioWorkspaces
      .map((template) => {
        const openEscalations = template.escalations.filter((e) => !e.resolved);
        const pendingAccess = template.access.filter((a) => a.status !== "PROVISIONED");
        const issueCount = openEscalations.length + (pendingAccess.length > 0 ? 1 : 0);
        const triage = triageMap[template.id];
        const riskScore = triage?.slaRiskScore.score ?? (issueCount > 1 ? 85 : issueCount === 1 ? 75 : 15);

        return {
          template,
          issueCount,
          riskScore,
          triage,
        };
      })
      .sort((a, b) => {
        if (b.issueCount !== a.issueCount) return b.issueCount - a.issueCount;
        return b.riskScore - a.riskScore;
      });
  }, [portfolioWorkspaces, triageMap]);

  // Filter accounts by search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accountsWithIssues;
    const q = searchQuery.toLowerCase();
    return accountsWithIssues.filter(
      (acc) =>
        acc.template.client.name.toLowerCase().includes(q) ||
        acc.template.client.industry.toLowerCase().includes(q) ||
        acc.template.candidate.handle.toLowerCase().includes(q)
    );
  }, [accountsWithIssues, searchQuery]);

  // The highest priority account across the entire fleet — dynamically surfaced by Jev!
  const topCriticalAccount = accountsWithIssues[0] || {
    template: trialTemplates[0],
    issueCount: 0,
    riskScore: 12,
    triage: INITIAL_TRIAGE["athena"],
  };
  const topTriage =
    topCriticalAccount?.triage ||
    INITIAL_TRIAGE[topCriticalAccount?.template.id || "graza"] ||
    INITIAL_TRIAGE["graza"];

  // Handler to resolve an account's issue when Slack nudge is dispatched
  function handleDispatchNudge(accId: string) {
    // 1. Mark this account's issues as provisioned/resolved in portfolioWorkspaces
    setPortfolioWorkspaces((prev) =>
      prev.map((acc) => {
        if (acc.id !== accId) return acc;
        const updated = structuredClone(acc);
        updated.access = updated.access.map((item) => ({
          ...item,
          status: "PROVISIONED",
        }));
        updated.escalations = updated.escalations.map((e) => ({
          ...e,
          resolved: true,
        }));
        updated.candidateBlockers = updated.candidateBlockers.map((b) => ({
          ...b,
          resolved: true,
        }));
        updated.interventions.push({
          id: `intervention-${Date.now()}`,
          message: `Jev automated Slack nudge dispatched to #${accId} trial channel. Access unblocked.`,
          day: updated.initialDay,
        });
        return updated;
      })
    );

    // If currently viewing this account in company view, update global state
    if (state.trial.id === accId) {
      for (const item of state.trial.access) {
        if (item.status !== "PROVISIONED") {
          dispatch({ type: "access", id: item.id, status: "PROVISIONED" });
        }
      }
      for (const esc of state.trial.escalations) {
        if (!esc.resolved) {
          dispatch({ type: "resolve-escalation", id: esc.id });
        }
      }
    }

    // 2. Recalculate Jev's System 1 inference for this account to healthy
    const latency = Math.floor(112 + Math.random() * 15);
    setLatestLatency(latency);
    setTriageMap((prev) => ({
      ...prev,
      [accId]: {
        ...prev[accId],
        isCriticalBlocker: { type: "noul", noul: 0.04 },
        slaRiskScore: {
          type: "score",
          score: 12,
          probabilities: { "0": 0.95 },
          confidence: 0.96,
        },
        recommendedAction: {
          type: "choice",
          choice: "MONITOR_SCHEDULE",
          probabilities: {
            MONITOR_SCHEDULE: 0.95,
            DISPATCH_SLACK_NUDGE: 0.03,
            REPLAN_OFFLINE_TASK: 0.02,
          },
          confidence: 0.96,
        },
        compositeRisk: 12,
        priorityRank: 5,
        rationale: `Jev System 1: Automated Slack nudge successfully dispatched. All critical access provisioned; milestone delivery resumed.`,
        primaryBlocker: "All systems provisioned",
        actionSummary: "Monitor schedule; milestone delivery on track",
        evaluatedAt: new Date().toISOString(),
        latencyMs: latency,
      },
    }));

    onToast(`1-Click Slack nudge dispatched to #${accId} · Jev surfaced next priority`);
  }

  function openCompanyDashboard(companyId: string) {
    if (state.trial.id !== companyId) {
      dispatch({ type: "template", id: companyId });
    }
    setViewMode("company");
  }

  // Company bento helpers
  const openEscalations = trial.escalations.filter((item) => !item.resolved);
  const oldestAccess = trial.access
    .filter((item) => item.status !== "PROVISIONED")
    .sort((a, b) => b.updatedAtHoursAgo - a.updatedAtHoursAgo)[0];
  const activeEscalation =
    openEscalations.find((item) => item.id === selectedEscalationId) ??
    openEscalations.find((item) => item.id === `access-${oldestAccess?.id}`) ??
    openEscalations[0];
  const access =
    activeEscalation?.source === "ACCESS"
      ? trial.access.find((item) => activeEscalation.id === `access-${item.id}`)
      : undefined;
  const health = getTrialHealth(trial);
  const healthText =
    health === "OFF_TRACK" ? "Off track" : health === "AT_RISK" ? "At risk" : "On track";
  const noteId = activeEscalation?.id.replace(/^report-/, "");
  const privateNote =
    activeEscalation?.source === "CUSTOMER"
      ? trial.customerNotes.find((item) => item.id === noteId)?.note
      : trial.candidateBlockers.find((item) => item.id === activeEscalation?.id)?.issue;
  const risk = access && access.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS;

  const totalActionableAccounts = accountsWithIssues.filter(a => a.issueCount > 0).length;

  return (
    <Dialog open={profileOpen} onOpenChange={setProfileOpen} modal={false}>
      <div className="role-workspace">
        <div className={`operator-workspace-grid ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          {/* ── Collapsible Left Sidebar (Pushes Canvas Smoothly) ── */}
          <aside
            aria-label="Client accounts directory"
            className="operator-sidebar-wrap"
          >
            <div className="operator-sidebar-card">
              {sidebarCollapsed ? (
                /* Collapsed Rail (44px) */
                <div className="flex flex-col items-center py-3 px-1.5 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    title="See all accounts"
                    aria-label="See all accounts"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink)] hover:text-[var(--brand)] hover:bg-[var(--canvas)] transition-colors group relative cursor-pointer"
                  >
                    <PanelLeft size={16} />
                    <span className="sidebar-tooltip">See all accounts</span>
                  </button>

                  <div className="w-5 h-px bg-[var(--line)]" />

                  {/* Portfolio Hub Jump */}
                  <button
                    type="button"
                    onClick={() => setViewMode("hub")}
                    title="Portfolio Operations Hub"
                    aria-label="Portfolio Operations Hub"
                    className={`rail-monogram-btn ${viewMode === "hub" ? "is-active" : ""}`}
                  >
                    <LayoutDashboard size={14} />
                  </button>

                  {/* Monogram icons for each percolated account */}
                  {accountsWithIssues.map(({ template, issueCount }) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => openCompanyDashboard(template.id)}
                      title={`${template.client.name} (${issueCount > 0 ? `${issueCount} issues` : "Healthy"})`}
                      aria-label={`${template.client.name} (${issueCount > 0 ? `${issueCount} issues` : "Healthy"})`}
                      className={`rail-monogram-btn ${viewMode === "company" && trial.id === template.id ? "is-active" : ""}`}
                    >
                      <span>{template.client.name.charAt(0)}</span>
                      {issueCount > 0 && <span className="rail-issue-dot" />}
                    </button>
                  ))}
                </div>
              ) : (
                /* Uncollapsed Sidebar (276px) */
                <div className="p-3.5 flex flex-col gap-3 flex-1 min-h-0">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                    <div>
                      <span className="text-[10px] uppercase font-normal tracking-wider text-[var(--soft-muted)] block">
                        Client Accounts
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] block">
                        Ranked by issue prevalence
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums px-1.5 py-0.5 border border-[var(--line)] rounded-full bg-[var(--canvas)]">
                        {trialTemplates.length} Active
                      </span>
                      <button
                        type="button"
                        onClick={() => setSidebarCollapsed(true)}
                        title="Collapse sidebar"
                        aria-label="Collapse sidebar"
                        className="w-6 h-6 rounded flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer"
                      >
                        <PanelLeftClose size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex items-center">
                    <Search size={12} className="absolute left-2.5 text-[var(--muted-foreground)] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search accounts or candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 pl-7 pr-2.5 bg-white border border-[var(--line)] rounded-md text-xs text-[var(--ink)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--brand)] transition-colors"
                    />
                  </div>

                  {/* Portfolio Hub Quick Row */}
                  <button
                    type="button"
                    onClick={() => setViewMode("hub")}
                    className={`account-flat-row ${viewMode === "hub" ? "is-active" : ""}`}
                  >
                    <div className="w-7 h-7 rounded-md bg-[var(--canvas)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shrink-0">
                      <LayoutDashboard size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-normal text-[var(--ink)] block truncate">
                        Portfolio Operations Hub
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] block truncate">
                        Fleet-wide autonomous view
                      </span>
                    </div>
                  </button>

                  {/* Percolated Client Accounts List */}
                  <div className="flex flex-col gap-0.5 divide-y divide-[var(--line)]/50 pt-1 overflow-y-auto flex-1 min-h-0">
                    {filteredAccounts.length === 0 ? (
                      <div className="py-4 text-center text-xs text-[var(--muted-foreground)]">
                        No accounts match &ldquo;{searchQuery}&rdquo;
                      </div>
                    ) : (
                      filteredAccounts.map(({ template, issueCount, riskScore }) => {
                        const isSelected = viewMode === "company" && trial.id === template.id;
                        const initial = template.client.name.charAt(0);

                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => openCompanyDashboard(template.id)}
                            className={`account-flat-row ${isSelected ? "is-active" : ""}`}
                          >
                            <div className="candidate-monogram shrink-0" style={{ width: 28, height: 28, fontSize: 11 }}>
                              {initial}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-normal text-[var(--ink)] truncate">
                                  {template.client.name}
                                </span>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-[var(--muted-foreground)] block truncate">
                                Day {template.initialDay} · {template.candidate.handle}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] font-normal block tabular-nums ${
                                  issueCount > 0 ? "text-[var(--risk)]" : "text-[var(--success)]"
                                }`}
                              >
                                {issueCount > 0 ? `${issueCount} ${issueCount === 1 ? "issue" : "issues"}` : "Healthy"}
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums block">
                                Risk {riskScore}/100
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-2 mt-auto border-t border-[var(--line)] flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                    <span>TypeSafe Jev active</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                      5 monitored
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main Canvas (Takes remaining width, smoothly expands & compresses) ── */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
            {/* ── Role Intro Header (Native across all roles) ── */}
            <div className="role-intro">
              <div>
                <h2>
                  {viewMode === "hub" ? "Portfolio Operations Hub" : trial.client.name}{" "}
                  <span className="heading-context">
                    {viewMode === "hub" ? "OPERATOR VIEW · FLEET SUPERVISION" : `OPERATOR VIEW · DAY ${state.activeDay}`}
                  </span>
                </h2>
                <p>
                  {viewMode === "hub"
                    ? "Autonomous Jev System 1 supervision across 5 active client trials."
                    : `${trial.client.industry} · Working trial workspace`}
                </p>
              </div>

              {viewMode === "hub" ? (
                <div className="flex items-center gap-2.5">
                  {sidebarCollapsed && (
                    <Button
                      className="button-secondary"
                      variant="outline"
                      onClick={() => setSidebarCollapsed(false)}
                      title="See all accounts"
                    >
                      <PanelLeft size={14} />
                      See all accounts
                    </Button>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs text-[var(--ink)] border border-[var(--line)] bg-white">
                    <Sparkles size={13} className="text-[var(--brand)]" />
                    <span>TypeSafe Jev · <strong className="font-normal tabular-nums">~{latestLatency}ms</strong></span>
                  </span>

                  <Button
                    className="button-secondary"
                    variant="outline"
                    onClick={handleRefreshTriage}
                    disabled={evaluating}
                  >
                    <RefreshCw size={13} className={evaluating ? "animate-spin text-[var(--brand)]" : "text-[var(--muted-foreground)]"} />
                    {evaluating ? "Evaluating..." : "Re-evaluate Fleet"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    className="button-secondary"
                    variant="outline"
                    onClick={() => setViewMode("hub")}
                  >
                    <ChevronLeft size={14} /> Back to Fleet Hub
                  </Button>

                  {sidebarCollapsed && (
                    <Button
                      className="button-secondary"
                      variant="outline"
                      onClick={() => setSidebarCollapsed(false)}
                      title="See all accounts"
                    >
                      <PanelLeft size={13} /> Switch Account
                    </Button>
                  )}

                  <Badge
                    className={`health-chip ${
                      health === "OFF_TRACK" ? "risk-chip" : health === "AT_RISK" ? "warning-chip" : "good-chip"
                    }`}
                    variant="outline"
                  >
                    <span />
                    {healthText}
                  </Badge>

                  <div className="operator-day-control" aria-label="Demo trial day">
                    <Button
                      aria-label="Previous day"
                      className="day-step"
                      disabled={state.activeDay <= 1}
                      onClick={() => dispatch({ type: "day", day: state.activeDay - 1 })}
                      size="icon"
                      variant="outline"
                    >
                      <ChevronLeft size={15} />
                    </Button>
                    <span>
                      Day <b className="tabular-nums font-normal">{state.activeDay}</b> <small>of 14</small>
                    </span>
                    <Button
                      aria-label="Next day"
                      className="day-step"
                      disabled={state.activeDay >= 14}
                      onClick={() => dispatch({ type: "day", day: state.activeDay + 1 })}
                      size="icon"
                      variant="outline"
                    >
                      <ChevronRight size={15} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Hub or Company View ── */}
          {viewMode === "hub" ? (
            /* ═════════════════════════════════════════════════════════
               VIEW 1: OVERALL OPERATIONS HUB
               ═════════════════════════════════════════════════════════ */
            <div className="w-full flex flex-col gap-4">
              {/* 1. Jev Cross-Account Escalation Hub (Hero Priority Panel — Flat, No Nested Cards) */}
              <section className="today-panel" aria-label="Jev portfolio priority hub">
                <div className="today-heading">
                  <h3>
                    Cross-Account Escalation Hub{" "}
                    <span className="heading-context">
                      {topCriticalAccount.issueCount > 0
                        ? `#1 FLEET PRIORITY · ${topCriticalAccount.template.client.name.toUpperCase()}`
                        : "ALL CLIENT TRIALS HEALTHY"}
                    </span>
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-normal text-[var(--ink)]">
                    {topCriticalAccount.issueCount > 0 ? (
                      <>
                        <AlertTriangle size={12} className="text-[var(--warning)]" />
                        Immediate Operator Attention
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} className="text-[var(--success)]" />
                        Zero Critical Blockers
                      </>
                    )}
                  </span>
                </div>

                {topCriticalAccount.issueCount === 0 ? (
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[var(--canvas)] text-[var(--brand)] border border-[var(--line)] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-normal text-[var(--ink)] m-0">
                          Fleet Fully Unblocked
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-0 leading-relaxed">
                          Jev System 1: All active customer access provisioned. 5 working trials operating on schedule with zero blockers.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-normal text-[var(--success)] border border-[var(--line)] bg-[var(--canvas)] shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                      100% Provisioned
                    </span>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--canvas)] text-[var(--ink)] border border-[var(--line)] flex items-center justify-center shrink-0">
                        <LockKeyhole size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-normal text-[var(--ink)] m-0">
                          {topTriage.primaryBlocker || "Access Provisioning Bottleneck"}
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-0 leading-relaxed">
                          {topTriage.rationale}
                        </p>
                      </div>
                    </div>

                    {/* 3-Part Jev Decision Strip — Flat hairline dividers, zero nested cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-y border-[var(--line)] text-left">
                      <div className="sm:pr-4">
                        <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)] font-normal">
                          Blocker Probability (Noul)
                        </span>
                        <strong className="block text-base font-normal text-[var(--ink)] mt-0.5 tabular-nums">
                          {Math.round(topTriage.isCriticalBlocker.noul * 100)}%
                        </strong>
                      </div>
                      <div className="sm:border-x sm:border-[var(--line)] sm:px-4 py-2 sm:py-0">
                        <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)] font-normal">
                          SLA Risk Score (Score)
                        </span>
                        <strong className="block text-base font-normal text-[var(--ink)] mt-0.5 tabular-nums">
                          {topTriage.slaRiskScore.score} <small className="text-xs font-normal text-[var(--muted-foreground)]">/ 100</small>
                        </strong>
                      </div>
                      <div className="sm:pl-4">
                        <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)] font-normal">
                          Recommended Action (Choice)
                        </span>
                        <strong className="block text-xs font-normal text-[var(--brand)] mt-1 truncate">
                          {topTriage.recommendedAction.choice.replace(/_/g, " ")} ({Math.round(topTriage.recommendedAction.confidence * 100)}% conf)
                        </strong>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Button
                          className="button-primary"
                          onClick={() => {
                            setActiveSlackTriage(topTriage);
                            setSlackModalOpen(true);
                          }}
                        >
                          <SlackMark size={15} />
                          1-Click Dispatch Slack Nudge to {topCriticalAccount.template.client.name}
                        </Button>
                        <Button
                          className="button-secondary"
                          variant="outline"
                          onClick={() => openCompanyDashboard(topCriticalAccount.template.id)}
                        >
                          Open {topCriticalAccount.template.client.name} Dashboard <ArrowRight size={13} className="ml-1" />
                        </Button>
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">
                        ~{topTriage.latencyMs}ms System One latency · Zero hallucinations
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* 2. Active Trial Flight Path (Portfolio Matrix — Flat Table) */}
              <section className="today-panel" aria-label="Active trial flight path">
                <div className="today-heading">
                  <h3>
                    Active Trial Flight Path{" "}
                    <span className="heading-context">5 CLIENT ACCOUNTS MONITORED</span>
                  </h3>
                  <span className="task-count">SLA thresholds & milestone velocity</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-[10px] uppercase tracking-wider text-[var(--soft-muted)] bg-[var(--canvas)]/40">
                        <th className="py-2.5 px-4 font-normal">Client Account</th>
                        <th className="py-2.5 px-3 font-normal">Candidate</th>
                        <th className="py-2.5 px-3 font-normal">Timeline</th>
                        <th className="py-2.5 px-3 font-normal">Access SLA Status</th>
                        <th className="py-2.5 px-3 font-normal">Jev Risk</th>
                        <th className="py-2.5 px-4 text-right font-normal">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {accountsWithIssues.map(({ template, issueCount, riskScore }) => {
                        const pending = template.access.filter((a) => a.status !== "PROVISIONED");
                        const elapsed = Math.max(0, ...pending.map((a) => a.updatedAtHoursAgo));
                        const isBreached = elapsed >= ACCESS_SLA_WARNING_HOURS;

                        return (
                          <tr
                            key={template.id}
                            tabIndex={0}
                            role="button"
                            onClick={() => openCompanyDashboard(template.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openCompanyDashboard(template.id);
                              }
                            }}
                            aria-label={`Open ${template.client.name} trial dashboard`}
                            className="hover:bg-[var(--canvas)] transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
                          >
                            <td className="py-3 px-4">
                              <span className="font-normal text-[var(--ink)] block group-hover:text-[var(--brand)] transition-colors">
                                {template.client.name}
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)] block">
                                {template.client.industry}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[var(--ink)] block font-normal">
                                {template.candidate.handle}
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)] block">
                                {template.candidate.title}
                              </span>
                            </td>
                            <td className="py-3 px-3 tabular-nums">
                              <span className="text-[var(--ink)] block">
                                Day {template.initialDay} <span className="text-[var(--muted-foreground)]">of 14</span>
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)] block">
                                {template.initialDay <= 2 ? "System setup" : template.initialDay <= 7 ? "First work" : "Decision"}
                              </span>
                            </td>
                            <td className="py-3 px-3 tabular-nums">
                              {pending.length > 0 ? (
                                <div>
                                  <span className={isBreached ? "text-[var(--risk)] font-normal" : "text-[var(--muted-foreground)]"}>
                                    {elapsed}h / {ACCESS_SLA_WARNING_HOURS}h
                                  </span>
                                  <span className="text-[10px] text-[var(--muted-foreground)] block">
                                    {isBreached ? "Past threshold" : `${ACCESS_SLA_WARNING_HOURS - elapsed}h remaining`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[var(--success)] font-normal">100% Provisioned</span>
                              )}
                            </td>
                            <td className="py-3 px-3 tabular-nums">
                              <span className="text-[var(--ink)] block font-normal">
                                {riskScore} <span className="text-[var(--muted-foreground)]">/ 100</span>
                              </span>
                              <span className="text-[10px] text-[var(--muted-foreground)] block">
                                {issueCount > 0 ? `${issueCount} issues` : "Clear"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 text-[var(--brand)] text-xs font-normal">
                                Open Trial <ArrowRight size={11} />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 3. Live Ecosystem Activity Stream */}
              <section className="access-panel" aria-label="Portfolio activity stream">
                <div className="access-panel-head">
                  <h3>
                    Portfolio Activity Stream{" "}
                    <span className="heading-context">REAL-TIME ECOSYSTEM SIGNALS</span>
                  </h3>
                  <Clock3 size={16} />
                </div>

                <div className="p-3 sm:p-4">
                  <ol className="divide-y divide-[var(--line)] text-xs m-0 p-0 list-none">
                    <li className="py-2.5 flex items-start gap-3">
                      <span className="font-normal text-[var(--ink)] w-24 shrink-0">Graza</span>
                      <p className="text-[var(--muted-foreground)] flex-1 m-0">
                        Shopify export pending for 42 hours · Jev flagged critical delivery risk
                      </p>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 tabular-nums">10m ago</span>
                    </li>
                    <li className="py-2.5 flex items-start gap-3">
                      <span className="font-normal text-[var(--ink)] w-24 shrink-0">Athena Club</span>
                      <p className="text-[var(--muted-foreground)] flex-1 m-0">
                        Ramp approver access pending for 28 hours · candidate awaiting fintech permissions
                      </p>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 tabular-nums">35m ago</span>
                    </li>
                    <li className="py-2.5 flex items-start gap-3">
                      <span className="font-normal text-[var(--ink)] w-24 shrink-0">Hex</span>
                      <p className="text-[var(--muted-foreground)] flex-1 m-0">
                        Snowflake SSO pending IT ticket #4091 · candidate proceeding with offline ASC 606 schedule
                      </p>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 tabular-nums">1h ago</span>
                    </li>
                    <li className="py-2.5 flex items-start gap-3">
                      <span className="font-normal text-[var(--ink)] w-24 shrink-0">Feastables</span>
                      <p className="text-[var(--muted-foreground)] flex-1 m-0">
                        Candidate delivered EDI 3-way match draft 2 days ahead of schedule
                      </p>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 tabular-nums">3h ago</span>
                    </li>
                  </ol>
                </div>
              </section>
            </div>
          ) : (
            /* ═════════════════════════════════════════════════════════
               VIEW 2: COMPANY-SPECIFIC DASHBOARD (Pre-Jev Pristine Bento)
               ═════════════════════════════════════════════════════════ */
            <div className="w-full flex flex-col gap-4">
              {/* Original 5-Widget Bento Grid */}
              <div className="operator-bento-grid">
                {/* Widget 1: Escalation Hub */}
                <section
                  className={`bento-widget escalation-widget ${
                    risk ? "breached" : activeEscalation ? "pending" : "clear"
                  }`}
                  aria-label="Escalation hub"
                >
                  <div className="bento-widget-heading">
                    <h2>Escalation hub</h2>
                    <Badge variant="outline" className="escalation-count tabular-nums">
                      {openEscalations.length} open
                    </Badge>
                  </div>
                  {activeEscalation ? (
                    <>
                      <div className="escalation-title">
                        <span className="escalation-symbol">
                          {access ? <LockKeyhole size={20} /> : <MessageSquareText size={20} />}
                        </span>
                        <div>
                          <h3>{access ? `${access.name} pending` : activeEscalation.message}</h3>
                          <p>
                            {access
                              ? `Waiting on ${trial.client.name} admin · ${access.updatedAtHoursAgo}h elapsed`
                              : `${
                                  activeEscalation.source === "CUSTOMER" ? "Customer" : "Candidate"
                                } · private to MAVI`}
                          </p>
                        </div>
                      </div>
                      <p className="escalation-context">
                        {access
                          ? "The customer needs to provide access before the candidate can confirm this tool and complete setup."
                          : privateNote || "Review this report and follow up with the participant."}
                      </p>
                      {openEscalations.length > 1 && (
                        <Select
                          value={activeEscalation.id}
                          onValueChange={setSelectedEscalationId}
                        >
                          <SelectTrigger
                            className="escalation-select"
                            aria-label="Review another escalation"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {openEscalations.map((item) => (
                              <SelectItem value={item.id} key={item.id}>
                                {item.message}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <div className="escalation-actionbar">
                        <Button
                          className="button-primary"
                          onClick={() => {
                            const currentTriage = triageMap[trial.id] || INITIAL_TRIAGE[trial.id];
                            setActiveSlackTriage(currentTriage);
                            setSlackModalOpen(true);
                          }}
                        >
                          <SlackMark size={17} />
                          Dispatch Slack Nudge
                        </Button>
                        <Button
                          className="button-secondary"
                          variant="outline"
                          onClick={() => {
                            dispatch({
                              type: "resolve-escalation",
                              id: activeEscalation.id,
                            });
                            handleDispatchNudge(trial.id);
                            onToast(
                              access
                                ? "Access provided in demo · candidate can now confirm their tool"
                                : "Private report resolved in demo"
                            );
                          }}
                        >
                          <Check size={15} />
                          {access ? "Mark provided" : "Resolve report"}
                        </Button>
                      </div>
                      <span className="escalation-footnote">
                        {trial.interventions.some((entry) =>
                          entry.message.includes(activeEscalation.id)
                        )
                          ? "Nudge simulated · no message sent"
                          : "Opens the Slack simulator · no external message sent"}
                      </span>
                    </>
                  ) : (
                    <div className="bento-all-clear">
                      <CheckCircle2 size={28} />
                      <h3>
                        {health === "ON_TRACK"
                          ? "On track. No action needed."
                          : "No open escalations."}
                      </h3>
                      <p>
                        {oldestAccess
                          ? "Pending access is within the initial provisioning window."
                          : "Required access is ready. Participants can continue their checklists."}
                      </p>
                    </div>
                  )}
                </section>

                {/* Widget 2: Access SLA */}
                <SlaWidget trial={trial} />

                {/* Widget 3: Candidate Tile */}
                <CandidateTile trial={trial} />

                {/* Widget 4: Milestone Widget */}
                <MilestoneWidget
                  key={`${trial.id}-${state.activeDay}`}
                  state={state}
                  dispatch={dispatch}
                  onPreviewFollowup={onPreviewFollowup}
                />

                {/* Widget 5: Activity Feed */}
                <ActivityWidget state={state} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Candidate Dossier Drawer Modal */}
      <DialogContent className="candidate-dossier-drawer" showOverlay={false}>
        <div className="dossier-drawer-title">
          <span className="candidate-monogram large">M</span>
          <div>
            <DialogTitle>{trial.candidate.handle}</DialogTitle>
            <DialogDescription>Illustrative candidate dossier</DialogDescription>
          </div>
        </div>
        <h3>{trial.candidate.title}</h3>
        <p>{trial.candidate.pedigree}</p>
        <div className="profile-metrics">
          <div>
            <span>AI REVIEW SCORE</span>
            <b className="tabular-nums font-normal">
              {trial.candidate.hallucinationScore}
              <small>/100</small>
            </b>
          </div>
          <div>
            <span>REVIEW SPEEDUP</span>
            <b className="tabular-nums font-normal">
              {trial.candidate.auditSpeedup}
              <small>×</small>
            </b>
          </div>
        </div>
        <div className="profile-detail-row">
          <b>Relevant tools</b>
          <div>
            {trial.candidate.tools.map((tool) => (
              <span className="tool-tag" key={tool}>
                {tool}
              </span>
            ))}
          </div>
        </div>
        <div className="profile-detail-row">
          <b>Assessment observation</b>
          <p>{trial.candidate.challenge}</p>
        </div>
        <div className="profile-detail-row">
          <b>Working hours</b>
          <p>{trial.candidate.overlap}</p>
        </div>
        <div className="profile-detail-row">
          <b>Workspace</b>
          <p>
            <ShieldCheck size={14} />
            {trial.workspace.region} · security controls are illustrative
          </p>
        </div>
      </DialogContent>

      {/* Dedicated Interactive Slack Simulator Modal */}
      <SlackSimulatorModal
        open={slackModalOpen}
        onOpenChange={setSlackModalOpen}
        triage={activeSlackTriage}
        onDispatched={(accId) => {
          handleDispatchNudge(accId);
        }}
      />
    </Dialog>
  );
}

export { OperatorDashboard as OperatorView };
