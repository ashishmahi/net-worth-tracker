# Phase 35: Reporting Currency Selector - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 35-Reporting Currency Selector
**Areas discussed:** Mobile top bar, RC-02 scope, Desktop placement, Dropdown labels & a11y

---

## Mobile top bar

| Option | Description | Selected |
|--------|-------------|----------|
| Chip opening picker | Match docs §7 compact chip | |
| Inline `<select>` on MobileTopBar | Same 6 options; simpler | ✓ (final) |
| Desktop-only selector Phase 35 | Mobile via Settings later | |

**User's choice:** Initially **chip**; after placement discussion, user selected **native `<select>` on both desktop and mobile** for consistency (overriding chip for Phase 35).

**Notes:** Popover was chosen for chip follow-up, then superseded by dual-pattern question — **no chip** ships in Phase 35.

---

## RC-02 recalculation scope

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard route only | Dashboard headline + breakdown | ✓ |
| Every page with converted totals | Broader Phase 35 surface | |
| App-wide all numeric totals | Broadest | |

**User's choice:** Dashboard route only for Phase 35 instant-recalc requirement.

---

## Desktop placement

| Option | Description | Selected |
|--------|-------------|----------|
| Leftmost (before Live prices) | Most prominent | |
| After Live prices, before USD/INR | User lens then quotes | ✓ |
| Rightmost after BTC | Market chips grouped | |

**User's choice:** After “Live prices” pill, before USD/INR.

---

## Dropdown labels & a11y

| Option | Description | Selected |
|--------|-------------|----------|
| Symbol + code | Per docs/multi-currency.md | ✓ |
| ISO code only | Denser | |
| Symbol only + tooltip | Narrowest | |

**Control type:**

| Option | Description | Selected |
|--------|-------------|----------|
| Native `<select>` | Built-in a11y | ✓ |
| shadcn/Radix Select | Styled | |
| You decide | — | |

**User's choice:** Symbol + code labels; **native `<select>`**.

---

## Claude's Discretion

None — all major choices were explicit.

## Deferred Ideas

- Mobile **chip / badge** UX per docs §7 — deferred to a future UX milestone; Phase 35 ships **`<select>`** on mobile instead.
