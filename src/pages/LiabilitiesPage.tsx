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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import { sumLiabilitiesInr, sumStandaloneLiabilitiesEmiInr } from '@/lib/liabilityCalcs'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import type { LiabilityItem } from '@/types/data'

const loanFormSchema = z.object({
  label: z.string().min(1, 'This field is required.'),
  loanType: z.enum(['home', 'car', 'personal', 'other']),
  outstandingInr: z.string().min(1, 'This field is required.'),
  lender: z.string().optional(),
  emiInr: z.string().optional(),
})

type LoanFormValues = z.infer<typeof loanFormSchema>

const LOAN_TYPE_LABEL: Record<LiabilityItem['loanType'], string> = {
  home: 'Home',
  car: 'Car',
  personal: 'Personal',
  other: 'Other',
}

function formatInr(n: number) {
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

export function LiabilitiesPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: { loanType: 'personal' },
  })

  function openAdd() {
    setEditingId(null)
    setSaveError(null)
    reset({
      label: '',
      loanType: 'personal',
      outstandingInr: '',
      lender: '',
      emiInr: '',
    })
    setSheetOpen(true)
  }

  function openEdit(item: LiabilityItem) {
    setEditingId(item.id)
    setSaveError(null)
    reset({
      label: item.label,
      loanType: item.loanType,
      outstandingInr: String(item.outstandingInr),
      lender: item.lender ?? '',
      emiInr: item.emiInr != null ? String(item.emiInr) : '',
    })
    setSheetOpen(true)
  }

  const onSubmit = async (values: LoanFormValues) => {
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const outstandingInr = roundCurrency(parseFinancialInput(values.outstandingInr))
      const emiParsed = values.emiInr?.trim()
        ? roundCurrency(parseFinancialInput(values.emiInr))
        : undefined
      const lender = values.lender?.trim() || undefined

      const list = data.liabilities
      if (editingId) {
        const updated = list.map(l =>
          l.id === editingId
            ? {
                ...l,
                label: values.label.trim(),
                loanType: values.loanType,
                outstandingInr,
                lender,
                emiInr: emiParsed,
                updatedAt: now,
              }
            : l
        )
        await saveData({ ...data, liabilities: updated })
      } else {
        await saveData({
          ...data,
          liabilities: [
            ...list,
            {
              id: createId(),
              createdAt: now,
              updatedAt: now,
              label: values.label.trim(),
              loanType: values.loanType,
              outstandingInr,
              lender,
              emiInr: emiParsed,
            },
          ],
        })
      }
      setSheetOpen(false)
    } catch {
      setSaveError('Could not save. Check that the app is running and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteFromSheet(id: string) {
    const filtered = data.liabilities.filter(l => l.id !== id)
    try {
      await saveData({ ...data, liabilities: filtered })
      setSheetOpen(false)
    } catch {
      setSaveError('Could not delete. Check that the app is running and try again.')
    }
  }

  async function confirmDeleteList(id: string) {
    setDeleteError(null)
    const filtered = data.liabilities.filter(l => l.id !== id)
    try {
      await saveData({ ...data, liabilities: filtered })
      setDeletingId(null)
    } catch {
      setDeleteError('Could not delete. Check that the app is running and try again.')
    }
  }

  const items = data.liabilities
  const totalOut = sumLiabilitiesInr(data)
  const totalEmi = sumStandaloneLiabilitiesEmiInr(data)

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Liabilities"
          meta={
            <div className="mt-1 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total outstanding</p>
                <output aria-live="polite" className="text-2xl font-semibold block">
                  {totalOut.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </output>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total EMI</p>
                <output aria-live="polite" className="text-2xl font-semibold block">
                  {`${totalEmi.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}/month`}
                </output>
              </div>
            </div>
          }
          action={
            <Button
              className="w-full min-[768px]:w-auto"
              onClick={openAdd}
              aria-label="Add loan"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add loan
            </Button>
          }
        />

        <p className="text-sm text-muted-foreground">
          For loans tied to a specific property (home loan, builder payment), use the Property section.
        </p>

        {deleteError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive flex justify-between gap-2 items-start"
          >
            <span>{deleteError}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 h-7"
              onClick={() => setDeleteError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-foreground">No loans yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a standalone loan to track debt outside your property entries.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{LOAN_TYPE_LABEL[item.loanType]}</Badge>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      {(item.lender || item.emiInr != null) && (
                        <p className="text-sm text-muted-foreground">
                          {[
                            item.lender,
                            item.emiInr != null && Number.isFinite(item.emiInr)
                              ? `${formatInr(item.emiInr)}/month`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <p className="text-lg font-semibold pt-1">
                        {formatInr(item.outstandingInr)}
                      </p>
                    </div>

                    {deletingId === item.id ? (
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-medium">Confirm delete?</span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => void confirmDeleteList(item.id)}
                          >
                            Yes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteError(null)
                            setDeletingId(item.id)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={open => {
          setSheetOpen(open)
          if (!open) setSaveError(null)
        }}
      >
        <SheetContent
          className={cn(
            'flex w-full flex-col gap-0 overflow-hidden p-0',
            'max-h-[100dvh] min-h-0 sm:max-w-lg'
          )}
        >
          <div className="shrink-0 px-6 pt-6">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Edit loan' : 'Add loan'}</SheetTitle>
            </SheetHeader>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 min-h-0 flex-col"
          >
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-6">
              <div>
                <Label htmlFor="loan-label">Label</Label>
                <Input
                  id="loan-label"
                  type="text"
                  placeholder="e.g. Car loan"
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
                <Label htmlFor="loan-type">Loan type</Label>
                <select
                  id="loan-type"
                  {...register('loanType')}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
                    'text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  )}
                >
                  <option value="home">Home</option>
                  <option value="car">Car</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
                {errors.loanType && (
                  <p role="alert" className="text-sm text-destructive mt-1">
                    {errors.loanType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="outstanding-inr">Outstanding balance (₹)</Label>
                <Input
                  id="outstanding-inr"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 5,00,000"
                  {...register('outstandingInr')}
                  aria-invalid={!!errors.outstandingInr}
                  className={errors.outstandingInr ? 'border-destructive' : ''}
                />
                {errors.outstandingInr && (
                  <p role="alert" className="text-sm text-destructive mt-1">
                    {errors.outstandingInr.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lender">Lender (optional)</Label>
                <Input
                  id="lender"
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  {...register('lender')}
                />
              </div>

              <div>
                <Label htmlFor="emi-inr">EMI (optional, ₹/month)</Label>
                <Input
                  id="emi-inr"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 32,000"
                  {...register('emiInr')}
                />
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
                  aria-label="Delete this loan"
                  onClick={() => void handleDeleteFromSheet(editingId)}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={saving}>
                {saving
                  ? 'Saving…'
                  : editingId
                    ? 'Save changes'
                    : 'Save loan'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
