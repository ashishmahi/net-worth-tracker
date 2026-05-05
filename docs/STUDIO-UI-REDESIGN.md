# Studio UI redesign (May 2026)

Quick reference for the **Claude Design → React** UI pass: what shipped, where it lives, and how to pick it up later without relying on chat context.

## Why this exists

- **Goal:** Refresh visual hierarchy, spacing, typography, and Settings IA to match a **“Studio”** direction (cream base, indigo primary, saffron accent) from a Claude Design export, without changing core product behavior (still local-only, same data model).
- **Isolation:** Work landed on branch **`feature/studio-design-redesign`** so **`main`** / existing GitHub Pages users are unaffected until you merge or deploy that branch.

## Source material

| Artifact | Role |
|----------|------|
| Claude Design handoff URL | Returned a **gzip + tar** bundle (not raw HTML). Extract with `gunzip -c \| tar -xf -`. |
| Bundle layout | `README.md` → read chats + **`project/Wealth Tracker.html`** which loads **`app.jsx`**, **`styles.css`**, **`themes.js`** — the real spec is those files, not the tiny HTML shell. |
| This repo implementation | **React + Tailwind + existing shadcn** — not a literal port of the prototype’s React-in-browser/Babel setup. Visual alignment and IA alignment were the targets. |

## Branch & commit

| Item | Value |
|------|--------|
| Branch | `feature/studio-design-redesign` |
| Typical commit message prefix | `feat(ui): Studio design system — …` |

After clone/fetch: `git checkout feature/studio-design-redesign`.

## What changed (behavior + UX)

### Global shell

- **`src/styles/studio-theme.css`** — Overrides shadcn CSS variables (`:root` / `.dark`) for Studio palette, larger **`--radius`**, chart tokens, **`--studio-saffron`**, **`--positive`**, **`--negative`**. Loaded **after** `index.css` in **`src/main.tsx`**.
- **`index.html`** — Inter font link, title **“Wealth Tracker”**; **`tailwind.config.js`** — `fontFamily.sans` → Inter.
- **`src/App.tsx`** — Main content is **full width** with horizontal padding (`lg`/`xl` padding scales). **No** `max-w-[1180px]` on the shell anymore (fixes “compressed column” on asset/liability pages).
- **`src/components/AppTopbar.tsx`** — Desktop-only sticky bar: section title, “as of” date, chips for **Live prices**, **USD/INR**, **BTC** (from `useLivePrices()`).
- **`src/components/AppSidebar.tsx`** — Grouped nav (**Overview / Assets / Other**), **W** brand mark with gradient, dot markers on items, footer **theme icon** + **“Stored on this device”** chip.
- **`src/components/ui/sidebar.tsx`** — `--sidebar-width` set to **16.25rem** (~260px) to match the mock.

### Dashboard only

- **`src/pages/DashboardPage.tsx`** — Hero (net worth, delta vs last snapshot, gross/debt/ratio, CTAs), **`AllocationRing`**, chart card (existing `NetWorthOverTimeCard`), breakdown rows with **category colors** + **progress bars**, redesigned empty state + quick start.
- **Width:** Dashboard root wrapper uses **`max-w-[1180px] mx-auto`** so the hero does not over-stretch on ultrawide monitors; other routes use full main width.

### New small modules

| File | Purpose |
|------|---------|
| `src/components/AllocationRing.tsx` | SVG donut + legend from category slices. |
| `src/lib/wealthFormat.ts` | `fmtCompactInr`, `fmtInr0`, `splitInrAmount`. |
| `src/lib/categoryColors.ts` | `categoryOklch()` hues per dashboard category key. |

### Settings

- **`src/pages/SettingsPage.tsx`** — **Horizontal tabs**: Gold & Silver · Retirement · Live rates · Backup & restore · Reset (aligned with the design bundle’s `SettingsPage` in `app.jsx`).
- **Live rates** tab uses **two cards**: live quotes vs session-only overrides.
- **Backup & restore** — export/import entry card; **AlertDialog** modals stay **mounted at page root** when switching tabs so export/import flows still work.
- **Reset** — copy + backup hint + warning; primary destructive CTA; **Export backup first** switches tab to **Backup & restore**.

## What did *not* change

- No change to **`wealth-tracker-data`** schema, save paths, or pricing math.
- Gold/Silver cards remain **`SettingsGoldPricingCard`** / **`SettingsSilverPricingCard`** — only their **placement** is tabbed.
- **No** automatic deploy story for the branch unless CI/CD is wired to deploy non-`main` (default GitHub Pages is usually `main` only — confirm in `.github/workflows`).

## How to test later

```bash
git fetch origin
git checkout feature/studio-design-redesign
npm ci
npm test
npm run dev
```

Spot-check: sidebar groups, topbar chips, dashboard hero + ring, Settings tabs + dialogs (export zip, import zip, encrypted zip passphrase, clear data confirm).

## Merge / release checklist (when you’re ready)

1. Re-run **`npm test`** and **`npm run build`** on the branch.
2. Smoke-test Settings export/import and danger zone on a copy of data if possible.
3. Open PR **`feature/studio-design-redesign` → `main`** (or your default branch).
4. After merge, GitHub Actions + Pages users get the new UI on the next deploy from `main`.

## Related files (edit touchpoints)

```
index.html
tailwind.config.js
src/main.tsx
src/App.tsx
src/pages/DashboardPage.tsx
src/pages/SettingsPage.tsx
src/components/AppSidebar.tsx
src/components/AppTopbar.tsx
src/components/AllocationRing.tsx
src/components/ui/sidebar.tsx
src/styles/studio-theme.css
src/lib/wealthFormat.ts
src/lib/categoryColors.ts
```

---

*If this doc drifts from the code, trust **`git log`** and **`git diff main...feature/studio-design-redesign`** as source of truth.*
