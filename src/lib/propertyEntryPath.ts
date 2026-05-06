import type { PropertyItem } from '@/types/data'

export type PropertyEntryPath = 'fullyPaid' | 'milestones' | 'mortgaged'

export const PATH_LABELS: Record<PropertyEntryPath, string> = {
  fullyPaid: 'Fully paid',
  milestones: 'Milestones',
  mortgaged: 'Mortgaged',
}

/**
 * Recommended edit-flow inference (31-RESEARCH): liability → mortgaged;
 * else milestones → milestones path; else fully paid.
 */
export function inferEntryPathFromPropertyItem(item: PropertyItem): PropertyEntryPath {
  if (item.hasLiability) return 'mortgaged'
  if (item.milestones.length > 0) return 'milestones'
  return 'fullyPaid'
}

export type DraftSlice = 'milestones' | 'liability'

/**
 * Draft slices to clear when switching from `previous` to `next` (D-03).
 * Only fields that belonged to the path being left are listed.
 */
export function getDraftFieldsToReset(
  previous: PropertyEntryPath,
  next: PropertyEntryPath
): Set<DraftSlice> {
  const out = new Set<DraftSlice>()
  if (previous === next) return out

  if (previous === 'fullyPaid') {
    return out
  }

  if (previous === 'milestones') {
    if (next === 'fullyPaid') {
      out.add('milestones')
      out.add('liability')
    }
    return out
  }

  // previous === 'mortgaged'
  if (next === 'fullyPaid') {
    out.add('milestones')
    out.add('liability')
  }
  return out
}
