import { Menu, Sun, Moon, House } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ReportingCurrencySelect } from '@/components/ReportingCurrencySelect'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useAppData } from '@/context/AppDataContext'
import { useTheme } from '@/context/ThemeContext'
import { nowIso } from '@/lib/financials'
import { pathToSection, sectionToPath } from '@/lib/sectionRoutes'
import type { CurrencyCode } from '@/types/currency'

export function MobileTopBar() {
  const { isMobile, toggleSidebar } = useSidebar()
  const { data, saveData } = useAppData()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const section = pathToSection(location.pathname)
  const showHome = section !== 'dashboard'
  const reportingCurrency = data.settings.reportingCurrency ?? 'INR'
  const handleReportingChange = (code: CurrencyCode) => {
    void saveData({
      ...data,
      settings: {
        ...data.settings,
        reportingCurrency: code,
        updatedAt: nowIso(),
      },
    })
  }

  if (!isMobile) return null

  return (
    <div className="z-40 flex min-h-[44px] w-full items-center gap-2 border-b border-border bg-background px-3">
      <Button
        type="button"
        variant="ghost"
        onClick={toggleSidebar}
        aria-label="Toggle main navigation"
        className="size-11 shrink-0 p-0"
      >
        <Menu className="size-5 shrink-0" aria-hidden />
      </Button>
      {showHome ? (
        <Button
          asChild
          variant="ghost"
          className="size-11 shrink-0 p-0"
        >
          <Link to={sectionToPath('dashboard')} aria-label="Go to dashboard">
            <House className="size-5 shrink-0" aria-hidden />
          </Link>
        </Button>
      ) : null}
      <div className="min-w-0 flex-1">
        <ReportingCurrencySelect
          compact
          value={reportingCurrency}
          onChange={handleReportingChange}
          className="w-full"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        className="size-11 shrink-0 p-0"
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
      </Button>
    </div>
  )
}
