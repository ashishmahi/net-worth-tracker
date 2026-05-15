# Phase 39: nwrth branding — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 39-nwrth-branding-rename-app-to-nwrth-update-favicons-pwa-manif
**Areas discussed:** Sidebar subtitle, PWA start_url, Export filename

---

## Sidebar Subtitle

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as-is | "Net worth · local only" — still accurate, no change | |
| Remove it | Just brand mark + "nwrth", no subtitle | |
| Change wording | Different text | |
| Refer spec | Defer to NWRTH-BRANDING-PROMPT.md | ✓ |

**User's choice:** Refer to NWRTH-BRANDING-PROMPT.md
**Notes:** Spec says "Replace 'Wealth Tracker' text with 'nwrth'" — targets the brand name line only. Subtitle "Net worth · local only" is not mentioned so it stays unchanged.

---

## PWA start_url

| Option | Description | Selected |
|--------|-------------|----------|
| Use '/' | Follow spec exactly; works for Docker/local | ✓ |
| Hardcode GitHub Pages path | '/net-worth-tracker/' — correct for Pages but breaks local | |
| Generate dynamically | Vite plugin injects BASE_URL at build time | |

**User's choice:** Use '/' (follow the spec)
**Notes:** Local-first app; GitHub Pages PWA install edge case is acceptable.

---

## Export Filename

| Option | Description | Selected |
|--------|-------------|----------|
| Rename to nwrth-YYYY-MM-DD.zip | Consistent with rebrand; filename is UX not data | ✓ |
| Keep wealth-tracker-YYYY-MM-DD.zip | Leave unchanged; localStorage key left as-is | |

**User's choice:** Rename to nwrth-YYYY-MM-DD.zip
**Notes:** localStorage key `wealth-tracker-data` stays unchanged (breaking change if modified).

---

## Claude's Discretion

- SVG inline vs component: use inline SVG for the sidebar brand mark — one-off use, no new component needed
- Open Graph tags: search for existing OG meta tags and update if found; if absent, don't add new ones

## Deferred Ideas

None — discussion stayed within phase scope.
