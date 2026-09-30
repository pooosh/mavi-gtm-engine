# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 15 App Router, TypeScript 5 strict mode, Tailwind CSS, and client-side state. This is the stack specified in `mavi_trial_os_technical_specification.md`. MVP data and actions are illustrative and local; no production integrations or backend are in scope.

## Users

- **Customer:** Startup CFO or finance lead coordinating a 14-day trial and giving feedback.
- **Candidate:** Finance and accounting professional following daily work and surfacing access blockers.
- **MAVI operator:** GTM or trial operations owner monitoring trial health and intervening on risks.

The role switcher previews each perspective; it is not authentication or data access control.

## Product Purpose

MAVI Trial OS is a shared workspace for coordinating a candidate's 14-day working trial. It makes the plan, progress, feedback, and blockers visible across customer, candidate, and MAVI operator views. The prototype demonstrates how early visibility and operator follow-up can prevent access delays and other friction from undermining time to first value or the placement decision.

Success for this MVP is a clear end-to-end walkthrough: the customer sees the plan and can privately raise feedback, the candidate sees daily tasks and can report being blocked, and the operator sees trial health and an overdue-access alert, then records a simulated intervention.

## Positioning

The product centers the working trial itself: one 14-day timeline with distinct customer, candidate, and operator perspectives, plus an operator control room that surfaces friction while there is still time to act.

## Operating Context

- Trials progress through setup (Days 0–2), first deliverable (Days 3–7), and final review/conversion (Days 8–14).
- Required software access can block candidate work; access pending more than 48 hours raises an operator alert.
- Customer feedback and candidate blocker reports are private from each other and visible to MAVI operators.
- Candidate checklists and trial events update a shared illustrative workspace state.
- The MVP is a browser-based pitch prototype using seeded example profiles and local state.

## Capabilities and Constraints

- Show customer, candidate, and MAVI operator views with an illustrative role toggle.
- Show a client template selector, candidate dossier, scenario-specific sample AI scorecard, hypothetical security details, milestones, checklists, pulse feedback, blocker reporting, operator health, escalations, and simulated conversion.
- Seeded names, trial events, candidate credentials, scores, benchmarks, and security settings are illustrative and must be labeled as demo data.
- The demo does not authenticate users, send email or Slack messages, provision VMs, enforce access controls, create contracts, start billing, or provide a SOC 2 attestation.
- Preserve the 48-hour access escalation rule and keep trial health consistent with unresolved access and sentiment risks.

## Brand Commitments

- MAVI name and precise, operational language.
- Use MAVI's official violet accent with white, black, and neutral surfaces, reflecting the supplied homepage images and the user's preference.
- Keep the interface high-contrast, precise, and operationally dense where the workflow requires it; use thin borders and restrained status colors.
- Do not use multicolor gradients. The page should feel considered and trustworthy for finance leaders, with craft appropriate to a founder-facing fintech product.

## Evidence on Hand

- `mavi_trial_os_technical_specification.md`: supplied product and interaction brief.
- `PROJECT_CONTEXT.md` describes an earlier intake-and-matching product and conflicts with the currently selected Trial OS MVP; the explicit Trial OS specification and subsequent user corrections define this build's scope.
- The supplied `MAVI_CONTEXT.md` is background, not independently verified evidence.
- No verified candidate performance data, customer testimonials, compliance evidence, or production integrations are supplied. Do not invent or imply any.

## Product Principles

1. Show the next action and the owner of each blocker.
2. Surface trial risk early enough for a MAVI operator to intervene.
3. Keep customer feedback and candidate blocker reports discreet from one another.
4. Make the three perspectives tell one coherent trial story.
5. Label illustrative content clearly and never overstate what the prototype does.

## Accessibility & Inclusion

- Maintain readable contrast, keyboard-operable controls, visible focus, semantic labels, and responsive layouts.
- Do not rely on color alone to communicate trial health or alerts.
