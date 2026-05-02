---
gsd_state_version: 1.0
milestone: v1.6
milestone_name: — Encrypted Export
status: **Roadmap ready** — v1.6 phases 19–20 defined
last_updated: "2026-05-02T10:55:17.464Z"
last_activity: 2026-05-02 — Roadmap created for v1.6 Encrypted Export
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

## Project

**Personal Wealth Tracker** — local React + Vite net worth app.

## Current position

Phase: Phase 19 — Crypto Utilities (not started)
Plan: —
Status: **Roadmap ready** — v1.6 phases 19–20 defined
Last activity: 2026-05-02 — Roadmap created for v1.6 Encrypted Export

Progress: 0 / 2 phases complete

```
[          ] 0%
Phase 19: Crypto Utilities         [ ] Not started
Phase 20: Settings UI              [ ] Not started
```

## Project reference

See [`.planning/PROJECT.md`](PROJECT.md) — **v1.5** shipped and archived (2026-05-02); artifacts under **`.planning/milestones/v1.5-phases/`**.

**Core value:** Total net worth in INR — liabilities deducted from gross assets, live prices where applicable, minimal repeated data entry.

## Performance metrics

*(Reset when the next milestone opens.)*

## Accumulated context

### Decisions

- **Phase 12:** See [`.planning/milestones/v1.4-phases/12-commodities-data-net-worth/12-CONTEXT.md`](milestones/v1.4-phases/12-commodities-data-net-worth/12-CONTEXT.md) — **D-01–D-10** (schema, migration, `otherCommodities` totals, snapshot exclusion parity with gold).
- **Phase 13:** See [`.planning/milestones/v1.4-phases/13-commodities-product-ux/13-CONTEXT.md`](milestones/v1.4-phases/13-commodities-product-ux/13-CONTEXT.md) — **D-01–D-07** (Commodities nav page, Dashboard links, CRUD discretion, COM-06 split).

### Roadmap evolution

- **v1.4** archived: [`.planning/milestones/v1.4-ROADMAP.md`](milestones/v1.4-ROADMAP.md).
- **v1.5** archived: [`.planning/milestones/v1.5-ROADMAP.md`](milestones/v1.5-ROADMAP.md) · [`.planning/milestones/v1.5-REQUIREMENTS.md`](milestones/v1.5-REQUIREMENTS.md).
- **Live** [`.planning/ROADMAP.md`](ROADMAP.md): v1.6 phases 19–20 active.

### Key v1.6 design notes

- `cryptoUtils.ts` is a pure utility with no React dependencies — import in Settings page only
- Web Crypto API (`window.crypto.subtle`) used exclusively — no third-party crypto libraries
- Encrypted envelope: `{ encrypted: true, version: 1, salt: <hex>, iv: <hex>, data: <base64> }`
- Import auto-detection: check `envelope.encrypted === true` before prompting for passphrase
- Unencrypted export/import path (blank passphrase) must remain byte-for-byte identical to v1.5 behavior

### Key v1.5 design notes

- `liabilities` is a root-level list on `DataSchema` (peer of `assets`), not nested inside `assets`
- Net worth deducts **standalone liabilities only** (not property `outstandingLoanInr`) — property equity calc (`agreementInr - outstandingLoanInr`) is preserved unchanged
- `sumAllDebtInr` (display total for "Total Debt" row) combines both property + standalone; `calcNetWorth` uses standalone only
- `NetWorthPointSchema.totalInr` relaxed from `nonneg` to `z.number()` to support debt-exceeds-assets scenarios
- Property form gains lender + EMI fields under the existing liability toggle (no schema restructure of property model)

### Pending todos

*None.*

### Blockers / concerns

*None.*

## Deferred items

| Category | Item | Status |
|----------|------|--------|
| uat | Phase 05 — `.planning/milestones/v1.0-phases/` archive | `testing` (legacy) |
| verification | Phase 01 — GSD 01 | `human_needed` (optional) |
| planning | Formal milestone audits | optional |

## Session continuity

**Completed through:** **v1.5** milestone close — archived 2026-05-02 (`v1.5-ROADMAP`, `v1.5-REQUIREMENTS`, **`.planning/phases/`** → **`milestones/v1.5-phases/`**, root **`REQUIREMENTS.md`** removed).

**Current:** **v1.6 — Encrypted Export** — Roadmap defined 2026-05-02. Next: `/gsd-plan-phase 19`.

**Last shipped:** **v1.5 — Debt & Liabilities** — 2026-05-02.
