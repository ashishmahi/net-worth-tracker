import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
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
import { PageHeader } from '@/components/PageHeader'
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
import { useLivePrices } from '@/context/LivePricesContext'
import { DualCurrencyAmount } from '@/components/DualCurrencyAmount'
import { CurrencyFieldHint } from '@/components/CurrencyFieldHint'
import { cn } from '@/lib/utils'
import { fmtCompactForReporting } from '@/lib/wealthFormat'
import { CURRENCY_CODES, type CurrencyCode } from '@/types/currency'
import {
  type PropertyEntryPath,
  PATH_LABELS,
  inferEntryPathFromPropertyItem,
  getDraftFieldsToReset,
} from '@/lib/propertyEntryPath'
import { createId, nowIso, parseFinancialInput, roundCurrency } from '@/lib/financials'
import {
  PROPERTY_VALIDATION_CODES,
  getPropertyValidationIssues,
} from '@/lib/propertyValidation'
import { propertyEquityForNetWorth } from '@/lib/dashboardCalcs'
import type { PropertyItem, PropertyMilestoneRow } from '@/types/data'
import { PropertyItemSchema } from '@/types/data'

type MilestoneDraft = { id: string; label: string; amount: string; isPaid: boolean }

const PATH_KEYS = Object.keys(PATH_LABELS) as PropertyEntryPath[]

function fmtRecordAmount(n: number, ccy: CurrencyCode) {
  return fmtCompactForReporting(roundCurrency(n), ccy)
}

function sumPaidToBuilder(item: PropertyItem) {
  return item.milestones
    .filter(m => m.isPaid)
    .reduce((s, m) => roundCurrency(s + m.amount), 0)
}

function balanceDueToBuilder(item: PropertyItem) {
  return roundCurrency(item.agreementAmount - sumPaidToBuilder(item))
}

function countPaidMilestones(item: PropertyItem) {
  return item.milestones.filter(m => m.isPaid).length
}

/** One-line summary under the property name on the list card (builder vs lender vs fully paid). */
function propertyListDetailLine(item: PropertyItem): string {
  const path = inferEntryPathFromPropertyItem(item)
  const ccy = item.currency ?? 'INR'
  const ag = fmtRecordAmount(item.agreementAmount, ccy)

  if (path === 'fullyPaid') {
    return `${ag} agreement · fully paid`
  }

  const builderBal = balanceDueToBuilder(item)

  if (path === 'mortgaged') {
    const parts: string[] = [`${ag} agreement`]
    if (item.hasLiability) {
      const loan = item.outstandingLoan ?? 0
      parts.push(loan > 0 ? `${fmtRecordAmount(loan, ccy)} owed to lender` : 'Home loan tracked')
    }
    if (item.milestones.length > 0) {
      parts.push(
        builderBal > 0
          ? `${fmtRecordAmount(builderBal, ccy)} left on builder payment plan`
          : 'Builder payment plan complete'
      )
    }
    return parts.join(' · ')
  }

  return `${ag} agreement · ${
    builderBal > 0
      ? `${fmtRecordAmount(builderBal, ccy)} left on builder payment plan`
      : 'nothing left on builder payment plan'
  }`
}

export function PropertyPage() {
  const { data, saveData } = useAppData()
  const { usdInr, aedInr, eurInr, gbpInr, sgdInr } = useLivePrices()
  const reportingCurrency = data.settings.reportingCurrency ?? 'INR'
  const rateSnapshot = useMemo(
    () => ({ usdInr, aedInr, eurInr, gbpInr, sgdInr }),
    [usdInr, aedInr, eurInr, gbpInr, sgdInr],
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCreatedAt, setEditingCreatedAt] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [entryPath, setEntryPath] = useState<PropertyEntryPath>('fullyPaid')
  const [label, setLabel] = useState('')
  const [agreementStr, setAgreementStr] = useState('')
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([])
  const [hasLiability, setHasLiability] = useState(false)
  const [loanStr, setLoanStr] = useState('')
  const [lenderStr, setLenderStr] = useState('')
  const [emiStr, setEmiStr] = useState('')
  const [propertyCurrency, setPropertyCurrency] = useState<CurrencyCode>('INR')

  const pathButtonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const items = data.assets.property.items

  useEffect(() => {
    if (!sheetOpen) return
    const id = requestAnimationFrame(() => {
      pathButtonRefs.current[0]?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [sheetOpen])

  const buildPropertyItemFromDraft = useCallback((): PropertyItem => {
    const now = nowIso()
    const agreementAmount = roundCurrency(parseFinancialInput(agreementStr))
    const builtMilestones: PropertyMilestoneRow[] = milestones.map(m => ({
      id: m.id,
      label: m.label,
      amount: roundCurrency(parseFinancialInput(m.amount)),
      isPaid: m.isPaid,
    }))

    let persistMilestones = builtMilestones
    let persistHasLiability = hasLiability
    if (entryPath === 'fullyPaid') {
      persistMilestones = []
      persistHasLiability = false
    } else if (entryPath === 'mortgaged') {
      persistHasLiability = true
    }

    return {
      id: editingId ?? createId(),
      createdAt: editingId && editingCreatedAt ? editingCreatedAt : now,
      updatedAt: now,
      label: label.trim(),
      agreementAmount,
      milestones: persistMilestones,
      hasLiability: persistHasLiability,
      ...(persistHasLiability
        ? {
            outstandingLoan: roundCurrency(parseFinancialInput(loanStr)),
            ...(lenderStr.trim() ? { lender: lenderStr.trim() } : {}),
            ...(emiStr.trim() ? { emi: roundCurrency(parseFinancialInput(emiStr)) } : {}),
          }
        : {}),
      currency: propertyCurrency,
    }
  }, [
    agreementStr,
    editingCreatedAt,
    editingId,
    emiStr,
    entryPath,
    hasLiability,
    lenderStr,
    loanStr,
    milestones,
    label,
    propertyCurrency,
  ])

  const { sheetIsValid, outstandingLoanIssue, emiIssue, milestoneIssue } = useMemo(() => {
    const draft = buildPropertyItemFromDraft()
    const validationIssues = getPropertyValidationIssues(draft)
    return {
      sheetIsValid: PropertyItemSchema.safeParse(draft).success,
      outstandingLoanIssue: validationIssues.find(
        i =>
          i.code === PROPERTY_VALIDATION_CODES.OUTSTANDING_REQUIRED ||
          i.code === PROPERTY_VALIDATION_CODES.OUTSTANDING_EXCEEDS_AGREEMENT
      ),
      emiIssue: validationIssues.find(
        i => i.code === PROPERTY_VALIDATION_CODES.EMI_NOT_LESS_THAN_OUTSTANDING
      ),
      milestoneIssue: validationIssues.find(
        i =>
          i.code === PROPERTY_VALIDATION_CODES.MILESTONE_TOTAL_EXCEEDS_AGREEMENT ||
          i.code === PROPERTY_VALIDATION_CODES.MILESTONE_AMOUNT_NONPOSITIVE
      ),
    }
  }, [buildPropertyItemFromDraft])

  const agreementAmountSheet = roundCurrency(parseFinancialInput(agreementStr))
  const paidSumSheet = roundCurrency(
    milestones.filter(m => m.isPaid).reduce((s, m) => s + parseFinancialInput(m.amount), 0)
  )
  const balanceSheet = roundCurrency(agreementAmountSheet - paidSumSheet)
  const totalMilestonesSheet = roundCurrency(
    milestones.reduce((s, m) => s + parseFinancialInput(m.amount), 0)
  )
  const exceedAgreement = totalMilestonesSheet > agreementAmountSheet

  /** D-07: loan block before milestones when both matter */
  const loanBeforeMilestones =
    entryPath === 'mortgaged' || (entryPath === 'milestones' && hasLiability)

  function handlePathRadiogroupKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement | null
    if (!target || target.getAttribute('role') !== 'radio') return

    const wide =
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 640px)').matches
    let delta = 0
    if (wide) {
      if (e.key === 'ArrowLeft') delta = -1
      else if (e.key === 'ArrowRight') delta = 1
      else return
    } else {
      if (e.key === 'ArrowUp') delta = -1
      else if (e.key === 'ArrowDown') delta = 1
      else return
    }

    e.preventDefault()
    const curIdx = PATH_KEYS.indexOf(entryPath)
    const len = PATH_KEYS.length
    const nextIdx = (curIdx + delta + len) % len
    const nextKey = PATH_KEYS[nextIdx]
    handleEntryPathChange(nextKey)
    requestAnimationFrame(() => {
      pathButtonRefs.current[nextIdx]?.focus()
    })
  }

  function handleEntryPathChange(next: PropertyEntryPath) {
    setEntryPath(prev => {
      if (prev === next) return prev
      const toReset = getDraftFieldsToReset(prev, next)
      if (toReset.has('milestones')) setMilestones([])
      if (toReset.has('liability')) {
        setHasLiability(false)
        setLoanStr('')
        setLenderStr('')
        setEmiStr('')
      }
      if (next === 'mortgaged') setHasLiability(true)
      return next
    })
  }

  function openAdd() {
    setEditingId(null)
    setEditingCreatedAt(null)
    setSaveError(null)
    setEntryPath('fullyPaid')
    setLabel('')
    setAgreementStr('')
    setMilestones([])
    setHasLiability(false)
    setLoanStr('')
    setLenderStr('')
    setEmiStr('')
    setPropertyCurrency(reportingCurrency)
    setSheetOpen(true)
  }

  function openEdit(item: PropertyItem) {
    setEditingId(item.id)
    setEditingCreatedAt(item.createdAt)
    setSaveError(null)
    setEntryPath(inferEntryPathFromPropertyItem(item))
    setLabel(item.label)
    setAgreementStr(String(item.agreementAmount))
    setMilestones(
      item.milestones.map(m => ({
        id: m.id,
        label: m.label,
        amount: String(m.amount),
        isPaid: m.isPaid,
      }))
    )
    setHasLiability(item.hasLiability)
    setLoanStr(item.outstandingLoan != null ? String(item.outstandingLoan) : '')
    setLenderStr(item.lender ?? '')
    setEmiStr(item.emi != null ? String(item.emi) : '')
    setPropertyCurrency(item.currency ?? reportingCurrency)
    setSheetOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!label.trim()) {
      setSaveError('Property name is required.')
      return
    }
    const candidate = buildPropertyItemFromDraft()
    if (!PropertyItemSchema.safeParse(candidate).success) {
      return
    }
    setSaveError(null)
    setSaving(true)
    try {
      const now = nowIso()
      const nextItem: PropertyItem = { ...candidate, updatedAt: now }
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

  const milestonesBlock =
    entryPath === 'fullyPaid' ? null : (
      <div className="space-y-2">
        <p className="text-sm font-semibold">Payment milestones</p>
        <p className="text-sm text-muted-foreground">
          Mark each stage as paid when you pay the builder. If this property has no mortgage, net
          worth counts only paid milestones (not the full agreement), so cash still in the bank for
          future instalments is not double-counted. With a mortgage, equity uses agreement minus
          loan; milestones below are optional for tracking.
        </p>
        {entryPath === 'mortgaged' && (
          <p className="text-xs text-muted-foreground">
            Optional builder payment schedule: many mortgaged homes still pay the developer in
            stages — add rows below if that applies. Bank loan fields are separate (below).
          </p>
        )}
        <div className="w-full min-w-0 overflow-x-auto">
          <Table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[42%]" />
              <col className="w-[38%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="px-2 align-middle">
                  Label
                </TableHead>
                <TableHead scope="col" className="px-2 align-middle">
                  Amount ({propertyCurrency})
                </TableHead>
                <TableHead scope="col" className="px-1 text-center align-middle">
                  Paid
                </TableHead>
                <TableHead
                  scope="col"
                  className="w-10 p-1 text-center align-middle"
                  aria-label="Remove row"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="px-2 py-2 align-middle">
                    <Input
                      type="text"
                      className="min-w-0 h-9"
                      aria-label="Milestone label"
                      value={m.label}
                      onChange={e => updateMilestone(m.id, { label: e.target.value })}
                    />
                  </TableCell>
                  <TableCell className="px-2 py-2 align-middle">
                    <Input
                      type="text"
                      inputMode="decimal"
                      className="min-w-0 h-9"
                      aria-label="Milestone amount in INR"
                      value={m.amount}
                      onChange={e => updateMilestone(m.id, { amount: e.target.value })}
                    />
                  </TableCell>
                  <TableCell className="px-1 py-2 align-middle">
                    <div className="flex justify-center">
                      <Checkbox
                        id={`paid-${m.id}`}
                        checked={m.isPaid}
                        onCheckedChange={c => updateMilestone(m.id, { isPaid: c === true })}
                        aria-label="Paid to builder"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-1 align-middle">
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => removeMilestone(m.id)}
                        aria-label="Remove milestone row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {milestones.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No milestones yet. Add a row to track payments.
          </p>
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
          <p className="text-base font-semibold tabular-nums">
            {fmtRecordAmount(paidSumSheet, propertyCurrency)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Remaining on the builder schedule (instalments still to pay the developer — separate from
            the bank loan above).
          </p>
          <p className="text-base font-semibold tabular-nums">
            {fmtRecordAmount(balanceSheet, propertyCurrency)}
          </p>
        </div>
        {(milestoneIssue || exceedAgreement) && (
          <p className="text-destructive text-sm" role="alert">
            {milestoneIssue?.message ??
              'Milestone total exceeds agreement. Check amounts.'}
          </p>
        )}
      </div>
    )

  const showLoanFields =
    entryPath === 'mortgaged' || hasLiability

  const liabilityBlock =
    entryPath === 'fullyPaid' ? null : (
      <div className="space-y-3">
        {entryPath === 'milestones' && (
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="has-liability">Has home loan / liability</Label>
              <p className="text-sm text-muted-foreground" id="liability-hint">
                Track the bank loan tied to this property. Your outstanding balance reduces equity in
                dashboard totals (separate from what you owe the builder).
              </p>
            </div>
            <Switch
              id="has-liability"
              checked={hasLiability}
              onCheckedChange={c => setHasLiability(c === true)}
              aria-describedby="liability-hint"
            />
          </div>
        )}
        {entryPath === 'mortgaged' && (
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Home loan</p>
            <p className="text-sm text-muted-foreground" id="mortgaged-loan-hint">
              This segment is for the bank loan on this property. Outstanding loan reduces equity in
              dashboard totals (separate from builder milestones above).
            </p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          For loans not tied to a specific property (personal, car, etc.), use the{' '}
          <span className="font-medium text-foreground">Liabilities page</span>.
        </p>
        {showLoanFields && (
          <div>
            <Label htmlFor="outstanding-loan">Outstanding loan ({propertyCurrency})</Label>
            <Input
              id="outstanding-loan"
              type="text"
              inputMode="decimal"
              value={loanStr}
              onChange={e => setLoanStr(e.target.value)}
              placeholder="e.g. 45,00,000"
              aria-describedby={
                entryPath === 'mortgaged' ? 'mortgaged-loan-hint loan-helper' : 'loan-helper'
              }
            />
            <p className="text-sm text-muted-foreground mt-1" id="loan-helper">
              Enter what you still owe the lender for this home — your dashboard subtracts this from
              property value for net worth (not builder dues above).
            </p>
            {outstandingLoanIssue && (
              <p className="text-destructive text-sm mt-2" role="status">
                {outstandingLoanIssue.message}
              </p>
            )}
            <div className="space-y-2 mt-4">
              <Label htmlFor="property-lender">Lender</Label>
              <Input
                id="property-lender"
                type="text"
                value={lenderStr}
                onChange={e => setLenderStr(e.target.value)}
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property-emi">EMI ({propertyCurrency}/month)</Label>
              <Input
                id="property-emi"
                type="text"
                inputMode="decimal"
                value={emiStr}
                onChange={e => setEmiStr(e.target.value)}
                placeholder="e.g. 25,000"
                aria-describedby="emi-helper"
              />
              <p className="text-sm text-muted-foreground mt-1" id="emi-helper">
                Your monthly payment to the lender for this loan (not payments to the builder).
              </p>
              {emiIssue && (
                <p className="text-destructive text-sm mt-2" role="status">
                  {emiIssue.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )

  const pathDependentBlocks =
    entryPath === 'fullyPaid' ? (
      <p className="text-sm text-muted-foreground">
        You chose the simplest path — no builder milestones or attached loan on this sheet. You can
        switch segments above if that changes.
      </p>
    ) : loanBeforeMilestones ? (
      <>
        {liabilityBlock}
        {milestonesBlock}
      </>
    ) : (
      <>
        {milestonesBlock}
        {liabilityBlock}
      </>
    )

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title="Property"
          action={
            <Button
              className="w-full min-[768px]:w-auto"
              onClick={openAdd}
              aria-label="Add property"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add property
            </Button>
          }
        />

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
                const paidC = countPaidMilestones(item)
                const totalC = item.milestones.length
                const path = inferEntryPathFromPropertyItem(item)
                return (
                  <div key={item.id}>
                    <button
                      className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left gap-3"
                      type="button"
                      aria-label={`Edit ${item.label}`}
                      onClick={() => openEdit(item)}
                    >
                      <div className="min-w-0 pr-2 flex-1">
                        <span className="text-sm font-semibold block">{item.label}</span>
                        <span className="text-sm text-muted-foreground block break-words">
                          {propertyListDetailLine(item)}
                        </span>
                        {totalC > 0 && path !== 'fullyPaid' && (
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            Builder milestones: {paidC} / {totalC} paid
                          </span>
                        )}
                      </div>
                      <DualCurrencyAmount
                        amount={propertyEquityForNetWorth(item)}
                        recordCurrency={item.currency ?? reportingCurrency}
                        reportingCurrency={reportingCurrency}
                        rates={rateSnapshot}
                      />
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
        <SheetContent
          aria-describedby="property-form-desc"
          className={cn(
            'flex w-full flex-col gap-0 overflow-hidden p-0',
            'max-h-[100dvh] min-h-0 sm:max-w-lg'
          )}
        >
          <div className="shrink-0 px-6 pt-6">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Edit property' : 'Add property'}</SheetTitle>
              <p id="property-form-desc" className="text-sm text-muted-foreground">
                Pick how you want to record this property — you can change it before saving. Fields
                below follow your selection.
              </p>
            </SheetHeader>
          </div>
          <form onSubmit={onSubmit} className="flex flex-1 min-h-0 flex-col">
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-6">
              <div className="space-y-2">
                <Label id="property-path-label" className="text-sm font-semibold">
                  How are you paying?
                </Label>
                <div
                  role="radiogroup"
                  aria-labelledby="property-path-label"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1"
                  onKeyDown={handlePathRadiogroupKeyDown}
                >
                  {PATH_KEYS.map((key, i) => {
                    const selected = entryPath === key
                    return (
                      <Button
                        key={key}
                        ref={el => {
                          pathButtonRefs.current[i] = el
                        }}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        variant="ghost"
                        className={cn(
                          'h-auto min-h-10 whitespace-normal rounded-md px-2 py-2 text-center text-xs font-medium leading-tight transition-colors sm:text-sm',
                          selected
                            ? 'border border-border bg-background font-semibold text-foreground shadow-sm hover:bg-background'
                            : 'border border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        )}
                        onClick={() => handleEntryPathChange(key)}
                      >
                        {PATH_LABELS[key]}
                      </Button>
                    )
                  })}
                </div>
              </div>
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
              <fieldset className="space-y-2">
                <legend className="flex items-center gap-1.5 text-sm font-medium">
                  Currency
                  <CurrencyFieldHint />
                </legend>
                <p className="text-xs text-muted-foreground">
                  Agreement, loan, milestones, and EMI use this currency.
                </p>
                <select
                  id="property-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={propertyCurrency}
                  onChange={e => setPropertyCurrency(e.target.value as CurrencyCode)}
                  aria-label="Record currency for all amounts"
                >
                  {CURRENCY_CODES.map(code => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </fieldset>
              <div>
                <Label htmlFor="agreement">Agreement value ({propertyCurrency})</Label>
                <Input
                  id="agreement"
                  type="text"
                  inputMode="decimal"
                  value={agreementStr}
                  onChange={e => setAgreementStr(e.target.value)}
                  placeholder="e.g. 75,00,000"
                  aria-describedby="agreement-helper"
                />
                <p className="text-sm text-muted-foreground mt-1" id="agreement-helper">
                  Your recorded agreement anchors builder dues and property equity in net worth like
                  everywhere else in the app.
                </p>
              </div>
              {pathDependentBlocks}
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
                  aria-label="Delete this property"
                  onClick={() => handleDelete(editingId)}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={saving || !sheetIsValid}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
