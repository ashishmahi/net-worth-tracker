# Phase 19: Crypto Utilities - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 19-crypto-utilities
**Areas discussed:** Error contract, Function interface, PBKDF2 iterations

---

## Error contract

| Option | Description | Selected |
|--------|-------------|----------|
| DecryptionError class | `class DecryptionError extends Error` — Phase 20 uses `instanceof` check | |
| Tagged Error with code | `Object.assign(new Error(...), { code: 'WRONG_PASSPHRASE' })` — Phase 20 checks `.code` | ✓ |
| You decide | Claude picks most idiomatic approach | |

**User's choice:** Tagged Error with code  
**Notes:** User also approved adding a `CryptoError` interface + `isCryptoError()` type guard (follow-up question) to avoid `(e as any)` casting in Phase 20.

---

## Function interface

| Option | Description | Selected |
|--------|-------------|----------|
| string (plaintext in/out) | Caller does JSON.stringify/parse. Pure crypto utility. | ✓ |
| object (serializes internally) | Function handles JSON.stringify/parse. Mixed concerns. | |

**User's choice:** string — JSON boundary stays in Phase 20  
**Notes:** Consistent with how SettingsPage already handles JSON (existing export flow uses `JSON.stringify(data, null, 2)`).

---

## PBKDF2 iterations

| Option | Description | Selected |
|--------|-------------|----------|
| 600,000 — OWASP 2024 | Best current practice. ~200ms browser-side. | ✓ |
| 100,000 — older baseline | Still within NIST minimums. Essentially instant. | |
| You decide | Claude picks. | |

**User's choice:** 600,000 iterations  
**Notes:** User asked for clarification on where the operation runs. After confirming it's 100% client-side (Web Crypto API in browser, no server), user chose 600k for best-practice security on exported files. No performance concern for a local personal app.

---

## Claude's Discretion

- Binary encoding for salt/iv/data in envelope: base64 (standard for JSON-embeddable binary)
- PBKDF2 hash algorithm: SHA-256
- Envelope `version` field type: number literal `1`
- IV length: 12 bytes (standard for AES-GCM)
- Salt length: 16 bytes

## Deferred Ideas

None raised during discussion.
