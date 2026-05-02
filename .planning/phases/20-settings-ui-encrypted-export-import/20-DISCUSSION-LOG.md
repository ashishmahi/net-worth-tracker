# Phase 20: Settings UI — Encrypted Export & Import - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 20-settings-ui-encrypted-export-import
**Areas discussed:** Export passphrase UI, Import passphrase prompt, Password field masking, Encryption busy state

---

## Export Passphrase UI

| Option | Description | Selected |
|--------|-------------|----------|
| Always-visible input | Single passphrase field always shown below Export button. Blank = plain JSON, filled = encrypted. One button handles both. | ✓ |
| Expanding panel on click | "Export Encrypted…" button expands passphrase area; separate "Export Data" for plain. | |

**User's choice:** Always-visible input — single passphrase field, single "Export Data" button.

---

## Confirm Passphrase on Export

| Option | Description | Selected |
|--------|-------------|----------|
| Single field only | One passphrase input. Show/hide toggle handles verification. Simpler UI. | ✓ |
| Passphrase + confirm field | Two inputs that must match before export is allowed. Prevents silent typos. | |

**User's choice:** Single field only.

---

## Import Passphrase Prompt

| Option | Description | Selected |
|--------|-------------|----------|
| Inline, before confirm dialog | Passphrase field appears inline below Import button. Decryption runs → on success, existing AlertDialog opens. | ✓ |
| Inside existing dialog | AlertDialog gains a passphrase field for encrypted files. Decrypt + confirm in one step. | |

**User's choice:** Inline, before the existing confirmation dialog.

---

## Password Field Masking

| Option | Description | Selected |
|--------|-------------|----------|
| Masked + show/hide toggle | type=password with eye icon to toggle visibility. | ✓ |
| Plain text input | Always visible, no toggle. | |

**User's choice:** Masked with show/hide toggle (Eye/EyeOff icons from lucide-react).

---

## Encryption Busy State

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, spinner | Loader2 spinner + disabled button during crypto ops. Consistent with existing patterns. | ✓ |
| Silent — no spinner | Button disabled but no visual indicator. | |

**User's choice:** Spinner — Loader2, same as goldSaving/importBusy patterns.

---

## Claude's Discretion

- Exact placeholder/helper text for export passphrase field
- Whether to add a lock icon visual cue
- State variable naming
- Whether inline decrypt block uses `<div>` or `<Card>` wrapper

## Deferred Ideas

None.
