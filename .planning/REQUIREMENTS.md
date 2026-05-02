# Requirements: Personal Wealth Tracker — v1.6

**Defined:** 2026-05-02
**Core Value:** Total net worth in INR — liabilities deducted from gross assets, live prices where applicable, minimal repeated data entry.

## v1.6 Requirements

### Encrypted Export

- [ ] **ENC-01**: User can enter an optional passphrase in the Export section; leaving it blank exports plain JSON (existing behavior unchanged)
- [x] **ENC-02**: When a passphrase is entered, the exported file is AES-256-GCM encrypted with PBKDF2 key derivation and a random salt
- [x] **ENC-03**: The encrypted file uses a self-describing envelope `{ encrypted, version, salt, iv, data }` so import can auto-detect it
- [ ] **ENC-04**: Import auto-detects an encrypted file and prompts for a passphrase only when the file is encrypted
- [ ] **ENC-05**: User can import an encrypted file by entering the correct passphrase; data loads normally on success
- [ ] **ENC-06**: User sees a clear inline error when import fails due to a wrong or missing passphrase

## Future Requirements

*(None identified for this milestone — feature is complete as scoped)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| Passphrase recovery | Forget the passphrase = data unrecoverable — by design |
| Passphrase strength enforcement | Any passphrase accepted — no complexity requirements |
| Encrypted `data.json` on disk | Export-only — local file stays plain JSON |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENC-01 | Phase 20 | Pending |
| ENC-02 | Phase 19 | Complete |
| ENC-03 | Phase 19 | Complete |
| ENC-04 | Phase 20 | Pending |
| ENC-05 | Phase 20 | Pending |
| ENC-06 | Phase 20 | Pending |

**Coverage:**
- v1.6 requirements: 6 total
- Mapped to phases: 6 / 6 ✓
- Unmapped: 0

---
*Requirements defined: 2026-05-02*
*Last updated: 2026-05-02 — ENC-02/ENC-03 complete (Phase 19)*
