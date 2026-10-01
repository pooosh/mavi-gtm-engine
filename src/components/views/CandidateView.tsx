"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock,
  MessageSquareWarning,
  Monitor,
  Radio,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { VerticalTrialTimeline } from "@/components/timeline/VerticalTrialTimeline";
import type { TrialState } from "@/types/portal";

interface CandidateViewProps {
  state: TrialState;
  onToast: (message: string) => void;
}

export function CandidateView({ state, onToast }: CandidateViewProps) {
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [blockerNote, setBlockerNote] = useState("");
  const [vmConnecting, setVmConnecting] = useState(false);

  const rampItem = state.systemAccess.find((item) => item.id === "ramp");
  const isRampProvisioned = rampItem?.status === "PROVISIONED";

  const handleLaunchVm = () => {
    setVmConnecting(true);
    setTimeout(() => {
      setVmConnecting(false);
      onToast("Connected to US-East (N. Virginia) AWS WorkSpace · Hypervisor Active");
    }, 600);
  };

  const handleReportBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    setBlockerModalOpen(false);
    onToast("Discreet blocker transmitted to MAVI Dispatch operations");
    setBlockerNote("");
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-start gap-6">
      {/* Left: Primary Actual Content Canvas */}
      <div className="flex-1 min-w-0 space-y-5 w-full">
        {/* Top Welcome Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg ring-2 ring-indigo-100">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Talent Workspace
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">Athena Club Trial (Day 2 of 14)</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 mt-0.5">
                Welcome back, {state.candidate.handle}
              </h1>
              <p className="text-xs text-slate-500">
                {state.candidate.title} · Working Hours Overlap: {state.candidate.overlapWindow}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBlockerModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <MessageSquareWarning size={14} className="text-amber-600" />
            <span>Report Blocker Discreetly to MAVI</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* AWS WorkSpace VM Launcher Tile */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Monitor size={17} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  AWS WorkSpace Launcher
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Virtual Desktop:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {state.candidate.vmSpec.ipRegion}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Latency to Gateway:</span>
                <span className="tabular-nums text-emerald-700 font-medium">24ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Zero-Egress Security:</span>
                <span className="text-slate-700 font-medium">Clipboard & Downloads Blocked</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchVm}
              disabled={vmConnecting}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {vmConnecting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Connecting to Hypervisor...
                </>
              ) : (
                <>
                  <Monitor size={14} />
                  <span>Launch Virtual Desktop Session</span>
                  <ArrowUpRight size={13} className="text-indigo-200" />
                </>
              )}
            </button>
          </div>

          {/* System Readiness Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-600">
              System Readiness & Tool Access
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-medium text-slate-800">NetSuite Read-Only</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready
                </span>
              </div>

              {isRampProvisioned ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span className="font-medium text-slate-800">Ramp Approver Access</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-300 bg-amber-50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-600 animate-pulse" />
                    <span className="font-semibold text-amber-900">Ramp Approver Access</span>
                  </div>
                  <span className="text-[10px] text-amber-900 font-bold bg-amber-200 px-2 py-0.5 rounded">
                    Pending Client IT
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-medium text-slate-800">Shopify Data Export</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Loaded
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-medium text-slate-800">Slack #finance-athena</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Reconciliation Deliverable */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daily Reconciliation Deliverable
              </h2>
              <p className="text-xs text-slate-500">
                Objective: {state.client.primaryDeliverable}
              </p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
              Day 2 Sprint
            </span>
          </div>

          {/* Reconciliation Steps */}
          <div className="space-y-3 text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Step 1: Clean & Standardize Shopify Sales Ledger
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">Completed</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Extracted gross sales, discount coupons, and refunded SKUs from Shopify CSV.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                isRampProvisioned
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-rose-200 bg-rose-50/30"
              }`}
            >
              {isRampProvisioned ? (
                <Zap size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Lock size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    Step 2: Reconcile Against NetSuite Inventory & Ramp Ledgers
                  </span>
                  {isRampProvisioned ? (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                      Ready to Execute
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">
                      Blocked by Ramp Access
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {isRampProvisioned
                    ? "Ramp approver role confirmed. Proceeding to tie out inventory variances against NetSuite general ledger."
                    : "Awaiting Client IT to provision Ramp approver seat. NetSuite inventory GL requires Ramp transaction match."}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/30 flex items-start gap-3 text-slate-500">
              <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                3
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">
                    Step 3: Exception &amp; Variance Executive Summary
                  </span>
                  <span className="text-[10px] text-slate-600">Upcoming</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Prepare working papers summary for Alex (Athena Club CFO) and Molly Liu (MAVI).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Discreet Blocker Modal */}
      {blockerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquareWarning size={18} className="text-amber-600" />
              <h3 className="font-bold text-base text-slate-900">
                Discreet Blocker Report
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Report access issues or technical bottlenecks confidentially to your MAVI Operations Lead (Molly Liu). <strong>Athena Club does not see this note directly</strong>; MAVI intervenes on your behalf.
            </p>

            <form onSubmit={handleReportBlocker} className="space-y-3.5">
              <div>
                <label htmlFor="blocker-issue-textarea-candidate" className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe what you are waiting on:
                </label>
                <textarea
                  id="blocker-issue-textarea-candidate"
                  value={blockerNote}
                  onChange={(e) => setBlockerNote(e.target.value)}
                  placeholder="e.g. Ramp approver role still pending after 28 hours, unable to proceed with NetSuite inventory ledger reconciliation..."
                  rows={4}
                  required
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockerModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <span>Submit Blocker to MAVI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

