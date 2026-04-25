import { useState } from 'react'
import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, type SectionKey } from '@/components/AppSidebar'
import { DashboardPage } from '@/pages/DashboardPage'
import { GoldPage } from '@/pages/GoldPage'
import { MutualFundsPage } from '@/pages/MutualFundsPage'
import { StocksPage } from '@/pages/StocksPage'
import { BitcoinPage } from '@/pages/BitcoinPage'
import { PropertyPage } from '@/pages/PropertyPage'
import { BankSavingsPage } from '@/pages/BankSavingsPage'
import { RetirementPage } from '@/pages/RetirementPage'
import { SettingsPage } from '@/pages/SettingsPage'

const SECTION_COMPONENTS: Record<SectionKey, React.ComponentType> = {
  dashboard: DashboardPage,
  gold: GoldPage,
  mutualFunds: MutualFundsPage,
  stocks: StocksPage,
  bitcoin: BitcoinPage,
  property: PropertyPage,
  bankSavings: BankSavingsPage,
  retirement: RetirementPage,
  settings: SettingsPage,
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard') // D-05

  const ActivePage = SECTION_COMPONENTS[activeSection]

  return (
    <SidebarProvider>
      <AppSidebar activeSection={activeSection} onSelect={setActiveSection} />
      <SidebarInset>
        <main className="p-6">
          <ActivePage />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
