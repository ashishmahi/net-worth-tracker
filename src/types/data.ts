import { z } from 'zod'

// ── Shared base ──────────────────────────────────────────────────────────────

export const BaseItemSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// ── Section schemas ───────────────────────────────────────────────────────────

const GoldItemSchema = BaseItemSchema.extend({
  karat: z.union([z.literal(24), z.literal(22), z.literal(18)]),
  grams: z.number().nonnegative(),
  pricePerGram: z.number().nonnegative(),
})

const GoldSchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(GoldItemSchema),
})

const MutualFundsSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(z.unknown()), // Phase 2 fills this in
})

const StocksSchema = z.object({
  updatedAt: z.string().datetime(),
  platforms: z.array(z.unknown()), // Phase 2 fills this in
})

const BitcoinSchema = z.object({
  updatedAt: z.string().datetime(),
  quantity: z.number().nonnegative(), // e.g. 0.08
})

const PropertySchema = z.object({
  updatedAt: z.string().datetime(),
  items: z.array(z.unknown()), // Phase 4 fills this in
})

const BankSavingsSchema = z.object({
  updatedAt: z.string().datetime(),
  accounts: z.array(z.unknown()), // Phase 2 fills this in (INR + AED)
})

const RetirementSchema = z.object({
  updatedAt: z.string().datetime(),
  nps: z.number().nonnegative(),
  epf: z.number().nonnegative(),
})

const SettingsSchema = z
  .object({
    updatedAt: z.string().datetime(),
  })
  .passthrough() // settings will gain fields in later phases

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
