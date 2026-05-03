# Phase 26: Live gold spot price - Context

**Gathered:** 2026-05-03  
**Status:** Ready for planning

**Note:** `gsd-sdk query init.phase-op "26"` returned `phase_found: false` (tooling did not parse the roadmap table). Phase **26** is validated manually against [`.planning/ROADMAP.md`](../../ROADMAP.md) and [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md).

<domain>
## Phase Boundary

Deliver **live gold spot USD per troy ounce** via **gold-api.com** (**XAU**), wire **`LivePricesContext`** with the **same fetch cadence and refetch behavior** as **silver**, expose **loading/error** parity, add **shared INR/gram derivation** for **24K / 22K / 18K**, and implement **read-only UI hints** (primary **Settings → Gold Prices**) plus tests. **Persisted `settings.goldPrices`** stays authoritative for saved numbers; **no automatic change** to **`sumGoldInr`** / dashboard semantics in this phase (see REQUIREMENTS future items).

</domain>

<decisions>
## Implementation Decisions

### API & module layout

- **D-01:** Use **`GET https://api.gold-api.com/price/XAU`** — response includes **`price`** (USD per troy oz), same shape family as XAG; validate **`price`** as finite positive `number` like `fetchSilverUsdPerOz`.
- **D-02:** Add **`fetchGoldUsdPerOz()`** to [`src/lib/priceApi.ts`](../../../../src/lib/priceApi.ts) next to silver; export **`GOLD_TTL_MS`** equal to **`SILVER_TTL_MS`** (and **`FOREX_TTL_MS`**).
- **D-03:** Add **`runGoldFetch`** mirroring **`runSilverFetch`**: refs, **`goldLoading`**, **`goldError`**, stale logic, mount + **`refetch`** + **`refetchStale`** + interval + visibility — **no session override** for gold spot (silver also has no session override).

### INR/gram math (CALC-01)

- **D-04:** Pure gold **₹/g** from spot: **`((goldUsdPerOz / TROY_OZ_TO_GRAMS) * usdInr)`** then **`roundCurrency`**.  
  **22K** = pure × **22/24**, **18K** = pure × **18/24**. Implement as small exported helpers (new file e.g. [`src/lib/goldLiveHints.ts`](../../../../src/lib/goldLiveHints.ts) or beside calcs — planner chooses) so tests stay isolated from React.

### Settings UX (UX-01, UX-02, UX-03)

- **D-05:** **Primary:** Under **Gold Prices** (`Card` block ~lines 411–476), for each karat field show a **muted read-only line** below the input: live **₹/g** when **`goldUsdPerOz`** and **`usdInr`** exist; **`—`** or short **Loading…** / error text aligned with [`src/pages/SettingsPage.tsx`](../../../../src/pages/SettingsPage.tsx) patterns (`Loader2`, `role="alert"` where appropriate).
- **D-06:** Extend **Live market rates** [`<dl>`](../../../../src/pages/SettingsPage.tsx) (~568–621) with a row **Gold (XAU) — USD per troy oz** showing **`goldUsdPerOz`**, loading spinner, **`goldError`** surfaced consistently with **`btcError`/`forexError`** (append to combined alert or separate line — match existing tone).
- **D-07 (symmetry):** Add **Silver (XAG) — USD per troy oz** row to the same **`dl`** using existing **`silverUsdPerOz`**, **`silverLoading`**, **`silverError`** — **no new fetch**, improves discoverability and makes gold/silver parity visible in Settings (**within phase**: wiring only).

### Gold page (optional repeat)

- **D-08:** **`GoldPage`**: If **`goldTotal === null`** due to missing **`goldPrices`**, keep existing **Set gold prices in Settings** CTA; when live hints could compute, show **one compact line** of live **₹/g** summary or pointer — **minimal**: repeat **one line** “Live spot (hint): 24K … / 22K … / 18K …” **or** link-style text “See live ₹/g hints in Settings” — **Claude discretion** favor **small numeric hints** when **`useLivePrices`** has data so users aren’t forced to navigate away.

### Apply-live / persistence

- **D-09:** Original intent was **no** silent overwrite (**UX-03**). Implementation may include **background sync** when prices are **unlocked** plus explicit **Use live spot** / Save flows when locked—see code. **Unified read-only + Edit Settings UX** for gold/silver is **Phase 27**.

### Claude's Discretion

- Exact Tailwind spacing / typography for hint lines; whether **`goldError`** is inline under Gold card vs only in Live rates alert; trivial **`GoldPage`** hint layout choice (**D-08**).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **SPOT-01–03**, **UX-01–03**, **CALC-01**, **TEST-01** (v2.0.1).
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — Phase **26** goal, success criteria, build order.
- [`.planning/PROJECT.md`](../../PROJECT.md) — Core value, constraints (local-only, INR primary).

### Prior phase (commodities / silver)

- [`.planning/milestones/v1.4-phases/12-commodities-data-net-worth/12-CONTEXT.md`](../../milestones/v1.4-phases/12-commodities-data-net-worth/12-CONTEXT.md) — Silver pricing model, gold untouched (**COM-06**), TTL bucket.

### Product / engineering notes

- [`CLAUDE.md`](../../../../CLAUDE.md) — Project conventions if referenced by repo.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- [`src/lib/priceApi.ts`](../../../../src/lib/priceApi.ts) — **`fetchSilverUsdPerOz`**, **`TROY_OZ_TO_GRAMS`**, **`SILVER_TTL_MS`** — copy pattern for XAU.
- [`src/context/LivePricesContext.tsx`](../../../../src/context/LivePricesContext.tsx) — **`runSilverFetch`**, **`refetch`**, interval + visibility — extend for gold.
- [`src/pages/SettingsPage.tsx`](../../../../src/pages/SettingsPage.tsx) — **Gold Prices** form block; **Live market rates** `dl` + error alert pattern.
- [`src/pages/CommoditiesPage.tsx`](../../../../src/pages/CommoditiesPage.tsx) — **`silverInrPerGram`** `useMemo` — reference for formula style.
- [`src/lib/dashboardCalcs.ts`](../../../../src/lib/dashboardCalcs.ts) — **`sumGoldInr`** unchanged this phase.

### Established Patterns

- Live metal quotes: central **`priceApi`** fetch; errors thrown → caught in provider → user-visible strings.
- Settings live rows: **`tabular-nums`**, **`Loader2`**, **`aria-live="polite"`** on **`dl`**.

### Integration Points

- [`src/main.tsx`](../../../../src/main.tsx) / app shell — **`LivePricesProvider`** already wraps app; extend context value + consumers (**SettingsPage**, **GoldPage**).

</code_context>

<specifics>
## Specific Ideas

- **Verified 2026-05-03:** `curl https://api.gold-api.com/price/XAU` returns JSON with **`price`**, **`symbol":"XAU"`** — same parsing approach as silver.

</specifics>

<deferred>
## Deferred Ideas

- **Settings layout:** compact **read-only + Edit** for gold and silver pricing parity — **Phase 27** ([`27-CONTEXT.md`](../27-settings-commodity-pricing-ux/27-CONTEXT.md)).
- **`sumGoldInr`** using live hints when **`goldPrices`** missing — changes net-worth semantics; explicitly deferred in [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md).

### Reviewed Todos (not folded)

- None (`todo.match-phase` returned 0).

</deferred>

---

*Phase: 26-live-gold-spot-price*  
*Context gathered: 2026-05-03*
