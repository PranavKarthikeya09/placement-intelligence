# Sri Venkateswara College of Engineering (SVCE) — Placement Intelligence Hub

Enterprise campus placement research & intelligence portal engineered for **Sri Venkateswara College of Engineering (SVCE)**.

---

## 📌 Phase 1 — UI-Only Placement Intelligence Hub

This repository contains the **Phase 1 UI-only implementation** of the SVCE Placement Intelligence Hub.

### Key Architectural Characteristics

1. **Pure Presentation & Analytical Interface**:
   - Built with React 18, Vite, TypeScript, Tailwind CSS v3, shadcn/ui primitives, Framer Motion, and TanStack React Query.
   - Designed with an enterprise SaaS aesthetic (Google Workspace / clean analytics portal style).
   - Fully public access: **Zero authentication, zero login routes, zero protected routes**.

2. **Data Source of Truth**:
   - All company intelligence and skill benchmarking data is served directly from `src/data/seedCompanies.ts` and `src/data/skillTopics.ts`.
   - The dataset contains high-fidelity research data for **Accenture plc** across all 22 intelligence sections and 12 skills.

3. **Data Normalization Layer (Backend-Ready)**:
   - Pure normalizers (`normalizeCompanySummary`, `normalizeCompanyProfile`, `normalizeDashboardSkills`) in `src/lib/companyData.ts` consume raw JSONB-compatible shapes (`short_json`, `full_json`, `skill_levels`).
   - In **Phase 2**, this layer will connect to Supabase rows seamlessly without requiring changes to the UI components or page schemas.

4. **College Branding**:
   - Configured specifically for **Sri Venkateswara College of Engineering (SVCE)**.
   - Uses text-only typography and metadata without college logo assets or image dependencies.

5. **Data Policy Compliance**:
   - Strictly contains **no CTC, no Stipend, and no Selection Ratio** metrics anywhere in the application.

---

## 🚀 Navigation & Route Structure

- `/` — Main placement research portal featuring search, debounced filtering, category counts (`All`, `Super Dream`, `Dream`, `Standard`, `Regular`), and responsive company grid.
- `/company` — Automatic redirect to `/company/intelligence`.
- `/company/intelligence` — Detailed company intelligence suite featuring:
  - Sticky company metadata bar with Website and LinkedIn direct links.
  - 22 tabbed intelligence sections with real-time scroll-spy and mobile horizontal scrolling.
  - 22 populated sections: Company Identity, Overview & Vision, Leadership, Funding & Financials, Global Presence, Products & Services, Technology Stack, Partnerships & Ecosystem, Competitive Landscape, Market Opportunity, Core Value Proposition & ESG, Culture & Work Life, Recent News & Milestones, Sales & Customer Metrics, Risk & Compliance, Work Location & Commute, Safety & Wellbeing, Career Growth & Learning, Brand & Reputation, Compensation & Benefits, Digital Presence & Ratings, Contact Information.
- `/company/skills` — Skill intelligence & benchmarking suite:
  - 5-Tier Bloom's Taxonomy Legend (`CU`, `AP`, `AS`, `EV`, `CR`) with exact brand colors.
  - 3 Preparation Criticality Tiers (`Critical`, `Important`, `Baseline`).
  - 12 skills ranked descending by target proficiency score.
  - 10-level progressive roadmap ladders with locked visual indicators for levels exceeding target scope.
- `*` — 404 Not Found fallback for invalid paths.

---

## 🛠️ Environment Configuration

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_LOGO_DEV_PUBLISHABLE_KEY` | Optional | Publishable API key for Logo.dev recruiter company logo resolution. If omitted, falls back gracefully to SVG/CDN URLs or geometric initial badges. |

---

## 💻 Local Development & Verification

### Install Dependencies
```bash
npm install
```

### Start Local Development Server
```bash
npm run dev
```

### Run Vitest Smoke & Functional Suite
```bash
npm run test
```

### Build Production Bundle
```bash
npm run build
```
