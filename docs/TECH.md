# Personal Wealth Tracker — Technical Overview

## Architecture

**Type:** Local-only single-page app (**React 18 + Vite 5**). **No backend.** All wealth data persists in the browser via **`localStorage`** (`AppDataContext`). External HTTP is used only for **live market quotes** (optional paths allow session-only manual overrides).

```
Browser (React SPA)
      │
      ├── localStorage  ──►  key `wealth-tracker-data`  (JSON, Zod-validated `AppData`)
      │
      └── fetch()  ──►  External price APIs (CoinGecko, open.er-api.com, gold-api.com)
```

**Routing:** `react-router-dom` with **`basename`** from **`import.meta.env.BASE_URL`** (GitHub Pages–safe). Canonical paths live in `src/lib/sectionRoutes.ts`.

**Production build:** `npm run build` emits static **`dist/`** (Docker/nginx or GitHub Pages). CI runs tests + build (see `.github/workflows/`).

---

## Persistence

| Aspect | Detail |
|--------|--------|
| **Storage key** | `wealth-tracker-data` |
| **Format** | Single JSON object validated by **`DataSchema`** in `src/types/data.ts` |
| **Schema version** | **`version: 2`** — cold load runs migrations (stamps **`reportingCurrency`**, per-record **`currency`**, bank balance shape, etc.) |
| **Theme** | Separate key for dark/light (not part of wealth JSON) |

There is **no** dev-only `/api/data` disk plugin in the current tree; persistence is **not** `data.json` at repo root.

---

## Data model (summary)

- **`settings`** — retirement assumptions, gold/silver pricing locks and uplift rates, optional **`reportingCurrency`** (defaults handled at runtime).
- **`assets`** / **`liabilities`** — record types carry optional **`currency`** (**INR | USD | AED | EUR | GBP | SGD**); bank accounts require **`currency`** + **`balance`**.
- **`netWorthHistory`** — points include **`recordedAt`**, **`totalInr`** (chart + compatibility), and optional **`reportingCurrency`**, **`totalReporting`**, **`rates`** (partial FX/BTC/metal snapshot for portability).

Full Zod definitions: `src/types/data.ts`. Product-facing behavior: [`multi-currency.md`](multi-currency.md).

---

## External price APIs

All remote quotes go through **`src/lib/priceApi.ts`** (`fetchForex`, `fetchBtcUsd`, silver/gold spot helpers). No API keys.

| Data | Source | Notes |
|------|--------|--------|
| BTC/USD | CoinGecko public | `BTC_TTL_MS` ≈ 5 min |
| USD→INR, AED/EUR/GBP/SGD legs | open.er-api.com `/v6/latest/USD` | INR/AED/EUR/GBP/SGD pairs derived per **`ForexRates`**; EUR/GBP/SGD may be **`null`** if missing (**best-effort**) |
| Silver XAG/USD, Gold XAU/USD | gold-api.com | Used for spot-derived ₹/g hints and snapshot **`rates`** |

**Session overrides:** UI can set temporary FX/BTC legs (**memory-only** until live fetch succeeds — see Settings **Market & session rates**).

---

## Reporting currency & conversion

- **`src/lib/currencyConversion.ts`** — **`toReportingCurrency(amount, from, to, snapshot)`** returns **`{ ok, value }`** or failure when a leg is missing (**“Rate unavailable”** in UI).
- **`DualCurrencyAmount`** and dashboard/category helpers show **primary reporting value** plus **muted original** when record currency differs.
- INR remains the internal hub for many aggregates; headline snapshots still write **`totalInr`** for the existing chart.

---

## Net worth & debt

- **`src/lib/dashboardCalcs.ts`** — category totals, gross assets, metals uplift hints.
- **`src/lib/liabilityCalcs.ts`** — **`sumLiabilitiesInr`**, **`calcNetWorth`**, **`sumAllDebtInr`**, **`debtToAssetRatio`** (same semantics as product docs: standalone liabilities vs property-linked debt).

Rounding uses **`roundCurrency`** / shared helpers to limit float drift.

---

## Backup & import

- **Zip export/import** — `src/lib/wealthDataZip.ts` builds **`wealth-tracker-YYYY-MM-DD.zip`** containing **`data.json`**; import validates through the same **`parseAppDataFromImport`** path as boot.
- **Optional AES** — Web Crypto helpers in **`src/lib/cryptoUtils.ts`** when passphrase flows are used on export/import.

---

## Key source locations

| Area | Path |
|------|------|
| Types / schema | `src/types/data.ts`, `src/types/currency.ts` |
| App state | `src/context/AppDataContext.tsx` |
| Live prices | `src/context/LivePricesContext.tsx`, `src/lib/priceApi.ts` |
| Dashboard | `src/pages/DashboardPage.tsx` |
| Settings | `src/pages/SettingsPage.tsx`, `src/components/settings/*` |

---

## Running & tooling

```bash
npm run dev      # Vite dev server (default http://localhost:5173)
npm run build    # production bundle → dist/
npm run preview  # serve dist locally
npm test         # Vitest
```

**Docker:** `Dockerfile` + `docker/default.conf` serve **`dist/`** as static SPA.

**Config:** `vite.config.ts` reads **`BASE_URL`** for asset paths (e.g. GitHub Project Pages).

---

## Optional design branch

A **Studio** visual/IA exploration may live on **`feature/studio-design-redesign`** — see [`STUDIO-UI-REDESIGN.md`](STUDIO-UI-REDESIGN.md) if present.
