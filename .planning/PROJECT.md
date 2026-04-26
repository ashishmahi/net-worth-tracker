# Personal Wealth Tracker

## What This Is

A local web app for tracking personal net worth across all asset classes — gold, mutual funds, stocks, Bitcoin, property, bank savings, and retirement accounts (NPS + EPF). Built to replace a manual Excel spreadsheet with a cleaner data entry experience. Data is stored locally in a JSON file; no backend or auth needed.

## Core Value

See your total net worth at a glance with minimal manual effort — live prices for BTC and forex fetched automatically, gold entered once, everything else updated in a few taps.

## Requirements

### Validated

- [x] **Phase 03:** Bitcoin quantity with live BTC/USD and USD/INR via `useLivePrices()`; INR and USD value of holding
- [x] **Phase 03:** Bank savings — INR and AED accounts (native balance; INR total using live or session AED/INR)
- [x] **Phase 03:** Central `priceApi` + session-only manual rates (Settings) when feeds fail
- [x] **Phase 04:** Property — agreement (INR), variable milestones (paid, amounts), balance due to builder (derived in UI), optional home loan (liability)
- [x] **Phase 05:** Dashboard — total net worth in INR with per-category breakdown (read-only; `dashboardCalcs` + `DashboardPage`)

### Active

- [ ] Gold holdings — enter weight (grams) per type (24K/22K), price per gram (manual), value calculated
- [ ] Mutual funds — enter current value and monthly SIP per platform
- [ ] Stocks — enter current portfolio value per platform (e.g. Zerodha)
- [ ] Retirement — NPS and EPF current balance; projected corpus at retirement age (configurable)
- [ ] Settings — gold prices (manual), retirement assumptions; live forex/BTC readouts and session overrides (Phase 3)
- [ ] All data persisted to a local JSON file; editable through the app UI
- [ ] INR as primary display currency throughout

### Out of Scope

- User authentication / login — local-only app, no multi-user support needed now
- Cloud sync or deployment — explicitly deferred to a future milestone
- Multi-currency display (AED alongside INR) — deferred; INR-only for v1
- Charts / visualizations — keep UI simple for now
- Historical net worth tracking / trends — not in v1
- Tax calculations — out of scope

## Context

- Migrating from `Personal_Wealth_Tracker.xlsx` which has 7 sheets: Dashboard, Settings, Gold, Investments, Property, Bank Savings, Retirement
- The spreadsheet used GOOGLEFINANCE() for live BTC/USD and forex rates — the web app will fetch these from a free public API
- Gold prices were manually updated from goodreturns.in — this stays manual
- Mutual fund and stock values come from PaytmMoney and Zerodha Kite apps — manual entry
- Property tracking includes a detailed payment milestone schedule (13 stages for current apartment)
- User is based across India (INR) and UAE (AED) — AED savings are significant
- Retirement age target: 60 (current age: 35), NPS return assumption: 10%, EPF rate: 8.15%
- BTC holding: 0.08 BTC

## Constraints

- **Tech stack**: React + Vite — fast local dev, run with `npm run dev`
- **Storage**: JSON file on disk (no database, no backend)
- **Scope**: Local-only for now — no deployment, no auth
- **UI**: Intentionally simple — functional over beautiful for v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite over plain HTML/JS | Better component structure for multi-section app with forms | — Pending |
| JSON file storage | Simplest possible persistence for local-only app | — Pending |
| Live price fetch for BTC + forex | Eliminates the most tedious manual update from spreadsheet | — Pending |
| Gold prices stay manual | No reliable free API for Indian gold prices; goodreturns.in works fine | — Pending |
| INR as primary currency | User's primary financial context; AED multi-currency deferred | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**Last updated:** 2026-04-26 (Phase 05 complete — v1.0 milestone)

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-26 after phase 04 execution*
