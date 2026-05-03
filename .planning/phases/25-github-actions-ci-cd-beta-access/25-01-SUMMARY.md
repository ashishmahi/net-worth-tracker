---
phase: 25-github-actions-ci-cd-beta-access
plan: 01
subsystem: infra
tags: [github-actions, github-pages, vite, ci]

requires:
  - phase: 24-production-build-github-pages-base-path
    provides: BASE_URL / normalizeBaseUrl for dist/
provides:
  - CI workflow for PR and main with npm ci, test, build
  - Conditional GitHub Pages deploy on main push
  - README beta section with URL pattern and client-only data statement
affects: [deploy, contributors]

tech-stack:
  added: []
  patterns:
    - "Artifact upload from ci job; deploy job downloads and uses actions/deploy-pages"

key-files:
  created:
    - .github/workflows/ci-pages.yml
  modified:
    - README.md

key-decisions:
  - "Official actions/* only, pinned major versions per plan"
  - "Deploy gated to push + main ref only"

patterns-established:
  - "BASE_URL env in CI matches Phase 24 for all builds"

requirements-completed: [CI-01, CI-02, CI-03, DEPLOY-01, DEPLOY-02, BETA-01]

duration: 15min
completed: 2026-05-03
---

# Phase 25 — Plan 01 summary

**GitHub Actions runs install, test, and Pages-base build on every PR and on `main`; deploy to GitHub Pages runs only after successful CI on `main` push. README documents the beta Pages URL and that wealth data never leaves the browser.**

## Performance

- **Tasks:** 2 (workflow file; README)
- **Files modified:** `ci-pages.yml` (new), `README.md`

## Task commits

1. **Task 1: Add CI + GitHub Pages workflow** — `8f6019c` (feat)
2. **Task 2: README — beta URL and data disclaimer** — `168db1d` (docs)

## Self-Check: PASSED

- `npm test` and `BASE_URL=/net-worth-tracker/ npm run build` succeeded locally.

## Deviations

- None.
