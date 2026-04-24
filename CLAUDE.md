# Personal Wealth Tracker — Project Guide

## Project

A local-only React + Vite web app for tracking personal net worth across 7 asset classes (Gold, Mutual Funds, Stocks, Bitcoin, Property, Bank Savings, Retirement). Replaces a manual Excel spreadsheet. Data is stored in `data.json` via a Vite plugin. No backend, no auth, no deployment in v1.

## Tech Stack

- **Framework:** React 18.3.x + Vite 5.x + TypeScript
- **UI:** shadcn/ui + Tailwind CSS 3.4.x
- **Forms:** React Hook Form 7.x + Zod 3.x
- **State:** React Context (`AppDataContext`)
- **Persistence:** Vite dev-server plugin (~50 lines) exposing `GET /api/data` and `POST /api/data` reading/writing `data.json`
- **Live prices:** Custom `useLivePrices()` hook; CoinGecko (BTC/USD), Frankfurter or open.er-api.com (USD/INR, AED/INR)

## GSD Workflow

This project uses GSD for phased planning and execution.

- Planning docs: `.planning/` (not committed to git — local only)
- Roadmap: `.planning/ROADMAP.md`
- Requirements: `.planning/REQUIREMENTS.md`

### Phase Execution Order
1. Foundation — persistence, data model, app shell, calculation utilities
2. Manual Asset Sections — Gold, MF, Stocks, INR Bank, Retirement, Settings
3. Live Prices + Bitcoin — price fetch hook, BTC section, AED bank extension
4. Property Section — milestone table, liability toggle
5. Dashboard — net worth summary aggregating all sections

### Next Step
Run `/gsd-discuss-phase 1` to gather context and clarify approach for Phase 1.

## Critical Conventions (must follow in all phases)

1. **Never store computed totals in `data.json`** — recompute from raw inputs at render time in `calculations.js`
2. **Floating-point safety** — round to 2 decimal places after every multiplication; use `parseFinancialInput()` for all user input
3. **Currency inputs** — use `type="text" inputmode="decimal"` (not `type="number"`) to support Indian formatting like "1,50,000"
4. **Live price caching** — always go through `priceApi.js`; never fetch inside individual components; BTC TTL = 5 min, forex TTL = 24 hr
5. **Schema versioning** — `data.json` root must have `"version": 1` from day one; check on load and warn if unknown
6. **UUIDs and timestamps** — all list items (accounts, milestones, etc.) have `id` (UUID), `createdAt`, `updatedAt` from the start
