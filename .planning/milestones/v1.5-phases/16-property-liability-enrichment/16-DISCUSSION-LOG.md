# Phase 16: Property Liability Enrichment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 16-property-liability-enrichment
**Areas discussed:** Field order & grouping, Disambiguation hint, EMI field details

---

## Field Order & Grouping

| Option | Description | Selected |
|--------|-------------|----------|
| Outstanding loan → Lender → EMI | Existing field first, new enrichment fields follow | ✓ |
| Lender → Outstanding loan → EMI | Lender as logical header for the loan section | |
| Outstanding loan → EMI → Lender | Numbers grouped, lender last | |

**User's choice:** Outstanding loan (INR) → Lender (optional) → EMI ₹/month (optional)
**Notes:** Keeps existing field in place; no visual disruption for users who already have outstanding loan data saved.

---

## Disambiguation Hint

### Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Always visible, below toggle row | Shown to all users regardless of toggle state | ✓ |
| Only visible when toggle is OFF | Guidance disappears once user commits to using the section | |
| Inside expanded toggle section | Footer note after EMI field | |

**User's choice:** Always visible — below the toggle row, above the conditional fields.

### Copy

| Option | Description | Selected |
|--------|-------------|----------|
| Short + directive | "For loans not tied to a specific property (personal, car, etc.), use the Liabilities page." | ✓ |
| Conversational | "This section is for your home loan on this property. Got a car loan or personal loan? Track it on the Liabilities page." | |
| You decide | Claude matches existing UI tone | |

**User's choice:** Short + directive.

### Link

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, link to /liabilities | React Router Link — functional once Phase 17 ships | ✓ |
| No, plain text | Simpler, no route dependency | |

**User's choice:** Link to `/liabilities`.

---

## EMI Field Details

| Option | Description | Selected |
|--------|-------------|----------|
| EMI (₹/month) + placeholder e.g. 25,000 | Matches roadmap spec; Indian formatting | ✓ |
| Monthly EMI (INR) + placeholder e.g. 25,000 | More verbose label | |
| You decide | Claude matches outstanding loan label style | |

**User's choice:** Label "EMI (₹/month)", placeholder "e.g. 25,000".
**Notes:** Helper text and Lender placeholder left to Claude's discretion to match existing form style.

---

## Claude's Discretion

- Helper text for EMI field
- Lender placeholder copy
- Tailwind spacing between fields under the toggle
- Link styling for "Liabilities page" in the hint

## Deferred Ideas

None.
