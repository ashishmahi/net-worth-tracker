# Phase 20: Settings UI — Encrypted Export & Import - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend `src/pages/SettingsPage.tsx` to wire `cryptoUtils.ts` into the existing Data section:

- **Export side:** An always-visible passphrase field above the Export button. Blank passphrase → plain JSON (existing behavior). Any passphrase → AES-256-GCM encrypted file via `encryptData`. Single "Export Data" button handles both paths.
- **Import side:** Auto-detect encrypted files (`envelope.encrypted === true`) after file selection. If encrypted, show an inline passphrase field + Decrypt button below the Import button. On success, proceed to the existing confirmation dialog. On wrong passphrase, show inline error without touching loaded data.

No new pages, no new routes, no schema changes.

</domain>

<decisions>
## Implementation Decisions

### Export — Passphrase UI
- **D-01:** Always-visible single passphrase input field in the Export block (above the "Export Data" button). No toggle, no expand-on-click. Label: "Passphrase (optional)".
- **D-02:** Single passphrase field only — no confirm-passphrase second input. Typo = unreadable file; user's responsibility. Show/hide toggle (see D-05) mitigates this.
- **D-03:** One "Export Data" button for both plain and encrypted export. If passphrase field is blank → call existing plain-JSON export flow. If passphrase is non-empty → call `encryptData(JSON.stringify(data), passphrase)`, then download the envelope as `.json`.
- **D-04:** Export inline error state: if `encryptData` throws for any reason, show a `<p role="alert" className="text-sm text-destructive">` below the button. Success state: download triggers automatically (no additional UI feedback needed).

### Import — Passphrase Prompt
- **D-05 (numbered for clarity):** After file selection, if parsed JSON has `encrypted: true`, skip the existing confirmation dialog. Instead, show an inline passphrase field + "Decrypt" button below the Import button. Flow:
  1. File picked → parse JSON → detect `encrypted: true`
  2. Inline passphrase field + "Decrypt" button appear
  3. User enters passphrase → clicks "Decrypt" → `decryptData(envelope, passphrase)` runs
  4. On success: `JSON.parse(plaintext)` → `parseAppDataFromImport` → opens existing AlertDialog ("Replace with imported data?") as before
  5. On wrong passphrase (`isCryptoError(e)`): inline error below the passphrase field, passphrase field stays, loaded data unchanged
- **D-06:** Inline passphrase field for import is cleared when the user picks a new file or cancels.

### Password Field Masking
- **D-07:** Both passphrase inputs (export and import) use `type="password"` by default with a show/hide toggle button (eye icon using a Lucide icon, e.g. `Eye` / `EyeOff`). Toggle switches between `type="password"` and `type="text"` via local state.

### Busy / Loading States
- **D-08:** Both Export and Import buttons (and the "Decrypt" button) show a `Loader2` spinner and are disabled during the crypto operation, consistent with `goldSaving`/`importBusy` patterns in the existing page.
- **D-09:** Export busy state: new `exportBusy` boolean state. Import decrypt busy state: reuse or extend `importBusy`.

### Error Handling
- **D-10:** Use `isCryptoError(e)` from `@/lib/cryptoUtils` in the import catch block to distinguish wrong-passphrase errors from unexpected failures. Wrong passphrase → specific message: "Wrong passphrase — the file could not be decrypted." Other errors → generic: "Decryption failed. Check that the app is running and try again."
- **D-11:** All errors shown inline (no toasts, no dialog) using `<p role="alert" className="text-sm text-destructive">` — matching existing patterns.

### Claude's Discretion
- Exact label text for the export passphrase field hint (e.g. placeholder or helper text clarifying "leave blank for plain JSON")
- Whether to add a small lock icon next to "Export Data" or the passphrase field as a visual cue
- State variable naming conventions (consistent with existing `importBusy`, `importParseError` patterns)
- Whether to use a `<div>` or `<Card>` wrapper for the inline decrypt passphrase block

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — ENC-01 (optional passphrase export), ENC-04 (auto-detect encrypted import), ENC-05 (correct passphrase loads data), ENC-06 (wrong passphrase inline error)

### Phase 19 context (crypto utility decisions)
- `.planning/phases/19-crypto-utilities/19-CONTEXT.md` — D-01–D-10: `encryptData`/`decryptData` signatures, `isCryptoError` type guard, `EncryptedEnvelope` shape, error codes

### File to modify
- `src/pages/SettingsPage.tsx` — entire existing file; all changes go here

### Utility to import from
- `src/lib/cryptoUtils.ts` — `encryptData`, `decryptData`, `isCryptoError`, `EncryptedEnvelope`, `CryptoError`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `handleExport(data)` (SettingsPage.tsx:31–42) — existing plain-JSON download; encrypted export wraps this pattern (replace `json` with `JSON.stringify(envelope)`)
- `importBusy` / `Loader2` spinner pattern (SettingsPage.tsx:113, 584–586) — reuse for decrypt busy state
- `importParseError` / `importValidationError` inline error pattern (SettingsPage.tsx:590–598) — reuse for passphrase error
- `parseAppDataFromImport` (AppDataContext) — still used after successful decryption
- `onImportFileChange` (SettingsPage.tsx:220–253) — extend to detect `encrypted: true` before proceeding to existing flow
- `AlertDialog` (SettingsPage.tsx:606–654) — confirmation dialog, still used after successful decryption
- `Eye` / `EyeOff` icons from `lucide-react` — available, use for show/hide toggle

### Established Patterns
- Inline errors: `<p role="alert" className="text-sm text-destructive">`
- Loading state: `Loader2` + disabled button
- Per-block save state: separate `xSaving`/`xError` booleans per concern (not global)
- `type="text" inputMode="decimal"` for financial inputs — passphrase is `type="password"` (not financial)

### Integration Points
- `onImportFileChange`: branch at the point after JSON parsing — if `(raw as any).encrypted === true` → encrypted path, else → existing plain path
- `handleExport`: keep as-is for plain path; add new `handleEncryptedExport` or extend inline for encrypted path

</code_context>

<specifics>
## Specific Ideas

- The encrypted export button flow: blank passphrase → `handleExport(data)` unchanged; non-blank → `encryptData(JSON.stringify(data), passphrase)` → download envelope as JSON with same filename pattern
- Import encrypted detection: `typeof raw === 'object' && raw !== null && (raw as Record<string, unknown>).encrypted === true` before calling `parseAppDataFromImport`
- The inline decrypt block (passphrase + Decrypt button) appears as a new UI section in the Data card area, below the Import button, only when `pendingEncryptedEnvelope !== null`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 20-settings-ui-encrypted-export-import*
*Context gathered: 2026-05-02*
