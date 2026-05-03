---
phase: 25-github-actions-ci-cd-beta-access
status: passed
verified: 2026-05-03
reviewer: inline (execute-phase orchestrator)
---

# Phase 25 verification — GitHub Actions CI/CD & beta access

## Requirement traceability

| ID | Evidence |
|----|----------|
| CI-01 | `.github/workflows/ci-pages.yml`: `on.pull_request`, `on.push` branches `[main]` |
| CI-02 | Job `ci`: `npm ci`, `npm test`, `npm run build`; `env.BASE_URL: /net-worth-tracker/` |
| CI-03 | Named jobs `ci` / `deploy`; actions pinned to `@v4` / `@v3` majors (`checkout`, `setup-node`, `upload-artifact`, `download-artifact`, `upload-pages-artifact`, `deploy-pages`) |
| DEPLOY-01 | Job `deploy`: `needs: ci`, `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`, `upload-pages-artifact` + `deploy-pages` |
| DEPLOY-02 | Same `BASE_URL` as Phase 24 / `vite.config.ts` normalization; post-build `grep` on `dist/index.html` in CI |
| BETA-01 | `README.md` § Beta (GitHub Pages): `beta`, `https://…github.io/…`, `localStorage`, no server-side sync |

## Must-haves (plan truths)

1. **Workflow triggers & CI steps** — Verified by file inspection and local `npm test` / `BASE_URL=/net-worth-tracker/ npm run build` + `grep net-worth-tracker dist/index.html`.
2. **Deploy only on `main` push** — `deploy` job `if` matches plan; PR runs `ci` only.
3. **README** — Subsection documents Pages URL pattern, beta, localStorage-only data; GitHub Actions Pages source note present.

## Automated checks run

- `npm test` — pass (70 tests).
- `BASE_URL=/net-worth-tracker/ npm run build` — pass; `dist/index.html` contains `net-worth-tracker`.

## Human verification

- **Post-merge on GitHub:** confirm **Settings → Pages → Source: GitHub Actions** and first **`deploy`** job success (not executable locally).

## Gaps

None for automated scope; live Pages URL confirmation remains optional UAT after push.
