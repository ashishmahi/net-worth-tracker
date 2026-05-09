---
phase: 37
slug: asset-pages-currency-fields-display
status: approved
shadcn_initialized: true
preset: default · tailwind baseColor zinc · cssVariables
created: 2026-05-09
reviewed_at: "2026-05-09T12:00:00Z"
---

# Phase 37 — UI Design Contract

> Visual and interaction contract for **asset & liability pages**: currency controls on add/edit, **`DualCurrencyAmount`** detail display, tables, and section totals. Sources: **`37-CONTEXT.md`** (D-01–D-13), **`docs/multi-currency.md`** §2–§3, **`36-UI-SPEC.md`**, **`35-UI-SPEC.md`**, **`BankSavingsPage.tsx`**, **`DashboardPage.tsx`** (reference only — no dashboard refactor this phase).

---

## Design system

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (existing app) |
| Preset | `default`, `baseColor: zinc`, `cssVariables: true` per `components.json` |
| Component library | Radix primitives via shadcn for sheets, cards, inputs; **currency `<select>`** matches **Bank** native pattern (**RC-01 / AP-01** alignment) |
| Icon library | lucide-react (unchanged) |
| Font | Inter — `fontFamily.sans` in `tailwind.config.js` |

---

## Scope — surfaces & exceptions

| Surface | Currency `<select>` on add/edit | Dual-currency display (detail / rows) | Notes |
|---------|-----------------------------------|--------------------------------------|-------|
| Bank Savings | **Yes** (already — harmonize defaults only) | **Yes** — via shared component | **D-01** `reportingCurrency` on open Add |
| Mutual Funds | **Yes** | **Yes** — table: **Currency column** + dual-line **Value** (**D-11**) | Section total: reporting **single line** (**D-10**) |
| Stocks | **Yes** | Same as MF (**D-11**) | Section total: **D-10** |
| Gold | **Yes** (form / persistence **AP-01**) | Holdings table: **no** Currency column (**D-12**); dual-line value where applicable | Grams/karat unchanged |
| Bitcoin | **Yes** | **Yes** | — |
| Commodities | **Yes** | **Yes** | — |
| Property | **Yes** (one currency per record) | Detail/sheet: amounts labeled in record currency; dual stack where **DSP-02** applies | **D-07**, **D-09** neutral keys — labels follow schema names |
| Standalone Liabilities | **Yes** | **Yes** | **D-08**, **D-09** |
| Retirement | **No** dropdown (**D-03**) | **INR-only** presentation this phase | No multi-currency chrome |

**Out of scope:** Dashboard refactor (**D-05**), Phase 38 settings/snapshots/export, Gold **Currency** column until product supports non-INR-native bullion (**D-12**).

---

## Shared component — `DualCurrencyAmount` (**D-04 – D-06**)

- **Inputs (props):** numeric **amount**, **record currency** code, **reporting currency**, **live rate snapshot** (same shape as `toReportingCurrency` / `useLivePrices`).
- **Not** passed: preformatted strings — component owns formatting and conversion calls.
- **Layout:** Right-aligned amount cluster **`flex flex-col items-end`** with **`leading-tight`**, **`gap-0`** or **`gap-px`** (match **Phase 36** breakdown).

### Typography — dual stack

| Layer | Classes | When shown |
|-------|---------|------------|
| **Primary** | `text-sm font-semibold tabular-nums text-foreground` | Always — value in **reporting currency** when conversion OK |
| **Secondary** | `text-[11px] font-normal tabular-nums text-muted-foreground` | Only when **record currency ≠ reporting currency** AND conversion OK (**DSP-02** / docs §3) |
| **Rate unavailable** | `text-[11px] text-muted-foreground` | When **`toReportingCurrency`** fails (**FX-03**) — must include exact hint **`Rate unavailable`** (same string as Phase **36** / **35**) |

**Same currency:** render **primary line only** — no secondary (**docs §8**).

**Primary-first clarity:** Reporting amount is the dominant figure; original currency amount is the muted secondary — aligned with **`docs/multi-currency.md`** §3 and **Phase 36** breakdown semantics (not the inverted Bank list-row experiment where original appeared larger — new shared component standardizes on dashboard-style hierarchy).

---

## Forms — currency control

- **Pattern:** Reuse **Bank** fieldset — `<legend className="text-sm font-medium">Currency</legend>`, native `<select>` with  
  `className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"`  
  **`aria-invalid`** when Zod errors present; **`role="alert"`** error text `text-sm text-destructive mt-1`.
- **Options:** Six codes **INR, USD, AED, EUR, GBP, SGD** — option labels may match **Phase 35** (`symbol + code`) where space allows; minimum **code** display acceptable in compact sheets.
- **Add default:** **`settings.reportingCurrency`** (**D-01**).
- **Legacy record missing `currency`:** control shows **`reportingCurrency`** (**D-02**).
- **Retirement:** omit Currency fieldset entirely (**D-03**).

---

## Tables — MF & Stocks (**D-11**)

- Add column header **Currency** (or **CCY**) — `text-xs text-muted-foreground` / semibold header per existing table header pattern on each page.
- **Value** column: use **`DualCurrencyAmount`** (or equivalent markup) for dual-line **reporting + original**; **tabular-nums** throughout.
- **Narrow layouts:** **D-13** — `overflow-x-auto` on table wrapper **or** stacked card rows at implementer discretion; must not clip primary amounts.

## Gold holdings table (**D-12**)

- **Do not** add a **Currency** column this phase.
- Form/sheet still collects currency per **AP-01**; persistence satisfies **AP-02**.

---

## Section & page totals (**D-10**)

- Portfolio / section headline totals (e.g. MF total, Gold section total): **one line** in **reporting currency** only — **`text-base` or `text-lg font-semibold tabular-nums`** consistent with each page’s existing total style.
- Do **not** add dual-line stacks to section totals; drill-down remains per-row (**D-10**).

---

## Property & liabilities (**D-07 – D-09**)

- Single **Currency** control governs **all** monetary fields on that record (agreement, loan, EMI, milestones — property; principal & EMI — liabilities). Helper text optional one line: *All amounts on this record are in the selected currency.*
- After neutral JSON renames, **labels** and **validation messages** must reference user-visible names (not legacy `*Inr` suffixes on labels).

---

## Spacing scale

Same as **Phase 35** — multiples of **4px**; new stacks use **`gap-0`–`gap-1`** between dual amounts, **`space-y-4`** in form sections per existing sheets.

**Exceptions:** Existing page-specific `py-[18px]` / card padding — **do not** refactor wholesale; align **only** new currency rows and component inserts.

---

## Typography (max 4 sizes / 2 weights on contract surfaces)

| Role | Token | Usage |
|------|-------|-------|
| Primary amount | `text-sm font-semibold` | `DualCurrencyAmount` reporting line |
| Secondary amount | `text-[11px] font-normal` | Original currency line |
| Table header | existing page pattern | + **Currency** column |
| Form legend | `text-sm font-medium` | Currency fieldset |

---

## Color

Semantic **HSL** tokens from **`src/index.css`** — no new palette.

| Role | Token | Usage |
|------|-------|-------|
| Primary figures | `text-foreground` | Reporting amounts |
| Secondary / hints | `text-muted-foreground` | Original line, column headers |
| Destructive | `text-destructive` | Validation errors only |
| Rates / FX loading | `text-muted-foreground` | Loading copy; **Rate unavailable** hint |

**Accent** (`--primary`): focus rings on interactive controls — not bulk fills.

---

## Copywriting contract

| Element | Copy |
|---------|------|
| Currency fieldset legend | **Currency** |
| Rate / FX failure hint | **Rate unavailable** (exact string, **FX-03**) |
| Loading rates (if surfaced on page) | **Loading conversion rates…** (match **Bank** if reused) |
| Property / liability optional helper | Short clause that one currency applies to all amounts on the record (implementer may tune; keep under one sentence). |
| Retirement | No new multi-currency copy — page stays INR-framed (**D-03**) |

---

## Accessibility

- Currency `<select>`: associated label or **`aria-label`** **Reporting currency** / **Currency** per control context.
- Dual-line amounts: primary + secondary are plain text; ensure focus order on tables remains row buttons/links unchanged.
- **`aria-live="polite"`** where live totals update (reuse existing page patterns).
- Muted secondary text uses **`text-muted-foreground`** for **≥ 4.5 : 1** in light theme (existing token).

---

## Registry safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn | **No new registry blocks** for this phase — **`DualCurrencyAmount`** is a **local composition** in **`src/components/`** | not applicable |
| Third-party | none | — |

Prefer **one** new file **`DualCurrencyAmount.tsx`** (or agreed name per planner) **without** adding Radix primitives beyond what the repo already uses.

---

## Checker sign-off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-09 (inline verification — all dimensions PASS)
