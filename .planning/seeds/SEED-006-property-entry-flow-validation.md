---
id: SEED-006
status: dormant
planted: "2026-05-05"
planted_during: Between milestones — v2.1 shipped (STATE.md); no active phase
trigger_when: A milestone improves **Property** onboarding UX (guided flows) or hardens **financial consistency checks** on save—not only display hints.
scope: Medium
---

# SEED-006: Easier property entry paths + validation for milestones and loans

## Why This Matters

Adding a property today opens **one sheet** that always exposes **agreement value**, **milestone table**, and **optional home loan** (`hasLiability`). That fits complex under-construction purchases but is heavy for **simple cases**: a **fully paid** resale has no milestones and often no property-attached loan UI clarity. New users must infer that **empty milestones + no loan** means fully paid. Stronger **guided modes** (fully paid vs builder milestone plan vs mortgaged) would shorten forms and reduce mistakes.

Validation is also incomplete: **`exceedAgreement`** warns when milestone totals exceed agreement but **does not block save** (`PropertyPage.tsx`). There are **no checks** that **outstanding loan** or **EMI** are plausible relative to **agreement value**, **paid-to-builder totals**, or each other—so bad data can reach `localStorage`.

## When to Surface

**Trigger:** Property UX refresh, **wizard / stepped form**, **data quality** initiative, or net-worth accuracy pass.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:

- Simplifying **add property** for the three mental models: **paid off**, **paying builder in stages**, **bank loan on property**.
- Tightening **Zod** or **client validation** for `PropertyItem` before persist.
- **Accessibility** and **mobile** for the property sheet (wide milestone table already scrolls).

## Scope Estimate

**Medium** — mostly `PropertyPage` + copy; optional small **schema** extensions if modes need explicit `entryKind` (else infer from empty milestones/flags). Validation rules need product decisions (e.g. is **outstanding ≤ agreement** always required, or allow LTV &gt; 100% for edge cases?).

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/types/data.ts` — `PropertyItemSchema`: `agreementInr`, `milestones[]`, `hasLiability`, `outstandingLoanInr?`, `emiInr?`.
- `src/pages/PropertyPage.tsx` — add/edit sheet: `exceedAgreement` (warning only), `sumPaidToBuilder` / `balanceDueToBuilder` for list row copy; **Save** does not gate on `exceedAgreement`.
- `src/lib/dashboardCalcs.ts` — `sumPropertyInr` uses `agreementInr`, `outstandingLoanInr`, `hasLiability` for **equity**-style roll-up.
- `src/pages/PropertyPage.tsx` lines 400–404 — duplicate message path for milestone total vs agreement.

## Notes

- **Validation examples** to define at build time (all subject to product sign-off):
  - **Milestones:** total milestone amounts **≤ agreement**; each milestone **≥ 0**; **sum of paid** ≤ **agreement**; optionally each row amount ≤ **remaining** agreement.
  - **Loan:** if `hasLiability`, **outstanding** > 0; sanity: **outstanding** not above **agreement** (or stricter: not above **equity** if equated to “mortgage on this asset”)—**conflicts** with real-world over-leverage should be **warn** vs **block**.
  - **EMI:** > 0 when loan present; **EMI < outstanding** as a weak sanity check; consider **EMI × n** hints vs tenure only as **non-blocking** info.
- **“Fully paid” default** could mean: one-tap **agreement = value**, **no milestones**, **no loan**, or a single “paid in full” implicit milestone—choose the least surprising for list + dashboard math.
