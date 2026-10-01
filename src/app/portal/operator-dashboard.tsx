"use client";

import "./operator-dashboard.css";

import { ArrowUpRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, LockKeyhole, MessageSquareText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Dispatch } from "react";
import { SlackMark } from "@/components/brand/slack-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCESS_SLA_WARNING_HOURS, getTrialHealth } from "@/lib/trial";
import type { TrialAction, TrialOSState, TrialWorkspace } from "@/lib/trial";

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

function CandidateTile({ trial }: { trial: TrialWorkspace }) {
  const workspace = trial.access.find((item) => item.id === "workspace");
  return (
    <section className="bento-widget dossier-widget" aria-label="Candidate dossier">
      <div className="bento-widget-heading"><h2>Candidate dossier</h2><span className="candidate-monogram">M</span></div>
      <h3>{trial.candidate.handle}</h3>
      <p>{trial.candidate.pedigree}</p>
      <div className="dossier-score"><span>AI review score</span><strong className="tabular-nums">{trial.candidate.hallucinationScore}<small> / 100</small></strong></div>
      <span className="dossier-workspace"><ShieldCheck size={13} />Workspace {workspace?.status === "PROVISIONED" ? "ready" : "pending"} · simulated</span>
      <DialogTrigger asChild><Button className="button-secondary" variant="outline">Inspect dossier <ArrowUpRight size={14} /></Button></DialogTrigger>
    </section>
  );
}

function SlaWidget({ trial }: { trial: TrialWorkspace }) {
  const pending = trial.access.filter((item) => item.status !== "PROVISIONED");
  const elapsed = Math.max(0, ...pending.map((item) => item.updatedAtHoursAgo));
  const consumed = Math.round(elapsed / ACCESS_SLA_WARNING_HOURS * 100);
  const breached = elapsed >= ACCESS_SLA_WARNING_HOURS;
  const tone = pending.length ? breached ? "breached" : "pending" : "clear";
  const circumference = 2 * Math.PI * 42;
  return (
    <section className={`bento-widget sla-widget ${tone}`} aria-label="Access SLA capacity">
      <div className="bento-widget-heading"><h2>Access SLA</h2><span className="tabular-nums">{elapsed}h / {ACCESS_SLA_WARNING_HOURS}h</span></div>
      <div className="sla-dial" role="img" aria-label={`${consumed}% of access SLA consumed`}>
        <svg viewBox="0 0 104 104" aria-hidden="true"><circle className="sla-dial-track" cx="52" cy="52" r="42" /><circle className="sla-dial-progress" cx="52" cy="52" r="42" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.min(consumed, 100) / 100)} /></svg>
        <div><strong className="tabular-nums">{consumed}%</strong><span>consumed</span></div>
      </div>
      <p className="sla-deadline tabular-nums">{pending.length ? breached ? `${elapsed - ACCESS_SLA_WARNING_HOURS}h past SLA threshold` : `${ACCESS_SLA_WARNING_HOURS - elapsed}h until SLA threshold` : "All access provided"}</p>
      <div className="sla-ttfv"><span>First value · estimate</span><b className="tabular-nums">{(trial.telemetry.ttfvHours / 24).toFixed(1)} days</b></div>
    </section>
  );
}

function MilestoneWidget({ state, dispatch, onPreviewFollowup }: Pick<DashboardProps, "state" | "dispatch" | "onPreviewFollowup">) {
  const { trial, activeDay } = state;
  const current = activeDay <= 2 ? 0 : activeDay <= 7 ? 1 : 2;
  const [inspected, setInspected] = useState<number | null>(null);
  const index = inspected ?? current;
  const phase = milestones[index];
  const customer = trial.customerTasks[phase.id];
  const candidate = trial.candidateTasks[phase.id];
  const ready = trial.access.filter((item) => item.status === "PROVISIONED").length;
  const complete = phase.id === "setup" ? ready : [...customer, ...candidate].filter((task) => task.completed).length;
  const total = phase.id === "setup" ? trial.access.length : customer.length + candidate.length;
  const previewDay = index === current ? activeDay : index === 0 ? 2 : index === 1 ? 3 : 8;
  function previewParticipant(role: "customer" | "candidate") {
    if (index !== current) dispatch({ type: "day", day: previewDay });
    dispatch({ type: "role", role });
  }
  return (
    <section className="bento-widget milestone-widget" aria-label="Milestone flight path">
      <div className="bento-widget-heading"><h2>Milestone flight path</h2><span>Phase {current + 1} of 3</span></div>
      <div className="milestone-tabs" aria-label="Inspect trial phase">
        {milestones.map((item, position) => <button className={index === position ? "is-active" : ""} aria-pressed={index === position} key={item.id} onClick={() => setInspected(position)} type="button"><span>{item.days}</span><b>{item.title}</b><small>{position === current ? "Active" : position > current ? "Upcoming" : "Earlier"}</small></button>)}
      </div>
      <div className="milestone-summary"><strong>{phase.id === "setup" ? "Access provisioning" : phase.id === "delivery" ? "First deliverable" : "Final review & hire decision"}</strong><span>{complete} of {total} complete</span></div>
      {phase.id === "setup" ? <ul className="provisioning-list">
        {trial.access.map((item) => {
          const isReady = item.status === "PROVISIONED";
          const escalation = trial.escalations.find((entry) => entry.id === `access-${item.id}` && !entry.resolved);
          return <li key={item.id}><span className={isReady ? "provisioning-ready" : "provisioning-pending"}>{isReady ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}</span><span>{item.name}</span>{isReady ? <small>Provided</small> : escalation ? <Button variant="outline" size="sm" aria-label={`Review ${item.name} access`} onClick={() => onPreviewFollowup(escalation.id)}>Review</Button> : <small>Awaiting customer</small>}</li>;
        })}
      </ul> : <div className="phase-deliverable"><p>{phase.id === "delivery" ? trial.client.deliverable : "Review the work, complete the handoff, and record the customer’s hiring decision."}</p><ul>{candidate.map((task) => <li key={task.id}>{task.completed ? <CheckCircle2 size={14} /> : <span className="unchecked-task" />}<span>{task.label}</span></li>)}</ul></div>}
      <div className="milestone-owners">
        <button type="button" aria-label={`Preview customer checklist on demo Day ${previewDay}: ${phase.title}`} onClick={() => previewParticipant("customer")}><span>{index === current ? "Customer checklist" : `Customer · Day ${previewDay}`}</span><b>{customer.filter((task) => task.completed).length}/{customer.length}</b><ArrowUpRight size={13} /></button>
        <button type="button" aria-label={`Preview candidate checklist on demo Day ${previewDay}: ${phase.title}`} onClick={() => previewParticipant("candidate")}><span>{index === current ? "Candidate checklist" : `Candidate · Day ${previewDay}`}</span><b>{candidate.filter((task) => task.completed).length}/{candidate.length}</b><ArrowUpRight size={13} /></button>
      </div>
    </section>
  );
}

function ActivityWidget({ state }: { state: TrialOSState }) {
  return (
    <section className="bento-widget activity-widget" aria-label="Trial activity">
      <div className="bento-widget-heading"><h2>Trial activity</h2><Badge variant="outline">Demo feed</Badge></div>
      <p className="activity-helper">Actions from this shared trial, as they happen.</p>
      <ol className="trial-activity-list" aria-live="polite" aria-relevant="additions">
        {[...state.activity].reverse().map((item) => <li key={item.id}><span className="activity-point" /><span className="activity-day">Day {item.day}</span><p>{item.message}</p></li>)}
      </ol>
      <div className="activity-integration"><SlackMark size={17} /><div><b>MAVI Trial Bot</b><span>Planned Slack integration · simulation only</span></div><Badge variant="outline">Preview</Badge></div>
    </section>
  );
}

export function OperatorDashboard({ state, dispatch, onPreviewFollowup, onToast }: DashboardProps) {
  const { trial } = state;
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const open = trial.escalations.filter((item) => !item.resolved);
  const oldestAccess = trial.access.filter((item) => item.status !== "PROVISIONED").sort((a, b) => b.updatedAtHoursAgo - a.updatedAtHoursAgo)[0];
  const active = open.find((item) => item.id === selectedId) ?? open.find((item) => item.id === `access-${oldestAccess?.id}`) ?? open[0];
  const access = active?.source === "ACCESS" ? trial.access.find((item) => active.id === `access-${item.id}`) : undefined;
  const health = getTrialHealth(trial);
  const healthText = health === "OFF_TRACK" ? "Off track" : health === "AT_RISK" ? "At risk" : "On track";
  const noteId = active?.id.replace(/^report-/, "");
  const privateNote = active?.source === "CUSTOMER" ? trial.customerNotes.find((item) => item.id === noteId)?.note : trial.candidateBlockers.find((item) => item.id === active?.id)?.issue;
  const risk = access && access.updatedAtHoursAgo >= ACCESS_SLA_WARNING_HOURS;

  return (
    <Dialog open={profileOpen} onOpenChange={setProfileOpen} modal={false}>
      <div className="operator-bento">
        <div className="operator-bento-toolbar">
          <span>Placement operations <span className="toolbar-separator">/</span> {trial.candidate.handle}</span>
          <div><Badge className={`health-chip ${health === "OFF_TRACK" ? "risk-chip" : health === "AT_RISK" ? "warning-chip" : "good-chip"}`} variant="outline"><span />{healthText}</Badge>
            <div className="operator-day-control" aria-label="Demo trial day">
              <Button aria-label="Previous day" className="day-step" disabled={state.activeDay <= 1} onClick={() => dispatch({ type: "day", day: state.activeDay - 1 })} size="icon" variant="outline"><ChevronLeft size={15} /></Button>
              <span>Day <b>{state.activeDay}</b> <small>of 14</small></span>
              <Button aria-label="Next day" className="day-step" disabled={state.activeDay >= 14} onClick={() => dispatch({ type: "day", day: state.activeDay + 1 })} size="icon" variant="outline"><ChevronRight size={15} /></Button>
            </div>
          </div>
        </div>

        <div className="operator-bento-grid">
          <section className={`bento-widget escalation-widget ${risk ? "breached" : active ? "pending" : "clear"}`} aria-label="Escalation hub">
            <div className="bento-widget-heading"><h2>Escalation hub</h2><Badge variant="outline" className="escalation-count">{open.length} open</Badge></div>
            {active ? <>
              <div className="escalation-title"><span className="escalation-symbol">{access ? <LockKeyhole size={20} /> : <MessageSquareText size={20} />}</span><div><h3>{access ? `${access.name} pending` : active.message}</h3><p>{access ? `Waiting on ${trial.client.name} admin · ${access.updatedAtHoursAgo}h elapsed` : `${active.source === "CUSTOMER" ? "Customer" : "Candidate"} · private to MAVI`}</p></div></div>
              <p className="escalation-context">{access ? "The customer needs to provide access before the candidate can confirm this tool and complete setup." : privateNote || "Review this report and follow up with the participant."}</p>
              {open.length > 1 && <Select value={active.id} onValueChange={setSelectedId}><SelectTrigger className="escalation-select" aria-label="Review another escalation"><SelectValue /></SelectTrigger><SelectContent>{open.map((item) => <SelectItem value={item.id} key={item.id}>{item.message}</SelectItem>)}</SelectContent></Select>}
              <div className="escalation-actionbar">
                <Button className="button-primary" onClick={() => onPreviewFollowup(active.id)}><SlackMark size={17} />Dispatch Slack Nudge</Button>
                <Button className="button-secondary" variant="outline" onClick={() => { dispatch({ type: "resolve-escalation", id: active.id }); onToast(access ? "Access provided in demo · candidate can now confirm their tool" : "Private report resolved in demo"); }}><Check size={15} />{access ? "Mark provided" : "Resolve report"}</Button>
              </div>
              <span className="escalation-footnote">{trial.interventions.some((entry) => entry.message.includes(active.id)) ? "Nudge simulated · no message sent" : "Opens the Slack simulator · no external message sent"}</span>
            </> : <div className="bento-all-clear"><CheckCircle2 size={28} /><h3>{health === "ON_TRACK" ? "On track. No action needed." : "No open escalations."}</h3><p>{oldestAccess ? "Pending access is within the initial provisioning window." : "Required access is ready. Participants can continue their checklists."}</p></div>}
          </section>
          <SlaWidget trial={trial} />
          <CandidateTile trial={trial} />
          <MilestoneWidget key={`${trial.id}-${state.activeDay}`} state={state} dispatch={dispatch} onPreviewFollowup={onPreviewFollowup} />
          <ActivityWidget state={state} />
        </div>
      </div>

      <DialogContent className="candidate-dossier-drawer" showOverlay={false}>
        <div className="dossier-drawer-title"><span className="candidate-monogram large">M</span><div><DialogTitle>{trial.candidate.handle}</DialogTitle><DialogDescription>Illustrative candidate dossier</DialogDescription></div></div>
        <h3>{trial.candidate.title}</h3><p>{trial.candidate.pedigree}</p>
        <div className="profile-metrics"><div><span>AI REVIEW SCORE</span><b>{trial.candidate.hallucinationScore}<small>/100</small></b></div><div><span>REVIEW SPEEDUP</span><b>{trial.candidate.auditSpeedup}<small>×</small></b></div></div>
        <div className="profile-detail-row"><b>Relevant tools</b><div>{trial.candidate.tools.map((tool) => <span className="tool-tag" key={tool}>{tool}</span>)}</div></div>
        <div className="profile-detail-row"><b>Assessment observation</b><p>{trial.candidate.challenge}</p></div>
        <div className="profile-detail-row"><b>Working hours</b><p>{trial.candidate.overlap}</p></div>
        <div className="profile-detail-row"><b>Workspace</b><p><ShieldCheck size={14} />{trial.workspace.region} · security controls are illustrative</p></div>
      </DialogContent>
    </Dialog>
  );
}
