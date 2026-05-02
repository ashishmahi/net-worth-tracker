# Phase 21: Improve UI — Passphrase Modal + Zip Export - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 21-improve-ui-for-adding-passphrase-macbook-like-passphrase-to-
**Areas discussed:** "MacBook-like" file format, Passphrase UI improvements, Backward compatibility

---

## "MacBook-like" File Format

| Option | Description | Selected |
|--------|-------------|----------|
| Password-protected zip | AES-256 encrypted .zip; native macOS Archive Utility password dialog | ✓ |
| Self-decrypting HTML | .html file with built-in unlock form; opens in browser | |
| Keep .json, improve UI only | No format change; improve passphrase UI design only | |

**User's choice:** Password-protected zip

---

| Option | Description | Selected |
|--------|-------------|----------|
| Plain data.json inside zip | Zip handles all encryption; plain JSON inside | ✓ |
| Encrypted envelope inside zip | Double-encryption; Phase 19 envelope wrapped in zip | |

**User's choice:** Plain data.json — zip's own encryption handles security

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — blank passphrase = plain .json | Preserve existing plain export | |
| No — always export as zip | All exports become .zip regardless of passphrase | ✓ |

**User's choice:** Always export as zip

---

| Option | Description | Selected |
|--------|-------------|----------|
| wealth-tracker-YYYY-MM-DD.zip | Date-stamped filename | ✓ |
| wealth-tracker-backup.zip | Fixed filename | |
| You decide | Claude picks naming | |

**User's choice:** wealth-tracker-YYYY-MM-DD.zip

---

## Passphrase UI Improvements

**User interrupt (freeform input):** "during import and export, use popup to enter passphrase. not just inline passphrase input."

This overrides Phase 20's always-visible inline passphrase field. Passphrase entry moves to a modal dialog for both export and import.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Click "Export" → modal opens immediately | Single button; modal always pops | ✓ |
| Two buttons: "Export" and "Export Encrypted" | Separate buttons for plain vs encrypted | |

**User's choice:** Single Export button, modal always opens

---

| Option | Description | Selected |
|--------|-------------|----------|
| macOS-style: lock icon + custom design | Visually distinct, MacBook feel | |
| Standard shadcn AlertDialog | Consistent with existing app dialogs | ✓ |

**User's choice:** Standard shadcn AlertDialog

---

| Option | Description | Selected |
|--------|-------------|----------|
| After file picked, if encrypted — modal pops automatically | No extra button needed | ✓ |
| User clicks "Decrypt" to open modal | Extra explicit step | |

**User's choice:** Auto-pop modal on encrypted file detection

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — confirm passphrase field in modal | Two fields; prevents typos | |
| No — single field, user's responsibility | Simpler; show/hide toggle mitigates risk | ✓ |
| You decide | Claude picks | |

**User's choice:** Single passphrase field only

---

## Backward Compatibility

| Option | Description | Selected |
|--------|-------------|----------|
| Support both formats | Auto-detect .zip and old .json on import | |
| Clean break — only .zip | Old .json files show error; users re-export | ✓ |

**User's choice:** Clean break — only .zip supported

---

| Option | Description | Selected |
|--------|-------------|----------|
| Plain export stays .zip | Consistent format always | ✓ |
| Plain export stays .json | Split format based on passphrase | |

**User's choice:** Always zip, even for plain (unencrypted) exports

---

## Claude's Discretion

- State variable naming for modal open/close booleans
- Whether to extract a shared passphrase modal component or use two separate inline dialogs
- Passphrase input layout within AlertDialog
- Zip password-protection detection strategy (without full extraction)

## Deferred Ideas

- Passphrase strength indicator (discussed but not selected)
- macOS-style lock icon / padlock visual design (user chose standard shadcn instead)
- Self-decrypting HTML export format (considered, not chosen)
