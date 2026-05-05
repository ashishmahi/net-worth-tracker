---
phase: 30
slug: bullion-import-uplift-settings-ux-disclosure
status: ready
shadcn_initialized: true
created: 2026-05-06
---

# Phase 30 — UI Design Contract

> Disclosure and **read-only ballpark** explanation for **import-style uplift** on Settings **Gold** and **Silver** pricing cards. Implements **BLN-04** per [`30-CONTEXT.md`](30-CONTEXT.md). **No** inputs/sliders for uplift rates (**D-01**).

## Design system

Inherits Phase **27** cards: **`Card`**, **`CardContent`**, muted **`text-sm text-muted-foreground`**. No new shadcn primitives.

## Shared content rules

| Element | Spec |
|--------|------|
| **Ballpark uplift (D-03)** | Read-only lines mentioning **~10%** gold and **~8%** silver as **illustrative defaults** — not bound to live `settings` decimals and not editable. |
| **One-liner math (D-05)** | Single short sentence: uplift is applied **after** combining international spot with USD→INR into **parity ₹/g** (executor chooses exact wording; must not contradict Phase **29** pipeline). |
| **Footnote disclaimer (D-04)** | **Per card**, **below** primary content (after summary strip and/or main helper lines, still inside `CardContent`): muted footnote that figures are **approximate** and **not legal, customs, or tax advice**. Same legal tone on gold and silver cards. |
| **No tuning UI (D-01)** | Do **not** add sliders, number inputs, or links that imply in-app editing of `goldImportUpliftRate` / `silverImportUpliftRate`. |

## Gold card additions

| Placement | Spec |
|-----------|------|
| Order | Prefer: title row unchanged → existing body (errors, loading, **Use live spot**, summary, form) → **new** explanatory block **above** footnote if vertical space allows; footnote **last** inside card. |
| Density | Do not exceed ~**6–8** extra lines total (one-liner + ballpark + footnote). |

## Silver card additions

Mirror gold: **same three conceptual layers** (ballpark → one-liner → footnote), silver-specific metal name only.

## A11y

- Footnotes remain normal paragraph text (`<p>`), readable without hover.
- No `aria-hidden` on disclaimer content.
