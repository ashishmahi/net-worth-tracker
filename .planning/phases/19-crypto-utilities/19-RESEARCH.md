# Phase 19: Crypto Utilities — Technical Research

**Status:** Complete  
**Question answered:** What do we need to know to implement AES-256-GCM + PBKDF2 with Web Crypto in this repo and test it with Vitest?

---

## Summary

Implement `encryptData` / `decryptData` in the browser using **`globalThis.crypto.subtle`** only (no npm crypto libs). Derive a 256-bit AES key with **PBKDF2-SHA-256**, **600,000 iterations**, random **16-byte salt** and **12-byte IV** (GCM standard). Encode **salt, iv, ciphertext** as **base64** strings in `EncryptedEnvelope`. Use **`TextEncoder` / `TextDecoder`** for passphrase and plaintext UTF-8 bytes.

**Vitest:** Default Vitest runs in **Node** (`vitest run`). **Node 19+** exposes **`globalThis.crypto.subtle`** (same Web Crypto API). This repo uses Vitest 4.x without a custom `environment:` — verify once with `typeof crypto !== 'undefined' && crypto.subtle` in a one-line test; if a contributor’s Node is older, document **Node ≥ 19** or add `vitest.config.ts` `test.environment: 'node'` explicitly (already implicit).

**Errors:** `crypto.subtle.decrypt` fails authentication when passphrase is wrong → catch **`DOMException`** or generic `Error`, then throw a **custom `CryptoError`** with **`code: 'WRONG_PASSPHRASE'`** (per CONTEXT D-01/D-02). Do not distinguish corrupt ciphertext vs wrong key in user messaging — both map to the same typed error for Phase 20.

---

## Web Crypto API — Concrete Steps

### Key derivation (encrypt and decrypt)

1. `const enc = new TextEncoder()`
2. `const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey'])`
3. `await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])`

`salt` is **`Uint8Array(16)`** from `crypto.getRandomValues` (encrypt) or **decoded from envelope** (decrypt).

### Encrypt

1. Generate `salt` (16 bytes) and `iv` (12 bytes) via `getRandomValues`
2. Derive `CryptoKey` as above
3. `const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))`
4. Build envelope: `{ encrypted: true, version: 1, salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(ct)) }`

### Decrypt

1. Base64-decode `salt`, `iv`, `data`
2. Derive same `CryptoKey` from passphrase + salt
3. `await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertextBytes)`
4. `new TextDecoder().decode(result)` → plaintext string

### Base64 helpers

Use **`btoa`/`atob`** on binary strings from `String.fromCharCode(...bytes)` for small payloads (export-sized JSON is bounded), or implement small **Uint8Array ↔ base64** helpers without deps — keep consistent with project (no new packages).

---

## Validation Architecture

This phase is **fully unit-testable** in Vitest. No browser-only APIs beyond `crypto.subtle` (available in Node ≥ 19).

| Dimension | Approach |
|-----------|----------|
| Correctness | Vitest: round-trip, decrypt with correct passphrase, wrong passphrase throws `CryptoError` |
| Envelope | Assert `encrypted === true`, `version === 1`, base64 fields parseable |
| Regression | `npm test` after changes |

**Sampling:** After each task commit, `npx vitest run src/lib/__tests__/cryptoUtils.test.ts`; before phase verify, full `npm test`.

**Manual:** None required — no UI in Phase 19.

---

## Risks / Pitfalls

1. **Iteration count:** 600k PBKDF2 is slow — acceptable per CONTEXT (one-shot export); tests will take slightly longer; avoid redundant PBKDF2 calls inside tight loops in tests beyond the three required cases.
2. **`isCryptoError` completeness:** CONTEXT snippet uses `'code' in e` — implementation should **narrow** with `code === 'WRONG_PASSPHRASE'` so the type guard is sound for Phase 20.
3. **Empty passphrase:** Product may allow empty passphrase in Phase 20 for plain export only — utility may still receive empty string; PBKDF2 with empty password is valid crypto; document behavior (encrypt/decrypt still runs) or align with Phase 20 — CONTEXT leaves to discretion; optional test if added value.

---

## RESEARCH COMPLETE

Ready for planning and execution.
