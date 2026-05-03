/**
 * Canonical URL paths for each wealth section. Router paths are relative to
 * `BrowserRouter` basename (`import.meta.env.BASE_URL`); `location.pathname`
 * is already basename-relative.
 */

export type SectionKey =
  | 'dashboard'
  | 'gold'
  | 'commodities'
  | 'mutualFunds'
  | 'stocks'
  | 'bitcoin'
  | 'property'
  | 'liabilities'
  | 'bankSavings'
  | 'retirement'
  | 'settings'

const SEGMENT_BY_KEY: Record<Exclude<SectionKey, 'dashboard'>, string> = {
  gold: 'gold',
  commodities: 'commodities',
  mutualFunds: 'mutual-funds',
  stocks: 'stocks',
  bitcoin: 'bitcoin',
  property: 'property',
  liabilities: 'liabilities',
  bankSavings: 'bank-savings',
  retirement: 'retirement',
  settings: 'settings',
}

const KEY_BY_SEGMENT: Record<string, SectionKey> = {}
for (const [key, segment] of Object.entries(SEGMENT_BY_KEY) as [
  Exclude<SectionKey, 'dashboard'>,
  string,
][]) {
  KEY_BY_SEGMENT[segment] = key
}

export const SECTION_PATHS: Record<SectionKey, string> = {
  dashboard: '/',
  gold: '/gold',
  commodities: '/commodities',
  mutualFunds: '/mutual-funds',
  stocks: '/stocks',
  bitcoin: '/bitcoin',
  property: '/property',
  liabilities: '/liabilities',
  bankSavings: '/bank-savings',
  retirement: '/retirement',
  settings: '/settings',
}

/** Ordered list of path strings (including `/` for dashboard). */
export function listSectionPaths(): string[] {
  return (Object.keys(SECTION_PATHS) as SectionKey[]).map(
    k => SECTION_PATHS[k]
  )
}

export function sectionToPath(key: SectionKey): string {
  return SECTION_PATHS[key]
}

/**
 * Map a basename-relative pathname from React Router to a section.
 * Accepts `/`, `/gold`, optional trailing slash; unknown segments → `null`.
 */
export function pathToSection(pathname: string): SectionKey | null {
  let p = pathname.trim()
  if (p === '' || p === '/') return 'dashboard'
  if (p.endsWith('/') && p.length > 1) {
    p = p.slice(0, -1)
  }
  if (!p.startsWith('/')) {
    p = `/${p}`
  }
  if (p === '/') return 'dashboard'
  const segment = p.slice(1).split('/')[0] ?? ''
  return KEY_BY_SEGMENT[segment] ?? null
}
