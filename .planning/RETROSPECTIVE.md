# Project retrospective — Personal Wealth Tracker

## Milestone: v1.4 — Multiple commodities

**Shipped:** 2026-05-01  
**Phases:** 12–13 | **Plans:** 5  

### What was built

- **Phase 12:** `otherCommodities` on **`DataSchema`** + migration; **`ensureOtherCommodities`**; silver **`fetchSilverUsdPerOz`** + **`LivePricesContext`** channel; **`sumCommoditiesInr`** / **`calcCategoryTotals`**; Dashboard **Commodities** row + exclusion parity with gold-style nulls.  
- **Phase 13:** **`CommoditiesPage`** (silver + manual CRUD, empty state); sidebar **`commodities`**; Dashboard **`NAV_KEY`** + copy; **Gold** row cosmetic icon only (**COM-06**).  

### What worked

- Reusing **`dashboardCalcs`** semantics for a **read-only** approximate INR hint on the silver sheet kept display aligned with totals without persisting derived values.  
- **Discriminated** commodity items (**standard** vs **manual**) matched Zod + TS cleanly for CRUD.  

### What was inefficient

- **`gsd-sdk query milestone.complete`** still fails (`version required for phases archive`); close-out repeated the **manual** archive + **`git rm` REQUIREMENTS** path.  
- **`roadmap.analyze`** did not enumerate v1.4 phases in this environment; readiness was verified from **SUMMARY** files and roadmap instead.  

### Patterns established

- **Partial commodity totals:** manual lines always count; standard silver counts only when INR/gram is derivable — mirrors gold “needs Settings/live inputs” behavior.  
- **Section navigation:** Dashboard category rows use **`NAV_KEY`** aligned with **`AppSidebar` `SectionKey`** (commodities row → **`commodities`** page).  

### Key lessons

- **COM-06 / gold boundary:** Shipping non-gold commodities as **new surfaces** (`CommoditiesPage`, `otherCommodities`) avoided risky migration away from karat + **`goldPrices`**.  

### Cost observations

- Not recorded.  

---

## Milestone: v1.3 — Net worth history

**Shipped:** 2026-04-28  
**Phases:** 10, 10.1 (INSERTED), 11 | **Plans:** 3  

### What was built

- **Phase 10:** `netWorthHistory` on `DataSchema`, migration via **`ensureNetWorthHistory`**, **`Record snapshot`** on Dashboard with eligibility gates, reset clears history.  
- **Phase 10.1:** Settings **Import from JSON** with **`parseAppDataFromImport`**, confirm **`AlertDialog`**, inline errors (**IMP-01** / **IMP-02**).  
- **Phase 11:** **`NetWorthOverTimeCard`** (Recharts + shadcn **`ChartContainer`**), **`--chart-*`** tokens, chart only when **≥2** snapshots (**NWH-04**).  

### What worked

- Reusing the **same** validation path for import as boot load kept **`DataSchema`** the single gate.  
- **Gating** record snapshot on data readiness avoided bogus totals in history.  
- **shadcn** chart primitives + small custom tooltip matched existing Dashboard density.  

### What was inefficient

- **`gsd-sdk query milestone.complete`** again failed (`version required for phases archive`); close-out duplicated the **manual** v1.2 path (archives + `git rm` REQUIREMENTS + tag).  

### Patterns established

- **Sorted ascending** history for chart X-axis; **branch** UI: empty Card vs chart when `<2` points.  
- **Import:** destructive replace behind explicit dialog — consistent with data-reset severity.  

### Key lessons

- For **time series**, **two points** is the minimum honest trend; a single point stays in **guidance** empty state, not a flat line.  

### Cost observations

- Not recorded.  

---

## Milestone: v1.2 — Data reset

**Shipped:** 2026-04-26  
**Phases:** 9 (1 phase) | **Plans:** 2  

### What was built

- **Phase 9:** `createInitialData()` / `INITIAL_DATA` factory, Settings **Danger zone** with controlled **AlertDialog**, destructive confirm wired to `saveData`, RHF `else` branches when `goldPrices` / `retirement` absent.  

### What worked

- Reusing **existing** `saveData` rollback for failed POST — only UI needed to surface errors.  
- **Single factory** for empty `AppData` keeps `POST` body and first-load defaults aligned.  
- **shadcn** CLI for `alert-dialog` matched the stack (Radix + Tailwind).  

### What was inefficient

- `gsd-sdk query milestone.complete` failed (`version required for phases archive`); milestone close was **finished manually** (archives + `git rm` + tag).  
- `roadmap.analyze` did not mark Phase 9 “complete” until `09-SUMMARY.md` existed — created at close.  

### Patterns established

- **Async destructive** flow: **Cancel** + separate **Button** + `buttonVariants({ destructive })` in `AlertDialogFooter` (not `AlertDialogAction` alone) for `await saveData`.  
- **Settings** forms: sync when optional **nested** `settings` keys go **undefined** after reset, not only when present.  

### Key lessons

- For **data loss** UX, **two-step** intent (open dialog → confirm) plus **irreversible** copy in the dialog meets the product bar without a typed phrase.  

### Cost observations

- Not recorded.  

---

## Milestone: v1.1 — UX Polish

**Shipped:** 2026-04-26  
**Phases:** 6–8 (3 phases) | **Plans:** 5 | **Tasks (approx. from summaries):** 23  

### What was built

- **Phase 6:** ThemeContext, FOUC-safe boot, sidebar Sun/Moon, token audit.  
- **Phase 7:** Offcanvas drawer, `MobileTopBar`, Sheet screen-reader copy.  
- **Phase 8:** `PageHeader` across dashboard + assets; flex/scroll layout for add/edit `Sheet` panels; property milestone `Table` with horizontal scroll on very narrow viewports.  

### What worked

- One shared **768px** breakpoint in Tailwind (`min-[768px]`, `useIsMobile` at 768) kept headers and nav consistent.  
- GSD **phase plans + inline execution** produced traceable commits and `SUMMARY.md` artifacts.  
- **Shadcn `Sheet`** + explicit `flex`/`min-h-0`/`overflow-y-auto` avoided ad-hoc full-page hacks.  

### What was inefficient

- **`state.begin-phase`** once misparsed CLI args and wrote `--phase` into `STATE.md` — required manual repair; worth avoiding until the CLI is fixed.  
- `REQUIREMENTS.md` traceability table for MB-02/03/04 lagged checkboxes; fixed at milestone close.  

### Patterns established

- **`PageHeader`** for section title + optional `meta` + full-width CTA on narrow, row on `min-[768px]:`.  
- **Sheet** pattern: `SheetContent` `p-0` + `max-h-[100dvh]`, form `flex-1 min-h-0`, scrollable body, `SheetFooter` in form.  

### Key lessons

- For mobile keyboard reachability, **code structure** (scroll regions) is verifiable in CI; **iOS** still needs a human or BrowserStack pass.  
- Shadcn **`Table`**’s internal wrapper + outer `overflow-x-auto` is acceptable; document if we revisit.  

### Cost observations

- Not recorded for this local project.  

---

## Cross-Milestone trends

| Milestone | Phases (approx.) | Notes |
|-----------|------------------|--------|
| v1.0 | 1–5 | Core app + v1.0 requirements snapshot |
| v1.1 | 6–8 | UX and mobile; no `data.json` schema change for theme |
| v1.2 | 9 | Data reset; `createInitialData` + AlertDialog; no new API routes |
| v1.3 | 10, 10.1, 11 | Net worth history + JSON import + chart; same `/api/data` surface |
