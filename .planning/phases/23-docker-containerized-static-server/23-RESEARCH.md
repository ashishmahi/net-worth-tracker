# Phase 23 — Technical research

**Phase:** Docker & containerized static server  
**Question:** What do we need to know to plan this phase well?

## Summary

- **Build:** `package.json` defines `"build": "tsc -b && vite build"` — output is **`dist/`** (Vite default). No `base` in `vite.config.ts` yet (Phase 24).
- **Runtime:** Multi-stage image — **Node** runs `npm ci` + `npm run build`; **nginx:alpine** serves **`/usr/share/nginx/html`** with SPA **`try_files`** fallback (`/index.html`).
- **Port:** Nginx **80** inside container; README uses **`-p 8080:80`** for host mapping (CONTEXT D-04).
- **Hygiene:** `.dockerignore` shrinks context (`node_modules`, `dist`, `.git`, `.planning`, etc.).
- **Out of scope:** GitHub Pages `base`, CI — Phases 24–25.

## Options considered

| Approach | Pros | Cons |
|----------|------|------|
| Node + `vite preview` in container | Single stage possible | Long-lived Node, larger image, not ideal for static-only |
| **Multi-stage Node + nginx:alpine** | Small final image, standard SPA pattern | Two stages to maintain |
| distroless static | Minimal attack surface | More setup; CONTEXT defers unless size is a goal |

**Decision:** Multi-stage Node + **nginx:alpine** per CONTEXT D-01/D-02 and `.planning/research/v2.0-deploy-SUMMARY.md`.

## Nginx SPA behavior

- `root` / `index index.html;`
- `location / { try_files $uri $uri/ /index.html; }`
- Optional: `gzip_static` / caching headers — nice-to-have; not required by DOCKER-02.

## Pitfalls

- Forgetting SPA fallback → 404 on refresh when routes exist later.
- Copying repo without `.dockerignore` → huge build context.
- **Phase 24:** Wrong `ARG` for `base` — explicitly out of Phase 23; image uses default `/` build.

## References

- `.planning/phases/23-docker-containerized-static-server/23-CONTEXT.md`
- `.planning/research/v2.0-deploy-SUMMARY.md`
- `package.json`, `vite.config.ts`

---

## Validation Architecture

Phase 23 is **infrastructure**: correctness is proven by **container build**, **static file presence**, and **HTTP smoke** (SPA fallback). Automated tests in-repo remain **`npm test`** / **`npm run build`** for unaffected app code; **Docker** verification is **build + optional curl** after `docker run`.

| Dimension | Approach |
|-----------|----------|
| Build integrity | `docker build` exits 0; image contains `/usr/share/nginx/html/index.html` |
| SPA fallback | `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/nonexistent-route` returns **200** (after mapping port) |
| Docs | README contains literal `docker build` and `docker run -p 8080:80` |

Wave 0 / new test files: **not required** — no application logic changes unless fixing build breaks.

---

## RESEARCH COMPLETE
