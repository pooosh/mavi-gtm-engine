# MAVI GTM Engine: System Architecture & Master Context PRD

## 1. Executive Context & Strategic Intent

### 1.1 The Objective
Build a production-grade, two-part demonstration engine for **MAVI** (maviwork.com) to secure an off-cycle **GTM Engineer / Forward Deployed Product Intern** role for Spring 2027 (January to May).

### 1.2 Dual Architecture Strategy (Tailored Facade, Modular Core)
To maximize conversion with MAVI while maintaining long-term portfolio utility:
1. **The Client Facade (Flagship Instance):** Calibrated 100% for MAVI. It showcases Ramp-inspired UI density, NetSuite/Ramp toolchains, US GAAP validation, and an AI Supervision Scorecard directly referencing founder Molly Liu's TechCrunch interview.
2. **The Core Engine (Domain-Agnostic):** The underlying ingestion pipeline, schema extractor, multi-signal scoring algorithm, and candidate brief renderer are modular. Decoupling domain enums from core engine logic allows the system to pivot to other vertical talent domains (AI engineering, legal tech, revops) simply by swapping one configuration file.

### 1.3 MAVI Company & Thesis Background
* **Company:** MAVI (Seed stage, announced $4M round led by Harlem Capital in late September 2026).
* **Leadership:** Co-founded by Molly Liu (Co-CEO / Head of Product, early Product Manager at Ramp, Wharton alumna) and Aman Puri (Co-CEO, ex-SoftBank fintech investor).
* **Core Business:** Tech-enabled talent marketplace pairing US companies (startups, PE/VC portfolio companies, fractional CFO firms) with pre-vetted, ex-Big 4 global accounting and finance talent (LatAm, APAC, South Africa) at 50 to 70 percent lower cost.
* **Core Thesis (TechCrunch September 2026):** AI tools automate junior accounting tasks, worsening the shortage of senior professionals with real financial judgment. MAVI provides "the new kind of accountant": professionals who can direct AI tools while exercising technical accounting judgment (US GAAP, ASC 606, ASC 842) to catch what AI models get wrong (hallucinations, faulty depreciation schedules, improper revenue deferrals).
* **Delivery Model:** 5-day placement SLA (delivering 2 to 3 curated profiles), 14-day risk-free trial, 40 percent full-time / 60 percent fractional (minimum 10 hrs/week), direct Slack/ERP embedding, US-hosted secure virtual desktop infrastructure (blocking data exfiltration).

---

## 2. Technical Stack & Development Invariants

### 2.1 Stack Overview
* **Backend:** Python 3.11+, FastAPI, Pydantic v2, Instructor.
* **LLM Runtime (Inference):** Google Gemini 2.0 Flash (Google AI Studio free tier) or Groq Llama 3.3 70B for zero-cost, sub-400ms structured extraction.
* **Frontend:** Next.js 15 (App Router), TypeScript (strict mode), Tailwind CSS, shadcn/ui primitives.
* **Context & Tooling:** Repomix (`repomix.config.json`) for full-repo context packaging.
* **Testing & Quality:** Pytest (backend schema tests), Playwright (headless candidate PDF generation), Biome / Ruff (zero lint and type warnings).

### 2.2 Agent Development Guardrails (Anti-Slop Standards)
1. **Spec-Driven Development:** Code must strictly satisfy JSON schemas and test assertions defined in `docs/specs/`. No ad-hoc parameter additions.
2. **Ponytail Minimalism:**
   * Native standard library functions take precedence over third-party npm/pip utility packages.
   * Zero premature abstractions: do not create helper classes or wrapper utilities unless logic is duplicated across three or more distinct domains.
3. **Impeccable Design Standard (Ramp Aesthetic):**
   * Strict ban on generic AI aesthetics: no purple or blue gradients, no heavy drop shadows, no bubbly cards, no low-contrast gray text on tinted backgrounds.
   * Visual identity: Monochromatic, crisp, high-density fintech typography (Geist / system font stack), subtle borders (`border-neutral-200` / `dark:border-neutral-800`), strict tabular alignment.
4. **Decoupled Configuration:**
   * Core UI components must receive generic props (`competencies`, `tools`, `domain`, `specialtyScorecard`).
   * Zero hardcoded accounting terms inside reusable layout wrappers. All MAVI-specific copy, enums, and sample inputs live in `src/backend/domains/` and `src/frontend/config/`.
5. **Type Completeness:**
   * Python: Zero use of untyped `dict` or `Any`. Every endpoint accepts and returns typed Pydantic v2 models.
   * TypeScript: `strict: true`, zero `any`.

---

## 3. Modular Architecture Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MODULAR ENGINE ARCHITECTURE                       │
├────────────────────────────────────────────────────────────────────────┤
│                       CORE ENGINE (Reusable)                           │
│  • Pydantic/Instructor Structured Extraction Runner                    │
│  • 3-Signal Heuristic Matching & Scoring Algorithm                     │
│  • High-Density Executive Brief UI Component Tree                      │
│  • Playwright Headless PDF Exporter                                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Ingests
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DOMAIN CONFIG (Swappable Schema)                     │
│  • Flagship (Now):   Accounting (US GAAP, NetSuite/Ramp, Big 4, Eval)  │
│  • Future Ready:     AI Engineering, RevOps, Legal Tech                │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Generic Core (`src/backend/core/` and `src/frontend/components/`)
* **`core/extractor.py`:** Accepts raw input text and a dynamic Pydantic schema class, returning validated JSON via Instructor.
* **`core/matcher.py`:** Calculates a weighted 3-signal match score across Competencies (40%), Tools (35%), and Domain (25%), plus timezone threshold filtering.
* **`components/ExecutiveBrief.tsx`:** Reusable dossier component that renders identity, credentials, alignment breakdown, and a domain verification scorecard.

### 3.2 Domain Implementation: MAVI Accounting (`src/backend/domains/accounting_mavi.py`)
Defines the concrete schemas used by the MAVI flagship deployment:

```python
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class AccountingStandard(str, Enum):
    ASC_606 = "ASC 606 (Revenue Recognition)"
    ASC_842 = "ASC 842 (Lease Accounting)"
    MONTH_END_CLOSE = "Month-End Close & Reconciliations"
    FINANCIAL_MODELING = "FP&A & Budget Forecasting"
    AP_AR_MANAGEMENT = "AP/AR & Cash Flow Management"
    AUDIT_READINESS = "Big 4 / GAAP Audit Readiness"

class ERPTool(str, Enum):
    NETSUITE = "NetSuite"
    QUICKBOOKS_ONLINE = "QuickBooks Online"
    RAMP = "Ramp"
    BILL_COM = "Bill.com"
    STRIPE_BILLING = "Stripe Billing"
    EXCEL_ADVANCED = "Advanced Financial Modeling (Excel)"

class IndustryDomain(str, Enum):
    B2B_SAAS = "B2B SaaS / Enterprise Tech"
    D2C_ECOMMERCE = "D2C / Consumer Goods"
    FINTECH = "FinTech / Payments"
    HEALTHCARE = "Healthcare / HealthTech"
    AGENCY_SERVICES = "Agency / Fractional Advisory"

class EngagementType(str, Enum):
    FULL_TIME = "Full-Time (40 hrs/wk)"
    FRACTIONAL_20 = "Fractional (20 hrs/wk)"
    FRACTIONAL_10 = "Fractional (10 hrs/wk)"

class ParsedJobRequirement(BaseModel):
    client_name: Optional[str] = Field(None, description="Extracted company name if present")
    primary_role_title: str = Field(..., description="Target role title")
    accounting_competencies: List[AccountingStandard] = Field(..., min_items=1)
    erp_stack: List[ERPTool] = Field(..., min_items=1)
    industry_domain: IndustryDomain
    engagement_type: EngagementType
    min_us_overlap_hours: int = Field(default=4, ge=2, le=8)
    summary_of_critical_need: str = Field(..., max_length=200)

class AISupervisionMetrics(BaseModel):
    hallucination_detection_index: int = Field(..., ge=0, le=100)
    reconciliation_speedup_factor: float = Field(..., ge=1.0, le=100.0)
    prompt_efficiency_score: int = Field(..., ge=0, le=100)
    verified_eval_scenario: str = Field(..., description="Description of synthetic test case passed")

class CandidateProfile(BaseModel):
    candidate_id: str
    anonymous_handle: str
    primary_role: str
    pedigree: str
    location: str
    us_overlap_hours: int
    engagement_availability: List[EngagementType]
    verified_competencies: List[AccountingStandard]
    verified_tools: List[ERPTool]
    past_domains: List[IndustryDomain]
    ai_metrics: AISupervisionMetrics
```

---

## 4. Frontend Specifications & Deliverables (`src/frontend`)

### 4.1 Site Configuration (`src/frontend/config/site.ts`)
All company branding and pre-canned prompts are isolated here:

```typescript
export const siteConfig = {
  name: "MAVI Dispatch Engine",
  tagline: "Automated 3-Signal Intake & Verified Candidate Routing",
  companyUrl: "[https://www.maviwork.com](https://www.maviwork.com)",
  samplePrompts: [
    {
      title: "Athena Club (D2C / NetSuite)",
      prompt: "Looking for a Senior Accountant to help Athena Club clean up inventory reconciliation, handle multi-channel sales across Shopify and Amazon, and manage month-end in NetSuite and Ramp. Needs 20 hours/week, 4 hours overlap with NYC."
    },
    {
      title: "Series A SaaS (ASC 606 / Stripe)",
      prompt: "We just raised Series A and need an ex-Big 4 controller to build out our ASC 606 revenue recognition schedules for annual prepay contracts coming through Stripe. Full time. Must know QuickBooks Online and Ramp."
    }
  ]
};
```

### 4.2 Core Views
1. **Intake & Live Matcher (`/`):**
   * High-contrast paste box allowing direct input of messy job descriptions.
   * Quick-fill chips loading the Athena Club and Series A SaaS sample prompts.
   * Triggering "Extract & Match Candidates" sends the payload to the backend, parses signals in under 400ms, and updates the view with the top two matches.
2. **The Candidate Executive Brief (`/candidates/[id]`):**
   * **Header Strip:** Candidate anonymous handle (e.g., "Candidate M-402"), Big 4 background badge, CPA equivalent status, daily US Eastern/Pacific overlap hours.
   * **3-Signal Alignment Matrix:** Comparison table contrasting client requirements against candidate verified history for Competencies, ERP Stack, and Industry Domain.
   * **AI Supervision Scorecard:** The thesis anchor component displaying the Hallucination Detection Index, audit speedup factor, and summary of the synthetic evaluation challenge passed.
   * **Deployment Invariants Banner:** Explicit notice that the candidate operates within a dedicated US-hosted virtual desktop environment with disabled clipboard and file downloads.
3. **Headless PDF Generation:**
   * Script `scripts/generate_brief_pdf.ts` uses Playwright to visit `/candidates/[id]?print=true` and export clean A4 vector PDFs to `dist/briefs/`.

---

## 5. File System & Monorepo Structure

```
mavi-gtm-engine/
├── .cursor/
│   └── rules/
│       ├── 01-architecture.mdc        # Stack boundaries, modular rules, types
│       ├── 02-backend.mdc             # FastAPI + Pydantic v2 + Instructor rules
│       └── 03-frontend.mdc            # Next.js 15 + Tailwind + Impeccable rules
├── docs/
│   ├── specs/
│   │   ├── 001-3-signal-intake.md     # Parser specifications and test assertions
│   │   └── 002-executive-brief.md     # Frontend UI state and layout rules
│   └── context/
│       ├── mavi-thesis.md             # TechCrunch breakdown and Ramp context
│       └── candidate-mock-pool.json   # 10 realistic ex-Big 4 candidate profiles
├── src/
│   ├── backend/
│   │   ├── main.py                    # FastAPI entrypoint
│   │   ├── core/                      # Reusable engine logic
│   │   │   ├── extractor.py           # Structured Instructor extraction runner
│   │   │   └── matcher.py             # Weighted 3-signal scoring algorithm
│   │   ├── domains/                   # Swappable domain definitions
│   │   │   └── accounting_mavi.py     # MAVI US GAAP and ERP models
│   │   └── schemas/
│   │       └── common.py              # Shared base response schemas
│   └── frontend/
│       ├── app/
│       │   ├── page.tsx               # Client intake and match interface
│       │   └── candidates/[id]/       # Candidate executive brief one-sheet
│       ├── components/
│       │   ├── IntakeForm.tsx         # Job description input box
│       │   ├── ExecutiveBrief.tsx     # Reusable candidate dossier
│       │   ├── AIScorecard.tsx        # AI hallucination evaluation card
│       │   └── AlignmentMatrix.tsx    # 3-signal match visualization
│       ├── config/
│       │   └── site.ts                # Isolated MAVI branding and sample prompts
│       └── lib/
│           └── api.ts                 # Typed client for backend communication
├── tests/
│   ├── test_extraction.py             # Golden scenario schema assertions
│   └── test_matcher.py                # Candidate ranking validation
├── scripts/
│   └── generate_brief_pdf.ts          # Playwright programmatic PDF exporter
├── .github/workflows/ci.yml           # Automated lint, typecheck, and test runner
├── CLAUDE.md                          # Quick CLI reference and invariants
├── repomix.config.json                # Repomix configuration for context bundling
└── README.md                          # Overview, architecture map, and live demo link
```

---

## 6. Phased Implementation Roadmap

### Phase 1: Foundation & Data Layer
- [ ] Initialize git repository `mavi-gtm-engine`.
- [ ] Commit `PROJECT_CONTEXT.md`, `CLAUDE.md`, and `.cursor/rules/`.
- [ ] Create `docs/context/candidate-mock-pool.json` with 10 detailed candidate profiles containing Big 4 pedigrees, ERP certifications, and AI evaluation metrics.

### Phase 2: Frontend Executive Brief (`src/frontend`)
- [ ] Scaffold Next.js 15 App Router with Tailwind CSS.
- [ ] Build `/candidates/[id]` rendering from static candidate mock data.
- [ ] Implement `AIScorecard.tsx` highlighting hallucination detection and AI supervision metrics.
- [ ] Verify Ramp-inspired visual standards (monochromatic base, zero low-contrast text).

### Phase 3: Ingestion & 3-Signal Parser (`src/backend`)
- [ ] Implement `src/backend/domains/accounting_mavi.py` schemas.
- [ ] Build `src/backend/core/extractor.py` using Instructor and Gemini 2.0 Flash / Groq.
- [ ] Build `src/backend/core/matcher.py` with weighted 3-signal scoring.
- [ ] Connect `IntakeForm.tsx` on the frontend to parse raw JDs and route to top-matched candidates.
- [ ] Verify golden scenarios pass in `tests/test_extraction.py`.

### Phase 4: Output Delivery & Packaging
- [ ] Add Playwright script for headless PDF candidate brief export.
- [ ] Deploy to Vercel and verify live performance on desktop and mobile.
- [ ] Run `npx repomix` to bundle clean context.