# Phase 38: Settings, Snapshots & Export/Import - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 38-settings-snapshots-export-import
**Areas discussed:** Live rates card layout, Session-override inputs, Snapshot schema shape, Historical chart behavior

---

## Live rates card — placement

| Option | Description | Selected |
|--------|-------------|----------|
| FX grouped at top | All 5 FX pairs together (USD, AED, EUR, GBP, SGD), then BTC, Gold, Silver | ✓ |
| FX grouped + subheaders | Same grouping plus subtle 'Forex' / 'Markets' subheaders | |
| Append after AED | Append EUR/GBP/SGD right after AED, BTC/Gold/Silver unchanged | |
| Match topbar order | Reading order matches the Phase 35 topbar (INR, USD, AED, EUR, GBP, SGD) | |

**User's choice:** FX grouped at top.
**Notes:** Followed by BTC/USD; Gold and Silver were later removed from the card entirely (see “Combined card scope”).

---

## Live rates card — labels & loading

| Option | Description | Selected |
|--------|-------------|----------|
| Consistent labels | `EUR → INR (₹ per 1 EUR)` etc.; show `—` on per-pair fetch failure (Phase 34 D-02 best-effort) | ✓ |
| Shorter labels | Just `EUR / INR` etc., leans on the card heading | |
| Show 'Rate unavailable' | Same as 1 but reuse Phase 36/37 dashboard hint copy on failed pairs | |

**User's choice:** Consistent labels with `—` fallback.
**Notes:** Reused existing `usdInr` / `aedInr` per-row label pattern; “Rate unavailable” stays a dashboard / asset-page hint, not a Settings card hint.

---

## Session overrides — layout (initial framing)

| Option | Description | Selected |
|--------|-------------|----------|
| Flat list | Same order as rates card, single Apply / Clear pair | |
| 2-column grid on ≥ sm | Tighter, still single Apply / Clear | |
| Two visual blocks | 'Forex' (5 pairs) + 'Crypto' (BTC) under separate small headings | |
| Collapse extras | Show USD/AED/BTC by default; EUR/GBP/SGD inside 'More currencies' | |
| Other | User redirected the discussion | ✓ |

**User's choice:** “Other” — user re-framed the question: rates should be **read-only by default**, with an Edit button to allow manual updates (mirroring the existing `SettingsGoldPricingCard` / `SettingsSilverPricingCard` pattern).
**Notes:** This converted the original “arrange 6 inputs” question into a “merge two cards into one read-only-with-Edit card” design.

---

## Edit affordance granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Per-row Edit | Each rate has its own pencil/Edit button | |
| Per-card Edit | One Edit on the whole card; toggles all six inputs into edit mode | ✓ |
| Per-group Edit | One Edit for the 5 FX pairs together, separate Edit for BTC | |

**User's choice:** Per-card Edit.
**Notes:** Single toggle keeps the interaction simple; forex pairs come from one fetch anyway.

---

## Edit persistence semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Session-only | Matches today’s behavior + roadmap SET-02 wording — manual values drop on reload / next live fetch | ✓ |
| Lockable | Add `goldPricesLocked`-style persisted override | |
| Session now, lock deferred | Session-only this phase; note lock as deferred | |

**User's choice:** Session-only.
**Notes:** Locked persistence is recorded as a deferred idea; spec says “session-only” explicitly.

---

## Combined card — scope (which rates appear)

| Option | Description | Selected |
|--------|-------------|----------|
| All six editable + show metals read-only | Edit covers USD/AED/EUR/GBP/SGD/BTC; Gold/Silver stay visible but not editable | |
| FX-only edit, BTC separate | Edit covers 5 FX only; BTC has its own affordance | |
| FX + BTC only, no metals | Card shows ONLY 5 FX pairs + BTC; remove Gold/Silver entirely from this card (they live on the Gold & Silver tab) | ✓ |

**User's choice:** FX + BTC only — remove Gold/Silver from this card.
**Notes:** Cleaner separation; metals are already managed via `SettingsGoldPricingCard` / `SettingsSilverPricingCard`.

---

## Snapshot schema — shape

| Option | Description | Selected |
|--------|-------------|----------|
| Additive optional | Keep `totalInr`, add optional `reportingCurrency`, optional `rates`, optional `totalReporting`; no version bump; legacy entries stay valid | ✓ |
| Additive required-on-new | Same fields, but required on new entries (legacy via union/migration) | |
| Version bump v3 | Bump root `version`; require new fields; migrate v2 entries with INR + no rates | |

**User's choice:** Additive optional.
**Notes:** Maximizes safety for any existing user data; no migration to maintain.

---

## Snapshot schema — rate map scope

| Option | Description | Selected |
|--------|-------------|----------|
| FX only | `{ usdInr, aedInr, eurInr, gbpInr, sgdInr }` — matches spec wording | |
| FX + BTC | Add `btcUsd` so bitcoin leg is reconstructible | |
| FX + BTC + metals | Add `goldUsdPerOz`, `silverUsdPerOz` too — every quote needed to recompute the captured headline | |
| Other / discretion | User left it to Claude with “keep app safe and don’t impact existing users” | ✓ |

**User's choice:** Claude’s discretion.
**Notes:** Chose the wider 8-quote map (FX + BTC + Gold + Silver), every entry inside the `rates` block independently optional. Recorded in CONTEXT.md D-10 as Claude’s discretion.

---

## Historical chart behavior

| Option | Description | Selected |
|--------|-------------|----------|
| No chart change | Plot `totalInr` as today; new fields stored for future use | ✓ |
| Convert to current | Re-render history in the topbar’s current reporting currency | |
| Show as captured | Plot each point in its captured reporting currency | |

**User's choice:** No chart change this phase.
**Notes:** Keeps the phase scoped to capture (SNP-01/02). Re-rendering history in different reporting currencies is recorded as a deferred idea.

---

## Wrap-up

| Option | Description | Selected |
|--------|-------------|----------|
| Done | Proceed to write CONTEXT.md | ✓ |
| Quick EXP-01/EXP-02 detail | Discuss what 'done' looks like for export/import verification | |
| Reporting currency mirror in Settings | Add a row in Settings showing/changing reporting currency | |

**User's choice:** Done.
**Notes:** EXP-01/EXP-02 captured in CONTEXT.md as structurally satisfied by Phase 34 D-12 plus a verification test (D-14). The Settings-page reporting-currency mirror row is recorded as deferred.

---

## Claude's Discretion

- **Snapshot rate-map scope (D-10)** — chose the wider 8-quote map with optional entries; legacy snapshots remain valid.
- **Implementation file layout** for the merged Live rates card — implementer decides; recommendation is a small dedicated component (e.g. `SettingsLiveRatesCard`) mirroring the gold/silver pattern.
- **Read-only number formatting** — keeps existing `toLocaleString('en-IN', …)` conventions.
- **Edit-mode error / empty-state copy** beyond the existing session-rates explainer.

---

## Deferred Ideas

- “Lock manual rate” persisted setting for FX (out-of-spec for SET-02).
- Per-row Edit affordance on the merged Live rates card.
- Historical chart re-rendering in the current reporting currency (uses captured rates).
- Per-point currency annotation on the chart when reporting currency varies.
- User-visible export note about currency-field preservation.
- Reporting-currency mirror row inside the Settings page (alongside the topbar selector).
