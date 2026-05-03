# Phase 24: Production build & GitHub Pages base path - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Production Vite builds load under **`https://<user>.github.io/net-worth-tracker/`** (GitHub Project Pages) by setting configurable **`base`**. Local **`npm run dev`** remains **`/`** without manual hacks. **`npm run build`** succeeds when **`BASE_URL`** matches what CI will use. Built **`index.html`** and chunk URLs respect **`base`**—validated via documented manual **`vite preview`** checks (BUILD-03).

</domain>

<decisions>
## Implementation Decisions

### Base path configuration (BUILD-01, BUILD-02)
- **D-01:** Configure **`base`** in **`vite.config.ts`** by reading **`process.env.BASE_URL`** (or equivalent normalization). When unset, **`base`** is **`/`** so **`npm run dev`** and default local behavior stay root-relative without hacks.
- **D-02:** **`BASE_URL`** is the single source of truth for production builds (e.g. value **`/net-worth-tracker/`** for this repo). Normalize leading/trailing slashes in config so CI and local prod builds stay consistent.
- **D-03:** Do not rely on npm `--base` scripts as the primary mechanism; env-driven **`vite.config`** is the locked approach.

### Repository path & naming
- **D-04:** GitHub repository slug is **`net-worth-tracker`** (local folder **`fin`** is incidental). Examples, env samples, and docs should use **`BASE_URL=/net-worth-tracker/`** for Pages parity—not **`/fin/`**.
- **D-05:** User-facing product naming may say **Net Worth Tracker** in prose; **URLs and `BASE_URL`** use the **`net-worth-tracker`** slug.

### Verification (BUILD-03)
- **D-06:** Verify asset paths with **manual** workflow: **`BASE_URL=/net-worth-tracker/ npm run build`**, then **`vite preview`**, and spot-check (browser Network tab / visual). No mandatory grep script or Vitest dist assertion in this phase unless planning adds a trivial optional check later.

### Docker vs subpath (Claude's discretion)
- **D-07:** **Keep** Phase 23 Docker serving the SPA at **`/`** as today. Subpath parity with GitHub Pages is validated with **`vite preview`** after a production build using **`BASE_URL`**, not by extending nginx for **`/net-worth-tracker/`** in the container (avoids scope creep in Phase 24; optional Docker subpath can be a later enhancement if needed).

### Claude's Discretion
- **D-08:** Docker subpath behavior — chosen as **vite preview only** for Pages path validation; Docker unchanged.

### Folded Todos
- *(none)*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 24 goal, success criteria, BUILD requirements
- `.planning/REQUIREMENTS.md` — **BUILD-01**, **BUILD-02**, **BUILD-03** (v2.0)
- `.planning/PROJECT.md` — v2.0 Deploy & Beta context; client-only data

### Implementation touchpoints
- `vite.config.ts` — add **`base`** from **`BASE_URL`**
- `package.json` — scripts may document **`build`** with env (planning decides exact UX)
- `Dockerfile` / `docker/default.conf` — reference only; Phase 24 does not require subpath in container per **D-07**

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Vite 5 + React** — standard `defineConfig`; no router **`basename`** needed (no react-router; **`App.tsx`** uses in-memory section state).

### Established Patterns
- **Dev vs prod:** `vite.config.ts` currently has no **`base`**; **`index.html`** uses **`/`** paths that Vite rewrites at build time.

### Integration Points
- **Phase 25 (CI)** will set **`BASE_URL`** in the workflow to match **`/net-worth-tracker/`**; Phase 24 must align **`vite.config`** with that contract.

</code_context>

<specifics>
## Specific Ideas

- Repository slug for URLs: **`net-worth-tracker`** — use **`/net-worth-tracker/`** in all **`BASE_URL`** examples.

</specifics>

<deferred>
## Deferred Ideas

- Automated post-build assertion script or Vitest dist check — deferred; user chose manual verification (**D-06**).
- Optional Docker **`/net-worth-tracker/`** nginx location — deferred (**D-07**).

### Reviewed Todos (not folded)
- *(none)*

</deferred>

---

*Phase: 24-production-build-github-pages-base-path*
*Context gathered: 2026-05-03*
