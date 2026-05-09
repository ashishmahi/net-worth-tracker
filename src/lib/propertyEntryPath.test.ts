import { describe, expect, it } from 'vitest'
import {
  getDraftFieldsToReset,
  inferEntryPathFromPropertyItem,
  PATH_LABELS,
} from '@/lib/propertyEntryPath'
import type { PropertyItem } from '@/types/data'

const base = {
  id: '00000000-0000-4000-8000-000000000001',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  label: 'Test',
  agreementAmount: 1_000_000,
}

describe('PATH_LABELS', () => {
  it('uses medium labels per D-04', () => {
    expect(PATH_LABELS.fullyPaid).toBe('Fully paid')
    expect(PATH_LABELS.milestones).toBe('Milestones')
    expect(PATH_LABELS.mortgaged).toBe('Mortgaged')
  })
})

describe('inferEntryPathFromPropertyItem', () => {
  it('returns mortgaged when hasLiability regardless of milestones', () => {
    const item: PropertyItem = {
      ...base,
      milestones: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          label: 'Stage',
          amount: 100,
          isPaid: false,
        },
      ],
      hasLiability: true,
    }
    expect(inferEntryPathFromPropertyItem(item)).toBe('mortgaged')
  })

  it('returns milestones when no liability and milestones non-empty', () => {
    const item: PropertyItem = {
      ...base,
      milestones: [
        {
          id: '00000000-0000-4000-8000-000000000003',
          label: 'Stage',
          amount: 100,
          isPaid: false,
        },
      ],
      hasLiability: false,
    }
    expect(inferEntryPathFromPropertyItem(item)).toBe('milestones')
  })

  it('returns fullyPaid when no liability and milestones empty', () => {
    const item: PropertyItem = {
      ...base,
      milestones: [],
      hasLiability: false,
    }
    expect(inferEntryPathFromPropertyItem(item)).toBe('fullyPaid')
  })
})

describe('getDraftFieldsToReset', () => {
  it('fullyPaid → mortgaged: nothing to clear', () => {
    const s = getDraftFieldsToReset('fullyPaid', 'mortgaged')
    expect([...s].sort()).toEqual([])
  })

  it('mortgaged → fullyPaid: clear milestones and liability drafts', () => {
    const s = getDraftFieldsToReset('mortgaged', 'fullyPaid')
    expect([...s].sort()).toEqual(['liability', 'milestones'])
  })

  it('milestones → fullyPaid: clear milestones and liability', () => {
    const s = getDraftFieldsToReset('milestones', 'fullyPaid')
    expect([...s].sort()).toEqual(['liability', 'milestones'])
  })

  it('milestones → mortgaged: keep milestone + liability drafts', () => {
    const s = getDraftFieldsToReset('milestones', 'mortgaged')
    expect([...s].sort()).toEqual([])
  })
})
