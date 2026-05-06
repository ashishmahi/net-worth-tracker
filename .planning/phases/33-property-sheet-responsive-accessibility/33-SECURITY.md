---
phase: 33
slug: property-sheet-responsive-accessibility
status: verified
threats_open: 0
asvs_level: 1
created: "2026-05-06"
verified: "2026-05-06"
---

# Phase 33 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser chrome ↔ App shell | User input and Radix Sheet focus management vs React-controlled Property sheet | UI events only; no new network or persisted-schema changes in this phase |
| Property sheet ↔ Rest of page | Modal sheet isolates path radiogroup and milestone region | Local draft state for `PropertyItem` editing |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-33-01 | Denial of Service (UX / a11y) | Property sheet path controls | mitigate | **D-08 / D-13:** `useEffect` + `requestAnimationFrame` focuses first path button when `sheetOpen` is true (`pathButtonRefs.current[0]?.focus()`). **D-14:** No imperative `focus()` when closing sheet — only `setSheetOpen(false)` on save/cancel. | closed |
| T-33-02 | Tampering | Path radiogroup `onKeyDown` | mitigate | `preventDefault` only when target has `role="radio"` and key matches wide viewport (ArrowLeft/ArrowRight) vs narrow (ArrowUp/ArrowDown) via `matchMedia('(min-width: 640px)')`; wrapping index navigation; `handlePathRadiogroupKeyDown` in `PropertyPage.tsx`. | closed |

*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-06 | 2 | 2 | 0 | gsd-secure-phase (orchestrator verification vs `src/pages/PropertyPage.tsx`) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-06
