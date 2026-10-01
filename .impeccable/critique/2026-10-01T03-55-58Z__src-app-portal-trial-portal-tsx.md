---
target: portal
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/piyush/Projects/Startups/mavi-gtm-engine/src/app/portal/trial-portal.tsx"
target_fingerprint: "sha256:e9c8c74aefdc9355a93375a1b56e646eda58d332967c76092c712a29ac395177"
target_path: /Users/piyush/Projects/Startups/mavi-gtm-engine/src/app/portal/trial-portal.tsx
timestamp: 2026-10-01T03-55-58Z
slug: src-app-portal-trial-portal-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Exemplary — day markers, SLA dials, task counts all present |
| 2 | Match System / Real World | 3 | Good fintech language; minor jargon (SLA, provisioning) leaks through to CFO view |
| 3 | User Control and Freedom | 2 | Demo controller gives role freedom; trial workflow is entirely linear with no escape paths |
| 4 | Consistency and Standards | 3 | Consistent component patterns, but border-radius ranges from 3–13px across components |
| 5 | Error Prevention | 3 | Blocked states and prerequisites enforced; no recovery if Day control is mis-stepped |
| 6 | Recognition Rather Than Recall | 4 | All needed context visible without requiring memory from previous screens |
| 7 | Flexibility and Efficiency | 2 | One rigid path, no keyboard shortcuts, no batch or accelerator paths |
| 8 | Aesthetic and Minimalist Design | 1 | Card-in-card nesting, competing border treatments, and simultaneous full disclosure eliminate all hierarchy |
| 9 | Error Recovery | 2 | Grant Ramp Access button is clear; resolution paths styled identically to generic error alerts |
| 10 | Help and Documentation | 2 | Private MAVI note channel is a nice pattern; no contextual help at decision points |
| **Total** | | **26/40** | **Acceptable — significant improvements needed** |

---

## Design Specificity Verdict

**LLM assessment:** The interface is severely category-interchangeable. Despite the product's genuinely unusual premise — a live, AI-orchestrated 14-day working trial with a fixed role topology (CFO ↔ Candidate ↔ Operator) — the composition is structurally identical to any HR onboarding or B2B analytics dashboard. The product's identity lives entirely in the copy ("NetSuite reconciliation," "Ramp approver access") and not in any spatial or structural decisions that are specific to this workflow. A skilled designer could swap the copy for generic HR terms and ship this as a template. The most critical missed opportunity: the product is literally called a "Trial OS" and an "Operating System," yet the Customer View arranges information as a newsletter stack of bordered cards, not a workspace. There is no spatial metaphor that earns the "OS" framing.

**Deterministic scan:** 6 findings, 0 false positives. Exit code 2.
- **5× side-tab** (colored border, ≥3px, on one card edge): `globals.css` lines 172, 269, 323; `CustomerView.tsx` lines 268, 306. This is the single most flagged anti-pattern in the detector's slop category and the most reliable visual signal of AI-generated UI. It appears in the health banner, the candidate summary strip, the active/resolved alert cards in CustomerView, and the map cell alert stripe.
- **1× layout-transition** (animating `width` in `globals.css` line 137): causes layout thrash on the SLA dial or stepper animation; replace with `transform: scaleX()` or `clip-path`.

Both A and B agree on colored side-borders as the single most damaging pattern. The detector caught 5 instances and A identified the same craft-floor violation independently, confirming this is structural, not incidental.

---

## Overall Impression

The MAVI Trial OS is clear, honest, and functional — the status system genuinely works, and the shared state contract across three views is a real achievement. But it presents everything at once, uses bordered boxes as a substitute for hierarchy, and looks indistinguishable from a dozen other B2B dashboards. The gap between the product's ambition (a coordination OS for a live working trial) and the interface's execution (a newsletter stack of status cards) is the central problem. Fix the hierarchy first; the rest follows.

---

## What's Working

**1. Status system is genuinely excellent (H1: 4/4).** Day anchor, SLA elapsed time, task completion counters, and access status are all visible, consistent, and accurate across role switches. The 28h/36h Ramp SLA warning is surfaced correctly in the operator dashboard. This is the hardest part of a multi-role dashboard to get right, and it's solid.

**2. Real product data grounds the demo.** NetSuite, Ramp, Shopify, AWS WorkSpace — the specificity of the mock data makes the three-role story legible and credible. A generic onboarding demo would lose this entirely.

**3. The role-separation architecture is sound.** CustomerView, CandidateView, and OperatorView are genuinely asymmetric — each shows different data with different primary actions. The DemoController's floating switcher is a clean and non-intrusive mechanism.

---

## Priority Issues

### [P0] Card-in-card nesting destroys all visual hierarchy

**What:** Every distinct piece of content (task list, dossier, alert, conversion gate, SLA dial, timeline node) is wrapped in a bordered, background-differentiated card, producing a fractal nesting pattern. CustomerView has three distinct nesting depths in some sections (page background → column wrapper → card → inner section).

**Why it matters:** There is no first-order element. A CFO opening the portal cannot scan for "the one thing that needs my attention right now" because every element asserts equal visual priority through its border. The Ramp access blocker — the single most urgent item — competes visually with the retainer gate, the Slack sync badge, the candidate dossier, and the flight path stepper all at once.

**Fix:** Establish a strict two-level visual hierarchy: (1) a prominent alert stripe or action banner for the current blocking item, which owns the top of the viewport and uses color + weight to stand apart; (2) a reading surface below it with information grouped by spacing and typography, not boxes. Remove card backgrounds from all secondary sections. Reserve bordered cards for entities (the candidate dossier, the retainer gate) and use whitespace + dividers for grouping within.

**Suggested command:** `$impeccable layout`

---

### [P1] All seven sections of CustomerView are fully exposed simultaneously

**What:** The Customer CFO view renders the horizontal phase stepper, active task list, candidate dossier, Slack sync status, pulse feedback card, retainer conversion gate, and the vertical trial timeline all at once, without any progressive disclosure.

**Why it matters:** Cognitive load assessment found 3 of 7 checklist items failing, with the primary failures in progressive disclosure and competing focal elements. On Day 2 of 14, the retainer gate is more than 10 days premature — showing it now trains the user to ignore it, and it dilutes the urgency of the Ramp blocker. The assessment also found that the horizontal flight path and the vertical timeline tell the same temporal story twice with redundant ink.

**Fix:** Collapse the retainer gate behind a "Day 12+" gate condition. Collapse the candidate dossier to a compact summary strip that expands on click. Pick one timeline representation (the vertical fixed-rail timeline) and remove the horizontal phase stepper or demote it to a lightweight phase label. Each role view should have one primary object of attention, not seven.

**Suggested command:** `$impeccable distill`

---

### [P1] Side-tab accent borders — 5 confirmed instances, a top-tier slop signal

**What:** Five components use a thick (3–4px) colored border on a single edge of a card as the primary status indicator: the health banner in `globals.css`, the candidate summary strip, the map cell alert, and the active/resolved alert cards in CustomerView. Both Assessment A and the detector flagged this independently.

**Why it matters:** This is the single most reliable visual fingerprint of AI-generated UI — the detector's own `slop` category. It signals to anyone who works in product design that the interface was machine-assembled, not designed. More practically, it communicates status through color and position alone, with no text label or icon redundancy, which fails WCAG's non-color requirement.

**Fix:** Replace all `border-l-4` / `border-left: 3px solid` status indicators with one of: (a) a text badge + icon in the card's header row for status; (b) a subtle, full-perimeter `ring-1` with a semantic color that pairs with a text status; (c) a small colored dot or dash motif that doesn't dominate the card edge. In CustomerView specifically, replace `border-l-4 border-l-amber-500` with an amber dot + "Pending 28h" label inline in the card header.

**Suggested command:** `$impeccable polish`

---

### [P2] Unlabeled modal textarea and broken aria-live toast

**What (a):** The feedback modal textarea in CustomerView (`CustomerView.tsx:677`) has no `<label>`, `aria-label`, or `aria-labelledby`. Placeholder text is not an accessible label (WCAG 1.3.1, 4.1.2).

**What (b):** The toast notification in `trial-portal.tsx:550` mounts its `aria-live="polite"` region conditionally. Screen readers (VoiceOver, NVDA) only announce changes *within* a live region; they ignore a live region that mounts into the DOM already containing content. The region must be persistently present in the DOM with its content updated.

**Why it matters:** These are WCAG failures — a CFO using a screen reader cannot understand what the feedback modal is asking for, and a candidate using assistive technology never receives confirmation that their action succeeded.

**Fix (a):** Add `<label htmlFor="feedback-input" className="sr-only">Private feedback</label>` and `id="feedback-input"` on the textarea.
**Fix (b):** Mount the toast container unconditionally (empty when no toast), and update its text content: `<div aria-live="polite" role="status">{toast?.message ?? ""}</div>`. Also extend dismiss timeout to ≥5 seconds or add a pause-on-hover.

**Suggested command:** `$impeccable audit`

---

### [P2] Monospace font as "technical" costume

**What:** Monospace (`font-mono`) is used on Day labels ("Day 2"), SLA elapsed times ("28h"), and the AWS VM IP address and ping latency, not because these are code or tabular data, but to signal "technical." This is a craft-floor ban.

**Why it matters:** It applies a visual register (code/data) to prose-level copy, creating tonal dissonance in a product that is trying to communicate authority to a CFO. It also fails tabular alignment (these values are never in a table context where `tnum` would add value).

**Fix:** Use `font-variant-numeric: tabular-nums` (via Tailwind's `tabular-nums` class) on time and numeric values where alignment matters. Remove `font-mono` from Day labels and SLA headers; use `font-semibold` and `text-sm` weight contrast instead to signal importance.

**Suggested command:** `$impeccable typeset`

---

## Persona Red Flags

**Priya — The CFO (primary customer user)**
*Situation: Opens the portal between board calls to check whether Candidate M-402's access was resolved.*

- The Ramp access alert (the only thing she needs to see) is the third visual element encountered after scrolling past the flight path stepper and the active task list. A CFO in 2 minutes between meetings will not find it before closing the tab.
- "SLA Warning · 28h of 36h threshold" requires knowledge of what the SLA threshold is and what it means to be approaching it. The copy doesn't tell her what action she needs to take or why she's being alerted.
- The retainer conversion gate card is visible on Day 2, 12 days before it's relevant. It introduces a premature decision frame.
- The "Grant Ramp Access" button dispatches an action but produces no persistent confirmation — only a 3.2-second toast. A CFO who misses the toast has no record that the action succeeded.

**Sam — Accessibility-dependent user (keyboard + screen reader)**
- Feedback modal textarea has no programmatic label. VoiceOver announces "text field" with no context.
- Toast success message is mounted dynamically; VoiceOver never announces it.
- `.pulse-option` radio cards have no `:has(:focus-visible)` styling; keyboard navigation leaves the selected card visually identical to an unselected one.
- "Review" button in operator dashboard has no aria-label context. Screen reader button list announces "Review, Review, Review" with no way to distinguish which access is being reviewed.

---

## Minor Observations

- Border-radius values range from 3px to 13px across components (3, 4, 5, 6, 7, 8, 9, 10, 12, 13px) — more than 10 distinct values. Adopt two canonical radii: `rounded` (6px) for inline elements and `rounded-xl` (12px) for card surfaces.
- Hardcoded hex colors in `globals.css` and `operator-dashboard.css` (`#d8d8dd`, `#56565f`, `#d79732`, etc.) bypass Tailwind semantic tokens. These will break if the theme ever shifts and cannot be overridden by a theme switcher.
- The pulsing green dot on the AWS WorkSpace status badge blinks constantly, drawing the eye even when the candidate is in the middle of a task checklist.
- `transition: width` in `globals.css:137` causes layout thrash on the SLA bar animation. Use `transform: scaleX()` with `transform-origin: left` instead.
- The `backdrop-blur-xs` on the modal scrim (`bg-black/40 backdrop-blur-xs`) is decorative blur — blurring content behind a modal communicates nothing and costs compositing performance.

---

## Questions to Consider

- "If this is called a Trial OS, why does it look exactly like an HR analytics dashboard? What if the primary metaphor was a shared document or a single active workspace — rather than a collection of status cards?"
- "The CFO's job is to unblock one thing (Ramp access) and confirm one thing (retainer). Could the entire Customer View be one focused action card that expands to context on demand, instead of seven simultaneous panels?"
- "The vertical timeline is the most durable structural idea in the interface. What if it wasn't docked to the right rail but was the spine of the entire layout — and the cards were annotations on the timeline rather than independent panels?"
