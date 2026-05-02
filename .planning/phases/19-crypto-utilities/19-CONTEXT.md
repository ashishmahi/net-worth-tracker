# Phase 19: Crypto Utilities - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a pure, dependency-free `src/lib/cryptoUtils.ts` that:
- Exports `encryptData(plaintext: string, passphrase: string): Promise<EncryptedEnvelope>`
- Exports `decryptData(envelope: EncryptedEnvelope, passphrase: string): Promise<string>`
- Exports `CryptoError` interface + `isCryptoError()` type guard for Phase 20 error handling
- Implements AES-256-GCM encryption with PBKDF2 key derivation (Web Crypto API — no new npm deps)
- Is covered by Vitest unit tests in `src/lib/__tests__/cryptoUtils.test.ts`

No UI changes. No integration with Settings page (that is Phase 20). Pure utility layer only.

</domain>

<decisions>
## Implementation Decisions

### Error Contract (wrong passphrase)
- **D-01:** `decryptData` throws a tagged `Error` with `code: 'WRONG_PASSPHRASE'` when decryption fails (wrong passphrase or corrupted envelope).
- **D-02:** Export a `CryptoError` interface (`extends Error` with `code: 'WRONG_PASSPHRASE'`) and an `isCryptoError(e: unknown): e is CryptoError` type guard. Phase 20 uses `isCryptoError(e)` in its catch block — no `any` casting required.

```ts
export interface CryptoError extends Error {
  code: 'WRONG_PASSPHRASE'
}

export function isCryptoError(e: unknown): e is CryptoError {
  return e instanceof Error && 'code' in e
}
```

### Function Interface
- **D-03:** `encryptData` accepts a `string` (plaintext). JSON serialization stays in Phase 20 — the utility is JSON-agnostic.
- **D-04:** `decryptData` returns a `string` (plaintext). Phase 20 calls `JSON.parse()` on the result.
- **D-05:** Both functions are `async` — they return `Promise<EncryptedEnvelope>` and `Promise<string>` respectively.

### Envelope Schema (ENC-03)
- **D-06:** The envelope type:
  ```ts
  export interface EncryptedEnvelope {
    encrypted: true
    version: 1           // number literal, starts at 1
    salt: string         // base64-encoded random salt (16 bytes)
    iv: string           // base64-encoded random IV (12 bytes for GCM)
    data: string         // base64-encoded AES-256-GCM ciphertext
  }
  ```
- **D-07:** Binary fields (`salt`, `iv`, `data`) are base64-encoded strings for JSON compatibility.

### Crypto Parameters
- **D-08:** Key derivation: PBKDF2-SHA-256, **600,000 iterations** (OWASP 2024 recommendation). All operations are client-side (Web Crypto API in browser) — no server load. One-shot per export/import — ~200ms on modern hardware is acceptable.
- **D-09:** Encryption: AES-256-GCM (256-bit key, 12-byte IV). Salt: 16 random bytes. IV: 12 random bytes. Both re-generated on every encrypt call.

### Test Coverage
- **D-10:** Three Vitest test cases required per success criteria:
  1. Round-trip: `decryptData(await encryptData(plain, pass), pass)` returns original plaintext
  2. Correct passphrase: decryption succeeds and result equals original
  3. Wrong passphrase: `decryptData` throws and `isCryptoError(e)` is true

### Claude's Discretion
- PBKDF2 hash: SHA-256 (standard, well-supported in Web Crypto)
- Key usage: `['encrypt', 'decrypt']` for the derived key
- Additional test cases beyond the 3 required (e.g. empty string plaintext, empty passphrase) — add if they add value without bloating the test file

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — ENC-02 (encrypt), ENC-03 (envelope format) mapped to this phase

### Existing utility pattern to follow
- `src/lib/liabilityCalcs.ts` — pure TS functions, no deps, exported named functions
- `src/lib/__tests__/liabilityCalcs.test.ts` — test file structure and naming conventions to follow

### No external specs — Web Crypto API is browser-native
Web Crypto API (`window.crypto.subtle`) — no library docs needed; MDN is the reference if research is needed.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/financials.ts` — `roundCurrency` pattern shows how pure utilities are structured in this codebase
- `src/lib/__tests__/` — test directory; new file goes here as `cryptoUtils.test.ts`
- `crypto.randomUUID()` already used in test fixtures (`liabilityCalcs.test.ts`) — confirms `crypto` global is available in Vitest

### Established Patterns
- Pure exported named functions (no default export, no class-based modules)
- TypeScript interfaces for data shapes exported from the same file
- Tests use `describe`/`it`/`expect` from Vitest with named imports
- No mocking of globals — `crypto.subtle` is available in Vitest's jsdom/node environment (confirm in research phase)

### Integration Points
- Phase 20 will import `encryptData`, `decryptData`, `isCryptoError`, `EncryptedEnvelope` from `@/lib/cryptoUtils`
- No integration in Phase 19 — this is the standalone utility layer

</code_context>

<specifics>
## Specific Ideas

- User confirmed: crypto runs entirely in the browser — no server, no auth, no upload. Passphrase never leaves the browser tab.
- User chose 600k iterations explicitly for best-practice security posture on exported files (not a performance concern for a local app).
- The `isCryptoError` type guard pattern was user-approved as cleaner than `(e as any).code` casting.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 19-crypto-utilities*
*Context gathered: 2026-05-02*
