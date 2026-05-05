# Phase 31 — Technical Research

**Question:** What do we need to know to implement guided property entry UX well?

## Summary

Implement **explicit path state** in the Property sheet UI (**segmented control** first — **D-01/D-02**). Use **conditional rendering** for milestones vs liability blocks (**D-05–D-08**). Prefer **deriving initial path when opening Edit** from existing `PropertyItem` fields before adding **`entryKind`** to persisted data (**D-14**): greenfield product (**D-15**) allows simple inference rules.

## Path model

- **Three paths:** `fullyPaid` | `milestones` | `mortgaged` (names mirror CONTEXT labels).
- **Add flow:** Default segment **Fully paid** or **Milestones** — product choice; recommend **Fully paid** as simplest first mental model.
- **Edit flow — inference (recommended default):**
  - If **`hasLiability`** → initial segment **Mortgaged**.
  - Else if **`milestones.length > 0`** → **Milestones**.
  - Else → **Fully paid**.
- **Ambiguity:** Rows with **both** meaningful milestones **and** liability are **Mortgaged** (loan-first framing per **D-07** ordering); inference still lands on **Mortgaged** via `hasLiability`.

**Persisted `entryKind`:** Only needed if UX testing shows inference wrong after reopen (e.g. user clears all milestones but still thinks “milestones path”). CONTEXT allows deferring to Phase **32** with documented inference — **default for Phase 31: no schema write**.

## UI implementation notes

- No **`tabs.tsx`** in repo today — options: (a) **three `Button`s** in a flex row with `border` container + `aria-pressed` / `radiogroup`, or (b) add **shadcn `toggle-group`** via CLI for a11y-aligned segments. Either is acceptable if **keyboard** and **screen reader** semantics match **UI-SPEC**.
- **Field clearing on path switch:** Reset milestone array and loan-related strings when leaving paths that used them (**D-03**); align **Add** and **Edit** (**discretion** on confirm dialog documented in plan).

## Touchpoints

| Area | Files |
|------|-------|
| Sheet UX | [`src/pages/PropertyPage.tsx`](../../../src/pages/PropertyPage.tsx) |
| Optional pure helpers / tests | New `src/lib/propertyEntryPath.ts` (suggested) |
| Optional type | [`src/types/data.ts`](../../../src/types/data.ts) — only if **`entryKind`** ships |

## Risks

- **Regression:** Hiding milestones on **Fully paid** must not delete persisted milestones **until Save** — clearing **draft state** only when switching paths mid-edit, not silent persist.
- **Copy drift:** Subtitle + helpers must stay consistent with **dashboard** equity language (**CONTEXT** canonical refs).

---

## Validation Architecture

Phase **31** is primarily **UI behavior**. Automated coverage:

- **Vitest** for **pure helpers** (path inference, “fields to clear” lists, optional label mapping) if extracted to `src/lib/`.
- **`npm test`** + **`tsc`** required green after each task.
- **Manual UAT** per roadmap success criteria: walk **three paths** on Add and Edit, verify irrelevant sections hidden and helper copy present.

No database migrations — **localStorage** document shape unchanged unless **`entryKind`** added (optional).

---

## RESEARCH COMPLETE
