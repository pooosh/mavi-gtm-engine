---
target: src/app/portal/operator-dashboard.tsx
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:/Users/piyush/Projects/Startups/mavi-gtm-engine/src/app/portal/operator-dashboard.tsx"
target_fingerprint: "sha256:ca058ab5ac87aa46b760a1678bba20e9f3f6c929dc7022812cda5e2296aba4a0"
target_path: /Users/piyush/Projects/Startups/mavi-gtm-engine/src/app/portal/operator-dashboard.tsx
timestamp: 2026-10-01T23-47-11Z
slug: src-app-portal-operator-dashboard-tsx
closed: true
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Real-time latency badge (~118ms) and SLA timers provide continuous feedback; lacks in-canvas loading skeleton during fleet re-evaluation. |
| 2 | Match System / Real World | 4 | High domain fidelity: 14-day trial progression, Ramp/Shopify/Snowflake access dependencies, controller escalation pathways, and authentic Slack bot formatting. |
| 3 | User Control and Freedom | 2 | Sidebar collapses cleanly and "Back to Fleet Hub" is readily accessible; table rows lack native link behavior (cannot Cmd+click to new tab) and resolved interventions lack an undo buffer. |
| 4 | Consistency and Standards | 2 | Widespread violation of DESIGN.md font-weight rules (over 25 instances of font-semibold/font-bold); semantic color leakage across status badges. |
| 5 | Error Prevention | 4 | 1-click dispatch routes through a preview simulator first, preventing accidental firing of unreviewed messages to client channels. |
| 6 | Recognition Rather Than Recall | 4 | Blocker name, target system, SLA elapsed time, and Jev confidence are presented directly in-situ; zero memory load. |
| 7 | Flexibility and Efficiency | 3 | 1-click dispatch CTA directly in the hero card accelerates triage; lacks keyboard navigation shortcuts (J/K row selection, D for dispatch). |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined hairline borders (#e5e7eb) and flat elevation; docked 1 point for font-weight noise and chromatic status clutter. |
| 9 | Error Recovery | 3 | Search filter handles empty matches gracefully; robust fallback in API triage fetching. |
| 10 | Help and Documentation | 3 | Clear demo badges, helper tooltips, and explicit footnotes ("Demo only · no external message sent"). |
| **Total** | | **31/40** | **Good (77.5%)** |

## Design Specificity Verdict

The interface is distinctly authored for high-stakes enterprise GTM trial orchestration for finance hires rather than a generic SaaS ticketing dashboard. The triage strip surfaces calibrated Bayesian-style primitives (Blocker Probability `noul`, SLA Risk Score `score/100`, discrete `recommendedAction`, and real-time inference latency ~118ms). Bespoke Slack simulator copy targets controllers and CFOs in dedicated channels, directly addressing the core business problem: eliminating candidate idle time during 14-day trials before hiring decisions are sabotaged.

- **Deterministic Scan**: 2 primary layout animation anti-patterns detected in `operator-dashboard.css` (`transition: width` and `transition: padding` on sidebar collapse, causing layout thrashing). 52 advisory findings across files: 41 font-size advisories, 8 off-palette colors (`#0f172a`, `#a1a1aa`, `#d1d5db`, `#9ca3af`, `#d4d4de`), and 3 non-token border radii.
- **Detector vs. Reality**: The automated detector caught genuine performance defects (layout thrashing during sidebar collapse) and accessibility issues (9px micro-text). However, intermediate font sizes (11px, 12px, 13px) represent a gap in `DESIGN.md`'s type ramp (which jumps from 10px caption to 16px body) rather than arbitrary styling.
- **Visual Overlays**: Live browser overlay was unavailable due to headless sandbox process execution restrictions; all rules verified via static AST and token analysis.

## Overall Impression

MAVI Operator combines high domain intelligence (118ms Bayesian re-triage, contextual Slack nudges) with a crisp hairline visual container. Its primary deficits are typographic discipline (ignoring the single-weight 400 rule), layout transition performance on sidebar collapse, and keyboard accessibility in the flight path table.

## What's Working

1. **Autonomous Bayesian Triage Over Static Queues**: The Hero Priority Panel dynamically calculates and bubbles the single most urgent blocker across all 5 accounts (e.g. Graza 42h Shopify export) with zero latency lag.
2. **Context-Grounded Operational Velocity**: The 1-click Slack dispatch modal generates realistic, stakeholder-tailored copy that immediately updates fleet state upon resolution.
3. **Restrained Hairline Architecture**: Flat surfaces, 1px `#e5e7eb` borders, and bone `#f4f2f0` canvas strictly avoid card-in-card nesting and artificial drop shadows.

## Priority Issues

- **[P0] Semantic Inaccessibility & Keyboard Trap in Flight Path Table**: Table rows use `<tr onClick>` without `tabIndex={0}`, `role="button"`, or `onKeyDown` handlers, preventing keyboard-only operators from navigating to company dashboards.
  - *Why it matters*: Violates WCAG 2.1 AA accessibility and blocks power users from rapid keyboard navigation.
  - *Fix*: Wrap row actions in accessible focusable buttons with Enter/Space activation and provide native navigation affordances.
  - *Suggested command*: `$impeccable harden`

- **[P1] Systemic Violation of the Single-Weight (400) Typography Rule**: Over 25 instances of `font-semibold`, `font-medium`, and `font-bold` throughout `operator-dashboard.tsx` and CSS files violate `DESIGN.md`'s core Swiss neo-grotesque mandate.
  - *Why it matters*: Degrades the "Editorial Finance Desk" identity into generic SaaS styling.
  - *Fix*: Normalize all weights to 400; achieve hierarchy via scale, line-height compression, and letter-spacing.
  - *Suggested command*: `$impeccable typeset`

- **[P2] Layout Thrashing on Sidebar Collapse**: `operator-dashboard.css` animates `width` (276px to 44px) and `padding`, triggering full layout recalculation on every animation frame.
  - *Why it matters*: Causes frame drops and layout stuttering on lower-power devices or dense viewports.
  - *Fix*: Animate via transform/opacity or CSS grid column transitions.
  - *Suggested command*: `$impeccable optimize`

- **[P3] Semantic Color Creep Violating Single-Accent Rule**: Widespread green, amber, red, and purple background washes across badges and chips compete with the single `#4f46e5` accent.
  - *Why it matters*: Dilutes the primary action signal and creates visual noise.
  - *Fix*: Replace colored background washes with bone/paper fills and hairline borders, reserving `#4f46e5` strictly for interactive momentum.
  - *Suggested command*: `$impeccable quieter`

## Persona Red Flags

- **Alex (Impatient Power User / GTM Operator)**: Cannot use keyboard accelerators (J/K navigation, Enter to open, D to quick-dispatch) and cannot middle-click/Cmd+click table rows to open accounts in separate browser tabs.
- **Jordan (Confused First-Timer / Junior Operator)**: The abrupt transition between the Fleet Hub table and the Company Bento grid disorients without persistent breadcrumbs, and probabilistic terms like "Noul" lack inline definitions.
- **Riley (Deliberate Stress Tester / Compliance Auditor)**: Accessibility audit immediately flags `<tr onClick>` as failing WCAG 2.1 AA keyboard compliance, and fleet re-evaluation leaves no audit trail in the Activity Stream.

## Minor Observations

- 9px micro-labels on SLA risk badges fail WCAG AAA legibility; should be normalized to 10px.
- Tooltip backgrounds use `#0f172a` (Tailwind slate) instead of design token `var(--ink)`.
- Collapsed monogram badge uses an awkward 1.5px border on a 7px dot.

## Questions to Consider

- What if the operator could batch-resolve high-confidence SLA bottlenecks with a single keypress and a 10-second undo window?
- Does the 5-widget Bento grid serve operators better as a modal/drawer split-screen that preserves fleet visibility?
- Should the typography scale in DESIGN.md formally adopt `ui-xs` (11px) and `ui-sm` (12px) for data-dense tables?
