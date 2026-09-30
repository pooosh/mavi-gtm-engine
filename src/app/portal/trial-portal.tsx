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
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  createInitialState,
  getTrialHealth,
  TrialOSState,
  TrialWorkspace,
  trialReducer,
  UserRole,
} from "@/lib/trial";

type ModalName = "customer" | "candidate" | "pulse" | "convert" | null;
type PhaseKey = keyof TrialWorkspace["tasks"];

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

function trialTaskCount(tasks: TrialWorkspace["tasks"]) {
  const all = [...tasks.setup, ...tasks.delivery, ...tasks.close];
  return { complete: all.filter((task) => task.completed).length, total: all.length };
}

function RoleSwitcher({ value, onChange }: { value: UserRole; onChange: (role: UserRole) => void }) {
  return (
    <div aria-label="Preview product view" className="role-switcher" role="group">
      {roles.map((role) => (
        <button
          aria-pressed={value === role.id}
          className={`role-option ${value === role.id ? "is-selected" : ""}`}
          key={role.id}
          onClick={() => onChange(role.id)}
          type="button"
        >
          <span>{role.label}</span><span className="role-short">{role.short}</span>
        </button>
      ))}
    </div>
  );
}

function TopBar({ state, dispatch, onReset }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onReset: () => void }) {
  return (
    <header className="topbar">
      <a aria-label="MAVI Trial OS" className="brand-lockup" href="/portal">
        <MaviMark /><span className="brand-name">MAVI</span><span className="brand-divider" /><span className="product-name">Trial OS</span>
      </a>
      <div className="demo-label"><span className="demo-dot" /> Illustrative demo data</div>
      <div className="topbar-actions">
        <label className="scenario-select-wrap">
          <span className="sr-only">Trial scenario</span>
          <select aria-label="Trial scenario" className="scenario-select" onChange={(event) => dispatch({ type: "template", id: event.target.value })} value={state.trial.id}>
            <option value="athena">Athena Club</option>
            <option value="tracedata">TraceData Systems</option>
          </select>
          <ChevronDown aria-hidden="true" size={14} />
        </label>
        <button aria-label="Reset demo" className="icon-button" onClick={onReset} title="Reset demo" type="button"><RotateCcw size={16} /></button>
        <div aria-hidden="true" className="operator-avatar">P</div>
      </div>
    </header>
  );
}

function TrialHeading({ trial, day }: { trial: TrialWorkspace; day: number }) {
  return (
    <div className="trial-heading">
      <div>
        <div className="breadcrumb"><span>Trials</span><ChevronRight size={13} /><span>{trial.client.name}</span></div>
        <div className="heading-row">
          <h1>{trial.client.name}</h1>
          <span className="industry-tag">{trial.client.industry}</span>
        </div>
        <p className="heading-subtitle">14-day working trial <span className="inline-separator">·</span> Day {day} of 14</p>
      </div>
      <div className="candidate-chip">
        <div className="candidate-monogram">M</div>
        <div><span className="candidate-name">{trial.candidate.handle}</span><span className="candidate-role">{trial.candidate.title}</span></div>
        <BadgeCheck aria-label="Illustrative profile" className="verified-mark" size={17} />
      </div>
    </div>
  );
}

function DayRail({ day, onChange }: { day: number; onChange: (day: number) => void }) {
  const active = getPhase(day);
  return (
    <section aria-label="Trial day navigation" className="day-rail">
      <div className="day-rail-label"><CalendarDays size={16} /><span>Trial timeline</span></div>
      <div className="phase-rail">
        {phases.map((phase, index) => {
          const activeIndex = phases.findIndex((item) => item.id === active);
          return (
            <button className={`phase-stop ${phase.id === active ? "current" : index < activeIndex ? "complete" : ""}`} key={phase.id} onClick={() => onChange(phase.id === "setup" ? 2 : phase.id === "delivery" ? 5 : 14)} type="button">
              <span className="phase-marker">{index < activeIndex ? <Check size={12} /> : <span />}</span>
              <span className="phase-stop-text"><b>{phase.label}</b><small>{phase.days}</small></span>
            </button>
          );
        })}
      </div>
      <div className="day-control">
        <button aria-label="Previous day" disabled={day <= 1} onClick={() => onChange(day - 1)} type="button"><ChevronLeft size={15} /></button>
        <span>Day <b>{day}</b></span>
        <button aria-label="Next day" disabled={day >= 14} onClick={() => onChange(day + 1)} type="button"><ChevronRight size={15} /></button>
      </div>
    </section>
  );
}

function CandidateStrip({ trial }: { trial: TrialWorkspace }) {
  return (
    <section aria-label="Candidate and work context" className="candidate-strip">
      <div className="candidate-summary">
        <div className="candidate-monogram large">M</div>
        <div className="candidate-summary-copy">
          <div className="candidate-summary-top"><strong>{trial.candidate.handle}</strong><span className="sample-pill">Sample profile</span></div>
          <span>{trial.candidate.pedigree} <i>·</i> {trial.candidate.overlap}</span>
        </div>
      </div>
      <div className="stack-list" aria-label="Illustrative tools">
        {trial.candidate.tools.map((tool) => <span className="tool-tag" key={tool}>{tool}</span>)}
      </div>
      <div className="score-pair">
        <div><strong>{trial.candidate.hallucinationScore}<small>/100</small></strong><span>AI review score</span></div>
        <div><strong>{trial.candidate.auditSpeedup}<small>×</small></strong><span>Sample speedup</span></div>
      </div>
      <details className="security-details">
        <summary><ShieldCheck size={15} /> Security details</summary>
        <div className="security-popover">
          <b>Illustrative workspace setup</b>
          <span><LockKeyhole size={13} />{trial.workspace.region}</span>
          <span><CheckCircle2 size={13} />Clipboard and downloads shown as disabled</span>
          <span>This demo does not provision a VM or verify compliance.</span>
        </div>
      </details>
    </section>
  );
}

function HealthBanner({ trial, onOpen }: { trial: TrialWorkspace; onOpen: () => void }) {
  const overdue = trial.access.filter((item) => item.status !== "PROVISIONED" && item.updatedAtHoursAgo > 48);
  const health = getTrialHealth(trial);
  if (!overdue.length && health === "ON_TRACK") {
    return (
      <div className="health-banner healthy" role="status">
        <div className="health-icon"><CheckCircle2 size={18} /></div>
        <div><strong>Trial is on track</strong><span>No open access delays or participant reports need attention.</span></div>
        <span className="health-trailing">{trial.escalations.filter((item) => !item.resolved).length} open updates</span>
      </div>
    );
  }
  const item = overdue[0];
  if (!item) {
    return (
      <div className="health-banner at-risk" role="alert">
        <div className="health-icon"><AlertTriangle size={18} /></div>
        <div className="health-copy"><strong>A participant update needs attention</strong><span>Review the private feedback or blocker in the intervention queue.</span></div>
        <div className="health-actions"><span className="risk-label">Operator attention</span><button className="text-action" onClick={onOpen} type="button">Open queue <ArrowRight size={14} /></button></div>
      </div>
    );
  }
  return (
    <div className="health-banner at-risk" role="alert">
      <div className="health-icon"><AlertTriangle size={18} /></div>
      <div className="health-copy"><strong>Access is holding up first value</strong><span>{item.name} has been pending for <b>{elapsedLabel(item.updatedAtHoursAgo)}</b>. The trial is at risk.</span></div>
      <div className="health-actions"><span className="risk-label">Operator attention</span><button className="text-action" onClick={onOpen} type="button">Open alert <ArrowRight size={14} /></button></div>
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

function TrialMap({ state, dispatch, onView }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onView: (role: UserRole) => void }) {
  const { trial, activeRole, activeDay } = state;
  const pending = trial.access.find((item) => item.status !== "PROVISIONED");
  const completed = trialTaskCount(trial.tasks);
  const laneData: Array<{ role: UserRole; detail: string; cells: [string, string, string] }> = [
    { role: "customer", detail: "Finance lead", cells: ["Grant access · invite to Slack", "Review the first work · send a pulse", "Final review · retain candidate"] },
    { role: "candidate", detail: trial.candidate.handle, cells: ["Get set up · confirm access", trial.tasks.delivery[0]?.label ?? "Complete first deliverable", "Run close tasks · prepare handoff"] },
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
              const isCurrent = getPhase(activeDay) === phase.id;
              const isAlert = lane.role === "operator" && index === 0 && Boolean(pending && pending.updatedAtHoursAgo > 48);
              return (
                <button className={`map-cell ${isCurrent ? "cell-current" : ""} ${isAlert ? "cell-alert" : ""}`} key={phase.id} onClick={() => onView(lane.role)} type="button">
                  {isAlert && <AlertTriangle size={14} />}
                  {!isAlert && index < 2 && <span className={`cell-state ${index === 0 && trial.access.some((item) => item.status !== "PROVISIONED") ? "state-pending" : ""}`} />}
                  <span>{cell}</span>
                  {isCurrent && <small>Today · Day {activeDay}</small>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="map-footnote"><span><span className="legend-dot complete-dot" /> Complete</span><span><span className="legend-dot pending-dot" /> In progress</span><span><span className="legend-dot alert-dot" /> Needs attention</span><span className="map-demo-note">Illustrative workflow — actions update this demo only.</span></div>
    </section>
  );
}

function DossierFacts({ trial }: { trial: TrialWorkspace }) {
  return (
    <div className="dossier-facts">
      <span><BadgeCheck size={14} />{trial.candidate.pedigree}</span>
      <span><Clock3 size={14} />{trial.candidate.overlap}</span>
      <span><ShieldCheck size={14} />Hypothetical secure workspace</span>
    </div>
  );
}

function CustomerView({ state, dispatch, onModal }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onModal: (modal: ModalName) => void }) {
  const phase = getPhase(state.activeDay);
  const tasks = state.trial.tasks[phase];
  return (
    <div className="role-workspace">
      <div className="role-intro">
        <div><h2>Your 14-day gameplan <span className="heading-context">CUSTOMER VIEW</span></h2><p>See what happens next, what’s waiting on your team, and where MAVI can help.</p></div>
        <button className="button-secondary" onClick={() => onModal("customer")} type="button"><MessageSquareText size={16} />Private note to MAVI</button>
      </div>
      <div className="phase-summary-grid">
        {phases.map((item, index) => (
          <button className={`phase-summary ${phase === item.id ? "summary-current" : ""}`} key={item.id} onClick={() => dispatch({ type: "day", day: item.id === "setup" ? 2 : item.id === "delivery" ? 5 : 14 })} type="button">
            <span className="summary-index">0{index + 1}</span><span className="summary-days">{item.days}</span><b>{item.name}</b>
            <small>{index === 0 ? "Give access · invite to Slack" : index === 1 ? "Clean the first sales sheet" : "Review and decide together"}</small>
            <ArrowRight size={15} />
          </button>
        ))}
      </div>
      <section className="today-panel">
        <div className="today-heading"><h3>What’s happening now <span className="heading-context">DAY {state.activeDay} · {phases.find((item) => item.id === phase)?.label.toUpperCase()}</span></h3><span className="task-count">{tasks.filter((task) => task.completed).length} of {tasks.length} complete</span></div>
        <div className="task-list">
          {tasks.map((task) => <TaskRow key={task.id} completed={task.completed} label={task.label} onToggle={() => dispatch({ type: "task", phase, id: task.id })} />)}
        </div>
        {phase === "setup" && state.trial.access.some((item) => item.status !== "PROVISIONED") && (
          <div className="access-request-list">
            {state.trial.access.filter((item) => item.status !== "PROVISIONED").map((item) => <div className="access-request" key={item.id}><span><AlertTriangle size={15} />Waiting on {item.name}</span><button className="small-link" onClick={() => dispatch({ type: "access", id: item.id, status: "PROVISIONED" })} type="button">Mark as granted</button></div>)}
          </div>
        )}
        <div className="customer-pulse-row"><div><strong>How is the first week going?</strong><span>Your pulse is shared with MAVI, never directly with the candidate.</span></div><button className="button-primary" onClick={() => onModal("pulse")} type="button">Send a progress pulse <ArrowRight size={15} /></button></div>
      </section>
      {phase === "close" && (
        <section className={`conversion-panel ${state.trial.telemetry.converted ? "conversion-complete" : ""}`}>
          <div><span className="conversion-kicker">DAY 14 · FINAL DECISION</span><h3>{state.trial.telemetry.converted ? "You’ve chosen to move forward." : "Ready to bring this talent onto your team?"}</h3><p>{state.trial.telemetry.converted ? "This selection is recorded in the illustrative demo only." : "Review the trial together, then record your decision. No contract or billing is created."}</p></div>
          {state.trial.telemetry.converted ? <span className="conversion-status"><CheckCircle2 size={16} />Selected in demo</span> : <button className="button-primary" onClick={() => onModal("convert")} type="button">Hire this candidate <ArrowRight size={15} /></button>}
        </section>
      )}
    </div>
  );
}

function TaskRow({ completed, label, onToggle }: { completed: boolean; label: string; onToggle: () => void }) {
  return <button aria-pressed={completed} className={`task-row ${completed ? "task-complete" : ""}`} onClick={onToggle} type="button"><span className="task-check">{completed && <Check size={13} />}</span><span>{label}</span><span className="task-row-action">{completed ? "Done" : "Mark done"}</span></button>;
}

function CandidateView({ state, dispatch, onModal }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onModal: (modal: ModalName) => void }) {
  const phase = getPhase(state.activeDay);
  const tasks = state.trial.tasks[phase];
  const blocked = state.trial.candidateBlockers.some((item) => !item.resolved);
  const pending = state.trial.access.filter((item) => item.status !== "PROVISIONED");
  return (
    <div className="role-workspace">
      <div className="role-intro candidate-intro">
        <div><h2>Your workday, without the guesswork. <span className="heading-context">CANDIDATE VIEW</span></h2><p>Today’s priorities and the tools you’re waiting on, in one place.</p></div>
        <button className={`button-secondary ${blocked ? "button-danger-outline" : ""}`} onClick={() => onModal("candidate")} type="button"><CircleHelp size={16} />{blocked ? "View blocker" : "I’m blocked"}</button>
      </div>
      <div className="candidate-day-banner"><div className="day-tile"><span>DAY</span><b>{state.activeDay}</b></div><div><h3>{state.trial.client.deliverable}</h3><p>Work hours overlap: {state.trial.candidate.overlap}</p></div><div className="focus-side"><span>{tasks.filter((task) => task.completed).length} / {tasks.length} tasks</span><span>{phase === "setup" ? "Get access ready" : phase === "delivery" ? "First milestone" : "Final review"}</span></div></div>
      <section className="today-panel candidate-tasks">
        <div className="today-heading"><h3>{phase === "setup" ? "Get set up" : phase === "delivery" ? "First milestone sprint" : "Close and handoff"} <span className="heading-context">TODAY’S CHECKLIST · DAY {state.activeDay}</span></h3><span className="task-count">{tasks.filter((task) => task.completed).length} of {tasks.length} complete</span></div>
        <div className="task-list">{tasks.map((task) => <TaskRow key={task.id} completed={task.completed} label={task.label} onToggle={() => dispatch({ type: "task", phase, id: task.id })} />)}</div>
      </section>
      <section className="access-panel">
        <div className="access-panel-head"><h3>Tool access <span className="heading-context">READY WHEN YOU ARE</span></h3><LockKeyhole size={18} /></div>
        {pending.length ? pending.map((item) => <div className="candidate-access-row" key={item.id}><span className="access-status-icon"><Clock3 size={15} /></span><span><b>{item.name}</b><small>Waiting on client access</small></span><span className="pending-tag">Pending</span></div>) : <p className="all-ready"><CheckCircle2 size={16} />All required access is ready.</p>}
        <button className="button-secondary blocked-cta" onClick={() => onModal("candidate")} type="button"><CircleHelp size={15} />{blocked ? "Update my blocker" : "I’m blocked on access"}<ArrowRight size={14} /></button>
      </section>
    </div>
  );
}

function OperatorView({ state, dispatch, onModal, onToast }: { state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onModal: (modal: ModalName) => void; onToast: (message: string) => void }) {
  const { trial } = state;
  const open = trial.escalations.filter((item) => !item.resolved);
  const access = new Map(trial.access.map((item) => [item.id, item]));
  const tasks = trialTaskCount(trial.tasks);
  return (
    <div className="role-workspace operator-workspace">
      <div className="role-intro operator-intro">
        <div><h2>Keep the trial moving. <span className="heading-context">MAVI OPERATOR VIEW</span></h2><p>One view of client setup, candidate work, and the moments that need your attention.</p></div>
        <span className={`health-chip ${getTrialHealth(trial) === "AT_RISK" ? "risk-chip" : "good-chip"}`}><span />{healthLabel(getTrialHealth(trial))}</span>
      </div>
      <HealthBanner onOpen={() => document.getElementById("intervention-queue")?.scrollIntoView({ behavior: "smooth", block: "center" })} trial={trial} />
      <section className="ops-readout" aria-label="Trial operating status">
        <div><span className="readout-label">TIME TO FIRST VALUE</span><b>{(trial.telemetry.ttfvHours / 24).toFixed(1)} <small>days</small></b><span className="readout-note">Illustrative scenario value</span></div>
        <div><span className="readout-label">OPEN INTERVENTIONS</span><b>{open.length.toString().padStart(2, "0")} <small>items</small></b><span className="readout-note">Private reports + access risks</span></div>
        <div><span className="readout-label">TRIAL COMPLETION</span><b>{tasks.complete}<small> / {tasks.total}</small></b><span className="readout-note">Checklist items complete</span></div>
      </section>
      <TrialMap dispatch={dispatch} onView={(role) => dispatch({ type: "role", role })} state={state} />
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
                  <div className={`queue-marker ${item.source.toLowerCase()}`}>{item.source === "ACCESS" ? <LockKeyhole size={15} /> : item.source === "CUSTOMER" ? <MessageSquareText size={15} /> : <UserRound size={15} />}</div>
                  <div className="intervention-main"><div className="intervention-meta"><span>{sourceLabel}</span><span>DAY {item.day}</span></div><h3>{item.message}</h3><p>{accessItem ? `${elapsedLabel(accessItem.updatedAtHoursAgo)} elapsed · ${accessItem.status.toLowerCase()}` : candidateBlocker?.issue ?? customerNote?.note ?? "Review and follow up with the trial participants."}</p>
                    {trial.interventions.some((entry) => entry.message.includes(item.id)) && <span className="intervention-logged"><Check size={13} />Nudge logged in demo</span>}
                  </div>
                  <div className="intervention-actions"><button className="small-link" onClick={() => { dispatch({ type: "operator-nudge", message: `${item.id}: nudge recorded for ${item.source.toLowerCase()} follow-up` }); onToast("Nudge logged · no external message sent"); }} type="button">Log nudge</button><button className="resolve-button" onClick={() => dispatch({ type: "resolve-escalation", id: item.id })} type="button"><Check size={14} />Resolve</button></div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <details className="config-inspector"><summary><span><ChevronDown size={15} />Workspace data</span><span>Illustrative JSON</span></summary><pre>{JSON.stringify(trial, null, 2)}</pre></details>
      <div className="operator-shortcuts"><button onClick={() => onModal("customer")} type="button"><MessageSquareText size={15} />Preview customer feedback</button><button onClick={() => onModal("candidate")} type="button"><CircleHelp size={15} />Preview candidate blocker</button></div>
    </div>
  );
}

function TrialDialog({ modal, state, dispatch, onClose }: { modal: ModalName; state: TrialOSState; dispatch: React.Dispatch<Parameters<typeof trialReducer>[1]>; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState("Access delay");
  const [tool, setTool] = useState("NetSuite");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<"GREEN" | "YELLOW" | "RED">("GREEN");
  const activeBlocker = state.trial.candidateBlockers.find((item) => !item.resolved);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modal && !dialog.open) dialog.showModal();
    if (!modal && dialog.open) dialog.close();
  }, [modal]);

  useEffect(() => {
    if (modal !== "candidate" || activeBlocker) return;
    const pending = state.trial.access.find((item) => item.status !== "PROVISIONED");
    if (pending) setTool(pending.name.split(" · ")[0]);
  }, [activeBlocker, modal, state.trial.access]);

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
  const title = modal === "customer" ? "A private note to MAVI" : modal === "candidate" ? activeBlocker ? "Your blocker is with MAVI" : "Tell MAVI what’s blocking you" : modal === "pulse" ? "How is the trial going?" : "Ready to continue together?";
  const helper = modal === "customer" ? "Only the MAVI operator sees this note in the demo. Your candidate will not." : modal === "candidate" ? activeBlocker ? "The MAVI operator can see this blocker. The customer cannot." : "This goes to the MAVI operator in the demo. The customer does not see your private blocker." : modal === "pulse" ? "Your pulse is shared with MAVI so they can help keep the trial on track." : "This confirms the conversion in the demo only. No contract or billing is created.";
  return (
    <dialog aria-labelledby="dialog-title" className="trial-dialog" onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose} ref={dialogRef}>
      <form onSubmit={submit}>
        <div className="dialog-head"><span className="dialog-icon">{isConvert ? <BadgeCheck size={18} /> : modal === "candidate" ? <CircleHelp size={18} /> : <MessageSquareText size={18} />}</span><button aria-label="Close" className="icon-button" onClick={onClose} type="button"><X size={17} /></button></div>
        <h2 id="dialog-title">{title}</h2><p className="dialog-helper">{helper}</p>
        {modal === "customer" && <label className="form-label">What do you need help with?<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Access delay</option><option>Communication cadence</option><option>Technical quality</option></select></label>}
        {modal === "candidate" && activeBlocker ? <div className="blocker-receipt"><span>OPEN BLOCKER · DAY {activeBlocker.day}</span><b>{activeBlocker.tool}</b><p>{activeBlocker.issue}</p></div> : null}
        {modal === "candidate" && !activeBlocker && <label className="form-label">Which tool is blocking you?<select value={tool} onChange={(event) => setTool(event.target.value)}><option>NetSuite</option><option>Ramp</option><option>Shopify</option><option>QuickBooks</option><option>Stripe</option><option>Slack</option><option>Other</option></select></label>}
        {modal === "pulse" && <fieldset className="pulse-options"><legend>How is the candidate doing?</legend>{(["GREEN", "YELLOW", "RED"] as const).map((value) => <label className={`pulse-option pulse-${value.toLowerCase()} ${rating === value ? "pulse-selected" : ""}`} key={value}><input checked={rating === value} name="pulse" onChange={() => setRating(value)} type="radio" value={value} /><span>{value === "GREEN" ? "On track" : value === "YELLOW" ? "Needs alignment" : "Escalation required"}</span></label>)}</fieldset>}
        {!isConvert && !(modal === "candidate" && activeBlocker) && <label className="form-label">{modal === "candidate" ? "What’s the issue?" : modal === "pulse" ? "Anything MAVI should know? (Optional)" : "Add a note (optional)"}<textarea onChange={(event) => setNote(event.target.value)} placeholder={modal === "candidate" ? "I’m waiting on access to…" : modal === "customer" ? "Tell your MAVI operator what would help…" : "Share context for your MAVI operator…"} required={modal === "candidate"} rows={4} value={note} /></label>}
        <div className="dialog-actions"><button className="button-secondary" onClick={onClose} type="button">{modal === "candidate" && activeBlocker ? "Close" : "Cancel"}</button>{!(modal === "candidate" && activeBlocker) && <button className="button-primary" type="submit">{isConvert ? "Confirm in demo" : modal === "candidate" ? "Send blocker to MAVI" : modal === "pulse" ? "Submit pulse" : "Send private note"}<ArrowRight size={15} /></button>}</div>
        <div className="dialog-demo-note"><span className="demo-dot" />Demo only · no external message is sent</div>
      </form>
    </dialog>
  );
}

export default function TrialPortal() {
  const [state, dispatch] = useReducer(trialReducer, undefined, createInitialState);
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trial = state.trial;
  const health = useMemo(() => getTrialHealth(trial), [trial]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  return (
    <div className="portal-shell">
      <TopBar dispatch={dispatch} onReset={() => { dispatch({ type: "reset" }); showToast("Trial reset to its illustrative starting state"); }} state={state} />
      <main className="portal-main">
        <TrialHeading day={state.activeDay} trial={trial} />
        <CandidateStrip trial={trial} />
        <div className="view-toolbar"><div className="view-toolbar-label"><UsersRound size={16} /><span>Preview perspective</span></div><RoleSwitcher onChange={(role) => dispatch({ type: "role", role })} value={state.activeRole} /><div className="toolbar-spacer" /><span className={`toolbar-health ${health === "AT_RISK" ? "risk-text" : ""}`}><span />{healthLabel(health)}</span><button aria-label="Previous day" className="toolbar-step" disabled={state.activeDay <= 1} onClick={() => dispatch({ type: "day", day: state.activeDay - 1 })} type="button"><ChevronLeft size={15} /></button><button aria-label="Next day" className="toolbar-step" disabled={state.activeDay >= 14} onClick={() => dispatch({ type: "day", day: state.activeDay + 1 })} type="button"><ChevronRight size={15} /></button></div>
        <DayRail day={state.activeDay} onChange={(day) => dispatch({ type: "day", day })} />
        {state.activeRole === "operator" && <OperatorView dispatch={dispatch} onModal={setModal} onToast={showToast} state={state} />}
        {state.activeRole === "customer" && <CustomerView dispatch={dispatch} onModal={setModal} state={state} />}
        {state.activeRole === "candidate" && <CandidateView dispatch={dispatch} onModal={setModal} state={state} />}
        <DossierFacts trial={trial} />
      </main>
      <footer className="portal-footer"><span><MaviMark /> MAVI Trial OS</span><span>14-day activation room · <b>illustrative prototype</b></span><button onClick={() => showToast("Scenario data is illustrative. No real client or candidate account is connected.")} type="button"><CircleHelp size={14} />About this demo</button></footer>
      {toast && <div aria-live="polite" className="toast-message" role="status"><CheckCircle2 size={16} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast("")} type="button"><X size={14} /></button></div>}
      <TrialDialog dispatch={dispatch} modal={modal} onClose={() => setModal(null)} state={state} />
    </div>
  );
}
