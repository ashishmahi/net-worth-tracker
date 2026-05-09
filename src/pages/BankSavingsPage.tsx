import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import { toReportingCurrency } from '@/lib/currencyConversion'
import { DualCurrencyAmount } from '@/components/DualCurrencyAmount'
import { CurrencyFieldHint } from '@/components/CurrencyFieldHint'
import { cn } from '@/lib/utils'
import { CURRENCY_CODES, CurrencySchema } from '@/types/currency'
import type { BankAccount } from '@/types/data'

const bankFormSchema = z.object({
  label: z.string().min(1, 'This field is required.'),
  currency: CurrencySchema,
  balance: z.string().min(1, 'This field is required.'),
})
type BankFormValues = z.infer<typeof bankFormSchema>

export function BankSavingsPage() {
  const { data, saveData } = useAppData()
  const { usdInr, aedInr, eurInr, gbpInr, sgdInr, forexLoading, forexError } = useLivePrices()

  const reportingCurrency = data.settings.reportingCurrency ?? 'INR'
  const rateSnapshot = useMemo(
    () => ({ usdInr, aedInr, eurInr, gbpInr, sgdInr }),
    [usdInr, aedInr, eurInr, gbpInr, sgdInr],
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    // D-01: default new rows to reporting currency (stable at mount; openAdd resets explicitly).
    defaultValues: { label: '', currency: reportingCurrency, balance: '' },
  })

  const currencyWatch = watch('currency')

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ label: '', currency: reportingCurrency, balance: '' })
    setSheetOpen(true)
  }

  function openEdit(item: BankAccount) {
    setEditingId(item.id)
    setSaveError(null)
    reset({
      label: item.label,
      currency: item.currency,
      balance: String(item.balance),
    })
    setSheetOpen(true)
  }

  const onSubmit = async (values: BankFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const balance = roundCurrency(parseFinancialInput(values.balance))
      const accounts = data.assets.bankSavings.accounts
      const updatedAccounts = editingId
        ? accounts.map(a =>
            a.id === editingId
              ? {
                  ...a,
                  label: values.label,
                  currency: values.currency,
                  balance,
                  updatedAt: now,
                }
              : a
          )
        : [
            ...accounts,
            {
              id: createId(),
              createdAt: now,
              updatedAt: now,
              label: values.label,
              currency: values.currency,
              balance,
            },
          ]
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          bankSavings: {
            ...data.assets.bankSavings,
            accounts: updatedAccounts,
            updatedAt: now,
          },
        },
      })
      setSheetOpen(false)
    } catch {
      setSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const now = nowIso()
    const updatedAccounts = data.assets.bankSavings.accounts.filter(a => a.id !== id)
    try {
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          bankSavings: {
            ...data.assets.bankSavings,
            accounts: updatedAccounts,
            updatedAt: now,
          },
        },
      })
    } catch {
      setSaveError('Could not delete. Check that the app is running and try again.')
      return
    }
    setSheetOpen(false)
  }

  const accounts = data.assets.bankSavings.accounts

  const conversionBlocked = accounts.some(a => {
    const c = toReportingCurrency(a.balance, a.currency, reportingCurrency, rateSnapshot)
    return !c.ok
  })
  const needsFxRate = conversionBlocked

  const sectionTotal = accounts.reduce((sum, a) => {
    const c = toReportingCurrency(a.balance, a.currency, reportingCurrency, rateSnapshot)
    if (!c.ok) return sum
    return roundCurrency(sum + roundCurrency(c.amount))
  }, 0)

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Bank Savings"
          meta={
            <>
              <output aria-live="polite" className="text-2xl font-semibold block mt-1">
                {sectionTotal.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: reportingCurrency,
                  maximumFractionDigits: 0,
                })}
              </output>
              {needsFxRate && (
                <p role="alert" className="text-sm text-destructive mt-2">
                  Some balances need live FX rates to include in the total ({reportingCurrency}).
                  {forexError ? ` (${forexError})` : ''}
                </p>
              )}
              {forexLoading && accounts.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">Loading conversion rates…</p>
              )}
            </>
          }
          action={
            <Button
              className="w-full min-[768px]:w-auto"
              onClick={openAdd}
              aria-label="Add bank account"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          }
        />

        <Card>
          <CardContent className="p-0">
            {accounts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-foreground">No accounts added</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add an account to track savings in {CURRENCY_CODES.join(', ')}.
                </p>
              </div>
            ) : (
              accounts.map((item, index) => (
                  <div key={item.id}>
                    <button
                      className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                      aria-label={`Edit ${item.label} account`}
                      onClick={() => openEdit(item)}
                    >
                      <div>
                        <span className="text-sm font-semibold block">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.currency}</span>
                      </div>
                      <DualCurrencyAmount
                        amount={item.balance}
                        recordCurrency={item.currency}
                        reportingCurrency={reportingCurrency}
                        rates={rateSnapshot}
                      />
                    </button>
                    {index < accounts.length - 1 && <Separator />}
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className={cn(
            'flex w-full flex-col gap-0 overflow-hidden p-0',
            'max-h-[100dvh] min-h-0 sm:max-w-lg'
          )}
        >
          <div className="shrink-0 px-6 pt-6">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Edit Bank Account' : 'Add Bank Account'}</SheetTitle>
            </SheetHeader>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 min-h-0 flex-col"
          >
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-6">
              <div>
                <Label htmlFor="label">Account Label</Label>
                <Input
                  id="label"
                  type="text"
                  placeholder="e.g. HDFC Savings"
                  {...register('label')}
                  aria-invalid={!!errors.label}
                  className={errors.label ? 'border-destructive' : ''}
                />
                {errors.label && (
                  <p role="alert" className="text-sm text-destructive mt-1">
                    {errors.label.message}
                  </p>
                )}
              </div>
              <fieldset className="space-y-2">
                <legend className="flex items-center gap-1.5 text-sm font-medium">
                  Currency
                  <CurrencyFieldHint />
                </legend>
                <select
                  id="bank-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('currency')}
                  aria-invalid={!!errors.currency}
                >
                  {CURRENCY_CODES.map(code => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.currency.message}
                  </p>
                )}
              </fieldset>
              <div>
                <Label htmlFor="balance">Balance ({currencyWatch})</Label>
                <Input
                  id="balance"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 25,000"
                  {...register('balance')}
                  aria-invalid={!!errors.balance}
                  className={errors.balance ? 'border-destructive' : ''}
                />
                {errors.balance && (
                  <p role="alert" className="text-sm text-destructive mt-1">
                    {errors.balance.message}
                  </p>
                )}
              </div>
            </div>
            <SheetFooter className="shrink-0 flex-col gap-2 border-t px-6 pb-6 pt-2 sm:flex-col">
              {saveError && (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              )}
              {editingId && (
                <Button
                  type="button"
                  variant="destructive"
                  aria-label="Delete this account"
                  onClick={() => handleDelete(editingId)}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
