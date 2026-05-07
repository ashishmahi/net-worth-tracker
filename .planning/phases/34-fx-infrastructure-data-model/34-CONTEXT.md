# Phase 34: FX Infrastructure & Data Model - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the **FX data layer** (extend `fetchForex` / `LivePricesContext` for EUR, GBP, SGD vs INR), a **pure conversion utility** with explicit unavailable-rate handling (FX-02, FX-03), and the **data model + migration** for optional per-record `currency`, settings `reportingCurrency`, and schema version bump (DM-01–03). **No** reporting-currency UI (Phase 35+), **no** dashboard dual-currency display (Phase 36+), **no** asset-page currency dropdowns (Phase 37+), **no** Settings rates card extension for new pairs (Phase 38) — though session override *hooks* for new pairs should exist in context for parity.

</domain>

<decisions>
## Implementation Decisions

### FX feed (`priceApi` + `LivePricesContext`)

- **D-01:** Extend the **existing single** `fetchForex()` call to open.er-api.com (USD-latest); add **`eurInr`**, **`gbpInr`**, **`sgdInr`** alongside **`usdInr`** and **`aedInr`**. Keep **one HTTP round-trip** and one atomic rate snapshot (consistent with current architecture in `src/lib/priceApi.ts`).
- **D-02:** **Best-effort per pair:** if INR/AED are valid but one of EUR/GBP/SGD is missing or invalid, **still return** the valid pairs and represent the bad pair as **`null`** (do not fail the entire forex fetch). Aligns with FX-03 *per-pair* “rate unavailable.”
- **D-03:** **Session override parity:** extend `SessionRatePartial` / `setSessionRates` / `clearSessionRates` so **`eurInr`**, **`gbpInr`**, **`sgdInr`** can be overridden session-only the same way as **`usdInr`** / **`aedInr`** (clear those keys on successful live fetch like today). Phase 38 wires manual inputs to these keys.
- **D-04:** **Units & names:** **`eurInr`**, **`gbpInr`**, **`sgdInr`** mean **INR per 1 EUR / 1 GBP / 1 SGD**, same convention as **`usdInr`** (INR per USD) and **`aedInr`** (INR per AED). Document in `priceApi.ts`.

### Conversion utility (`toReportingCurrency` / helpers)

- **D-05:** **INR hub:** convert any supported pair via INR legs (e.g. GBP→AED: `amountGBP * (gbpInr / aedInr)`). If **either** rate needed for the path is **`null`**, treat as **rate unavailable** (FX-03) — do not invent cross-rates.
- **D-06:** Implement as **pure functions** in `src/lib/` taking **explicit rate snapshots** (and currencies), **not** a hook — **Vitest-friendly**, matches roadmap success criteria and keeps conversion testable without React.
- **D-07:** Return a **discriminated union**, e.g. `{ ok: true, amount: number } | { ok: false, reason: 'rate_unavailable' }` (exact tag names up to implementation). **No silent null amount** as the only signal.
- **D-08:** On **`ok: true`**, return **full-precision** numbers; apply **`roundCurrency`** at **aggregation / display** boundaries consistent with `src/lib/dashboardCalcs.ts` (avoid double-rounding across summed lines).

### Migration & schema

- **D-09:** For legacy records that gain optional **`currency`** (excluding bank rows that already have **`currency`**): **stamp `currency: "INR"`** on migrate for clarity and export semantics (aligns with legacy INR-stored amounts and EXP-01).
- **D-10:** On migrate, set **`settings.reportingCurrency: "INR"`** when absent (matches prior INR headline behavior and DM-02 default).
- **D-11:** **Bump** root app data **`version`** to **2** with a **tested migration** from v1 fixtures (DM-03).
- **D-12:** Run the **same migration chain** on **cold load** and **`parseAppDataFromImport` / zip path** so import and boot never diverge.

### Currency type system

- **D-13:** Add a dedicated module **`src/types/currency.ts`** exporting the **six codes** as `const` + **derived types**, consumed by Zod in `src/types/data.ts` and by conversion helpers.
- **D-14:** **Widen** existing **bank** `currency` enum from **`INR` | `AED`** to **all six** codes in this phase so schema matches DM-01 and avoids a second migration later (UI still Phase 37).
- **D-15:** **Persist only strict uppercase ISO codes** via Zod enums (`INR`, `USD`, `AED`, `EUR`, `GBP`, `SGD`). If import coercion is needed, normalize **before** validation only where the app already tolerates legacy shapes — **no** loose stored strings.
- **D-16:** **`reportingCurrency`** and per-record **`currency`** use the **same six-code union** (single source of truth).

### Claude's Discretion

- **Pure `src/lib/` module** for conversion (user: “you decide” on hook vs pure — chose **pure + explicit rates**).
- **Rounding:** full precision from converter; **`roundCurrency`** at caller/calc boundaries (user: “you decide”).
- **Strict persisted codes** with enum validation (user: “you decide” on strict vs permissive — chose **strict storage**).
- **Single shared currency union** for settings + records (user: “you decide” — chose **one union**).

### Folded Todos

*(None — no todo matches for phase 34.)*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- `.planning/REQUIREMENTS.md` — v2.4 traceability; Phase 34 covers **FX-01–03**, **DM-01–03**
- `.planning/ROADMAP.md` — Phase 34 goal, success criteria, phase boundary vs 35–38
- `.planning/seeds/SEED-005-multi-currency-reporting.md` — seed breadcrumbs and file touch list

### Product spec

- `docs/multi-currency.md` — reporting currency, per-record currency, conversion formula, edge cases (esp. §4, §5, §8)

### Implementation anchors (existing code)

- `src/lib/priceApi.ts` — forex fetch, `ForexRates`, TTL constants
- `src/context/LivePricesContext.tsx` — session overrides, forex refresh
- `src/types/data.ts` — Zod schemas, `version` literal, bank `currency`
- `src/context/AppDataContext.tsx` — migration chain on load / import

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`fetchForex` / `ForexRates`** (`src/lib/priceApi.ts`) — extend in place; same USD-latest endpoint already carries multiple `rates.*` fields.
- **`LivePricesContext`** — mirror **`usdInr`/`aedInr`** state, refs, session merge, and “clear override on successful fetch” for the three new pairs.
- **`roundCurrency`** (`src/lib/financials.ts`) — use at sum/display boundaries after conversion helpers return raw numbers.
- **Bank `currency`** — already **`INR` | `AED`** in `data.ts`; widen to six codes per D-14.

### Established Patterns

- **Forex:** single `fetchForex` throws only on **hard** failure; with best-effort pairs, partial **`null`**s must not throw away good pairs.
- **Session rates:** `SessionRatePartial` + `setSession` delete keys on successful live quote.
- **Migration:** chained transforms (`migrateLegacyBankAccounts`, `ensureNetWorthHistory`, …) before `DataSchema.safeParse`.

### Integration Points

- **`main.tsx`** — `LivePricesProvider` wraps app; new context fields propagate everywhere `useLivePrices` is used (Phase 34 may only extend types + minimal consumers/tests).
- **`dashboardCalcs.ts`** — future phases replace INR-only assumptions; Phase 34 supplies **rates + conversion primitive**, not full dashboard changes.

</code_context>

<specifics>
## Specific Ideas

- User asked explicitly how **GBP asset → AED reporting** works: **INR hub** — `gbpInr` and `aedInr` both required; conversion `amount * gbpInr / aedInr`; if either rate missing, **unavailable** path (FX-03).

</specifics>

<deferred>
## Deferred Ideas

**None** — discussion stayed within Phase 34 scope. Reporting currency **UI**, dashboard dual-currency **display**, asset **forms**, Settings **rates card** UI, snapshots/export remain in Phases **35–38** per roadmap.

</deferred>

---

*Phase: 34-FX Infrastructure & Data Model*
*Context gathered: 2026-05-08*
