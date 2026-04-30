import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTheme } from '@/context/ThemeContext'

export type SectionKey =
  | 'dashboard'
  | 'gold'
  | 'commodities'
  | 'mutualFunds'
  | 'stocks'
  | 'bitcoin'
  | 'property'
  | 'bankSavings'
  | 'retirement'
  | 'settings'

const NAV_ITEMS: { key: SectionKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'gold', label: 'Gold' },
  { key: 'commodities', label: 'Commodities' },
  { key: 'mutualFunds', label: 'Mutual Funds' },
  { key: 'stocks', label: 'Stocks' },
  { key: 'bitcoin', label: 'Bitcoin' },
  { key: 'property', label: 'Property' },
  { key: 'bankSavings', label: 'Bank Savings' },
  { key: 'retirement', label: 'Retirement' },
  { key: 'settings', label: 'Settings' },
]

interface Props {
  activeSection: SectionKey
  onSelect: (key: SectionKey) => void
}

export function AppSidebar({ activeSection, onSelect }: Props) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarHeader className="px-4 py-3">
        <span className="font-semibold text-sm">Wealth Tracker</span>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Main navigation">
          <SidebarMenu>
            {NAV_ITEMS.map(item => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  isActive={activeSection === item.key}
                  aria-current={activeSection === item.key ? 'page' : undefined}
                  className="min-h-[44px]"
                  onClick={() => {
                    onSelect(item.key)
                    if (isMobile) setOpenMobile(false)
                  }}
                >
                  {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          type="button"
          variant="ghost"
          className="min-h-[44px] w-full min-w-[44px] justify-start gap-2"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={
            theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
          }
        >
          {theme === 'light' ? (
            <Moon className="size-5 shrink-0" aria-hidden />
          ) : (
            <Sun className="size-5 shrink-0" aria-hidden />
          )}
          <span>
            {theme === 'light' ? 'Light' : 'Dark'}
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
