---
id: SEED-005
status: dormant
planted: "2026-05-05"
planted_during: Between milestones — v2.1 shipped (STATE.md); no active phase
trigger_when: A milestone extends multi-currency beyond bank AED — modeling **native currency per line** for equities/debt and a **single app-level reporting currency** (e.g. selector “at the top”) for aggregated totals.
scope: Large
---

# SEED-005: Enter assets and liabilities in native currency; aggregate in user-chosen app currency

## Why This Matters

Today **mutual funds**, **stocks**, **property**, **liabilities**, and most totals are **stored and summed as INR numbers** (`currentValue`, `outstandingInr`, etc.). Only **bank savings** rows carry an explicit **`INR | AED`** currency. Users with **US brokerage** holdings naturally track values in **USD**; forcing mental conversion into INR at entry time is error-prone and stale as FX moves. The desired behavior: **record the line in its natural currency** (e.g. USA stocks in **dollars**), while the app exposes a **reporting / app currency** control (as if “set at the top”) so **dashboard and net worth aggregation** always show **one coherent denomination** by converting through live or session FX—without losing the original native amounts.

## When to Surface

**Trigger:** Schema work for **per-row currency** on assets/liabilities, **Settings or shell control** for **default display currency**, or a milestone that builds on **[SEED-004](SEED-004-multi-currency-reporting.md)** (read-only reporting) toward **editable native balances**.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:

- **US or multi-region** stocks/MF/loans modeled in non-INR native units.
- **Global preference**: “Show my wealth in **INR | USD | AED**” driving headline + charts.
- **Migration** path from existing all-INR rows (treat legacy as INR vs prompt user).

## Scope Estimate

**Large** — requires **data model** changes (`zod` + migrations), **dashboardCalcs** and liability sums to convert **per line** using `usdInr` / `aedInr` / future crosses, **UI** on Stocks/MF/Liabilities pages (currency picker, formatting), **missing-rate** behavior (already patterned for AED banks), and alignment with **net worth snapshots** (likely still internally INR or explicit FX snapshot—decide at execution).

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/types/data.ts` — **`StockPlatformSchema` / `MfPlatformSchema`**: `currentValue` only (implicit INR); **`LiabilityItemSchema`**: `outstandingInr`; **`BankAccountSchema`**: **`currency: 'INR' | 'AED'`** — precedent for per-row currency + conversion.
- `src/lib/dashboardCalcs.ts` — `sumMutualFunds`, `sumStocks` assume INR; `sumBankSavingsInr` uses **`aedInr`** for AED rows.
- `src/context/LivePricesContext.tsx` — **`usdInr`**, **`aedInr`**, session overrides — conversion inputs for aggregation.
- Top chrome / sidebar — today **“Net worth in INR”** (`AppSidebar.tsx`); a global currency switch would live near headline or Settings.
- [.planning/seeds/SEED-004-multi-currency-reporting.md](SEED-004-multi-currency-reporting.md) — overlapping **display-currency** work; **004** can stay “reporting view,” **005** pushes **native storage** + **aggregation rule**.

## Notes

- **FX source of truth**: live vs session vs snapshot-time rate must be explicit when **history** and **“app currency”** interact.
- **Liabilities in USD** (e.g. US mortgage): same pattern as assets—**native outstanding** + convert for roll-up.
- Consider **minimum viable**: only **stocks** + **liabilities** get native USD first; MF stays INR until needed.
