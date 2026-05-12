# Personal Wealth Tracker — Product Summary

## What It Is

A **local-only** web app for tracking personal net worth across multiple asset classes **and** standalone debts. Data stays in the browser (**`localStorage`**); there is **no** login, backend, or cloud sync in the shipped product.

**Headline net worth** uses **gross assets − standalone liabilities** (Liabilities page). Property with a mortgage contributes via **equity** (`agreement − outstanding loan`); milestones and guided paths adjust how property value is interpreted for builder / paid-off flows (see property UX phases).

**Multi-currency (v2.4):** Users choose a **reporting currency** (INR, USD, AED, EUR, GBP, SGD); holdings store **original currency + amount**; the UI converts for display using live FX where available. Detail: [`multi-currency.md`](multi-currency.md).

## Who It's For

Single user (personal use). Same machine / browser profile — backup is **export zip** (optional encryption), not cloud sync.

---

## Asset Classes Tracked

| Asset | How value is captured |
| ----- | --------------------- |
| **Gold** | Holdings by weight/karat; ₹/g from **manual** prices and/or **live spot–derived hints** (when unlocked) — see Settings Gold card |
| **Silver** | Grams × **live** XAG-derived ₹/g (with optional import uplift & lock, Settings Silver card) |
| **Other commodities** | Manual lines (standard commodity rows + optional dual currency where applicable) |
| **Mutual funds** | Platforms with current value (+ SIP where relevant); per-platform **currency** |
| **Stocks** | Current value per broker/platform; **currency** per platform |
| **Bitcoin** | Quantity × live BTC/USD → conversion to reporting currency |
| **Property** | Agreement, milestones, loan/equity; guided entry paths + save validation (v2.3); **currency** on record |
| **Bank savings** | Per-account **balance + currency** (INR, USD, AED, EUR, GBP, SGD) |
| **Retirement** | NPS / EPF balances (INR-centric fields) |
| **Standalone liabilities** | Loans **not** tied to a property row — CRUD on **Liabilities** page; optional **currency** |

---

## Key Features

- **Dashboard** — Reporting-currency headline and breakdown; dual-line display where holdings differ from reporting currency; debt-adjusted net worth; **Total Debt** / **debt-to-asset ratio** when relevant; **record snapshot** (stores INR plus optional reporting snapshot metadata for history accuracy).
- **Reporting currency** — Top bar selector; persists in settings; drives aggregates and labels across sections (v2.4).
- **Live prices** — BTC/USD; FX (**USD, AED, EUR, GBP, SGD** vs INR); silver/gold USD spot for commodity hints; failures surface **Rate unavailable** rather than silent zeros.
- **Settings → Live rates** — Single **Market & session rates** card (five INR crosses + BTC/USD); session-only manual overrides; Gold/Silver detail remains on **Gold & Silver** tab.
- **Liabilities** — Full CRUD; sidebar nav.
- **Net worth history** — Trend chart (INR **`totalInr`** series); new points may store **`reportingCurrency`** / **`rates`** for future UX (v2.4).
- **Data export/import** — **Zip** bundle with `data.json`; optional passphrase (**Web Crypto**); import validates through same pipeline as app boot.
- **Data reset** — Danger zone clears wealth JSON via validated initial state.
- **Routing** — Section URLs + mobile Home / sidebar **`NavLink`** behavior (**v2.1+**).
- **Deploy-friendly** — Static **`dist/`**, **`BASE_URL`** for GitHub Pages, Docker image optional (**v2.0**).

---

## What It Does NOT Do

- No user accounts or authentication  
- No cloud storage or multi-device sync  
- No native mobile app (responsive web only)  
- No regulated investment, tax, or legal advice (including bullion uplift **approximate** copy on Settings)  
- No PDF/CSV broker statement import (**seed** idea — not shipped)

---

## Milestone history (shipped)

| Version | What shipped |
| ------- | ------------- |
| **v1.0–v1.7** | Core tracker, UX polish, reset, history + chart, commodities, debt/liabilities, encrypted export path evolution, **`localStorage`** persistence |
| **v2.0** | Docker static image, **`BASE_URL`**, GitHub Actions CI + Pages |
| **v2.0.1** | Live **gold** spot + commodity pricing cards (**gold/silver**), silver sync |
| **v2.1** | **`react-router-dom`**, section routes, Home link |
| **v2.2** | Import-adjusted bullion uplift rates + disclosure copy |
| **v2.3** | Guided property paths, save-blocking validation, responsive property sheet |
| **v2.4** | Multi-currency reporting — per-record **`currency`**, selector, dual-currency UI, merged Settings FX card, snapshot metadata, zip **`currency`** parity |

Archived planning snapshots: `.planning/milestones/v*-ROADMAP.md` / `*-REQUIREMENTS.md`.
