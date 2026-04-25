import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppData } from '@/context/AppDataContext'
import { useLivePrices } from '@/context/LivePricesContext'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import type { BankAccount } from '@/types/data'

const bankFormSchema = z.object({
  label: z.string().min(1, 'This field is required.'),
  currency: z.enum(['INR', 'AED']),
  balance: z.string().min(1, 'This field is required.'),
})
type BankFormValues = z.infer<typeof bankFormSchema>

export function BankSavingsPage() {
  const { data, saveData } = useAppData()
  const { aedInr, forexLoading, forexError } = useLivePrices()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: { currency: 'INR' },
  })

  const currencyWatch = watch('currency')

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ label: '', currency: 'INR', balance: '' })
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

  const hasAed = accounts.some(a => a.currency === 'AED')
  const aedNeedsRate = hasAed && aedInr == null

  const sectionTotal = accounts.reduce((sum, a) => {
    if (a.currency === 'INR') {
      return roundCurrency(sum + roundCurrency(a.balance))
    }
    if (aedInr == null) {
      return sum
    }
    return roundCurrency(sum + roundCurrency(a.balance * aedInr))
  }, 0)

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Bank Savings</h1>
            <output aria-live="polite" className="text-2xl font-semibold block mt-1">
              {sectionTotal.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </output>
            {aedNeedsRate && (
              <p role="alert" className="text-sm text-destructive mt-2">
                AED accounts need a live or session AED→INR rate to include in the total.
                {forexError ? ` (${forexError})` : ''}
              </p>
            )}
            {forexLoading && hasAed && (
              <p className="text-sm text-muted-foreground mt-1">Loading conversion rates…</p>
            )}
          </div>
          <Button onClick={openAdd} aria-label="Add bank account">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {accounts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-foreground">No accounts added</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add an account to track your INR or AED savings.
                </p>
              </div>
            ) : (
              accounts.map((item, index) => {
                const inrEquiv =
                  item.currency === 'AED' && aedInr != null
                    ? roundCurrency(item.balance * aedInr)
                    : null
                return (
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
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground font-normal block">
                          {item.currency === 'INR'
                            ? item.balance.toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })
                            : item.balance.toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'AED',
                                maximumFractionDigits: 0,
                              })}
                        </span>
                        {inrEquiv != null && (
                          <span className="text-xs text-muted-foreground block">
                            ≈{' '}
                            {inrEquiv.toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        )}
                      </div>
                    </button>
                    {index < accounts.length - 1 && <Separator />}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Bank Account' : 'Add Bank Account'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
              <legend className="text-sm font-medium">Currency</legend>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="INR" {...register('currency')} />
                  INR
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="AED" {...register('currency')} />
                  AED
                </label>
              </div>
              {errors.currency && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </fieldset>

            <div>
              <Label htmlFor="balance">
                {currencyWatch === 'AED' ? 'Balance (AED)' : 'Balance (₹)'}
              </Label>
              <Input
                id="balance"
                type="text"
                inputMode="decimal"
                placeholder={currencyWatch === 'AED' ? 'e.g. 25,000' : 'e.g. 2,50,000'}
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

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              {saveError && (
                <p role="alert" className="text-sm text-destructive mt-2">
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
