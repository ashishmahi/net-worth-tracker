# Phase 38 — Technical Research

**Question:** What do we need to know to implement Settings live rates + snapshot metadata + export verification well?

## Summary

- **Settings (`SET-01`/`SET-02`):** `LivePricesContext` already exposes `eurInr`, `gbpInr`, `sgdInr` and `SessionRatePartial` includes those keys. `SettingsPage.tsx` (rates tab) still shows only USD/AED manual inputs and lists Gold/Silver inside the read-only card — Phase 38 merges the two cards, reorders rows per **D-01**, removes XAU/XAG from this tab, and adds EUR/GBP/SGD session inputs. UX mirrors **`SettingsGoldPricingCard`**: read-only grid → **Edit** → six decimal inputs + Apply/Clear → return to read-only.
- **Snapshots (`SNP-01`/`SNP-02`):** `NetWorthPointSchema` is currently `{ recordedAt, totalInr }`. Extend with optional `reportingCurrency`, `totalReporting`, and `rates` (partial quote map). **`handleRecordSnapshot`** must populate from `data.settings.reportingCurrency ?? 'INR'`, effective `forexSnapshot`, and `btcUsd` / `goldUsdPerOz` / `silverUsdPerOz` from `useLivePrices`. **`totalReporting`** must match the hero number the user sees (same conversion path as `netWorthDisplay`; omit if conversion unavailable). Chart code stays on **`totalInr`** only (**D-12**).
- **Export/import (`EXP-01`/`EXP-02`):** No new zip code — **`createWealthExportZip`** already serializes full `AppData`. Add a **Vitest** that builds minimal `AppData` with mixed `currency` fields + a snapshot carrying new optional fields, round-trips through export helpers + **`parseAppDataFromImport`**, asserts equality on currency fields and snapshot extras.

## Risks

- **Display vs stored hero:** `totalReporting` must use the same rounding/conversion as the dashboard hero, not a second ad-hoc path — extract or duplicate the exact `toReportingCurrency` + `roundCurrency` sequence from `handleRecordSnapshot`’s scope.
- **Edit-mode state:** Card-level Edit must not lose typed-but-unapplied session strings when toggling — follow gold card local state pattern before calling **`setSessionRates`**.

## Dependencies

- Phase 34: forex pairs + session keys.
- Phase 35: `settings.reportingCurrency`.

## Validation Architecture

Phase verification uses **Vitest** + **TypeScript build** with continuous sampling:

| Dimension | Approach |
|-----------|----------|
| **Unit** | `currencyConversion` already tested; add **`wealthDataZip`** or **`schema`** round-trip test file for EXP + snapshot schema acceptance |
| **UI** | Manual UAT on Settings rates tab (order, Edit flow, session-only copy) and snapshot button (stored JSON in devtools / export file inspection) |
| **Regression** | `npx tsc -b` + `npm test -- --run` for touched tests after each task |

Nyquist: after each committed task, run quick test command; before verify-work, full suite.

## RESEARCH COMPLETE
