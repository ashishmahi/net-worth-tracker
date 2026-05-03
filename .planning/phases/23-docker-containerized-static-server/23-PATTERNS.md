# Phase 23 — Pattern map

**Purpose:** Classify new files and nearest analogs for Phase 23 (Docker static server).

## New artifacts (greenfield)

| File / area | Role | Analog in repo | Notes |
|-------------|------|----------------|-------|
| `Dockerfile` | Multi-stage build + runtime | *none* | Standard Node build → nginx copy `dist/` |
| `docker/nginx.conf` (or `nginx/default.conf`) | SPA static server config | *none* | Explicit `try_files` for Phase 23 |
| `.dockerignore` | Build context filter | *none* | Mirror `.gitignore`-style excludes |

## Established conventions to respect

- **Build output:** Vite → **`dist/`** — final stage copies **`--from=build`** only that directory.
- **Scripts:** `npm ci` then `npm run build` per `package.json` (must not use `npm install` for reproducibility in CI-like builds).

## Code excerpts

No existing Dockerfile in repo — implement from CONTEXT D-01–D-06 and `23-RESEARCH.md`.

---

## PATTERN MAPPING COMPLETE
