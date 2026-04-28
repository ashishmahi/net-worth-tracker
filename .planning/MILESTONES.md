# Milestone history — Personal Wealth Tracker

**Pre-ship audit (v1.3):** No `v1.3-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v1.3 close:** all clear (2026-04-28).

## v1.3 Net worth history (Shipped: 2026-04-28)

**Scope:** Phases 10, 10.1 (INSERTED), 11.  
**Phase directories:** `.planning/milestones/v1.3-phases/10-history-schema/`, `.planning/milestones/v1.3-phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/`, `.planning/milestones/v1.3-phases/11-net-worth-chart/`

**Phases completed:** 3 phases, 3 plans

**Key accomplishments:**

- **`netWorthHistory`** on **`DataSchema`**, **`ensureNetWorthHistory`**, **`createInitialData()`** with `[]`; **`Record snapshot`** on Dashboard with **`canRecordSnapshot`** gates; full reset clears history (**NWH-01–05** record + reset path).
- Settings **Import from JSON** paired with Export: **`parseAppDataFromImport`**, **`AlertDialog`** before replace, inline errors (**IMP-01**, **IMP-02**).
- **Recharts** + shadcn **`ChartContainer`**, **`NetWorthOverTimeCard`** with **`--chart-*`** theme tokens; chart only when **≥2** snapshots; **NWH-04** insufficient-data state (**Phase 11**).

**Roadmap / requirements:** [`.planning/milestones/v1.3-ROADMAP.md`](milestones/v1.3-ROADMAP.md), [`v1.3-REQUIREMENTS.md`](milestones/v1.3-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v1.3 archives and `REQUIREMENTS.md` removal were completed manually (same as v1.2 close).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

## v1.2 Data reset (Shipped: 2026-04-26)

**Scope:** Phase 9.  
**Phase directory:** [`.planning/milestones/v1.2-phases/09-data-reset/`](milestones/v1.2-phases/09-data-reset/)

**Phases completed:** 1 phase, 2 plans

**Key accomplishments:**

- `export function createInitialData()` in `AppDataContext` with `nowIso()` for all `updatedAt` fields; `INITIAL_DATA` derived from the factory to avoid drift.
- shadcn **AlertDialog** + **danger zone** `Card` on Settings (below **Export Data**): **Cancel** + **Yes, clear all data**; async `saveData(createInitialData())` with inline error/success; no `localStorage` theme wipe.
- Gold and retirement RHF forms reset to empty when optional `settings` slices are removed after a full clear.

**Roadmap / requirements:** [`.planning/milestones/v1.2-ROADMAP.md`](milestones/v1.2-ROADMAP.md), [`v1.2-REQUIREMENTS.md`](milestones/v1.2-REQUIREMENTS.md)

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

## v1.1 UX Polish (Shipped: 2026-04-26)

**Scope:** Phases 6–8.  
**Phase directories:** `.planning/milestones/v1.1-phases/`

**Phases completed:** 3 phases, 5 plans, 23 tasks

**Key accomplishments:**

- FOUC-safe inline `theme` read in `index.html` plus `ThemeProvider` / `useTheme` wrapping the app above data providers.
- Sun/Moon `ghost` control in the sidebar footer with `useTheme` and a clean grep audit for raw light-only Tailwind/hex in `src`.
- Offcanvas main navigation on small viewports, a `MobileTopBar` with hamburger and icon-only theme toggle, and screen-reader copy for the mobile Sheet—desktop layout unchanged at 768px+.
- A shared `PageHeader` unifies section titles, optional `meta` (totals, alerts), and primary actions so narrow viewports stack a full-width CTA without horizontal header overflow, matching `08-UI-SPEC` D-01–D-03.
- Add/Edit `Sheet` panels use a capped viewport height, a scrollable field stack, and a non-scrolling header/footer; the property milestone grid scrolls horizontally on very narrow widths instead of clipping columns.

**Roadmap / requirements:** `.planning/milestones/v1.1-ROADMAP.md`, `v1.1-REQUIREMENTS.md`

---

## v1.0 — Local wealth tracker

**Status:** Shipped (2026-04-26)  
**Scope:** Phases 02–05 in GSD (12 plans, all with `*-SUMMARY.md`); Vite + React + JSON persistence, seven asset areas, live prices, property, dashboard.  
**Roadmap snapshot:** `.planning/milestones/v1.0-ROADMAP.md`  
**Requirements snapshot:** `.planning/milestones/v1.0-REQUIREMENTS.md`  
**Phase directories (GSD 01–05):** `.planning/milestones/v1.0-phases/`

**Key accomplishments**

- Manual asset entry (Gold, MF, Stocks, bank, retirement) and Settings; export path from early foundation work.
- Live BTC + forex + AED/INR; Bitcoin and AED bank support.
- Property with milestones and liability; Zod-typed `data` model.
- Dashboard: `dashboardCalcs` + net worth UI with section navigation.

**Pre-release audit**

- No `v1.0-MILESTONE-AUDIT.md` on file; optional `/gsd-audit-milestone` for a formal pass on future closes.

**Known deferred items at close (see `STATE.md` — Deferred Items)**

- Phase 05 UAT in progress (`05-UAT.md`, testing).
- Phase 01 verification file lists `human_needed` (`01-VERIFICATION.md`).

**Known deferred (unchanged from v1.0 close):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

_Next: `/gsd-new-milestone` to plan the following version (e.g. v1.4)._
