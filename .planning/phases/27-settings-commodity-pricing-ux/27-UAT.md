---
status: testing
phase: 27-settings-commodity-pricing-ux
source: [27-01-SUMMARY.md, 27-UI-SPEC.md]
started: 2026-05-03T17:30:00.000Z
updated: 2026-05-03T18:10:00.000Z
---

## Current Test

number: 2
name: Edit expands forms with Save and Cancel
expected: |
  From the same healthy-feed state, tap Edit on Gold and on Silver. Each card shows inputs prefilled from the effective snapshot, plus Save and Cancel. (Re-check after fix: inputs must accept typing while Edit mode is open.)
awaiting: user response

## Tests

### 1. Read-only gold and silver when feeds healthy
expected: |
  With live gold and silver feeds healthy (no errors), open Settings. Gold and Silver cards show compact read-only summaries (Live / Saved / Saved (locked)) with effective ₹/g; no price inputs until you choose Edit.
result: pass

### 2. Edit expands forms with Save and Cancel
expected: |
  From the same healthy-feed state, tap Edit on Gold and on Silver. Each card shows inputs prefilled from the effective snapshot, plus Save and Cancel.
result: issue
reported: "Edit is visible but inputs do not let me edit anything — is that intentional?"
severity: major
fix: "Hydration useEffect called reset() whenever saved gold/silver settings existed, without checking isDirty. Live spot sync updates those keys often, so the form kept resetting. Guard with !isDirty (matches hint branches)."

### 3. Unhealthy feed — inputs without Edit
expected: |
  When gold or silver spot fails (or stays unavailable after loading settles), open Settings. Pricing inputs are visible immediately without tapping Edit; an error may appear with role="alert".
result: [pending]

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
passed: 1
issues: 1
pending: 4
skipped: 0
blocked: 0

## Gaps

- truth: "Edit mode shows inputs that accept typing until Save/Cancel"
  status: failed
  reason: "User reported: Edit visible but inputs did not accept edits (hydration reset wiped drafts)."
  severity: major
  test: 2
  root_cause: "useEffect reset paths for saved goldPrices / silverInrPerGram ignored isDirty; SilverSpotPricesSync and GoldSpotPricesSync frequently update settings."
  artifacts:
    - src/components/settings/SettingsGoldPricingCard.tsx
    - src/components/settings/SettingsSilverPricingCard.tsx
  missing: []
  fix_applied: "Only reset from server/hints when !goldFormIsDirty / !silverFormIsDirty in those branches."
