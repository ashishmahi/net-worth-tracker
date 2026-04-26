# Phase 8: Mobile Page Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `08-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-26  
**Phase:** 8 - Mobile Page Fixes  
**Areas discussed:** Page header layout, Sheets and keyboard, Property milestone table, Breakpoint for reflow  

---

## Page header layout (MB-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Shared `PageHeader` (or `AssetPageHeader`) | One component, responsive stack + full-width button on mobile | ✓ |
| No new component (per-page Tailwind) | Larger per-file diffs | |
| You decide (implementer) | | |

**User's choice:** Shared `PageHeader`-style component with title + action slots.

---

## Stacked button width

| Option | Description | Selected |
|--------|-------------|----------|
| Full width on narrow | `w-full` under title | ✓ |
| `self-start` / shorter button | | |
| You decide | | |

**User's choice:** Full width.

---

## Sheets and keyboard (MB-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Scrollable form region + focus scroll | | |
| `visualViewport`-based adjustments | | |
| You decide (must pass MB-03) | | ✓ |

**User's choice:** Claude’s discretion — any approach that meets MB-03; iOS per STATE.

**Notes:** STATE.md already flags real iOS validation for keyboard viewport.

---

## Property milestone table (MB-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal scroll, table preserved | | |
| Stacked cards | | |
| You decide (must pass MB-04) | | ✓ |

**User's choice:** Claude’s discretion (horizontal scroll vs cards).

---

## When headers stack (breakpoint)

| Option | Description | Selected |
|--------|-------------|----------|
| <768px (align with `isMobile` / Phase 7) | | ✓ |
| <640px (`max-sm`) | | |
| ~375 only (custom) | | |

**User's choice:** Below 768px, consistent with mobile shell.

---

## Claude's Discretion

- **MB-03** — implementation approach for sheet scroll and keyboard.  
- **MB-04** — horizontal scroll vs stacked cards.

## Deferred Ideas

None in-session.

---
