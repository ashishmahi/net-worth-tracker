---
status: testing
phase: 27-settings-commodity-pricing-ux
source: [27-01-SUMMARY.md, 27-UI-SPEC.md]
started: 2026-05-03T17:30:00.000Z
updated: 2026-05-03T18:40:00.000Z
---

## Current Test

number: 4
name: Save locks prices
expected: |
  After editing Gold or Silver prices and tapping Save, fixed prices persist (goldPricesLocked or silverPricesLocked true) and net worth reflects saved ₹/g. With healthy feed, the card returns to read-only (inputs close) after Save.
awaiting: user response

## Tests

### 1. Read-only gold and silver when feeds healthy
expected: |
  With live gold and silver feeds healthy (no errors), open Settings. Gold and Silver cards show compact read-only summaries (Live / Saved / Saved (locked)) with effective ₹/g; no price inputs until you choose Edit.
result: pass

### 2. Edit expands forms with Save and Cancel
expected: |
  From the same healthy-feed state, tap Edit on Gold and on Silver. Each card shows inputs prefilled from the effective snapshot, plus Save and Cancel.
result: pass
previously: |
  issue (inputs reset by sync) — fixed in 62654cd; user re-tested pass.

### 3. Unhealthy feed — inputs without Edit
expected: |
  When gold or silver spot fails (or stays unavailable after loading settles), open Settings. Pricing inputs are visible immediately without tapping Edit; an error may appear with role="alert".
result: pass

### 4. Save locks prices
expected: |
  After editing Gold or Silver prices and tapping Save, fixed prices persist (goldPricesLocked or silverPricesLocked true) and net worth reflects saved ₹/g.
result: [pending]

### 5. Use live spot unlocks
expected: |
  With locked prices, tap Use live spot on Gold or Silver. After save, the corresponding *PricesLocked is false and stored ₹/g matches live-derived values.
result: [pending]

### 6. Dashboard skeleton with locked silver only
expected: |
  Hold only standard silver in Commodities with silverPricesLocked and silverInrPerGram set. On Dashboard, the net worth headline does not stay on skeleton only because silver is still loading — locked rate is enough.
result: [pending]

## Summary

total: 6
passed: 3
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

- truth: "Edit mode shows inputs that accept typing until Save/Cancel"
  status: resolved
  reason: "User reported: Edit visible but inputs did not accept edits (hydration reset wiped drafts)."
  severity: major
  test: 2
  root_cause: "useEffect reset paths for saved goldPrices / silverInrPerGram ignored isDirty; SilverSpotPricesSync and GoldSpotPricesSync frequently update settings."
  artifacts:
    - src/components/settings/SettingsGoldPricingCard.tsx
    - src/components/settings/SettingsSilverPricingCard.tsx
  fix_applied: "Only reset from server/hints when !goldFormIsDirty / !silverFormIsDirty in those branches (62654cd)."
  verified: 2026-05-03 user pass

- truth: "After Save with healthy feed, return to read-only summary (collapse inputs); after Save during outage, show summary strip + Edit when saved values exist"
  status: resolved
  reason: "User reported: inputs stayed open after Save — unclear if intentional."
  severity: minor
  test: 4
  root_cause: "show*EditForm used (!pricingHealthy || editing), so unhealthy feed kept the form open even after setEditing(false)."
  fix_applied: "Drive expanded form only by *PricingEditing; auto-expand when feed is/becomes unhealthy (ref); summary strip when collapsed and effective prices exist; Cancel always in form."
