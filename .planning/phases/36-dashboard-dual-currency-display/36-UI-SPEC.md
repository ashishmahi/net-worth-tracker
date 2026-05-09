---
phase: 36
slug: dashboard-dual-currency-display
status: approved
created: 2026-05-09
---

# Phase 36 — UI Design Contract

> Visual contract for **Breakdown category rows** dual-currency stack only. Sources: **`36-CONTEXT.md`** (D-01–D-04), prototype **`design/net-worth-tracker-redesign-v2/`**, **`docs/multi-currency.md`** §3–§8, existing **`DashboardPage.tsx`** typography.

---

## Scope (surfaces)

| Surface | Dual stack | Notes |
|---------|------------|-------|
| Breakdown grid — category rows (`Gold` … `Retirement`) | **Yes** — when D-02 says show secondary | Preserves `%` column, skeleton, AED/silver exclusions copy |
| Hero — Net worth, Gross, Debt·asset strip | **No** — single line only (D-01) | Existing hero layout unchanged except bugfixes if uncovered |
| Breakdown — **Total Debt** footer row | **No** — reporting single line only (D-01) | Stays destructive styling; no `.val-local` |
| Allocation ring · chart | Out of phase | Typography / conversion unchanged by this contract |

---

## Layout — amount column (`D-03`)

- **Structure:** Vertical stack inside the existing right-hand amount cluster (`flex-col items-end`).
- **Primary:** `text-sm font-semibold tabular-nums` (matches current breakdown row dominant figure; ~14px effective).
- **Gap:** `gap-0` or `gap-px` between primary and secondary (~1px). Use `leading-tight` on the wrapper.
- **Secondary (when visible):** `text-[11px]` or `text-xs` (**~11px**), `font-normal`, `text-muted-foreground`, `tabular-nums`, below primary.

**Responsive:** Preserve secondary on narrow breakpoints (**`36-CONTEXT`** specifics — do not mirror prototype `PhoneDashboard` hiding `.val-local` unless a later phase changes this).

---

## Semantics tied to CONTEXT

| State | Primary | Secondary |
|-------|---------|-----------|
| All contributing records effectively `currency === reportingCurrency` | Reporting-formatted total | **Hidden** (**DSP-03**) |
| Exactly **one** distinct non-reporting stored code | Reporting total via INR hub (`formatRowReporting` path) | Muted original: **currency label + sum in that currency** per **D-03** formatter choice |
| **Two+** distinct non-reporting codes | Reporting primary only | **Hidden** (**D-02**) |
| `totals[key] === null` (existing skeleton semantics) | `—` + `AlertCircle` | Hidden |
| `formatRowReporting` degraded / **D-04** | **Rate unavailable** hint (`text-[11px]` muted) then fallback figure per **D-04** — no fabricated cross-rates | Only if compatible with readable single-original interpretation; else match existing degraded column |

Copy: **`Rate unavailable`** (exact string) for hint lines where conversion fails (**FX-03** alignment).

---

## Design system

Reuse **shadcn / Tailwind** tokens already on `DashboardPage` — **`text-muted-foreground`**, **`text-destructive`** for Total Debt row (unchanged). No new palette.

---

## Accessibility

- Breakdown rows remain **buttons** with existing `aria-label`.
- Amount stack is textual; ensure **muted secondary** maintains **≥ 4.5 : 1** against background in light theme (reuse muted token satisfies this).

---

## Registry safety

No new **`components.json`** blocks. Prefer **composition** inside `DashboardPage` or **`DualCurrencyBreakdownAmount`** sibling file **without** widening public shadcn registry.
