# Phase 02: Manual Asset Sections — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 02-manual-asset-sections
**Areas discussed:** Form interaction pattern, Gold price entry, MF & Stocks data shape, Settings scope

---

## Form Interaction Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Sheet/drawer overlay | Click 'Add' or a row to open Sheet from the right. Sheet is already installed. | ✓ |
| Inline form at bottom | Persistent add form below the list; editing replaces row inline. | |
| Click-to-edit inline | Clicking a row turns it into an editable row. | |

**User's choice:** Sheet/drawer overlay
**Notes:** Sheet component already installed from Phase 1.

---

## Gold Price Entry

| Option | Description | Selected |
|--------|-------------|----------|
| Per-item price/gram | Each gold entry has its own price field. | |
| Global setting per karat | One price per karat in Settings; all items of that karat use it. | ✓ |

**User's choice:** Global setting per karat in Settings
**Notes:** User clarified they don't want to track purchase price / cost basis — only today's current value. Gold items store karat + grams only. Settings holds current market rate per karat.

---

## MF & Stocks Data Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Per-platform totals | One entry per app/broker with current value. MF adds monthly SIP field. | ✓ |
| Per-fund / per-stock entries | Track individual funds or stocks within each platform. | |

**User's choice:** Per-platform totals
**Notes:** MF entry = platform name + current value + monthly SIP. Stocks entry = platform name + current value. Matches how user checks PaytmMoney / Zerodha.

---

## Settings Scope (Phase 2)

| Option | Description | Selected |
|--------|-------------|----------|
| Gold rates + Retirement assumptions | Gold ₹/g for 24K/22K/18K + target age + NPS % + EPF % | ✓ |
| Retirement assumptions only | Skip gold rates in Settings; price per gram on each gold item instead. | |
| Keep Settings stub | No settings fields yet; Settings fully built in Phase 3. | |

**User's choice:** Gold rates + Retirement assumptions
**Notes:** Gold rates needed because gold price is global (not per-item). Retirement assumptions needed to compute projected corpus.

---

## Bank Savings

| Option | Description | Selected |
|--------|-------------|----------|
| Account label + balance | Free-text label + INR balance | ✓ |
| Bank name + account type + balance | Structured fields with type dropdown | |

**User's choice:** Account label + balance (free text)

---

## Save Error Display

| Option | Description | Selected |
|--------|-------------|----------|
| Inline below Save button | Error text under Save in the Sheet. No extra library. | ✓ |
| Toast notification | Toast in corner — would require adding Sonner. | |

**User's choice:** Inline below Save button

---

## Claude's Discretion

- Section total display position (top vs. bottom)
- Whether to add a shadcn card component for section wrappers
- Exact field order and labels inside the Sheet forms
- SIP label wording

## Deferred Ideas

- AED bank accounts — Phase 3
- Bitcoin section — Phase 3
- Individual fund/stock tracking — not in v1
- Toast notifications — not needed for v1
