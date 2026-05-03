# Personal Wealth Tracker

Local-only React + Vite app for tracking personal net worth. Develop with `npm run dev`; run tests with `npm test`.

## Docker

Build and run the production static bundle in a container (nginx serves `dist/`):

```bash
docker build -t fin-wealth:local .
docker run --rm -p 8080:80 fin-wealth:local
```

Then open **http://localhost:8080/**.

GitHub Pages URL and Vite **`base`** configuration are covered in **Phases 24–25**. Wealth data remains **client-only** (browser **localStorage**); the container serves static files only.

## Production build (GitHub Pages)

For GitHub Project Pages, **`BASE_URL`** must match the repository name segment: **`/net-worth-tracker/`** for this project.

```bash
BASE_URL=/net-worth-tracker/ npm run build
npm run preview
```

After the build, **`npm run preview`** serves `dist/` locally so you can confirm the app loads and assets request paths under **`/net-worth-tracker/`**. Phase 25 CI will set the same **`BASE_URL`** for automated deploys.

## Beta (GitHub Pages)

This app is distributed as a **beta** preview on **GitHub Pages**. The public URL follows Project Pages:

**`https://<your-github-username>.github.io/net-worth-tracker/`**

Wealth and portfolio data stay in your browser only (**`localStorage`**). Nothing is uploaded to GitHub or synced server-side—there is no backend; persistence is client-only.

**One-time repo setup:** In the GitHub repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions** so the workflow’s deploy job can publish the site.

## Development

Stack: React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui. ESLint config lives in `eslint.config.js`.
