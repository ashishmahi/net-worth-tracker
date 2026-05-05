---
id: SEED-003
status: dormant
planted: "2026-05-05"
planted_during: Between milestones — v2.1 shipped (STATE.md); no active phase
trigger_when: A milestone focused on faster portfolio onboarding, mutual fund / equity data entry, or “import from file” beyond the existing full `data.json` backup flow.
scope: Large
---

# SEED-003: Import mutual fund and stock positions from online statements (e.g. CAMS, portfolio reports)

## Why This Matters

**Mutual funds** and **stocks** are edited as hand-maintained **platform rows** (name, current value, optional SIP for MFs). That is fine for small portfolios but does not scale when users already have **consolidated statements** (CAMS, KFintech, broker PDFs/CSVs, CDSL/NSDL CAS-style exports). Letting users pull holdings from those artifacts would cut friction and errors compared to retyping values—especially after large market moves when “current value” drifts.

## When to Surface

**Trigger:** Work on **MF or equities UX**, **bulk entry**, **CSV/PDF ingestion**, or **partner-file formats** for Indian portfolios.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:

- Reducing manual entry for **Mutual Funds** or **Stocks** sections.
- Adding **per-section import** (distinct from Settings → full **AppData** JSON import).
- Explicitly supporting **Indian registrar / broker** artifacts (CAMS, Karvy historical, broker trade books).

## Scope Estimate

**Large** — statement layouts **change by provider and year**; PDF parsing is brittle; privacy-sensitive files stay **local** (aligns with app ethos) but parsing + mapping + conflict UI (merge vs replace platforms) is a real product surface. A **phased** approach might start with **one** well-defined CSV export before PDF.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/types/data.ts` — `MutualFundsSchema` / `StocksSchema`: **platforms** with `name`, `currentValue`, `monthlySip` (MF only); import would need to **map** statement rows into these shapes (and possibly new fields later, e.g. ISIN).
- `src/pages/MutualFundsPage.tsx` — UI for maintaining MF platforms.
- `src/pages/StocksPage.tsx` — UI for stock platforms.
- `src/pages/SettingsPage.tsx` + `AppDataContext` — `parseAppDataFromImport` and encrypted **full backup** import; **not** a substitute for partial MF/stock row import (different use case: restore entire app state).
- `.planning/phases/20-settings-ui-encrypted-export-import/` — prior import/export work; patterns for file pick, validation errors, and user confirmation may be reusable.

## Notes

- **No server upload** is a strong product constraint—parsing should remain **in-browser** where possible.
- “CAMS or other” is intentionally broad; at execution time, pick **1–2 canonical formats** (e.g. CAMS SOA CSV if stable) before generalizing.
- Consider **dedupe** rules when statement **scheme/broker names** do not match existing **platform** labels.
