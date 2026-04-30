# Phase 13: Commodities: product UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-30  
**Phase:** 13 — Commodities: product UX  
**Areas discussed:** Nav & entry points, CRUD layout, Dashboard & COM-04, Gold boundary (COM-06), Empty states  

---

## Nav & entry points

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated sidebar "Commodities" | New route + page like other assets | ✓ |
| Settings-only | No new nav item | |
| Hub under Gold | Tabs/links from Gold page | |

**User's choice:** Dedicated sidebar item **Commodities** + dedicated page.  
**Notes:** Aligns with COM-04; Dashboard row should navigate here (not Settings).

---

## CRUD layout

| Option | Description | Selected |
|--------|-------------|----------|
| Dual CTA page | "Add silver" / "Add manual item" with sheets | |
| Type-first single Add | Type picker then fields | |
| Claude's discretion | Smallest consistent implementation | ✓ |

**User's choice:** **You decide** — planner chooses flow under D-03 constraints in CONTEXT.md.

---

## Dashboard (COM-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Single row + sub/tooltip | Optional subtitle/secondary line/tooltip | ✓ |
| Two rows | Silver vs other commodities | |
| Single row plain | No breakdown on Dashboard | |

**User's choice:** Single **Commodities** row with optional **subtitle / secondary line / tooltip** when useful.

---

## Gold boundary (COM-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Strict | No GoldPage or gold row changes | |
| Dashboard-only cosmetics | GoldPage unchanged; gold row may align visually | ✓ |
| Planner default strict | | |

**User's choice:** **GoldPage** unchanged; **Dashboard gold row** may receive **cosmetic** tweaks only.

---

## Empty states

| Option | Description | Selected |
|--------|-------------|----------|
| Rich | Explainer + two primary actions | ✓ |
| Minimal | Short text + single Add | |
| Claude's discretion | | |

**User's choice:** **Rich** empty state with explainer and primary actions for silver and manual.

---

## Claude's Discretion

- CRUD mechanics (D-03): exact sheet structure and entry affordances.

## Deferred Ideas

- None recorded.
