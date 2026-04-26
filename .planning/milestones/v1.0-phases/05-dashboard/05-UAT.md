---
status: testing
phase: 05-dashboard
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md]
started: "2026-04-26T12:00:00.000Z"
updated: "2026-04-26T12:00:00.000Z"
---

## Current Test

number: 1
name: Land on Dashboard — layout and net worth card
expected: |
  With `npm run dev`, the app opens to the Dashboard. You see the page title "Dashboard", a top Card whose label reads "Net worth" (or "Total net worth (INR)"), and a second Card listing **seven** category rows in this order: Gold, Mutual Funds, Stocks, Bitcoin, Property, Bank Savings, Retirement. Each row shows a value area (number, skeleton, or "—") and a % column.
awaiting: user response

## Tests

### 1. Land on Dashboard — layout and net worth card
expected: With `npm run dev`, the app opens to the Dashboard. You see the page title "Dashboard", a top Card whose label reads "Net worth" (or "Total net worth (INR)"), and a second Card listing **seven** category rows in this order: Gold, Mutual Funds, Stocks, Bitcoin, Property, Bank Savings, Retirement. Each row shows a value area (number, skeleton, or "—") and a % column.
result: [pending]

### 2. Click each category row — navigation
expected: Clicking each of the seven row buttons changes the main content to the matching section (e.g. Gold row → Gold page title and content). The sidebar active item updates to match.
result: [pending]

### 3. Net worth matches visible rows
expected: The large net worth number at the top equals the sum of the seven row INR amounts, **excluding** any row that shows "—" (unpriced category). If every row is priced, the total matches the sum; if some are "—", the total is lower and a disclaimer may mention excluded categories.
result: [pending]

### 4. Empty portfolio message
expected: If there are no asset entries anywhere (or you use a profile with all zeros/empty lists per app rules), the Dashboard shows the "No holdings yet" heading and the supporting body line from the UI spec, **instead of** the two dashboard cards.
result: [pending]

### 5. Loading skeletons (optional)
expected: On a slow or first load, you may briefly see gray Skeleton blocks in the net worth figure and/or on rows that depend on live BTC or forex; they should clear to real numbers or "—" after prices resolve.
result: [pending]

### 6. Missing gold or BTC rate — row and disclaimer
expected: If gold items exist but Settings has no gold prices, the Gold row shows "—" and a hint about Settings. If Bitcoin needs live rates that are null, Bitcoin shows "—" and the net worth area may show a one-line disclaimer naming excluded categories and pointing to Settings or refresh.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps

[none yet]
