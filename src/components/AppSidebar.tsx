import { NavLink, useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTheme } from '@/context/ThemeContext'
import {
  pathToSection,
  sectionToPath,
  type SectionKey,
} from '@/lib/sectionRoutes'
import { cn } from '@/lib/utils'

export type { SectionKey } from '@/lib/sectionRoutes'

const OVERVIEW: { key: SectionKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
]

const ASSETS: { key: SectionKey; label: string }[] = [
  { key: 'gold', label: 'Gold' },
  { key: 'commodities', label: 'Commodities' },
  { key: 'mutualFunds', label: 'Mutual Funds' },
  { key: 'stocks', label: 'Stocks' },
  { key: 'bitcoin', label: 'Bitcoin' },
  { key: 'property', label: 'Property' },
  { key: 'bankSavings', label: 'Bank Savings' },
  { key: 'retirement', label: 'Retirement' },
]

const OTHER: { key: SectionKey; label: string }[] = [
  { key: 'liabilities', label: 'Liabilities' },
  { key: 'settings', label: 'Settings' },
]

function NavRows({
  items,
  current,
  onNavigate,
}: {
  items: { key: SectionKey; label: string }[]
  current: SectionKey
  onNavigate: () => void
}) {
  return (
    <>
      {items.map(item => (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton
            asChild
            isActive={current === item.key}
            className={cn(
              'min-h-10 gap-2.5 rounded-[calc(var(--radius)-2px)] px-3 text-[13.5px]',
              current === item.key &&
                'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-none'
            )}
          >
            <NavLink
              to={sectionToPath(item.key)}
              end={item.key === 'dashboard'}
              onClick={onNavigate}
              className="flex w-full items-center gap-2.5"
            >
              <span
                className={cn(
                  'size-1.5 shrink-0 rounded-full bg-muted-foreground/50',
                  current === item.key &&
                    'bg-primary ring-2 ring-primary/25 ring-offset-2 ring-offset-sidebar'
                )}
                aria-hidden
              />
              <span>{item.label}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  )
}

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const current = pathToSection(location.pathname) ?? 'dashboard'

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-0 border-b border-sidebar-border px-[22px] pb-[18px] pt-[22px]">
        <div className="flex items-center gap-2.5">
          <div
            className="grid size-7 shrink-0 place-items-center rounded-[8px] shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 270))',
              color: 'var(--accent-fg)',
            }}
            aria-hidden
          >
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
              <rect x="5" y="16" width="4" height="8" rx="1" fill="currentColor" opacity="0.4" />
              <rect x="12" y="10" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
              <rect x="19" y="4" width="4" height="20" rx="1" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold leading-tight tracking-tight text-sidebar-foreground">
              nwrth
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Net worth · local only
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2.5 pt-2.5">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavRows
                items={OVERVIEW}
                current={current}
                onNavigate={closeMobile}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Assets
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavRows
                items={ASSETS}
                current={current}
                onNavigate={closeMobile}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Other
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavRows
                items={OTHER}
                current={current}
                onNavigate={closeMobile}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2.5">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-[calc(var(--radius)-4px)] border-sidebar-border bg-sidebar"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={
              theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }
          >
            {theme === 'light' ? (
              <Moon className="size-4" aria-hidden />
            ) : (
              <Sun className="size-4" aria-hidden />
            )}
          </Button>
          <div className="flex-1" />
          <span
            className="inline-flex max-w-[min(100%,200px)] items-center gap-1.5 rounded-full border border-sidebar-border bg-sidebar px-2.5 py-1.5 text-[11px] text-muted-foreground"
            title="Wealth data stays in this browser (localStorage). Nothing is uploaded."
          >
            <span
              className="size-1.5 shrink-0 animate-pulse rounded-full bg-[hsl(var(--positive))]"
              aria-hidden
            />
            <span className="truncate">Stored on this device</span>
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
