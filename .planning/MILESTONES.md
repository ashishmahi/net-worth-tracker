# Milestone history — Personal Wealth Tracker

**Pre-ship audit:** No `v1.1-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` is still a good idea before high-stakes releases.  
**Open-artifact audit at close:** all clear (2026-04-26).

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

_Next: `/gsd-new-milestone` to plan the following version (e.g. v1.2)._
