# Phase 8: Mobile Page Fixes - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

On a **375px** viewport, users can **read and use** the dashboard and all 7 asset pages: **(1) Page headers** (title + primary action) **reflow** so there is no horizontal overflow or clipped controls. **(2) Add/Edit sheets** on the six asset pages that use them remain **vertically scrollable** so a field **near the bottom** can be focused and seen **while the software keyboard is open**, without the user dismissing the keyboard first. **(3) The Property page** Add/Edit sheet’s **milestone table** is fully usable—either a **horizontally scrollable** table (visible scrollbar) or a **stacked card** layout—with **no columns hidden or truncated**.

Scope is **UI/layout + sheet behavior** within the existing shadcn/Tailwind stack. **Out of scope:** new asset types, new fields, or keyboard behavior on platforms not covered by manual test (e.g. real iOS) beyond best-effort implementation and documented follow-up in STATE.

**Locked product requirements (see REQUIREMENTS.md, do not re-litigate):** MB-02, MB-03, MB-04. Success criteria: ROADMAP.md Phase 8, items 1–3.

</domain>

<decisions>
## Implementation Decisions

### Page header reflow (MB-02)
- **D-01:** Introduce a **shared** header pattern — e.g. **`PageHeader` or `AssetPageHeader`** — with a **title slot** and optional **primary action** slot, instead of ad hoc `flex` rows per file only. Implementation may be a new component or a consistent small layout primitive; the intent is one place to enforce narrow behavior.
- **D-02:** On the **stacked (narrow) layout**, the **primary action button** is **full width** (`w-full` or equivalent) under the title for a clear, tappable target and to avoid clipping.

### Breakpoint — when stacking applies
- **D-03:** Header stacking and full-width primary action use the **same width rule as the mobile shell: below 768px** (aligned with `useIsMobile` / `MOBILE_BREAKPOINT` in `src/hooks/use-mobile.tsx` and Phase 7). **Do not** use a smaller-only breakpoint (e.g. `max-sm` / 640px) unless research proves overflow at 640–767 without stacking.

### Claude’s Discretion
- **Sheets and keyboard (MB-03):** Choose **scroll container** layout, **focus / scroll-into-view**, and any **`visualViewport` or iOS-specific** mitigations to meet the roadmap. **STATE.md** flags **real-device iOS** validation as likely for MB-03; note gaps in **VERIFICATION** if emulation is insufficient.
- **Property milestone table (MB-04):** Choose **horizontal scroll** (visible `overflow-x`, scrollbar) **or** **stacked cards** per milestone; all column data must remain **visible** or **clearly available** (no hidden/truncated columns) at 375px.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap and product
- `.planning/ROADMAP.md` — Phase 8 goal, success criteria, dependencies
- `.planning/REQUIREMENTS.md` — **MB-02** (header reflow), **MB-03** (sheet scroll with keyboard), **MB-04** (property milestone table on mobile)
- `.planning/PROJECT.md` — v1.1 scope, stack, product constraints
- `.planning/STATE.md` — session notes, **iOS keyboard / viewport** QA risk for MB-03

### Prior phases (context only — no conflict)
- `.planning/phases/06-dark-mode/06-CONTEXT.md` — theme contract (not changed in Phase 8)
- `.planning/phases/07-mobile-foundation/07-CONTEXT.md` — **768px** shell, offcanvas, mobile top bar (Phase 7 delivers chrome; **page-level** reflow is Phase 8)

### Conventions
- `CLAUDE.md` — project-wide UI/data conventions

### Code (expected touchpoints)
- `src/pages/DashboardPage.tsx` — page header
- `src/pages/GoldPage.tsx`, `MutualFundsPage.tsx`, `StocksPage.tsx`, `BankSavingsPage.tsx`, `BitcoinPage.tsx`, `PropertyPage.tsx`, `RetirementPage.tsx` — headers + sheets as applicable
- `src/components/ui/sheet.tsx` — Sheet primitives; sheet content max-height / overflow patterns
- `src/hooks/use-mobile.tsx` — `MOBILE_BREAKPOINT` (768) for alignment with D-03

**Note:** `.planning/research/ARCHITECTURE.md` may inform layout patterns; not a hard gate.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **Page headers:** Repeated `flex items-start justify-between` + `h1` + `Button` (and similar) across asset pages — candidate for the shared `PageHeader` in D-01.
- **`src/components/ui/sheet.tsx`:** shadcn Sheet; Property uses `SheetContent` with `overflow-y-auto` and `sm:max-w-lg` — extend or standardize for MB-03 as needed.
- **`useIsMobile` (768px):** Use consistently with D-03 for when stacked layout applies if logic is not purely Tailwind `md:` breakpoint classes.

### Established patterns
- **Sheets** for add/edit on asset pages; long forms (e.g. Property) include **Table** for milestones — MB-04 targets this table region on narrow viewports.
- **Touch targets** ≥44px called out in Phase 7; keep primary actions tappable in stacked header layout.

### Integration points
- **No change** to Vite `data` API, Zod `data.json` schema, or `AppData` shape for this phase.
- **Shell** (sidebar, `MobileTopBar`) already in place; Phase 8 is **inset page content and sheet content**.

</code_context>

<specifics>
## Specific Ideas

- **Full-width** primary CTA in stacked mode (user-selected) for clarity at 375px.
- **Claude’s discretion** for sheet/keyboard and milestone table presentation, bounded by **MB-03** / **MB-04** and ROADMAP success criteria.
- No other product references — use existing shadcn/Tailwind patterns.

</specifics>

<deferred>
## Deferred Ideas

**None** — discussion stayed within Phase 8 scope.

</deferred>

---

*Phase: 08-mobile-page-fixes*  
*Context gathered: 2026-04-26*
