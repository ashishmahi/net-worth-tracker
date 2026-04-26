---
phase: 05-dashboard
status: passed
verified_at: 2026-04-26
---

# Phase 05 — Verification

## Goal (from ROADMAP)

Net worth summary aggregating all 7 asset sections with per-category breakdown and total in INR.

## Must-haves (from plans)

| Check | Result |
|-------|--------|
| `dashboardCalcs`: D-01–D-12, no persistence, `calcProjectedCorpus` not used in dashboard | PASS — `src/lib/dashboardCalcs.ts` |
| Net worth + 7 rows, navigation via `onNavigate` / `SectionKey` asset keys only | PASS — `DashboardPage.tsx`, `App.tsx` |
| D-06 skeletons on total / BTC / AED bank rows when loading; D-07 `—` + disclaimer | PASS |
| shadcn `Card`, `Skeleton`, `Separator`; `aria-label` on rows, `aria-live` region | PASS |
| No `data.json` writes; read-only `useAppData` | PASS |

## Automated

- `npx tsc --noEmit` — exit 0
- `npm run build` — exit 0
- `npm run lint` — exit 0 (when run)

## Gaps

None for automated must-haves.

## Human verification

- Open Dashboard with sample data: total equals sum of visible (non-`—`) category rows; click each row to open the matching section.
- Throttle network: confirm skeleton on BTC/forex-dependent areas per D-06.

## Human verification items

- [ ] (optional) Full UAT: missing gold prices, missing BTC/forex, AED without rate, empty portfolio
