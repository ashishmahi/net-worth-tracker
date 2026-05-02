# Phase 20: Settings UI — Encrypted Export & Import - Research

**Researched:** 2026-05-02
**Domain:** React state management, file I/O UX patterns, Web Crypto API integration in UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Always-visible single passphrase input in Export block (above "Export Data"). No toggle, no expand. Label: "Passphrase (optional)".
- **D-02:** Single passphrase field only — no confirm field. Typo risk is user's responsibility. Show/hide toggle (D-07) mitigates this.
- **D-03:** One "Export Data" button for both paths. Blank passphrase → plain JSON (existing `handleExport`). Non-empty → `encryptData(JSON.stringify(data), passphrase)` → download envelope as `.json`.
- **D-04:** Export inline error: `<p role="alert" className="text-sm text-destructive">` below button. Success: download triggers automatically, no additional UI.
- **D-05:** After file selection, if parsed JSON has `encrypted: true`, skip existing confirmation dialog. Show inline passphrase field + "Decrypt" button. Flow: file picked → parse → detect `encrypted: true` → show passphrase prompt → user clicks Decrypt → `decryptData(envelope, passphrase)` → on success: `JSON.parse(plaintext)` → `parseAppDataFromImport` → open existing AlertDialog. Wrong passphrase: inline error, loaded data unchanged.
- **D-06:** Import passphrase field clears when user picks new file or cancels.
- **D-07:** Both passphrase inputs use `type="password"` with show/hide toggle (Eye/EyeOff from lucide-react). Toggle switches via local state.
- **D-08:** Export and Import/Decrypt buttons show `Loader2` spinner and are disabled during crypto operation — consistent with `goldSaving`/`importBusy` patterns.
- **D-09:** Export busy: new `exportBusy` boolean. Import decrypt busy: reuse or extend `importBusy`.
- **D-10:** Use `isCryptoError(e)` from `@/lib/cryptoUtils` in import catch. Wrong passphrase → "Wrong passphrase — the file could not be decrypted." Other errors → "Decryption failed. Check that the app is running and try again."
- **D-11:** All errors inline — no toasts, no dialogs. Use `<p role="alert" className="text-sm text-destructive">`.

### Claude's Discretion

- Exact placeholder / helper text for the export passphrase field (e.g. "Leave blank for plain JSON")
- Whether to add a lock icon next to "Export Data" or the passphrase field
- State variable naming conventions (consistent with `importBusy`, `importParseError` patterns)
- Whether to use `<div>` or `<Card>` wrapper for inline decrypt passphrase block

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENC-01 | User can enter an optional passphrase in the Export section; blank exports plain JSON | D-01–D-04 in CONTEXT.md: export passphrase field + conditional branch in handler |
| ENC-04 | Import auto-detects an encrypted file and prompts for passphrase only when encrypted | D-05–D-06: `envelope.encrypted === true` branch in `onImportFileChange` |
| ENC-05 | User can import an encrypted file by entering the correct passphrase; data loads normally | D-05 success path: `decryptData` → `JSON.parse` → `parseAppDataFromImport` → AlertDialog |
| ENC-06 | User sees a clear inline error when import fails due to wrong or missing passphrase | D-10–D-11: `isCryptoError` catch, inline `<p role="alert">` error |
</phase_requirements>

---

## Summary

Phase 20 is a pure UI integration task. The cryptographic primitives (`encryptData`, `decryptData`, `isCryptoError`, `EncryptedEnvelope`) are fully implemented and tested in Phase 19 (`src/lib/cryptoUtils.ts`). No new libraries, no new routes, no schema changes are required. The entire scope is a targeted modification of `src/pages/SettingsPage.tsx`.

The work has two distinct surfaces: (1) the Export block gains a new `exportPassphrase` state field and a conditional branch in the export handler; (2) the Import block's `onImportFileChange` gains an early-exit encrypted path that stores the raw envelope in a new `pendingEncryptedEnvelope` state and conditionally renders an inline passphrase prompt below the Import button. Both surfaces must replicate the existing `importBusy`/`Loader2`/inline-error patterns precisely.

The one architectural wrinkle is the async nature of PBKDF2 (600k iterations, ~250ms per operation as measured by Phase 19 tests). During that window the triggering button must be disabled and show a spinner, which is straightforward with the `exportBusy` / `importBusy` patterns already present in the file.

**Primary recommendation:** Extend `SettingsPage.tsx` in-place, adding six new state variables and two new conditional render blocks within the existing Data section. No new components are needed.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| AES-256-GCM encryption/decryption | Browser (Web Crypto API) | — | Already implemented in `cryptoUtils.ts` — pure client-side, no server call |
| Passphrase UI (show/hide toggle) | Browser / React component | — | Local `useState` for `showPassphrase` boolean |
| Encrypted file detection | Browser / React event handler | — | Inline branch in `onImportFileChange` after JSON.parse |
| File download (encrypted or plain) | Browser / `<a>` element trigger | — | Same Blob/URL.createObjectURL pattern as existing `handleExport` |
| Inline error display | Browser / React render | — | Conditional `<p role="alert">` — no state lifted higher |
| Busy/loading state | Browser / React component state | — | Local `exportBusy`, `importBusy` booleans |

---

## Standard Stack

### Core (verified in repo)

| Library | Installed Version | Purpose | Source |
|---------|------------------|---------|--------|
| `lucide-react` | 1.12.0 | Eye, EyeOff, Loader2, Lock icons | [VERIFIED: node_modules] |
| `@/lib/cryptoUtils` | Phase 19 complete | encryptData, decryptData, isCryptoError, EncryptedEnvelope | [VERIFIED: src/lib/cryptoUtils.ts] |
| shadcn/ui `Input`, `Button`, `Card`, `Label` | existing | Form controls | [VERIFIED: src/components/ui/] |
| shadcn/ui `AlertDialog` | existing | Confirmation dialog (reused, not changed) | [VERIFIED: src/pages/SettingsPage.tsx] |
| React `useState` | React 18.3 | All new local state | [VERIFIED: package.json] |

### No New Dependencies

This phase introduces zero new npm packages. All required capabilities are either browser-native (Web Crypto API, Blob, URL.createObjectURL) or already installed.

---

## Architecture Patterns

### System Architecture Diagram

```
User action: Export Data button click
    │
    ▼
exportPassphrase.trim() === ''?
    ├─ YES → handleExport(data)           [existing plain JSON path — unchanged]
    └─ NO  → setExportBusy(true)
                │
                ▼
            encryptData(JSON.stringify(data), exportPassphrase)
                │
                ├─ SUCCESS → build Blob → trigger download → setExportBusy(false)
                └─ ERROR   → setExportError(message) → setExportBusy(false)

User action: Import from JSON file selected
    │
    ▼
JSON.parse(file.text())
    │
    ├─ PARSE FAILS → setImportParseError(...)
    │
    ▼
(raw as Record<string,unknown>).encrypted === true?
    ├─ YES → setPendingEncryptedEnvelope(raw as EncryptedEnvelope)
    │            → renders inline passphrase + Decrypt button
    │
    │            User clicks Decrypt
    │                │
    │                ▼
    │            setImportBusy(true)
    │            decryptData(pendingEncryptedEnvelope, importDecryptPassphrase)
    │                │
    │                ├─ SUCCESS → JSON.parse(plaintext) → parseAppDataFromImport
    │                │              → setPendingImport → setImportDialogOpen(true)
    │                └─ ERROR (isCryptoError) → setImportDecryptError("Wrong passphrase…")
    │                   ERROR (other)         → setImportDecryptError("Decryption failed…")
    │
    └─ NO → parseAppDataFromImport(raw)   [existing plain path — unchanged]
                → setPendingImport → setImportDialogOpen(true)
```

### Recommended State Variables (new additions)

```typescript
// Export side (D-01, D-03, D-04, D-09)
const [exportPassphrase, setExportPassphrase] = useState('')
const [showExportPassphrase, setShowExportPassphrase] = useState(false)
const [exportBusy, setExportBusy] = useState(false)
const [exportError, setExportError] = useState<string | null>(null)

// Import decrypt side (D-05, D-06, D-09, D-10)
const [pendingEncryptedEnvelope, setPendingEncryptedEnvelope] = useState<EncryptedEnvelope | null>(null)
const [importDecryptPassphrase, setImportDecryptPassphrase] = useState('')
const [showImportDecryptPassphrase, setShowImportDecryptPassphrase] = useState(false)
const [importDecryptError, setImportDecryptError] = useState<string | null>(null)
```

**Naming rationale:** Follows the existing `xBusy` / `xError` / `xSuccess` per-block pattern (`goldSaving`, `goldSaveError`; `importBusy`, `importParseError`). Prefixes make lint-searchable clusters. `exportBusy` is new (D-09); `importBusy` covers the decrypt wait — no second busy variable needed for decrypt because the decrypt button IS the import trigger for the encrypted path.

### Key Branch in `onImportFileChange`

```typescript
// Source: CONTEXT.md D-05 + existing onImportFileChange pattern
// Insert after JSON.parse succeeds, before parseAppDataFromImport call:

const rawRecord = raw as Record<string, unknown>
if (rawRecord.encrypted === true) {
  // Encrypted path — store envelope, show inline prompt
  setPendingEncryptedEnvelope(raw as EncryptedEnvelope)
  return          // do NOT open AlertDialog yet
}
// Plain path continues unchanged...
```

**Critical:** The `return` prevents the existing `parseAppDataFromImport` → `setPendingImport` → `setImportDialogOpen(true)` chain from firing. The `finally { setImportBusy(false) }` block still runs, which is correct.

### Show/Hide Password Toggle Pattern

```typescript
// Source: D-07 from CONTEXT.md — pattern to use for both fields
<div className="relative">
  <Input
    id="export-passphrase"
    type={showExportPassphrase ? 'text' : 'password'}
    value={exportPassphrase}
    onChange={e => setExportPassphrase(e.target.value)}
    placeholder="Leave blank for plain JSON"
  />
  <button
    type="button"
    aria-label={showExportPassphrase ? 'Hide passphrase' : 'Show passphrase'}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    onClick={() => setShowExportPassphrase(v => !v)}
  >
    {showExportPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

### Export Handler Extension

```typescript
// Source: D-03 from CONTEXT.md + existing handleExport (SettingsPage.tsx:31–42)
const handleExportClick = async () => {
  setExportError(null)
  if (!exportPassphrase.trim()) {
    handleExport(data)   // existing plain path — unchanged
    return
  }
  setExportBusy(true)
  try {
    const envelope = await encryptData(JSON.stringify(data), exportPassphrase)
    const json = JSON.stringify(envelope, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wealth-tracker-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    setExportError('Encryption failed. Check that the app is running and try again.')
  } finally {
    setExportBusy(false)
  }
}
```

### Decrypt Handler (new)

```typescript
// Source: D-05, D-10 from CONTEXT.md
const handleDecryptImport = async () => {
  if (!pendingEncryptedEnvelope) return
  setImportDecryptError(null)
  setImportBusy(true)
  try {
    const plaintext = await decryptData(pendingEncryptedEnvelope, importDecryptPassphrase)
    const raw: unknown = JSON.parse(plaintext)
    const result = parseAppDataFromImport(raw)
    if (!result.success) {
      setImportValidationError('This file is not valid app data…')
      setImportValidationHint(zodFirstHint(result.zodError))
      setPendingEncryptedEnvelope(null)
      return
    }
    setPendingImport(result.data)
    setImportDialogOpen(true)
  } catch (e) {
    if (isCryptoError(e)) {
      setImportDecryptError('Wrong passphrase — the file could not be decrypted.')
    } else {
      setImportDecryptError('Decryption failed. Check that the app is running and try again.')
    }
  } finally {
    setImportBusy(false)
  }
}
```

### Reset on New File Selection

```typescript
// D-06: clear decrypt state when a new file is picked
// Add to beginning of onImportFileChange:
setPendingEncryptedEnvelope(null)
setImportDecryptPassphrase('')
setShowImportDecryptPassphrase(false)
setImportDecryptError(null)
```

### Anti-Patterns to Avoid

- **Passing the raw envelope type unsafely:** Cast with `raw as EncryptedEnvelope` only after confirming `encrypted === true` and `version === 1` — the type check in CONTEXT.md `D-05` is the gate.
- **Opening AlertDialog directly from decrypt success:** Must go through `setPendingImport` + `setImportDialogOpen(true)` (existing flow) so the confirmation step is preserved.
- **Not resetting `pendingEncryptedEnvelope` after AlertDialog cancel:** When user cancels the confirmation dialog, also reset `pendingEncryptedEnvelope` and `importDecryptPassphrase` to avoid stale state.
- **Using `z.number()` for the passphrase field:** Passphrase is NOT a financial input — no `parseFinancialInput`. Plain `e.target.value` string assignment is correct.
- **Calling `setImportBusy(false)` twice:** `decryptData` and `saveData` both need the `importBusy` flag. Keep `handleDecryptImport` setting `importBusy` for decrypt; `onConfirmImport` already sets it for save. They are separate invocations, so no double-set risk.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Encryption/decryption | Custom crypto logic | `encryptData` / `decryptData` from `@/lib/cryptoUtils` | Already implemented, tested, correct PBKDF2+AES-GCM (Phase 19) |
| Wrong-passphrase detection | `(e as any).code === 'WRONG_PASSPHRASE'` | `isCryptoError(e)` type guard | Type-safe, already exported from cryptoUtils |
| Icon SVGs | Inline SVGs for Eye/EyeOff | `Eye` / `EyeOff` from `lucide-react` | Already installed (v1.12.0), matches existing `Loader2` usage |
| File download | Custom `fetch` or `sendBeacon` | Blob + `URL.createObjectURL` + `<a>` click | Same pattern as `handleExport` — proven, no deps |

**Key insight:** Phase 19 exists precisely so Phase 20 never needs to think about crypto. Import from `@/lib/cryptoUtils` and trust the implementation.

---

## Common Pitfalls

### Pitfall 1: Forgetting to reset `pendingEncryptedEnvelope` on dialog cancel

**What goes wrong:** User picks encrypted file, enters passphrase, succeeds, then cancels the "Replace with imported data?" dialog. They pick a new plain JSON file next — but `pendingEncryptedEnvelope` is still set, causing the decrypt block to re-appear spuriously.

**Why it happens:** `onOpenChange` for the AlertDialog resets `pendingImport` and `importSaveError`, but the current code does not know about `pendingEncryptedEnvelope`.

**How to avoid:** In the AlertDialog `onOpenChange` handler (line 608–614), add `setPendingEncryptedEnvelope(null)` and `setImportDecryptPassphrase('')` alongside the existing `setPendingImport(null)` reset.

**Warning signs:** QA finds that closing the confirm dialog without importing leaves the decrypt block visible.

---

### Pitfall 2: `importBusy` double-spin (decrypt + save)

**What goes wrong:** `importBusy` is used for both the decrypt operation (new) and the save-after-confirm operation (existing). If a test or fast user triggers both in quick succession, the flag may be in an unexpected state.

**Why it happens:** `handleDecryptImport` sets `importBusy(true)` then `finally` sets it `false`. But `onConfirmImport` also sets/unsets `importBusy`. These are sequential (decrypt → dialog → save), not overlapping — so there is no real race. The risk is only if the dialog appears before `setImportBusy(false)` fires.

**How to avoid:** Ensure `setImportBusy(false)` fires in `handleDecryptImport`'s `finally` before `setImportDialogOpen(true)`. The existing `try/finally` structure in `handleDecryptImport` guarantees this.

**Warning signs:** Import button stays permanently disabled after decryption.

---

### Pitfall 3: `encryptData` takes ~250ms — UI must not freeze

**What goes wrong:** Clicking "Export Data" with a passphrase appears to hang for ~250ms (PBKDF2 600k iterations). Without `exportBusy` the button stays enabled and could be double-clicked.

**Why it happens:** Web Crypto API is async but the 600k iteration count (OWASP 2024) is intentionally slow to resist brute force. This is expected per Phase 19 D-08.

**How to avoid:** `setExportBusy(true)` before `await encryptData(...)` and `finally { setExportBusy(false) }`. The button's `disabled={exportBusy}` prevents double-click.

**Warning signs:** Multiple download triggers on fast double-click.

---

### Pitfall 4: Export passphrase field is never cleared after export

**What goes wrong:** After a successful encrypted export, the passphrase field retains the entered value. The user might not notice — if they then click Export again intending a plain export, they get another encrypted file.

**Why it happens:** Controlled `exportPassphrase` state is not reset after the download triggers.

**How to avoid:** After the successful download, add `setExportPassphrase('')`. This is a UX decision left to Claude's discretion per CONTEXT.md, but the default should be to clear it for safety. Keep `showExportPassphrase` as-is (clearing it is optional).

**Warning signs:** User confusion — exported file is encrypted when plain was expected.

---

### Pitfall 5: `type="password"` input + relative positioning for the eye button

**What goes wrong:** The `Input` shadcn component adds padding (`px-3 py-2`) but no right-side room for an icon. An absolutely-positioned eye button overlaps the last characters of a long passphrase.

**Why it happens:** Standard shadcn `Input` does not have a right-slot by design.

**How to avoid:** Wrap the `Input` in `<div className="relative">` and add `className="pr-10"` to the `Input` to create space for the 40px-wide icon button. Position the button with `absolute right-2 top-1/2 -translate-y-1/2`.

**Warning signs:** Eye button visually overlaps input text on mobile.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| ENC-01 | Blank passphrase → plain JSON export (existing handleExport) | manual-only (file download, DOM click) | — | — |
| ENC-01 | Non-blank passphrase → encryptData called, file downloaded | manual-only (DOM trigger) | — | — |
| ENC-04 | `encrypted: true` in parsed JSON → passphrase prompt appears | manual-only (DOM branch) | — | — |
| ENC-04 | Plain JSON → existing dialog path, no passphrase prompt | manual-only | — | — |
| ENC-05 | Correct passphrase → decryptData succeeds → AppData loads | integration (crypto round-trip covered by Phase 19 tests) | `npm test` (cryptoUtils.test.ts) | ✅ existing |
| ENC-06 | Wrong passphrase → inline error, isCryptoError fires | integration (covered by Phase 19 tests) | `npm test` (cryptoUtils.test.ts) | ✅ existing |

**Manual-only justification:** ENC-01, ENC-04 require DOM interaction (file input change, button clicks, Blob download) that would need a full browser environment or heavy mocking. The underlying crypto behaviour is fully tested in Phase 19. SettingsPage.tsx has no existing test file and creating one is out of scope for this phase.

### Wave 0 Gaps

None — existing test infrastructure covers all crypto behaviour. No new test files required for Phase 20.

*(All ENC-0x crypto correctness is validated in `src/lib/__tests__/cryptoUtils.test.ts`. UI wiring is verified by manual smoke-test per the success criteria in the phase description.)*

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | passphrase is a raw string; no injection risk (passed to Web Crypto API, not concatenated into queries) |
| V6 Cryptography | yes | AES-256-GCM + PBKDF2 SHA-256 600k iterations — implemented in Phase 19 using Web Crypto API; no hand-rolled crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Passphrase visible in DOM | Information Disclosure | `type="password"` by default; show/hide toggle controlled by user (D-07) |
| Passphrase in browser history / autofill | Information Disclosure | `autocomplete="new-password"` or `autocomplete="off"` on passphrase inputs — add to both inputs |
| Encrypted file with wrong version field | Tampering | `decryptData` checks `envelope.version === 1` and throws tagged error before any crypto operation |
| Double-click export creating multiple downloads | Spoofing/DoS | `exportBusy` disables button during async operation |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — phase is pure in-browser JS/TS with no CLI tools, databases, or services beyond the already-running Vite dev server).

---

## Code Examples

### Import line to add at top of SettingsPage.tsx

```typescript
// Source: VERIFIED src/lib/cryptoUtils.ts
import { encryptData, decryptData, isCryptoError } from '@/lib/cryptoUtils'
import type { EncryptedEnvelope } from '@/lib/cryptoUtils'
import { Eye, EyeOff } from 'lucide-react'
```

Note: `Loader2` is already imported on line 6 of SettingsPage.tsx. `Eye` and `EyeOff` are confirmed available in lucide-react 1.12.0. [VERIFIED: node_modules/lucide-react/dist/cjs]

### Conditional render for import decrypt block

```typescript
{/* Inline decrypt block — only when encrypted file detected (D-05) */}
{pendingEncryptedEnvelope !== null && (
  <div className="mt-3 space-y-2">
    <Label htmlFor="import-decrypt-passphrase">Passphrase</Label>
    <div className="relative">
      <Input
        id="import-decrypt-passphrase"
        type={showImportDecryptPassphrase ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Enter passphrase to decrypt"
        value={importDecryptPassphrase}
        onChange={e => setImportDecryptPassphrase(e.target.value)}
        className="pr-10"
        disabled={importBusy}
      />
      <button
        type="button"
        aria-label={showImportDecryptPassphrase ? 'Hide passphrase' : 'Show passphrase'}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShowImportDecryptPassphrase(v => !v)}
      >
        {showImportDecryptPassphrase
          ? <EyeOff className="h-4 w-4" aria-hidden />
          : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
    {importDecryptError && (
      <p role="alert" className="text-sm text-destructive">{importDecryptError}</p>
    )}
    <Button
      type="button"
      disabled={importBusy}
      onClick={() => { void handleDecryptImport() }}
    >
      {importBusy
        ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />Decrypting…</>
        : 'Decrypt'}
    </Button>
  </div>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plain JSON export only | Optional passphrase → AES-256-GCM encrypted export | Phase 19 (2026-05-02) | Export file is cryptographically protected when passphrase provided |
| Import assumes plain JSON | Auto-detect `encrypted: true` → conditional passphrase prompt | Phase 20 (this phase) | Backward-compatible: plain imports unchanged |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `autocomplete="new-password"` (export) and `autocomplete="current-password"` (import) are appropriate hints for passphrase inputs | Security Domain | Browser may still autofill; low risk for local app |

**All other claims in this research were verified against the codebase (`src/pages/SettingsPage.tsx`, `src/lib/cryptoUtils.ts`, `package.json`, `node_modules`).**

---

## Open Questions

1. **Should `exportPassphrase` be cleared after successful export?**
   - What we know: D-03 says download triggers automatically with no additional UI feedback. Clearing is not specified.
   - What's unclear: Desirable UX — clearing prevents accidental double-encryption; retaining lets user re-export with same passphrase without retyping.
   - Recommendation: Clear after success (safer default). This is Claude's discretion per CONTEXT.md.

2. **`autocomplete` attribute on passphrase inputs**
   - What we know: CONTEXT.md does not specify. `type="password"` is specified.
   - What's unclear: Whether `autocomplete="off"` or `autocomplete="new-password"/"current-password"` is preferred.
   - Recommendation: Use `autocomplete="off"` on export (new passphrase, should not be saved) and `autocomplete="current-password"` on import (may help password managers that stored it). Low stakes for a local app.

---

## Sources

### Primary (HIGH confidence)
- `src/pages/SettingsPage.tsx` (lines 1–738) — full existing implementation read and verified
- `src/lib/cryptoUtils.ts` — Phase 19 crypto utilities: all exports, types, error contracts verified
- `package.json` + `node_modules` — dependency versions (lucide-react 1.12.0, react 18.3.x, vitest 4.1.5) verified
- `.planning/phases/20-settings-ui-encrypted-export-import/20-CONTEXT.md` — all locked decisions and phase boundary
- `.planning/phases/19-crypto-utilities/19-CONTEXT.md` — upstream crypto contract
- `.planning/REQUIREMENTS.md` — ENC-01, ENC-04, ENC-05, ENC-06 definitions

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — project history and v1.6 design notes
- `src/lib/__tests__/cryptoUtils.test.ts` — confirmed test coverage for Phase 19 primitives

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in node_modules and source files
- Architecture: HIGH — entire SettingsPage.tsx read, all integration points confirmed
- Pitfalls: HIGH — derived from direct code inspection of state management patterns and async flow
- Validation architecture: HIGH — vitest.config.ts and test files read directly

**Research date:** 2026-05-02
**Valid until:** 2026-06-01 (stable codebase — no dependency churn expected)
