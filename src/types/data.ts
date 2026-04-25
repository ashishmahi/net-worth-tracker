import { z } from 'zod'

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

const PropertySchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(z.unknown()), // Phase 4 fills this in
})

// D-23: Bank accounts with label and balanceInr (INR only in Phase 2, AED in Phase 3)
const BankAccountSchema = BaseItemSchema.extend({
  label: z.string(),
  balanceInr: z.number().nonnegative(),
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
    goldPrices: GoldPricesSchema.optional(),
    retirement: RetirementAssumptionsSchema.optional(),
  })
  .passthrough() // settings may gain further fields in later phases

// ── Root schema ───────────────────────────────────────────────────────────────

export const DataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  assets: z.object({
    gold: GoldSchema,
    mutualFunds: MutualFundsSchema,
    stocks: StocksSchema,
    bitcoin: BitcoinSchema,
    property: PropertySchema,
    bankSavings: BankSavingsSchema,
    retirement: RetirementSchema,
  }),
})

// Single source of truth for TypeScript types — never define interfaces separately
export type AppData = z.infer<typeof DataSchema>
export type BaseItem = z.infer<typeof BaseItemSchema>
export type GoldItem = z.infer<typeof GoldItemSchema>
export type MfPlatform = z.infer<typeof MfPlatformSchema>
export type StockPlatform = z.infer<typeof StockPlatformSchema>
export type BankAccount = z.infer<typeof BankAccountSchema>
