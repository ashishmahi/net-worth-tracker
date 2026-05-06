import { describe, expect, it } from 'vitest'
import {
  PROPERTY_VALIDATION_CODES,
  getPropertyValidationIssues,
} from '@/lib/propertyValidation'
import type { PropertyItem } from '@/types/data'

function baseItem(over: Partial<PropertyItem> = {}): PropertyItem {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    label: 'Test property',
    agreementInr: 1_000_000,
    milestones: [],
    hasLiability: false,
    ...over,
  }
}

describe('getPropertyValidationIssues', () => {
  it('returns no issues for minimal fully-paid-like row', () => {
    const item = baseItem({
      milestones: [],
      hasLiability: false,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-01: milestone total equal to agreement passes', () => {
    const item = baseItem({
      agreementInr: 500_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'A', amountInr: 250_000, isPaid: false },
        { id: crypto.randomUUID(), label: 'B', amountInr: 250_000, isPaid: false },
      ],
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-01: milestone total above agreement fails', () => {
    const item = baseItem({
      agreementInr: 400_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'A', amountInr: 250_000, isPaid: false },
        { id: crypto.randomUUID(), label: 'B', amountInr: 250_000, isPaid: false },
      ],
    })
    expect(getPropertyValidationIssues(item)).toEqual([
      {
        code: PROPERTY_VALIDATION_CODES.MILESTONE_TOTAL_EXCEEDS_AGREEMENT,
        message: 'Milestone total exceeds agreement. Check amounts.',
      },
    ])
  })

  it('PRV-02: outstanding required when liability on and outstanding missing', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoanInr: undefined,
    })
    expect(getPropertyValidationIssues(item)).toEqual([
      {
        code: PROPERTY_VALIDATION_CODES.OUTSTANDING_REQUIRED,
        message: 'Outstanding loan must be greater than zero.',
      },
    ])
  })

  it('PRV-02: outstanding required when liability on and outstanding is zero', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoanInr: 0,
    })
    expect(getPropertyValidationIssues(item)).toEqual([
      {
        code: PROPERTY_VALIDATION_CODES.OUTSTANDING_REQUIRED,
        message: 'Outstanding loan must be greater than zero.',
      },
    ])
  })

  it('PRV-02: outstanding equal to agreement passes', () => {
    const item = baseItem({
      agreementInr: 900_000,
      hasLiability: true,
      outstandingLoanInr: 900_000,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-02: outstanding exceeds agreement fails', () => {
    const item = baseItem({
      agreementInr: 800_000,
      hasLiability: true,
      outstandingLoanInr: 800_001,
    })
    expect(getPropertyValidationIssues(item)).toEqual([
      {
        code: PROPERTY_VALIDATION_CODES.OUTSTANDING_EXCEEDS_AGREEMENT,
        message: 'Outstanding loan cannot exceed agreement value.',
      },
    ])
  })

  it('PRV-03: optional EMI omitted passes when outstanding ok', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoanInr: 400_000,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-03: EMI zero is permissive', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoanInr: 400_000,
      emiInr: 0,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-03: EMI must be strictly less than outstanding when both positive', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoanInr: 300_000,
      emiInr: 300_000,
    })
    expect(getPropertyValidationIssues(item)).toEqual([
      {
        code: PROPERTY_VALIDATION_CODES.EMI_NOT_LESS_THAN_OUTSTANDING,
        message: 'EMI must be less than outstanding loan.',
      },
    ])
  })

  it('PRV-03: EMI just below outstanding passes', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoanInr: 300_000,
      emiInr: 299_999.99,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('can surface milestone issue alongside liability when both apply', () => {
    const item = baseItem({
      agreementInr: 100_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'A', amountInr: 200_000, isPaid: false },
      ],
      hasLiability: true,
      outstandingLoanInr: 0,
    })
    const issues = getPropertyValidationIssues(item)
    expect(issues.some(i => i.code === PROPERTY_VALIDATION_CODES.MILESTONE_TOTAL_EXCEEDS_AGREEMENT)).toBe(
      true
    )
    expect(issues.some(i => i.code === PROPERTY_VALIDATION_CODES.OUTSTANDING_REQUIRED)).toBe(true)
  })
})
