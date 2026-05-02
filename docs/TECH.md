# Personal Wealth Tracker — Technical Overview

## Architecture

**Type:** Local-only single-page web app (SPA). No backend server. Runs entirely on `localhost` via the Vite dev server.

```
Browser (React SPA)
      │
      ├── GET/POST /api/data  ──►  Vite dev-server plugin  ──►  data.json  (disk)
      │
      └── fetch()  ──►  External price APIs (internet)
```

---

## Local Data API

The app exposes a minimal two-endpoint REST API via a custom Vite plugin (`plugins/dataPlugin.ts`). This only runs during `npm run dev` — there is no production server.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/data` | Returns the full `data.json` file as JSON |
| `POST` | `/api/data` | Accepts a JSON body and writes it to `data.json` on disk |

**Read flow:** App loads → `GET /api/data` → parse + validate → render  
**Write flow:** User edits data → app builds updated object → `POST /api/data` with full JSON body → overwrite `data.json`

There is no partial update / PATCH. Every save sends the complete data object.

---

## Data File

All user data is stored in `data.json` at the project root. Schema version is `1`.

**Top-level shape:**
```json
{
  "version": 1,
  "settings": { ... },
  "assets": {
    "gold": { ... },
    "otherCommodities": { ... },
    "mutualFunds": { ... },
    "stocks": { ... },
    "bitcoin": { ... },
    "property": { ... },
    "bankSavings": { ... },
    "retirement": { ... }
  },
  "liabilities": [ { "id": "...", "label": "...", "loanType": "home", "outstandingInr": 0, "lender": "...", "emiInr": 0, "createdAt": "...", "updatedAt": "..." } ],
  "netWorthHistory": [ { "recordedAt": "...", "totalInr": 0 } ]
}
```

`liabilities` is a **root-level** array (peer of `assets`), introduced in **v1.5**. Older files without it are migrated to `liabilities: []` on load.

All persisted rows carry `id` (UUID v4), `createdAt`, and `updatedAt` ISO timestamps where applicable.  
Schema is validated on load using Zod (`src/types/data.ts`). Snapshot points (`totalInr`) allow negative values when debt exceeds assets.

---

## External Price APIs

All external HTTP calls go through `src/lib/priceApi.ts`. No API keys required.

| Data | API | URL | Cache TTL |
|---|---|---|---|
| BTC/USD | CoinGecko (public) | `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd` | 5 minutes |
| USD/INR + AED/INR | open.er-api.com | `https://open.er-api.com/v6/latest/USD` | 1 hour |
| Silver (XAG/USD) | gold-api.com | `https://api.gold-api.com/price/XAG` | 1 hour |

**AED/INR derivation:** `rates.INR / rates.AED` (both on USD base from the same forex response).  
**Silver INR/gram:** `(silverUsdPerOz / TROY_OZ_TO_GRAMS) × usdInr` where `TROY_OZ_TO_GRAMS = 31.1035`.

If any fetch fails, the app surfaces an error and lets the user continue with manual overrides.

---

## Net Worth & Debt Calculation

Asset category totals and **gross assets** are computed at render time in `src/lib/dashboardCalcs.ts` (`calcCategoryTotals`, `sumForNetWorth`). Those totals are **not** persisted.

Standalone debt math lives in `src/lib/liabilityCalcs.ts`:

| Function | Role |
|----------|------|
| `sumLiabilitiesInr(data)` | Sum of standalone loan outstanding balances |
| `calcNetWorth(grossAssets, liabilitiesTotal)` | Gross assets − standalone liabilities (rounded); headline net worth and new snapshots use this |
| `sumAllDebtInr(data)` | Property `outstandingLoanInr` (where liability on) **plus** standalone liabilities — used for **Total Debt** on the dashboard only |
| `debtToAssetRatio(totalDebt, grossAssets)` | Dashboard debt-to-asset line; returns **0** when `grossAssets === 0` |

Gross assets include each property as **equity** (`agreementInr − outstandingLoanInr` when mortgaged). **Standalone** entries in `liabilities[]` are subtracted on the headline net worth line via `calcNetWorth` / `sumLiabilitiesInr` (they are not part of property rows).

- All arithmetic is rounded to 2 decimal places after every multiplication to avoid floating-point drift (`roundCurrency` / helpers).
- Categories that depend on a live price (gold, bitcoin, silver) return `null` until the price is available, shown as "—" in the UI.
- Bank balances in AED are converted to INR using the live AED/INR rate before summing.
- Dashboard **percentage column** uses **gross assets** as denominator so shares sum to ~100%; headline net worth still reflects liabilities.

**UI:** `src/pages/DashboardPage.tsx` wires the helpers above; `src/pages/LiabilitiesPage.tsx` manages `liabilities`; property lender/EMI fields live under `src/pages/PropertyPage.tsx`.

---

## Running the App

```bash
npm run dev     # start local dev server (default: http://localhost:5173)
npm test        # run unit tests (Vitest)
```

No build step or deployment. The app is dev-server-only by design.
