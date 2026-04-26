import { useState } from 'react'
import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, type SectionKey } from '@/components/AppSidebar'
import { useAppData } from '@/context/AppDataContext'
import { DashboardPage } from '@/pages/DashboardPage'
import { GoldPage } from '@/pages/GoldPage'
import { MutualFundsPage } from '@/pages/MutualFundsPage'
import { StocksPage } from '@/pages/StocksPage'
import { BitcoinPage } from '@/pages/BitcoinPage'
import { PropertyPage } from '@/pages/PropertyPage'
import { BankSavingsPage } from '@/pages/BankSavingsPage'
import { RetirementPage } from '@/pages/RetirementPage'
import { SettingsPage } from '@/pages/SettingsPage'

const SECTION_COMPONENTS: Record<Exclude<SectionKey, 'dashboard'>, React.ComponentType> = {
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
  const { loadError } = useAppData()

  return (
    <SidebarProvider>
      <AppSidebar activeSection={activeSection} onSelect={setActiveSection} />
      <SidebarInset>
        <main className="p-6">
          {loadError && (
            <div className="mb-6 rounded border bg-muted p-4 text-sm text-foreground">
              {loadError}
            </div>
          )}
          {activeSection === 'dashboard' ? (
            <DashboardPage onNavigate={setActiveSection} />
          ) : (
            (() => {
              const Page = SECTION_COMPONENTS[activeSection]
              return <Page />
            })()
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
