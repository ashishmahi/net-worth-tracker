// ── Financial input parsing ───────────────────────────────────────────────────

/**
 * Parse a user-typed currency string (Indian or Western formatting) to a
 * floating-point-safe number rounded to 2 decimal places.
 *
 * Examples:
 *   parseFinancialInput('1,50,000')  → 150000
 *   parseFinancialInput('1,500.50')  → 1500.50
 *   parseFinancialInput('')          → 0
 *   parseFinancialInput('abc')       → 0
 */
export function parseFinancialInput(value: string | undefined | null): number {
  if (!value) return 0
  const cleaned = String(value).replace(/,/g, '').trim()
  const num = parseFloat(cleaned)
  if (isNaN(num)) return 0
  return Math.round(num * 100) / 100
}

/**
 * Round a computed number to 2 decimal places to prevent floating-point drift.
 * Use after every multiplication in calculations.
 *
 * Example: roundCurrency(0.1 + 0.2) → 0.3
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

// ── UUID and timestamp helpers ────────────────────────────────────────────────

/** Generate a RFC 4122 UUID using browser-native API (no library needed). */
export function createId(): string {
  return crypto.randomUUID()
}

/** Return current time as ISO 8601 string for updatedAt / createdAt fields. */
export function nowIso(): string {
  return new Date().toISOString()
}
