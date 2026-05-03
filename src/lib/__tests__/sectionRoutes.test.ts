import { describe, expect, it } from 'vitest'
import type { SectionKey } from '@/lib/sectionRoutes'
import {
  listSectionPaths,
  pathToSection,
  sectionToPath,
} from '@/lib/sectionRoutes'

const ALL_KEYS: SectionKey[] = [
  'dashboard',
  'gold',
  'commodities',
  'mutualFunds',
  'stocks',
  'bitcoin',
  'property',
  'liabilities',
  'bankSavings',
  'retirement',
  'settings',
]

describe('sectionRoutes', () => {
  it('round-trips every SectionKey through sectionToPath + pathToSection', () => {
    for (const key of ALL_KEYS) {
      const path = sectionToPath(key)
      expect(pathToSection(path)).toBe(key)
      const withoutLeading = path === '/' ? '/' : path.slice(1)
      expect(pathToSection(withoutLeading)).toBe(key)
    }
  })

  it('maps mutual-funds segment to mutualFunds', () => {
    expect(pathToSection('/mutual-funds')).toBe('mutualFunds')
    expect(sectionToPath('mutualFunds')).toBe('/mutual-funds')
  })

  it('returns null for unknown paths', () => {
    expect(pathToSection('/unknown')).toBeNull()
  })

  it('listSectionPaths includes each section path', () => {
    const paths = listSectionPaths()
    expect(paths).toContain('/')
    expect(paths).toContain('/mutual-funds')
    expect(paths.length).toBe(ALL_KEYS.length)
  })
})
