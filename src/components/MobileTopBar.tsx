import { Menu, Sun, Moon, House } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useTheme } from '@/context/ThemeContext'
import { pathToSection, sectionToPath } from '@/lib/sectionRoutes'

export function MobileTopBar() {
  const { isMobile, toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const section = pathToSection(location.pathname)
  const showHome = section !== 'dashboard'

  if (!isMobile) return null

  return (
    <div className="z-40 flex min-h-[44px] w-full items-center gap-2 border-b border-border bg-background px-4">
      <div className="flex shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={toggleSidebar}
          aria-label="Toggle main navigation"
          className="min-h-[44px] min-w-[44px]"
        >
          <Menu className="size-5 shrink-0" aria-hidden />
        </Button>
      </div>
      <div className="flex min-h-[44px] flex-1 justify-center">
        {showHome ? (
          <Button
            asChild
            variant="ghost"
            className="min-h-[44px] min-w-[44px]"
          >
            <Link to={sectionToPath('dashboard')} aria-label="Go to dashboard">
              <House className="size-5 shrink-0" aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="flex shrink-0">
        <Button
          type="button"
          variant="ghost"
          className="min-h-[44px] min-w-[44px]"
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
