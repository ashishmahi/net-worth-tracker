import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import type { AppData } from '@/types/data'

function handleExport(data: AppData) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wealth-tracker-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function SettingsPage() {
  const { data } = useAppData()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
        <Button variant="outline" aria-label="Export data as JSON" onClick={() => handleExport(data)}>
          Export Data
        </Button>
      </div>
      <p className="text-muted-foreground">Settings — coming soon</p>
    </div>
  )
}
