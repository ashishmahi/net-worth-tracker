# Phase 6: Dark Mode - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can switch the entire app between **light and dark** via an in-app control, with the choice **persisted in `localStorage`** and **restored on load without a flash of the wrong theme** (per ROADMAP success criteria and DM-01, DM-02). Display preference stays **out of** `data.json` (per project STATE).

**Out of this phase (already deferred elsewhere or other phases):** “System / follow OS” as a *stored* third mode; mobile top-bar placement of the toggle (Phase 7). First visit always starts **light** (no OS-derived initial palette in Phase 6).

</domain>

<decisions>
## Implementation Decisions

### First run and default theme
- **D-01:** If there is **no** saved preference (missing or invalid `localStorage` value), the app is **light** — do not read `prefers-color-scheme` for the initial theme in this phase.
- **D-02:** After the user has chosen a theme, only **`light` and `dark` are valid stored values** (binary model). No `system` mode, no `matchMedia` sync for “follow OS after install.”

### Control placement (Phase 6)
- **D-03:** Place the Sun/Moon (or equivalent) control in the **sidebar footer** (`SidebarFooter` pattern), not only under Settings. Phase 7 will add the **mobile top bar** requirement to expose the toggle without opening the drawer; this decision is desktop/sidebar for v1.1 phase 6 delivery.

### Persistence contract
- **D-04:** `localStorage` key: **`theme`**. Values: **`light`** | **`dark`** only. The inline `index.html` script and the React theme layer must use the **same** key and strings. Invalid or unknown values** → treat as no preference → **light** (aligned with D-01).

### FOUC / first paint
- **D-05:** Keep the **`STATE.md` pattern**: a small **inline `<script>` in `index.html`** (before the module bundle) that reads `localStorage` and sets `class="dark"` on `<html>` when and only when the value is exactly **`dark`**. The React `ThemeProvider` (or equivalent) must **read** the class already on `<html>` for initial state and keep `class` and storage in sync on toggle — the provider must not be the **sole** mechanism that applies the correct class on first load.

### Pass/fail for “no wrong theme flash”
- **D-06:** A full reload in **dark** must not show a full-frame **light** shell before `dark` applies. The inline script is the primary guardrail; React hydration must not tear down that class on mount.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap and product
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, dependency on Phase 5
- `.planning/REQUIREMENTS.md` — **DM-01** (toggle), **DM-02** (`localStorage` persistence); also lists deferred “system preference” default (explicitly **not** implemented as first-visit behavior per D-01)
- `.planning/PROJECT.md` — v1.1 scope, stack, constraints
- `.planning/STATE.md` — v1.1 arch notes (no theme in `data.json`; FOUC pattern; existing research pointers)

### Technical / styling
- `tailwind.config.js` — `darkMode: ["class"]` (no change required)
- `src/index.css` — `:root` and `.dark` CSS variable blocks (semantic tokens for shadcn)
- `index.html` — where the inline theme script will live (not yet present at context time)

### Risk and patterns (optional but useful)
- `.planning/research/PITFALLS.md` — FOUC, raw color tokens, `localStorage` validation
- `.planning/research/STACK.md` / `SUMMARY.md` — class-on-`<html>`, Vite + shadcn direction

**Note:** Generic key name `theme` (D-04) is acceptable for this local, single-tenant app; re-evaluate if the app is ever cohosted with other apps on the same origin.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/index.css`**: Full HSL token sets for `:root` and `.dark`; `body` uses `bg-background text-foreground` — no change required for token definitions.
- **`AppSidebar`**: `Sidebar` from shadcn; currently header + `SidebarContent` only. Theme toggle can live in **`SidebarFooter`** (new) without restructuring routes.
- **`@/components/ui/sidebar`**: shadcn Sidebar primitives; supports footer region per usual patterns.

### Established Patterns
- **Class strategy:** `dark` on `document.documentElement` per Tailwind `darkMode: ["class"]"`.
- **No raw gray/white in `src`:** Grep for `bg-white` / `text-gray` style tokens in `src` returned none — expect dark to propagate via tokens; still run a **manual** dark-mode pass per ROADMAP (all 9 pages).

### Integration Points
- **`index.html` + `src/main.tsx` / root layout**: Inline script + React root — theme state must be available near the app shell (e.g. provider wrapping `App`).
- **Persistence:** Browser `localStorage` only — not `data.json` / Vite API (per `STATE.md`).

</code_context>

<specifics>
## Specific Ideas

- ROADMAP suggests a **Sun/Moon** idiom; implementation can use `lucide-react` if already a dependency, matching existing stack.
- Sidebar footer matches **Phase 7** roadmap: mobile will later require toggling without the drawer; footer-only on narrow layouts may be insufficient until Phase 7 — acceptable for Phase 6 scope.

</specifics>

<deferred>
## Deferred Ideas

- **Stored “system” mode** and **OS-driven default on first visit** — User chose binary `light`/`dark` and **always light** on first run; the REQUIREMENTS “Future” line for `prefers-color-scheme` default can be a later small phase if product priorities change.
- **Mobile top bar** theme access — **Phase 7** (ROADMAP Phase 6 success vs Phase 7 criteria).

### Reviewed Todos (not folded)
- None (todo matcher returned no matches for Phase 6).

**None** — other discussion stayed in scope.

</deferred>

---

*Phase: 06-dark-mode*
*Context gathered: 2026-04-26*
