# Project retrospective — Personal Wealth Tracker

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
