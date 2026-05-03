# Phase 23: Docker & containerized static server - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in **23-CONTEXT.md**.

**Date:** 2026-05-02  
**Phase:** 23 — Docker & containerized static server  
**Areas discussed:** *(none interactively — infrastructure phase; see below)*

---

## Session mode

| Aspect | Notes |
|--------|--------|
| **Interactive gray-area selection** | Not run — Phase 23 has **no product UX** ambiguity; **DOCKER-01–03** and ROADMAP success criteria are sufficient. |
| **Alternatives considered** | Multi-stage **Node + nginx:alpine** vs minimal static-only images — **nginx:alpine** chosen per `.planning/research/v2.0-deploy-SUMMARY.md`. |
| **Build-time `base`** | Default **`/`** for Phase 23 container; **GitHub Pages `/<repo>/`** deferred to Phase **24** per roadmap split. |
| **docker-compose** | Optional convenience — omitted from locked requirements; may appear later or under Claude's discretion. |

---

## Topics mapped to CONTEXT.md decisions

| Topic | Resolution (see CONTEXT IDs) |
|-------|-------------------------------|
| Final runtime image | **nginx:alpine** — **D-01** |
| SPA static fallback | **try_files** → **index.html** — **D-02** |
| Vite base in this phase | Default **`/`**; Phase 24 owns Pages base — **D-03** |
| Port mapping | Container **80**, doc **`-p 8080:80`** — **D-04** |
| `.dockerignore` | Yes — **D-05** |
| README commands | **D-06** |

---

## Claude's Discretion

- Node image variant / exact tag  
- Nginx config file layout in repo  
- Optional compose file — **not** locked in Phase 23  

## Deferred ideas

- **`docker-compose.yml`** as convenience wrapper  
- Non-nginx static serving  
