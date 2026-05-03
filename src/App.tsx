import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { MobileTopBar } from '@/components/MobileTopBar'
import { useAppData } from '@/context/AppDataContext'
import { GoldSpotPricesSync } from '@/context/GoldSpotPricesSync'
import { SilverSpotPricesSync } from '@/context/SilverSpotPricesSync'
import { sectionToPath } from '@/lib/sectionRoutes'
import { DashboardPage } from '@/pages/DashboardPage'
import { GoldPage } from '@/pages/GoldPage'
import { CommoditiesPage } from '@/pages/CommoditiesPage'
import { MutualFundsPage } from '@/pages/MutualFundsPage'
import { StocksPage } from '@/pages/StocksPage'
import { BitcoinPage } from '@/pages/BitcoinPage'
import { PropertyPage } from '@/pages/PropertyPage'
import { LiabilitiesPage } from '@/pages/LiabilitiesPage'
import { BankSavingsPage } from '@/pages/BankSavingsPage'
import { RetirementPage } from '@/pages/RetirementPage'
import { SettingsPage } from '@/pages/SettingsPage'

function DashboardRoute() {
  const navigate = useNavigate()
  return (
    <DashboardPage
      onNavigate={key => navigate(sectionToPath(key))}
    />
  )
}

function AppLayout() {
  const { loadError } = useAppData()

  return (
    <>
      <GoldSpotPricesSync />
      <SilverSpotPricesSync />
      <AppSidebar />
      <SidebarInset>
        <MobileTopBar />
        <main className="p-6">
          {loadError && (
            <div className="mb-6 rounded border bg-muted p-4 text-sm text-foreground">
              {loadError}
            </div>
          )}
          <Outlet />
        </main>
      </SidebarInset>
    </>
  )
}

export default function App() {
  return (
    <SidebarProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardRoute />} />
          <Route path="gold" element={<GoldPage />} />
          <Route path="commodities" element={<CommoditiesPage />} />
          <Route path="mutual-funds" element={<MutualFundsPage />} />
          <Route path="stocks" element={<StocksPage />} />
          <Route path="bitcoin" element={<BitcoinPage />} />
          <Route path="property" element={<PropertyPage />} />
          <Route path="liabilities" element={<LiabilitiesPage />} />
          <Route path="bank-savings" element={<BankSavingsPage />} />
          <Route path="retirement" element={<RetirementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </SidebarProvider>
  )
}
