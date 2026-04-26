# Phase 6: Dark Mode - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `06-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 6-Dark Mode
**Areas discussed:** first visit, theme model, toggle placement, localStorage key, FOUC

---

## First visit (empty or invalid storage)

| Option | Description | Selected |
|--------|-------------|----------|
| Match OS | `prefers-color-scheme` sets initial class until user toggles |  |
| Always light | No OS read; first experience is always light | ✓ |
| You decide | Agent picks |  |

**User's choice:** Always start in light when there is no valid saved preference.
**Notes:** Binary theme model; no "system" stored value.

---

## Theme state model

| Option | Description | Selected |
|--------|-------------|----------|
| Binary | Only `light` and `dark` in `localStorage`; no OS listener for ongoing sync | ✓ |
| Ternary | `light` \| `dark` \| `system` with `matchMedia` / OS updates |  |
| You decide | DM-01/02 as minimum |  |

**User's choice:** Binary (`light` | `dark` only).

---

## Toggle placement (Phase 6)

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar footer | e.g. `SidebarFooter` below main nav | ✓ |
| Settings only | Control only on Settings page |  |
| Both | Sidebar and Settings |  |
| You decide | Single primary placement |  |

**User's choice:** Sidebar footer.
**Notes:** Phase 7 will add mobile top bar for toggle access without opening drawer.

---

## localStorage key and values

| Option | Description | Selected |
|--------|-------------|----------|
| `wealth-tracker-theme` + light/dark | Namespaced key |  |
| `theme` + light/dark | Short key | ✓ |
| You decide | Script and React must match; invalid → light |  |

**User's choice:** Key `theme`; values `light` and `dark` only.

---

## FOUC / load sequence

| Option | Description | Selected |
|--------|-------------|----------|
| Yes | Inline `index.html` script + React reads/syncs; no flash on reload in dark | ✓ |
| Tweak | User to describe a variant |  |
| You decide | As long as ROADMAP #2 (no wrong-theme flash) is met |  |

**User's choice:** Yes — follow `STATE.md` pattern (inline script + React in sync).

---

## Claude's Discretion

- None of the main picks were "you decide" for the final choice; optional paths were offered but the user selected explicit options each time.

## Deferred Ideas

- OS-based first visit and stored `system` mode — not chosen; documented in `06-CONTEXT.md` under deferred.
- Top-bar mobile toggle — Phase 7 (ROADMAP).
