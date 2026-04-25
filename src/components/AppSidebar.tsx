import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

export type SectionKey =
  | 'dashboard'
  | 'gold'
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
  return (
    <Sidebar collapsible="none" className="border-r">
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
                  onClick={() => onSelect(item.key)}
                >
                  {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}
