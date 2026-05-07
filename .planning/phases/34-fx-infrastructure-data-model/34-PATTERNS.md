# Phase 34 — Pattern Map

Analogs for files touched in this phase.

| Planned area | Role | Closest existing analog | Notes |
|--------------|------|-------------------------|--------|
| Forex fetch extension | HTTP + derived rates | `src/lib/priceApi.ts` `fetchForex` | Extend types + parsing; keep single URL |
| Session overrides | Merge + clear on success | `src/context/LivePricesContext.tsx` `runForexFetch`, `setSession` | Add three keys parallel to usd/aed |
| Zod root schema + version | Breaking version bump | `src/types/data.ts` `version: z.literal(1)` | Shift to `literal(2)` + migration |
| Migration chain | Pre-parse transforms | `src/context/AppDataContext.tsx` `migrateLegacyBankAccounts`, `parseAppDataFromImport` | Insert `migrateV1ToV2` before `safeParse` |
| Financial rounding | Display boundaries | `src/lib/financials.ts` `roundCurrency` | Conversion returns raw; callers round later |
| Vitest migration fixtures | JSON fixtures | `src/lib/__tests__/migration.test.ts` | Add v1 fixture → v2 expectations |
