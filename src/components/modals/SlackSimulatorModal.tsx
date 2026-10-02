"use client";

import React, { useState } from "react";
import { SlackMark } from "@/components/brand/slack-mark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import type { JevAccountTriage } from "@/types/jev";

function MaviMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="mavi-mark"
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
        strokeWidth="2.6"
      />
      <path
        d="M4 24.5c0 1.1 1.3 1.6 2.1.8L18 12.2 29.9 25.3c.8.8 2.1.3 2.1-.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

export interface SlackSimulatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triage: JevAccountTriage | null;
  onDispatched?: (accountId: string) => void;
}

export function SlackSimulatorModal({
  open,
  onOpenChange,
  triage,
  onDispatched,
}: SlackSimulatorModalProps) {
  const [sent, setSent] = useState(false);

  if (!triage) return null;

  const channelName = `trial-${triage.accountName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const blockerName = triage.primaryBlocker || "Access provisioning";

  function handleDispatch() {
    setSent(true);
    onDispatched?.(triage!.accountId);
    setTimeout(() => {
      onOpenChange(false);
      setSent(false);
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="trial-dialog max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        {/* Head */}
        <div className="dialog-head">
          <span className="dialog-icon">
            <SlackMark size={18} />
          </span>
          <button
            aria-label="Close"
            className="icon-button"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X size={17} />
          </button>
        </div>

        <DialogTitle className="dialog-title" id="dialog-title">
          Send a nudge to Slack
        </DialogTitle>
        <DialogDescription className="dialog-helper">
          Planned MAVI Slack bot: in a connected workspace, it sends this follow-up to the trial team for {triage.accountName}.
        </DialogDescription>

        {/* Jev System 1 Triage Summary — Flat editorial presentation, no nested card chrome */}
        <div className="py-3 border-y border-[var(--line)] my-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
              <Sparkles size={13} className="text-[var(--brand)]" />
              <span>TypeSafe Jev · Autonomous Triage</span>
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">
              Confidence: {Math.round(triage.recommendedAction.confidence * 100)}% · ~{triage.latencyMs}ms
            </span>
          </div>

          <div className="grid grid-cols-3 py-2 border-y border-[var(--line)] text-left">
            <div className="pr-3">
              <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)]">
                SLA Risk
              </span>
              <strong className="text-base font-normal text-[var(--ink)] tabular-nums">
                {triage.slaRiskScore.score}
                <small className="text-[10px] font-normal text-[var(--muted-foreground)]">/100</small>
              </strong>
            </div>

            <div className="border-x border-[var(--line)] px-3">
              <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)]">
                Blocker (Noul)
              </span>
              <strong className="text-base font-normal text-[var(--ink)] tabular-nums">
                {Math.round(triage.isCriticalBlocker.noul * 100)}%
              </strong>
            </div>

            <div className="pl-3">
              <span className="block text-[10px] uppercase tracking-wider text-[var(--soft-muted)]">
                Action
              </span>
              <strong className="text-xs font-normal text-[var(--brand)] mt-0.5 block truncate">
                {triage.recommendedAction.choice.replace(/_/g, " ")}
              </strong>
            </div>
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed m-0">
            {triage.rationale}
          </p>
        </div>

        {/* Authentic Slack Preview */}
        <div className="slack-preview">
          <div className="slack-preview-head">
            <span>
              <SlackMark size={16} />
              Illustrative Slack message
            </span>
            <b>DEMO</b>
          </div>
          <div className="slack-channel">
            <span>#</span> {channelName} <small>shared trial channel</small>
          </div>
          <div className="slack-message-row">
            <div aria-hidden="true" className="slack-bot-avatar">
              <MaviMark size={20} />
            </div>
            <div className="slack-message-content">
              <div className="slack-message-meta">
                <strong>MAVI Trial Bot</strong>
                <span className="slack-app-badge">APP</span>
                <time>Now</time>
              </div>
              <p>
                {blockerName} is pending on Day {triage.day} for {triage.accountName}. Can the trial owner confirm approver provisioning so the candidate can complete verification without delays?
              </p>
            </div>
          </div>
          <div className="slack-preview-note">Demo preview · no message sent</div>
        </div>

        {/* Dialog Actions */}
        <div className="dialog-actions">
          <Button
            className="button-secondary"
            onClick={() => onOpenChange(false)}
            size="lg"
            type="button"
            variant="outline"
            disabled={sent}
          >
            Cancel
          </Button>
          <Button
            className="button-primary"
            onClick={handleDispatch}
            disabled={sent}
            size="lg"
            type="button"
          >
            {sent ? (
              <>
                <CheckCircle2 size={16} />
                Nudge Dispatched
              </>
            ) : (
              <>
                <SlackMark size={16} />
                1-Click Send Nudge to Slack
              </>
            )}
          </Button>
        </div>

        {/* Dialog Demo Note */}
        <div className="dialog-demo-note">
          <span className="demo-dot" />Demo only · no external message is sent
        </div>
      </DialogContent>
    </Dialog>
  );
}
