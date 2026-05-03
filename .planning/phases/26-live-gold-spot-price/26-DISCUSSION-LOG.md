# Phase 26: Live gold spot price - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in **26-CONTEXT.md**.

**Date:** 2026-05-03  
**Phase:** 26 — Live gold spot price  
**Areas discussed:** API & TTL parity, LivePricesContext wiring, Settings/Gold UX, Settings Live rates rows (XAU + XAG symmetry), math helpers, out-of-scope apply-live + sumGoldInr

---

## Session mode

Interactive **`AskUserQuestion`** / TUI was not available in this environment. Gray areas were resolved using:

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) (locked acceptance criteria)
- Code scout: **`LivePricesContext`**, **`priceApi`**, **`SettingsPage`**, **`CommoditiesPage`**, Phase **12** context
- Live check: **`https://api.gold-api.com/price/XAU`** response shape

---

## API & gold-api.com (XAU)

| Option | Description | Selected |
|--------|-------------|----------|
| XAU on gold-api.com | Same host/path pattern as XAG | ✓ |
| Alternate metals API | New vendor |  |

**User's choice:** Align with existing **`fetchSilverUsdPerOz`** — **XAU** endpoint verified.

**Notes:** **`GOLD_TTL_MS` = `SILVER_TTL_MS`**.

---

## LivePricesContext parity

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror silver channel | Separate loading/error/refetch | ✓ |
| Session override for gold | Like BTC/forex manual entry |  |

**User's choice:** **Mirror silver** — no **`SessionRatePartial`** extension for gold.

---

## Settings UX — hints placement

| Option | Description | Selected |
|--------|-------------|----------|
| Under each karat input | Read-only ₹/g hint lines | ✓ |
| Single summary only | One combined strip |  |

**User's choice:** **Per-karat** hints under **Gold Prices** card (primary per REQ).

---

## Settings — Live market rates `dl`

| Option | Description | Selected |
|--------|-------------|----------|
| Add XAU (+ XAG) USD/oz rows | Metals visible next to BTC/forex | ✓ |
| Gold hints only in Gold card | Smaller surface |  |

**User's choice:** Add **Gold (XAU)** and **Silver (XAG)** USD/troy oz rows for symmetry (silver fetch already exists).

---

## Apply live / dashboard

| Option | Description | Selected |
|--------|-------------|----------|
| Hints only | No persistence change | ✓ |
| Apply-live button | Writes **`goldPrices`** |  |

**User's choice:** **Hints only**; **`sumGoldInr`** unchanged (**REQ** future item).

---

## Claude's Discretion

Minor layout/styling for hint text and error placement under **Gold Prices** card.

## Deferred Ideas

- One-click **Apply live spot** to saved **`goldPrices`**
- **`sumGoldInr`** fallback to live when **`goldPrices`** absent
