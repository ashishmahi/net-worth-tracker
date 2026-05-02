# Phase 21 — Technical Research

**Phase:** 21 — Passphrase modals + password-protected zip export/import  
**Answer:** What do we need to know to implement zip-based export/import with AES-256 and modal UX?

---

## Library Selection: Zip with AES-256 (not ZipCrypto)

| Option | AES-256 zip write/read | Notes |
|--------|------------------------|-------|
| **JSZip** | Legacy PR / weak path | Default ecosystem package does **not** ship AES-256 in stable releases; ZipCrypto is weak and discouraged. |
| **`@zip.js/zip.js`** (Gildas Lormeau) | **Yes** — `encryptionStrength: 1 \| 2 \| 3` (3 = AES-256), `password` on `ZipWriter#add` | BSD-3-Clause, **zero npm dependencies**, browser + Node, Web Crypto–backed streams. Official docs warn against `zipCrypto: true`. |

**Decision (locked for planning):** Add **`@zip.js/zip.js`** (`npm install @zip.js/zip.js`). Use **`encryptionStrength: 3`** when `password` is non-empty. Do **not** set `zipCrypto: true`.

### Authoritative API references

- `ZipWriter` + `BlobWriter` — produce a `Blob` for download (`zipWriter.close()` returns blob when using `BlobWriter`).
- `ZipWriter#add(name, reader, options)` — pass `password` + `encryptionStrength: 3` for AES-256-encrypted entry.
- Unencrypted export: `add("data.json", new TextReader(json))` with **no** `password` / encryption options (plain deflate/store zip).
- `ZipReader` + `BlobReader` — open user file; `reader.getEntries()` then locate **`data.json`**.
- Entry metadata: **`entry.encrypted`** — use to branch **password modal vs** direct parse (per CONTEXT D-08).
- Decryption: `entry.getData(new TextWriter(), { password: passphrase })` (exact option names per installed typings — verify in `node_modules/@zip.js/zip.js` when implementing).
- Wrong password: library exposes **`ERR_INVALID_PASSWORD`** (string constant) — map to UI-SPEC wrong-passphrase copy.

### Vite / bundling

- Configure **no** special worker path unless we enable `useWebWorkers` — default in-main-thread is fine for small `data.json`.
- If build warns on wasm/worker assets, follow zip.js Vite note in their README (only if needed).

---

## File Format (aligned with CONTEXT.md)

| Rule | Implementation |
|------|----------------|
| Archive layout | Single entry: **`data.json`** (UTF-8 JSON text of `AppData`). |
| Filename | Download: **`wealth-tracker-YYYY-MM-DD.zip`** (local date from export moment). |
| No double encryption | Do **not** use Phase 19 `encryptData` envelope inside zip — zip AES handles confidentiality. |
| Import rejection | Non-`.zip` or non-PK zip → page-level error: *"This file format is no longer supported. Please re-export from the app."* |
| Legacy `.json` | Same message — do not attempt JSON parse for import (clean break, D-07 / D-14). |

---

## Detecting Password-Protected vs Clear Zip

1. Open with `ZipReader(new BlobReader(file))`.
2. Find entry **`data.json`** (if missing → validation error path).
3. If **`entry.encrypted === true`** → open import passphrase modal; do not read body until user submits passphrase.
4. If **`entry.encrypted === false`** → `getData` without password → stringify → `parseAppDataFromImport` → existing confirmation dialog.

**Edge case:** Corrupt zip or AES unsupported → catch and show generic decrypt error from UI-SPEC.

---

## SettingsPage Integration Points

- **Remove:** Inline "Passphrase (optional)" block; direct `encryptData` download path; JSON `accept`; `pendingEncryptedEnvelope` / Phase 20 decrypt-from-JSON path.
- **Add:** `exportModalOpen`, `importPassphraseModalOpen` (or names per UI-SPEC); `AlertDialog` trees per `21-UI-SPEC.md` copy deck.
- **Export button:** Opens modal only — no export until modal confirms.
- **Import:** `accept=".zip,application/zip"` (and keep hidden input pattern).

---

## Vitest / Node Testability

- Use **`@zip.js/zip.js`** in tests under Node 20+ with global `crypto` and Blob — round-trip: build zip with module → read back → assert JSON equality.
- Wrong-password test: expect rejection matching **`ERR_INVALID_PASSWORD`** or message contract.

---

## Validation Architecture

Phase 21 validates **client-only** zip workflows:

| Dimension | Approach |
|-----------|----------|
| **Unit** | `src/lib/*zip*.test.ts` — round-trip plain zip, encrypted zip, wrong password rejection, `data.json` entry presence. |
| **Integration** | `npm test` + `npm run build`; manual UAT per `21-VALIDATION.md` for modal flows and copy. |
| **Security** | No passphrase logging; passwords only in memory; STRIDE table in PLAN threat_model. |

---

## RESEARCH COMPLETE

Library choice, API surface, encryption strength, detection strategy, and test approach are sufficient for executable planning.
