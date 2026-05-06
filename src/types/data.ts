import { z } from 'zod'
import {
  getPropertyValidationIssues,
  PROPERTY_VALIDATION_CODES,
} from '@/lib/propertyValidation'

// ── Shared base ──────────────────────────────────────────────────────────────

export const BaseItemSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// ── Section schemas ───────────────────────────────────────────────────────────

// D-03: karat + grams only; per-gram pricing lives in Settings (D-04)
const GoldItemSchema = BaseItemSchema.extend({
  karat: z.union([z.literal(24), z.literal(22), z.literal(18)]),
  grams: z.number().nonnegative(),
})

const GoldSchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(GoldItemSchema),
})

const StandardCommodityItemSchema = BaseItemSchema.extend({
  type: z.literal('standard'),
  kind: z.literal('silver'),
  grams: z.number().nonnegative(),
})

const ManualCommodityItemSchema = BaseItemSchema.extend({
  type: z.literal('manual'),
  label: z.string().min(1),
  valueInr: z.number().nonnegative(),
})

export const OtherCommodityItemSchema = z.discriminatedUnion('type', [
  StandardCommodityItemSchema,
  ManualCommodityItemSchema,
])

const OtherCommoditiesSchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(OtherCommodityItemSchema),
})

// D-21: MF platforms with name, currentValue, monthlySip
const MfPlatformSchema = BaseItemSchema.extend({
  name: z.string(),
  currentValue: z.number().nonnegative(),
  monthlySip: z.number().nonnegative(),
})

const MutualFundsSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(MfPlatformSchema),
})

// D-22: Stocks platforms with name and currentValue
const StockPlatformSchema = BaseItemSchema.extend({
  name: z.string(),
  currentValue: z.number().nonnegative(),
})

const StocksSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(StockPlatformSchema),
})

const BitcoinSchema = z.object({
  updatedAt: z.string().datetime(),
  quantity: z.number().nonnegative(),
})

export const PropertyMilestoneRowSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  amountInr: z.number().nonnegative(),
  isPaid: z.boolean(),
})

const PropertyItemBaseSchema = BaseItemSchema.extend({
  label: z.string().min(1),
  agreementInr: z.number().nonnegative(),
  milestones: z.array(PropertyMilestoneRowSchema),
  hasLiability: z.boolean(),
  outstandingLoanInr: z.number().nonnegative().optional(),
  lender: z.string().optional(),
  emiInr: z.number().nonnegative().optional(),
})

export const PropertyItemSchema = PropertyItemBaseSchema.superRefine((val, ctx) => {
  for (const issue of getPropertyValidationIssues(val)) {
    const path =
      issue.code === PROPERTY_VALIDATION_CODES.MILESTONE_TOTAL_EXCEEDS_AGREEMENT
        ? (['milestones'] as const)
        : issue.code === PROPERTY_VALIDATION_CODES.EMI_NOT_LESS_THAN_OUTSTANDING
          ? (['emiInr'] as const)
          : (['outstandingLoanInr'] as const)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: issue.message,
      path: [...path],
    })
  }
})

export const PropertySchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(PropertyItemSchema),
})

export const LiabilityItemSchema = BaseItemSchema.extend({
  label: z.string().min(1),
  outstandingInr: z.number().nonnegative(),
  loanType: z.enum(['home', 'car', 'personal', 'other']),
  lender: z.string().optional(),
  emiInr: z.number().nonnegative().optional(),
})

// D-23: Bank accounts — native balance in INR or AED (Phase 3). Legacy `balanceInr` is migrated on load.
const BankAccountSchema = BaseItemSchema.extend({
  label: z.string(),
  currency: z.enum(['INR', 'AED']),
  balance: z.number().nonnegative(),
})

const BankSavingsSchema = z.object({
  updatedAt: z.string().datetime(),
  accounts: z.array(BankAccountSchema),
})

// D-25: RetirementSchema unchanged — nps and epf are current balances (numbers)
const RetirementSchema = z.object({
  updatedAt: z.string().datetime(),
  nps: z.number().nonnegative(),
  epf: z.number().nonnegative(),
})

// D-24: SettingsSchema gains goldPrices and retirement blocks (both optional so existing
// data.json without these keys still passes safeParse)
const GoldPricesSchema = z.object({
  k24: z.number().nonnegative(),
  k22: z.number().nonnegative(),
  k18: z.number().nonnegative(),
})

const RetirementAssumptionsSchema = z.object({
  currentAge: z.number().int().min(1).max(100),
  targetAge: z.number().int().min(1).max(100),
  npsReturnPct: z.number().nonnegative(),
  epfRatePct: z.number().nonnegative(),
})

const SettingsSchema = z
  .object({
    updatedAt: z.string().datetime(),
    /** Optional nonnegative fraction applied on top of parity-derived ₹/g for gold (default applied on load). */
    goldImportUpliftRate: z.number().nonnegative().optional(),
    /** Optional nonnegative fraction for silver live ₹/g uplift (default applied on load). */
    silverImportUpliftRate: z.number().nonnegative().optional(),
    goldPrices: GoldPricesSchema.optional(),
    /** When true, do not overwrite goldPrices from live spot (user chose fixed prices). */
    goldPricesLocked: z.boolean().optional(),
    /** Saved silver ₹/g for standard commodity holdings (optional until user saves or auto-sync). */
    silverInrPerGram: z.number().nonnegative().optional(),
    /** When true, do not overwrite silverInrPerGram from live XAG spot. */
    silverPricesLocked: z.boolean().optional(),
    retirement: RetirementAssumptionsSchema.optional(),
  })
  .passthrough() // settings may gain further fields in later phases

// ── Net worth history (Phase 10: point-in-time snapshots; not the live computed total)
export const NetWorthPointSchema = z.object({
  recordedAt: z.string().datetime(),
  totalInr: z.number(),
})

// ── Root schema ───────────────────────────────────────────────────────────────

export const DataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  assets: z.object({
    gold: GoldSchema,
    otherCommodities: OtherCommoditiesSchema,
    mutualFunds: MutualFundsSchema,
    stocks: StocksSchema,
    bitcoin: BitcoinSchema,
    property: PropertySchema,
    bankSavings: BankSavingsSchema,
    retirement: RetirementSchema,
  }),
  liabilities: z.array(LiabilityItemSchema),
  netWorthHistory: z.array(NetWorthPointSchema),
})

// Single source of truth for TypeScript types — never define interfaces separately
export type AppData = z.infer<typeof DataSchema>
export type BaseItem = z.infer<typeof BaseItemSchema>
export type OtherCommodityItem = z.infer<typeof OtherCommodityItemSchema>
export type StandardCommodityItem = z.infer<typeof StandardCommodityItemSchema>
export type ManualCommodityItem = z.infer<typeof ManualCommodityItemSchema>
export type GoldItem = z.infer<typeof GoldItemSchema>
export type MfPlatform = z.infer<typeof MfPlatformSchema>
export type StockPlatform = z.infer<typeof StockPlatformSchema>
export type BankAccount = z.infer<typeof BankAccountSchema>
export type PropertyMilestoneRow = z.infer<typeof PropertyMilestoneRowSchema>
export type PropertyItem = z.infer<typeof PropertyItemSchema>
export type Property = z.infer<typeof PropertySchema>
export type NetWorthPoint = z.infer<typeof NetWorthPointSchema>
export type LiabilityItem = z.infer<typeof LiabilityItemSchema>
