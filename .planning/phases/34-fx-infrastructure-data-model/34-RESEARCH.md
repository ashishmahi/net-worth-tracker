# Phase 34 — Technical Research

**Phase:** 34 — FX infrastructure & data model  
**Question:** What do we need to know to plan FX feeds, conversion utilities, and schema migration well?

---

## 1. Existing forex pipeline

- **`fetchForex`** (`src/lib/priceApi.ts`) calls `GET https://open.er-api.com/v6/latest/USD`. Response includes `rates.INR`, `rates.AED`, and for cross pairs **`rates.EUR`**, **`rates.GBP`**, **`rates.SGD`** as **amount of that currency per 1 USD** (same convention as AED).
- Today: `usdInr = rates.INR`, `aedInr = rates.INR / rates.AED`.
- **INR per 1 EUR:** `eurInr = rates.INR / rates.EUR` (EUR per USD is `rates.EUR`; invert via INR-per-USD leg).
- **INR per 1 GBP:** `gbpInr = rates.INR / rates.GBP`.
- **INR per 1 SGD:** `sgdInr = rates.INR / rates.SGD`.
- All six pair semantics align with **D-04** (INR per unit foreign), matching `usdInr` / `aedInr`.

## 2. Best-effort partial pairs (D-02)

- If **`rates.INR`** or **`rates.AED`** missing/non-positive → keep treating as **hard failure** for the legacy hub (consistent with current throw behavior for unusable AED path).
- If EUR/GBP/SGD rate missing or ≤ 0 → set **`eurInr` / `gbpInr` / `sgdInr`** to **`null`** individually; still return **`usdInr`** and **`aedInr`** when valid.
- **`ForexRates`** type should use **`number | null`** for the three new fields only.

## 3. LivePricesContext integration

- Mirror **`usdInr`/`aedInr`**: separate **`useState`** + **`useRef`** for **`eurInr`**, **`gbpInr`**, **`sgdInr`** (nullable).
- Extend **`SessionRatePartial`** with **`eurInr`?, **`gbpInr`?, **`sgdInr`?**.
- On successful **`fetchForex`**, delete session override keys for all five INR-quote pairs (existing pattern for BTC/usdInr/aedInr).
- **Stale / hasLive:** Today forex “has live” requires USD+AED. After change, treat forex channel as live when **both** **`usdInr`** and **`aedInr`** refs are non-null (unchanged); partial EUR/GBP/SGD nulls do not block “live” state.

## 4. Pure conversion module (D-05–D-08)

- **Inputs:** explicit **`amount`**, **`from`**, **`to`** (`CurrencyCode`), and a **rate snapshot** struct holding **`usdInr`**, **`aedInr`**, **`eurInr`**, **`gbpInr`**, **`sgdInr`** (each `number | null` where applicable).
- **INR hub:** convert any currency to INR using its `*Inr` rate; reporting currency from INR via dividing by target `*Inr`. Same currency → `{ ok: true, amount }` without rates.
- **Unavailable:** if any required rate for the path is **`null`** → **`{ ok: false, reason: 'rate_unavailable' }`** (exact discriminant names can match CONTEXT).
- **Testing:** Vitest table-driven cases for INR↔USD, GBP→AED, missing **`gbpInr`**, etc.; assert **`reason`** when blocked.

## 5. Data model & migration (DM-01–03, D-09–D-12)

- **`src/types/currency.ts`:** single **`CurrencyCode`** union **`INR | USD | AED | EUR | GBP | SGD`** + exported const tuple for Zod **`z.enum`**.
- **`DataSchema`:** bump **`version`** from **`1`** to **`2`**.
- **`settings`:** **`reportingCurrency`** optional on parse with default **`INR`** applied in migration / `createInitialData`.
- **Optional `currency`** on record types per CONTEXT (gold items, MF/stock platforms, property, liabilities, commodities, bitcoin quantity currency optional — follow CONTEXT list; bank already has **`currency`** — widen enum to six codes **D-14**).
- **Migration function:** input v1-shaped JSON → output v2: set **`settings.reportingCurrency`** if absent, stamp **`currency: "INR"`** on legacy rows per D-09, **`version: 2`**. Run in **`parseAppDataFromImport`** chain **before** **`DataSchema.safeParse`** (same order as D-12).
- **`createInitialData`:** emit **`version: 2`** and defaults consistent with migration.

## 6. Risks

- **Breaking change:** `z.literal(1)` → `z.literal(2)` invalidates old stored JSON until migration runs — migration must be first step in parse chain.
- **Tests:** `createInitialData`, `schema.test.ts`, `migration.test.ts`, zip import tests may need updates when version changes.

---

## Validation Architecture

Phase validation is **automated-first** via **Vitest** + **`tsc`**.

| Dimension | Approach |
|-----------|----------|
| **FX math** | Unit tests with **fixed numeric snapshots** (no network); mock **`fetch`** in **`priceApi`** tests if needed for integration-style asserts |
| **Conversion** | **`src/lib/__tests__/currencyConversion.test.ts`** (or co-located) — hub paths, same-currency, unavailable branches |
| **Migration** | **`migration.test.ts`** (extend) — v1 fixture → parse succeeds → **`version === 2`**, stamped **`currency`**, **`reportingCurrency`** |
| **Regression** | **`npm test -- --run`** + **`npx tsc -b`** after each task |

**Coverage target:** conversion module **≥ 80%** statements (per ROADMAP success criteria).

---

## RESEARCH COMPLETE

Research artifacts are sufficient to produce **`34-VALIDATION.md`** and executable **`PLAN.md`** files.
