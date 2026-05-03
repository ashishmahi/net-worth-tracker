# Phase 24: Production build & GitHub Pages base path - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 24-production-build-github-pages-base-path
**Areas discussed:** Base path configuration, repo slug / naming, BUILD-03 verification, Docker vs subpath

---

## Base path configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Env in vite.config | Read **`BASE_URL`** (unset → **`/`**) | ✓ |
| npm scripts with `--base` | Dedicated **`build:pages`** script | |
| Env + scripts | Both layers | |
| Claude decides | — | |

**User's choice:** Env in **`vite.config`** only (**`BASE_URL`**).

---

## Environment variable name

| Option | Description | Selected |
|--------|-------------|----------|
| **`BASE_URL`** | Common convention; normalize slashes in config | ✓ |
| **`VITE_*`** | Client-exposed prefix | |
| **`GITHUB_REPOSITORY`** | Derive from CI | |
| Claude decides | — | |

**User's choice:** **`BASE_URL`**.

---

## Repo slug & naming

**User clarification:** GitHub repo is **`net-worth-tracker`** (not local folder **`fin`**). Product/docs should use **`net-worth-tracker`** for URL segments and consistency.

**Canonical path:** **`/net-worth-tracker/`** for **`BASE_URL`** / Pages.

---

## BUILD-03 verification

| Option | Description | Selected |
|--------|-------------|----------|
| Manual + vite preview | Document build + preview + browser check | ✓ |
| npm grep script | Fail if **`dist`** breaks base contract | |
| Vitest + dist | Automated, heavier | |
| Claude decides | — | |

**User's choice:** Manual + **`vite preview`**.

---

## Docker vs subpath

| Option | Description | Selected |
|--------|-------------|----------|
| vite preview only | Docker stays **`/`** | ✓ (via Claude discretion) |
| Optional Docker subpath | nginx env for subpath | |
| Docker must mirror Pages | — | |
| Claude decides | — | ✓ (user picked this option) |

**User's choice:** "You decide" — recorded as **D-07**: validate subpath with **`vite preview`**; leave Phase 23 Docker at **`/`**.

---

## Claude's Discretion

- **Docker subpath:** No nginx subpath in Phase 24; **`vite preview`** after **`BASE_URL`** build is sufficient.

## Deferred Ideas

- Automated dist verification script
- Docker serving under repo subpath
