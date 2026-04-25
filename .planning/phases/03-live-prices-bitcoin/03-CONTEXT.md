# Phase 03: Live Prices + Bitcoin — Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **live** BTC/USD, USD/INR, and AED/INR (via a **`useLivePrices()`** hook backed by a **central fetch module**), wire the **Bitcoin** section end-to-end, and extend **Bank Savings** with **AED accounts** (native AED balance → INR via live AED/INR). No Property, no Dashboard, no change to gold manual pricing model.

</domain>

<decisions>
## Implementation Decisions

### APIs, hook, and caching
- **D-01:** Use **free public HTTP APIs** for prices. Implementation may pick **documented equivalents** if a chosen endpoint fails (rate limits, CORS, downtime) — no requirement to stay on one vendor forever, but choices must be documented in code and RESEARCH/plan.
- **D-02:** **TTL:** BTC/USD **5 minutes**; **forex (USD/INR, AED/INR) ~1 hour** — tighter than the original CLAUDE.md forex TTL so INR conversions stay fresher.
- **D-03:** **Single fetch surface:** a dedicated module (e.g. `priceApi.ts` / `src/lib/priceApi.ts`) consumed by **`useLivePrices()`** — **no ad-hoc `fetch` in page components** (aligns with CLAUDE.md intent).
- **D-04:** **When APIs fail:** show a **clear user-visible error**. Offer **session-only manual rates** (see Settings) — **not persisted** to `data.json`. When APIs succeed again, **automatically use live data** and drop reliance on session manual values.

### Settings and live rates
- **D-05:** How prominently to show **read-only live** USD/INR and AED/INR (and BTC/USD when relevant) in Settings — **Claude’s discretion** (prefer a sensible default: enough visibility to trust conversions, not noisy).
- **D-06:** **Session-only manual override fields live in Settings** (or a clearly labeled subsection) for the rates needed when fetches fail — at minimum **USD/INR** and **AED/INR**; include **BTC/USD** session override if the BTC feed fails so the Bitcoin page can still show computed values for the session.

### Bitcoin page
- **D-07:** **Inline editing** like Retirement — **not** Sheet-based (single `quantity` entity).
- **D-08:** When live data is available, show **BTC quantity**, **INR value of holding**, and **explicit USD value of holding** (BTC/USD rate may appear as supporting text if useful).

### Loading, staleness, and refresh
- **D-09:** First-load and refetch: **spinner or short loading text** adjacent to affected values — **no new UI dependencies** for skeleton systems.
- **D-10:** After initial success, **when to re-fetch** past TTL — **Claude’s discretion**, biased toward **low API noise** (e.g. focus/navigation triggers + TTL, not aggressive always-on polling unless the hook design clearly benefits).

### AED bank accounts
- **D-11:** Each account: **`currency`: `INR` | `AED`** plus **balance in native units** (INR amount or AED amount). **INR → INR display** unchanged in meaning; **AED → INR** using **live AED/INR** (with session manual fallback chain per D-04/D-06). Migrate existing rows as **`INR`** with the same numeric balance as today’s `balanceInr`.
- **D-12:** **Same Sheet** add/edit pattern as Phase 02 list sections (**D-01**): currency selector (default **INR** for new rows) + balance in native currency.

### Claude's Discretion
- Exact Settings layout for live vs manual-session blocks (D-05).
- Re-fetch scheduling details (D-10).
- Minor copy for errors and loading strings.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap and product
- `.planning/ROADMAP.md` — Phase 03 goal and scope
- `.planning/PROJECT.md` — Active requirements (Bitcoin live prices, AED accounts, Settings forex)

### Prior phase decisions
- `.planning/phases/02-manual-asset-sections/02-CONTEXT.md` — Sheet pattern, `useAppData`, inline errors, no Phase-2 live prices

### Engineering conventions
- `CLAUDE.md` — Stack notes, historical TTL guidance (forex overridden by D-02 for this phase), no computed totals in JSON, rounding/input rules

### Integration points
- `src/types/data.ts` — `BitcoinSchema`, `BankSavingsSchema`, `SettingsSchema` extension points
- `src/context/AppDataContext.tsx` — persistence path for schema migrations
- `src/lib/financials.ts` — `parseFinancialInput`, `roundCurrency` for native balances
- `src/pages/BitcoinPage.tsx` — stub to replace
- `src/pages/BankSavingsPage.tsx` — INR-only Sheet flow to extend for AED

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **Bank Savings:** Sheet-based list from `BankSavingsPage.tsx` — extend form schema for currency + native balance.
- **`BitcoinSchema`:** already has `quantity` — page + live INR/USD display layer missing.
- **`SettingsSchema`:** `.passthrough()` — can add optional persisted fields later; **session-only manual rates stay out of JSON** per decisions.

### Established patterns
- **Phase 02:** `useAppData` / `saveData`, inline save errors, `parseFinancialInput` + `roundCurrency` for money fields.
- **Retirement-style inline** for single-entity sections — mirror for Bitcoin per D-07.

### Integration points
- New **`useLivePrices()`** (and `priceApi`) should feed **BitcoinPage**, **BankSavingsPage** (AED rows), and **Settings** (display + session manual UI per D-05/D-06).

</code_context>

<specifics>
## Specific Ideas

- User is OK with **hourly forex** refresh and **flexible free API** choices with graceful degradation.
- **Session-only** manual rates: acceptable to lose on full reload — keeps `data.json` free of stale “fake live” numbers.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 03 scope.

</deferred>

---

*Phase: 03-live-prices-bitcoin*
*Context gathered: 2026-04-25*
