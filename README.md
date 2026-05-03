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

## Development

Stack: React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui. ESLint config lives in `eslint.config.js`.
