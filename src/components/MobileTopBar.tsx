import { Menu, Sun, Moon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ReportingCurrencySelect } from '@/components/ReportingCurrencySelect'
import { CurrencyFieldHint } from '@/components/CurrencyFieldHint'
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
  const isDashboard = section === 'dashboard'
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
    <div className="z-40 flex min-h-[44px] w-full items-center gap-2 border-b border-border bg-background px-4">
      <Button
        type="button"
        variant="ghost"
        onClick={toggleSidebar}
        aria-label="Toggle main navigation"
        className="min-h-[44px] min-w-[44px] shrink-0"
      >
        <Menu className="size-5 shrink-0" aria-hidden />
      </Button>
      <div className="flex min-h-[44px] flex-1 items-center justify-center">
        <Link
          to={sectionToPath('dashboard')}
          className="flex items-center gap-2 rounded-md px-2 py-1"
          aria-label="nwrth — go to dashboard"
        >
          <div
            className="grid size-6 shrink-0 place-items-center rounded-[6px] shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #5b5bd6, #3d3480)',
              color: 'white',
            }}
            aria-hidden
          >
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3.5">
              <rect x="5" y="16" width="4" height="8" rx="1" fill="currentColor" opacity="0.4" />
              <rect x="12" y="10" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
              <rect x="19" y="4" width="4" height="20" rx="1" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">nwrth</span>
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {isDashboard ? (
          <span className="inline-flex items-center gap-0.5">
            <ReportingCurrencySelect
              variant="chip"
              value={reportingCurrency}
              onChange={handleReportingChange}
            />
            <CurrencyFieldHint variant="reporting" aria-label="About reporting currency" />
          </span>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="min-h-[44px] min-w-[44px] shrink-0"
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
    </div>
  )
}
