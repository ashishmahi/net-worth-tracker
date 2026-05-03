# Phase 25 — Pattern Map

**Analog for workflows:** No existing `.github/workflows/` in repo; patterns follow GitHub’s official **static + GitHub Pages** workflow (checkout → setup-node → npm ci → build → artifact → deploy-pages).

**Analog for docs:** Phase **24** updated `README.md` with **Production build (GitHub Pages)** and **`BASE_URL=/net-worth-tracker/`** — Phase 25 extends the same file with **Beta / live URL** without contradicting Phase 24 instructions.

**Files touched (planned):**

| File | Role | Closest analog |
|------|------|----------------|
| `.github/workflows/*.yml` | CI + deploy | GitHub Docs “Static HTML” / Pages workflow samples |
| `README.md` | BETA-01 | Existing README Phase 24 subsection |

**Concrete excerpts (existing):**

- `package.json` scripts: `"test": "vitest run"`, `"build": "tsc -b && vite build"`
- `vite.config.ts`: `base: normalizeBaseUrl(env.BASE_URL)` — CI must supply **`BASE_URL`** for parity with local **`BASE_URL=/net-worth-tracker/ npm run build`**
