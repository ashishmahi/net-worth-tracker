# Milestone history — Personal Wealth Tracker

**Pre-ship audit (v2.4):** No `v2.4-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit:** `gsd-sdk query audit-open` unavailable in this SDK — skipped (same as prior closes); deferred items unchanged in `STATE.md`.

## v2.4 Multi-Currency Reporting (Shipped: 2026-05-10)

**Scope:** Phases **34–38**.  
**Phase directories (current location):** [`.planning/phases/34-fx-infrastructure-data-model/`](phases/34-fx-infrastructure-data-model/) · [`.planning/phases/35-reporting-currency-selector/`](phases/35-reporting-currency-selector/) · [`.planning/phases/36-dashboard-dual-currency-display/`](phases/36-dashboard-dual-currency-display/) · [`.planning/phases/37-asset-pages-currency-fields-display/`](phases/37-asset-pages-currency-fields-display/) · [`.planning/phases/38-settings-snapshots-export-import/`](phases/38-settings-snapshots-export-import/)

**Phases completed:** 5 phases, 5 plans

**Key accomplishments:**

- **Phase 34:** EUR/GBP/SGD FX legs, `toReportingCurrency`, record-level `currency`, settings `reportingCurrency`, migrations — [`34-01-SUMMARY.md`](phases/34-fx-infrastructure-data-model/34-01-SUMMARY.md).
- **Phase 35:** Topbar reporting currency `<select>`, instant recalculation, persistence — [`35-01-SUMMARY.md`](phases/35-reporting-currency-selector/35-01-SUMMARY.md).
- **Phase 36:** Dashboard breakdown dual-currency stacks — [`36-01-SUMMARY.md`](phases/36-dashboard-dual-currency-display/36-01-SUMMARY.md) · [`36-VERIFICATION.md`](phases/36-dashboard-dual-currency-display/36-VERIFICATION.md).
- **Phase 37:** Currency dropdown + dual display across asset/liability pages — UAT [`37-UAT.md`](phases/37-asset-pages-currency-fields-display/37-UAT.md).
- **Phase 38:** Merged **Market & session rates** card; snapshot `reportingCurrency` / `totalReporting` / `rates`; Vitest zip round-trip — [`38-01-PLAN.md`](phases/38-settings-snapshots-export-import/38-01-PLAN.md) · UAT [`38-UAT.md`](phases/38-settings-snapshots-export-import/38-UAT.md).

**Roadmap / requirements:** [`.planning/milestones/v2.4-ROADMAP.md`](milestones/v2.4-ROADMAP.md), [`v2.4-REQUIREMENTS.md`](milestones/v2.4-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` still calls `phasesArchive` without a version (SDK bug); **v2.4** close used the **manual** archive path (same as **v2.3**). Phase dirs **34–38** left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v2.3):** No `v2.3-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit:** `gsd-sdk query audit-open` unavailable in this SDK — skipped (same as prior closes); deferred items unchanged in `STATE.md`.

## v2.3 Property entry flow & validation (Shipped: 2026-05-06)

**Scope:** Phases **31–33**.  
**Phase directories (current location):** [`.planning/phases/31-guided-property-entry-ux/`](phases/31-guided-property-entry-ux/) · [`.planning/phases/32-property-save-validation-schema/`](phases/32-property-save-validation-schema/) · [`.planning/phases/33-property-sheet-responsive-accessibility/`](phases/33-property-sheet-responsive-accessibility/)

**Phases completed:** 3 phases, 3 plans

**Key accomplishments:**

- **Phase 31:** Guided **`PATH_KEYS`** entry paths, conditional **`PropertyPage`** sections, inference from saved property shape (**PRP-01–03**) — [`31-01-SUMMARY.md`](phases/31-guided-property-entry-ux/31-01-SUMMARY.md).
- **Phase 32:** **`getPropertyValidationIssues`** + **`PropertyItemSchema`** save-blocking rules; Vitest for helpers/schema (**PRV-01–05**) — [`32-01-SUMMARY.md`](phases/32-property-save-validation-schema/32-01-SUMMARY.md).
- **Phase 33:** Responsive path **`grid-cols-1 sm:grid-cols-3`**, milestone horizontal-scroll hint, **`radiogroup`** arrow navigation + initial focus (**PRA-01**) — [`33-01-SUMMARY.md`](phases/33-property-sheet-responsive-accessibility/33-01-SUMMARY.md). UAT: [`33-UAT.md`](phases/33-property-sheet-responsive-accessibility/33-UAT.md) — 6/6 passed.

**Roadmap / requirements:** [`.planning/milestones/v2.3-ROADMAP.md`](milestones/v2.3-ROADMAP.md), [`v2.3-REQUIREMENTS.md`](milestones/v2.3-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; **v2.3** close used the **manual** archive path (same as **v2.2**). Phase dirs **31–33** left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v2.2):** No `v2.2-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit:** `gsd-sdk query audit-open` unavailable in this SDK — skipped (same as prior closes); deferred items unchanged in `STATE.md`.

## v2.2 Import-adjusted bullion pricing (Shipped: 2026-05-06)

**Scope:** Phases **29–30**.  
**Phase directories (current location):** [`.planning/phases/29-bullion-import-uplift-data-calculations/`](phases/29-bullion-import-uplift-data-calculations/) · [`.planning/phases/30-bullion-import-uplift-settings-ux-disclosure/`](phases/30-bullion-import-uplift-settings-ux-disclosure/)

**Phases completed:** 2 phases, 2 plans

**Key accomplishments:**

- **Phase 29:** Persisted **`goldImportUpliftRate`** / **`silverImportUpliftRate`** with defaults ~10% / ~8%; uplifted **`goldLiveHints`** / **`silverLiveHints`**; **`GoldSpotPricesSync`** / **`SilverSpotPricesSync`**; **`calcCategoryTotals`** + **`goldUsdPerOz`** for dashboard gold; Vitest coverage (**BLN-01–03**, **BLN-05**) — [`29-01-SUMMARY.md`](phases/29-bullion-import-uplift-data-calculations/29-01-SUMMARY.md).
- **Phase 30:** **`bullionUpliftDisclosure`** copy module; Settings gold/silver cards show read-only ballpark / parity / non-advice footnotes (**BLN-04**) — [`30-01-SUMMARY.md`](phases/30-bullion-import-uplift-settings-ux-disclosure/30-01-SUMMARY.md).

**Roadmap / requirements:** [`.planning/milestones/v2.2-ROADMAP.md`](milestones/v2.2-ROADMAP.md), [`v2.2-REQUIREMENTS.md`](milestones/v2.2-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; **v2.2** close used the **manual** archive path (same as **v2.1** / **v2.0.1**). Phase dirs **29–30** left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v2.1):** No `v2.1-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v2.1 close:** all clear (2026-05-04).

## v2.1 Section routing & home nav (Shipped: 2026-05-04)

**Scope:** Phase **28**.  
**Phase directory (current location):** [`.planning/phases/28-section-routing-home-header/`](phases/28-section-routing-home-header/)

**Phases completed:** 1 phase, 1 plan

**Key accomplishments:**

- **`react-router-dom`** + **`BrowserRouter`** **`basename={import.meta.env.BASE_URL}`**; **`src/lib/sectionRoutes.ts`** (whitelist paths + **`pathToSection`**) + Vitest; **`App`** **`Routes`**/**`Outlet`**/**`Navigate`**; sidebar **`NavLink`**; **`MobileTopBar`** **Home** (`House`) off-dashboard; dashboard drill-ins use **`navigate(sectionToPath(key))`** ([`28-01-SUMMARY.md`](phases/28-section-routing-home-header/28-01-SUMMARY.md)). UAT: [`28-UAT.md`](phases/28-section-routing-home-header/28-UAT.md) — 4/4 passed (2026-05-04).

**Roadmap / requirements:** [`.planning/milestones/v2.1-ROADMAP.md`](milestones/v2.1-ROADMAP.md), [`v2.1-REQUIREMENTS.md`](milestones/v2.1-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v2.1 archives follow the **manual** path (same as v2.0.1). Phase dir **28** left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v2.0.1):** No `v2.0.1-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v2.0.1 close:** all clear (2026-05-03).

## v2.0.1 Live gold spot + commodity pricing UX (Shipped: 2026-05-03)

**Scope:** Phases **26–27**.  
**Phase directories (current location):** [`.planning/phases/26-live-gold-spot-price/`](phases/26-live-gold-spot-price/) · [27-settings-commodity-pricing-ux](phases/27-settings-commodity-pricing-ux/)

**Phases completed:** 2 phases, 2 plans

**Key accomplishments:**

- **Phase 26:** **`fetchGoldUsdPerOz`** + **`GOLD_TTL_MS`** parity with silver; **`goldUsdPerOz`** on **`LivePricesContext`**; **`goldLiveHints`** and Settings/Gold **₹/g** read-only hints; **`GoldSpotPricesSync`** when unlocked (**SPOT-01–03**, **UX-01–03**, **CALC-01**, **TEST-01**).
- **Phase 27:** **`silverInrPerGram`** / **`silverPricesLocked`** + **`SilverSpotPricesSync`**; **`SettingsGoldPricingCard`** / **`SettingsSilverPricingCard`** (healthy-feed read-only + **Edit**; failure paths editable); **`effectiveSilverInrPerGramForNetWorth`** in net-worth calcs; dashboard skeleton skips silver loading for locked-only standard silver (**UX-04–UX-07**). UAT: [`27-UAT.md`](phases/27-settings-commodity-pricing-ux/27-UAT.md).

**Roadmap / requirements:** [`.planning/milestones/v2.0.1-ROADMAP.md`](milestones/v2.0.1-ROADMAP.md), [`v2.0.1-REQUIREMENTS.md`](milestones/v2.0.1-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v2.0.1 archives and **`REQUIREMENTS.md`** removal follow the **manual** path (same as v2.0 / v1.7). Phase dirs **26–27** left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v2.0):** No `v2.0-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v2.0 close:** all clear (2026-05-03).

## v2.0 Deploy & Beta — GitHub Pages (Shipped: 2026-05-03)

**Scope:** Phases **23–25**.  
**Phase directories (current location):** [`.planning/phases/23-docker-containerized-static-server/`](phases/23-docker-containerized-static-server/) · [24](phases/24-production-build-github-pages-base-path/) · [25](phases/25-github-actions-ci-cd-beta-access/)

**Phases completed:** 3 phases, 3 plans

**Key accomplishments:**

- **Phase 23:** **`Dockerfile`** (Node → **`nginx:alpine`**), **`docker/default.conf`** SPA fallback, **`.dockerignore`**, README **`docker build` / `docker run`** (**DOCKER-01–03**).
- **Phase 24:** **`vite.config.ts`** **`base`** from **`BASE_URL`** + **`normalizeBaseUrl`**; **`.env.example`**; README **`BASE_URL=/net-worth-tracker/`** (**BUILD-01–03**).
- **Phase 25:** **`.github/workflows/ci-pages.yml`** — PR + **`main`** CI; **`deploy`** to GitHub Pages on **`main`** **`push`**; README **Beta (GitHub Pages)** + **`localStorage`**-only data (**CI-01–03**, **DEPLOY-01–02**, **BETA-01**). Follow-up: duplicate **`github-pages`** artifact cleanup step for reliable re-runs.

**Roadmap / requirements:** [`.planning/milestones/v2.0-ROADMAP.md`](milestones/v2.0-ROADMAP.md), [`v2.0-REQUIREMENTS.md`](milestones/v2.0-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v2.0 archives and **`REQUIREMENTS.md`** removal follow the **manual** path (same as v1.6–v1.7). Phase dirs **23–25** left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v1.7):** No `v1.7-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v1.7 close:** all clear (2026-05-02).

## v1.7 localStorage Migration (Shipped: 2026-05-02)

**Scope:** Phase **22** only.  
**Phase directory (current location):** [`.planning/phases/22-localstorage-migration/`](phases/22-localstorage-migration/)

**Phases completed:** 1 phase, 1 plan

**Key accomplishments:**

- **`AppDataContext`** — reads/writes **`wealth-tracker-data`** in **`localStorage`**; synchronous boot (`useState` initializer); **`saveData`** uses **`setItem`** only (preserves **`theme`** key); quota errors surface to callers.
- **Infra** — **`plugins/dataPlugin.ts`** removed; **`vite.config.ts`** no data middleware.
- **UX** — Settings danger zone + zip validation copy no longer frame **`data.json`** as live storage; **`CLAUDE.md`** updated.
- **Tests** — **`happy-dom`** + **`AppDataContext.test.tsx`** (boot paths, round-trip, corrupt JSON, quota).

**Roadmap / requirements:** [`.planning/milestones/v1.7-ROADMAP.md`](milestones/v1.7-ROADMAP.md), [`v1.7-REQUIREMENTS.md`](milestones/v1.7-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v1.7 archives and **`REQUIREMENTS.md`** removal follow the **manual** path as v1.6. Phase dir **22** left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**UAT:** [`22-UAT.md`](phases/22-localstorage-migration/22-UAT.md) — 5/5 passed (2026-05-02).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v1.6):** No `v1.6-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v1.6 close:** all clear (2026-05-02).

## v1.6 Encrypted Export (Shipped: 2026-05-02)

**Scope:** Phases 19–21.  
**Phase directories (current location):** [`.planning/phases/19-crypto-utilities/`](phases/19-crypto-utilities/) · [20-settings-ui-encrypted-export-import](phases/20-settings-ui-encrypted-export-import/) · [21-improve-ui-for-adding-passphrase-macbook-like-passphrase-to-](phases/21-improve-ui-for-adding-passphrase-macbook-like-passphrase-to/)

**Phases completed:** 3 phases, 3 plans

**Key accomplishments:**

- **`src/lib/cryptoUtils.ts`** — AES-256-GCM + PBKDF2 envelope; wrong-passphrase **`CryptoError`**; unit tests (**ENC-02**, **ENC-03**).
- Settings **Data** (Phase 20) — passphrase export/import, envelope auto-detect, inline errors (**ENC-01**, **ENC-04**–**ENC-06**).
- **`src/lib/wealthDataZip.ts`** + **`@zip.js/zip.js`** — zip with **`data.json`**; optional AES-256 entry encryption; **`SettingsPage`** modal UX; zip-only import; removes legacy JSON picker flow (**Phase 21**).

**Roadmap / requirements:** [`.planning/milestones/v1.6-ROADMAP.md`](milestones/v1.6-ROADMAP.md), [`v1.6-REQUIREMENTS.md`](milestones/v1.6-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v1.6 archives and **`REQUIREMENTS.md`** removal follow the **manual** path as v1.5. Phase dirs left under **`.planning/phases/`** (optional **`/gsd-cleanup`** later).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v1.5):** No `v1.5-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v1.5 close:** all clear (2026-05-02).

## v1.5 Debt & Liabilities (Shipped: 2026-05-02)

**Scope:** Phases 14–18.  
**Phase directories:** [`.planning/milestones/v1.5-phases/14-schema-migration/`](milestones/v1.5-phases/14-schema-migration/) · [15](milestones/v1.5-phases/15-calculation-utilities/) · [16](milestones/v1.5-phases/16-property-liability-enrichment/) · [17](milestones/v1.5-phases/17-liabilities-page-crud/) · [18](milestones/v1.5-phases/18-dashboard-net-worth-integration/)

**Phases completed:** 5 phases, 6 plans

**Key accomplishments:**

- **`liabilities`** on **`DataSchema`**, **`LiabilityItemSchema`**, **`ensureLiabilities()`**; **`NetWorthPointSchema.totalInr`** allows negative values; import/reset parity (**DEBT-01–05**, **INFRA-01–02**).
- **`src/lib/liabilityCalcs.ts`**: **`sumLiabilitiesInr`**, **`sumAllDebtInr`**, **`calcNetWorth`**, **`debtToAssetRatio`** with Vitest coverage (**CALC-01–04**).
- **Property** optional **lender** + **EMI** + disambiguation hint to **Liabilities** (**PROP-01–03**).
- **`LiabilitiesPage`**: CRUD, type badges, aggregates, empty state; **`AppSidebar`** **`liabilities`** (**LIAB-01–06**, **INFRA-03**).
- **Dashboard**: debt-adjusted headline, **Total Debt** row, debt-to-asset ratio, **Record snapshot** uses **`calcNetWorth`** (**DASH-01–04**).

**Roadmap / requirements:** [`.planning/milestones/v1.5-ROADMAP.md`](milestones/v1.5-ROADMAP.md), [`v1.5-REQUIREMENTS.md`](milestones/v1.5-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v1.5 archives, phase moves, and `REQUIREMENTS.md` removal follow the **manual** path as v1.4 / v1.3.

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v1.4):** No `v1.4-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v1.4 close:** all clear (2026-05-01).

## v1.4 Multiple commodities (Shipped: 2026-05-01)

**Scope:** Phases 12–13.  
**Phase directories:** [`.planning/milestones/v1.4-phases/12-commodities-data-net-worth/`](milestones/v1.4-phases/12-commodities-data-net-worth/), [`.planning/milestones/v1.4-phases/13-commodities-product-ux/`](milestones/v1.4-phases/13-commodities-product-ux/)

**Phases completed:** 2 phases, 5 plans

**Key accomplishments:**

- **`otherCommodities`** on **`DataSchema`** with migration / **`ensureOtherCommodities`**; silver USD via **`priceApi`** + **`LivePricesContext`**; **`sumCommoditiesInr`** + Dashboard **Commodities** row with null-total semantics when rates or prices missing (**COM-01**, **COM-02**, **COM-05**).
- **`CommoditiesPage`**: RHF + Zod CRUD for standard silver (grams) and manual ₹ lines; rich empty state; read-only live INR hint (**COM-03**).
- Sidebar **`commodities`** section; Dashboard **`NAV_KEY.otherCommodities` → `commodities`**; exclusion / blocked-snapshot copy; **Gold** row cosmetic pairing only (**COM-04**, **COM-06**).

**Roadmap / requirements:** [`.planning/milestones/v1.4-ROADMAP.md`](milestones/v1.4-ROADMAP.md), [`v1.4-REQUIREMENTS.md`](milestones/v1.4-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v1.4 archives, phase moves, and `REQUIREMENTS.md` removal follow the same **manual** path as v1.2 / v1.3 close.

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

**Pre-ship audit (v1.3):** No `v1.3-MILESTONE-AUDIT.md` on file — optional `/gsd-audit-milestone` before high-stakes releases.  
**Open-artifact audit at v1.3 close:** all clear (2026-04-28).

## v1.3 Net worth history (Shipped: 2026-04-28)

**Scope:** Phases 10, 10.1 (INSERTED), 11.  
**Phase directories:** `.planning/milestones/v1.3-phases/10-history-schema/`, `.planning/milestones/v1.3-phases/10.1-json-import-quick-import-from-file-to-match-existing-json-ex/`, `.planning/milestones/v1.3-phases/11-net-worth-chart/`

**Phases completed:** 3 phases, 3 plans

**Key accomplishments:**

- **`netWorthHistory`** on **`DataSchema`**, **`ensureNetWorthHistory`**, **`createInitialData()`** with `[]`; **`Record snapshot`** on Dashboard with **`canRecordSnapshot`** gates; full reset clears history (**NWH-01–05** record + reset path).
- Settings **Import from JSON** paired with Export: **`parseAppDataFromImport`**, **`AlertDialog`** before replace, inline errors (**IMP-01**, **IMP-02**).
- **Recharts** + shadcn **`ChartContainer`**, **`NetWorthOverTimeCard`** with **`--chart-*`** theme tokens; chart only when **≥2** snapshots; **NWH-04** insufficient-data state (**Phase 11**).

**Roadmap / requirements:** [`.planning/milestones/v1.3-ROADMAP.md`](milestones/v1.3-ROADMAP.md), [`v1.3-REQUIREMENTS.md`](milestones/v1.3-REQUIREMENTS.md)

**Tooling note:** `gsd-sdk query milestone.complete` returned `version required for phases archive`; v1.3 archives and `REQUIREMENTS.md` removal were completed manually (same as v1.2 close).

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

## v1.2 Data reset (Shipped: 2026-04-26)

**Scope:** Phase 9.  
**Phase directory:** [`.planning/milestones/v1.2-phases/09-data-reset/`](milestones/v1.2-phases/09-data-reset/)

**Phases completed:** 1 phase, 2 plans

**Key accomplishments:**

- `export function createInitialData()` in `AppDataContext` with `nowIso()` for all `updatedAt` fields; `INITIAL_DATA` derived from the factory to avoid drift.
- shadcn **AlertDialog** + **danger zone** `Card` on Settings (below **Export Data**): **Cancel** + **Yes, clear all data**; async `saveData(createInitialData())` with inline error/success; no `localStorage` theme wipe.
- Gold and retirement RHF forms reset to empty when optional `settings` slices are removed after a full clear.

**Roadmap / requirements:** [`.planning/milestones/v1.2-ROADMAP.md`](milestones/v1.2-ROADMAP.md), [`v1.2-REQUIREMENTS.md`](milestones/v1.2-REQUIREMENTS.md)

**Known deferred (unchanged):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

---

## v1.1 UX Polish (Shipped: 2026-04-26)

**Scope:** Phases 6–8.  
**Phase directories:** `.planning/milestones/v1.1-phases/`

**Phases completed:** 3 phases, 5 plans, 23 tasks

**Key accomplishments:**

- FOUC-safe inline `theme` read in `index.html` plus `ThemeProvider` / `useTheme` wrapping the app above data providers.
- Sun/Moon `ghost` control in the sidebar footer with `useTheme` and a clean grep audit for raw light-only Tailwind/hex in `src`.
- Offcanvas main navigation on small viewports, a `MobileTopBar` with hamburger and icon-only theme toggle, and screen-reader copy for the mobile Sheet—desktop layout unchanged at 768px+.
- A shared `PageHeader` unifies section titles, optional `meta` (totals, alerts), and primary actions so narrow viewports stack a full-width CTA without horizontal header overflow, matching `08-UI-SPEC` D-01–D-03.
- Add/Edit `Sheet` panels use a capped viewport height, a scrollable field stack, and a non-scrolling header/footer; the property milestone grid scrolls horizontally on very narrow widths instead of clipping columns.

**Roadmap / requirements:** `.planning/milestones/v1.1-ROADMAP.md`, `v1.1-REQUIREMENTS.md`

---

## v1.0 — Local wealth tracker

**Status:** Shipped (2026-04-26)  
**Scope:** Phases 02–05 in GSD (12 plans, all with `*-SUMMARY.md`); Vite + React + JSON persistence, seven asset areas, live prices, property, dashboard.  
**Roadmap snapshot:** `.planning/milestones/v1.0-ROADMAP.md`  
**Requirements snapshot:** `.planning/milestones/v1.0-REQUIREMENTS.md`  
**Phase directories (GSD 01–05):** `.planning/milestones/v1.0-phases/`

**Key accomplishments**

- Manual asset entry (Gold, MF, Stocks, bank, retirement) and Settings; export path from early foundation work.
- Live BTC + forex + AED/INR; Bitcoin and AED bank support.
- Property with milestones and liability; Zod-typed `data` model.
- Dashboard: `dashboardCalcs` + net worth UI with section navigation.

**Pre-release audit**

- No `v1.0-MILESTONE-AUDIT.md` on file; optional `/gsd-audit-milestone` for a formal pass on future closes.

**Known deferred items at close (see `STATE.md` — Deferred Items)**

- Phase 05 UAT in progress (`05-UAT.md`, testing).
- Phase 01 verification file lists `human_needed` (`01-VERIFICATION.md`).

**Known deferred (unchanged from v1.0 close):** Phase 05 UAT, Phase 01 `human_needed` — see `STATE.md` **Deferred items**.

_Next: `/gsd-new-milestone` to plan **v1.5+** (requirements + roadmap)._
