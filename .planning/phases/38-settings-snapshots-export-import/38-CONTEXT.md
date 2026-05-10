# Phase 38: Settings, Snapshots & Export/Import - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Close out **v2.4** by surfacing the **5 FX pairs** in the **Settings → Live rates** card (**SET-01**), wiring **session-only manual overrides** for **EUR / GBP / SGD** (extending the existing override hooks for **USD / AED**) (**SET-02**), capturing **`reportingCurrency` + a rate map** on **net worth snapshots** (**SNP-01**, **SNP-02**), and verifying **zip export / import** preserves per-record **`currency`** fields (**EXP-01**, **EXP-02**). Settings UX adopts a **read-only-by-default + Edit** pattern (matching the existing **`SettingsGoldPricingCard`** / **`SettingsSilverPricingCard`** model). The **dashboard chart** is **not** changed this phase — new snapshot fields are stored for future use only. **No** new asset-page work, **no** dual-currency surfaces beyond Phase 36/37, **no** new persisted user FX rate (session-only).

</domain>

<decisions>
## Implementation Decisions

### Live rates card — layout & labels (SET-01)

- **D-01:** **Order:** **All 5 FX pairs grouped at the top** in this order — **USD/INR, AED/INR, EUR/INR, GBP/INR, SGD/INR** — followed by **BTC/USD**. **Gold (XAU)** and **Silver (XAG)** rows are **removed** from this card (they live on the **Gold & Silver** tab via **`SettingsGoldPricingCard`** / **`SettingsSilverPricingCard`**) — see **D-04**.
- **D-02:** **Labels:** Use the existing per-row label pattern — **`USD → INR (₹ per $1)`**, **`AED → INR (₹ per 1 AED)`**, **`EUR → INR (₹ per 1 EUR)`**, **`GBP → INR (₹ per 1 GBP)`**, **`SGD → INR (₹ per 1 SGD)`**, **`BTC / USD`**. Match `usdInr` / `aedInr` / `eurInr` / `gbpInr` / `sgdInr` semantics from **Phase 34 D-04** (INR per 1 unit).
- **D-03:** **Per-pair fallback:** When **`forexLoading`** is true and a pair has no live value, show **Loading…** spinner (existing pattern). When fetch returned but a pair is **`null`** (per **Phase 34 D-02** best-effort), show the existing **`—`** placeholder. **Do not** introduce a new “Rate unavailable” copy on this card (that hint stays a **dashboard / asset-page** signal).

### Combined Live rates / manual override card — read-only + Edit (SET-02)

- **D-04:** **Merge** the existing two cards (**Live market rates** + **Session-only manual rates**) into **one** card on the **Live rates** settings tab. **Scope of card = the 5 FX pairs + BTC/USD only** — Gold (XAU) and Silver (XAG) live on the **Gold & Silver** tab and are **not** mirrored here.
- **D-05:** **Default mode:** **Read-only** view of the 6 rates (rows shown in the **D-01** order). A single **Edit** button at the **card** level toggles the entire card into edit mode (per-row Edit and per-group Edit were considered and **rejected**: forex pairs all come from one fetch; one toggle keeps interaction simple).
- **D-06:** **Edit mode UI:** All six pairs become editable inputs (**`type="text" inputmode="decimal"`**, same pattern as today’s session inputs). **Apply session rates** and **Clear session rates** buttons appear in this mode (matches the existing wording / behavior). Exiting Edit (Cancel) restores the read-only display. After **Apply**, return to read-only.
- **D-07:** **Persistence semantics: session-only.** Manual values stay in memory only via the existing **`setSessionRates`** path (**Phase 34 D-03** already covers EUR/GBP/SGD keys); they do **not** persist across reloads, and a successful live fetch drops the matching session keys (existing behavior). **Do not** add a “Lock manual rate” persisted setting in this phase — “lockable session override” is **deferred**.
- **D-08:** **Empty-input behavior unchanged** — only non-empty trimmed inputs become session overrides; trimmed empty inputs leave the live value alone. Existing copy (“These values stay in memory only… When live feeds succeed again, session overrides for that channel are dropped automatically.”) is preserved or lightly tightened to fit the merged card.

### Net worth snapshot capture (SNP-01, SNP-02)

- **D-09:** **Schema evolution: additive-optional, no version bump.** Keep `version: 2` from Phase 34. Extend **`NetWorthPointSchema`** (`src/types/data.ts`) with **all-optional** new fields:
  - `reportingCurrency?: Currency` — six-code union from **`src/types/currency.ts`** (Phase 34 D-13/D-16).
  - `totalReporting?: number` — headline value in the captured reporting currency at capture time (the figure the user actually saw on the dashboard).
  - `rates?: { usdInr?, aedInr?, eurInr?, gbpInr?, sgdInr?, btcUsd?, goldUsdPerOz?, silverUsdPerOz? }` — every field inside is also optional (a partial fetch failure must not block snapshot capture).
  Existing entries (`{ recordedAt, totalInr }`) remain valid. **No migration step** needed; legacy snapshots remain on the chart with `totalInr` only.
- **D-10:** **Rate-map scope (Claude’s discretion granted):** Capture **all eight quote channels** — the 5 FX pairs **plus** `btcUsd`, `goldUsdPerOz`, `silverUsdPerOz` — every entry inside the `rates` block remains independently optional. Spec text says “FX rates”; storing the wider set costs nothing in JSON size and lets a future phase reconstruct each leg of the snapshot total exactly as captured. **`totalInr` continues to be written** alongside the new fields so the existing chart keeps working without changes (**D-12**).
- **D-11:** **Capture site:** Snapshot writer in **`DashboardPage.tsx`** (`handleRecordSnapshot`) populates the new fields from the **same `forexSnapshot` / `useLivePrices`** values used to compute the headline that moment. If a rate is `null` in the live context, the corresponding field is **omitted** (not zero); **`reportingCurrency`** is read from **`data.settings.reportingCurrency`** (defaulted to `INR` by **Phase 34 D-10**); **`totalReporting`** is the rounded reporting-currency value already shown to the user.

### Historical chart behavior (out-of-scope confirmation)

- **D-12:** **No chart changes this phase.** The existing line/area chart and tooltips continue to plot **`totalInr`**. New snapshot fields are **persisted but not yet rendered**. Re-rendering history in the topbar’s current reporting currency (or annotating each point with its captured currency) is **deferred** to a follow-up UX phase.

### Export / import (EXP-01, EXP-02)

- **D-13:** **No new export/import code is required.** Phase 34 (D-09, D-12) already routes both **cold load** and **`parseAppDataFromImport`** through the same migration chain that stamps `currency: "INR"` on legacy records and validates the strict six-code Zod union. Zip export emits the raw `data.json` blob (`createWealthExportZip` in `src/lib/wealthDataZip.ts`) which already contains every record’s `currency` field. EXP-01 / EXP-02 are therefore **structurally satisfied** — Phase 38 verifies them through tests and UAT, not new feature code.
- **D-14:** **Verification:** Add a **round-trip Vitest** that exports current `AppData` (with mixed-currency records and at least one snapshot containing the new fields), parses it back through `parseAppDataFromImport`, and asserts that `currency` (per-record), `reportingCurrency`, `rates`, and `totalReporting` are preserved 1:1. UAT covers manual export/import on a populated browser instance.

### Claude's Discretion

- **Snapshot rate-map scope (D-10)** — user said “whatever you want to do, just keep app safe and don’t impact existing users.” Chose the **wider 8-quote map** with all-optional fields; legacy snapshots remain valid; chart unchanged.
- **Implementation file layout** for the new combined Live rates card (e.g. inline in `SettingsPage.tsx` vs new `SettingsLiveRatesCard.tsx`) — implementer decides; **one** place must encode **D-04 – D-08** semantics. Prefer a small dedicated component to mirror the gold/silver pattern.
- **Read-only number formatting** in the merged card (decimals, locale) — implementer follows the existing `toLocaleString('en-IN', { maximumFractionDigits: 4 })` style for FX and `{ maximumFractionDigits: 2 }` for BTC; no new formatter required.
- **Edit-mode error/empty-state copy** beyond what already exists — implementer’s call as long as the “session-only / drops on live fetch” explainer survives the merge.

### Folded Todos

*(None — no todo matches surfaced for phase 38.)*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & roadmap

- `.planning/REQUIREMENTS.md` — **SET-01**, **SET-02**, **SNP-01**, **SNP-02**, **EXP-01**, **EXP-02** traceability rows
- `.planning/ROADMAP.md` — Phase 38 goal + 4 success criteria; v2.4 phase table
- `.planning/seeds/SEED-005-multi-currency-reporting.md` — seed scope (settings rates card, snapshot rates+reporting currency, export/import)

### Product spec

- `docs/multi-currency.md` — §6 Settings live rates extension; §9 edge cases (snapshots record reporting currency + rates so historical values remain accurate; export/import preserve currency)

### Prior phase context (locked decisions carried forward)

- `.planning/phases/34-fx-infrastructure-data-model/34-CONTEXT.md` — `fetchForex` 5-pair best-effort (D-02), `SessionRatePartial` extended for EUR/GBP/SGD (D-03), pair naming convention (D-04), strict six-code union (D-13/D-16), migration stamps `currency: "INR"` on cold load AND import (D-09/D-12)
- `.planning/phases/35-reporting-currency-selector/35-CONTEXT.md` — symbol+code option labels (D-04), reporting currency persisted on `settings.reportingCurrency`
- `.planning/phases/36-dashboard-dual-currency-display/36-CONTEXT.md` — “Rate unavailable” hint convention (D-04) — **not** reused on the Settings rates card per **D-03** here
- `.planning/phases/37-asset-pages-currency-fields-display/37-UI-SPEC.md` — `DualCurrencyAmount` typography baseline (referenced for visual consistency only; this phase does not add new dual-currency surfaces)

### Implementation anchors (existing code)

- `src/pages/SettingsPage.tsx` — current Live rates card + session override block (lines ~510–672); merge target for **D-04**
- `src/components/settings/SettingsGoldPricingCard.tsx` — read-only-by-default + Edit pattern reference for **D-05 / D-06**
- `src/components/settings/SettingsSilverPricingCard.tsx` — same pattern reference
- `src/context/LivePricesContext.tsx` — `usdInr`, `aedInr`, `eurInr`, `gbpInr`, `sgdInr`, `btcUsd`, `goldUsdPerOz`, `silverUsdPerOz`, `setSessionRates`, `clearSessionRates`, `forexLoading`, `forexError` (already extended in Phase 34)
- `src/lib/priceApi.ts` — `fetchForex` returns `{ usdInr, aedInr, eurInr, gbpInr, sgdInr }` (Phase 34 D-01)
- `src/types/data.ts` — `NetWorthPointSchema` (around line 189) — extension target for **D-09**; `SettingsSchema` already carries `reportingCurrency`
- `src/types/currency.ts` — six-code union for `Currency` (Phase 34 D-13)
- `src/pages/DashboardPage.tsx` — `handleRecordSnapshot` (around lines 371–397) — capture site for **D-11**
- `src/lib/wealthDataZip.ts` — `createWealthExportZip` / `extractDataJsonFromZip` (already round-trip safe; **D-13**)
- `src/context/AppDataContext.tsx` — `parseAppDataFromImport` migration chain entry point referenced in **D-13 / D-14**

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`SettingsGoldPricingCard` / `SettingsSilverPricingCard`** — exact UX template for the new combined Live rates card: compact read-only block + **Edit** pivot + per-block Save/Apply. Reuse layout, button affordances, error placement.
- **`useLivePrices` context** — already exposes all 5 FX pairs, BTC/USD, gold/silver USD per oz, plus `setSessionRates` / `clearSessionRates` covering the 6-pair session override surface. No context changes needed.
- **`parseFinancialInput`** (`src/lib/financials.ts`) — number parsing for the override inputs (existing convention).
- **`parseAppDataFromImport`** + the migration chain (`migrateLegacyBankAccounts → ensureNetWorthHistory → ensureOtherCommodities → ensureLiabilities → ensureImportUpliftRates → migrateV1ToV2 → migrateNeutralAmountKeys → safeParse`) already covers EXP-02 round-trip safety for `currency`.

### Established Patterns

- **Per-pair best-effort forex fetch** (Phase 34 D-02): one missing pair must not blank others — UI mirrors this with per-row `—` fallback.
- **Compact read-only ↔ Edit toggle** (gold/silver cards): visual scaffolding is repeated across Settings; new card should match.
- **Session-only override drops on successful live fetch** (`LivePricesContext` `runForexFetch`): copy in the merged card must keep this user-facing promise.
- **Snapshot writer recomputes from raw data**: `handleRecordSnapshot` already builds `totalInr` from `sumForNetWorth(totals)` minus `sumLiabilitiesInr(...)`; the new fields are read directly from `forexSnapshot` / settings — no recomputation, no schema-version migration.

### Integration Points

- **Settings tab strip** (`'pricing' | 'retirement' | 'rates' | 'data' | 'danger'`) — no new tab; the merged card replaces the two existing cards under the **`rates`** tab.
- **Dashboard snapshot button** — same callsite, additive payload only.
- **Export/import** — no Settings UX change; only test coverage to confirm round-trip.

</code_context>

<specifics>
## Specific Ideas

- User explicitly asked to mirror the **read-only + Edit** pattern from `SettingsGoldPricingCard` / `SettingsSilverPricingCard` for FX rates (rejecting per-row Edit in favor of one card-level Edit toggle).
- User chose to **separate** Gold / Silver from the Live rates card (clean tab boundary: FX + BTC on the **Live rates** tab, metals on the **Gold & Silver** tab) — explicit reduction in scope, not just reordering.
- User requested **safety for existing data** when extending snapshot schema → drove **additive-optional** decision (D-09) and **no chart change** (D-12).
- User granted Claude’s discretion on **rate-map breadth** (D-10) → wider eight-quote map chosen with all entries optional.

</specifics>

<deferred>
## Deferred Ideas

- **“Lock manual rate” persisted setting** for FX (mirroring `goldPricesLocked` / `silverPricesLocked`) — out-of-spec for SET-02 (“session-only”); revisit in a follow-up settings UX phase.
- **Per-row Edit affordance** on the merged Live rates card — rejected this phase; revisit if user feedback shows the card-level toggle is too coarse.
- **Historical chart re-rendering** in the current reporting currency (using each snapshot’s captured rates) — out of Phase 38 scope per **D-12**; new snapshot fields support this in a future UX phase.
- **Per-point currency annotation on the chart** when reporting currency varied across captures — also deferred behind D-12.
- **User-visible export note** (“currency fields included in export”) — not requested; export modal copy stays as-is.
- **Reporting currency mirror row in Settings page** (in addition to topbar selector) — user didn’t opt to discuss; defer.

### Reviewed Todos (not folded)

*(None — no todo matches surfaced for phase 38.)*

</deferred>

---

*Phase: 38-Settings, Snapshots & Export/Import*
*Context gathered: 2026-05-10*
