---
phase: 13
status: passed
verified: "2026-05-01"
---

## Goal

Product UX for non-gold commodities: CRUD UI, dashboard/nav wayfinding, gold UX preserved (COM-03, COM-04, COM-06).

## Must-haves (from plans)

| ID | Check | Evidence |
|----|-------|----------|
| COM-03 | Sidebar + Commodities page CRUD | `AppSidebar` `commodities`; `CommoditiesPage.tsx` list/sheets/empty state |
| COM-04 | Dashboard row opens Commodities | `NAV_KEY.otherCommodities === 'commodities'` |
| COM-06 | Gold unchanged semantically; pairing cosmetic only | `GoldPage.tsx` untouched; Gold dashboard row only adds `Coins` icon; `ROW_LABEL.gold` / totals unchanged |

## Automated

- `npm test` — pass (Vitest)
- `npx tsc -b --noEmit` — pass

## Human verification (optional)

- Add silver + manual item on Commodities page; confirm dashboard total and row navigation.
- From Dashboard exclusion state (missing silver rate + holdings), confirm copy mentions Commodities section.

## Gaps

- None identified.

## human_verification

- [ ] End-to-end: create/edit/delete silver and manual lines; dashboard opens Commodities from row.
