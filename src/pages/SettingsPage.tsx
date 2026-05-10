import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import type { ZodError } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createInitialData, parseAppDataFromImport, useAppData } from '@/context/AppDataContext'
import { parseFinancialInput, nowIso } from '@/lib/financials'
import { SettingsGoldPricingCard } from '@/components/settings/SettingsGoldPricingCard'
import { SettingsSilverPricingCard } from '@/components/settings/SettingsSilverPricingCard'
import { SettingsLiveRatesCard } from '@/components/settings/SettingsLiveRatesCard'
import {
  createWealthExportZip,
  extractDataJsonFromZip,
  isDataJsonEntryEncrypted,
  isZipInvalidPassword,
  WealthZipError,
  WEALTH_ZIP_NO_DATA_JSON,
} from '@/lib/wealthDataZip'
import type { AppData } from '@/types/data'

function zodFirstHint(err: ZodError): string {
  const i = err.issues[0]
  if (!i) return `${err.issues.length} validation issues`
  const p = i.path.length ? i.path.join('.') : 'root'
  return `${p}: ${i.message}${err.issues.length > 1 ? ` (+${err.issues.length - 1} more)` : ''}`
}

type SettingsTabId = 'pricing' | 'retirement' | 'rates' | 'data' | 'danger'

const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'pricing', label: 'Gold & Silver' },
  { id: 'retirement', label: 'Retirement' },
  { id: 'rates', label: 'Live rates' },
  { id: 'data', label: 'Backup & restore' },
  { id: 'danger', label: 'Reset' },
]

function SettingsTabStrip({
  tab,
  onTabChange,
}: {
  tab: SettingsTabId
  onTabChange: (t: SettingsTabId) => void
}) {
  return (
    <div
      className="flex flex-wrap gap-0.5 rounded-xl border border-border bg-muted/50 p-1.5 shadow-sm sm:flex-nowrap sm:overflow-x-auto sm:[scrollbar-width:thin]"
      role="tablist"
      aria-label="Settings sections"
    >
      {SETTINGS_TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          id={`settings-tab-${id}`}
          className={cn(
            'min-h-10 shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all',
            tab === id
              ? 'bg-card font-semibold text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
          )}
          onClick={() => onTabChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Form schemas (string inputs — parse to number on submit) ─────────────────
// NEVER use z.number() for form fields bound to text inputs (see RESEARCH.md Pitfall 1)

const retirementSchema = z.object({
  currentAge: z.string().min(1, 'This field is required.'),
  targetAge: z.string().min(1, 'This field is required.'),
  npsReturnPct: z.string().min(1, 'This field is required.'),
  epfRatePct: z.string().min(1, 'This field is required.'),
})
type RetirementValues = z.infer<typeof retirementSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { data, saveData } = useAppData()
  // Per-block save state (D-19 — separate Save buttons, not one global Save)
  const [retirementSaving, setRetirementSaving] = useState(false)
  const [retirementSaveError, setRetirementSaveError] = useState<string | null>(null)

  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [clearingData, setClearingData] = useState(false)
  const [clearDataError, setClearDataError] = useState<string | null>(null)
  const [clearDataSuccess, setClearDataSuccess] = useState(false)

  const importFileInputRef = useRef<HTMLInputElement>(null)
  const [importBusy, setImportBusy] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<AppData | null>(null)
  const [importParseError, setImportParseError] = useState<string | null>(null)
  const [importValidationError, setImportValidationError] = useState<string | null>(null)
  const [importValidationHint, setImportValidationHint] = useState<string | null>(null)
  const [importSaveError, setImportSaveError] = useState<string | null>(null)
  const [importDataSuccess, setImportDataSuccess] = useState(false)

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportPassphrase, setExportPassphrase] = useState('')
  const [exportBusy, setExportBusy] = useState(false)
  const [exportEncryptError, setExportEncryptError] = useState<string | null>(null)
  const [showExportPassphrase, setShowExportPassphrase] = useState(false)

  const [importPassphraseModalOpen, setImportPassphraseModalOpen] = useState(false)
  const [pendingImportZipFile, setPendingImportZipFile] = useState<File | null>(null)
  const [importDecryptPassphrase, setImportDecryptPassphrase] = useState('')
  const [importDecryptError, setImportDecryptError] = useState<string | null>(null)
  const [showImportDecryptPassphrase, setShowImportDecryptPassphrase] = useState(false)

  const [settingsTab, setSettingsTab] = useState<SettingsTabId>('pricing')

  // Block 2: Retirement Assumptions form (D-17)
  const retirementForm = useForm<RetirementValues>({
    resolver: zodResolver(retirementSchema),
    defaultValues: { currentAge: '', targetAge: '', npsReturnPct: '', epfRatePct: '' },
  })

  useEffect(() => {
    const ra = data.settings.retirement
    if (ra) {
      retirementForm.reset({
        currentAge: String(ra.currentAge),
        targetAge: String(ra.targetAge),
        npsReturnPct: String(ra.npsReturnPct),
        epfRatePct: String(ra.epfRatePct),
      })
    } else {
      retirementForm.reset({
        currentAge: '',
        targetAge: '',
        npsReturnPct: '',
        epfRatePct: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when persisted retirement block changes
  }, [data.settings.retirement])

  // Block 2: Save retirement assumptions
  const onRetirementSubmit = async (values: RetirementValues) => {
    setRetirementSaveError(null) // clear error on each attempt (D-20)
    setRetirementSaving(true)
    try {
      const now = nowIso()
      await saveData({
        ...data,
        settings: {
          ...data.settings,
          retirement: {
            currentAge: parseFinancialInput(values.currentAge),
            targetAge: parseFinancialInput(values.targetAge),
            npsReturnPct: parseFinancialInput(values.npsReturnPct),
            epfRatePct: parseFinancialInput(values.epfRatePct),
          },
          updatedAt: now,
        },
      })
    } catch {
      setRetirementSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setRetirementSaving(false)
    }
  }

  const runExportZip = async () => {
    setExportEncryptError(null)
    setExportBusy(true)
    try {
      const json = JSON.stringify(data, null, 2)
      const blob = await createWealthExportZip(json, exportPassphrase.trim() || null)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wealth-tracker-${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setExportModalOpen(false)
      setExportPassphrase('')
      setExportEncryptError(null)
    } catch {
      setExportEncryptError(
        'Encryption failed. Check that the app is running and try again.',
      )
    } finally {
      setExportBusy(false)
    }
  }

  const onImportFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportParseError(null)
    setImportValidationError(null)
    setImportValidationHint(null)
    setImportSaveError(null)
    setImportDataSuccess(false)
    setPendingImportZipFile(null)
    setImportDecryptPassphrase('')
    setImportDecryptError(null)
    setShowImportDecryptPassphrase(false)
    setImportPassphraseModalOpen(false)

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setImportParseError(
        'This file format is no longer supported. Please re-export from the app.',
      )
      return
    }
    if (
      file.type &&
      file.type !== 'application/zip' &&
      file.type !== 'application/x-zip-compressed'
    ) {
      setImportParseError(
        'This file format is no longer supported. Please re-export from the app.',
      )
      return
    }

    setImportBusy(true)
    try {
      let encrypted: boolean
      try {
        encrypted = await isDataJsonEntryEncrypted(file)
      } catch (err) {
        if (err instanceof WealthZipError && err.message === WEALTH_ZIP_NO_DATA_JSON) {
          setImportValidationError(
            'This zip archive does not contain the expected app data export.',
          )
          setImportValidationHint(null)
          return
        }
        setImportParseError(
          'This file format is no longer supported. Please re-export from the app.',
        )
        return
      }

      if (!encrypted) {
        let text: string
        try {
          text = await extractDataJsonFromZip(file)
        } catch {
          setImportParseError(
            'This file format is no longer supported. Please re-export from the app.',
          )
          return
        }
        let raw: unknown
        try {
          raw = JSON.parse(text) as unknown
        } catch {
          setImportValidationError('The file is not valid JSON.')
          return
        }
        const result = parseAppDataFromImport(raw)
        if (!result.success) {
          setImportValidationError(
            'This file is not valid app data or does not match this app’s expected format.',
          )
          setImportValidationHint(zodFirstHint(result.zodError))
          return
        }
        setPendingImport(result.data)
        setImportDialogOpen(true)
      } else {
        setPendingImportZipFile(file)
        setImportPassphraseModalOpen(true)
      }
    } finally {
      setImportBusy(false)
    }
  }

  const onDecryptZipImport = async () => {
    if (!pendingImportZipFile) return
    setImportDecryptError(null)
    setImportBusy(true)
    try {
      if (importDecryptPassphrase.trim() === '') {
        setImportDecryptError('Wrong passphrase — the file could not be decrypted.')
        return
      }
      let text: string
      try {
        text = await extractDataJsonFromZip(
          pendingImportZipFile,
          importDecryptPassphrase.trim(),
        )
      } catch (e) {
        if (isZipInvalidPassword(e)) {
          setImportDecryptError('Wrong passphrase — the file could not be decrypted.')
        } else {
          setImportDecryptError(
            'Decryption failed. Check that the app is running and try again.',
          )
        }
        return
      }
      let parsed: unknown
      try {
        parsed = JSON.parse(text) as unknown
      } catch {
        setImportValidationError('Decrypted content is not valid JSON.')
        return
      }
      const result = parseAppDataFromImport(parsed)
      if (!result.success) {
        setImportValidationError(
          'This file is not valid app data or does not match this app’s expected format.',
        )
        setImportValidationHint(zodFirstHint(result.zodError))
        return
      }
      setPendingImport(result.data)
      setImportPassphraseModalOpen(false)
      setPendingImportZipFile(null)
      setImportDecryptPassphrase('')
      setImportDecryptError(null)
      setImportDialogOpen(true)
    } finally {
      setImportBusy(false)
    }
  }

  const onConfirmImport = async () => {
    if (!pendingImport) return
    setImportSaveError(null)
    setImportBusy(true)
    try {
      await saveData(pendingImport)
      setImportDialogOpen(false)
      setPendingImport(null)
      setImportDataSuccess(true)
    } catch {
      setImportSaveError(
        'Could not save imported data. Check that the app is running and try again.',
      )
    } finally {
      setImportBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <SettingsTabStrip tab={settingsTab} onTabChange={setSettingsTab} />

      {settingsTab === 'pricing' && (
        <div className="space-y-6">
          <SettingsGoldPricingCard />
          <SettingsSilverPricingCard />
        </div>
      )}

      {settingsTab === 'retirement' && (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Retirement assumptions
            </p>
            <p className="mt-1 max-w-[640px] text-sm leading-relaxed text-muted-foreground">
              Used to project NPS and EPF balances. All values stay in your browser.
            </p>
          </div>
          <form onSubmit={retirementForm.handleSubmit(onRetirementSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="text"
                inputMode="numeric"
                placeholder="35"
                {...retirementForm.register('currentAge')}
                aria-invalid={!!retirementForm.formState.errors.currentAge}
                className={retirementForm.formState.errors.currentAge ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.currentAge && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.currentAge.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="targetAge">Target Retirement Age</Label>
              <Input
                id="targetAge"
                type="text"
                inputMode="numeric"
                placeholder="60"
                {...retirementForm.register('targetAge')}
                aria-invalid={!!retirementForm.formState.errors.targetAge}
                className={retirementForm.formState.errors.targetAge ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.targetAge && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.targetAge.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="npsReturnPct">NPS Annual Return (%)</Label>
              <Input
                id="npsReturnPct"
                type="text"
                inputMode="decimal"
                placeholder="10"
                {...retirementForm.register('npsReturnPct')}
                aria-invalid={!!retirementForm.formState.errors.npsReturnPct}
                className={retirementForm.formState.errors.npsReturnPct ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.npsReturnPct && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.npsReturnPct.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="epfRatePct">EPF Annual Rate (%)</Label>
              <Input
                id="epfRatePct"
                type="text"
                inputMode="decimal"
                placeholder="8.15"
                {...retirementForm.register('epfRatePct')}
                aria-invalid={!!retirementForm.formState.errors.epfRatePct}
                className={retirementForm.formState.errors.epfRatePct ? 'border-destructive' : ''}
              />
              {retirementForm.formState.errors.epfRatePct && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {retirementForm.formState.errors.epfRatePct.message}
                </p>
              )}
            </div>
            {retirementSaveError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {retirementSaveError}
              </p>
            )}
            <Button type="submit" disabled={retirementSaving}>
              {retirementSaving ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      {settingsTab === 'rates' && (
      <div className="space-y-6">
        <SettingsLiveRatesCard />
      </div>
      )}

      {settingsTab === 'data' && (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Export & import
            </p>
            <p className="mt-1 max-w-[640px] text-sm leading-relaxed text-muted-foreground">
              Your wealth data lives only in this browser. Export to a zip (optionally encrypted with a
              passphrase) and import to restore on another device or after clearing storage.
            </p>
          </div>
        <input
          ref={importFileInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          tabIndex={-1}
          onChange={onImportFileChange}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={importBusy || exportBusy}
            aria-label="Export data"
            onClick={() => {
              setExportEncryptError(null)
              setExportModalOpen(true)
            }}
          >
            Export Data
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={importBusy || exportBusy}
            aria-label="Import wealth data from a zip file"
            onClick={() => importFileInputRef.current?.click()}
          >
            {importBusy && !importDialogOpen && !importPassphraseModalOpen ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" aria-hidden />
            ) : null}
            Import from Zip
          </Button>
        </div>
        {(importParseError || importValidationError) && (
          <div className="mt-2 space-y-1">
            <p role="alert" className="text-sm text-destructive">
              {importParseError ?? importValidationError}
            </p>
            {importValidationHint && !importParseError && (
              <p className="text-sm text-muted-foreground">{importValidationHint}</p>
            )}
          </div>
        )}
        {importDataSuccess && !importParseError && !importValidationError && (
          <p className="text-sm text-muted-foreground mt-2" role="status">
            Wealth data was imported from file.
          </p>
        )}
        </CardContent>
      </Card>
      )}

        <AlertDialog
          open={exportModalOpen}
          onOpenChange={open => {
            setExportModalOpen(open)
            if (!open) {
              setExportPassphrase('')
              setExportEncryptError(null)
              setShowExportPassphrase(false)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Export data</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-left text-sm text-muted-foreground">
                  Your data will be downloaded as a zip file. Enter a passphrase to encrypt the zip, or
                  leave it blank to export without encryption.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="export-modal-passphrase" className="font-normal">
                  Passphrase
                </Label>
                <div className="relative">
                  <Input
                    id="export-modal-passphrase"
                    type={showExportPassphrase ? 'text' : 'password'}
                    value={exportPassphrase}
                    onChange={e => {
                      setExportPassphrase(e.target.value)
                      setExportEncryptError(null)
                    }}
                    className="pr-10"
                    autoComplete="off"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 shrink-0"
                    onClick={() => setShowExportPassphrase(v => !v)}
                    aria-label={showExportPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                  >
                    {showExportPassphrase ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave blank to export without a passphrase
                </p>
                {exportEncryptError && (
                  <p role="alert" className="text-sm text-destructive">
                    {exportEncryptError}
                  </p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={exportBusy}>Cancel</AlertDialogCancel>
              <Button type="button" disabled={exportBusy} onClick={() => void runExportZip()}>
                {exportBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" aria-hidden />
                    Exporting…
                  </>
                ) : (
                  'Export'
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={importPassphraseModalOpen}
          onOpenChange={open => {
            setImportPassphraseModalOpen(open)
            if (!open) {
              setPendingImportZipFile(null)
              setImportDecryptPassphrase('')
              setImportDecryptError(null)
              setShowImportDecryptPassphrase(false)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>This file is password protected</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-left text-sm text-muted-foreground">
                  Enter the passphrase you used when exporting this file.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="import-modal-passphrase" className="font-normal">
                  Passphrase
                </Label>
                <div className="relative">
                  <Input
                    id="import-modal-passphrase"
                    type={showImportDecryptPassphrase ? 'text' : 'password'}
                    value={importDecryptPassphrase}
                    onChange={e => {
                      setImportDecryptPassphrase(e.target.value)
                      setImportDecryptError(null)
                    }}
                    className="pr-10"
                    autoComplete="off"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 shrink-0"
                    onClick={() => setShowImportDecryptPassphrase(v => !v)}
                    aria-label={
                      showImportDecryptPassphrase ? 'Hide passphrase' : 'Show passphrase'
                    }
                  >
                    {showImportDecryptPassphrase ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </div>
                {importDecryptError && (
                  <p role="alert" className="text-sm text-destructive">
                    {importDecryptError}
                  </p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={importBusy}>Cancel</AlertDialogCancel>
              <Button type="button" disabled={importBusy} onClick={() => void onDecryptZipImport()}>
                {importBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" aria-hidden />
                    Decrypting…
                  </>
                ) : (
                  'Decrypt'
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={importDialogOpen}
          onOpenChange={open => {
            setImportDialogOpen(open)
            if (!open) {
              setPendingImport(null)
              setImportSaveError(null)
              setPendingImportZipFile(null)
              setImportPassphraseModalOpen(false)
              setImportDecryptPassphrase('')
              setImportDecryptError(null)
              setShowImportDecryptPassphrase(false)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Replace with imported data?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-left text-sm text-muted-foreground">
                  <span className="block text-foreground">
                    This will replace the wealth data in memory and in your local data file with the
                    contents of the file you selected. This is not a merge.
                  </span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            {importSaveError && (
              <p role="alert" className="text-sm text-destructive">
                {importSaveError}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={importBusy}>Cancel</AlertDialogCancel>
              <button
                type="button"
                disabled={importBusy}
                className={cn(buttonVariants())}
                onClick={() => {
                  void onConfirmImport()
                }}
              >
                {importBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                    Importing…
                  </>
                ) : (
                  'Import and replace'
                )}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      {settingsTab === 'danger' && (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="space-y-4 pt-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
              Start fresh
            </p>
            <p className="mt-1 max-w-[640px] text-sm leading-relaxed text-muted-foreground">
              Clears every asset, liability and snapshot stored in this browser so you can begin
              recording your wealth from scratch. Your data lives only on this device — once cleared, it
              can&apos;t be recovered from any server.
            </p>
          </div>
          {clearDataError && (
            <p role="alert" className="text-sm text-destructive">
              {clearDataError}
            </p>
          )}
          {clearDataSuccess && !clearDataError && (
            <p className="text-sm text-muted-foreground" role="status">
              All data has been cleared.
            </p>
          )}

          <div className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-border bg-muted/30 p-3.5">
            <span className="text-lg leading-none" aria-hidden>
              💾
            </span>
            <div>
              <p className="text-sm font-semibold">Want a backup first?</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Use <strong className="text-foreground">Backup & restore → Export data</strong> to
                download a zip. You can re-import it any time to restore everything as it was.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-xs font-medium leading-relaxed text-destructive">
            <strong>Heads up:</strong> this can&apos;t be undone from inside the app. You&apos;ll
            confirm before anything is deleted.
          </div>

          <AlertDialog
            open={clearDialogOpen}
            onOpenChange={open => {
              setClearDialogOpen(open)
              if (open) {
                setClearDataError(null)
                setClearDataSuccess(false)
              }
            }}
          >
            <div className="flex flex-wrap gap-2">
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" aria-label="Open clear all data confirmation">
                Clear data &amp; start fresh
              </Button>
            </AlertDialogTrigger>
            <Button type="button" variant="outline" onClick={() => setSettingsTab('data')}>
              Export backup first
            </Button>
            </div>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="text-left text-sm text-muted-foreground">
                    <span className="block text-foreground">
                      This is irreversible. All saved net-worth and asset entries in your local data file will be
                      removed.
                    </span>
                    <span className="mt-2 block text-muted-foreground">
                      Use <strong className="text-foreground">Backup & restore → Export data</strong>{' '}
                      first if you need a backup copy.
                    </span>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={clearingData}>Cancel</AlertDialogCancel>
                <button
                  type="button"
                  disabled={clearingData}
                  className={cn(buttonVariants({ variant: 'destructive' }))}
                  onClick={async () => {
                    setClearDataError(null)
                    setClearingData(true)
                    try {
                      await saveData(createInitialData())
                      setClearDataSuccess(true)
                      setClearDialogOpen(false)
                    } catch {
                      setClearDataError('Could not clear data. Check that the app is running and try again.')
                    } finally {
                      setClearingData(false)
                    }
                  }}
                >
                  {clearingData ? 'Clearing…' : 'Yes, clear all data'}
                </button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
