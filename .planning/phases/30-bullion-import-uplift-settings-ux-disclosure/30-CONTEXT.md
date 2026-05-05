# Phase 30: Bullion import uplift — settings UX & disclosure — Context

**Gathered:** 2026-05-06  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **BLN-04** on **Settings** gold/silver pricing surfaces only: **explain** what import-style uplift means for live-derived ₹/g, show **visible approximation** and **not legal or tax advice** copy, and implement **no in-app tuning** for uplift rates — Phase **29** defaults/migration remain authoritative. Adjust **`SettingsGoldPricingCard`** / **`SettingsSilverPricingCard`** (and wiring only as needed); **do not** duplicate schema work (**same persisted keys** as Phase **29**).

</domain>

<decisions>
## Implementation Decisions

### Tuning vs disclosure (BLN-04 alignment)

- **D-01:** **No Settings UI to edit** `goldImportUpliftRate` / `silverImportUpliftRate`. Users rely on **Phase 29 defaults** (~10% gold / ~8% silver ballpark intent via persisted defaults). Changing rates later would require a **future requirement** or **manual data intervention** (not part of this phase).
- **D-02 (requirements tension):** **BLN-04** text includes “expose tuning **when required by implementation**.” Implementation already supports persisted tunable rates (**Phase 29**). This discussion **explicitly overrides** exposing tuning in the UI for **Phase 30** — planner should confirm whether **REQUIREMENTS.md** / roadmap success wording needs a **small amendment** so verification matches shipped intent.

### Discoverability & explanation (ballpark, read-only)

- **D-03:** Surface **ballpark copy only** for uplift (~**10%** gold / ~**8%** silver) as **read-only** guidance — **not** a live binding display of exact resolved decimals from `settings` (avoids implying precision or editability).

### Disclosure placement & tone

- **D-04:** **Non-advice / approximation** messaging appears **once per metal**: **muted footnote-style** copy **under each** of the Gold and Silver pricing cards (not a single global Alert above the section).

### Educational depth

- **D-05:** Add a **single short line** per card explaining that uplift is applied **on top of** spot × USD→INR **parity** ₹/g (exact wording left to planner/executor; keep consistent with Phase **29** math narrative).

### Claude's discretion

- **D-06:** Exact strings, typography (`text-muted-foreground` vs `text-xs`), and whether ballpark lines live above or below existing helper copy — **executor discretion** within **D-03–D-05**.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements

- [`.planning/REQUIREMENTS.md`](../../REQUIREMENTS.md) — **BLN-04** (product UX & disclosure); note **D-02** tension if BLN-04 “tuning” clause is interpreted strictly.
- [`.planning/ROADMAP.md`](../../ROADMAP.md) — **v2.2**, **Phase 30** goal and success criteria (**Phase 30** subsection).

### Seeds & prior phase context

- [`.planning/seeds/SEED-001-gold-silver-import-tax-inr.md`](../../seeds/SEED-001-gold-silver-import-tax-inr.md) — Rationale for ballpark defaults; approximation framing.
- [`.planning/phases/29-bullion-import-uplift-data-calculations/29-CONTEXT.md`](../29-bullion-import-uplift-data-calculations/29-CONTEXT.md) — Persisted field names, math pipeline, **no duplicate schema** in Phase 30.
- [`.planning/phases/27-settings-commodity-pricing-ux/27-CONTEXT.md`](../27-settings-commodity-pricing-ux/27-CONTEXT.md) — Settings card patterns (read-only summary, **Edit**, healthy-feed behavior).

### Implementation touchpoints (repo)

- [`src/components/settings/SettingsGoldPricingCard.tsx`](../../../src/components/settings/SettingsGoldPricingCard.tsx) — Gold pricing UI; uplift already in hints via **`resolveGoldImportUpliftRate`**.
- [`src/components/settings/SettingsSilverPricingCard.tsx`](../../../src/components/settings/SettingsSilverPricingCard.tsx) — Silver pricing UI; **`resolveSilverImportUpliftRate`**.
- [`src/types/data.ts`](../../../src/types/data.ts) — **`SettingsSchema`** uplift keys (**read-only** in UI per **D-01**).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`SettingsGoldPricingCard` / `SettingsSilverPricingCard`** — shadcn **`Card`** + **`CardContent`**; established Phase **27** flows (**Edit**, healthy vs unhealthy feeds, **Use live spot**).
- **`resolveGoldImportUpliftRate` / `resolveSilverImportUpliftRate`** — Already drive hinted ₹/g; UI adds **explanation**, not new math.

### Established patterns

- Muted helper copy (`text-sm text-muted-foreground`), **`≈`** in live hint lines — extend with **D-04** footnotes and **D-05** one-liner without breaking layout density.

### Integration points

- **`SettingsPage`** — Cards already composed here; keep changes localized to card components unless layout constraints require a thin wrapper.

</code_context>

<specifics>
## Specific Ideas

- Ballpark percentages should **align narratively** with **SEED-001** / Phase **29** defaults (~10% / ~8%) while avoiding claims of legal/tax accuracy.

</specifics>

<deferred>
## Deferred Ideas

- **In-app uplift sliders / numeric inputs** — Explicitly deferred by product choice (**D-01**); revive if requirements change.
- **Gold / Dashboard pages** — Extra uplift disclosure beyond Settings **out of scope** for **BLN-04** unless requirements expand.

</deferred>

---

*Phase: 30-bullion-import-uplift-settings-ux-disclosure*  
*Context gathered: 2026-05-06*
