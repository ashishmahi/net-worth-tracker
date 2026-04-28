# Phase 11 — Technical research: Net worth chart (Dashboard)

**Question:** What do we need to know to plan Recharts + shadcn chart integration on the existing Dashboard?

## RESEARCH COMPLETE

### Stack and install

- **`recharts`:** Not in `package.json` today. Add with `npm install recharts` (peer: React 18 — matches project). TypeScript types ship with the package.
- **shadcn chart pattern:** Project has shadcn `default` + `zinc` + `components.json` but **no** `src/components/ui/chart.tsx` yet. Official path: `npx shadcn@latest add chart` (registry: default). This adds `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, and appends **chart CSS variables** (`--chart-1` … `--chart-5`) to the Tailwind CSS file configured in `components.json` (`src/index.css`). Verify both **`:root`** and **`.dark`** receive chart tokens for **NWH-04** / **11-UI-SPEC** light+dark legibility.
- **Recharts + ChartContainer:** shadcn’s `ChartContainer` wraps `ResponsiveContainer` and applies `hsl(var(--chart-N))` theming; child components are standard Recharts (`LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Area` optional).

### Data shape and transforms

- **Source:** `data.netWorthHistory` — `NetWorthPoint` per `src/types/data.ts` (`recordedAt` ISO datetime string, `totalInr` nonnegative number).
- **Series order:** **UI-SPEC** requires ascending time. Derive with `[...data.netWorthHistory].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())` before mapping to chart rows.
- **Chart rows:** One object per point, e.g. `{ recordedAt, totalInr }` or add a numeric time key for `XAxis` (`type="number"` domain from min/max `recordedAt`). Avoid plotting when `length < 2` (**NWH-04** — no misleading segment).

### Dashboard integration

- **Insertion point:** `DashboardPage.tsx` — after the **Record snapshot** / status block (`</div>` closing the flex column ~line 231), **before** the category breakdown `<Card>` (starts ~233). Only render chart section when `!empty` (same branch as net worth Card), consistent with CONTEXT **D-02**.
- **Formatting INR:** Reuse the same compact currency style as the net worth title where possible (`en-IN`, currency INR); tooltip primary line = formatted **`totalInr`**, compact date per **D-04**.

### Pitfalls

- **Single-point line:** Recharts `LineChart` with one point can still draw a dot or imply a trend — **guard in React**: branch on `netWorthHistory.length >= 2` before mounting `LineChart`; otherwise render insufficient-data **Card** only.
- **Hard-coded hex:** Forbidden by **11-UI-SPEC** — stroke/fill must use **`hsl(var(--chart-1))`** (or shadcn chart config) after chart block is added.
- **Animation:** Set `isAnimationActive={false}` on `Line`/`Area` per UI-SPEC.

### Dependencies on prior phases

- Phase **10** delivered `netWorthHistory` and **Record snapshot**; Phase **10.1** does not change chart data model. Chart is **read-only** of `useAppData().data.netWorthHistory`.

---

## Validation Architecture

> Nyquist Dimension 8 — how execution verifies behavior without a unit-test framework in-repo.

| Dimension | Approach |
|-----------|----------|
| **Automated** | `npm run build` + `npm run lint` after every implementation chunk (same as Phase 10 / 10.1). |
| **Manual / UAT** | Toggle **light/dark** — chart axis, grid, series, tooltip readable. With **0 / 1** snapshots — only insufficient-data **Card** (exact heading **Need two snapshots to see a trend**); **no** `LineChart` in DOM or no visible trend graphic. With **≥2** snapshots — line (± area) visible; tooltip shows INR + short date. |
| **Regression** | Grep asserts presence of contract strings and `recharts` import path in committed files. |

**Wave 0:** No new test runner; existing **TypeScript + ESLint** pipeline is sufficient per project convention (`10.1-VALIDATION.md` precedent).
