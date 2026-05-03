---
status: ready
phase: 27-settings-commodity-pricing-ux
source: [27-01-PLAN.md, 27-UI-SPEC.md]
started: 2026-05-03T00:00:00.000Z
updated: 2026-05-03T00:00:00.000Z
---

# Phase 27 — Manual UAT

Given / When / Then checks for commodity pricing UX (**read-only** + **Edit**, locked silver/gold, dashboard skeleton).

| # | Given | When | Then |
|---|-------|------|------|
| 1 | Live gold and silver feeds healthy (no errors), Settings opened | User views Gold and Silver cards without tapping Edit | **read-only** summaries show effective ₹/g (labels **Live** / **Saved** / **Saved (locked)**); inputs hidden |
| 2 | Same as (1) | User taps **Edit** on Gold or Silver | Form expands with inputs prefilled from effective snapshot; **Save** / **Cancel** visible |
| 3 | Gold or silver API returns error (or spot stays unavailable after load settles) | User opens Settings | Pricing inputs are **editable immediately** without pressing **Edit** first (`role="alert"` may show the error) |
| 4 | User edited Gold or Silver and tapped **Save** | Data persisted | `goldPricesLocked` or `silverPricesLocked` is **true**; net worth uses saved rates |
| 5 | User has **locked** prices and taps **Use live spot** (Gold or Silver) | Save completes | Corresponding `*PricesLocked` is **false**; stored ₹/g matches current live-derived values |
| 6 | User holds **only** standard **silver** in Commodities, `silverPricesLocked` + `silverInrPerGram` set | Dashboard loads while XAG is still loading | Net worth headline **does not** stay on skeleton solely because of `silverLoading` (locked rate is enough) |

## Summary

| total | passed | issues | pending |
|-------|--------|--------|---------|
| 6 | 0 | 0 | 6 |

*Update the table after manual runs.*

## Gaps

*None yet.*
