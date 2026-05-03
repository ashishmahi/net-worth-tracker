---
phase: 23
slug: docker-containerized-static-server
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-03
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (unchanged app tests) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run build` |
| **Estimated runtime** | ~30–90 seconds (excluding Docker build) |

---

## Sampling Rate

- **After every task commit:** `npm test && npm run build` (no app source changes expected for pure Docker tasks — still run to guard accidental edits)
- **After Dockerfile/nginx tasks:** `docker build -t fin-wealth:local .` (plus optional curl smoke)
- **Before `/gsd-verify-work`:** `npm test` green; Docker image builds; manual browser optional per UAT

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | DOCKER-01 | T-23-01 | Static-only image; pinned bases | script | `docker build -t fin-wealth:local .` | ✅ | ⬜ pending |
| 23-01-02 | 01 | 1 | DOCKER-02 | T-23-02 | SPA fallback; no dir listing | curl | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/fake-path` → 200 | ✅ | ⬜ pending |
| 23-01-03 | 01 | 1 | DOCKER-03 | — | N/A (docs) | grep | `grep -n "docker build" README.md` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- [x] **Existing infrastructure covers all phase requirements** — no new Vitest files required for Docker-only deliverables.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Browser loads app shell | DOCKER-02 | Visual confirmation of JS/CSS | After `docker run -p 8080:80 …`, open `http://localhost:8080/` — app shell visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency acceptable
- [ ] `nyquist_compliant: true` set in frontmatter when approved

**Approval:** pending
