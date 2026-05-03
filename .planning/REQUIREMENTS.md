# Requirements: Personal Wealth Tracker — v2.0

**Milestone:** v2.0 — Deploy & Beta (GitHub Pages)  
**Defined:** 2026-05-02  
**Core value:** Same as `PROJECT.md` — net-worth clarity in INR; v2.0 adds **hosted beta access** without changing trust model (no server-side wealth storage).

---

## Active requirements (v2.0)

### Container (Docker)

- [x] **DOCKER-01**: Repository includes a **Dockerfile** that builds the production SPA (`npm ci`, `npm run build`) and serves static output via a documented runtime (e.g. nginx).
- [x] **DOCKER-02**: Container serves the built app such that a normal browser load shows the app (correct MIME, SPA fallback for single-page shell).
- [x] **DOCKER-03**: README (or `docs/`) documents **`docker build`** / **`docker run`** (ports, optional env for base path if applicable).

### Build / GitHub Pages

- [x] **BUILD-01**: Vite **`base`** is configurable for GitHub Project Pages (`/<repository>/`), without breaking local **`npm run dev`** (default base `/`).
- [x] **BUILD-02**: **`npm run build`** succeeds with production base set the same way CI uses for deployment.
- [x] **BUILD-03**: Built assets resolve under the Pages URL (no hard-coded absolute `/` paths that ignore `base`).

### CI (GitHub Actions)

- [ ] **CI-01**: Workflow runs on **`push`** to default branch and on **pull requests** (build + quality gates).
- [ ] **CI-02**: CI runs **`npm ci`**, **`npm test`**, and **`npm run build`** (fail on error).
- [ ] **CI-03**: Workflow is readable and maintainable (named jobs, pinned major versions or SHA policy per repo convention).

### Deploy

- [ ] **DEPLOY-01**: Successful merge to the deployment branch (e.g. **`main`**) publishes the latest **`dist/`** to **GitHub Pages** automatically.
- [ ] **DEPLOY-02**: Published site matches local production build behavior for the same **`base`** (no silent asset path drift).

### Beta / audience

- [ ] **BETA-01**: README (or prominent doc) states the **public URL**, that the build is a **beta**, and that wealth data remains **in-browser only** (localStorage — not synced to the server).

---

## Future requirements (deferred)

- Custom domain + HTTPS beyond default `*.github.io` — optional follow-up.
- Environment-specific config UI — out of scope unless needed for base URL discovery.
- Backend auth / multi-user sync — explicitly not v2.0.

---

## Out of scope

| Item | Reason |
|------|--------|
| Server-side persistence / login | Keeps v1.x privacy model; hosting is static CDN only |
| Mobile native apps | Web-first |
| Changing wealth calculation logic | Deploy-only milestone |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOCKER-01 | 23 | Complete |
| DOCKER-02 | 23 | Complete |
| DOCKER-03 | 23 | Complete |
| BUILD-01 | 24 | Complete |
| BUILD-02 | 24 | Complete |
| BUILD-03 | 24 | Complete |
| CI-01 | 25 | Pending |
| CI-02 | 25 | Pending |
| CI-03 | 25 | Pending |
| DEPLOY-01 | 25 | Pending |
| DEPLOY-02 | 25 | Pending |
| BETA-01 | 25 | Pending |

**Coverage:** 12 requirements → 3 phases (23–25).

---
*Requirements defined: 2026-05-02*
