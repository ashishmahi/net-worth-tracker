# Personal Wealth Tracker — Roadmap

**Milestone:** v1.0 — Local-only wealth tracker replacing Excel

---

## Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 01 | Foundation | 🔄 In Progress | 0/3 complete |
| 02 | Manual Asset Sections | Complete | 5/5 · 2026-04-25 |
| 03 | Live Prices + Bitcoin | Complete | 3/3 · 2026-04-25 |
| 04 | Property Section | Complete | 2/2 · 2026-04-26 |
| 05 | Dashboard | ⬜ Planned | — |

---

## Phase 01 — Foundation

**Goal:** A runnable Vite dev server with GET/POST /api/data persistence, Tailwind 3.x + shadcn/ui wired, Zod data schema, financial utilities, and a navigable app shell with 9 stub pages.

**Requirements:** FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05

### Plans

- [ ] 01-01 · Project scaffold + persistence plugin (Wave 1)
- [ ] 01-02 · Data schema + financial utilities (Wave 2)
- [ ] 01-03 · App shell + stub pages + Export Data (Wave 3)

---

## Phase 02 — Manual Asset Sections

**Goal:** Fully functional data entry for Gold, Mutual Funds, Stocks, INR Bank Savings, Retirement (NPS/EPF), and Settings — all persisted via AppDataContext.

**Plans:** 5/5 plans complete

Plans:
- [x] 02-01-PLAN.md — Install deps + update data schema (D-03/D-21–D-25) + add calcProjectedCorpus
- [x] 02-02-PLAN.md — SettingsPage: gold prices block + retirement assumptions block
- [x] 02-03-PLAN.md — RetirementPage: inline form + projected corpus card
- [x] 02-04-PLAN.md — GoldPage + MutualFundsPage: Sheet-based list sections
- [x] 02-05-PLAN.md — StocksPage + BankSavingsPage: Sheet-based list sections

---

## Phase 03 — Live Prices + Bitcoin

**Goal:** BTC/USD + USD/INR + AED/INR live price fetching via useLivePrices() hook; Bitcoin section wired; AED bank accounts in Bank Savings.

**Plans:** 3/3 complete (2026-04-25)

- [x] 03-01-PLAN.md — priceApi, LivePricesContext, main wiring, CLAUDE TTL
- [x] 03-02-PLAN.md — Settings live + session rates; Bitcoin page
- [x] 03-03-PLAN.md — Bank AED/INR schema, migration, BankSavingsPage

---

## Phase 04 — Property Section

**Goal:** Property milestone tracking table with agreement value, amount paid, balance, payment milestones, and liability toggle.

**Plans:** 2/2 complete (2026-04-26)

- [x] 04-01-PLAN.md — Zod `PropertyItem` / milestone schemas in `data.ts`
- [x] 04-02-PLAN.md — shadcn Checkbox, Switch, Table; full `PropertyPage` list + Sheet

---

## Phase 05 — Dashboard

**Goal:** Net worth summary aggregating all 7 asset sections with per-category breakdown and total in INR.
