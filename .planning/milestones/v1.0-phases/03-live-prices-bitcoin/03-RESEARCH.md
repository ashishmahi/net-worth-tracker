# Phase 03 — Technical Research: Live Prices + Bitcoin

**Phase:** 03 — Live Prices + Bitcoin  
**Question:** What do we need to know to plan this phase well?  
**Sources:** `03-CONTEXT.md`, `CLAUDE.md`, `src/types/data.ts`, public API docs (high level)

---

## 1. API options (D-01, D-02, D-03)

### 1.1 Bitcoin (BTC/USD)

- **Primary:** [CoinGecko](https://www.coingecko.com/en/api) public API `GET /api/v3/simple/price?ids=bitcoin&vs_currencies=usd` — one pair, CORS from browser, rate limits on free tier (documented). Returns `{ bitcoin: { usd: number } }`.
- **Alternatives:** CoinCap `/v2/assets/bitcoin` (if CoinGecko fails) — same decision: document in `priceApi` module comment block.

**TTL (D-02):** 5 minutes for BTC/USD in client-side cache (module-level or hook-managed timestamps).

### 1.2 FX: USD/INR and AED/INR

- ** approach A — one USD base call:** [open.er-api.com](https://www.exchangerate-api.com) `GET https://open.er-api.com/v6/latest/USD` (or v6) returns `rates.INR`, `rates.AED` (units of each currency per 1 USD). **AED/INR** = `rates.INR / rates.AED` (INR per 1 AED).
- ** approach B — Frankfurter** — EUR base; requires cross via USD; more calls. Prefer a single USD-base JSON for this app.
- **CORS:** Verify at implementation time; if blocked, Vite `server.proxy` is acceptable for *dev* but production is static — prefer browser-CORS-free endpoints. `open.er-api.com` is commonly used from browsers; re-verify during implementation.

**TTL (D-02):** ~1 hour for forex pairs in cache (tighter than CLAUDE.md 24h; aligns with 03-CONTEXT).

### 1.3 Central module (D-03)

- **Single file** `src/lib/priceApi.ts` (or `.js` if project stays JS in places — current codebase is TS) exporting:
  - `fetchBtcUsd(): Promise<…>`
  - `fetchForex(): Promise<{ usdInr: number; aedInr: number }>` (or one combined `fetchLivePrices()` that returns all three numbers + optional `fetchedAt`).
- **No `fetch` in page components** — only in this module and/or the hook that wraps it.
- **Document chosen base URLs and fallbacks** in a file header comment or named constants at top of `priceApi.ts`.

### 1.4 Failure and session manual rates (D-04, D-06)

- On network/parse failure, surfaces must receive `error: string` (or `null` success) so UI can show a clear message.
- **Session-only manual overrides** live in **React state** (Context recommended so Settings + Bitcoin + Bank share overrides). **Not** written to `data.json`.
- When live fetches succeed again, **drop** session overrides (per D-04) and use live data — implement in the provider, not in each page.

---

## 2. Hook and provider shape

- **`useLivePrices()`** should expose at minimum:
  - Live numbers: `btcUsd`, `usdInr`, `aedInr` (or `null` when unknown).
  - **Effective** values after session overrides: e.g. `effectiveBtcUsd` used for Bitcoin line items.
  - `loading`, `error`, `lastFetched` (or per-channel stale flags), `refetch` (user-trigger or focus — D-10 discretion).
- **Provider placement:** Wrap inside `AppDataProvider` (needs no app data) but above `App` in `main.tsx` so all pages can consume:  
  `AppDataProvider` → `LivePricesProvider` → `App`.

---

## 3. Data model — Bank (D-11, D-12)

- **Replace** `balanceInr`-only with `currency: 'INR' | 'AED'` and **native** `balance: number` (non-negative).
- **Migration:** on load, map existing `{ balanceInr }` → `{ currency: 'INR', balance: balanceInr }` before/after `safeParse`, consistent with `AppDataContext` patterns from Phase 2.
- **Section total:** sum of **INR equivalents** (INR rows: `balance`; AED rows: `balance * aedInr` with `roundCurrency` after multiply).

---

## 4. Bitcoin page (D-07, D-08)

- Mirror **RetirementPage** pattern: RHF, string fields, `parseFinancialInput` for quantity, `saveData` for `data.assets.bitcoin`.
- **Display:** quantity, INR value = qty × `btcUsd` × (1 / usd? ) — use **INR = qty × btc_usd * (1/inr per usd)?**  
  - Correct: `inrValue = quantity * btcUsd * (1) / 1` if `btcUsd` is USD per BTC and we have `usdInr` then `inr = qty * btcUsd * usdInr`.
  - **USD value of holding** = `quantity * btcUsd` (D-08).

---

## 5. Settings UI (D-05, D-06)

- New **read-only** block: show live (or last known) USD/INR, AED/INR, BTC/USD when available.
- New **“Session only — when feeds fail”** inputs: at least USD/INR, AED/INR, and BTC/USD; stored only in `LivePricesContext` (or hook state), cleared on success path.

---

## 6. Loading UI (D-09)

- Spinner (existing `lucide-react` Loader2) or short `text-sm text-muted-foreground` “Loading rates…” next to values — no new design-system dependencies.

---

## 7. Pitfalls

- **Zod + forms:** keep money fields as `z.string()` in RHF, parse on submit (Phase 2 pattern).
- **Rounding:** `roundCurrency` after every multiply for INR/AED conversion display and totals.
- **StrictMode double-fetch in dev:** acceptable; idempotent fetches; optional dedupe in module.

---

## Validation Architecture (Nyquist — Dimension 8)

| Dimension | How we will sample |
|-----------|--------------------|
| Correctness of conversion math | Unit-test pure helpers in `src/lib/` (e.g. `aedToInr`, `btcToInrDisplay`) with fixed rates; `npx tsc --noEmit` on every plan wave |
| API surface | No `fetch` in `src/pages/` (grep check in verification) |
| Schema migration | `data` fixture with pre-migration `bankSavings` migrates in memory without crash |

**Wave 0:** This repo may not have Vitest yet; Phase 3 plans should either add `vitest` + one test file in Wave 1 for pure math **or** document manual verification in `03-VALIDATION.md` and rely on `tsc` + grep acceptance criteria. **Recommendation:** add minimal Vitest in Plan 01 for pure functions only (optional — executor choice per plan `acceptance_criteria`).

---

## RESEARCH COMPLETE

Further implementation detail belongs in `03-*-PLAN.md` tasks. Document exact URLs and any proxy config in `priceApi.ts` at implementation time.
