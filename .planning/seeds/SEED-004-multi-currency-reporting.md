---
id: SEED-004
status: dormant
planted: "2026-05-05"
planted_during: Between milestones — v2.1 shipped (STATE.md); no active phase
trigger_when: A milestone focused on international users, display/reporting preferences, or deepening FX beyond AED bank balances and INR headline net worth.
scope: Large
---

# SEED-004: Multi-currency reporting — USD, AED, and INR (display and/or roll-up)

## Why This Matters

The product’s **core value** is still **net worth in INR** ([`PROJECT.md`](../PROJECT.md)), with **AED** already supported for **bank account native balances** and **live AED→INR** for roll-ups. Users who think in **USD** (or want **AED/USD alongside INR** for reporting) still have to mentally convert: the app does not offer a **global reporting currency** or **parallel columns** for the dashboard, history, and exports. First-class “view in $ / د.إ / ₹” would help expat and cross-border portfolios without changing the local-only, browser-stored model—if design makes clear what is **derived** (FX spot / session rates) vs **native** entry.

## When to Surface

**Trigger:** Work on **currency UX**, **dashboard headline options**, **net worth history / snapshots in another unit**, or **Settings preferences** for locale-style reporting.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:

- **Display currency** or **secondary currency** for totals (not only bank row labels).
- **Export** (JSON/zip) should include or switch **denomination** for external tools.
- **Expanding** which assets are **native multi-currency** (today: bank AED; most else is INR-typed).

## Scope Estimate

**Large** — touches **headline calcs**, **formatting** across many pages, **snapshot history** semantics (INR-only today?), **Settings** for preferred report currency and **stale rate** behavior. May be phased: e.g. **read-only parallel USD/AED** on Dashboard first, then history, then full app chrome.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/lib/dashboardCalcs.ts` — `sumBankSavingsInr`, `aedInr` gating; **net worth** path assumes INR composition for most asset classes.
- `src/context/LivePricesContext.tsx` — `usdInr`, `aedInr` (and session overrides) for conversion inputs.
- `src/lib/priceApi.ts` — forex derivation for **USD→INR** and **AED→INR** (`aedInr = INR/AED` from open.er-api).
- `src/types/data.ts` — `BankAccountSchema` **`currency: 'INR' | 'AED'`**; other major blocks are INR-numeric.
- `src/pages/BankSavingsPage.tsx` — pattern for **per-row currency** and **AED needs rate** messaging.
- `src/pages/DashboardPage.tsx` — INR headline, AED partial inclusion when rate missing.
- `src/components/AppSidebar.tsx` — copy: **“Net worth in INR · local only”** (would need revisiting if reporting currency is user-selectable).
- `src/pages/BitcoinPage.tsx` — already surfaces **USD** as secondary context for BTC.

## Notes

- **Single source of truth** for stored numbers can stay **INR** (or per-asset native) while **UI** applies **display conversion**—avoids duplicating `netWorthHistory` in three currencies.
- If **USD reporting** is added, clarify **which USD/INR** (live vs session vs snapshot-time rate) for **historical** charts.
- **Tax/legal** use of numbers remains user responsibility; UI should not imply official FX for compliance.
