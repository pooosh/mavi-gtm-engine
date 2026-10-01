# mavi-gtm-engine

MAVI's local trial portal demo lives at `/portal`, with shared operator, customer, and candidate views.

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:3000/portal`. Use `npm run build` for a production build and `npm run typecheck` for TypeScript checks.

## Operator dashboard

The five-widget bento layout retains MAVI's violet accents and neutral surfaces:

- **Escalation hub:** review pending access and private reports, simulate a Slack nudge, or mark access provided.
- **Access SLA:** show elapsed access time against the 36-hour threshold and estimated time to first value.
- **Candidate dossier:** inspect candidate details in a nonmodal drawer on the right.
- **Milestone flight path:** inspect setup, first work, and decision phases; preview participant checklists.
- **Trial activity:** review actions recorded in the local demo feed.

Athena Club opens on Day 2 with NetSuite access pending for 28 hours: provisioning is 3/4 and the SLA gauge reads 78%. Marking access provided changes these to 4/4 and 0%; candidate confirmation remains a separate checklist action. Advancing the demo day can cross the SLA threshold.

All interactions are local simulations. No real Slack messages, virtual machines, or webhooks are invoked. Reset restores the selected trial's initial state and feed; reloading starts the default demo again.

## Browser validation

The operator dashboard fit without page scrolling at 1440×900 and 1366×768, with no horizontal overflow at 390px. Nudge, access provision, day/SLA breach, reset, and phase preview flows passed browser checks with no runtime errors observed.
