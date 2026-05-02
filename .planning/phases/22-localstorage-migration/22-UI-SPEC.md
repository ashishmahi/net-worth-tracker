---
phase: 22
slug: localstorage-migration
status: draft
created: 2026-05-02
---

# Phase 22 — UI Design Contract

> Copy and messaging only. No new pages, layout grids, or shadcn components. Inherits existing Settings **Data** section structure from Phase 20/21.

---

## Scope

| In scope | Out of scope |
|----------|----------------|
| Replace user-visible references to `data.json` as *the app’s storage* with **browser storage** / **local storage** wording | Visual redesign of Settings |
| Align `AppDataProvider` boot error strings (`loadError`) with storage wording | Cross-tab sync UI |
| Zip import technical message may omit filename-as-storage metaphor | Changing zip internal entry name (`data.json` inside archive remains the contract from Phase 21) |

---

## Typography & components

Inherits Phase 20/21 Settings patterns: `text-sm`, `text-destructive`, `code` inline for emphasis where already used. No new font sizes or color tokens.

---

## Required strings (acceptance targets)

### SettingsPage — danger zone (destructive confirm flow)

- **Must not** tell the user their data lives in a **`data.json` file** on disk.
- **Must** convey that permanent deletion affects data stored **in the browser** (e.g. “browser storage” or “local storage”). Example direction: *…stored in your browser (local storage).* — exact prose left to implementation if it satisfies REQ UX-01 grep checks.

### SettingsPage — zip import validation error

- Replace **`This zip archive does not contain data.json.`** with a message that does **not** present **`data.json`** as the persistence layer. Acceptable pattern: reference a **missing data file inside the archive** or **invalid export** without naming disk files.

### AppDataContext — `loadError` (boot)

When raw bytes exist but **Zod parse fails**, user-visible text must not imply loading from **`data.json`**. Prefer **stored data** / **browser storage** framing (per `22-CONTEXT.md` D-02 discretion).

When **read/parse path fails** before schema (e.g. corrupt JSON string), prefer wording consistent with **could not read stored data** — not “network” or “file” unless accurate.

---

## Accessibility

No new interactive controls; existing dialogs and alerts keep prior `aria` patterns.

---

## UI-SPEC COMPLETE

Phase 22 messaging contract is sufficient for planning and QA.
