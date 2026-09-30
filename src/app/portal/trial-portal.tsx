"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  Grip,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  Slack,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useReducer, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ACCESS_ATTENTION_HOURS,
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
        <div className="timeline-title"><CalendarDays aria-hidden="true" size={17} /><strong>Trial timeline</strong></div>
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
      <div aria-hidden="true" className="timeline-day-labels">{Array.from({ length: 14 }, (_, index) => <span className={index + 1 === day ? "is-current" : ""} key={index}>{index + 1}</span>)}</div>
      <div className="timeline-phases">
        {phases.map((item) => <div className={`timeline-phase ${item.id === phase ? "is-current" : ""}`} key={item.id}><b>{item.name}</b><span>{item.days}</span></div>)}
      </div>
      <span aria-live="polite" className="sr-only">{celebratingDay ? `${celebratingDay === 14 ? "Trial complete" : `${phases.find((item) => item.id === getPhase(celebratingDay))?.label} milestone`} · Day ${celebratingDay}` : ""}</span>
    </section>
  );
}

function CandidateStrip({ trial }: { trial: TrialWorkspace }) {
  return (
    <section aria-label="Candidate and work context" className="candidate-strip">
      <div className="candidate-summary">
        <div className="candidate-monogram large">M</div>
        <div className="candidate-summary-copy">
          <div className="candidate-summary-top"><strong>{trial.candidate.handle}</strong></div>
          <span>{trial.candidate.pedigree} <i>·</i> {trial.candidate.overlap}</span>
        </div>
      </div>
      <div className="stack-list" aria-label="Illustrative tools">
        {trial.candidate.tools.map((tool) => <span className="tool-tag" key={tool}>{tool}</span>)}
      </div>
      <div className="score-pair">
        <div><strong>{trial.candidate.hallucinationScore}<small>/100</small></strong><span>AI review score</span></div>
        <div><strong>{trial.candidate.auditSpeedup}<small>×</small></strong><span>Review speedup</span></div>
      </div>
      <details className="security-details">
        <summary><ShieldCheck size={15} /> Security details</summary>
        <div className="security-popover">
          <b>Hypothetical workspace controls</b>
          <span><LockKeyhole size={13} />{trial.workspace.region}</span>
          <span><CheckCircle2 size={13} />Clipboard and downloads shown as disabled</span>
          <span>No VM is provisioned and compliance is not verified.</span>
        </div>
      </details>
    </section>
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

function HealthBanner({ trial, onOpen }: { trial: TrialWorkspace; onOpen: () => void }) {
  const open = trial.escalations.filter((item) => !item.resolved);
  const overdue = trial.access.filter((item) => item.status !== "PROVISIONED" && item.updatedAtHoursAgo > ACCESS_ATTENTION_HOURS).sort((a, b) => b.updatedAtHoursAgo - a.updatedAtHoursAgo);
  const health = getTrialHealth(trial);
  if (!open.length && health === "ON_TRACK") {
    return (
      <div className="health-banner healthy" role="status">
        <div className="health-icon"><CheckCircle2 size={17} /></div>
        <div className="health-copy"><strong>Trial is moving smoothly</strong><span>No open access delays or participant reports need follow-up.</span></div>
        <span className="health-trailing">All clear</span>
      </div>
    );
  }
  const item = overdue[0];
  if (!item) {
    return (
      <div className="health-banner at-risk" role="alert">
        <div className="health-icon"><MessageSquareText size={16} /></div>
        <div className="health-copy"><strong>{open.length} {open.length === 1 ? "participant update needs" : "participant updates need"} a look</strong><span>Private feedback and blockers are waiting in the operator queue.</span></div>
        <div className="health-actions"><button className="text-action" onClick={onOpen} type="button">Review queue <ArrowRight size={14} /></button></div>
      </div>
    );
  }
  const warning = item.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS;
  return (
    <div className={`health-banner ${warning ? "at-risk" : "attention"}`} role="alert">
      <div className="health-icon"><AlertTriangle size={16} /></div>
      <div className="health-copy"><strong>{item.name.split(" · ")[0]} access is holding up the trial</strong><span>Waiting {elapsedLabel(item.updatedAtHoursAgo)} · attention after {ACCESS_ATTENTION_HOURS}h · escalation threshold {ACCESS_SLA_WARNING_HOURS}h</span></div>
      <div className="health-actions"><button className="text-action" onClick={onOpen} type="button">Review intervention <ArrowRight size={14} /></button></div>
    </div>
  );
}

function LaneLabel({ role, active, onClick, detail }: { role: UserRole; active: boolean; onClick: () => void; detail: string }) {
  const Icon = role === "customer" ? UserRound : role === "candidate" ? FileCheck2 : Activity;
  return (
    <button className={`lane-label ${active ? "lane-active" : ""}`} onClick={onClick} type="button">
      <span className={`lane-icon ${role}`}><Icon size={16} /></span>
      <span className="lane-label-copy"><b>{role === "operator" ? "MAVI operator" : role === "candidate" ? "Candidate" : "Customer"}</b><small>{detail}</small></span>
      <ArrowUpRight className="lane-open" size={15} />
    </button>
  );
}

function TrialMap({ state, onView }: { state: TrialOSState; onView: (role: UserRole) => void }) {
  const { trial, activeRole, activeDay } = state;
  const pending = trial.access.find((item) => item.status !== "PROVISIONED");
  const completed = trialTaskCount(trial.customerTasks, trial.candidateTasks);
  const laneData: Array<{ role: UserRole; detail: string; cells: [string, string, string] }> = [
    { role: "customer", detail: "Finance lead", cells: [pending ? `Grant ${pending.name} · ${elapsedLabel(pending.updatedAtHoursAgo)}` : "Access setup complete", "Review first work · share source data", "Final review · decide what’s next"] },
    { role: "candidate", detail: trial.candidate.handle, cells: [pending ? `Waiting on ${pending.name} · ${elapsedLabel(pending.updatedAtHoursAgo)}` : "Confirm tools and workspace", trial.candidateTasks.delivery[0]?.label ?? "Complete first deliverable", "Prepare handoff · walkthrough"] },
    { role: "operator", detail: `${completed.complete}/${completed.total} tasks complete`, cells: [pending ? `${pending.name} · ${elapsedLabel(pending.updatedAtHoursAgo)}` : "Access setup complete", "Monitor pulse · keep work unblocked", "Review health · support conversion"] },
  ];
  return (
    <section aria-label="Three-perspective trial timeline" className="trial-map-section">
      <div className="section-heading map-heading">
        <div><h2>Everyone sees their part.</h2><p className="section-subtitle">One plan, three clear points of view.</p></div>
        <span className="shared-state"><span /> Shared trial state</span>
      </div>
      <div className="trial-map">
        <div className="map-corner"><span>TRIAL OWNER</span><span>SHARED 14-DAY PLAN</span></div>
        {phases.map((phase) => (
          <div className={`map-phase-head ${getPhase(activeDay) === phase.id ? "map-phase-current" : ""}`} key={phase.id}>
            <span>{phase.days}</span><b>{phase.name}</b>
          </div>
        ))}
        {laneData.map((lane) => (
          <div className={`map-row ${activeRole === lane.role ? "active-row" : ""} ${lane.role}-row`} key={lane.role}>
            <LaneLabel active={activeRole === lane.role} detail={lane.detail} onClick={() => onView(lane.role)} role={lane.role} />
            {lane.cells.map((cell, index) => {
              const phase = phases[index];
              const phaseTasks = lane.role === "customer"
                ? trial.customerTasks[phase.id]
                : lane.role === "candidate"
                  ? trial.candidateTasks[phase.id]
                  : [...trial.customerTasks[phase.id], ...trial.candidateTasks[phase.id]];
              const done = phaseTasks.filter((task) => task.completed).length;
              const progress = !done ? "upcoming" : done === phaseTasks.length ? "complete" : "in-progress";
              const isCurrent = getPhase(activeDay) === phase.id;
              const isAlert = lane.role === "operator" && index === 0 && Boolean(pending && pending.updatedAtHoursAgo > ACCESS_ATTENTION_HOURS);
              const isSlaBreach = isAlert && Boolean(pending && pending.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS);
              const progressLabel = progress === "complete" ? "Complete" : progress === "in-progress" ? `${done} of ${phaseTasks.length} steps complete` : "Not started";
              return (
                <button aria-label={`${lane.role}, ${phase.name}: ${isAlert ? "Needs attention" : progressLabel}`} className={`map-cell ${isCurrent ? "cell-current" : ""} ${isAlert ? "cell-alert" : ""} ${isSlaBreach ? "cell-alert-high" : ""}`} key={phase.id} onClick={() => onView(lane.role)} type="button">
                  {isAlert && <AlertTriangle size={14} />}
                  {!isAlert && <span aria-hidden="true" className={`cell-state state-${progress}`} />}
                  <span>{cell}</span>
                  {isCurrent && <small>{progressLabel} · Day {activeDay}</small>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="map-footnote"><span><span className="legend-dot complete-dot" /> Complete</span><span><span className="legend-dot pending-dot" /> In progress</span><span><span className="legend-dot alert-dot" /> Needs attention</span><span className="map-demo-note">Changes stay in this workspace.</span></div>
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

function OperatorView({ state, dispatch, onModal, onPreviewFollowup, onToast }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onModal: (modal: ModalName) => void; onPreviewFollowup: (id: string) => void; onToast: (message: string) => void }) {
  const { trial } = state;
  const open = trial.escalations.filter((item) => !item.resolved);
  const access = new Map(trial.access.map((item) => [item.id, item]));
  const tasks = trialTaskCount(trial.customerTasks, trial.candidateTasks);
  return (
    <div className="role-workspace operator-workspace">
      <div className="role-intro operator-intro">
        <div><h2>Keep the trial moving. <span className="heading-context">MAVI OPERATOR VIEW</span></h2><p>One view of client setup, candidate work, and the moments that need your attention.</p></div>
        <Badge className={`health-chip ${getTrialHealth(trial) === "OFF_TRACK" ? "risk-chip" : getTrialHealth(trial) === "AT_RISK" ? "warning-chip" : "good-chip"}`} variant="outline"><span />{healthLabel(getTrialHealth(trial))}</Badge>
      </div>
      <HealthBanner onOpen={() => document.getElementById("intervention-queue")?.scrollIntoView({ behavior: "smooth", block: "center" })} trial={trial} />
      <section className="ops-readout" aria-label="Trial operating status">
        <div><span className="readout-label">TIME TO FIRST VALUE</span><b>{(trial.telemetry.ttfvHours / 24).toFixed(1)} <small>days</small></b><span className="readout-note">Scenario estimate</span></div>
        <div><span className="readout-label">OPEN INTERVENTIONS</span><b>{open.length.toString().padStart(2, "0")} <small>items</small></b><span className="readout-note">Private reports + access risks</span></div>
        <div><span className="readout-label">TRIAL COMPLETION</span><b>{tasks.complete}<small> / {tasks.total}</small></b><span className="readout-note">Checklist items complete</span></div>
      </section>
      <TrialMap onView={(role) => dispatch({ type: "role", role })} state={state} />
      <section className="intervention-section" id="intervention-queue">
        <div className="section-heading intervention-heading"><h2>Interventions <span className="heading-context">OPERATOR WORK QUEUE</span></h2><span className="queue-count">{open.length} open</span></div>
        {open.length === 0 ? <div className="empty-queue"><CheckCircle2 size={20} /><div><b>Nothing needs your attention.</b><span>New access delays, feedback, and blocker reports appear here.</span></div></div> : (
          <div className="intervention-list">
            {open.map((item) => {
              const accessId = item.id.startsWith("access-") ? item.id.slice("access-".length) : null;
              const accessItem = accessId ? access.get(accessId) : null;
              const candidateBlocker = trial.candidateBlockers.find((entry) => entry.id === item.id);
              const customerNoteId = item.id.startsWith("report-") ? item.id.slice("report-".length) : item.id;
              const customerNote = trial.customerNotes.find((entry) => entry.id === customerNoteId);
              const sourceLabel = item.source === "ACCESS" ? "ACCESS DELAY" : item.source === "CUSTOMER" ? "CUSTOMER · PRIVATE" : "CANDIDATE · BLOCKER";
              return (
                <article className="intervention-item" key={item.id}>
                  <div className={`queue-marker ${item.source.toLowerCase()} ${accessItem ? accessItem.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS ? "access-breach" : "access-attention" : ""}`}>{item.source === "ACCESS" ? <LockKeyhole size={15} /> : item.source === "CUSTOMER" ? <MessageSquareText size={15} /> : <UserRound size={15} />}</div>
                  <div className="intervention-main"><div className="intervention-meta"><span>{sourceLabel}</span><span>DAY {item.day}</span></div><h3>{item.message}</h3><p>{accessItem ? `${accessItem.updatedAtHoursAgo}h elapsed · ${accessItem.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS ? `${ACCESS_SLA_WARNING_HOURS}h SLA warning exceeded` : `SLA warning at ${ACCESS_SLA_WARNING_HOURS}h`}` : candidateBlocker?.issue ?? customerNote?.note ?? "Review and follow up with the trial participants."}</p>
                    {trial.interventions.some((entry) => entry.message.includes(item.id)) && <span className="intervention-logged"><Check size={13} />Nudge logged in demo</span>}
                  </div>
                  <div className="intervention-actions"><Button className="slack-nudge-button" onClick={() => onPreviewFollowup(item.id)} size="sm" type="button" variant="outline"><Slack aria-hidden="true" size={15} />Send nudge to Slack</Button><button className="resolve-button" onClick={() => dispatch({ type: "resolve-escalation", id: item.id })} type="button"><Check size={14} />{accessItem ? "Mark provided" : "Resolve"}</button></div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <details className="config-inspector"><summary><span><ChevronDown size={15} />Workspace data</span><span>Scenario data</span></summary><pre>{JSON.stringify(trial, null, 2)}</pre></details>
      <div className="operator-shortcuts"><button onClick={() => onModal("customer")} type="button"><MessageSquareText size={15} />Preview customer feedback</button><button onClick={() => onModal("candidate")} type="button"><CircleHelp size={15} />Preview candidate blocker</button></div>
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
        {modal === "slack" && <div className="slack-preview"><div className="slack-preview-head"><span><Slack aria-hidden="true" size={16} />Illustrative Slack message</span><b>DEMO</b></div><div className="slack-channel"><span>#</span> trial-athena <small>illustrative channel</small></div><div className="slack-message-row"><div aria-hidden="true" className="slack-bot-avatar"><MaviMark /></div><div className="slack-message-content"><div className="slack-message-meta"><strong>MAVI Trial Bot</strong><span className="slack-app-badge">APP</span><time>Now</time></div><p>{accessItem ? `${accessItem.name} has been waiting ${elapsedLabel(accessItem.updatedAtHoursAgo)}. Can the trial owner confirm when access is available so ${state.trial.candidate.handle} can continue?` : intervention?.source === "CANDIDATE" ? "A private candidate blocker needs operator follow-up." : intervention?.source === "CUSTOMER" ? "A private customer update needs operator follow-up." : intervention?.message ?? "Review this trial and choose a follow-up."}</p></div></div><div className="slack-preview-note">Demo preview · no message sent</div></div>}
        {modal === "customer" && <label className="form-label">What do you need help with?<Select onValueChange={setCategory} value={category}><SelectTrigger aria-label="Feedback category" className="form-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Access delay">Access delay</SelectItem><SelectItem value="Communication cadence">Communication cadence</SelectItem><SelectItem value="Technical quality">Technical quality</SelectItem></SelectContent></Select></label>}
        {modal === "candidate" && activeBlocker ? <div className="blocker-receipt"><span>OPEN BLOCKER · DAY {activeBlocker.day}</span><b>{activeBlocker.tool}</b><p>{activeBlocker.issue}</p></div> : null}
        {modal === "candidate" && !activeBlocker && <label className="form-label">Which tool is blocking you?<Select onValueChange={setTool} value={tool}><SelectTrigger aria-label="Blocked tool" className="form-select"><SelectValue /></SelectTrigger><SelectContent>{["NetSuite", "Ramp", "Shopify", "QuickBooks", "Stripe", "Slack", "Other"].map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></label>}
        {modal === "pulse" && <fieldset className="pulse-options"><legend>How is the candidate doing?</legend>{(["GREEN", "YELLOW", "RED"] as const).map((value) => <label className={`pulse-option pulse-${value.toLowerCase()} ${rating === value ? "pulse-selected" : ""}`} key={value}><input checked={rating === value} name="pulse" onChange={() => setRating(value)} type="radio" value={value} /><span>{value === "GREEN" ? "On track" : value === "YELLOW" ? "Needs alignment" : "Escalation required"}</span></label>)}</fieldset>}
        {!isConvert && !(modal === "candidate" && activeBlocker) && modal !== "slack" && <label className="form-label">{modal === "candidate" ? "What’s the issue?" : modal === "pulse" ? "Anything MAVI should know? (Optional)" : "Add a note (optional)"}<textarea onChange={(event) => setNote(event.target.value)} placeholder={modal === "candidate" ? "I’m waiting on access to…" : modal === "customer" ? "Tell your MAVI operator what would help…" : "Share context for your MAVI operator…"} required={modal === "candidate"} rows={4} value={note} /></label>}
        {modal === "slack" ? <div className="dialog-actions"><Button className="button-secondary" onClick={onClose} size="lg" type="button" variant="outline">Close preview</Button>{accessItem?.status !== "PROVISIONED" && accessItem && <Button className="button-secondary" onClick={() => { dispatch({ type: "access", id: accessItem.id, status: "PROVISIONED" }); onToast("Access marked provided in the illustrative demo"); onClose(); }} size="lg" type="button" variant="outline">Simulate access provided</Button>}<Button className="button-primary" disabled={nudgeLogged} onClick={() => { if (!intervention) return; dispatch({ type: "operator-nudge", message: `${intervention.id}: simulated follow-up logged` }); setNudgeLogged(true); onToast("Slack nudge simulated · no message sent"); }} size="lg" type="button"><Slack aria-hidden="true" size={16} />{nudgeLogged ? "Nudge simulated" : "Send nudge to Slack"}</Button></div> : <div className="dialog-actions"><Button className="button-secondary" onClick={onClose} size="lg" type="button" variant="outline">{modal === "candidate" && activeBlocker ? "Close" : "Cancel"}</Button>{!(modal === "candidate" && activeBlocker) && <Button className="button-primary" size="lg" type="submit">{isConvert ? "Confirm in demo" : modal === "candidate" ? "Send blocker to MAVI" : modal === "pulse" ? "Submit pulse" : "Send private note"}<ArrowRight size={15} /></Button>}</div>}
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
          <TrialTimeline day={state.activeDay} onChange={(day) => dispatch({ type: "day", day })} />
          {state.activeRole === "customer" && <CustomerCandidateSummary trial={trial} />}
          {state.activeRole === "operator" && <CandidateStrip trial={trial} />}
          {state.activeRole === "operator" && <OperatorView dispatch={dispatch} onModal={setModal} onPreviewFollowup={(id) => { setInterventionId(id); setModal("slack"); }} onToast={showToast} state={state} />}
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
