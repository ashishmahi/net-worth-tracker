## RESEARCH COMPLETE

# Phase 29 — Technical research: Bullion import uplift (data & calculations)

**Question answered:** What must we know to plan schema migration, parity math, sync, and net-worth alignment?

## Sources

- **`29-CONTEXT.md`** (locked decisions D-01–D-14)
- **`REQUIREMENTS.md`** — BLN-01, BLN-02, BLN-03, BLN-05
- **Code:** `src/types/data.ts` (`SettingsSchema`, `.passthrough()`), `src/lib/goldLiveHints.ts`, `src/lib/silverLiveHints.ts`, `src/context/GoldSpotPricesSync.tsx`, `src/context/SilverSpotPricesSync.tsx`, `src/lib/dashboardCalcs.ts`, `src/context/AppDataContext.tsx` (`parseAppDataFromImport` migration chain)

## Findings

### 1. Storage model (BLN-03)

- Add **`goldImportUpliftRate`** and **`silverImportUpliftRate`** to **`SettingsSchema`** as optional **`z.number().nonnegative()`** (D-02: no upper cap).
- **Defaults:** **0.10** gold, **0.08** silver when keys absent (**D-01**, SEED-001 alignment).
- **Migration:** New **`ensureImportUpliftRates`** (name illustrative) in the same chain as **`migrateLegacyBankAccounts` → … → `ensureLiabilities`**, **before** **`DataSchema.safeParse`**, injecting defaults on **`settings`** when keys are missing so **import + localStorage load** behave like **`createInitialData()`** (D-03).
- **`createInitialData()`** should set explicit default rates so **new documents** serialize deterministically.

### 2. Gold math (BLN-01, D-04–D-06)

- **Order:** Compute **24K parity ₹/g** from spot×forex **without** intermediate rounding that conflicts with D-05; apply **`(1 + goldImportUpliftRate)`** to the **pure parity product**, then **`roundCurrency` once** for **24K output**.
- **Karat derivation:** **`roundCurrency(upliftedPure * karat/24)`** for 22K and 18K (**duty-on-metal-before-karat**).
- **API shape:** Extend **`liveInrPerGramPure` / `liveInrPerGramForKarat`** to accept resolved uplift rate (callers pass **`resolveGoldImportUpliftRate(settings)`** or explicit number). Use **named constants** **`DEFAULT_GOLD_IMPORT_UPLIFT_RATE`** / **`DEFAULT_SILVER_IMPORT_UPLIFT_RATE`** exported from **`goldLiveHints`** / **`silverLiveHints`** (or a tiny shared constants module if needed — prefer keeping defaults next to math).

### 3. Silver math (BLN-02, D-07)

- **`liveSilverInrPerGram`** takes uplift rate; **`effectiveSilverInrPerGramForNetWorth`** applies uplift when deriving from **live** spot×forex; **locked manual** path unchanged.

### 4. Sync vs manual (D-06)

- **GoldSpotPricesSync** / **SilverSpotPricesSync** compute hints with the **same uplifted helpers** as UI hints so persisted **`goldPrices`** / **`silverInrPerGram`** match displayed live hints when auto-sync is on.
- **Legacy / locked** semantics: unchanged **`shouldAutoSyncGoldFromSpot`** / **`shouldAutoSyncSilverFromSpot`**.

### 5. Net worth (D-12–D-14)

- Extend **`calcCategoryTotals`** **`live`** argument with **`goldUsdPerOz: number | null`**.
- **`sumGoldInr`:** When live-derived pricing applies (mirror **`shouldAutoSyncGoldFromSpot`** rules), use **uplifted** ₹/g per karat **computed from live** + settings rates — avoid duplicating uplift math outside **`goldLiveHints`** (single lib path). Prefer a dedicated **`effectiveGold…ForNetWorth`** helper analogous to **`effectiveSilverInrPerGramForNetWorth`**.
- **Silver:** **`effectiveSilverInrPerGramForNetWorth`** must apply uplift on the live branch.

### 6. Call sites to touch

- **`SettingsGoldPricingCard.tsx`**, **`GoldPage.tsx`**: pass uplift rate into **`liveInrPerGramForKarat`** (via **`useMemo`** deps including **`data.settings`** uplift fields).
- **`DashboardPage.tsx`**: pass **`goldUsdPerOz`** into **`calcCategoryTotals`**.
- **Tests:** Extend **`goldLiveHints.test.ts`**, **`silverLiveHints`** tests (file or new), **`dashboardCalcs.test.ts`**; add migration coverage for **`parseAppDataFromImport`** / **`ensureImportUpliftRates`** (pattern from **`AppDataContext.test.tsx`**).

### 7. Schema push gate

- **No Prisma/Drizzle/Supabase** in repo — **no** `[BLOCKING]` DB push task.

---

## Validation Architecture

**Goal:** Every executor wave has **grep- or test-verifiable** feedback; Vitest is the **primary** automated signal.

| Dimension | Approach |
|-----------|----------|
| **Unit** | **`npm test -- --run`** scoped files after tasks touching **`goldLiveHints`**, **`silverLiveHints`**, **`dashboardCalcs`**, **`AppDataContext`** migration |
| **Regression** | Assertions lock **numeric** uplift behavior (defaults **0.10 / 0.08**) and **locked-price** overrides |
| **Integration** | **`parseAppDataFromImport`** with fixtures missing uplift keys → parsed **`settings`** contain defaults |

**Manual:** None required for Phase 29 beyond normal dev smoke (**optional**).
