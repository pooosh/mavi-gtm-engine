"use client";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Grip,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useReducer, useRef, useState } from "react";
import { SlackMark } from "@/components/brand/slack-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ACCESS_SLA_WARNING_HOURS,
  candidateTaskBlocker,
  createInitialState,
  getTrialHealth,
  TrialOSState,
  TrialWorkspace,
  trialReducer,
  UserRole,
} from "@/lib/trial";

type ModalName = "customer" | "candidate" | "pulse" | "convert" | "slack" | null;
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

function MaviMark() {
  return (
    <svg aria-hidden="true" className="mavi-mark" viewBox="0 0 36 30" fill="none">
      <path d="M4 24.5V5.5c0-1.1 1.3-1.6 2.1-.8L18 17.8 29.9 4.7c.8-.8 2.1-.3 2.1.8v19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 24.5c0 1.1 1.3 1.6 2.1.8L18 12.2 29.9 25.3c.8.8 2.1.3 2.1-.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function healthLabel(health: ReturnType<typeof getTrialHealth>) {
  return health === "AT_RISK" ? "At risk" : health === "OFF_TRACK" ? "Off track" : "On track";
}

function elapsedLabel(hours: number) {
  if (hours >= 48) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h`;
}

function getPhase(day: number): PhaseKey {
  return day <= 2 ? "setup" : day <= 7 ? "delivery" : "close";
}

function trialTaskCount(tasks: TrialWorkspace["customerTasks"], candidateTasks?: TrialWorkspace["candidateTasks"]) {
  const all = [...tasks.setup, ...tasks.delivery, ...tasks.close, ...(candidateTasks ? [...candidateTasks.setup, ...candidateTasks.delivery, ...candidateTasks.close] : [])];
  return { complete: all.filter((task) => task.completed).length, total: all.length };
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
      <a aria-label="MAVI Trial OS" className="brand-lockup" href="/portal">
        <MaviMark /><span className="brand-name">MAVI</span><span className="brand-divider" /><span className="product-name">Trial OS</span>
      </a>
      <div className="demo-label"><span className="demo-dot" /> Demo preview · illustrative data</div>
      {isOperator && <div className="topbar-actions">
        <Select onValueChange={(id) => dispatch({ type: "template", id })} value={state.trial.id}>
          <SelectTrigger aria-label="Trial scenario" className="scenario-select"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="athena">Athena Club</SelectItem><SelectItem value="tracedata">TraceData Systems</SelectItem></SelectContent>
        </Select>
        <button aria-label="Reset demo" className="icon-button" onClick={onReset} title="Reset demo" type="button"><RotateCcw size={16} /></button>
        <div aria-hidden="true" className="operator-avatar">P</div>
      </div>}
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
        <p className="heading-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

function TrialTimeline({ day, onChange }: { day: number; onChange: (day: number) => void }) {
  const [celebratingDay, setCelebratingDay] = useState<number | null>(null);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phase = getPhase(day);
  const progress = ((day - 1) / 13) * 100;
  const milestones = [3, 8, 14];

  useEffect(() => () => {
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
  }, []);

  function setDay(nextDay: number) {
    if (nextDay === day) return;
    onChange(nextDay);
    if (!milestones.includes(nextDay)) return setCelebratingDay(null);
    setCelebratingDay(nextDay);
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    celebrationTimer.current = setTimeout(() => setCelebratingDay(null), 850);
  }

  return (
    <section aria-label="14-day trial timeline" className="trial-timeline">
      <div className="timeline-header">
        <div className="timeline-title"><CalendarDays aria-hidden="true" size={16} /><strong>14-day trial</strong></div>
        <div aria-label="Choose trial day" className="timeline-day-control" role="group">
          <Button aria-label="Previous day" className="timeline-nav" disabled={day <= 1} onClick={() => setDay(day - 1)} size="icon" type="button" variant="outline"><ChevronLeft size={16} /></Button>
          <span>Day <b>{day}</b> of 14</span>
          <Button aria-label="Next day" className="timeline-nav" disabled={day >= 14} onClick={() => setDay(day + 1)} size="icon" type="button" variant="outline"><ChevronRight size={16} /></Button>
        </div>
      </div>
      <div className="timeline-slider-wrap">
        <div aria-hidden="true" className="timeline-track"><span className="timeline-track-base" /><span className="timeline-track-fill" style={{ width: `${progress}%` }} />
          {milestones.map((milestone) => <span className={`timeline-milestone ${day >= milestone ? "reached" : ""}`} key={milestone} style={{ left: `${((milestone - 1) / 13) * 100}%` }} />)}
          {celebratingDay !== null && <span aria-hidden="true" className="timeline-confetti" key={celebratingDay} style={{ left: `${progress}%` }}>{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</span>}
        </div>
        <input aria-label="Trial day" aria-valuetext={`Day ${day} of 14 · ${phases.find((item) => item.id === phase)?.label}`} className="timeline-range" max={14} min={1} onChange={(event) => setDay(Number(event.target.value))} step={1} style={{ "--timeline-progress": `${progress}%` } as React.CSSProperties} type="range" value={day} />
      </div>
      <div className="timeline-phases">
        {phases.map((item) => <div className={`timeline-phase ${item.id === phase ? "is-current" : ""}`} key={item.id}><b>{item.name}</b><span>{item.days}</span></div>)}
      </div>
      <span aria-live="polite" className="sr-only">{celebratingDay ? `${celebratingDay === 14 ? "Trial complete" : `${phases.find((item) => item.id === getPhase(celebratingDay))?.label} milestone`} · Day ${celebratingDay}` : ""}</span>
    </section>
  );
}

function CandidateProfileCard({ trial, onOpen }: { trial: TrialWorkspace; onOpen: () => void }) {
  return (
    <button aria-label={`Open illustrative profile for ${trial.candidate.handle}`} className="operator-profile-card" onClick={onOpen} type="button">
      <span className="candidate-monogram large">M</span>
      <span className="operator-profile-copy"><b>{trial.candidate.handle}</b><small>{trial.candidate.title}</small><span>View profile <ArrowUpRight size={12} /></span></span>
    </button>
  );
}

function CustomerCandidateSummary({ trial }: { trial: TrialWorkspace }) {
  return (
    <section aria-label="Illustrative candidate summary" className="customer-candidate-summary">
      <div className="candidate-monogram large">M</div>
      <div><span className="summary-label">YOUR CANDIDATE · ILLUSTRATIVE PROFILE</span><strong>{trial.candidate.handle}</strong><p>{trial.candidate.title} · {trial.candidate.pedigree}</p></div>
      <div className="customer-candidate-tools"><span>Experience with</span><div>{trial.candidate.tools.map((tool) => <span className="tool-tag" key={tool}>{tool}</span>)}</div></div>
    </section>
  );
}

function FlightPath({ trial, day }: { trial: TrialWorkspace; day: number }) {
  const phase = getPhase(day);
  const setupCustomer = trial.customerTasks.setup;
  const setupCandidate = trial.candidateTasks.setup;
  const pendingAccess = trial.access.filter((item) => item.status !== "PROVISIONED");
  const setupDone = setupCustomer.every((task) => task.completed) && setupCandidate.every((task) => task.completed) && pendingAccess.length === 0;
  const later = [
    { id: "delivery" as const, name: "First work", dates: "Days 3–7", copy: trial.client.deliverable, tasks: trial.candidateTasks.delivery },
    { id: "close" as const, name: "Decision", dates: "Days 8–14", copy: "Final review · candidate hire decision", tasks: trial.customerTasks.close },
  ];
  return (
    <section aria-label="Trial milestone flight path" className="flight-path-panel">
      <div className="flight-path-heading"><div><h2>Milestone flight path</h2><p>Owner progress by phase</p></div><span className="flight-phase-state">{phase === "setup" ? "Setup active" : phase === "delivery" ? "First work active" : "Decision active"}</span></div>
      <div className="flight-path-grid">
        <article className={`flight-phase-card setup-phase ${phase === "setup" ? "phase-active" : setupDone ? "phase-complete" : "phase-attention"}`}>
          <span className="flight-phase-overline"><span>Days 0–2</span><b>{phase === "setup" ? "Active" : setupDone ? "Complete" : "Needs follow-up"}</b></span>
          <h3>System setup</h3>
          <div className="phase-owner-progress"><span>Customer</span><b>{setupCustomer.filter((task) => task.completed).length}/{setupCustomer.length}</b></div>
          <div className="phase-owner-progress"><span>Candidate</span><b>{setupCandidate.filter((task) => task.completed).length}/{setupCandidate.length}</b></div>
          <div className={`phase-access-state ${pendingAccess.length ? "has-pending" : ""}`}><span />{pendingAccess.length ? `${pendingAccess.length} access step${pendingAccess.length === 1 ? "" : "s"} outstanding` : "Access ready"}</div>
        </article>
        {later.map((item) => {
          const itemPhaseIndex = phases.findIndex((entry) => entry.id === item.id);
          const currentPhaseIndex = phases.findIndex((entry) => entry.id === phase);
          const completed = item.tasks.length > 0 && item.tasks.every((task) => task.completed);
          const status = phase === item.id ? "Active" : currentPhaseIndex > itemPhaseIndex && completed ? "Complete" : currentPhaseIndex > itemPhaseIndex ? "Needs follow-up" : "Locked";
          return (
            <article className={`flight-phase-card future-phase ${phase === item.id ? "phase-active" : status === "Needs follow-up" ? "phase-attention" : status === "Complete" ? "phase-complete" : ""}`} key={item.id}>
              <span className="flight-phase-overline"><span>{item.dates}</span><b>{status}</b></span>
              <h3>{item.name}</h3>
              <p>{item.copy}</p>
              <small>{item.tasks.length} planned tasks</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CustomerView({ state, dispatch, onModal }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onModal: (modal: ModalName) => void }) {
  const phase = getPhase(state.activeDay);
  const tasks = state.trial.customerTasks[phase];
  const pendingAccess = state.trial.access.filter((item) => item.status !== "PROVISIONED");
  return (
    <div className="role-workspace">
      <div className="role-intro">
        <div><h2>Your 14-day gameplan <span className="heading-context">CUSTOMER VIEW</span></h2><p>See what happens next, what’s waiting on your team, and where MAVI can help.</p></div>
        <Button className="button-secondary" onClick={() => onModal("customer")} size="lg" type="button" variant="outline"><MessageSquareText size={16} />Private note to MAVI</Button>
      </div>
      <section className="today-panel">
        <div className="today-heading"><h3>What’s happening now <span className="heading-context">DAY {state.activeDay} · {phases.find((item) => item.id === phase)?.label.toUpperCase()}</span></h3><span className="task-count">{tasks.filter((task) => task.completed).length} of {tasks.length} complete</span></div>
        <div className="task-list">
          {tasks.map((task) => <TaskRow key={task.id} completed={task.completed} label={task.label} onToggle={() => dispatch({ type: "task", phase, role: "customer", id: task.id })} />)}
        </div>
        <div className="customer-pulse-row"><div><strong>How is the first week going?</strong><span>Your pulse is shared with MAVI, never directly with the candidate.</span></div><Button className="button-primary" onClick={() => onModal("pulse")} size="lg" type="button">Send a progress pulse <ArrowRight size={15} /></Button></div>
      </section>
      {pendingAccess.length > 0 && <section aria-label="Access requests needing your team" className="access-request-panel"><div><h3>Still needed from your team</h3><p>Access stays visible here until it’s ready, even as the trial moves forward.</p></div>{pendingAccess.map((item) => <div className="access-request" key={item.id}><span><AlertTriangle size={15} />{item.name} · waiting {elapsedLabel(item.updatedAtHoursAgo)}</span><button className="small-link" onClick={() => dispatch({ type: "access", id: item.id, status: "PROVISIONED" })} type="button">Mark as provided</button></div>)}</section>}
      {phase === "close" && (
        <section className={`conversion-panel ${state.trial.telemetry.converted ? "conversion-complete" : ""}`}>
          <div><span className="conversion-kicker">DAY 14 · FINAL DECISION</span><h3>{state.trial.telemetry.converted ? "You’ve chosen to move forward." : "Ready to bring this talent onto your team?"}</h3><p>{state.trial.telemetry.converted ? "This selection is recorded in the illustrative demo only." : "Review the trial together, then record your decision. No contract or billing is created."}</p></div>
          {state.trial.telemetry.converted ? <span className="conversion-status"><CheckCircle2 size={16} />Selected in demo</span> : <Button className="button-primary" onClick={() => onModal("convert")} size="lg" type="button">Hire this candidate <ArrowRight size={15} /></Button>}
        </section>
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
        <div><h2>Your workday, without the guesswork. <span className="heading-context">CANDIDATE VIEW</span></h2><p>Today’s priorities and the tools you’re waiting on, in one place.</p></div>
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

function OperatorView({ state, dispatch, onPreviewFollowup, onToast }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onPreviewFollowup: (id: string) => void; onToast: (message: string) => void }) {
  const { trial } = state;
  const [profileOpen, setProfileOpen] = useState(false);
  const open = trial.escalations.filter((item) => !item.resolved);
  const activeIntervention = open.find((item) => item.source === "ACCESS") ?? open[0];
  const accessItem = activeIntervention?.source === "ACCESS"
    ? trial.access.find((item) => activeIntervention.id === `access-${item.id}`)
    : undefined;
  const tasks = trialTaskCount(trial.customerTasks, trial.candidateTasks);
  const health = getTrialHealth(trial);
  const remaining = Math.max(0, ACCESS_SLA_WARNING_HOURS - (accessItem?.updatedAtHoursAgo ?? 0));

  return (
    <div className="role-workspace operator-workspace">
      <div className="operator-overview">
        <CandidateProfileCard onOpen={() => setProfileOpen(true)} trial={trial} />
        <div className="operator-vitals" aria-label="Placement vitals">
          <div><span>TIME TO FIRST VALUE</span><b>{(trial.telemetry.ttfvHours / 24).toFixed(1)}<small> days</small></b></div>
          <div><span>PARTICIPANT TASKS</span><b>{tasks.complete}/{tasks.total}</b></div>
        </div>
        <Badge className={`health-chip ${health === "OFF_TRACK" ? "risk-chip" : health === "AT_RISK" ? "warning-chip" : "good-chip"}`} variant="outline"><span />{healthLabel(health)}</Badge>
        <div className="operator-day-control" aria-label="Demo trial day">
          <Button aria-label="Previous day" className="day-step" disabled={state.activeDay <= 1} onClick={() => dispatch({ type: "day", day: state.activeDay - 1 })} size="icon" type="button" variant="outline"><ChevronLeft size={15} /></Button>
          <span>Day <b>{state.activeDay}</b> <small>of 14</small></span>
          <Button aria-label="Next day" className="day-step" disabled={state.activeDay >= 14} onClick={() => dispatch({ type: "day", day: state.activeDay + 1 })} size="icon" type="button" variant="outline"><ChevronRight size={15} /></Button>
        </div>
      </div>

      <div className="operator-dashboard-grid">
        <FlightPath day={state.activeDay} trial={trial} />
        <section aria-label="Escalation hub" className="intervention-hub">
          <div className="hub-heading"><div><span className="hub-kicker">MAVI OPERATOR</span><h2>Escalation hub</h2></div><Badge className={open.length ? "warning-chip" : "good-chip"} variant="outline">{open.length} open</Badge></div>
          {activeIntervention ? <>
            <div className="active-intervention">
              <div className={`hub-signal ${accessItem ? accessItem.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS ? "signal-breach" : "signal-access" : ""}`}>{accessItem ? <LockKeyhole size={16} /> : activeIntervention.source === "CUSTOMER" ? <MessageSquareText size={16} /> : <UserRound size={16} />}</div>
              <div><span className="hub-kicker">{activeIntervention.source === "ACCESS" ? "CLIENT IT · ACCESS" : activeIntervention.source === "CUSTOMER" ? "CUSTOMER · PRIVATE NOTE" : "CANDIDATE · PRIVATE BLOCKER"}</span><h3>{accessItem?.name ?? activeIntervention.message}</h3>
              {accessItem ? <><p><b>{accessItem.updatedAtHoursAgo}h elapsed</b> <span>(SLA limit: {ACCESS_SLA_WARNING_HOURS}h)</span></p><div aria-label={`${accessItem.updatedAtHoursAgo} of ${ACCESS_SLA_WARNING_HOURS} SLA hours elapsed`} className={`sla-meter ${accessItem.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS ? "sla-breached" : ""}`}><span style={{ width: `${Math.min(100, accessItem.updatedAtHoursAgo / ACCESS_SLA_WARNING_HOURS * 100)}%` }} /></div><small>{remaining ? `${remaining}h until SLA threshold` : "SLA threshold reached · operator action required"}</small></> : <p>{activeIntervention.source === "CUSTOMER" ? trial.customerNotes.find((note) => activeIntervention.id === `report-${note.id}`)?.note : trial.candidateBlockers.find((blocker) => blocker.id === activeIntervention.id)?.issue}</p>}
              </div>
            </div>
            <div className="hub-actions">
              <Button className="button-primary dispatch-button" onClick={() => onPreviewFollowup(activeIntervention.id)} size="lg" type="button"><SlackMark size={17} />Dispatch Slack Nudge</Button>
              {accessItem && <Button className="button-secondary" onClick={() => { dispatch({ type: "resolve-escalation", id: activeIntervention.id }); onToast("Access marked provided in the illustrative demo"); }} size="lg" type="button" variant="outline"><Check size={15} />Mark access provided</Button>}
            </div>
            <p className="hub-disclaimer">Planned MAVI Slack bot · demo action only, no message sent.</p>
            {trial.interventions.some((entry) => entry.message.includes(activeIntervention.id)) && <span className="intervention-logged"><Check size={13} />Nudge logged in demo</span>}
          </> : <div className="hub-clear"><CheckCircle2 size={20} /><div><b>No active escalations</b><span>New access delays and private reports will appear here.</span></div></div>}
          {open.length > 1 && <details className="other-signals"><summary>Other signals <span>{open.length - 1}</span></summary><ul>{open.filter((item) => item.id !== activeIntervention?.id).map((item) => <li key={item.id}><span>{item.source}</span>{item.message}</li>)}</ul></details>}
        </section>
      </div>

      <Dialog onOpenChange={setProfileOpen} open={profileOpen}>
        <DialogContent className="candidate-detail-dialog">
          <div className="candidate-detail-head"><span className="candidate-monogram large">M</span><div><span className="hub-kicker">ILLUSTRATIVE PROFILE</span><DialogTitle>{trial.candidate.handle}</DialogTitle><DialogDescription>{trial.candidate.title} · {trial.candidate.pedigree}</DialogDescription></div></div>
          <div className="profile-metrics"><div><span>AI REVIEW SCORE</span><b>{trial.candidate.hallucinationScore}<small>/100</small></b></div><div><span>REVIEW SPEEDUP</span><b>{trial.candidate.auditSpeedup}<small>×</small></b></div></div>
          <div className="profile-detail-row"><b>Relevant tools</b><div>{trial.candidate.tools.map((tool) => <span className="tool-tag" key={tool}>{tool}</span>)}</div></div>
          <div className="profile-detail-row"><b>Trial observation</b><p>{trial.candidate.challenge}</p></div>
          <div className="profile-detail-row"><b>Workspace</b><p><ShieldCheck size={14} /> {trial.workspace.region} · security controls are illustrative</p></div>
        </DialogContent>
      </Dialog>
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
  const title = modal === "customer" ? "A private note to MAVI" : modal === "candidate" ? activeBlocker ? "Your blocker is with MAVI" : "Tell MAVI what’s blocking you" : modal === "pulse" ? "How is the trial going?" : modal === "convert" ? "Ready to continue together?" : "Send a nudge to Slack";
  const helper = modal === "customer" ? "Only the MAVI operator sees this note in the demo. Your candidate will not." : modal === "candidate" ? activeBlocker ? "The MAVI operator can see this blocker. The customer cannot." : "This goes to the MAVI operator in the demo. The customer does not see your private blocker." : modal === "pulse" ? "Your pulse is shared with MAVI so they can help keep the trial on track." : modal === "convert" ? "This confirms the conversion in the demo only. No contract or billing is created." : "Planned MAVI Slack bot: in a connected workspace, it would send this follow-up to the trial team. This illustrative preview does not send a Slack message.";
  return (
    <Dialog onOpenChange={(open) => { if (!open) onClose(); }} open={Boolean(modal)}>
      <DialogContent className="trial-dialog" showCloseButton={false}>
      <form onSubmit={submit}>
        <div className="dialog-head"><span className="dialog-icon">{isConvert ? <BadgeCheck size={18} /> : modal === "candidate" ? <CircleHelp size={18} /> : <MessageSquareText size={18} />}</span><button aria-label="Close" className="icon-button" onClick={onClose} type="button"><X size={17} /></button></div>
        <DialogTitle className="dialog-title" id="dialog-title">{title}</DialogTitle><DialogDescription className="dialog-helper">{helper}</DialogDescription>
        {modal === "slack" && <div className="slack-preview"><div className="slack-preview-head"><span><SlackMark size={16} />Illustrative Slack message</span><b>DEMO</b></div><div className="slack-channel"><span>#</span> trial-athena <small>illustrative channel</small></div><div className="slack-message-row"><div aria-hidden="true" className="slack-bot-avatar"><MaviMark /></div><div className="slack-message-content"><div className="slack-message-meta"><strong>MAVI Trial Bot</strong><span className="slack-app-badge">APP</span><time>Now</time></div><p>{accessItem ? `${accessItem.name} has been waiting ${elapsedLabel(accessItem.updatedAtHoursAgo)}. Can the trial owner confirm when access is available so ${state.trial.candidate.handle} can continue?` : intervention?.source === "CANDIDATE" ? "A private candidate blocker needs operator follow-up." : intervention?.source === "CUSTOMER" ? "A private customer update needs operator follow-up." : intervention?.message ?? "Review this trial and choose a follow-up."}</p></div></div><div className="slack-preview-note">Demo preview · no message sent</div></div>}
        {modal === "customer" && <label className="form-label">What do you need help with?<Select onValueChange={setCategory} value={category}><SelectTrigger aria-label="Feedback category" className="form-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Access delay">Access delay</SelectItem><SelectItem value="Communication cadence">Communication cadence</SelectItem><SelectItem value="Technical quality">Technical quality</SelectItem></SelectContent></Select></label>}
        {modal === "candidate" && activeBlocker ? <div className="blocker-receipt"><span>OPEN BLOCKER · DAY {activeBlocker.day}</span><b>{activeBlocker.tool}</b><p>{activeBlocker.issue}</p></div> : null}
        {modal === "candidate" && !activeBlocker && <label className="form-label">Which tool is blocking you?<Select onValueChange={setTool} value={tool}><SelectTrigger aria-label="Blocked tool" className="form-select"><SelectValue /></SelectTrigger><SelectContent>{["NetSuite", "Ramp", "Shopify", "QuickBooks", "Stripe", "Slack", "Other"].map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></label>}
        {modal === "pulse" && <fieldset className="pulse-options"><legend>How is the candidate doing?</legend>{(["GREEN", "YELLOW", "RED"] as const).map((value) => <label className={`pulse-option pulse-${value.toLowerCase()} ${rating === value ? "pulse-selected" : ""}`} key={value}><input checked={rating === value} name="pulse" onChange={() => setRating(value)} type="radio" value={value} /><span>{value === "GREEN" ? "On track" : value === "YELLOW" ? "Needs alignment" : "Escalation required"}</span></label>)}</fieldset>}
        {!isConvert && !(modal === "candidate" && activeBlocker) && modal !== "slack" && <label className="form-label">{modal === "candidate" ? "What’s the issue?" : modal === "pulse" ? "Anything MAVI should know? (Optional)" : "Add a note (optional)"}<textarea onChange={(event) => setNote(event.target.value)} placeholder={modal === "candidate" ? "I’m waiting on access to…" : modal === "customer" ? "Tell your MAVI operator what would help…" : "Share context for your MAVI operator…"} required={modal === "candidate"} rows={4} value={note} /></label>}
        {modal === "slack" ? <div className="dialog-actions"><Button className="button-secondary" onClick={onClose} size="lg" type="button" variant="outline">Close preview</Button>{accessItem?.status !== "PROVISIONED" && accessItem && <Button className="button-secondary" onClick={() => { dispatch({ type: "access", id: accessItem.id, status: "PROVISIONED" }); onToast("Access marked provided in the illustrative demo"); onClose(); }} size="lg" type="button" variant="outline">Simulate access provided</Button>}<Button className="button-primary" disabled={nudgeLogged} onClick={() => { if (!intervention) return; dispatch({ type: "operator-nudge", message: `${intervention.id}: simulated follow-up logged` }); setNudgeLogged(true); onToast("Slack nudge simulated · no message sent"); }} size="lg" type="button"><SlackMark size={16} />{nudgeLogged ? "Nudge simulated" : "Send nudge to Slack"}</Button></div> : <div className="dialog-actions"><Button className="button-secondary" onClick={onClose} size="lg" type="button" variant="outline">{modal === "candidate" && activeBlocker ? "Close" : "Cancel"}</Button>{!(modal === "candidate" && activeBlocker) && <Button className="button-primary" size="lg" type="submit">{isConvert ? "Confirm in demo" : modal === "candidate" ? "Send blocker to MAVI" : modal === "pulse" ? "Submit pulse" : "Send private note"}<ArrowRight size={15} /></Button>}</div>}
        {modal !== "slack" && <div className="dialog-demo-note"><span className="demo-dot" />Demo only · no external message is sent</div>}
      </form>
      </DialogContent>
    </Dialog>
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
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  return (
    <div className={`portal-shell role-${state.activeRole}`}>
      <TopBar dispatch={dispatch} onReset={() => { dispatch({ type: "reset" }); showToast("Trial reset to its illustrative starting state"); }} state={state} />
      <main className="portal-main">
        <div className="role-surface" key={state.activeRole}>
          <TrialHeading role={state.activeRole} trial={trial} />
          {state.activeRole === "customer" && <CustomerCandidateSummary trial={trial} />}
          {state.activeRole !== "operator" && <TrialTimeline day={state.activeDay} onChange={(day) => dispatch({ type: "day", day })} />}
          {state.activeRole === "operator" && <OperatorView dispatch={dispatch} onPreviewFollowup={(id) => { setInterventionId(id); setModal("slack"); }} onToast={showToast} state={state} />}
          {state.activeRole === "customer" && <CustomerView dispatch={dispatch} onModal={setModal} state={state} />}
          {state.activeRole === "candidate" && <CandidateView dispatch={dispatch} onModal={setModal} state={state} />}
        </div>
      </main>
      <footer className="portal-footer"><span><MaviMark /> MAVI Trial OS</span><span>14-day activation room · <b>local state</b></span><button onClick={() => showToast("Scenario data is illustrative. No real client or candidate account is connected.")} type="button"><CircleHelp size={14} />About this demo</button></footer>
      {toast && <div aria-live="polite" className="toast-message" role="status"><CheckCircle2 size={16} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast("")} type="button"><X size={14} /></button></div>}
      <TrialDialog dispatch={dispatch} interventionId={interventionId} modal={modal} onClose={() => setModal(null)} onToast={showToast} state={state} />
      <DemoController attentionCount={needsLookCount} onChange={(role) => dispatch({ type: "role", role })} value={state.activeRole} />
    </div>
  );
}
