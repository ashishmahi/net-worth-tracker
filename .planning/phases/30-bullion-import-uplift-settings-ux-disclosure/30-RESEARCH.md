# Phase 30 — Research

**Phase:** Bullion import uplift — settings UX & disclosure  
**Date:** 2026-05-06

## Summary

Phase **30** is **copy + layout** on existing **`SettingsGoldPricingCard`** and **`SettingsSilverPricingCard`**. Uplift math and persistence live in Phase **29**; UI must explain ballpark defaults (~10% / ~8%), parity×forex baseline, and legal disclaimers **without** exposing rate editors ([`30-CONTEXT.md`](30-CONTEXT.md)).

## Findings

1. **Single source of truth for strings** — Use a small **`src/lib/`** module exporting disclaimer + educational strings so gold/silver cards cannot drift ([`30-UI-SPEC.md`](30-UI-SPEC.md)).
2. **Layout** — Append disclosure block **inside** existing **`CardContent`** after dynamic sections so loading/error flows stay unchanged; footnote last.
3. **Testing** — Prefer **`grep`** / **`npm test`** on unchanged suites plus optional lightweight test that imports disclosure constants (optional); no new visual regression infra required.
4. **Requirements hygiene** — [`30-CONTEXT.md`](30-CONTEXT.md) **D-02**: optionally align [`REQUIREMENTS.md`](../../REQUIREMENTS.md) **BLN-04** or roadmap success criteria if “tunable from Settings” conflicts with **no tuning UI** — product/doc task, not blocking code.

## Validation Architecture

| Dimension | Approach |
|-----------|----------|
| **Automated** | `npm test` (full suite after edits); `npx tsc -b`; grep acceptance strings in `src/lib/*Disclosure*` or equivalent. |
| **Manual / UAT** | Open Settings → verify gold and silver cards show ballpark line, one-liner, footnote; confirm **no** uplift inputs. |
| **Regression** | Existing Phase **27** behaviors (Edit, healthy feed read-only, Use live spot) unchanged aside from added vertical space. |

This section satisfies Nyquist validation planning for downstream **`VALIDATION.md`**.

## RESEARCH COMPLETE
