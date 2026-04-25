---
phase: 05
slug: dashboard
status: approved
reviewed_at: 2026-04-26
extends: 02-manual-asset-sections
shadcn_initialized: true
preset: "style=default, baseColor=zinc, cssVariables=true"
created: 2026-04-26
---

# Phase 05 — UI Design Contract

> Extends **Phase 2 — `02-UI-SPEC.md`** (shadcn / Zinc, 14·20·24 type scale, spacing, color). **Phase 3** live-price **Skeleton** and **en-IN** currency apply where referenced in `05-CONTEXT` / `05-RESEARCH`. Where not listed here, follow `02-UI-SPEC.md` exactly.

---

## Design System

| Property | Value |
|----------|-------|
| Base | Same as Phase 2 — shadcn/ui, Radix (via shadcn), **lucide-react**, system font stack |
| New dependencies | **None** — `Card`, `Skeleton`, `Separator` already in repo (`05-RESEARCH` verified) |

---

## Component inventory

### Reuse (no new installs)

| Component | Usage |
|-----------|--------|
| `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription` | **Net worth** block — single hero surface at top of main column |
| `Separator` | Between the seven **category rows** (same inter-row pattern as `BankSavingsPage` list-in-card) |
| `Skeleton` | **Value slot** in total card and in rows whose amounts depend on loading **BTC/forex** per D-06 (`btcLoading` / `forexLoading` scoped per row) |
| Native `<button type="button">` | **Category row** hit target — full width, `hover:bg-muted/50`, `cursor-pointer`, `text-left` (align with Phase 2 list rows) |

**Registry safety:** shadcn **official** only; no third-party registries, no new CLI adds for this phase.

---

## Layout and visual hierarchy

### Focal point

1. **Primary:** The **net worth** `Card` (grand total in INR) — first element below the page title, largest monetary display on the screen.
2. **Secondary:** The **stack of seven category rows** (name → amount → % of total), a single `Card` with `CardContent` `p-0` or equivalent so rows touch edges like Bank Savings.

### Page chrome

- **Page title** (`text-xl font-semibold`, line-height 1.2): `Dashboard` — same as other section pages (`02-UI-SPEC` Heading).
- **Optional** one-line subhead directly under the title: `text-sm text-muted-foreground` — e.g. “All figures in INR · read-only” — **Claude’s discretion**; omit if redundant with Card copy.

### Net worth card (D-04)

- **Structure:** One Card containing:
  - **Label** — `text-sm text-muted-foreground`: e.g. `Net worth` (not a raw section name; must read as a summary, not a stub).
  - **Primary figure** — `text-2xl font-semibold` (Display tier from `02-UI-SPEC`); shows formatted INR or a **Skeleton** (`h-8 w-40` or similar) while **any** required live price the total depends on is still loading (D-06: total **Skeleton until all prices that affect the total** have resolved).
  - **Optional** `CardDescription` line — `text-sm text-muted-foreground`: “Prices as of {time}” or exclusion disclaimer — only if `05-CONTEXT` / implementation provides a single trustworthy timestamp; otherwise omit.

### Category list (D-04, D-05)

- **Order (fixed):** Gold → Mutual funds → Stocks → Bitcoin → Property → Bank savings → Retirement (use **human-readable labels** consistent with sidebar: “Mutual funds” / “Bank savings” capitalization to match `AppSidebar` / nav).
- **Each row (L → R on `md+`, or stacked on narrow):**
  - **Category name** — `text-sm font-semibold`.
  - **INR value or placeholder** — `text-sm font-normal` + `tabular-nums` optional for alignment: formatted `en-IN` currency **or** `<Skeleton className="h-5 w-24 inline-block" />` in the value column when that row is in a loading state, **or** `—` when the value is unavailable and excluded (D-07).
  - **Share of total** — `text-sm text-muted-foreground` (e.g. `12%` or `—` when total is 0 or row excluded); guard **percent** when `grandTotal === 0` (see `05-RESEARCH` Pitfall 5).
- **Dividers:** `Separator` between rows (not inside the button; pattern matches Phase 2 / Bank list).
- **Click / tap (D-05):** entire row is one **button**; on activation calls `onNavigate(sectionKey)` from `App.tsx`. **No** chevron required; if a chevron is used, it must be `lucide` at `h-4 w-4` `text-muted-foreground` and not the only affordance.
- **Accessible name** — `aria-label` per row: `Open {Category label} section` (verb + destination; **not** “Click here”).

### Loading (D-06)

- **Total card:** Skeleton for the main figure when **blockers** for a correct grand total are still loading (at minimum while `btcLoading || forexLoading` if those flags gate BTC or forex-dependent lines included in the running total; align with `05-RESEARCH` wiring).
- **Rows:** Show Skeleton **only in the value column** for categories that depend on the still-loading price (Bitcoin while BTC/forex loading; Bank savings row while **AED** conversion is pending if `forexLoading` is true; **not** for purely INR rows unless their amount is also blocked by the same rule).

### Error and partial data (D-07)

- **Unavailable value:** show `—` in the value column, **subtle** error hint (e.g. `lucide` `AlertCircle` `h-3.5 w-3.5` + `text-destructive` or `text-muted-foreground` per existing inline-error style from Phase 2 D-20 **spirit**), **no** toast.
- **Excluded from total:** one **disclaimer** line below the list or in `CardDescription`: plain language, names missing categories, points user to **Settings** or **waiting for refresh** — must include a **remedy path** (not only “Error”).
- **Bank savings, AED with no rate:** if `aedInr === null` and user has AED accounts, optional `text-sm text-muted-foreground` sub-line on that row: **`AED balances excluded — rate unavailable`** (mirrors `05-RESEARCH` open question; **Claude’s discretion** as in CONTEXT).
- **Gold with no `goldPrices`:** show `—` in value; optional muted hint **`Set gold prices in Settings`** (per `05-RESEARCH` recommendation).

---

## Copywriting contract

| Element | Copy / rule |
|---------|----------------|
| Primary **navigation** action (per row) | `Open {Category} section` as **`aria-label`**; visible text is the category name — **not** “Click here” / “View” alone |
| **Net worth label** | `Net worth` (or `Total net worth (INR)`) — must be a clear H1-adjacent summary label |
| **Empty / zero** | If the user has not entered any meaningful data: **Heading** `text-sm font-semibold` — `No holdings yet` · **Body** `text-sm text-muted-foreground` — `Add assets in each section; your total will show here.` |
| **Disclaimers (excluded categories)** | Name affected sections and give a next step, e.g. `Total excludes {sections} because a live rate is missing. Open **Settings** to check prices or try again later.` (exact set dynamic; must stay non-technical) |
| **Destructive actions** | N/A for Dashboard — no delete/save; omit destructive confirmation table row or mark **not applicable** |
| **Optional timestamp** | `Prices as of {local time}` (muted, `text-sm`) — if shown |

---

## Spacing scale (delta from 02)

Use **02-UI-SPEC** tokens (4, 8, 16, 24, 32, 48, 64) only. Phase 05 **delta**:

| Use | Token / class | Notes |
|-----|----------------|--------|
| Title → first Card | `space-y-4` (16px) | Main column `space-y-4` already in stub; keep |
| Inside net worth card | `space-y-1` or `gap-1` (4px) | Between label and figure |
| Card **padding** | `p-6` on outer Card or match list cards from Phase 2 (`24px` = `lg`) |
| Row vertical padding | `py-3` (12px) or `px-4 py-3` — use **`py-3` + `px-4`** to match BankSavings (12px and 16px; both multiples of 4) |

**Exceptions:** `min-h-[44px]` for sidebar nav only per `02-UI-SPEC` — list row buttons should still be **comfortable** touch targets; use `py-3`+ or min-height that meets ~44px where feasible without breaking density.

---

## Typography (Phase 05 — no new size tier)

| Role | Size | Weight | Line height | Usage |
|------|------|--------|-------------|--------|
| Body | 14px (`text-sm`) | 400 / 600 | 1.5 / 1.2 for tight stacks | Category names (600), values, %, footnotes, disclaimers |
| Heading | 20px (`text-xl`) | 600 | 1.2 | Page title `Dashboard` |
| Display | 24px (`text-2xl`) | 600 | 1.2 | **Net worth** main figure in the top card (same “Display” tier as section totals in `02-UI-SPEC`) |

- **At most three** `text-*` steps for Phase 5 screens: `text-sm` / `text-xl` / `text-2xl` — same rule as `04-UI-SPEC` (no new rung).
- Weights: **400** and **600** only (`font-normal`, `font-semibold`).
- INR: `toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` for all full amounts; percents: `0–100` with reasonable decimals **only if** needed (0 or 1 decimal: **Claude’s discretion**; stay readable).

---

## Color

Uses **HSL custom properties** from `src/index.css` — **Zinc** theme. Do not introduce new hexes.

| Role | Token / class | Usage |
|------|---------------|--------|
| **Dominant (~60%)** | `bg-background` | Page surface |
| **Secondary (~30%)** | `bg-card`, `border-border` | Cards, row hover `hover:bg-muted/50` |
| **Accent (~10%)** | `text-primary` / `ring` | **Reserved for:** focus ring on **interactive** row and sidebar active item, **not** for filling full row background |
| **Muted** | `text-muted-foreground` | % of total, helper lines, “Prices as of” |
| **Destructive** | `text-destructive` | Inline problem hints only; **not** for normal negative net worth (negative NW is not required by v1) |

**Accent is not** “every interactive control” — list rows use **neutral** hover; reserve strong accent for **focus-visible** and primary navigation affordances in the **shell** (`02-UI-SPEC` alignment).

---

## Registry safety

| Registry | Blocks | Safety gate |
|----------|--------|----------------|
| shadcn **official** | (none new) | not required — **no** new `npx shadcn add` for Phase 5 |

---

## Non-goals (out of scope)

- Charts, sparklines, pie/bar visuals (`PROJECT.md` / `05-CONTEXT` deferred)
- Historical net worth / trends
- Editable fields or **primary CTA** that **saves** or **submits** data on this page
- A **second** accent color for decoration
- Storing the net worth in `data.json` (computation at render only — not a UI file concern but **do** not add persistence UI)

---

## Accessibility

- **Grand total and row values:** live updates should use **`aria-live="polite"`** on a single region wrapping the **total** or the **list** (not 7 separate regions) so assistive tech does not spam; debounce is **not** required in v1 but avoid redundant announcements on every keypress (read-only page).
- **Row buttons:** visible label = category name; `aria-label` = `Open {name} section`.
- **Skeleton → value swap:** do not set `aria-busy` on the whole page unless a single well-tested pattern; prefer skeleton as visual-only without announcing “loading” repeatedly (match existing app simplicity).

---

## Checker sign-off (inline)

| # | Dimension | Result | Notes |
|---|------------|--------|--------|
| 1 | Copywriting | **PASS** | Nav `aria-label`s are verb + destination; empty, disclaimer, D-07 paths specified; no generic “Submit” |
| 2 | Visuals | **PASS** | Focal = net worth card; then category list; hierarchy explicit |
| 3 | Color | **PASS** | 60/30/10 + semantic; accent reserved list **not** “all interactives” |
| 4 | Typography | **PASS** | Three rungs (sm / xl / 2xl), two weights; line heights stated |
| 5 | Spacing | **PASS** | Multiples of 4; delta table uses only approved tokens |
| 6 | Registry | **PASS** | Official shadcn only; no new third-party blocks |

**Approval:** approved 2026-04-26

---

## UI-SPEC COMPLETE

**Phase:** 5 — Dashboard  
**Design system:** shadcn / Zinc (existing)  

### Contract summary

- **Spacing:** Phase 2 scale; title→card `16px`, row `py-3`/`px-4`  
- **Typography:** 14 / 20 / 24 px; weights 400 / 600; `en-IN` currency  
- **Color:** HSL theme variables; accent for focus and shell, neutral row hovers  
- **Copywriting:** row `aria-label`s, net worth label, empty and exclusion disclaimers  
- **Registry:** no new components  

### File

`.planning/phases/05-dashboard/05-UI-SPEC.md`  

### Pre-populated from

| Source | Decisions |
|--------|------------|
| `05-CONTEXT.md` | D-01…D-12, layout, Skeleton, click rows, error behavior |
| `05-RESEARCH.md` | Stack, patterns, `BankSavingsPage` / `BitcoinPage` parity |
| `components.json` | zinc / `cssVariables` |
| User | (none in session — all from discuss + research) |

**Ready for verification** — see inline checker table above.

---

## UI-SPEC VERIFIED

### Dimension results

| Dimension | Verdict |
|-----------|--------|
| 1 — Copywriting | PASS |
| 2 — Visuals | PASS |
| 3 — Color | PASS |
| 4 — Typography | PASS |
| 5 — Spacing | PASS |
| 6 — Registry safety | PASS |

**Recommendations (non-blocking):** Add `tabular-nums` to INR columns if any vertical jitter; optional `ChevronRight` is decorative only.  

`05-RESEARCH` *Open Questions* (gold hint, AED sub-note) are **explicit optional** sub-lines in this spec — implementer may shorten strings.
