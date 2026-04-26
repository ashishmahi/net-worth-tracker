# Phase 9: Data reset - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

One vertical slice: user can find a **non-save-like** “clear all wealth data” path (in **Settings**), read an **unmissable irreversibility** warning, confirm in a **non-accidental** way, then the app **persists** a **fresh** `DataSchema`-valid document **equivalent** to empty `INITIAL_DATA` (all collections empty, numerics zero, `version: 1`, consistent `updatedAt` timestamps) via existing **`saveData` → `POST` `/api/data`**, and **in-memory** context matches that state. **Out of scope** per ROADMAP: row-level deletes, new API routes, charts/export.

**Locked by requirements (do not re-litigate in implementation):** DATA-01, DATA-02, DATA-03. **Do not** clear **`localStorage`** theme — only `data.json` / wealth `AppData`.

</domain>

<decisions>
## Implementation Decisions

### A — Settings entry: danger zone layout (DATA-01)
- **D-01:** Add a **dedicated** block **below** the existing **Data → Export Data** section so export stays clearly **non-destructive**. The block is **visually distinct** from the **Gold** / **Retirement** "Save" cards — e.g. a **Card** or region with a **"Danger zone"** (or **"Reset data"**) heading, short supporting line, and **no** generic **Save** affordance in that block.
- **D-02:** Primary action label: **"Clear all data"** (aligns with REQUIREMENTS wording; unmistakably not "Save" or "Export"). Use **destructive** styling for this control (`Button` `variant="destructive"` or equivalent) so it reads as a dangerous action at a glance.
- **D-03:** Optional body copy under the heading (one or two lines) that states the action **removes all net-worth and asset data stored in the local file** — not a second confirmation; full legal-style warning lives in the dialog (see B).

### B — Non-accidental confirmation (DATA-02)
- **D-04:** Use a **shadcn-style AlertDialog** (add **`@radix-ui/react-alert-dialog`** and `src/components/ui/alert-dialog.tsx` if not present — there is no AlertDialog in the repo today). **Rationale:** roadmap explicitly allows AlertDialog with safe default + distinct destructive confirm.
- **D-05:** **Cancel** is the **safe, obvious** escape: visible **Cancel** (or **"Keep my data"**) and **not** a single unlabeled **OK**. **Default focus / order** should favor dismissing (implementation follows Radix/shadcn recommended patterns). **Confirm** is a **separate, destructive** button, e.g. **"Yes, clear all data"** or **"Permanently delete"** — *not* ambiguous **"OK"** / **"Done"**.
- **D-06:** **No extra typed-phrase** step (e.g. typing `DELETE`) *unless* a later UAT or accessibility review shows the dialog pair is insufficient — at plan time, **AlertDialog + Cancel default + distinct destructive** meets DATA-02’s *example* list. **Claude’s discretion:** exact button strings and `aria-` attributes per shadcn/Radix.
- **D-07:** Dialog body must include: **(a)** **Irreversible**; **(b)** **all** net-worth and asset **rows in `data.json` removed**; **(c)** optional backup: point users to **Export Data** (above on the same page) — per DATA-02 and REQUIREMENTS *optional backup* bullet.

### C — Empty state payload and `INITIAL_DATA` (DATA-03)
- **D-08:** Introduce a single factory **`createInitialData(): AppData`** (e.g. in `src/context/AppDataContext.tsx` or `src/lib/initialData.ts`) that returns the canonical empty document with **one fresh** ISO timestamp applied to every field that requires `updatedAt` (same shape as current `INITIAL_DATA` / `data.example.json`).
- **D-09:** Refactor **`export const INITIAL_DATA`** to **derive** from that factory (e.g. `const INITIAL_DATA = createInitialData()` at module init) so **load defaults** and **reset** can never **drift**. Reset path calls **`await saveData(createInitialData())`** — *not* reusing a stale in-memory `INITIAL_DATA` object from app boot.
- **D-10:** `settings` in the empty state remains **`{ updatedAt }` only** (no `goldPrices` / `retirement` keys) so the file matches a **truly** clean schema-valid slate; this matches the existing `INITIAL_DATA` shape in code.

### D — Success, failure, and copy (align with `saveData`)
- **D-11:** On **`saveData` failure:** show **inline** `role="alert"` error in the **danger** block, same *tone* as other Settings save errors (e.g. *"Could not clear data. Check that the app is running and try again."*). Rely on existing **rollback** in `saveData` (no half-cleared state) — *surface* the failure; do not leave silent failure.
- **D-12:** On **success:** **inline** confirmation only — e.g. short **"All data has been cleared."** (muted or default text) in the danger section; **no** new toast/notification library (not in `package.json` today). **Claude’s discretion:** whether the message is persistent until next navigation or **clears** after a few seconds (prefer minimal state).
- **D-13:** **Success** does not need a second modal; dashboard/sections will reflect **empty** state from context immediately.

### Claude’s Discretion
- Exact **AlertDialog** copy line-breaks, minor **wording** tweaks, and any **a11y** fine-tuning under shadcn/Radix.
- **Exact** success string and whether to clear it on route change.
- If installing **`alert-dialog`** reveals project-specific conflicts, keep **`Dialog`** with alert semantics *only* as a fallback while preserving D-04/D-05 **behavior** (not as the first choice).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and requirements
- `.planning/ROADMAP.md` — Phase 9 focus, success criteria, dependencies, traceability
- `.planning/REQUIREMENTS.md` — **DATA-01** through **DATA-03**, out of scope (theme `localStorage`, no new routes)
- `.planning/PROJECT.md` — v1.2 goals, stack, local-only model
- `.planning/STATE.md` — milestone session notes (optional)

### Schema and data contract
- `src/types/data.ts` — `DataSchema` / `AppData` (POST body must validate)
- `data.example.json` — empty shape reference

### App wiring
- `src/context/AppDataContext.tsx` — `saveData` optimistic update + rollback, `INITIAL_DATA`, future `createInitialData`
- `src/pages/SettingsPage.tsx` — where danger zone + export live; D-18 export behavior preserved
- `plugins/dataPlugin.ts` — `GET`/`POST` `/api/data`

### Conventions
- `CLAUDE.md` — input, rounding, and project rules

### Prior milestone context (patterns only)
- `.planning/milestones/v1.1-phases/08-mobile-page-fixes/08-CONTEXT.md` — Settings and layout conventions from v1.1 (no conflict; Phase 9 adds a new block)
- `.planning/research/ARCHITECTURE.md` — app structure (supplementary)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **`useAppData()`** — `saveData` and `data`; errors thrown from `saveData` on non-ok POST or network failure.
- **`AppDataContext`** — `INITIAL_DATA` constant; provider starts with it before `fetch` completes.
- **Settings** — per-block **inline** `role="alert"` errors for **Gold** / **Retirement**; **Data** block already has **Export Data** (preserve export handler + behavior).
- **`nowIso` / `parseFinancialInput`** — from `@/lib/financials` (use **`nowIso()`** in factory for `updatedAt` if that is the project’s canonical timestamp).

### Established patterns
- **POST** `/api/data` with `JSON.stringify` of full `AppData` — reset must send a **full** object, not partial patches.
- **No** toast system — prefer **inline** success for Phase 9.

### Integration points
- **SettingsPage** only (unless roadmap changes) — new UI + `saveData(createInitialData())`.
- **No** changes to Vite route surface beyond existing plugin.

</code_context>

<specifics>
## Specific Ideas

- User requested discussion of **all** gray areas (A–D) in discuss-phase; decisions above are the **recommended** set locked for planning.
- **Export** reminder inside the **dialog** body, referencing **Export Data** on the same page, satisfies the optional backup line in DATA-02 with low effort.

**No external ADR** — requirements live in `REQUIREMENTS.md` and this file.

</specifics>

<deferred>
## Deferred Ideas

- **Typed phrase** (e.g. `DELETE`) as an *additional* guard — *not* required for v1.2 if D-04–D-06 are implemented; re-open only if UAT shows mis-clicks.

### Reviewed Todos (not folded)

*None* — `todo.match-phase` returned no matches for phase 9.

</deferred>

---

*Phase: 09-data-reset*
*Context gathered: 2026-04-26*
