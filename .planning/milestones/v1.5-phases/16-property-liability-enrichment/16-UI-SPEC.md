---
phase: 16
status: approved
source: context-sync
---

# Phase 16 — UI Design Contract

## Scope

Property sheet only (`PropertyPage.tsx`). No new routes or sidebar entries.

## Hint block (PROP-03)

- **Placement:** Immediately below the liability toggle row (`Has home loan / liability` + `Switch`), **above** any `{hasLiability && …}` conditional block. Always rendered when the sheet is open.
- **Copy (verbatim):**  
  `For loans not tied to a specific property (personal, car, etc.), use the Liabilities page.`
- **Typography:** Helper style — `text-sm text-muted-foreground`. Emphasize the substring **`Liabilities page`** with `font-medium text-foreground` (or equivalent) so it reads as the actionable destination.
- **Navigation:** This app uses **`SectionKey` + sidebar state**, not React Router. Phase 16 does **not** add a working sidebar entry for Liabilities (Phase 17). The hint is **informational text** only — no `<Link to="/liabilities">` (that path does not exist). Optional follow-up in Phase 17: turn the emphasized phrase into `onNavigate('liabilities')` when `SectionKey` includes liabilities.

## Liability fields (PROP-01, PROP-02)

When `hasLiability === true`, show fields in this **vertical order**:

1. **Outstanding loan (INR)** — existing control (unchanged behavior).
2. **Lender** — `<Input type="text">`, label `Lender`, placeholder `e.g. HDFC Bank`, optional.
3. **EMI (₹/month)** — `<Input type="text" inputMode="decimal">`, parse via `parseFinancialInput()`, save with `roundCurrency()`, label `EMI (₹/month)`, placeholder `e.g. 25,000`, helper text matching the tone of the outstanding-loan helper.

## Spacing

Match existing `space-y-*` / label gaps used by the outstanding loan field (`mt-1` on helper text).

## Accessibility

- New inputs: associate `Label` `htmlFor` with input `id`; EMI helper uses `aria-describedby` if an `id` is assigned.
