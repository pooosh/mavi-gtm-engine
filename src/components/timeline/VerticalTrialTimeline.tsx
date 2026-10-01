"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Check, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { TrialOSState, TrialAction } from "@/lib/trial";

interface VerticalTrialTimelineProps {
  state: TrialOSState;
  dispatch: React.Dispatch<TrialAction>;
  className?: string;
}

// Each milestone node's vertical center, as a fraction of total track height (0→1).
// Track runs from the first node center to the last node center.
// Positions: 5 nodes, evenly distributed.
const NODE_FRACTIONS = [0, 0.25, 0.5, 0.75, 1.0] as const;

export function VerticalTrialTimeline({
  state,
  dispatch,
  className = "",
}: VerticalTrialTimelineProps) {
  const { trial, activeDay } = state;
  const rampItem = trial.access.find((item) => item.id === "ramp");
  const isRampProvisioned = rampItem?.status === "PROVISIONED";
  const isConverted = Boolean(trial.telemetry?.converted);

  // Which milestone phase is active (0-indexed)
  const activeMilestoneIndex = useMemo(() => {
    if (activeDay <= 1) return 0;
    if (activeDay === 2) return 1;
    if (activeDay <= 7) return 2;
    if (activeDay <= 11) return 3;
    return 4;
  }, [activeDay]);

  const milestones = [
    {
      id: "phase-0",
      dayLabel: "Days 0–1",
      startDay: 1,
      endDay: 1,
      title: "System Setup",
      status: activeDay > 1 ? "complete" : "active",
      detail: "AWS WorkSpace · NetSuite SSO",
    },
    {
      id: "phase-1",
      dayLabel: "Day 2",
      startDay: 2,
      endDay: 2,
      title: "Access Gate",
      status: isRampProvisioned
        ? "complete"
        : !isRampProvisioned && activeDay <= 2
        ? "blocked"
        : "active",
      detail: isRampProvisioned
        ? "Ramp access granted"
        : "Ramp approver pending",
    },
    {
      id: "phase-2",
      dayLabel: "Days 3–7",
      startDay: 3,
      endDay: 7,
      title: "Ledger Reconcile",
      status: activeDay > 7
        ? "complete"
        : activeMilestoneIndex === 2
        ? (!isRampProvisioned ? "blocked" : "active")
        : "upcoming",
      detail: isRampProvisioned
        ? "Shopify gross-to-net GL"
        : "Locked on Ramp access",
    },
    {
      id: "phase-3",
      dayLabel: "Days 8–11",
      startDay: 8,
      endDay: 11,
      title: "Variance Audit",
      status: activeDay > 11
        ? "complete"
        : activeMilestoneIndex === 3
        ? "active"
        : "upcoming",
      detail: "Exception review · EM signoff",
    },
    {
      id: "phase-4",
      dayLabel: "Days 12–14",
      startDay: 12,
      endDay: 14,
      title: "Retainer Decision",
      status: isConverted
        ? "complete"
        : activeMilestoneIndex === 4
        ? "active"
        : "upcoming",
      detail: isConverted
        ? "Retainer confirmed"
        : activeDay >= 12
        ? "Decision open"
        : "Unlocks Day 12",
    },
  ] as const;

  const handleDayStep = (newDay: number) => {
    dispatch({ type: "day", day: Math.max(1, Math.min(14, newDay)) });
  };

  const handleMilestoneClick = (startDay: number) => {
    dispatch({ type: "day", day: startDay });
  };

  // Track the actual pixel positions of each node dot so the progress line
  // can be anchored precisely to rendered node centers.
  const trackRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [lineStyle, setLineStyle] = useState({ top: 0, height: 0, fill: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function recalc() {
      const nodes = nodeRefs.current;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      const activeNode = nodes[activeMilestoneIndex];
      if (!firstNode || !lastNode || !track) return;

      const trackRect = track.getBoundingClientRect();
      const firstRect = firstNode.getBoundingClientRect();
      const lastRect = lastNode.getBoundingClientRect();
      const activeRect = activeNode?.getBoundingClientRect();

      const top = firstRect.top + firstRect.height / 2 - trackRect.top;
      const totalHeight =
        lastRect.top + lastRect.height / 2 - (firstRect.top + firstRect.height / 2);
      const filledHeight = activeRect
        ? activeRect.top + activeRect.height / 2 - (firstRect.top + firstRect.height / 2)
        : 0;

      setLineStyle({
        top,
        height: totalHeight,
        fill: Math.max(0, filledHeight),
      });
    }

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(track);
    return () => ro.disconnect();
  }, [activeMilestoneIndex]);

  const trialHealth = isRampProvisioned ? "on-track" : "at-risk";

  return (
    <aside
      className={`vtt-root ${className}`}
      aria-label="Trial progress"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="vtt-header">
        <div className="vtt-header-left">
          <span className="vtt-day-label">Day</span>
          <span className="vtt-day-number" aria-live="polite" aria-atomic="true">
            {activeDay}
          </span>
          <span className="vtt-day-total">/ 14</span>
        </div>

        <div className="vtt-header-right">
          <span className={`vtt-status-pill vtt-status-${trialHealth}`}>
            <span className={`vtt-status-dot vtt-dot-${trialHealth}`} aria-hidden="true" />
            {isRampProvisioned ? "On track" : "Access pending"}
          </span>

          <div className="vtt-day-nav" role="group" aria-label="Navigate trial day">
            <button
              type="button"
              onClick={() => handleDayStep(activeDay - 1)}
              disabled={activeDay <= 1}
              className="vtt-nav-btn"
              aria-label="Previous day"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleDayStep(activeDay + 1)}
              disabled={activeDay >= 14}
              className="vtt-nav-btn"
              aria-label="Next day"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Track ──────────────────────────────────────────────── */}
      <div className="vtt-track" ref={trackRef}>
        {/* Background rail */}
        <div
          className="vtt-rail vtt-rail-bg"
          style={{ top: lineStyle.top, height: lineStyle.height }}
          aria-hidden="true"
        />
        {/* Filled progress rail — transitions on height */}
        <div
          className="vtt-rail vtt-rail-fill"
          style={{
            top: lineStyle.top,
            height: lineStyle.fill,
            transition: "height 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          aria-hidden="true"
        />

        {milestones.map((node, idx) => {
          const isActive = activeMilestoneIndex === idx;
          const isComplete = node.status === "complete";
          const isBlocked = node.status === "blocked";
          const isUpcoming = node.status === "upcoming";

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleMilestoneClick(node.startDay)}
              className={`vtt-row vtt-row-${node.status}`}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Dot */}
              <div
                ref={(el) => { nodeRefs.current[idx] = el; }}
                className={`vtt-dot vtt-dot-state-${node.status}`}
                aria-hidden="true"
              >
                {isComplete && <Check size={9} strokeWidth={3} />}
                {isBlocked && <AlertCircle size={9} strokeWidth={2.5} />}
              </div>

              {/* Row text */}
              <div className="vtt-row-content">
                <span className="vtt-row-title">{node.title}</span>
                <span className="vtt-row-meta">
                  <span className="vtt-row-day">{node.dayLabel}</span>
                  {node.detail && (
                    <>
                      <span className="vtt-row-sep" aria-hidden="true">·</span>
                      <span className={`vtt-row-detail vtt-detail-${node.status}`}>
                        {node.detail}
                      </span>
                    </>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      {!isRampProvisioned && (
        <div className="vtt-footer">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "access", id: "ramp", status: "PROVISIONED" });
              dispatch({ type: "resolve-escalation", id: "access-ramp" });
            }}
            className="vtt-resolve-btn"
          >
            Resolve Ramp access
          </button>
        </div>
      )}
    </aside>
  );
}
