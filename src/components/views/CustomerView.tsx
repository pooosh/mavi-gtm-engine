"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { SlackMark } from "@/components/brand/slack-mark";
import { AthenaSlackChannelView } from "./AthenaSlackChannelView";

export interface CustomerViewProps {
  currentDay?: number;
  onDayChange?: (day: number) => void;
  rampStatus?: "pending" | "resolved";
  onGrantRampAccess?: () => void;
  onToast?: (message: string) => void;
  // Fallback for props passed from portal
  state?: any;
  dispatch?: (action: any) => void;
  onModal?: (modal: any) => void;
}

export function CustomerView({
  currentDay,
  onDayChange,
  rampStatus,
  onGrantRampAccess,
  onToast,
  state,
  dispatch,
  onModal,
}: CustomerViewProps) {
  // Sync day from props or parent state, with internal fallback
  const parentDay = currentDay ?? state?.activeDay ?? 2;
  const [internalDay, setInternalDay] = useState<number>(parentDay);
  const activeDay = currentDay ?? (state?.activeDay !== undefined ? state.activeDay : internalDay);

  // Sync ramp status
  const parentRampResolved =
    rampStatus === "resolved" ||
    state?.trial?.access?.find((i: any) => i.id === "ramp")?.status === "PROVISIONED" ||
    state?.systemAccess?.find((i: any) => i.id === "ramp")?.status === "PROVISIONED";
  const [internalRampResolved, setInternalRampResolved] = useState<boolean>(parentRampResolved);
  const isRampResolved = rampStatus !== undefined
    ? rampStatus === "resolved"
    : parentRampResolved || internalRampResolved;

  // Modals & local state
  const [privateNoteOpen, setPrivateNoteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [copiedInstructions, setCopiedInstructions] = useState(false);
  const [retainerConfirmed, setRetainerConfirmed] = useState(
    Boolean(state?.trial?.telemetry?.converted)
  );
  const [activeSurface, setActiveSurface] = useState<"portal" | "slack">("portal");

  const clientName = state?.trial?.client?.name ?? "Athena Club";
  const candidateHandle = state?.trial?.candidate?.handle ?? "Candidate M-402";
  const candidateTitle = state?.trial?.candidate?.title ?? "Senior Inventory & Revenue Accountant";
  const candidatePedigree = state?.trial?.candidate?.pedigree ?? "Ex-PwC Audit Senior · 4 yrs";
  const candidateOverlap = state?.trial?.candidate?.overlap ?? "9:00 AM – 2:00 PM EST (5 hrs daily)";
  const candidateTools = state?.trial?.candidate?.tools ?? ["NetSuite", "Ramp", "Shopify", "Excel"];

  const notifyToast = (msg: string) => {
    if (onToast) onToast(msg);
  };

  const handleDayStep = (newDay: number) => {
    const clamped = Math.max(1, Math.min(14, newDay));
    setInternalDay(clamped);
    if (onDayChange) {
      onDayChange(clamped);
    } else if (dispatch) {
      dispatch({ type: "day", day: clamped });
    }
  };

  const handleGrantRamp = () => {
    setInternalRampResolved(true);
    if (onGrantRampAccess) {
      onGrantRampAccess();
    } else if (dispatch) {
      dispatch({ type: "access", id: "ramp", status: "PROVISIONED" });
      dispatch({ type: "resolve-escalation", id: "access-ramp" });
    }
    notifyToast("Ramp approver role granted · Candidate M-402 unblocked");
  };

  const handleCopyInstructions = () => {
    const text =
      "Athena Club IT Instructions: Please grant Candidate M-402 (m-402@talent.mavi.work) read/approver permissions in Ramp (Settings > Roles & Permissions > Approver). Required for Phase 2 Shopify sales reconciliation.";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedInstructions(true);
    notifyToast("IT instructions copied to clipboard");
    setTimeout(() => setCopiedInstructions(false), 2500);
  };

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    setPrivateNoteOpen(false);
    if (dispatch) {
      dispatch({
        type: "customer-note",
        category: "Customer Note",
        note: noteContent,
      });
    }
    notifyToast("Private note sent directly to your MAVI Engagement Manager");
    setNoteContent("");
  };

  const handleConfirmRetainer = () => {
    setRetainerConfirmed(true);
    if (dispatch) {
      dispatch({ type: "convert" });
    }
    notifyToast("Month-to-month MAVI retainer confirmed for Candidate M-402");
  };

  // Determine active phase based on activeDay
  const currentPhaseIndex = activeDay <= 2 ? 1 : activeDay <= 7 ? 2 : 3;

  // Master phase configuration
  const phaseConfig = {
    phase1: {
      phaseNumber: 1,
      label: "Phase 1: System Provisioning",
      title: "System Setup",
      days: "Days 0–2",
      badgeText: isRampResolved ? "4 of 4 Verified" : "3 of 4 Ready",
      isComplete: isRampResolved || activeDay > 2,
      tasks: [
        { id: "1", title: "Review secure virtual workspace protocols", done: true },
        { id: "2", title: "Provision NetSuite read-only seat", done: true },
        {
          id: "3",
          title: "Grant Ramp approver access",
          done: isRampResolved || activeDay > 2,
          pending: !isRampResolved && activeDay <= 2,
        },
        { id: "4", title: "Invite candidate to #finance-athena on Slack", done: true },
      ],
    },
    phase2: {
      phaseNumber: 2,
      label: "Phase 2: First Work & Inventory Close",
      title: "Shopify Reconciliation",
      days: "Days 3–7",
      badgeText: activeDay > 7 ? "Complete" : activeDay >= 3 ? "In Progress" : "Upcoming (D3)",
      isComplete: activeDay > 7,
      tasks: [
        { id: "5", title: "Share Q3 Shopify sales ledger & raw export", done: activeDay >= 3 },
        {
          id: "6",
          title: "Candidate reconciles clearing account to NetSuite",
          done: activeDay >= 5,
        },
        {
          id: "7",
          title: "Review variance exception summary with MAVI",
          done: activeDay >= 7,
        },
      ],
    },
    phase3: {
      phaseNumber: 3,
      label: "Phase 3: Retainer Conversion & Final Close",
      title: "Retainer Decision",
      days: "Days 8–14",
      badgeText: retainerConfirmed ? "Retainer Confirmed" : activeDay >= 8 ? "Review Open" : "Upcoming (D8)",
      isComplete: retainerConfirmed,
      tasks: [
        { id: "8", title: "Final close package review with candidate", done: activeDay >= 12 },
        {
          id: "9",
          title: "Execute month-to-month MAVI retainer agreement",
          done: retainerConfirmed,
        },
      ],
    },
  };

  const activePhase =
    currentPhaseIndex === 1
      ? phaseConfig.phase1
      : currentPhaseIndex === 2
      ? phaseConfig.phase2
      : phaseConfig.phase3;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900 pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-slate-200 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{clientName}</h1>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              14-Day Working Trial
            </span>
          </div>
        </div>

        {/* Right side controls: Surface Toggle + Day Stepper */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Surface Segmented Toggle: [Web Portal | #finance-athena] */}
          <div
            className="inline-flex items-center p-0.5 rounded-lg border border-[var(--line)] bg-[var(--canvas)] text-xs"
            role="tablist"
            aria-label="Customer interface view mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSurface === "portal"}
              onClick={() => setActiveSurface("portal")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-normal transition-all cursor-pointer ${
                activeSurface === "portal"
                  ? "bg-white text-[var(--ink)] border border-[var(--line)]/60"
                  : "text-[var(--soft-muted)] hover:text-[var(--ink)]"
              }`}
            >
              <span>Web Portal</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeSurface === "slack"}
              onClick={() => setActiveSurface("slack")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-normal transition-all cursor-pointer ${
                activeSurface === "slack"
                  ? "bg-white text-[var(--ink)] border border-[var(--line)]/60"
                  : "text-[var(--soft-muted)] hover:text-[var(--ink)]"
              }`}
            >
              <SlackMark size={13} />
              <span>#finance-athena</span>
              {!isRampResolved && activeDay <= 2 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" title="1 action pending in Slack" />
              )}
            </button>
          </div>

          {/* Day Stepper */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--line)] bg-white text-xs"
            role="group"
            aria-label="Trial day stepper"
          >
            <button
              type="button"
              onClick={() => handleDayStep(activeDay - 1)}
              disabled={activeDay <= 1}
              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              aria-label="Previous trial day"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-normal text-[var(--ink)] tabular-nums tracking-tight px-1">
              Day <b>{activeDay}</b> <span className="text-[var(--muted-foreground)]">of 14</span>
            </span>
            <button
              type="button"
              onClick={() => handleDayStep(activeDay + 1)}
              disabled={activeDay >= 14}
              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              aria-label="Next trial day"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: SLACK CHANNEL OR 2-COLUMN EXECUTIVE WORKSPACE          */}
      {/* ========================================================================= */}
      {activeSurface === "slack" ? (
        <AthenaSlackChannelView
          isRampResolved={isRampResolved}
          onGrantRampAccess={handleGrantRamp}
          onCopyInstructions={handleCopyInstructions}
          onOpenDossier={onModal ? () => onModal("dossier") : undefined}
          candidateHandle={candidateHandle}
          candidateTitle={candidateTitle}
          clientName={clientName}
          activeDay={activeDay}
          copiedInstructions={copiedInstructions}
        />
      ) : (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* ======================================================================= */}
          {/* LEFT COLUMN: ACTION & DELIVERABLES (7 of 12 Cols · ~60%) */}
          {/* ======================================================================= */}
          <div className="col-span-12 lg:col-span-7 space-y-5">
            {/* ACTION BANNER (Dynamic based on blockers) */}
            {activeDay <= 2 && !isRampResolved ? (
              <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                        Action Needed
                      </span>
                      <span className="text-xs font-semibold text-amber-900">
                        Grant Ramp Approver Access (Pending 28h)
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Candidate M-402 has completed the initial setup, but needs Ramp read/approver access to begin reconciling Shopify sales disbursements against the NetSuite inventory ledger.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleGrantRamp}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Check size={14} className="stroke-[2.5]" />
                    <span>Mark as Granted</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSurface("slack")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 text-[var(--brand)] text-xs font-normal transition-colors cursor-pointer"
                  >
                    <SlackMark size={13} />
                    <span>View in #finance-athena</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInstructions}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 text-amber-900 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>{copiedInstructions ? "Copied!" : "Copy IT Instructions"}</span>
                  </button>
                </div>
              </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-white p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    All Core Systems Provisioned
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Candidate M-402 is unblocked and actively executing {activePhase.title.toLowerCase()}.
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold tabular-nums text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                On Track
              </span>
            </div>
          )}

          {/* ACTIVE MILESTONE DELIVERABLES / ACTIVE PHASE CHECKLIST */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Current Deliverable · {activePhase.days}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {activePhase.label}
                </h3>
              </div>
              <span className="text-xs tabular-nums text-slate-500">
                {activePhase.tasks.filter((t) => t.done).length} of {activePhase.tasks.length} Completed
              </span>
            </div>

            {/* Clean Checkbox Task Items */}
            <div className="space-y-2.5">
              {activePhase.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    task.done
                      ? "border-slate-200 bg-slate-50/50"
                      : (task as any).pending
                      ? "border-amber-300 bg-amber-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {task.done ? (
                      <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                    ) : (task as any).pending ? (
                      <div className="w-4 h-4 rounded border-2 border-amber-500 bg-white flex items-center justify-center animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs font-medium block leading-snug ${
                        task.done
                          ? "text-slate-600"
                          : (task as any).pending
                          ? "text-amber-900 font-semibold"
                          : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </span>
                    {(task as any).pending && (
                      <span className="text-[11px] text-amber-700 block mt-0.5">
                        Waiting on Athena IT action · Pending 28h
                      </span>
                    )}
                  </div>

                  {(task as any).pending && (
                    <button
                      type="button"
                      onClick={handleGrantRamp}
                      className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 flex-shrink-0 cursor-pointer"
                    >
                      Grant now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: TALENT & STAKEHOLDER CONTEXT (5 of 12 Cols · ~40%) */}
        {/* ======================================================================= */}
        <div className="col-span-12 lg:col-span-5 space-y-5">
          {/* 1. DEDICATED CANDIDATE DOSSIER CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base ring-2 ring-indigo-100 flex-shrink-0">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {candidateHandle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {candidateTitle}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>

            {/* Profile Detail List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Experience:</span>
                <strong className="text-slate-800 font-semibold">
                  {candidatePedigree}
                </strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Working Hours:</span>
                <span className="text-slate-800 font-medium">
                  {candidateOverlap}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Status:</span>
                <span className="text-slate-800 font-medium flex items-center gap-1">
                  Active in Secure Virtual Desktop
                </span>
              </div>

              {/* Core Tools Badges */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Core Tool Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidateTools.map((tool: string) => (
                    <span
                      key={tool}
                      className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200/60"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Security Assurance */}
              <div className="pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  SOC 2 Type II Virtual Desktop · Dedicated US-East Hypervisor
                </span>
              </div>
            </div>
          </div>

          {/* 2. PRIVATE MAVI ESCALATION CHANNEL CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-indigo-600" />
                Private MAVI Feedback Channel
              </h3>
              <span className="text-[10px] text-slate-400">Strictly Confidential</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Have feedback, want to adjust trial scope, or need operational support? Your notes go directly to Molly Liu (MAVI Operations) and are never visible to the candidate.
            </p>

            <button
              type="button"
              onClick={() => {
                if (onModal) {
                  onModal("customer");
                } else {
                  setPrivateNoteOpen(true);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Send size={13} className="text-slate-500" />
              <span>Send Private Note to MAVI Lead</span>
            </button>
          </div>

            {/* 3. DAY 14 CONVERSION GATE CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Day 14 Retainer Conversion Gate
              </span>
              {activeDay >= 12 ? (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Unlocked
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock size={10} /> Unlocks Day 12
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your 14-day risk-free working trial completes on Day 14. Retainer converts on a flexible month-to-month agreement with zero long-term commitment.
            </p>

            {retainerConfirmed ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Month-to-Month Retainer Confirmed in Demo</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConfirmRetainer}
                disabled={activeDay < 12}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Confirm Month-to-Month Retainer</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Private Note Modal */}
      {privateNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Private Note to MAVI Engagement Lead
              </h3>
              <button
                type="button"
                onClick={() => setPrivateNoteOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Only Molly Liu and the MAVI operations team receive this feedback. Your candidate will not see this.
            </p>

            <form onSubmit={handleSendNote} className="space-y-3.5">
              <div>
                <label htmlFor="private-note-input" className="sr-only">
                  Private feedback or scope updates
                </label>
                <textarea
                  id="private-note-input"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Share feedback, scope updates, or operational questions..."
                  rows={4}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-2 focus:outline-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPrivateNoteOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send to MAVI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
