# Phase 33 — Technical research

**Question:** What do we need to know to implement Property sheet responsive layout and accessibility (**PRA-01**, **33-CONTEXT**) well?

## RESEARCH COMPLETE

---

## 1. Current implementation (baseline)

- **`PropertyPage.tsx`** — **`SheetContent`** (`max-h-[100dvh]`, `overflow-hidden`, flex column); scrollable region **`overflow-y-auto`**; path picker is **`role="radiogroup"`** with three **`Button`** **`role="radio"`** children in **`grid grid-cols-3`** (**always three columns** — cramped on narrow widths).
- **Milestones** — Wrapper **`overflow-x-auto`** + **`Table`** with **`min-w-[36rem]`**; no scroll hint copy yet.
- **Focus on open** — No imperative focus to path controls; Radix Sheet may focus first focusable — **D-08** requires first **path** button.
- **Keyboard** — Path buttons are separate tab stops; **no** roving **`tabIndex`** / arrow navigation within **`radiogroup`** yet (**D-06**).

## 2. Responsive strategy (**D-05**)

**Recommendation:** Use Tailwind responsive utilities: e.g. **`grid grid-cols-1 sm:grid-cols-3`** (or **`max-sm:`** variant) so **xs** stacks vertically and **`sm+`** uses three columns. Preserve **`gap-1`**, border container, and **`min-h-10`** button sizing.

**Orientation for arrow keys:** Derive from CSS breakpoint / **`window.matchMedia('(min-width: 640px)')`** in a **`useEffect`** or read **`window.getComputedStyle`** on the container — simpler approach: use a **`useMediaQuery('(min-width: 640px)')`** hook (add small hook if none exists) so arrow mapping matches layout.

## 3. Radiogroup keyboard pattern (**D-06**, **D-07**)

**Recommendation:**

- **Roving tabindex (optional):** WAI-ARIA APG recommends either native `<input type="radio">` or roving `tabindex` on radios. Here we use **Button**s — keep **one** `tabIndex={0}` on the **selected** path and **`tabIndex={-1}`** on others **or** keep all focusable and rely on **D-07** “multiple Tab stops” — **CONTEXT planner note** allows multiple Tab stops through path buttons; **D-06** still requires **arrow** navigation between options within the group.

- **Implementation sketch:** `onKeyDown` on **`radiogroup`** `div`: **`preventDefault`** for Arrow keys when focus is inside group; move selection + **`focus()`** to adjacent button **wrap-around**. Tab leaves group per browser order (DOM order matches visual for stacked = top-to-bottom).

## 4. Initial focus (**D-08**, **D-13**)

**Recommendation:** `useEffect` when **`sheetOpen`** becomes **`true`**: `requestAnimationFrame` → `firstPathButtonRef.current?.focus()`. Guard against double-invoke in Strict Mode (optional ref guard). Ensure **Delete** / **Save** are not focused first.

## 5. Milestone scroll hint (**D-02**)

**Recommendation:** Short muted line immediately **above** or **below** the **`overflow-x-auto`** chrome, e.g. **“Scroll sideways to see all columns.”** — **`text-xs text-muted-foreground`**.

## 6. SR / disabled Save (**D-09**–**D-12**)

**Recommendation:** Before adding anything, **`grep`** `aria-live`, `disabled`, `Submit` across **`src/pages/`** for patterns. Default **lean**: **no** new **`aria-describedby`** on disabled Save (**D-10**); **no** footer helper line for disabled state (**D-12**).

## 7. Testing

- **Automated:** **`npm test -- --run`** + **`npx tsc -b`** after edits. Optional **RTL** smoke: sheet opens → first path button receives focus (if test harness supports Radix portal — may be **manual-only** if flaky).
- **Manual:** Resize to **~320px** width — path stacks; milestone table scrolls horizontally; **Tab** order path → name → …; **Arrow** keys change path when focus on path group.

## 8. Files to touch

| File | Role |
|------|------|
| **`src/pages/PropertyPage.tsx`** | Primary — grid breakpoints, scroll hint, radiogroup keyboard + optional roving tab, initial focus **`useEffect`**, refs |
| **`src/lib/`** (optional) | Small **`useMediaQuery`** or **`useBreakpoint`** if reused — only if avoids duplication |

## 9. Non-goals

- Changing **`propertyValidation`**, **`PropertyItemSchema`**, or dashboard math (**CONTEXT** boundary).
- Full redesign of milestone table (**D-01** retains scroll table).

---

## Validation Architecture

**Dimension 8 (Nyquist):** Mix of **deterministic checks** and **manual viewport/a11y spot checks**.

1. After each task: **`npm test -- --run`** (full or scoped) + **`npx tsc -b --pretty false`**.
2. **Manual:** Open Property sheet at narrow width — path layout, scroll hint visible, horizontal milestone scroll, arrow keys on path group, initial focus on first path.

**Automated oracle:** Typecheck + existing test suite green; optional RTL assertion if added without portal pain.
