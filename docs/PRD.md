# Personal Wealth Tracker — Product Summary

## What It Is

A local-only web app for tracking personal net worth across multiple asset classes **and** standalone debts (home, car, personal, and other loans). Replaces manual spreadsheet tracking with a structured view of wealth and obligations in INR. **Headline net worth** subtracts **standalone** liabilities (the Liabilities list) from gross assets; a mortgage on property still affects gross assets through that property’s equity (`agreement − outstanding`).

## Who It's For

Single user (personal use). No accounts, no login, no cloud sync. Data lives entirely on the user's machine.

---

## Asset Classes Tracked


| Asset                 | How Value Is Captured                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| **Gold**              | Weight (grams) by karat (24K/22K/18K) × manually set per-gram price      |
| **Silver**            | Weight in grams × live silver spot price (auto-fetched)                  |
| **Other Commodities** | Manual INR value with a label                                            |
| **Mutual Funds**      | Current value + monthly SIP per platform                                 |
| **Stocks**            | Current value per platform/broker                                        |
| **Bitcoin**           | Quantity × live BTC price (auto-fetched, converted to INR)               |
| **Property**          | Agreement value with milestone payment tracker + optional loan liability (balance reduces equity); optional **lender** and **monthly EMI** when liability is on |
| **Bank Savings**      | Account balances in INR or AED (auto-converted to INR)                   |
| **Retirement**        | NPS and EPF current balances                                             |
| **Standalone liabilities** | Loans **not** tied to a property row — label, lender, outstanding balance, EMI, type (home / car / personal / other); managed on the **Liabilities** page |

---

## Key Features

- **Dashboard** — debt-adjusted headline net worth, per-category breakdown (percentages use **gross** assets), optional **Total Debt** row (property + standalone loans) linking to Liabilities, **debt-to-asset ratio** when debt exists, and **record snapshot** storing net-of-loan totals
- **Live prices** — Bitcoin (USD) and forex rates (USD/INR, AED/INR, silver/USD) fetched automatically; gold price set manually in Settings
- **Liabilities** — full CRUD for standalone loans; sidebar navigation entry after Property
- **Net worth history** — user can save point-in-time snapshots (values reflect debt-adjusted net worth at save time) and view a trend chart over time
- **Data import/export** — full JSON import/export for backup or migration
- **Data reset** — wipe all data and start fresh
- **Settings** — configure gold per-gram prices (24K/22K/18K) and retirement assumptions (current age, target age, return rates)

---

## What It Does NOT Do

- No user accounts or authentication
- No cloud storage or sync
- No mobile app
- No automatic gold price fetching (gold price is set manually)
- No investment advice or projections (except retirement estimates based on user-set assumptions)

---

## v1.x Milestone History


| Version | What Shipped                                                  |
| ------- | ------------------------------------------------------------- |
| v1.0    | Core app — all 7 asset sections, dashboard, local persistence |
| v1.1    | UX polish                                                     |
| v1.2    | Data reset feature                                            |
| v1.3    | Net worth history + chart                                     |
| v1.4    | Multiple commodities (silver + other)                         |
| v1.5    | Debt & liabilities — schema + migration, pure calc helpers, property lender/EMI + hint, Liabilities CRUD page, dashboard net worth + Total Debt + ratio |

