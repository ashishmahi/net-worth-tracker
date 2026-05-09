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
    agreementAmount: 1_000_000,
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
      agreementAmount: 500_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'A', amount: 250_000, isPaid: false },
        { id: crypto.randomUUID(), label: 'B', amount: 250_000, isPaid: false },
      ],
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-01: milestone total above agreement fails', () => {
    const item = baseItem({
      agreementAmount: 400_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'A', amount: 250_000, isPaid: false },
        { id: crypto.randomUUID(), label: 'B', amount: 250_000, isPaid: false },
      ],
    })
    expect(getPropertyValidationIssues(item)).toEqual([
      {
        code: PROPERTY_VALIDATION_CODES.MILESTONE_TOTAL_EXCEEDS_AGREEMENT,
        message: 'Milestone total exceeds agreement. Check amounts.',
      },
    ])
  })

  it('PRV-03: milestone amount zero fails', () => {
    const item = baseItem({
      agreementAmount: 500_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'A', amount: 0, isPaid: false },
      ],
    })
    expect(getPropertyValidationIssues(item)).toEqual([
      {
        code: PROPERTY_VALIDATION_CODES.MILESTONE_AMOUNT_NONPOSITIVE,
        message: 'Each milestone amount must be greater than zero.',
      },
    ])
  })

  it('PRV-02: outstanding required when liability on and outstanding missing', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoan: undefined,
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
      outstandingLoan: 0,
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
      agreementAmount: 900_000,
      hasLiability: true,
      outstandingLoan: 900_000,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-02: outstanding exceeds agreement fails', () => {
    const item = baseItem({
      agreementAmount: 800_000,
      hasLiability: true,
      outstandingLoan: 800_001,
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
      outstandingLoan: 400_000,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-03: EMI zero is permissive', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoan: 400_000,
      emi: 0,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('PRV-03: EMI must be strictly less than outstanding when both positive', () => {
    const item = baseItem({
      hasLiability: true,
      outstandingLoan: 300_000,
      emi: 300_000,
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
      outstandingLoan: 300_000,
      emi: 299_999.99,
    })
    expect(getPropertyValidationIssues(item)).toEqual([])
  })

  it('can surface milestone issue alongside liability when both apply', () => {
    const item = baseItem({
      agreementAmount: 100_000,
      milestones: [
        { id: crypto.randomUUID(), label: 'A', amount: 200_000, isPaid: false },
      ],
      hasLiability: true,
      outstandingLoan: 0,
    })
    const issues = getPropertyValidationIssues(item)
    expect(issues.some(i => i.code === PROPERTY_VALIDATION_CODES.MILESTONE_TOTAL_EXCEEDS_AGREEMENT)).toBe(
      true
    )
    expect(issues.some(i => i.code === PROPERTY_VALIDATION_CODES.OUTSTANDING_REQUIRED)).toBe(true)
  })
})
