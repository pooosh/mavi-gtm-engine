# TECHNICAL SPECIFICATION: MAVI TRIAL OS (14-DAY ACTIVATION & SUCCESS ROOM)

## 1. Document Overview
This document specifies the technical architecture, data structures, user interface requirements, and interaction rules for **MAVI Trial OS**.

This system is an illustrative, interactive single-page application (SPA) that demonstrates a 14-day client trial workflow from three perspectives:
1. **Customer (Client CFO / VP of Finance)**
2. **Candidate (Placed Senior Finance / Accounting Talent)**
3. **MAVI Operator (GTM / Trial Operations)**

The role toggle is a presentation control for previewing these perspectives, not authentication or role-based access control. The operator view is an air-traffic-control dashboard that reacts to simulated trial events and highlights blockers for intervention. The MVP does not include live notifications, real integrations, or production workflow automation. Seeded client, candidate, trial, performance, and security details are illustrative demo data and must be labeled as such in the UI. Do not present them as verified MAVI claims or as a real security environment.

The system must run from a dynamic JSON configuration schema to enable rapid onboarding for different client profiles.

---

## 2. Technical Stack and Styling Invariants

### 2.1 Core Technologies
- **Framework:** Next.js 15 (App Router, Single Page `/portal`)
- **Language:** TypeScript 5.x (Strict mode enabled)
- **Styling:** Tailwind CSS 3.x / 4.x
- **UI Primitives:** Radix UI / shadcn/ui conventions (Dialog, Dropdown Menu, Tabs, Progress, Tooltip, Badge)
- **Icons:** Lucide React
- **State Management:** Client-side React State (`useState`, `useReducer`, or `createContext`)

### 2.2 Visual and Styling Rules
- **Design Inspiration:** Modern fintech interfaces (such as Ramp or Mercury).
- **Color Palette:** High-contrast neutral palette (slate/zinc/gray) with MAVI's official violet as a restrained brand accent.
  - Background: White (`#FFFFFF`) and slate-50 (`#F8FAFC`).
  - Borders: Subdued slate-200 (`#E2E8F0`).
  - Text Primary: Slate-900 (`#0F172A`).
  - Text Secondary: Slate-500 (`#64748B`).
  - Status Success: Emerald-600 (`#059669`).
  - Status Warning: Amber-500 (`#F59E0B`).
  - Status Danger/Critical: Rose-600 (`#E11D48`).
- **Brand Reference:** Match the official MAVI homepage's violet mark/CTA accent and clean white/black composition. Do not use multicolor gradients; keep violet to brand marks, primary actions, and selected states.
- **Typography:** Sans-serif base with tabular figures (`font-mono`) for metrics, timestamps, and scores.
- **Strict Invariants:**
  - DO NOT use low-contrast text.
  - DO NOT use multi-color gradients or violet as a large surface/background.
  - Keep borders thin (`border border-slate-200`).
  - Maintain high visual density with compact padding (`py-2 px-3` or `py-1.5 px-2.5`).

---

## 3. Data Schema & Architecture

The application state must derive from the configuration interface `TrialWorkspaceConfig`.

```typescript
export type UserRole = "customer" | "candidate" | "operator";
export type TrialHealth = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
export type PulseRating = "GREEN" | "YELLOW" | "RED";
export type AccessStatus = "PROVISIONED" | "PENDING" | "BLOCKED";

export interface AISupervisionScorecard {
  hallucinationDetectionScore: number; // e.g. 96 (out of 100)
  auditSpeedupMultiplier: number;     // e.g. 3.4 (meaning 3.4x)
  challengeName: string;              // Illustrative challenge matched to the client scenario
  challengeDescription: string;
}

export interface SecurityVMSpec {
  ipRegion: string;                  // e.g. "US-East (AWS WorkSpace)"
  securityControlsIllustrative: boolean;
  clipboardDisabled: boolean;
  downloadDisabled: boolean;
  slackGuestStatus: "ACTIVE" | "PENDING" | "DISABLED";
}

export interface CandidateDossier {
  handle: string;                     // e.g. "Candidate M-402"
  title: string;                      // e.g. "Senior Inventory & Revenue Accountant"
  pedigree: string;                   // e.g. "Ex-PwC Audit Senior (4 yrs)"
  timezoneOverlap: string;            // e.g. "5 hrs/day with NYC (Eastern)"
  overlapWindow: string;              // e.g. "09:00 AM - 02:00 PM EST"
  softwareStack: string[];            // e.g. ["NetSuite", "Ramp", "Shopify", "Excel"]
  aiScorecard: AISupervisionScorecard;
  vmSpec: SecurityVMSpec;
}

export interface SystemAccessItem {
  id: string;
  name: string;                       // e.g. "NetSuite Read-Only Role"
  category: "ERP" | "FINTECH" | "COMMUNICATION" | "SECURITY";
  status: AccessStatus;
  blockerDescription?: string;
  updatedAtHoursAgo: number;
}

export interface MilestonePhase {
  phaseNumber: 1 | 2 | 3;
  name: string;                       // e.g. "Phase 1: System Onboarding"
  dayRange: string;                   // e.g. "Days 0-2"
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  customerTasks: Array<{
    id: string;
    label: string;
    completed: boolean;
    isSystemAccess?: boolean;
    systemAccessId?: string;
  }>;
  candidateTasks: Array<{
    id: string;
    label: string;
    completed: boolean;
    waitsForAccessId?: string;
  }>;
  deliverableSummary: string;
}

export interface ClientProfile {
  id: string;
  name: string;                       // e.g. "Athena Club"
  industry: string;                   // e.g. "Direct-to-Consumer (D2C) Personal Care"
  erpSystem: string;                  // e.g. "NetSuite"
  primaryDeliverable: string;         // e.g. "Shopify sales-sheet cleanup and NetSuite reconciliation"
  targetTimezone: string;             // e.g. "US Eastern (EST)"
}

export interface TelemetryState {
  health: TrialHealth;
  ttfvHours: number;                 // Illustrative sample only; not a MAVI benchmark
  activeBlockerCount: number;
  sentimentScore: number;            // 1 to 5 scale
  escalationTriggered: boolean;
  escalationMessage?: string;
}

export interface TrialWorkspaceConfig {
  id: string;
  initialDay: number;
  client: ClientProfile;
  candidate: CandidateDossier;
  systemAccess: SystemAccessItem[];
  phases: MilestonePhase[];
  telemetry: TelemetryState;
  privateNotes: {
    customerSentimentLogs: Array<{ day: number; rating: PulseRating; note: string; timestamp: string }>;
    candidateBlockerLogs: Array<{ id: string; issue: string; timestamp: string; resolved: boolean }>;
    operatorEscalations: Array<{ id: string; alert: string; severity: "LOW" | "MEDIUM" | "HIGH"; timestamp: string; resolved: boolean }>;
  };
}
```

---

## 4. Dataset Profiles (Configuration Templates)

The application must support switching between two distinct discovery configurations:

### 4.1 Configuration A: `athena-club-config.json` (D2C Inventory & Revenue)
- **Client:** Athena Club (D2C Personal Care)
- **ERP / Stack:** NetSuite, Ramp, Shopify, Excel, Slack
- **Primary Deliverable:** Clean the messy Shopify sales spreadsheet and reconcile it to NetSuite.
- **Candidate:** Candidate M-402 (Ex-PwC Audit Senior, 4 years, US-East AWS WorkSpace, NetSuite Master).
- **Default State:**
  - NetSuite Read-Only: `PROVISIONED`
  - US Secure VM: `PROVISIONED`
  - Ramp Approver Access: `PENDING` for 28 hours on Day 2 (illustrative; past the 24-hour setup window, before the 36-hour SLA warning).
  - Health: `AT_RISK` until Ramp access is provisioned.

### 4.2 Configuration B: `saas-metric-config.json` (B2B SaaS Revenue Operations)
- **Client:** TraceData Systems (Series A B2B Data Infrastructure)
- **ERP / Stack:** QuickBooks Online, Stripe Billing, Maxio/SaaSOptics
- **Primary Deliverable:** Build ASC 606 synthetic revenue deferral schedule and Stripe MRR reconciliation.
- **Candidate:** Candidate S-109 (Ex-Deloitte Advisory, 3.5 years, US-West AWS WorkSpace).
- **Default State:**
  - QuickBooks Online Access: `PROVISIONED`
  - Stripe Read-Only API: `PENDING` for 76 hours (illustrative; past the 36-hour SLA warning).
  - Health: `OFF_TRACK` because Stripe access has exceeded the SLA warning.

All names, profiles, scores, access states, timestamps, benchmark results, and security attributes in both templates are illustrative scenario data. The UI must show a persistent `Illustrative demo data` label. Security cards describe a hypothetical configuration only; the demo does not provide a VM, SOC 2 attestation, or enforce technical controls.

---

## 5. UI Architecture & View Hierarchy

The layout consists of a persistent utility bar and a single workspace organized around the shared 14-day timeline:
1. **Global Control Header** with MAVI identity, sandbox label, scenario selector, and reset.
2. **Trial Heading and Context Strip** with one candidate summary, sample scorecard values, tools, and hypothetical security details.
3. **Perspective Selector and Day Rail** shared by all roles.
4. **Three-Lane Timeline** aligning Customer, Candidate, and MAVI Operator work across the same trial phases.
5. **Role Workspace** showing the selected role's distinct checklist and actions; the operator workspace includes health, queue, and intervention controls.

```
MAVI TRIAL OS · DEMO SANDBOX · SCENARIO · RESET
14-DAY PLAN             CUSTOMER           CANDIDATE          MAVI OPERATOR
Days 0–2 · Setup        provision access   complete setup     catch access delay
Days 3–7 · First work   share/review       deliver work       remove blockers
Days 8–14 · Final       decide to hire     hand off work      support conversion
SELECTED ROLE WORKSPACE · OPEN RISKS AND PRIVATE REPORTS FEED OPERATOR QUEUE
```

---

## 6. Functional Specifications by Section

### 6.1 Global Control Header
- **Placement:** Top fixed bar.
- **Elements:**
  - **Brand Badge:** `MAVI TRIAL OS // 14-Day Activation Room`
  - **Template Switcher (Select Input):**
    - Option 1: `Athena Club (D2C NetSuite + Ramp)`
    - Option 2: `TraceData Systems (B2B SaaS QBO + Stripe)`
  - **Role Switcher (Segmented Control / Select):**
    - `Customer View (Client CFO)`
    - `Candidate View (Talent)`
    - `MAVI Operator View (Trial Ops)`
    - This toggle only switches the illustrative UI perspective; it does not authenticate users or protect data.
  - **Reset Button:** Re-initializes client state to the baseline JSON.

---

### 6.2 Candidate Context Strip: Trust & Security Invariants

This horizontal strip remains visible in all views. It presents one candidate summary plus hypothetical security details as illustrative demo content, not verified compliance evidence. Avoid duplicate candidate summaries elsewhere on screen.

#### Module A: Candidate Dossier Brief
- **Handle:** Candidate code name (e.g., `Candidate M-402`). Never display real personal identifiers.
- **Pedigree Badge:** Display previous Big 4 experience (e.g., `Ex-PwC Audit Senior · 4 yrs`).
- **Timezone Overlap Meter:**
  - Overlap: `5 hrs/day with NYC (Eastern)`.
  - Visual timeline bar showing overlap between candidate hours and NYC client working hours.
- **Core Stack Pills:** Visual chips for required tools (`NetSuite`, `Ramp`, `QuickBooks`, `Shopify`).

#### Module B: AI Supervision Scorecard
Display illustrative example data about candidate capability with AI tools:
- **Hallucination Detection Index:** `96 / 100` (sample score; not a measured MAVI result).
- **Audit Speedup Ratio:** `3.4x` (sample figure; not a measured MAVI result).
- **Scenario-specific sample challenge:**
  - Athena Club: detected a mismatch between channel return quantities and the NetSuite inventory reconciliation in a synthetic export.
  - TraceData Systems: detected an incorrect 14-month amortization schedule in a synthetic ASC 606 revenue deferral schedule.

#### Module C: Dedicated VM Environment Status
Display a clearly labeled hypothetical security configuration (not a live environment or compliance attestation):
- **Host Region:** `US-East` (scenario value only; no environment is provisioned).
- **SOC 2 Type II:** Do not display a compliance badge or imply MAVI compliance or certification.
- **Local File Download / Clipboard:** May be shown as disabled in the scenario; do not claim real technical enforcement.
- **Slack Communications:** Example guest status only; no account or channel is created.

---

### 6.3 Main Panel: The 14-Day Accounting Activation Roadmap

The main panel contains three sequential phases. Each phase represents a milestone gate.

#### Phase 1: Days 0–2 (System Provisioning & Access Scoping)
- **Objective:** Demonstrate software access progress and surface simulated delays.
- **Customer Checklist (client-admin owned):**
  1. `[x] Illustrative US Secure Workspace Status` (sample state only; no VM is provisioned by the demo).
  2. `[x] Provision NetSuite read-only seat` (local demo action).
  3. `[!] Grant the Ramp approver role`:
     - Default state: `Pending Client Admin Approval`.
     - Show operator attention after 24 hours and the SLA warning at 36 hours.
     - Customer may update the local state to provisioned.
  4. `[x] Invite candidate to #finance-temp Slack channel`.
- **Candidate Checklist (recipient owned):** Connect to the assigned virtual desktop, authenticate NetSuite, confirm Ramp read access when granted, and review the Chart of Accounts and Q3 Shopify ledger. Keep the Ramp confirmation disabled until the customer marks access as provisioned.
- Keep client provisioning actions out of the candidate checklist. Completing either role's task updates only that role's checklist; access actions update shared access state.
- **Completion Trigger:** When required access is ready and each participant completes their setup actions, Phase 1 shows `Ready for first work`.

#### Phase 2: Days 3–7 (The First Milestone Sprint)
  - **Objective:** Demonstrate progress toward the first accounting deliverable.
- **Task Deliverable Card:**
  - Athena Club: Clean up the messy Shopify sales spreadsheet and reconcile it to NetSuite.
  - TraceData Systems: Reconcile Stripe MRR and prepare the sample ASC 606 revenue schedule.
  - Status Indicator: `In Progress` or `Completed`.
  - Checkbox: `Verify reconciliation report against ERP general ledger`.
- **Interactive Day 5 Pulse Check (Client Sentiment Gate):**
  - Prompt: *"How is Candidate M-402 performing against your technical expectations?"*
  - Interactive Sentiment Selector:
    - `[Green] On Track` (Score = 5)
    - `[Yellow] Needs Alignment` (Score = 3)
    - `[Red] Escalation Required` (Score = 1)
  - Optional Feedback text field.
  - Submit Button: `Submit pulse`.
  - Logic: If client selects `Yellow` or `Red`, update the shared local demo state and show a confirmation that MAVI has been notified in this simulated scenario. No real notification is sent.

#### Phase 3: Days 8–14 (Final Review & Conversion)
- **Objective:** Review the trial deliverable and decide whether to continue with the candidate.
- **Tasks:**
  - Candidate: prepare workpapers and handoff notes; walk through findings with the finance lead.
  - Customer: review the completed deliverable and decide whether to hire the candidate.
- **Day 14 Conversion Terminal:**
  - Banner: *"14-Day Risk-Free Trial completes on Day 14. Convert to Month-to-Month Engagement."*
  - Primary CTA Button: `Confirm Conversion & Retain Candidate`.
  - Click Event Action:
    - Generates confirmed placement state.
    - Displays a modal stating the simulated trial was converted; do not imply billing, a contract, or an SLA was actually created.
    - Updates the local demo status to `CONVERTED`.

---

## 7. Asymmetric Role-Specific Implementations

The UI adapts when the user changes the Role Switcher:

### 7.1 Customer View (CFO / Finance Director)
The customer must see clean operational progress and have low-friction channels to report blockers:
- **Private Action Button (Header / Floating):** `Report Friction to MAVI Ops`
  - Opens modal:
    - Category: `Access Delay` | `Communication Cadence` | `Technical Quality`
    - Free text input for private notes.
    - Direct notice: *"This note goes to the MAVI operator in this demo; the candidate will not see it. No external message is sent."*
- **Day 5 Pulse Check:** Visible and editable.
- **Day 14 Conversion Terminal:** Active with conversion button enabled.
- **Hidden Elements:** Candidate blocker details and operator-only internal notes.

### 7.2 Candidate View (Placed Talent)
The candidate must see immediate action items, security tools, and an escalation route:
- **Illustrative Workspace Widget:**
  - Show hypothetical workspace status and security parameters.
  - Do not offer a launch button or imply a real VM session exists.
- **Private Blocker Modal Button:** `I'm Blocked`
  - Opens modal:
    - Tool dropdown: `NetSuite` | `Ramp` | `QuickBooks` | `Stripe` | `Shopify` | `Excel` | `Slack` | `Other`
    - Problem description: *"Client IT administrator has not sent 2FA token."*
    - Submit Action: Adds a private blocker event to local demo state and alerts the operator view; no real message is sent.
- **Daily Checklist:** Shows candidate-owned tasks for the current simulated trial day. It never asks the candidate to grant their own permissions or invite themselves to client systems.
- **Day 5 Pulse Check:** View read-only status (does not display customer private notes).
- **Day 14 Conversion Terminal:** Shows read-only milestone progress (`Awaiting Client Final Confirmation`).

### 7.3 MAVI Operator View (GTM / Trial Operations)
The operator sees the trial's simulated live state and intervenes before access or sentiment issues threaten the placement:
- **Air Traffic Control Summary:** Trial health (`ON_TRACK`, `AT_RISK`, `OFF_TRACK`), days elapsed, illustrative time-to-first-value, and unresolved blocker count.
- **Access Alerts:** An amber operator alert appears when required access remains pending for more than 24 hours. Show the 36-hour SLA warning separately; escalate visual severity when that threshold is reached. Example: `28h elapsed · SLA warning at 36h`.
- **Intervention Feed:** Customer-private feedback and candidate blocker reports appear with their source and timestamp. The candidate does not see customer-private notes; the customer does not see candidate-private blocker details.
- **Operator Actions:** Mark an access blocker resolved, record an intervention, and update the shared demo state. Actions update the UI immediately; no email, Slack message, or external action is sent.
- **Config Inspector:** Inspect and copy the active illustrative workspace JSON.

---

## 8. State Transitions and Automation Rules

Implement the following deterministic logic in the React state:

| Event Trigger | Condition | System Action |
| :--- | :--- | :--- |
| **System access pending > 24h** | Any required access item is not `PROVISIONED` and `updatedAtHoursAgo > 24` | 1. Set `telemetry.health = "AT_RISK"`.<br>2. Add an unresolved operator escalation.<br>3. Show the pending item in customer and candidate views and an amber operator alert. |
| **Access reaches 36h SLA warning** | Any required access item is not `PROVISIONED` and `updatedAtHoursAgo >= 36` | 1. Set `telemetry.health = "OFF_TRACK"`.<br>2. Keep the operator escalation open and raise alert severity. |
| **Resolve Blocker Clicked** | Operator marks a pending item provisioned | 1. Update item status in local demo state.<br>2. Resolve its operator escalation and recalculate `activeBlockerCount`.<br>3. If no overdue access or negative sentiment remains, set `telemetry.health = "ON_TRACK"`. |
| **Customer Friction Submitted** | Customer submits private feedback | 1. Store it in the customer-private log.<br>2. Add an operator escalation to the intervention feed.<br>3. Confirm that the notification is simulated; no real message is sent. |
| **Candidate Blocker Submitted** | Candidate logs an access blocker | 1. Store it in the candidate-private log.<br>2. Alert the operator view; set trial health to `AT_RISK` if access is overdue.<br>3. Confirm the escalation is simulated; no real message is sent. |
| **Day 5 Pulse Submitted** | Rating is `RED` or `YELLOW` | 1. Set `telemetry.health = "AT_RISK"`.<br>2. Add an operator escalation to the intervention feed.<br>3. Display a confirmation that no real MAVI lead is contacted. |
| **Day 5 Pulse Submitted** | Rating is `GREEN` | 1. Maintain `telemetry.health = "ON_TRACK"` if no unresolved access or sentiment risk remains.<br>2. Record positive sentiment in local demo state. |
| **Day 14 Conversion Clicked** | Customer clicks `Confirm Conversion` | 1. Set local demo status to `CONVERTED`.<br>2. Show a simulated confirmation summary; do not claim a real contract, billing, or SLA was created. |
| **Config Toggle Changed** | User selects new client template | 1. Replace state with target JSON.<br>2. Reset active simulation day to the target template's `initialDay`. |

---

## 9. File Structure Plan

Implement the project using the following file tree:

```
src/
├── app/
│   ├── layout.tsx                     # Root layout with Tailwind fonts
│   ├── page.tsx                       # Redirects to /portal
│   └── portal/
│       └── page.tsx                   # Main SPA container
├── components/
│   ├── shared/
│   │   ├── GlobalSimulationHeader.tsx # Illustrative role and config switchers
│   │   └── TelemetryDock.tsx          # Operator health and escalation summary
│   ├── sidebar/
│   │   ├── CandidateDossierCard.tsx   # Pedigree, overlap, stack
│   │   ├── AISupervisionCard.tsx      # Hallucination index & speedup
│   │   └── VMSecurityCard.tsx         # SOC2 and AWS WorkSpace status
│   ├── timeline/
│   │   ├── ActivationTimeline.tsx     # 3-Phase container
│   │   ├── Phase1Provisioning.tsx     # Days 0-2 checklist + blocker toggle
│   │   ├── Phase2Milestone.tsx        # Days 3-7 reconciliation + pulse check
│   │   └── Phase3Conversion.tsx       # Days 8-14 close + conversion trigger
│   └── modals/
│       ├── ClientFrictionModal.tsx    # Simulated customer feedback
│       ├── CandidateBlockerModal.tsx  # Simulated candidate blocker report
│       ├── OperatorEscalationModal.tsx# Simulated operator intervention
│       └── ConversionModal.tsx        # Day 14 confirmation agreement
├── config/
│   ├── athenaClubConfig.ts            # D2C NetSuite template
│   └── saasMetricConfig.ts            # B2B SaaS QBO template
└── types/
    └── portal.ts                      # All TypeScript interfaces
```

---

## 10. Step-by-Step Implementation Instructions for Coding Agent

Follow this sequence to build the application:

1. **Phase 1: Type Definitions and Data Mocking**
   - Create `src/types/portal.ts` matching the exact schema in Section 3.
   - Create `src/config/athenaClubConfig.ts` and `src/config/saasMetricConfig.ts` with complete, realistic data.

2. **Phase 2: Global State Setup**
   - Create a React Context or custom hook `useTrialOS` to store:
     - `currentConfig`: Active configuration object.
     - `activeRole`: Current illustrative view (`customer` | `candidate` | `operator`); not authentication.
     - Functions to update the local checklist, record sentiment and blocker events, and resolve operator escalations.

3. **Phase 3: Top Navigation Bar**
   - Build `GlobalSimulationHeader.tsx`.
   - Ensure the template selector immediately swaps datasets.
   - Ensure the role selector immediately updates visible components and permissions.

4. **Phase 4: Candidate Context Strip**
   - Render one candidate summary, sample scorecard values, tool chips, and hypothetical security details without duplicating the candidate card in the header or footer.
   - Format numbers with tabular typography (`font-mono`).
   - Label all security details as illustrative; do not imply active SOC 2 controls or a provisioned VM.

5. **Phase 5: Main Panel Timeline Execution**
   - Build role-specific setup checklists: the customer provisions access; the candidate confirms access and completes their own onboarding. A candidate access confirmation stays unavailable until the customer provisions that tool.
   - Build `Phase2Milestone.tsx` with accounting deliverable tasks and the 1-click sentiment pulse check.
   - Build `Phase3Conversion.tsx` with the conversion contract trigger.

6. **Phase 6: Asymmetric Role Modals & Overlays**
   - Wire perspective-specific simulated feedback and blocker controls; keep their events in local demo state.
   - Render the operator health and intervention dashboard from local demo state; do not send real notifications.

7. **Phase 7: Polish & Visual Quality Verification**
   - Check all color contrasts against WCAG AA standards.
   - Verify mobile and desktop responsiveness.
   - Verify that clicking any interactive control produces immediate, visible UI feedback.
