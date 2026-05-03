# Phase 23: Docker & containerized static server - Context

**Gathered:** 2026-05-02  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a **multi-stage `Dockerfile`** that runs **`npm ci`** and **`npm run build`**, then serves **`dist/`** with **SPA-safe static hosting** (correct MIME, fallback to `index.html` for client routes). **README** documents **`docker build`** / **`docker run`** (port mapping, and optional base-path notes if we document an ARG).  

**Out of this phase:** Vite **`base`** for GitHub Pages (Phase **24**); CI/workflows (Phase **25**). The container preview may use the **default Vite base `/`** until Phase 24 wires env-driven base for production Pages builds.

**Trust model (carried from PROJECT.md):** The image serves only static files — no server-side wealth data; beta remains **client-only** `localStorage` when users open the hosted site later.

</domain>

<decisions>
## Implementation Decisions

### Discussion mode
- **D-00:** Phase 23 is **infrastructure-only**; **DOCKER-01–03** and ROADMAP success criteria define the deliverable. Per discuss-phase **analyze_phase**, there were **no product-level gray areas** requiring interactive elicitation. Decisions below follow **`.planning/research/v2.0-deploy-SUMMARY.md`**, **`.planning/REQUIREMENTS.md`**, and **`.planning/ROADMAP.md` (Phase 23 details)**. Revise this file if you want a different web server or port story before planning.

### Image layout
- **D-01:** **Multi-stage build:** (1) **Node** stage — `npm ci` and `npm run build`. (2) **Final stage** — **`nginx:alpine`** copies `dist/` and a small **nginx** config. Rationale: minimal attack surface, standard pattern, matches research summary.

### Nginx / SPA behavior
- **D-02:** **Single-page fallback:** `try_files $uri $uri/ /index.html` (or equivalent) so refreshes do not 404. App currently uses **in-app section state** (no React Router paths yet); config stays correct if shallow routes are added later.

### Build-time base path (coordination with Phase 24)
- **D-03:** Phase **23** image builds with **default Vite base `/`** (current **`vite.config.ts`** has no `base`). Local **`docker run`** then matches **`npm run dev`** at the root path. **Phase 24** introduces configurable **`base`** for **`/<repo>/`** on GitHub Pages; the Dockerfile may later accept **`ARG` / build-arg** or reuse CI env — planner/implementer adds that **without changing** Phase 23’s requirement that this phase ships a working root-path preview.

### Runtime port / UX
- **D-04:** Nginx listens on **port 80** inside the container (default nginx). README documents **`docker run -p 8080:80`** (host **8080** → container **80**) so local beta testers avoid binding host port 80 without root.

### Repo hygiene
- **D-05:** Add **`.dockerignore`** excluding **`node_modules`**, **`.git`**, **`dist`**, and other large/irrelevant paths to keep build context small and fast.

### Docs (DOCKER-03)
- **D-06:** README (or **`docs/`** if the project prefers) includes **copy-paste** `docker build` and `docker run` with image name placeholder, **`-p 8080:80`**, and a one-line note that **GitHub Pages URL** and **`base`** are covered in Phases **24–25**.

### Claude's Discretion
- Exact **Node** image tag (e.g. **20-alpine** vs **20-bookworm**) — match active LTS and **`package.json`** engines if added later.
- Whether nginx config is **inline `COPY` of a `nginx.conf` fragment** vs **sed** — prefer **explicit file** in repo for reviewability.
- Optional **`docker-compose.yml`** — **not** required by DOCKER-01–03; omit unless it reduces friction for beta testers (defer to backlog if time-constrained).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone / requirements
- `.planning/REQUIREMENTS.md` — **DOCKER-01**, **DOCKER-02**, **DOCKER-03** (v2.0)
- `.planning/ROADMAP.md` — Phase **23** goal, success criteria, dependencies
- `.planning/PROJECT.md` — product context; **no backend**; **localStorage** persistence

### Research
- `.planning/research/v2.0-deploy-SUMMARY.md` — multi-stage Node + **nginx:alpine**, SPA routing, Pages/`base` pointers (Phase 24+)

### Implementation touchpoints
- `package.json` — **`npm ci`**, **`npm run build`** (`tsc -b && vite build`)
- `vite.config.ts` — no `base` yet; Phase 24 will extend

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- None specific to Docker yet — greenfield **`Dockerfile`**, **`.dockerignore`**, optional **`nginx` config** under e.g. **`docker/`** or repo root per repo convention.

### Established patterns
- **Vite 5** + **`vite build`** outputs to **`dist/`** — final stage should **`COPY --from=build`** that directory only.

### Integration points
- **CI (Phase 25)** may build the same **`Dockerfile`** or parallel **`npm run build`**; **DEPLOY-02** requires no drift between published **`dist`** and production **`base`** — enforce when Phases **23–25** are wired.

</code_context>

<specifics>
## Specific Ideas

No user-supplied references for this session — open to standard nginx SPA static hosting.

</specifics>

<deferred>
## Deferred Ideas

- **`docker-compose.yml`** for one-command local preview — nice-to-have, not in DOCKER-01–03.
- **Distroless / non-nginx static** servers — deferred unless image size becomes a stated goal.

### Reviewed Todos (not folded)

*None — `todo.match-phase` returned no matches.*

</deferred>

---

*Phase: 23-docker-containerized-static-server*  
*Context gathered: 2026-05-02*
