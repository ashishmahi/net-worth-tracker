---
status: passed
phase: 24-production-build-github-pages-base-path
completed: 2026-05-03
---

# Phase 24 verification

## Goal (from ROADMAP)

Production bundles load correctly under `https://<user>.github.io/<repo>/` via configurable Vite `base`.

## Must-haves

| ID | Requirement | Evidence |
|----|-------------|----------|
| BUILD-01 | Local dev uses base `/` when `BASE_URL` unset | `normalizeBaseUrl` returns `/` for undefined/empty/whitespace; `vite.config.ts` uses `loadEnv`; default dev has no `BASE_URL` |
| BUILD-02 | Build succeeds with repo base | `BASE_URL=/net-worth-tracker/ npm run build` exit 0 |
| BUILD-03 | Built HTML references assets under base | `grep -E 'src="/net-worth-tracker/|href="/net-worth-tracker/' dist/index.html` exit 0 |

## Human verification

- **vite preview:** Recommended once locally (`BASE_URL=/net-worth-tracker/ npm run build && npm run preview`); Network tab should show requests under `/net-worth-tracker/`. Not automated here.

## Regression

- `npm test` — 70 tests passed after implementation.

## Schema drift

Not applicable (no database).
