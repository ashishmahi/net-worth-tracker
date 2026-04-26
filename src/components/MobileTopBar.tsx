import { Menu, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useTheme } from '@/context/ThemeContext'

export function MobileTopBar() {
  const { isMobile, toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  if (!isMobile) return null

  return (
    <div className="z-40 flex min-h-[44px] w-full items-center justify-between border-b border-border bg-background px-4">
      <Button
        type="button"
        variant="ghost"
        onClick={toggleSidebar}
        aria-label="Toggle main navigation"
        className="min-h-[44px] min-w-[44px]"
      >
        <Menu className="size-5 shrink-0" aria-hidden />
      </Button>
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
  )
}
