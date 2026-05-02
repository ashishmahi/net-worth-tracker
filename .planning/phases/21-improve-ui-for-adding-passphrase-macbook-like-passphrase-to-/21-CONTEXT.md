# Phase 21: Improve UI — Passphrase Modal + Password-Protected Zip Export - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Rework the export/import passphrase experience in `src/pages/SettingsPage.tsx`:

1. **Export format change** — Export always produces a `.zip` file (plain or AES-256 password-protected). No more plain `.json` downloads. The zip contains `data.json`; the zip's own encryption handles security (no double-wrapping with the Phase 19 envelope).

2. **Passphrase UX → modal dialog** — Remove the always-visible inline passphrase field (Phase 20). Instead, clicking "Export" opens a shadcn AlertDialog with a passphrase field. For import, picking an encrypted zip automatically opens the same style of modal.

No new pages, no new routes, no schema changes.

</domain>

<decisions>
## Implementation Decisions

### Export — File Format
- **D-01:** Export always produces a `.zip` file regardless of whether a passphrase is entered. Blank passphrase → unencrypted zip containing `data.json`. Non-blank passphrase → AES-256 password-protected zip containing `data.json`. The Phase 19 `encryptData` envelope is NOT used for the new zip-based export path.
- **D-02:** The zip file is named `wealth-tracker-YYYY-MM-DD.zip` (date-stamped using the export date).
- **D-03:** One "Export" button on the settings page — no split buttons. Clicking it always opens the passphrase modal.

### Export — Passphrase Modal
- **D-04:** Clicking "Export" immediately opens a standard shadcn `AlertDialog` containing:
  - A passphrase `Input` (type="password") with a show/hide toggle (Eye/EyeOff from lucide-react)
  - A hint: "Leave blank to export without a passphrase"
  - "Cancel" and "Export" action buttons
  - Inline error display inside the dialog if encryption fails
- **D-05:** Single passphrase field only — no confirm-passphrase second input. Show/hide toggle mitigates typo risk (user's responsibility — same as Phase 20 D-02 intent).
- **D-06:** Export button in the modal shows `Loader2` spinner and is disabled while the zip is being created.

### Import — File Format
- **D-07:** Import supports `.zip` files only going forward. Old plain `.json` and old Phase 20 encrypted envelope `.json` files are NOT supported — importing them shows a clear error: "This file format is no longer supported. Please re-export from the app."
- **D-08:** Import auto-detects whether a zip is password-protected. If unencrypted → proceed to existing data-replace confirmation (AlertDialog). If password-protected → passphrase modal opens automatically.

### Import — Passphrase Modal
- **D-09:** When a password-protected zip is detected after file selection, a shadcn `AlertDialog` opens automatically with:
  - A passphrase `Input` (type="password") with a show/hide toggle
  - "Cancel" and "Decrypt" action buttons
  - Inline error for wrong passphrase: "Wrong passphrase — the file could not be decrypted."
  - Inline error for other failures: "Decryption failed. Check that the app is running and try again."
- **D-10:** On successful decryption, the passphrase modal closes and the existing import confirmation AlertDialog opens as before.
- **D-11:** Passphrase modal and its state are cleared when the user cancels or picks a new file.

### Zip Library
- **D-12:** The researcher/planner must evaluate and select a browser-compatible JS zip library that supports AES-256 zip encryption. `JSZip` uses weak ZipCrypto (not acceptable). `zip.js` (Gildas Lormeau) supports AES-256 — likely candidate. Library choice is deferred to the research phase.

### Error Handling
- **D-13:** All errors shown inline within the respective modal dialog (not as toasts, not outside the dialog). Pattern: `<p role="alert" className="text-sm text-destructive">` — same as Phase 20 D-11.

### Backward Compatibility
- **D-14:** Clean break. Only `.zip` files are accepted on import. Old `.json` exports (plain or Phase 20 encrypted envelope) show a clear error message directing the user to re-export. This is an intentional decision — simpler code, accepted tradeoff.

### Claude's Discretion
- State variable naming for the new modal open/close booleans (consistent with existing `importBusy`, `importDialogOpen` patterns)
- Whether a single shared passphrase modal component is extracted or two separate inline dialogs are used
- Exact layout of the passphrase field within the AlertDialog (label positioning, spacing)
- How to detect password-protection on a zip without attempting full extraction (check zip central directory metadata)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 20 (what's being replaced/extended)
- `.planning/phases/20-settings-ui-encrypted-export-import/20-CONTEXT.md` — All Phase 20 decisions; D-01 through D-11 describe the inline passphrase UI being replaced by modals in this phase

### Requirements
- `.planning/REQUIREMENTS.md` — ENC-01 through ENC-06 (original encrypted export/import requirements from v1.6)

### Files to modify
- `src/pages/SettingsPage.tsx` — Main file for all changes; inline passphrase fields removed, modals added, export/import handlers updated for zip format

### Utilities
- `src/lib/cryptoUtils.ts` — `encryptData`/`decryptData`/`isCryptoError` still available but the new zip path may not use them for export (zip library handles encryption); `isCryptoError` pattern still relevant for error classification

### Zip library (to be determined in research)
- No existing zip library in the codebase — researcher must evaluate `zip.js` or equivalent for AES-256 browser zip support

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter` (SettingsPage.tsx:606–654) — the existing import confirmation dialog; passphrase modals follow same pattern
- `Eye` / `EyeOff` (lucide-react, already imported in SettingsPage.tsx:6) — show/hide toggle for passphrase fields in modals
- `Loader2` spinner + disabled-button pattern (SettingsPage.tsx:113, 584–586) — reuse for export/decrypt busy state inside modals
- `importBusy`, `exportBusy`, `importDialogOpen` boolean state pattern — extend with modal-open booleans
- `parseAppDataFromImport` (AppDataContext) — still called after successful zip decryption

### Established Patterns
- Inline errors inside dialogs: `<p role="alert" className="text-sm text-destructive">`
- Loading state: `Loader2` + disabled button
- Per-concern boolean state (e.g. `exportBusy`, `importBusy`) — one per async operation
- `type="password"` with show/hide toggle for passphrase inputs

### Integration Points
- `onImportFileChange`: entirely reworked — detect zip, detect password-protection, branch to modal or existing confirmation dialog
- Export handler: reworked to open modal → on confirm → create zip (encrypted or plain) → trigger download
- The existing encrypted envelope export path (`encryptData` → download JSON) is removed

</code_context>

<specifics>
## Specific Ideas

- The "Export" button on SettingsPage opens a passphrase modal (AlertDialog). User enters passphrase (or leaves blank) and clicks "Export" inside the modal. The zip is created and downloaded. The modal closes on success.
- For import, after file is picked and zip is detected as password-protected, the passphrase modal auto-opens (no intermediate state/button required).
- The import file `<input>` should accept `.zip` only (update `accept` attribute from `.json` to `.zip`).
- Error for unsupported file format (old `.json` imports): "This file format is no longer supported. Please re-export from the app." — shown inline on the settings page below the Import button (not inside a modal, since no modal is open at that point).

</specifics>

<deferred>
## Deferred Ideas

- **Passphrase strength indicator** — discussed but not selected; could be added in a future polish phase
- **MacOS-style lock icon / padlock visual** — discussed; user chose standard shadcn AlertDialog style instead
- **Self-decrypting HTML export** — considered alternative to zip; deferred

</deferred>

---

*Phase: 21-improve-ui-for-adding-passphrase-macbook-like-passphrase-to-*
*Context gathered: 2026-05-02*
