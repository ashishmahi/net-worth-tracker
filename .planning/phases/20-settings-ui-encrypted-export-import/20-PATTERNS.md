# Phase 20 — Pattern Map

**Generated:** 2026-05-02 (inline planner — gsd-pattern-mapper agents not installed)

## Target file

| File | Role |
|------|------|
| `src/pages/SettingsPage.tsx` | Sole modification surface for ENC-01 / ENC-04 / ENC-05 / ENC-06 |

## Analog: busy + inline error (reuse)

- **State:** `importBusy`, `importParseError`, `importValidationError` (lines ~113–120)
- **Spinner:** `Loader2` inside Button when busy (`SettingsPage.tsx` ~584–586, dialog confirm ~643–646)
- **Alert:** `<p role="alert" className="text-sm text-destructive">` (~592–594)

## Analog: export download

- **Function:** `handleExport(data)` — Blob, `URL.createObjectURL`, `<a download>`, revoke (~31–42)

## Analog: import parse → validate → dialog

- **Handler:** `onImportFileChange` — read file, JSON.parse, `parseAppDataFromImport`, then dialog (~220–254)
- **Extension:** After JSON.parse, branch if `(raw as Record<string, unknown>).encrypted === true` before `parseAppDataFromImport`.

## Crypto (read-only for this phase)

- `src/lib/cryptoUtils.ts` — `encryptData`, `decryptData`, `isCryptoError`, `EncryptedEnvelope`

## UI contract

- `.planning/phases/20-settings-ui-encrypted-export-import/20-UI-SPEC.md` — spacing, Decrypt as primary button, password + Eye toggle

## PATTERN MAPPING COMPLETE
