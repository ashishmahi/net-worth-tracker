# Personal Wealth Tracker — Project Guide

## Project

A local-only React + Vite web app for tracking personal net worth across 7 asset classes (Gold, Mutual Funds, Stocks, Bitcoin, Property, Bank Savings, Retirement). Replaces a manual Excel spreadsheet. Wealth data persists in the browser under the **`wealth-tracker-data`** `localStorage` key (see `AppDataContext`). No backend, no auth, no deployment in v1.

## Tech Stack

- **Framework:** React 18.3.x + Vite 5.x + TypeScript
- **UI:** shadcn/ui + Tailwind CSS 3.4.x
- **Forms:** React Hook Form 7.x + Zod 3.x
- **State:** React Context (`AppDataContext`)
- **Persistence:** Browser `localStorage` via `AppDataContext` (key `wealth-tracker-data`); never `localStorage.clear()` in app code (theme uses a separate key)
- **Live prices:** Custom `useLivePrices()` hook; CoinGecko (BTC/USD), Frankfurter or open.er-api.com (USD/INR, AED/INR)

## GSD Workflow

This project uses GSD for phased planning and execution.

- Planning docs: `.planning/`
- Roadmap: `.planning/ROADMAP.md` (v1.0 detail: `.planning/milestones/v1.0-ROADMAP.md`)
- Requirements: *live* `.planning/REQUIREMENTS.md` is created/updated by `/gsd-new-milestone` (between milestones it may be absent). Archives: e.g. `.planning/milestones/v1.6-REQUIREMENTS.md`, `v1.5-REQUIREMENTS.md`, `v1.4-REQUIREMENTS.md`, …
- Milestone history: `.planning/MILESTONES.md`
- **Git + GSD:** `.planning/config.json` sets **`commit_docs: true`** (GSD default) so workflows commit planning artifacts instead of only staging. Use **`gsd-sdk query commit "docs(…)" <paths>`** after each major artifact (context, research, plans, UAT) and separate **`feat(NN):`** (or `fix`) commits for `src/` work — same style as prior phases in `git log` (e.g. `docs(09):…` / `docs(state):…` / `feat(09):…`). Do not squash a whole phase into one commit unless the user asks.

### Phase Execution Order
1. Foundation — persistence, data model, app shell, calculation utilities
2. Manual Asset Sections — Gold, MF, Stocks, INR Bank, Retirement, Settings
3. Live Prices + Bitcoin — price fetch hook, BTC section, AED bank extension
4. Property Section — milestone table, liability toggle
5. Dashboard — net worth summary aggregating all sections (implemented: `src/lib/dashboardCalcs.ts`, `src/pages/DashboardPage.tsx`)

### Next step
**v1.6 — Encrypted Export** is **archived** (see `.planning/milestones/v1.6-ROADMAP.md`); git tag **`v1.6`**. Start **v1.7+** with **`/gsd-new-milestone`** (fresh `.planning/REQUIREMENTS.md`, phases from **22**). Run the app with `npm run dev`; tests: `npm test`. For status: `/gsd-progress`.

## Critical Conventions (must follow in all phases)

1. **Never store computed totals in the saved app document** — recompute from raw inputs at render time in `calculations.js`
2. **Floating-point safety** — round to 2 decimal places after every multiplication; use `parseFinancialInput()` for all user input
3. **Currency inputs** — use `type="text" inputmode="decimal"` (not `type="number"`) to support Indian formatting like "1,50,000"
4. **Live price caching** — all market `fetch` calls go through `src/lib/priceApi.ts`; pages consume **`useLivePrices()`** (no ad-hoc `fetch` in `src/pages/`). **BTC/USD** cache TTL **5 min**; **forex (USD/INR, AED/INR)** **~1 hour** (Phase 3 hourly forex, D-02).
5. **Schema versioning** — the stored document root must have `"version": 1` from day one; check on load and warn if unknown
6. **UUIDs and timestamps** — all list items (accounts, milestones, etc.) have `id` (UUID), `createdAt`, `updatedAt` from the start
