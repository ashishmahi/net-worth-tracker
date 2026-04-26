---
phase: 09
slug: data-reset
status: approved
extends:
  - ../../milestones/v1.1-phases/06-dark-mode/06-UI-SPEC.md
  - ../../milestones/v1.1-phases/07-mobile-foundation/07-UI-SPEC.md
  - ../../milestones/v1.1-phases/08-mobile-page-fixes/08-UI-SPEC.md
created: 2026-04-26
---

# Phase 9 — UI design contract (Data reset)

> Visual and interaction contract for **Settings → danger zone** + **AlertDialog** confirm before full data clear. Aligned with `09-CONTEXT.md` and **DATA-01, DATA-02, DATA-03** / ROADMAP Phase 9.

**Scope:** `SettingsPage` only for new UI. **Inherits** shadcn, Tailwind, 768px mobile patterns, touch targets from prior UI-SPECs. **No** new routes.

---

## DATA-01 — Entry: danger zone

| Topic | Contract |
|--------|------------|
| **Placement** | New block **below** the existing **Data** row that contains **Export Data** (export stays **outline**, non-destructive). |
| **Container** | **Card** (or equivalent) with **visible danger** treatment: e.g. `border-destructive/30` or `bg-destructive/5` and heading **"Danger zone"** (or **"Reset data"**). |
| **Description** | 1–2 lines: removes **all** net-worth / asset data stored in the local **file** — **not** the full legalese (that is in the dialog). |
| **Primary control** | Single **"Clear all data"** `Button` **`variant="destructive"`** (not a Save, not primary blue). |

---

## DATA-02 — AlertDialog

| Topic | Contract |
|--------|------------|
| **Component** | `AlertDialog` from `@/components/ui/alert-dialog` (controlled `open` / `onOpenChange`). |
| **Title** | Irreversible / permanent data loss, plain language. |
| **Description** | **(a)** Not undoable. **(b)** **All** rows in **`data.json`** (wealth) removed. **(c)** Backup: use **Export Data** (above) first if a copy is needed. |
| **Footer** | **Left/safe first on narrow** per `AlertDialogFooter` (column-reverse on `sm` — Radix `flex-col-reverse`): `AlertDialogCancel` → e.g. **"Cancel"**; **separate** `Button` `variant="destructive"` (not a generic **OK**). **Confirm** label: **"Yes, clear all data"** (or equivalent explicit destructive phrase). |
| **Async** | `onClick` on destructive **Button** runs `async` `saveData(createInitialData())`; **do not** use `AlertDialogAction` alone if it would close before save completes. **Disable** buttons or show **saving** state on confirm while the request is in flight. **Close** dialog `onOpenChange(false)` on **success**; leave open or show error on **failure** (error also inline under danger block). |
| **Single mis-click** | Opening the dialog (first click) is not enough; user must **click destructive** in the dialog. **Cancel** is always available. |

---

## DATA-03 / feedback (inline, no toasts)

| Topic | Contract |
|--------|------------|
| **Failure** | `role="alert"`, `text-destructive`, in danger block: same **tone** as other Settings save errors (e.g. app not running / save failed). |
| **Success** | Short **inline** message in danger block, e.g. **"All data has been cleared."** Muted/secondary text acceptable. **Claude’s discretion:** clear on navigation or after timeout. |
| **Theme** | Do **not** add toast/Sonner; not in the stack. |

---

## Out of scope (UI)

- **Row-level** delete, **per-asset** reset UI  
- **Charts** / export **flows** (export **button** retained as today)  
- **Desktop-only** new patterns — Settings remains responsive with existing `space-y-8` layout.

---

*Contract locked for plans — `09-01-PLAN`, `09-02-PLAN`.*
