# Tasks: MAVI Trial OS MVP

The implementation slices below are complete. Browser-based interaction and desktop/mobile visual verification remain pending.

- [x] Scaffold the Next.js 15 portal and define typed illustrative trial scenarios.
  - Acceptance: `/portal` renders from typed local config; global demo-data label is visible.
  - Verify: Start the app and inspect the route.
  - Dependencies: None.
- [x] Build operator health and access attention/SLA escalation.
  - Acceptance: A pending access item older than 24 hours appears in the operator queue; 36 hours raises the SLA warning; resolving it updates local state.
  - Verify: Inspect the seeded overdue scenario and resolution interaction.
  - Dependencies: Scaffold.
- [x] Build customer and candidate perspectives with private reports.
  - Acceptance: Customer feedback and candidate blockers reach the operator feed and remain hidden from the other participant view.
  - Verify: Switch perspectives and inspect the seeded and submitted reports.
  - Dependencies: Operator state.
- [x] Complete the 14-day timeline, scenario switcher, and conversion preview.
  - Acceptance: Day-specific checklists and conversion state are interactive and clearly simulated.
  - Verify: Walk the trial flow on desktop and mobile.
  - Dependencies: Shared role state.
- [ ] Apply Impeccable visual finish and document the visual system.
  - Acceptance: Responsive, accessible high-density fintech UI; all illustrative claims labeled.
  - Verify: Capture desktop/mobile UI and run the Impeccable finish workflow.
  - Dependencies: All prior tasks.
