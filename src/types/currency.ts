import { z } from 'zod'

/** Supported ISO 4217 codes for holdings and reporting (multi-currency phase). */
export const CURRENCY_CODES = ['INR', 'USD', 'AED', 'EUR', 'GBP', 'SGD'] as const

export type CurrencyCode = (typeof CURRENCY_CODES)[number]

export const CurrencySchema = z.enum(CURRENCY_CODES)
