# Requirements — Personal Wealth Tracker

**Defined:** 2026-04-28  
**Milestone:** v1.4 — Multiple commodities  
**Core value:** Total net worth in INR at a glance; commodities beyond gold must integrate cleanly with manual pricing and the existing local JSON model.

**Previous shipped:** v1.3 (net worth history, import, chart) — [`.planning/milestones/v1.3-REQUIREMENTS.md`](milestones/v1.3-REQUIREMENTS.md)  

**Research:** Not run as parallel GSD researchers (environment); requirements align with [`.planning/PROJECT.md`](PROJECT.md) and current `DataSchema` / `dashboardCalcs` patterns. Phase planning may add a short `*-RESEARCH.md` if needed.

---

## v1.4 requirements (active)

### Commodities — data & net worth

- [ ] **COM-01**: The persisted model supports **at least one** commodity type **in addition to gold** (e.g. silver), with **user-entered holdings** (weight or quantity per agreed units) and **manual INR pricing** configured in **Settings** (or an equivalent single place), stored under `data.json` with **backward-compatible migration** from files that only have today’s gold shape.  
- [ ] **COM-02**: **Net worth** and **“Record snapshot”** use the **same** aggregate definition as today and **include** all commodity holdings; when required prices are missing, behavior matches existing patterns (**null / incomplete** category behavior, consistent with gold without `goldPrices`).  
- [ ] **COM-05**: **JSON export/import**, **`createInitialData`**, and **full data reset** stay aligned with **Zod `DataSchema`**: new commodity fields are **validated** on import, **initialized** for new installs, and **cleared** on the existing danger-zone reset path.

### Commodities — product UX

- [ ] **COM-03**: User can **add, edit, and remove** line items for **non-gold** commodities using the same **RHF + Zod** and accessibility patterns as other asset sections.  
- [ ] **COM-04**: **Dashboard** and **navigation** surface commodity wealth clearly (e.g. **combined “Commodities”** and/or **gold vs other** breakdown) without hiding totals needed for understanding net worth.  
- [ ] **COM-06**: **Gold** keeps current **karat + grams + Settings gold prices** behavior unless a unified model explicitly improves UX without breaking existing `data.json` users.

---

## Future requirements (deferred)

- **Live** spot or futures feeds for silver, oil, etc. (manual pricing only for v1.4).  
- Additional commodity **categories** beyond the first wave (easy to add once the pattern exists).  
- **Tax-lot** or **cost-basis** tracking for commodities.

---

## Out of scope (v1.4)

| Item | Reason |
|------|--------|
| New HTTP routes beyond existing `GET`/`POST` `/api/data` | Same local-only stack |
| Cloud sync / multi-device | Product constraint |
| Replacing gold’s karat model with a generic only model | Would break unless migrated carefully — defer unless folded into COM-06 with a migration story |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| COM-01 | 12 | Pending |
| COM-02 | 12 | Pending |
| COM-05 | 12 | Pending |
| COM-03 | 13 | Pending |
| COM-04 | 13 | Pending |
| COM-06 | 13 | Pending |

**Coverage:** v1.4 requirements: **6** · Mapped: **6** · Unmapped: **0** ✓  

---
*Requirements defined: 2026-04-28 (milestone v1.4)*  
