import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import type { ZodError } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
import { useLivePrices } from '@/context/LivePricesContext'
import { parseFinancialInput, nowIso } from '@/lib/financials'
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

// ── Form schemas (string inputs — parse to number on submit) ─────────────────
// NEVER use z.number() for form fields bound to text inputs (see RESEARCH.md Pitfall 1)

const goldPricesSchema = z.object({
  k24: z.string().min(1, 'This field is required.'),
  k22: z.string().min(1, 'This field is required.'),
  k18: z.string().min(1, 'This field is required.'),
})
type GoldPricesValues = z.infer<typeof goldPricesSchema>

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
  const {
    btcUsd,
    usdInr,
    aedInr,
    btcLoading,
    forexLoading,
    btcError,
    forexError,
    setSessionRates,
    clearSessionRates,
  } = useLivePrices()

  const [sessionUsdInr, setSessionUsdInr] = useState('')
  const [sessionAedInr, setSessionAedInr] = useState('')
  const [sessionBtcUsd, setSessionBtcUsd] = useState('')

  const applySessionRates = () => {
    const partial: {
      usdInr?: number
      aedInr?: number
      btcUsd?: number
    } = {}
    if (sessionUsdInr.trim()) partial.usdInr = parseFinancialInput(sessionUsdInr)
    if (sessionAedInr.trim()) partial.aedInr = parseFinancialInput(sessionAedInr)
    if (sessionBtcUsd.trim()) partial.btcUsd = parseFinancialInput(sessionBtcUsd)
    setSessionRates(partial)
  }

  // Per-block save state (D-19 — separate Save buttons, not one global Save)
  const [goldSaving, setGoldSaving] = useState(false)
  const [goldSaveError, setGoldSaveError] = useState<string | null>(null)
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

  // Block 1: Gold Prices form (D-16)
  const goldForm = useForm<GoldPricesValues>({
    resolver: zodResolver(goldPricesSchema),
    defaultValues: { k24: '', k22: '', k18: '' },
  })

  // Block 2: Retirement Assumptions form (D-17)
  const retirementForm = useForm<RetirementValues>({
    resolver: zodResolver(retirementSchema),
    defaultValues: { currentAge: '', targetAge: '', npsReturnPct: '', epfRatePct: '' },
  })

  // Hydrate from server when settings slices load or update (separate deps avoid wiping the other block on save)
  useEffect(() => {
    const gp = data.settings.goldPrices
    if (gp) {
      goldForm.reset({
        k24: String(gp.k24),
        k22: String(gp.k22),
        k18: String(gp.k18),
      })
    } else {
      goldForm.reset({ k24: '', k22: '', k18: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when persisted gold prices change
  }, [data.settings.goldPrices])

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

  // Block 1: Save gold prices
  const onGoldSubmit = async (values: GoldPricesValues) => {
    setGoldSaveError(null) // clear error on each attempt (D-20)
    setGoldSaving(true)
    try {
      const now = nowIso()
      await saveData({
        ...data,
        settings: {
          ...data.settings,
          goldPrices: {
            k24: parseFinancialInput(values.k24),
            k22: parseFinancialInput(values.k22),
            k18: parseFinancialInput(values.k18),
          },
          updatedAt: now,
        },
      })
    } catch {
      setGoldSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setGoldSaving(false)
    }
  }

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
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Settings</h1>

      {/* Block 1: Gold Prices (D-16) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold mb-4">Gold Prices</p>
          <form onSubmit={goldForm.handleSubmit(onGoldSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="k24">24K price per gram (₹)</Label>
              <Input
                id="k24"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 7,200"
                {...goldForm.register('k24')}
                aria-invalid={!!goldForm.formState.errors.k24}
                className={goldForm.formState.errors.k24 ? 'border-destructive' : ''}
              />
              {goldForm.formState.errors.k24 && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {goldForm.formState.errors.k24.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="k22">22K price per gram (₹)</Label>
              <Input
                id="k22"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 6,600"
                {...goldForm.register('k22')}
                aria-invalid={!!goldForm.formState.errors.k22}
                className={goldForm.formState.errors.k22 ? 'border-destructive' : ''}
              />
              {goldForm.formState.errors.k22 && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {goldForm.formState.errors.k22.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="k18">18K price per gram (₹)</Label>
              <Input
                id="k18"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 5,000"
                {...goldForm.register('k18')}
                aria-invalid={!!goldForm.formState.errors.k18}
                className={goldForm.formState.errors.k18 ? 'border-destructive' : ''}
              />
              {goldForm.formState.errors.k18 && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {goldForm.formState.errors.k18.message}
                </p>
              )}
            </div>
            {goldSaveError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {goldSaveError}
              </p>
            )}
            <Button type="submit" disabled={goldSaving}>
              {goldSaving ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Block 2: Retirement Assumptions (D-17) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold mb-4">Retirement Assumptions</p>
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

      <Separator />

      {/* Live market rates + session-only overrides (Phase 03) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold mb-2">Live market rates</p>
          <p className="text-sm text-muted-foreground mb-4">
            Read-only quotes used for Bitcoin and AED conversions. Refreshed automatically.
          </p>
          <dl className="space-y-2 text-sm" aria-live="polite">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">USD → INR (₹ per $1)</dt>
              <dd className="font-medium tabular-nums flex items-center gap-2">
                {forexLoading && !usdInr ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span className="text-muted-foreground">Loading…</span>
                  </>
                ) : usdInr != null ? (
                  usdInr.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">AED → INR (₹ per 1 AED)</dt>
              <dd className="font-medium tabular-nums flex items-center gap-2">
                {forexLoading && !aedInr ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span className="text-muted-foreground">Loading…</span>
                  </>
                ) : aedInr != null ? (
                  aedInr.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">BTC / USD</dt>
              <dd className="font-medium tabular-nums flex items-center gap-2">
                {btcLoading && !btcUsd ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span className="text-muted-foreground">Loading…</span>
                  </>
                ) : btcUsd != null ? (
                  btcUsd.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
          </dl>
          {(btcError || forexError) && (
            <p role="alert" className="text-sm text-destructive">
              Could not load market rates. You can enter session-only rates below.
              {btcError ? ` BTC: ${btcError}` : ''}
              {forexError ? ` Forex: ${forexError}` : ''}
            </p>
          )}

          <Separator className="my-4" />

          <p className="text-sm font-semibold">Session only — when feeds fail</p>
          <p id="session-rates-explainer" className="text-sm text-muted-foreground">
            These values stay in memory only. They are not saved to your data file or export, and
            they clear when you reload the page. When live feeds succeed again, session overrides
            for that channel are dropped automatically.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="session-usd-inr">USD → INR (manual)</Label>
              <Input
                id="session-usd-inr"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 83.12"
                value={sessionUsdInr}
                onChange={e => setSessionUsdInr(e.target.value)}
                aria-describedby="session-rates-explainer"
              />
            </div>
            <div>
              <Label htmlFor="session-aed-inr">AED → INR (manual)</Label>
              <Input
                id="session-aed-inr"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 22.65"
                value={sessionAedInr}
                onChange={e => setSessionAedInr(e.target.value)}
                aria-describedby="session-rates-explainer"
              />
            </div>
            <div>
              <Label htmlFor="session-btc-usd">BTC / USD (manual)</Label>
              <Input
                id="session-btc-usd"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 98,000"
                value={sessionBtcUsd}
                onChange={e => setSessionBtcUsd(e.target.value)}
                aria-describedby="session-rates-explainer"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={applySessionRates}>
                Apply session rates
              </Button>
              <Button type="button" variant="outline" onClick={clearSessionRates}>
                Clear session rates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Block 3: Data (export + import) */}
      <div>
        <p className="text-sm font-semibold mb-4">Data</p>
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
      </div>

      <Separator />

      {/* Block 4: Danger zone — clear all saved wealth data (DATA-01–03) */}
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold">Danger zone</p>
          <p className="text-sm text-muted-foreground">
            This permanently removes all net-worth and asset data stored in this browser (local storage).
            This is not a normal save and cannot be undone in the app.
          </p>
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
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" aria-label="Open clear all data confirmation">
                Clear all data
              </Button>
            </AlertDialogTrigger>
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
                      Use <strong className="text-foreground">Export Data</strong> in the Data section above
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
    </div>
  )
}
