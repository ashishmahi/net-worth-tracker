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
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import type { BankAccount } from '@/types/data'

// ── Form schema ───────────────────────────────────────────────────────────────

const bankFormSchema = z.object({
  label: z.string().min(1, 'This field is required.'),
  balanceInr: z.string().min(1, 'This field is required.'),
})
type BankFormValues = z.infer<typeof bankFormSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function BankSavingsPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
  })

  // ── Sheet open handlers ───────────────────────────────────────────────────

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({ label: '', balanceInr: '' })
    setSheetOpen(true)
  }

  function openEdit(item: BankAccount) {
    setEditingId(item.id)
    setSaveError(null)
    reset({ label: item.label, balanceInr: String(item.balanceInr) })
    setSheetOpen(true)
  }

  // ── Save handler ──────────────────────────────────────────────────────────

  const onSubmit = async (values: BankFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const balanceInr = parseFinancialInput(values.balanceInr)
      const accounts = data.assets.bankSavings.accounts
      const updatedAccounts = editingId
        ? accounts.map(a =>
            a.id === editingId
              ? { ...a, label: values.label, balanceInr, updatedAt: now }
              : a
          )
        : [
            ...accounts,
            {
              id: createId(),
              createdAt: now,
              updatedAt: now,
              label: values.label,
              balanceInr,
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

  // ── Delete handler ────────────────────────────────────────────────────────

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

  // ── Section total (D-11: sum of balanceInr) ───────────────────────────────

  const sectionTotal = data.assets.bankSavings.accounts.reduce(
    (sum, a) => roundCurrency(sum + a.balanceInr),
    0
  )

  const accounts = data.assets.bankSavings.accounts

  // ── Render ────────────────────────────────────────────────────────────────

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
                  Add an account to track your INR savings.
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
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {item.balanceInr.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </button>
                  {index < accounts.length - 1 && <Separator />}
                </div>
              ))
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

            <div>
              <Label htmlFor="balanceInr">Balance (₹)</Label>
              <Input
                id="balanceInr"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 2,50,000"
                {...register('balanceInr')}
                aria-invalid={!!errors.balanceInr}
                className={errors.balanceInr ? 'border-destructive' : ''}
              />
              {errors.balanceInr && (
                <p role="alert" className="text-sm text-destructive mt-1">
                  {errors.balanceInr.message}
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
