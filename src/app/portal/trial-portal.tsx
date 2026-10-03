"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  Clock3,
  Grip,
  Lock,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useReducer, useRef, useState } from "react";
import { OperatorDashboard } from "./operator-dashboard";
import { SlackMark } from "@/components/brand/slack-mark";
import { AthenaSlackChannelView } from "@/components/views/AthenaSlackChannelView";
import { VerticalTrialTimeline } from "@/components/timeline/VerticalTrialTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  candidateTaskBlocker,
  createInitialState,
  TrialOSState,
  TrialWorkspace,
  trialReducer,
  UserRole,
} from "@/lib/trial";

type ModalName = "customer" | "candidate" | "pulse" | "convert" | "slack" | "dossier" | null;
type PhaseKey = keyof TrialWorkspace["customerTasks"];

const roles: Array<{ id: UserRole; label: string; short: string }> = [
  { id: "customer", label: "Customer", short: "CFO" },
  { id: "candidate", label: "Candidate", short: "Talent" },
  { id: "operator", label: "MAVI operator", short: "Ops" },
];

const phases: Array<{ id: PhaseKey; label: string; days: string; name: string }> = [
  { id: "setup", label: "Setup", days: "Days 0–2", name: "Get connected" },
  { id: "delivery", label: "First work", days: "Days 3–7", name: "Prove the work" },
  { id: "close", label: "Review", days: "Days 8–14", name: "Decide what’s next" },
];

function MaviMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="mavi-mark"
      width={Math.round((size * 36) / 30)}
      height={size}
      viewBox="0 0 36 30"
      fill="none"
      style={{ flexShrink: 0, display: "inline-block" }}
    >
      <path d="M4 24.5V5.5c0-1.1 1.3-1.6 2.1-.8L18 17.8 29.9 4.7c.8-.8 2.1-.3 2.1.8v19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 24.5c0 1.1 1.3 1.6 2.1.8L18 12.2 29.9 25.3c.8.8 2.1.3 2.1-.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function elapsedLabel(hours: number) {
  if (hours >= 48) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h`;
}

function getPhase(day: number): PhaseKey {
  return day <= 2 ? "setup" : day <= 7 ? "delivery" : "close";
}

function DemoController({ value, onChange, attentionCount }: { value: UserRole; onChange: (role: UserRole) => void; attentionCount: number }) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const controllerRef = useRef<HTMLDivElement>(null);
  const roles = [
    { id: "customer" as const, label: "Customer" },
    { id: "candidate" as const, label: "Candidate" },
    { id: "operator" as const, label: "MAVI Ops" },
  ];

  useEffect(() => {
    if (!position) return;
    function keepInViewport() {
      const bounds = controllerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setPosition((current) => {
        if (!current) return current;
        const x = Math.max(8, Math.min(window.innerWidth - bounds.width - 8, current.x));
        const y = Math.max(8, Math.min(window.innerHeight - bounds.height - 8, current.y));
        return current.x === x && current.y === y ? current : { x, y };
      });
    }
    const observer = controllerRef.current ? new ResizeObserver(keepInViewport) : null;
    if (controllerRef.current) observer?.observe(controllerRef.current);
    window.addEventListener("resize", keepInViewport);
    window.visualViewport?.addEventListener("resize", keepInViewport);
    keepInViewport();
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", keepInViewport);
      window.visualViewport?.removeEventListener("resize", keepInViewport);
    };
  }, [position, value]);

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !controllerRef.current) return;
    const bounds = controllerRef.current.getBoundingClientRect();
    dragOrigin.current = { pointerX: event.clientX, pointerY: event.clientY, x: bounds.left, y: bounds.top };
    setPosition({ x: bounds.left, y: bounds.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragOrigin.current || !controllerRef.current) return;
    const origin = dragOrigin.current;
    const { width, height } = controllerRef.current.getBoundingClientRect();
    setPosition({
      x: Math.max(8, Math.min(window.innerWidth - width - 8, origin.x + event.clientX - origin.pointerX)),
      y: Math.max(8, Math.min(window.innerHeight - height - 8, origin.y + event.clientY - origin.pointerY)),
    });
  }

  function endDrag() { dragOrigin.current = null; }

  function moveWithKeyboard(event: React.KeyboardEvent<HTMLButtonElement>) {
    const offsets: Record<string, [number, number]> = { ArrowUp: [0, -12], ArrowDown: [0, 12], ArrowLeft: [-12, 0], ArrowRight: [12, 0] };
    const offset = offsets[event.key];
    if (!offset || !controllerRef.current) return;
    event.preventDefault();
    const bounds = controllerRef.current.getBoundingClientRect();
    setPosition({
      x: Math.max(8, Math.min(window.innerWidth - bounds.width - 8, bounds.left + offset[0])),
      y: Math.max(8, Math.min(window.innerHeight - bounds.height - 8, bounds.top + offset[1])),
    });
  }

  return (
    <div className={`demo-controller ${position ? "is-positioned" : ""}`} ref={controllerRef} style={position ? { left: position.x, top: position.y } : undefined}>
      <button aria-label="Move demo view switcher. Use arrow keys to reposition." className="demo-drag-handle" onKeyDown={moveWithKeyboard} onLostPointerCapture={endDrag} onPointerCancel={endDrag} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} type="button"><Grip aria-hidden="true" size={14} /><span className="demo-controller-label">Demo views</span></button>
      <div aria-label="Switch demo view" className="role-switcher" role="group">
        {roles.map((role) => (
          <button aria-pressed={value === role.id} className={`role-option ${value === role.id ? "is-selected" : ""}`} key={role.id} onClick={() => onChange(role.id)} type="button">
            <span>{role.label}</span>
            {role.id === "operator" && value === "operator" && attentionCount > 0 && <span aria-label={`${attentionCount} items need attention`} className="needs-look-count">{attentionCount}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function TopBar({ state, dispatch, onReset }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onReset: () => void }) {
  const isOperator = state.activeRole === "operator";
  return (
    <header className="topbar">
      <div className="flex items-center gap-3 min-w-0">
        <a aria-label="MAVI Trial OS" className="brand-lockup shrink-0" href="/portal">
          <MaviMark /><span className="brand-name">MAVI</span><span className="brand-divider" /><span className="product-name">Trial OS</span>
        </a>
        <div className="demo-label"><span className="demo-dot" /> Demo preview · illustrative data</div>
      </div>
      <div className="topbar-actions">
        {/* Global Demo Timeline Day Control */}
        <div className="topbar-day-control" aria-label="Trial timeline day scrubber">
          <button
            aria-label="Previous day"
            className="topbar-day-btn cursor-pointer"
            disabled={state.activeDay <= 1}
            onClick={() => dispatch({ type: "day", day: state.activeDay - 1 })}
            title="Previous day (press [)"
            type="button"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="topbar-day-label">
            Day <strong className="tabular-nums font-normal text-[var(--ink)]">{state.activeDay}</strong> <span className="topbar-day-total">of 14</span>
          </span>
          <button
            aria-label="Next day"
            className="topbar-day-btn cursor-pointer"
            disabled={state.activeDay >= 14}
            onClick={() => dispatch({ type: "day", day: state.activeDay + 1 })}
            title="Next day (press ])"
            type="button"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {isOperator && (
          <>
            <button aria-label="Reset demo" className="icon-button cursor-pointer" onClick={onReset} title="Reset demo" type="button">
              <RotateCcw size={15} />
            </button>
            <div aria-hidden="true" className="operator-avatar">P</div>
          </>
        )}
      </div>
    </header>
  );
}

function TrialHeading({ trial, role }: { trial: TrialWorkspace; role: UserRole }) {
  const title = role === "candidate" ? `Welcome back, ${trial.candidate.handle}` : role === "operator" ? `${trial.client.name} trial` : trial.client.name;
  const subtitle = role === "candidate" ? `${trial.client.name} · Working trial` : role === "operator" ? "MAVI operations" : "14-day working trial";
  return (
    <div className="trial-heading">
      <div>
        <div className="breadcrumb"><span>{role === "customer" ? "Your trial" : role === "candidate" ? "Talent workspace" : "MAVI operations"}</span><ChevronRight size={13} /><span>{trial.client.name}</span></div>
        <div className="heading-row">
          <h1>{title}</h1>
          {role === "customer" && <Badge className="industry-tag" variant="secondary">{trial.client.industry}</Badge>}
        </div>
        {role !== "operator" && <p className="heading-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}



function CandidateIdentityStrip({
  trial,
  onInspect,
}: {
  trial: TrialWorkspace;
  onInspect: () => void;
}) {
  const { candidate } = trial;
  const initial = candidate.handle.replace(/[^A-Z]/g, "").charAt(0) || candidate.handle.charAt(0) || "M";

  return (
    <div className="candidate-identity-strip">
      <div className="candidate-identity-strip-left">
        <div className="candidate-monogram" aria-hidden="true">{initial}</div>
        <div className="candidate-identity-copy">
          <div className="candidate-identity-name-row">
            <span className="candidate-identity-name">{candidate.handle}</span>
            <span className="candidate-identity-verified">
              <ShieldCheck size={10} aria-hidden="true" />
              Verified
            </span>
          </div>
          <span className="candidate-identity-meta">{candidate.title} · {candidate.pedigree}</span>
        </div>
      </div>
      <div className="candidate-identity-strip-stats" aria-label="Key candidate metrics">
        <div className="candidate-identity-stat">
          <span className="tabular-nums">{candidate.hallucinationScore}<small>/100</small></span>
          <span>Accuracy</span>
        </div>
        <div className="candidate-identity-stat-divider" aria-hidden="true" />
        <div className="candidate-identity-stat">
          <span className="tabular-nums">{candidate.auditSpeedup}<small>×</small></span>
          <span>Throughput</span>
        </div>
      </div>
      <button
        className="candidate-identity-open-btn"
        onClick={onInspect}
        type="button"
        aria-label="Open full candidate profile"
      >
        Full profile <ArrowRight size={12} aria-hidden="true" />
      </button>
    </div>
  );
}

function CustomerView({ state, dispatch, onModal }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onModal: (modal: ModalName) => void }) {
  const [activeSurface, setActiveSurface] = useState<"portal" | "slack">("portal");
  const phase = getPhase(state.activeDay);
  const tasks = state.trial.customerTasks[phase];
  const pendingAccess = state.trial.access.filter((item) => item.status !== "PROVISIONED");
  const rampItem = state.trial.access.find((item) => item.id === "ramp");
  const isRampResolved = rampItem?.status === "PROVISIONED";
  const isDecisionWindow = state.activeDay >= 12;

  const handleGrantRamp = () => {
    dispatch({ type: "access", id: "ramp", status: "PROVISIONED" });
    dispatch({ type: "resolve-escalation", id: "access-ramp" });
  };

  return (
    <div className="role-workspace">
      {/* ── Surface Segmented Switcher [Web Portal | #finance-athena] ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-[var(--line)]">
        <div
          className="inline-flex items-center p-0.5 rounded-lg border border-[var(--line)] bg-[var(--canvas)] text-xs"
          role="tablist"
          aria-label="Customer view surface mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSurface === "portal"}
            onClick={() => setActiveSurface("portal")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-normal transition-colors duration-150 cursor-pointer ${
              activeSurface === "portal"
                ? "bg-white text-[var(--ink)] shadow-none border border-[var(--line)]/60"
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-normal transition-colors duration-150 cursor-pointer ${
              activeSurface === "slack"
                ? "bg-white text-[var(--ink)] shadow-none border border-[var(--line)]/60"
                : "text-[var(--soft-muted)] hover:text-[var(--ink)]"
            }`}
          >
            <SlackMark size={14} />
            <span>#finance-athena</span>
            {!isRampResolved && state.activeDay <= 2 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" title="1 action pending in Slack" />
            )}
          </button>
        </div>

        <Button className="button-secondary" onClick={() => onModal("customer")} size="sm" type="button" variant="outline">
          <MessageSquareText size={15} />
          Private note to MAVI
        </Button>
      </div>

      {activeSurface === "slack" ? (
        <AthenaSlackChannelView
          isRampResolved={isRampResolved}
          onGrantRampAccess={handleGrantRamp}
          onCopyInstructions={() => {
            const text = "Athena Club IT Instructions: Please grant Candidate M-402 (m-402@talent.mavi.work) read/approver permissions in Ramp (Settings > Roles & Permissions > Approver). Required for Phase 2 Shopify sales reconciliation.";
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(text);
            }
          }}
          onOpenDossier={() => onModal("dossier")}
          candidateHandle={state.trial.candidate.handle}
          candidateTitle={state.trial.candidate.title}
          clientName={state.trial.client.name}
          activeDay={state.activeDay}
        />
      ) : (
        <>
          <div className="role-intro">
            <div>
              <h2>
                Your 14-day gameplan <span className="heading-context">CUSTOMER VIEW</span>
              </h2>
              <p>See what happens next, what’s waiting on your team, and where MAVI can help.</p>
            </div>
          </div>

          <CandidateIdentityStrip trial={state.trial} onInspect={() => onModal("dossier")} />
          <section className="today-panel">
            <div className="today-heading">
              <h3>
                What’s happening now{" "}
                <span className="heading-context">
                  DAY {state.activeDay} · {isDecisionWindow ? "DECISION GATE" : state.activeDay >= 8 ? "AUDIT & REVIEW" : phases.find((item) => item.id === phase)?.label.toUpperCase()}
                </span>
              </h3>
              <span className="task-count">{tasks.filter((task) => task.completed).length} of {tasks.length} complete</span>
            </div>
            <div className="task-list">
              {tasks.map((task) => {
                const isHireTask = task.id === "hire-decision";
                const isLocked = isHireTask && !isDecisionWindow;
                return (
                  <TaskRow
                    key={task.id}
                    completed={task.completed}
                    disabled={isLocked}
                    disabledLabel="Unlocks Day 12"
                    label={task.label}
                    onToggle={() => {
                      if (isLocked) return;
                      dispatch({ type: "task", phase, role: "customer", id: task.id });
                    }}
                  />
                );
              })}
            </div>
            {!isDecisionWindow && (
              <div className="customer-pulse-row">
                <div>
                  <strong>{state.activeDay <= 7 ? "How is the first week going?" : "How is the review going?"}</strong>
                  <span>Your pulse is shared with MAVI, never directly with the candidate.</span>
                </div>
                <Button className="button-primary" onClick={() => onModal("pulse")} size="lg" type="button">
                  Send a progress pulse <ArrowRight size={15} />
                </Button>
              </div>
            )}
          </section>
          {pendingAccess.length > 0 && (
            <section aria-label="Access requests needing your team" className="access-request-panel">
              <div>
                <h3>Still needed from your team</h3>
                <p>Access stays visible here until it’s ready, even as the trial moves forward.</p>
              </div>
              {pendingAccess.map((item) => (
                <div className="access-request" key={item.id}>
                  <span>
                    <AlertTriangle size={15} />
                    {item.name} · waiting {elapsedLabel(item.updatedAtHoursAgo)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="small-link text-[var(--brand)] cursor-pointer"
                      onClick={() => setActiveSurface("slack")}
                      type="button"
                    >
                      View in #finance-athena
                    </button>
                    <button
                      className="small-link cursor-pointer"
                      onClick={() => dispatch({ type: "access", id: item.id, status: "PROVISIONED" })}
                      type="button"
                    >
                      Mark as provided
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
          {isDecisionWindow && (
            <section className={`conversion-panel ${state.trial.telemetry.converted ? "conversion-complete" : ""}`}>
              <div>
                <span className="conversion-kicker">DAYS 12–14 · RETAINER DECISION GATE</span>
                <h3>{state.trial.telemetry.converted ? "You’ve chosen to move forward." : "Ready to bring this talent onto your team?"}</h3>
                <p>{state.trial.telemetry.converted ? "This selection is recorded in the illustrative demo only." : "Review the trial together, then record your decision. No contract or billing is created."}</p>
              </div>
              {state.trial.telemetry.converted ? (
                <span className="conversion-status">
                  <CheckCircle2 size={16} />Selected in demo
                </span>
              ) : (
                <Button className="button-primary" onClick={() => onModal("convert")} size="lg" type="button">
                  Hire this candidate <ArrowRight size={15} />
                </Button>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TaskRow({ completed, disabled = false, disabledLabel = "Waiting on client", label, onToggle }: { completed: boolean; disabled?: boolean; disabledLabel?: string; label: string; onToggle: () => void }) {
  return <button aria-pressed={completed} className={`task-row ${completed ? "task-complete" : ""}`} disabled={disabled} onClick={onToggle} type="button"><span className="task-check">{completed && <Check size={13} />}</span><span>{label}</span><span className="task-row-action">{disabled ? disabledLabel : completed ? "Done" : "Mark done"}</span></button>;
}

function CandidateView({ state, dispatch, onModal }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onModal: (modal: ModalName) => void }) {
  const phase = getPhase(state.activeDay);
  const tasks = state.trial.candidateTasks[phase];
  const blocked = state.trial.candidateBlockers.some((item) => !item.resolved);
  const accessItems = state.trial.access;
  return (
    <div className="role-workspace">
      <div className="role-intro candidate-intro">
        <div>
          <h2>
            Welcome back, {state.trial.candidate.handle} <span className="heading-context">CANDIDATE VIEW</span>
          </h2>
          <p>{state.trial.client.name} · Working trial</p>
        </div>
      </div>
      <div className="candidate-day-banner"><div className="day-tile"><span>DAY</span><b>{state.activeDay}</b></div><div><h3>{state.trial.client.deliverable}</h3><p>Work hours overlap: {state.trial.candidate.overlap}</p></div><div className="focus-side"><span>{tasks.filter((task) => task.completed).length} / {tasks.length} tasks</span><span>{phase === "setup" ? "Get access ready" : phase === "delivery" ? "First milestone" : "Final review"}</span></div></div>
      <section className="today-panel candidate-tasks">
        <div className="today-heading"><h3>{phase === "setup" ? "Get set up" : phase === "delivery" ? "First milestone sprint" : "Close and handoff"} <span className="heading-context">TODAY’S CHECKLIST · DAY {state.activeDay}</span></h3><span className="task-count">{tasks.filter((task) => task.completed).length} of {tasks.length} complete</span></div>
        <div className="task-list">{tasks.map((task) => {
          const blocker = candidateTaskBlocker(state.trial, task.id);
          return <TaskRow disabled={!task.completed && Boolean(blocker)} disabledLabel={blocker ?? "Waiting on a prerequisite"} key={task.id} completed={task.completed} label={task.label} onToggle={() => dispatch({ type: "task", phase, role: "candidate", id: task.id })} />;
        })}</div>
      </section>
      <section className="access-panel">
        <div className="access-panel-head"><h3>Tool access <span className="heading-context">READY WHEN YOU ARE</span></h3><LockKeyhole size={18} /></div>
        {accessItems.map((item) => {
          const ready = item.status === "PROVISIONED";
          return <div className={`candidate-access-row ${ready ? "access-ready" : ""}`} key={item.id}><span className="access-status-icon">{ready ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}</span><span><b>{item.name}</b><small>{ready ? "Available for this trial" : `Waiting on client access · ${elapsedLabel(item.updatedAtHoursAgo)} elapsed`}</small></span><Badge className={ready ? "ready-tag" : "pending-tag"} variant="outline">{ready ? "Ready" : "Pending"}</Badge></div>;
        })}
        <Button className="button-secondary blocked-cta" onClick={() => onModal("candidate")} size="lg" type="button" variant="outline"><CircleHelp size={15} />{blocked ? "Update my blocker" : "I’m blocked on access"}<ArrowRight size={14} /></Button>
      </section>
    </div>
  );
}

function TrialDialog({ modal, state, dispatch, interventionId, onClose, onToast }: { modal: ModalName; state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; interventionId: string | null; onClose: () => void; onToast: (message: string) => void }) {
  const [category, setCategory] = useState("Access delay");
  const [tool, setTool] = useState("NetSuite");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<"GREEN" | "YELLOW" | "RED">("GREEN");
  const [nudgeLogged, setNudgeLogged] = useState(false);
  const activeBlocker = state.trial.candidateBlockers.find((item) => !item.resolved);
  const intervention = state.trial.escalations.find((item) => item.id === interventionId);
  const accessId = intervention?.id.startsWith("access-") ? intervention.id.slice("access-".length) : null;
  const accessItem = accessId ? state.trial.access.find((item) => item.id === accessId) : null;
  const isDialogOpen = Boolean(modal) && modal !== "dossier";

  useEffect(() => {
    if (modal !== "candidate" || activeBlocker) return;
    const pending = state.trial.access.find((item) => item.status !== "PROVISIONED");
    if (pending) setTool(pending.name.split(" · ")[0]);
  }, [activeBlocker, modal, state.trial.access]);

  useEffect(() => { setNudgeLogged(false); }, [interventionId, modal]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modal === "customer") dispatch({ type: "customer-note", category, note });
    if (modal === "candidate") dispatch({ type: "candidate-blocker", tool, issue: note });
    if (modal === "pulse") dispatch({ type: "pulse", rating, note });
    if (modal === "convert") dispatch({ type: "convert" });
    setNote("");
    onClose();
  }

  const isConvert = modal === "convert";
  const title = modal === "customer"
    ? "A private note to MAVI"
    : modal === "candidate"
    ? activeBlocker
      ? "Your blocker is with MAVI"
      : "Tell MAVI what's blocking you"
    : modal === "pulse"
    ? "How is the trial going?"
    : modal === "convert"
    ? "Ready to continue together?"
    : "Send a nudge to Slack";

  const helper = modal === "customer"
    ? "Only the MAVI operator sees this note in the demo. Your candidate will not."
    : modal === "candidate"
    ? activeBlocker
      ? "The MAVI operator can see this blocker. The customer cannot."
      : "This goes to the MAVI operator in the demo. The customer does not see your private blocker."
    : modal === "pulse"
    ? "Your pulse is shared with MAVI so they can help keep the trial on track."
    : modal === "convert"
    ? "This confirms the conversion in the demo only. No contract or billing is created."
    : "Planned MAVI Slack bot: in a connected workspace, it would send this follow-up to the trial team. This illustrative preview does not send a Slack message.";

  return (
    <Dialog onOpenChange={(open) => { if (!open) onClose(); }} open={isDialogOpen}>
      <DialogContent className="trial-dialog" showCloseButton={false}>
      <form onSubmit={submit}>
        <div className="dialog-head"><span className="dialog-icon">{isConvert ? <BadgeCheck size={18} /> : modal === "candidate" ? <CircleHelp size={18} /> : <MessageSquareText size={18} />}</span><button aria-label="Close" className="icon-button" onClick={onClose} type="button"><X size={17} /></button></div>
        <DialogTitle className="dialog-title" id="dialog-title">{title}</DialogTitle><DialogDescription className="dialog-helper">{helper}</DialogDescription>

        {modal === "slack" && <div className="slack-preview"><div className="slack-preview-head"><span><SlackMark size={16} />Illustrative Slack message</span><b>DEMO</b></div><div className="slack-channel"><span>#</span> trial-athena <small>illustrative channel</small></div><div className="slack-message-row"><div aria-hidden="true" className="slack-bot-avatar"><MaviMark /></div><div className="slack-message-content"><div className="slack-message-meta"><strong>MAVI Trial Bot</strong><span className="slack-app-badge">APP</span><time>Now</time></div><p>{accessItem ? `${accessItem.name} has been waiting ${elapsedLabel(accessItem.updatedAtHoursAgo)}. Can the trial owner confirm when access is available so ${state.trial.candidate.handle} can continue?` : intervention?.source === "CANDIDATE" ? "A private candidate blocker needs operator follow-up." : intervention?.source === "CUSTOMER" ? "A private customer update needs operator follow-up." : intervention?.message ?? "Review this trial and choose a follow-up."}</p></div></div><div className="slack-preview-note">Demo preview · no message sent</div></div>}
        {modal === "customer" && <label className="form-label">What do you need help with?<Select onValueChange={setCategory} value={category}><SelectTrigger aria-label="Feedback category" className="form-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Access delay">Access delay</SelectItem><SelectItem value="Communication cadence">Communication cadence</SelectItem><SelectItem value="Technical quality">Technical quality</SelectItem></SelectContent></Select></label>}
        {modal === "candidate" && activeBlocker ? <div className="blocker-receipt"><span>OPEN BLOCKER · DAY {activeBlocker.day}</span><b>{activeBlocker.tool}</b><p>{activeBlocker.issue}</p></div> : null}
        {modal === "candidate" && !activeBlocker && <label className="form-label">Which tool is blocking you?<Select onValueChange={setTool} value={tool}><SelectTrigger aria-label="Blocked tool" className="form-select"><SelectValue /></SelectTrigger><SelectContent>{["NetSuite", "Ramp", "Shopify", "QuickBooks", "Stripe", "Slack", "Other"].map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></label>}
        {modal === "pulse" && <fieldset className="pulse-options"><legend>How is the candidate doing?</legend>{(["GREEN", "YELLOW", "RED"] as const).map((value) => <label className={`pulse-option pulse-${value.toLowerCase()} ${rating === value ? "pulse-selected" : ""}`} key={value}><input checked={rating === value} name="pulse" onChange={() => setRating(value)} type="radio" value={value} /><span>{value === "GREEN" ? "On track" : value === "YELLOW" ? "Needs alignment" : "Escalation required"}</span></label>)}</fieldset>}
        {!isConvert && !(modal === "candidate" && activeBlocker) && modal !== "slack" && <label className="form-label">{modal === "candidate" ? "What's the issue?" : modal === "pulse" ? "Anything MAVI should know? (Optional)" : "Add a note (optional)"}<textarea aria-label={modal === "candidate" ? "What's the issue?" : modal === "pulse" ? "Anything MAVI should know?" : "Add a note"} onChange={(event) => setNote(event.target.value)} placeholder={modal === "candidate" ? "I'm waiting on access to…" : modal === "customer" ? "Tell your MAVI operator what would help…" : "Share context for your MAVI operator…"} required={modal === "candidate"} rows={4} value={note} /></label>}
        {modal === "slack" ? <div className="dialog-actions"><Button className="button-secondary" onClick={onClose} size="lg" type="button" variant="outline">Close preview</Button>{accessItem?.status !== "PROVISIONED" && accessItem && <Button className="button-secondary" onClick={() => { dispatch({ type: "access", id: accessItem.id, status: "PROVISIONED" }); onToast("Access marked provided in the illustrative demo"); onClose(); }} size="lg" type="button" variant="outline">Simulate access provided</Button>}<Button className="button-primary" disabled={nudgeLogged} onClick={() => { if (!intervention) return; dispatch({ type: "operator-nudge", message: `${intervention.id}: simulated follow-up logged` }); setNudgeLogged(true); onToast("Slack nudge simulated · no message sent"); }} size="lg" type="button"><SlackMark size={16} />{nudgeLogged ? "Nudge simulated" : "Send nudge to Slack"}</Button></div> : <div className="dialog-actions"><Button className="button-secondary" onClick={onClose} size="lg" type="button" variant="outline">{modal === "candidate" && activeBlocker ? "Close" : "Cancel"}</Button>{!(modal === "candidate" && activeBlocker) && <Button className="button-primary" size="lg" type="submit">{isConvert ? "Confirm in demo" : modal === "candidate" ? "Send blocker to MAVI" : modal === "pulse" ? "Submit pulse" : "Send private note"}<ArrowRight size={15} /></Button>}</div>}
        {<div className="dialog-demo-note"><span className="demo-dot" />Demo only · no external message is sent</div>}
      </form>
      </DialogContent>
    </Dialog>
  );
}

function DossierDrawer({ open, state, onClose, onNote }: { open: boolean; state: TrialOSState; onClose: () => void; onNote: () => void }) {
  const { candidate, workspace } = state.trial;
  const initial = candidate.handle.replace(/[^A-Z]/g, "").charAt(0) || candidate.handle.charAt(0) || "M";

  // Trap focus and close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`dossier-backdrop ${open ? "dossier-backdrop-visible" : ""}`}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <aside
        aria-label="Candidate profile"
        aria-modal="true"
        className={`dossier-drawer ${open ? "dossier-drawer-open" : ""}`}
        role="dialog"
      >
        {/* Header */}
        <div className="dossier-drawer-header">
          <div className="dossier-drawer-identity">
            <div className="candidate-monogram large" aria-hidden="true">{initial}</div>
            <div>
              <div className="dossier-drawer-name-row">
                <span className="dossier-drawer-name">{candidate.handle}</span>
                <span className="candidate-identity-verified">
                  <ShieldCheck size={10} aria-hidden="true" />
                  Verified
                </span>
              </div>
              <span className="dossier-drawer-role">{candidate.title}</span>
            </div>
          </div>
          <button aria-label="Close profile" className="icon-button" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        {/* Pedigree line */}
        <p className="dossier-drawer-pedigree">{candidate.pedigree}</p>

        {/* Data rows — no nested cards, no hero-metric grid */}
        <div className="dossier-data-table" role="list">
          <div className="dossier-data-row" role="listitem">
            <span>Accuracy benchmark</span>
            <strong className="tabular-nums">{candidate.hallucinationScore}<small>/100</small></strong>
          </div>
          <div className="dossier-data-row" role="listitem">
            <span>Audit throughput</span>
            <strong className="tabular-nums">{candidate.auditSpeedup}<small>×</small> faster</strong>
          </div>
          <div className="dossier-data-row" role="listitem">
            <span>Working hours</span>
            <strong>{candidate.overlap}</strong>
          </div>
          <div className="dossier-data-row" role="listitem">
            <span>Secure desktop</span>
            <strong>{workspace.region} · SOC 2</strong>
          </div>
        </div>

        {/* Tool stack */}
        <div className="dossier-section">
          <span className="dossier-section-label">Verified tool stack</span>
          <div className="dossier-tools">
            {candidate.tools.map((tool) => (
              <span className="tool-tag" key={tool}>{tool}</span>
            ))}
          </div>
        </div>

        {/* Assessment */}
        <div className="dossier-section">
          <span className="dossier-section-label">Technical assessment</span>
          <p className="dossier-assessment-text">{candidate.challenge}</p>
        </div>

        {/* Footer CTA */}
        <div className="dossier-drawer-footer">
          <button
            className="dossier-note-btn"
            onClick={() => { onClose(); onNote(); }}
            type="button"
          >
            <MessageSquareText size={13} aria-hidden="true" />
            Private note to MAVI
          </button>
          <span className="dossier-demo-note"><span className="demo-dot" />Illustrative data</span>
        </div>
      </aside>
    </>
  );
}

export default function TrialPortal() {
  const [state, dispatch] = useReducer(trialReducer, undefined, createInitialState);
  const [modal, setModal] = useState<ModalName>(null);
  const [interventionId, setInterventionId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trial = state.trial;
  const needsLookCount = trial.escalations.filter((item) => !item.resolved).length;

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (modal !== null) return;

      if (e.key === "[" || (e.altKey && e.key === "ArrowLeft")) {
        e.preventDefault();
        dispatch({ type: "day", day: Math.max(1, state.activeDay - 1) });
      } else if (e.key === "]" || (e.altKey && e.key === "ArrowRight")) {
        e.preventDefault();
        dispatch({ type: "day", day: Math.min(14, state.activeDay + 1) });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.activeDay, modal]);

  return (
    <div className={`portal-shell role-${state.activeRole}`}>
      <TopBar dispatch={dispatch} onReset={() => { dispatch({ type: "reset" }); showToast("Trial reset to its illustrative starting state"); }} state={state} />
      <main className="portal-main">
        <div className="role-surface" key={state.activeRole}>
          {state.activeRole === "operator" && <OperatorDashboard dispatch={dispatch} onPreviewFollowup={(id) => { setInterventionId(id); setModal("slack"); }} onToast={showToast} state={state} />}
          {state.activeRole !== "operator" && (
            <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
              <div className="flex-1 min-w-0 w-full space-y-4">
                {state.activeRole === "customer" && <CustomerView dispatch={dispatch} onModal={setModal} state={state} />}
                {state.activeRole === "candidate" && <CandidateView dispatch={dispatch} onModal={setModal} state={state} />}
              </div>
              <VerticalTrialTimeline state={state} dispatch={dispatch} className="w-full lg:w-72 shrink-0 sticky top-20 self-start" />
            </div>
          )}
        </div>
      </main>
      <footer className="portal-footer"><span><MaviMark /> MAVI Trial OS</span><span>14-day activation room · <b>local state</b></span><button onClick={() => showToast("Scenario data is illustrative. No real client or candidate account is connected.")} type="button"><CircleHelp size={14} />About this demo</button></footer>
      <div aria-live="polite" role="status">
        {toast && (
          <div className="toast-message">
            <CheckCircle2 size={16} />
            <span>{toast}</span>
            <button aria-label="Dismiss notification" onClick={() => setToast("")} type="button">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <TrialDialog dispatch={dispatch} interventionId={interventionId} modal={modal} onClose={() => setModal(null)} onToast={showToast} state={state} />
      <DossierDrawer open={modal === "dossier"} state={state} onClose={() => setModal(null)} onNote={() => setModal("customer")} />
      <DemoController attentionCount={needsLookCount} onChange={(role) => dispatch({ type: "role", role })} value={state.activeRole} />
    </div>
  );
}

