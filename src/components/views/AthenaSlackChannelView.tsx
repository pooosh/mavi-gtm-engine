"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Hash,
  Lock,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { SlackMark } from "@/components/brand/slack-mark";

export interface AthenaSlackChannelViewProps {
  isRampResolved: boolean;
  onGrantRampAccess: () => void;
  onCopyInstructions: () => void;
  onOpenDossier?: () => void;
  candidateHandle?: string;
  candidateTitle?: string;
  clientName?: string;
  activeDay?: number;
  copiedInstructions?: boolean;
}

function MaviBotMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 36 30"
      width={size * (36 / 30)}
      style={{ flexShrink: 0, display: "inline-block" }}
    >
      <path
        d="M4 24.5V5.5c0-1.1 1.3-1.6 2.1-.8L18 17.8 29.9 4.7c.8-.8 2.1-.3 2.1.8v19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.2"
      />
    </svg>
  );
}

export function AthenaSlackChannelView({
  isRampResolved,
  onGrantRampAccess,
  onCopyInstructions,
  onOpenDossier,
  candidateHandle = "Candidate M-402",
  candidateTitle = "Senior Inventory & Revenue Accountant",
  clientName = "Athena Club",
  activeDay = 2,
  copiedInstructions = false,
}: AthenaSlackChannelViewProps) {
  const [draftMessage, setDraftMessage] = useState("");
  const [customReplies, setCustomReplies] = useState<string[]>([]);
  const [isGranting, setIsGranting] = useState(false);

  const handleGrantClick = () => {
    setIsGranting(true);
    setTimeout(() => {
      onGrantRampAccess();
      setIsGranting(false);
    }, 280);
  };

  const handleSendDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim()) return;
    setCustomReplies((prev) => [...prev, draftMessage.trim()]);
    setDraftMessage("");
  };

  return (
    <div className="w-full rounded-xl border border-[var(--line)] bg-white overflow-hidden shadow-none flex flex-col text-[var(--ink)]">
      {/* ── 1. Authentic Slack Channel Header ──────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)] bg-[var(--canvas)]/40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[var(--ink)]">
            <Lock size={13} className="text-[var(--soft-muted)] shrink-0" />
            <span className="font-normal text-[13px] tracking-tight">finance-athena</span>
          </div>
          <span className="text-[var(--line)] text-xs">|</span>
          <span className="text-[11px] text-[var(--muted-foreground)] truncate hidden md:inline">
            Shared trial room · {clientName} &times; MAVI · Lead: <span className="text-[var(--ink)]">@alex_cfo</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-[var(--brand)] text-[9px] flex items-center justify-center border border-white">
              A
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] flex items-center justify-center border border-white">
              M
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] flex items-center justify-center border border-white">
              S
            </div>
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[9px] flex items-center justify-center border border-white">
              C
            </div>
          </div>
          <span className="text-[11px] tabular-nums">4</span>
          <div className="w-px h-3.5 bg-[var(--line)]" />
          <div className="flex items-center gap-1 text-[11px] text-[var(--soft-muted)] bg-white px-2 py-0.5 rounded border border-[var(--line)]">
            <SlackMark size={12} />
            <span>Slack Connect</span>
          </div>
        </div>
      </div>

      {/* ── 2. Message History Canvas ───────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex-1 min-h-[460px] max-h-[640px] overflow-y-auto space-y-5 bg-white text-[13px] leading-relaxed">
        {/* Day 1 Context Message */}
        <div className="flex items-start gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs shrink-0 mt-0.5 border border-emerald-200">
            SJ
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-normal text-[var(--ink)] text-xs">Sarah Jenkins (MAVI Lead)</span>
              <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">Yesterday at 9:15 AM</span>
            </div>
            <p className="mt-1 text-[var(--ink)] text-xs leading-relaxed">
              Welcome to the working trial channel <span className="px-1 py-0.5 rounded bg-indigo-50 text-[var(--brand)] text-xs">@alex_cfo</span>! We kicked off Day 1 setup for <strong>{candidateHandle}</strong> ({candidateTitle}). NetSuite read-only access is fully verified and candidate has reviewed Athena Club&apos;s chart of accounts.
            </p>
          </div>
        </div>

        {/* Date Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--line)]" />
          </div>
          <span className="relative px-3 bg-white text-[10px] uppercase tracking-wider text-[var(--soft-muted)] font-normal border border-[var(--line)] rounded-full">
            Today · Day {activeDay} of 14
          </span>
        </div>

        {/* Candidate Morning Check-in */}
        <div className="flex items-start gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-200">
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-normal text-[var(--ink)] text-xs">{candidateHandle}</span>
              <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">9:02 AM</span>
            </div>
            <p className="mt-1 text-[var(--ink)] text-xs leading-relaxed">
              Good morning team. Finished review of inventory clearing structure. Ready to proceed with Phase 2 Shopify sales reconciliation as soon as Ramp approver permissions are active.
            </p>
          </div>
        </div>

        {/* ── 3. MAVI Bot Interactive Block Kit Message ───────────────── */}
        <div className="flex items-start gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
            <MaviBotMark size={16} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-normal text-[var(--ink)] text-xs">MAVI Trial Bot</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-normal uppercase bg-[var(--canvas)] border border-[var(--line)] text-[var(--soft-muted)] tracking-wider">
                APP
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">10:14 AM</span>
            </div>

            <p className="text-xs text-[var(--ink)] leading-relaxed m-0">
              Notice for <span className="px-1 py-0.5 rounded bg-indigo-50 text-[var(--brand)] text-xs">@alex_cfo</span>: Jev System 1 flagged an access bottleneck on <strong>Day 2 (System Provisioning)</strong> for <strong>{candidateHandle}</strong>.
            </p>

            {/* Block Kit Card Container */}
            <div className="rounded-lg border border-[var(--line)] bg-white overflow-hidden transition-colors">
              {/* Card Header */}
              <div className="px-4 py-3 bg-[var(--canvas)]/30 border-b border-[var(--line)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white ${
                    isRampResolved ? "bg-emerald-600" : "bg-[var(--brand)]"
                  }`}>
                    {isRampResolved ? <Check size={12} strokeWidth={3} /> : <Zap size={12} />}
                  </div>
                  <span className="text-xs font-normal text-[var(--ink)]">
                    {isRampResolved
                      ? "Ramp Approver Access Granted · Provisioning Complete"
                      : "Action Required: Grant Ramp Approver Access"}
                  </span>
                </div>
                <span className="text-[10px] tabular-nums text-[var(--soft-muted)] uppercase tracking-wider">
                  {isRampResolved ? "Status: Resolved" : "Pending 28h · SLA Warning"}
                </span>
              </div>

              {/* Card Section Description */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed m-0">
                  {candidateHandle} requires read/approver role in Ramp to reconcile Q3 corporate card disbursements against the Shopify clearing accounts. Without access, trial progression is delayed by ~4.5 hours daily.
                </p>

                {/* 2x2 Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2.5 px-3 rounded-md bg-[var(--canvas)]/60 border border-[var(--line)] text-xs">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)]">
                      Candidate
                    </span>
                    <span className="text-[var(--ink)] block mt-0.5 font-normal">
                      {candidateHandle} <span className="text-[var(--muted-foreground)]">({candidateTitle})</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)]">
                      Target Role
                    </span>
                    <span className="text-[var(--ink)] block mt-0.5 font-normal">
                      Ramp &gt; Roles &amp; Permissions &gt; Approver
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)]">
                      SLA Threshold
                    </span>
                    <span className={`block mt-0.5 font-normal tabular-nums ${isRampResolved ? "text-emerald-700" : "text-amber-800"}`}>
                      {isRampResolved ? "Resolved within window" : "28h elapsed (36h breach limit)"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)]">
                      Jev System 1 Confidence
                    </span>
                    <span className="text-[var(--brand)] block mt-0.5 font-normal tabular-nums">
                      94% Bayesian Confidence (Latency: ~118ms)
                    </span>
                  </div>
                </div>

                {/* Interactive Action Block / Status Banner */}
                {!isRampResolved ? (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGrantClick}
                      disabled={isGranting}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--brand)] hover:opacity-95 active:scale-[0.99] text-white text-xs font-normal transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGranting ? (
                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={13} strokeWidth={2.5} />
                      )}
                      <span>Grant Access in 1-Click</span>
                    </button>

                    <button
                      type="button"
                      onClick={onCopyInstructions}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--line)] bg-white hover:bg-[var(--canvas)] text-[var(--ink)] text-xs font-normal transition-colors cursor-pointer"
                    >
                      <Copy size={12} className="text-[var(--muted-foreground)]" />
                      <span>{copiedInstructions ? "Copied to Clipboard!" : "Copy IT Instructions"}</span>
                    </button>

                    {onOpenDossier && (
                      <button
                        type="button"
                        onClick={onOpenDossier}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                      >
                        <span>View Dossier</span>
                        <ExternalLink size={11} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 p-3 rounded-md bg-emerald-50/70 border border-emerald-200/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-emerald-950 font-normal block">
                          Access Granted by @alex_cfo via MAVI Slack App
                        </span>
                        <span className="text-[11px] text-emerald-800 block mt-0.5 leading-relaxed">
                          Ramp OAuth webhook confirmed role for <code>m-402@talent.mavi.work</code>. Candidate unblocked; trial telemetry synchronized to 100% provisioned.
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-white border border-emerald-200 text-emerald-800 shrink-0 tabular-nums">
                      Sync Complete
                    </span>
                  </div>
                )}

                {/* Context footer line */}
                <div className="pt-1 text-[10px] text-[var(--soft-muted)] flex items-center gap-1.5">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  <span>Authorized through MAVI Enterprise Bridge · End-to-end audit logging active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Immediate Bot Follow-up Message When Resolved ─────────── */}
        {isRampResolved && (
          <div className="flex items-start gap-3 group pt-1 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
              <MaviBotMark size={16} />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-normal text-[var(--ink)] text-xs">MAVI Trial Bot</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-normal uppercase bg-[var(--canvas)] border border-[var(--line)] text-[var(--soft-muted)] tracking-wider">
                  APP
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">Just now</span>
              </div>
              <p className="text-xs text-[var(--ink)] leading-relaxed m-0">
                ✅ Confirmed! <strong>{candidateHandle}</strong> is now verified in Ramp. Phase 2 deliverables have commenced. Both the Athena Club customer portal and the MAVI portfolio flight path have been updated.
              </p>
            </div>
          </div>
        )}

        {/* Custom User Replies in Thread */}
        {customReplies.map((reply, idx) => (
          <div key={idx} className="flex items-start gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[var(--brand)] flex items-center justify-center text-xs shrink-0 mt-0.5 border border-indigo-200">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-normal text-[var(--ink)] text-xs">Alex (CFO, Athena Club)</span>
                <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">Just now</span>
              </div>
              <p className="mt-1 text-[var(--ink)] text-xs leading-relaxed m-0">{reply}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. Message Input Bar ────────────────────────────────────────── */}
      <div className="p-3 border-t border-[var(--line)] bg-[var(--canvas)]/20">
        <form onSubmit={handleSendDraft} className="border border-[var(--line)] rounded-lg bg-white overflow-hidden focus-within:border-[var(--brand)] transition-colors">
          <input
            type="text"
            placeholder="Reply to #finance-athena..."
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs text-[var(--ink)] placeholder:text-[var(--soft-muted)] outline-none bg-transparent"
          />
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[var(--canvas)]/30 border-t border-[var(--line)] text-[var(--soft-muted)]">
            <div className="flex items-center gap-2">
              <button type="button" className="p-1 hover:text-[var(--ink)] rounded cursor-pointer transition-colors" title="Attach file">
                <Paperclip size={13} />
              </button>
              <button type="button" className="p-1 hover:text-[var(--ink)] rounded cursor-pointer transition-colors" title="Insert emoji">
                <Smile size={13} />
              </button>
              <button type="button" className="p-1 hover:text-[var(--ink)] rounded cursor-pointer transition-colors" title="Mention team">
                <span className="text-xs font-normal">@</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!draftMessage.trim()}
              className="p-1.5 rounded-md bg-[var(--brand)] text-white hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
              title="Send reply"
            >
              <Send size={12} />
            </button>
          </div>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--soft-muted)]">
          <span>Press Enter to reply in #finance-athena</span>
          <span>Illustrative Slack Connect Workspace</span>
        </div>
      </div>
    </div>
  );
}
