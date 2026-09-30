# Implementation Plan: MAVI Trial OS MVP

## Overview

Build a browser-based, single-route trial workspace for customer, candidate, and MAVI operator walkthroughs. The operator view surfaces a simulated access risk after 48 hours; customer and candidate actions feed the operator's local intervention queue. Use the product and interaction requirements in `mavi_trial_os_technical_specification.md`, including its later three-role correction. `PROJECT_CONTEXT.md` describes a different, earlier intake-and-matching product and is not part of this MVP.

## Architecture

- Next.js 15 App Router with a single `/portal` surface and redirect from `/`.
- TypeScript strict mode and Tailwind CSS; use a small local component set rather than adding a UI framework.
- Seeded client workspaces as typed configuration objects; no API, database, auth, real notifications, or production security controls.
- One client-side reducer owns the selected workspace, active view, current simulated day, access items, pulses, private reports, operator escalations, and conversion state.
- Role switching changes the presentation only. It is not an access-control boundary.

## Build Order

1. Establish the Next.js shell, design tokens, types, and seeded scenarios.
2. Build the operator view and the shared state transition for access pending over 48 hours.
3. Add customer and candidate views that read and update the same trial state, including private-to-each-other reports.
4. Add trial day progression, scenario switching, conversion preview, and responsive/accessibility refinements.

## Risks and Constraints

- Seed profiles, scores, trial activity, and security settings are illustrative and must be visibly labeled.
- A candidate or customer action must never claim to send a real message. Operator interventions update the demo state only.
- Trial health must account for unresolved overdue access and negative sentiment; resolving one blocker must not clear unrelated risks.
- Preserve the high-contrast neutral base and use MAVI's official violet accent as approved by the user.

## Commands

- Development: `npm run dev`
- Build: `npm run build`
- Type check: `npx tsc --noEmit`

## Verification

- Production build and TypeScript checks pass. Manual interaction and visual inspection of the desktop and mobile surfaces remain pending because no browser inspection tool is available in this environment.
- No automated test suite was added or run in this task.
