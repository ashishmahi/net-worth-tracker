# Phase 25 — Technical Research

**Phase:** GitHub Actions CI/CD & beta access  
**Question:** What do we need to know to implement CI, automated GitHub Pages deploy, and README beta disclosure?

## RESEARCH COMPLETE

---

## Stack & constraints

- **Package manager:** `npm` with lockfile (`package-lock.json` present) → **`npm ci`** in CI (CI-02).
- **Scripts:** `npm test` → Vitest; `npm run build` → `tsc -b && vite build` (must run with **`BASE_URL=/net-worth-tracker/`** to match Phase 24 and GitHub Project Pages).
- **No `.github` today:** workflows are greenfield.
- **Deploy target:** GitHub Pages via **GitHub Actions** (not legacy branch-based Pages). Uses `actions/upload-pages-artifact` + `actions/deploy-pages`, with repo **Settings → Pages → Build and deployment → Source: GitHub Actions** (one-time manual enablement).

---

## CI workflow shape (CI-01, CI-02, CI-03)

| Requirement | Approach |
|-------------|----------|
| CI-01 | `on: pull_request` and `on: push: branches: [main]` so every PR and every push to default branch runs the pipeline. |
| CI-02 | Single job (or clearly named jobs) running **`npm ci`**, **`npm test`**, **`npm run build`** with **`env.BASE_URL: /net-worth-tracker/`** for the build step. |
| CI-03 | Pin third-party actions to **major versions** (e.g. `actions/checkout@v4`, `actions/setup-node@v4`) per repo convention; use **`cache: npm`** on setup-node for speed. |

**Fork PRs:** `pull_request` workflows run with restricted token; keep **`permissions: contents: read`** on the CI job. Deploy job must **not** run on PRs (`if: github.ref == 'refs/heads/main' && github.event_name == 'push'`).

---

## Deploy to Pages (DEPLOY-01, DEPLOY-02)

- **Pattern:** After a successful build on **`main`**, upload **`dist/`** as a Pages artifact and call **`actions/deploy-pages`**. Avoid rebuilding twice when possible: **build once**, **`upload-artifact`**, deploy job **downloads** and **`upload-pages-artifact`** → **`deploy-pages`**.
- **OIDC:** `permissions: id-token: write` + `pages: write` for deploy job (and `environment: github-pages`).
- **DEPLOY-02:** Same **`BASE_URL`** as documented in README Phase 24 section and **`.env.example`** — workflow **`env`** must use **`/net-worth-tracker/`** so CI output matches local `BASE_URL=/net-worth-tracker/ npm run build`. Optional grep on **`dist/index.html`** proves asset prefix.

**First-time repo setup (document in README):** Enable Pages with source **GitHub Actions**; without this, deploy job fails at deploy step.

---

## README / beta (BETA-01)

- State **live URL pattern:** `https://<github-username>.github.io/net-worth-tracker/` (Project Pages path = repo name).
- Label deployment as **beta** (pre-release quality expectations).
- Restate **client-only data:** wealth data in **browser localStorage** only; static hosting does not sync secrets or portfolio data to GitHub.

---

## Pitfalls

1. **Wrong `BASE_URL` in CI** — assets 404 on Pages; always set **`BASE_URL=/net-worth-tracker/`** for CI **`npm run build`**.
2. **Deploy on PR** — guard deploy with **`if`** on branch + event; avoid leaking **`id-token`** on untrusted code paths unnecessarily (deploy only on **`main`** **`push`**).
3. **Pages not enabled** — workflow fails at deploy; document Settings step.

---

## Validation Architecture

Phase 25 changes **workflow YAML** and **README** only; runtime app tests are unchanged. Validation strategy:

- **Automated:** Existing **`npm test`** (Vitest) remains the regression gate; CI runs it on every PR and **`main`** push.
- **Workflow correctness:** After adding YAML, local validation via **`actionlint`** is optional (not in REQUIREMENTS); mandatory acceptance uses **file content checks** (jobs present, commands exact, `BASE_URL` set).
- **Manual once:** GitHub **Settings → Pages → GitHub Actions**; confirm deploy job **`page_url`** matches README pattern after first successful run.

---

## Canonical references

| Artifact | Path |
|----------|------|
| Requirements | `.planning/REQUIREMENTS.md` (CI-01–03, DEPLOY-01–02, BETA-01) |
| Phase 24 base path | `vite.config.ts`, `.env.example`, `.planning/phases/24-production-build-github-pages-base-path/` |
| Project guide | `CLAUDE.md` |
