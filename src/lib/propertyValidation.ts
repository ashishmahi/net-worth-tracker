import { roundCurrency } from '@/lib/financials'
import type { PropertyItem } from '@/types/data'

/** Stable codes shared by sheet validation and Zod superRefine */
export const PROPERTY_VALIDATION_CODES = {
  MILESTONE_TOTAL_EXCEEDS_AGREEMENT: 'MILESTONE_TOTAL_EXCEEDS_AGREEMENT',
  MILESTONE_AMOUNT_NONPOSITIVE: 'MILESTONE_AMOUNT_NONPOSITIVE',
  OUTSTANDING_REQUIRED: 'OUTSTANDING_REQUIRED',
  OUTSTANDING_EXCEEDS_AGREEMENT: 'OUTSTANDING_EXCEEDS_AGREEMENT',
  EMI_NOT_LESS_THAN_OUTSTANDING: 'EMI_NOT_LESS_THAN_OUTSTANDING',
} as const

export type PropertyValidationCode =
  (typeof PROPERTY_VALIDATION_CODES)[keyof typeof PROPERTY_VALIDATION_CODES]

export type PropertyValidationIssue = Readonly<{
  code: PropertyValidationCode
  message: string
}>

/**
 * Pure cross-field checks for a persisted-shaped PropertyItem (numeric fields parsed).
 * Ordering: milestone total vs agreement (any liability); then loan rules when hasLiability.
 */
export function getPropertyValidationIssues(item: PropertyItem): ReadonlyArray<PropertyValidationIssue> {
  const issues: PropertyValidationIssue[] = []

  if (item.milestones.length > 0) {
    for (const m of item.milestones) {
      if (m.amount <= 0) {
        issues.push({
          code: PROPERTY_VALIDATION_CODES.MILESTONE_AMOUNT_NONPOSITIVE,
          message: 'Each milestone amount must be greater than zero.',
        })
        break
      }
    }
    const total = roundCurrency(item.milestones.reduce((sum, m) => sum + m.amount, 0))
    if (total > item.agreementAmount) {
      issues.push({
        code: PROPERTY_VALIDATION_CODES.MILESTONE_TOTAL_EXCEEDS_AGREEMENT,
        message: 'Milestone total exceeds agreement. Check amounts.',
      })
    }
  }

  if (item.hasLiability) {
    const outstanding = item.outstandingLoan
    if (outstanding === undefined || outstanding <= 0) {
      issues.push({
        code: PROPERTY_VALIDATION_CODES.OUTSTANDING_REQUIRED,
        message: 'Outstanding loan must be greater than zero.',
      })
    } else if (outstanding > item.agreementAmount) {
      issues.push({
        code: PROPERTY_VALIDATION_CODES.OUTSTANDING_EXCEEDS_AGREEMENT,
        message: 'Outstanding loan cannot exceed agreement value.',
      })
    } else if (
      outstanding > 0 &&
      item.emi !== undefined &&
      item.emi > 0 &&
      item.emi >= outstanding
    ) {
      issues.push({
        code: PROPERTY_VALIDATION_CODES.EMI_NOT_LESS_THAN_OUTSTANDING,
        message: 'EMI must be less than outstanding loan.',
      })
    }
  }

  return issues
}
