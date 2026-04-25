import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppData } from '@/context/AppDataContext'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import type { PropertyItem, PropertyMilestoneRow } from '@/types/data'

type MilestoneDraft = { id: string; label: string; amount: string; isPaid: boolean }

const inr0 = (n: number) =>
  n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

function sumPaidToBuilder(item: PropertyItem) {
  return item.milestones
    .filter(m => m.isPaid)
    .reduce((s, m) => roundCurrency(s + m.amountInr), 0)
}

function balanceDueToBuilder(item: PropertyItem) {
  return roundCurrency(item.agreementInr - sumPaidToBuilder(item))
}

function countPaidMilestones(item: PropertyItem) {
  return item.milestones.filter(m => m.isPaid).length
}

export function PropertyPage() {
  const { data, saveData } = useAppData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCreatedAt, setEditingCreatedAt] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState('')
  const [agreementStr, setAgreementStr] = useState('')
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([])
  const [hasLiability, setHasLiability] = useState(false)
  const [loanStr, setLoanStr] = useState('')

  const items = data.assets.property.items

  const agreementInrSheet = roundCurrency(parseFinancialInput(agreementStr))
  const paidSumSheet = roundCurrency(
    milestones.filter(m => m.isPaid).reduce((s, m) => s + parseFinancialInput(m.amount), 0)
  )
  const balanceSheet = roundCurrency(agreementInrSheet - paidSumSheet)
  const totalMilestonesSheet = roundCurrency(
    milestones.reduce((s, m) => s + parseFinancialInput(m.amount), 0)
  )
  const exceedAgreement = totalMilestonesSheet > agreementInrSheet

  function openAdd() {
    setEditingId(null)
    setEditingCreatedAt(null)
    setSaveError(null)
    setLabel('')
    setAgreementStr('')
    setMilestones([])
    setHasLiability(false)
    setLoanStr('')
    setSheetOpen(true)
  }

  function openEdit(item: PropertyItem) {
    setEditingId(item.id)
    setEditingCreatedAt(item.createdAt)
    setSaveError(null)
    setLabel(item.label)
    setAgreementStr(String(item.agreementInr))
    setMilestones(
      item.milestones.map(m => ({
        id: m.id,
        label: m.label,
        amount: String(m.amountInr),
        isPaid: m.isPaid,
      }))
    )
    setHasLiability(item.hasLiability)
    setLoanStr(item.outstandingLoanInr != null ? String(item.outstandingLoanInr) : '')
    setSheetOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!label.trim()) {
      setSaveError('Property name is required.')
      return
    }
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const agreementInr = roundCurrency(parseFinancialInput(agreementStr))
      const builtMilestones: PropertyMilestoneRow[] = milestones.map(m => ({
        id: m.id,
        label: m.label,
        amountInr: roundCurrency(parseFinancialInput(m.amount)),
        isPaid: m.isPaid,
      }))
      const nextItem: PropertyItem = {
        id: editingId ?? createId(),
        createdAt: editingId && editingCreatedAt ? editingCreatedAt : now,
        updatedAt: now,
        label: label.trim(),
        agreementInr,
        milestones: builtMilestones,
        hasLiability,
        ...(hasLiability
          ? { outstandingLoanInr: roundCurrency(parseFinancialInput(loanStr)) }
          : {}),
      }
      const list = data.assets.property.items
      const nextItems = editingId
        ? list.map(p => (p.id === editingId ? nextItem : p))
        : [...list, nextItem]
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          property: {
            ...data.assets.property,
            items: nextItems,
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
    const nextItems = data.assets.property.items.filter(p => p.id !== id)
    try {
      await saveData({
        ...data,
        assets: {
          ...data.assets,
          property: {
            ...data.assets.property,
            items: nextItems,
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

  function addMilestoneRow() {
    setMilestones(prev => [...prev, { id: createId(), label: '', amount: '', isPaid: false }])
  }

  function updateMilestone(id: string, patch: Partial<MilestoneDraft>) {
    setMilestones(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)))
  }

  function removeMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-semibold">Property</h1>
          <Button onClick={openAdd} aria-label="Add property">
            <Plus className="mr-2 h-4 w-4" />
            Add property
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="py-12 text-center px-4">
                <p className="text-sm font-semibold text-foreground">No properties yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a property to track your agreement, payment plan, and loan details.
                </p>
                <Button className="mt-4" onClick={openAdd} aria-label="Add property from empty state">
                  <Plus className="mr-2 h-4 w-4" />
                  Add property
                </Button>
              </div>
            ) : (
              items.map((item, index) => {
                const bal = balanceDueToBuilder(item)
                const paidC = countPaidMilestones(item)
                const totalC = item.milestones.length
                return (
                  <div key={item.id}>
                    <button
                      className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                      type="button"
                      aria-label={`Edit ${item.label}`}
                      onClick={() => openEdit(item)}
                    >
                      <div>
                        <span className="text-sm font-semibold block">{item.label}</span>
                        <span className="text-sm text-muted-foreground block">
                          {inr0(item.agreementInr)} agreement — {inr0(bal)} due to builder
                        </span>
                        {totalC > 0 && (
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {paidC} / {totalC} paid
                          </span>
                        )}
                      </div>
                    </button>
                    {index < items.length - 1 && <Separator />}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={open => {
          setSheetOpen(open)
          if (!open) setSaveError(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-lg" aria-describedby="property-form-desc">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit property' : 'Add property'}</SheetTitle>
            <p id="property-form-desc" className="text-sm text-muted-foreground">
              Enter agreement, milestones, and optional bank loan. Balance due to the builder is
              derived from the agreement and paid stages.
            </p>
          </SheetHeader>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="property-label">Property name</Label>
              <Input
                id="property-label"
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Project Sunshine"
                aria-invalid={!label.trim() && saveError != null}
                className={!label.trim() && saveError != null ? 'border-destructive' : ''}
              />
            </div>

            <div>
              <Label htmlFor="agreement">Agreement value (INR)</Label>
              <Input
                id="agreement"
                type="text"
                inputMode="decimal"
                value={agreementStr}
                onChange={e => setAgreementStr(e.target.value)}
                placeholder="e.g. 75,00,000"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Payment milestones</p>
              <p className="text-sm text-muted-foreground">
                Mark each stage as paid when you pay the builder. Balance due is calculated from
                the agreement and paid stages.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="w-[32%]">
                      Label
                    </TableHead>
                    <TableHead scope="col" className="w-[28%]">
                      Amount (INR)
                    </TableHead>
                    <TableHead scope="col" className="w-24 text-center">
                      Paid
                    </TableHead>
                    <TableHead scope="col" className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Input
                          type="text"
                          aria-label="Milestone label"
                          value={m.label}
                          onChange={e => updateMilestone(m.id, { label: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="decimal"
                          aria-label="Milestone amount in INR"
                          value={m.amount}
                          onChange={e => updateMilestone(m.id, { amount: e.target.value })}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          id={`paid-${m.id}`}
                          checked={m.isPaid}
                          onCheckedChange={c => updateMilestone(m.id, { isPaid: c === true })}
                          aria-label="Paid to builder"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeMilestone(m.id)}
                          aria-label="Remove milestone row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {milestones.length === 0 && (
                <p className="text-sm text-muted-foreground">No milestones yet. Add a row to track payments.</p>
              )}
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={addMilestoneRow}
                aria-label="Add milestone"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add milestone
              </Button>

              <div className="rounded-md border p-3 space-y-1" aria-live="polite">
                <p className="text-sm text-muted-foreground">Paid to builder (sum of paid stages)</p>
                <p className="text-base font-semibold tabular-nums">{inr0(paidSumSheet)}</p>
                <p className="text-sm text-muted-foreground mt-2">Balance due to builder</p>
                <p className="text-base font-semibold tabular-nums">{inr0(balanceSheet)}</p>
              </div>

              {exceedAgreement && (
                <p className="text-destructive text-sm" role="status">
                  Milestone total exceeds agreement. Check amounts.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label htmlFor="has-liability">Has home loan / liability</Label>
                  <p className="text-sm text-muted-foreground" id="liability-hint">
                    This is for bank loan balance, not payment to the builder.
                  </p>
                </div>
                <Switch
                  id="has-liability"
                  checked={hasLiability}
                  onCheckedChange={c => setHasLiability(c === true)}
                  aria-describedby="liability-hint"
                />
              </div>
              {hasLiability && (
                <div>
                  <Label htmlFor="outstanding-loan">Outstanding loan (INR)</Label>
                  <Input
                    id="outstanding-loan"
                    type="text"
                    inputMode="decimal"
                    value={loanStr}
                    onChange={e => setLoanStr(e.target.value)}
                    placeholder="e.g. 45,00,000"
                    aria-describedby="loan-helper"
                  />
                  <p className="text-sm text-muted-foreground mt-1" id="loan-helper">
                    How much you still owe the lender in INR, not the builder.
                  </p>
                </div>
              )}
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              {saveError && (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              )}
              {editingId && (
                <Button
                  type="button"
                  variant="destructive"
                  aria-label="Delete this property"
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
