---
status: complete
phase: 20-settings-ui-encrypted-export-import
source: [20-01-SUMMARY.md]
started: "2026-05-02T12:40:00.000Z"
updated: "2026-05-02T18:00:00.000Z"
---

## Current Test

[testing complete]

## Tests

### 1. Export with blank passphrase — plain JSON
expected: Blank passphrase export downloads plain JSON; file is not an encrypted envelope (no `"encrypted": true` at root).
result: pass

### 2. Export with passphrase — encrypted envelope
expected: After entering a non-blank passphrase and clicking Export, the downloaded JSON has `"encrypted": true` and `version`, `salt`, `iv`, `data` fields. While exporting, the Export button shows a busy state and is disabled with Import.
result: pass

### 3. Import plain JSON — no decrypt UI
expected: With "Import from JSON", selecting a normal app export file (plain JSON) does NOT show the inline Passphrase / Decrypt block; the usual "Replace with imported data?" dialog appears if validation passes (or validation errors if invalid).
result: pass

### 4. Import encrypted file — decrypt UI and success path
expected: Selecting an encrypted envelope file shows inline Passphrase label, password field with eye toggle, and a primary "Decrypt" button. Correct passphrase → decrypt succeeds → same confirmation dialog as plain import → confirming replaces data (per existing behavior).
result: pass

### 5. Wrong or empty decrypt passphrase — inline error
expected: For an encrypted file, empty passphrase or wrong passphrase after clicking Decrypt shows the inline destructive message "Wrong passphrase — the file could not be decrypted." (or the generic decrypt message if applicable). Live wealth data is unchanged until you confirm Import in the dialog.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
