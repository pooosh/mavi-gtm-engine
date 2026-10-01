---
target: portal
total_score: 36
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/Users/piyush/Projects/Startups/mavi-gtm-engine/src/app/portal/trial-portal.tsx"
target_fingerprint: "sha256:bceda0d8843fd215a654ee3678e6ae748a01b2d33b3e62af3946fc028fdf1196"
target_path: /Users/piyush/Projects/Startups/mavi-gtm-engine/src/app/portal/trial-portal.tsx
timestamp: 2026-10-01T04-22-06Z
slug: src-app-portal-trial-portal-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Exemplary — persistent day anchor, SLA meters, and unblocking action states |
| 2 | Match System / Real World | 4 | Excellent alignment with finance/accounting mental models (Shopify gross-to-net, NetSuite GL) |
| 3 | User Control and Freedom | 3 | Smooth role switching via controller; timeline day stepping is intuitive |
| 4 | Consistency and Standards | 4 | Strictly consistent hairline border vocabulary and unified border radius tokens (6px, 10px, 12px, 16px) |
| 5 | Error Prevention | 4 | Prerequisites and disabled conversion gates prevent out-of-order actions effectively |
| 6 | Recognition Rather Than Recall | 4 | All trial context, candidate metrics, and security details visible without recall burden |
| 7 | Flexibility and Efficiency | 3 | Quick simulation shortcuts and clean keyboard navigation |
| 8 | Aesthetic and Minimalist Design | 3 | Vastly improved — removal of side-tab borders and shadows creates crisp, editorial aesthetic |
| 9 | Error Recovery | 3 | Action banners state recovery steps ('Mark as Granted', 'Copy IT Instructions') with inline status indicators |
| 10 | Help and Documentation | 3 | Private MAVI note channel and contextual dialogs provide direct guidance |
| **Total** | | **36/40** | **Excellent — minor polish only; ship it** |

---

## Design Specificity Verdict

**LLM assessment:** The interface has moved substantially closer to the "Editorial Finance Desk" vision. Eliminating side-tab borders, artificial drop shadows, and monospace costume fonts gives the UI a clean, high-density editorial finish akin to Linear or Ramp. The typography relies on size contrast and layout rhythm rather than decorative gimmicks. While the card grid structure remains present, the visual noise floor has dropped drastically, allowing operational content to lead.

**Deterministic scan:** 0 findings, 0 false positives — exit code 0.
- All 5 `side-tab` accent borders eliminated.
- Layout-thrash `transition: width` replaced with `transform: scaleX()`.
- Craft floor violations: 0.

---

## Overall Impression

The MAVI Trial OS portal now reads as a serious, executive finance workspace. The removal of AI-slop side-tab borders and decorative shadows allows the hairline borders, crisp typography, and MAVI Indigo action signals to operate as intended by `DESIGN.md`. The design health score improved from **26/40 (Acceptable)** to **36/40 (Excellent)**.

---

## What's Working

**1. Clean, flat elevation model.** hairline `1px #e5e7eb` borders replace box-shadows everywhere, giving cards an authentic Ramp/Linear editorial quality.

**2. Disciplined single accent.** MAVI Indigo (`#4f46e5`) appears strictly on interactive CTAs and active indicators, making every primary action switch on visually.

**3. Accessible & robust interactions.** Persistent `aria-live="polite"` toast region, labeled modal textareas, `tabular-nums` numeric alignment, and WCAG-compliant focus outlines on radio options.

---

## Priority Issues

### [P2] Retainer conversion card visible 10 days early

**What:** The Retainer Conversion Gate card in CustomerView is visible on Day 2 even though it is locked until Day 12.

**Why it matters:** While its styling is now properly muted with a clean `Lock` badge, showing it on Day 2 adds minor visual clutter to the right column.

**Fix:** Collapse or minimize the card when `activeDay < 12`.

### [P3] Right column vertical stack

**What:** Stacking three cards (Candidate Dossier, Private Feedback Channel, Retainer Conversion Gate) in the 5-column right rail can require minor scrolling on smaller desktop screens.

**Why it matters:** Minor usability inconvenience on low-resolution viewports.

**Fix:** Make the Private Feedback Channel card collapsible or expand on demand.

---

## Persona Red Flags

- **Priya (CFO)**: Zero red flags. Blockers are highlighted inline with clear primary CTAs ("Mark as Granted", "Copy IT Instructions") that operate without cognitive noise.
- **Sam (Screen reader user)**: Zero red flags. Toast announcements are announced by screen readers, modal textareas have programmatic labels, and keyboard focus rings are visible.

---

## Minor Observations

- Tabular numbers render crisply across SLA metrics, Day steppers, and task counters.
- Keyboard navigation across modal dialogs is clean and accessible.
