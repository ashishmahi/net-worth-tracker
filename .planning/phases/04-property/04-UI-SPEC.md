---
phase: 04
slug: property
status: approved
reviewed_at: 2026-04-25
extends: 02-manual-asset-sections
shadcn_initialized: true
preset: "style=default, baseColor=zinc, cssVariables=true"
created: 2026-04-25
---

# Phase 04 — UI Design Contract

> Extends **Phase 2 — `02-UI-SPEC.md`** (shadcn/zinc, spacing, typography, color, Sheet list pattern). **Phase 3** live-price surfaces do not apply to Property. Where not listed here, follow `02-UI-SPEC.md` exactly.

## Design System

| Property | Value |
|----------|-------|
| Base | Same as Phase 2 — shadcn/ui, lucide-react, 3 text sizes (14 / 20 / 24), two weights (400 / 600) |
| New dependencies | shadcn **official** registry only — see Component inventory below |

---

## Component inventory

### Already in repo (reuse)

| Component | Usage in Phase 4 |
|-----------|------------------|
| `Sheet` | Add / edit property (same pattern as Bank / Gold) |
| `Button` | Add Account, Save, Delete, optional “Add milestone” |
| `Input` | Text + money fields (`type="text"` `inputMode="decimal"`) |
| `Label` | All form labels |
| `Card` | Optional wrapper for milestone block inside Sheet (if it reduces visual noise) |
| `Separator` | Between property header fields and milestone list; between milestone rows (if not using Table) |
| `Badge` | Optional: “3/12 paid” style hint on list row (muted) |

### Install via shadcn (official only)

| Component | Command | Usage |
|-----------|---------|-------|
| `Checkbox` | `npx shadcn@latest add checkbox` | **Milestone `isPaid`**; optional **“Has home loan”** if not using Switch for liability |
| `Switch` | `npx shadcn@latest add switch` | **`hasLiability`** toggle (preferred for on/off with label); install **only if** not using native checkbox for liability — pick **one** pattern, do not mix Switch + Checkbox for the same boolean semantics |
| `Table` | `npx shadcn@latest add table` | **Milestone sub-table** in Sheet: columns Label, Amount (INR), Paid (checkbox or icon) |

**Rule:** If Table is too heavy for MVP, use **stacked rows** (`space-y-3` + `Separator`) with the same column content — still **14px** body, no new type scale.

**Registry safety:** Third-party shadcn registries are **out of scope** — not required; official only.

---

## Property page — layout

### Page header (list view)

- **Title:** `text-xl font-semibold` — “Property” (same as other section pages).
- **Section readouts** (per `04-CONTEXT` D-02):
  - **Line 1:** Optional summary line in `text-sm text-muted-foreground` (e.g. “Track agreement, milestones, and loan”) — **Claude’s discretion**; can omit if crowded.
  - **Primary total:** If a single “portfolio” line is shown (e.g. sum of agreement values or count of properties), use **`text-2xl font-semibold`** for one hero number only — same rule as Phase 2 section totals. If the page only lists multiple unrelated properties with no meaningful single total, **skip** a big total and show **Add** + list only.

### List rows

- **Layout:** Full-width tappable row (hover `hover:bg-muted/50`), same interaction model as `BankSavingsPage`.
- **Row content (L → R or stacked on narrow):**
  - **Label** — `text-sm font-semibold` (property name).
  - **Secondary** — `text-sm text-muted-foreground`: e.g. `agreement` in INR (`toLocaleString('en-IN', { style: 'currency', currency: 'INR' … })`) and **balance due to builder** (derived) on same line or second line.
  - **Milestone hint** — optional `text-xs text-muted-foreground` or Badge: “8 / 13 paid” (counts from data).
- **Dividers:** `Separator` between rows (not inside the button — pattern matches Phase 2 list sections).

### Add / edit Sheet

- **Sheet title:** “Add property” / “Edit property” — `SheetTitle` (inherits dialog title styles from shadcn).
- **Block A — Identity + agreement**
  - **Property name / label** — required text field.
  - **Agreement value (INR)** — money input; label must say **(INR)**.
- **Block B — Milestones**
  - **Section label:** `text-sm font-semibold` — e.g. “Payment milestones”.
  - **Help text:** one line `text-sm text-muted-foreground` — e.g. “Mark each stage as paid when you pay the builder. Balance due is calculated from the agreement and paid stages.”
  - **Milestone rows:** each row: **Label** (text), **Amount (INR)** (money), **Paid** (Checkbox). **Add milestone** = secondary `Button` with `Plus` icon (lucide), `variant="outline"` or `secondary` per Phase 2 button hierarchy.
  - **Optional “Quick add 13 empty rows”** — if implemented, same button tier as Add milestone; not required for UI approval.
- **Block C — Liability**
  - **“Has home loan / liability”** — Switch (or Checkbox + Label) with description `text-sm text-muted-foreground` under: “This is for bank loan balance, not payment to the builder.”
  - **Outstanding loan (INR)** — shown **only** when liability is on; same money input pattern as Phase 2.

### Reconciliation (soft warning)

- If `sum(milestone amountInr) > agreement` (or obvious mismatch), show **one** `text-destructive text-sm` inline alert below the milestone block — non-blocking, no modal. Copy: user-facing, no stack traces (e.g. “Milestone total exceeds agreement — check amounts.”).

### Delete

- **Destructive** `Button` in Sheet footer, same as Bank — with **inline** `role="alert"` on failure (Phase 2 D-20). Optional browser `confirm()` for delete — **Claude’s discretion**; if no confirm, rely on destructive styling + label.

### Empty state

- **Heading:** `text-sm font-semibold` — “No properties yet”.
- **Body:** `text-sm text-muted-foreground` — “Add a property to track your agreement, payment plan, and loan details.”
- **Primary action:** `Add property` (same as list header button if duplicated — avoid two conflicting labels; use **one** CTA copy everywhere: “Add property”).

---

## Copywriting contract (Phase 4)

| Element | Copy |
|--------|------|
| Add CTA (header) | `Add property` |
| Sheet primary save | `Save` |
| Sheet delete | `Delete` |
| Milestone add | `Add milestone` |
| Empty state heading | `No properties yet` |
| Empty state body | `Add a property to track your agreement, payment plan, and loan details.` |
| Reconciliation error | `Milestone total exceeds agreement. Check amounts.` (exact wording can vary; must be non-technical.) |
| Loan helper | `Bank loan (optional)` / `How much you still owe the lender in INR, not the builder.` — **Claude’s discretion** to shorten. |

---

## Spacing and typography (delta)

- **No new font sizes** beyond Phase 2’s 14 / 20 / 24.
- **Sheet content:** `space-y-4` between major blocks; **within** milestone list, `space-y-3` or table cell padding `p-2` / `p-3` per shadcn Table — keep multiples of **4px**.
- **Milestone table:** if using `Table`, use `text-sm` for all cells; header row `text-sm font-semibold` (600 weight for header only is acceptable for table head — still within two-weight system if header uses `font-semibold` and body `font-normal`).

---

## Color (delta)

- Use **Zinc** semantic tokens from `02-UI-SPEC` / `index.css` only — `text-destructive` for reconciliation; `text-muted-foreground` for help text.
- **Paid** milestone: optional `text-primary` on row or checkmark — if used, only for the paid indicator, not full row background.

---

## Accessibility

- **Derived** amounts (balance due, paid sum): parent with **`aria-live="polite"`** on the Sheet section that shows them (or the list row if shown there).
- **Checkbox** / **Switch**: associated `<Label>` with `htmlFor`; loan section described by helper id via `aria-describedby` where copy is more than one line.
- **Table:** use `<th scope="col">` for column headers; milestone row actions (delete row) need **visible label** or `aria-label` on icon buttons.

---

## Non-goals (Phase 4 UI)

- No charts, no map, no new accent color system.
- No **dashboard**-style multi-column layout — single-column main content only (same app shell as Phase 2).
- No loading skeleton **requirement** — if loading state exists, use `Skeleton` (already in repo) or muted text, consistent with Phase 3 D-09 spirit.

---

## Checker sign-off (inline verification)

| Dimension | Result | Notes |
|-----------|--------|--------|
| 1 Copywriting | **PASS** | CTA, empty, error, loan helper specified |
| 2 Visuals | **PASS** | List + Sheet + milestone block + liability block described; extends Phase 2 |
| 3 Color | **PASS** | Semantic tokens, destructive for mismatch only |
| 4 Typography | **PASS** | No new sizes; table header exception aligned with 02 |
| 5 Spacing | **PASS** | 4px multiple, same Sheet spacing language as 02 |
| 6 Registry | **PASS** | shadcn official only; Table / Checkbox / Switch called out with install command |

**Approval:** approved 2026-04-25

---

## UI-SPEC COMPLETE

Verifier: inline `gsd-ui-checker` equivalent (agents not installed in workspace).

**## UI-SPEC VERIFIED**

### Dimension results

| Dimension | Verdict |
|-----------|---------|
| 1 — Copywriting | PASS |
| 2 — Visuals | PASS |
| 3 — Color | PASS |
| 4 — Typography | PASS |
| 5 — Spacing | PASS |
| 6 — Registry safety | PASS |

**Recommendations (non-blocking):** Prefer **Switch** for `hasLiability` for clarity; if minimizing new components, a single **Checkbox** for loan + per-milestone paid is acceptable with Label pairing.
