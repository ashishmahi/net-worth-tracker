# Phase 24 — Technical research

**Phase:** 24 — Production build & GitHub Pages base path  
**Question:** What do we need to know to plan this phase well?

## Vite `base` and GitHub Project Pages

- **GitHub Project Pages** serves the site at `https://<user>.github.io/<repo>/` (trailing path segment matches the repository name). This repo’s public URL segment is **`net-worth-tracker`** (local clone folder `fin` is irrelevant).
- **Vite 5** `defineConfig` accepts **`base`**: must be an absolute URL path. For a subpath deploy, Vite expects a leading slash and a **trailing slash** (e.g. `/net-worth-tracker/`), not `/net-worth-tracker` (Vite docs: non-root `base` should end with `/`).
- **Build output:** `vite build` rewrites `index.html` and chunk references so assets load under `base`. Dev server (`npm run dev`) uses `base: '/'` when `BASE_URL` is unset so local development stays at the site root without extra flags.
- **Config loading:** In `vite.config.ts`, `process.env` does not automatically include variables from `.env` until they are loaded. The idiomatic approach is **`loadEnv(mode, process.cwd(), '')`** inside **`defineConfig(({ mode }) => …)`** so `BASE_URL` can come from the shell **or** a `.env` / `.env.production` file for parity with CI.

## Pitfalls (BUILD-03)

- **Hard-coded absolute paths** in app code (`src/`) for static assets are rare in a typical Vite+React setup; imports and `import.meta.env.BASE_URL` (when needed) respect `base`. Current codebase grep found no `href="/…"` or `src="/…"` patterns under `src/` beyond what Vite handles.
- **`index.html`** uses `/vite.svg` and `/src/main.tsx` — Vite transforms these at build time; verify **`dist/index.html`** after build contains the prefixed asset URLs when `base` is non-root.
- **Docker (Phase 23):** The image runs **`npm run build`** with default `base: '/'` — intentional per **24-CONTEXT D-07**. Subpath validation is **`vite preview`** after a production build with **`BASE_URL=/net-worth-tracker/`**, not nginx path rewriting in the container.

## Single source of truth

- **24-CONTEXT** locks **`BASE_URL`** as the env var name driving `vite.config.ts` **`base`**, with slash normalization in one place (no reliance on ad hoc `--base` CLI as the primary mechanism).

## RESEARCH COMPLETE

Research sufficient to produce executable plans without blocking questions.

---

## Validation Architecture

This phase is primarily **build configuration** plus **manual** browser checks for subpath assets (per **D-06**).

| Dimension | Approach |
|-----------|----------|
| **Automated regression** | `npm test` (Vitest) after config edits — no production behavior change expected in app logic, but gate prevents accidental breakage. |
| **Build integrity** | `BASE_URL=/net-worth-tracker/ npm run build` must exit 0; **`dist/index.html`** must reference scripts/styles under **`/net-worth-tracker/assets/`** (or equivalent Vite output pattern with the base prefix). |
| **Manual (mandatory for BUILD-03)** | `npm run preview` after the subpath build; confirm app shell loads and Network tab shows 200 for chunk requests under the base path. |
| **Docker** | Optional smoke: `docker build` still succeeds (default base `/` unchanged for image build). |

Nyquist: Wave 0 not required — existing Vitest + npm scripts suffice. Manual verification row documents BUILD-03.

---

*Phase 24 — research*
