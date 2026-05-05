# Requirements: Personal Wealth Tracker — Milestone v2.3

**Defined:** 2026-05-06  
**Core value:** Net worth and property equity stay trustworthy — bad property rows should not silently persist.  
**Seed:** [SEED-006 — Property entry flow & validation](seeds/SEED-006-property-entry-flow-validation.md)

## v2.3 Requirements

### Guided property entry (UX)

- [x] **PRP-01**: User can choose or confirm an **entry path** aligned with three mental models: **fully paid**, **paying builder in stages** (milestones), **bank loan on property** (liability fields).

- [x] **PRP-02**: **Property** add/edit **surfaces only relevant sections** for the selected path (or inferred defaults), with short helper copy so users do not have to guess that empty milestones + no loan means “fully paid.”

- [x] **PRP-03**: If inference from existing fields is insufficient for reliable UX, persist an explicit **`entryKind`** (or equivalent) on `PropertyItem` with migration/default for older saves — **only if** plan-phase decides it is necessary; otherwise document inferred mapping.

### Save-time validation & schema

- [ ] **PRV-01**: When milestone amounts sum above **agreement value**, **Save is blocked** (not merely warned); surface inline errors consistent with [SEED-006](seeds/SEED-006-property-entry-flow-validation.md).

- [ ] **PRV-02**: When **`hasLiability`** is true: **outstanding loan** is required and **> 0**; **outstanding ≤ agreement** holds unless product explicitly allows override with a **warning** path for edge cases (document decision in phase plan).

- [ ] **PRV-03**: When a loan is present: **EMI** > 0 where applicable; apply at least a **weak sanity check** (e.g. EMI &lt; outstanding) and optional non-blocking tenure hints per plan.

- [ ] **PRV-04**: **`PropertyItemSchema`** (Zod) and **`PropertyPage`** validation rules stay **aligned** — no save path that bypasses schema checks used for persist.

- [ ] **PRV-05**: **Vitest** covers validation helpers and/or schema refinements introduced for **PRV-01–03**, following existing project test patterns.

### Responsive & accessibility

- [ ] **PRA-01**: Updated property flow remains **usable on narrow widths** (milestone table horizontal scroll / sheet layout preserved or improved); reasonable **labels and focus order** for new controls.

## Future requirements

Deferred; not part of v2.3 unless pulled in during plan-phase.

### Other seeds

- **SEED-002**–**SEED-005**, **SEED-007+** remain in [`.planning/seeds/`](seeds/) for future milestones.

## Out of scope

| Item | Reason |
|------|--------|
| Backend or server-side validation | Local-only app unchanged |
| Changing dashboard equity formulas beyond validation-side fixes | v2.3 is entry + persist quality |
| Full wizard redesign unrelated to Property | Scope stays `PropertyPage` + schema + tests |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PRP-01 | Phase 31 — Guided property entry UX | Complete |
| PRP-02 | Phase 31 — Guided property entry UX | Complete |
| PRP-03 | Phase 31 — Guided property entry UX | Complete |
| PRV-01 | Phase 32 — Property save validation & schema | Planned |
| PRV-02 | Phase 32 — Property save validation & schema | Planned |
| PRV-03 | Phase 32 — Property save validation & schema | Planned |
| PRV-04 | Phase 32 — Property save validation & schema | Planned |
| PRV-05 | Phase 32 — Property save validation & schema | Planned |
| PRA-01 | Phase 33 — Property sheet responsive & accessibility | Planned |

**Coverage:** v2.3 requirements **9** total · Mapped **9** · Unmapped **0**

---
*Requirements defined: 2026-05-06*
