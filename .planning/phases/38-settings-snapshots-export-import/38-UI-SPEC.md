# Phase 38 — UI Design Contract

**Scope:** Settings → **Live rates** tab only (merged market + session card). Dashboard snapshot button behavior is data-only (no new chrome).

## Screen: Live rates tab — merged card

### Structure

- **Single `Card`** replaces the previous **Live market rates** + **Session-only manual rates** pair (**D-04**).
- **Title row:** Primary label **`Market & session rates`** (or equivalent short title) + **`Edit`** (`variant="outline"` `size="sm"`) aligned end on **`sm+`** (`flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between`), matching **`SettingsGoldPricingCard`** header rhythm.
- **Intro copy:** One short paragraph — quotes refresh automatically; manual values are session-only; links mentally to existing explainer (**D-08**).
- **Explainer id:** Preserve `aria-describedby` targeting the session-only paragraph for manual inputs (**D-08**).

### Read-only mode (default)

- **`dl`** list **`space-y-2 text-sm`** with **`aria-live="polite"`**.
- **Row order (fixed):** USD → INR, AED → INR, EUR → INR, GBP → INR, SGD → INR, BTC / USD (**D-01**). **No** Gold (XAU) or Silver (XAG) rows (**D-04**).
- **Labels (exact):** **`USD → INR (₹ per $1)`**, **`AED → INR (₹ per 1 AED)`**, **`EUR → INR (₹ per 1 EUR)`**, **`GBP → INR (₹ per 1 GBP)`**, **`SGD → INR (₹ per 1 SGD)`**, **`BTC / USD`** (**D-02**).
- **Values:** FX → `toLocaleString('en-IN', { maximumFractionDigits: 4 })`; BTC → `maximumFractionDigits: 2` (**read-only formatting** discretion).
- **Loading:** Per-row **`Loader2`** + **`Loading…`** when channel loading and value absent (**D-03**).
- **Missing quote:** **`—`** muted (**D-03**). **Do not** use **Rate unavailable** copy on this card (**D-03**).
- **Errors:** Forex + BTC errors only in one **`role="alert"`** destructive line (Gold/Silver errors belong on **Gold & Silver** tab).

### Edit mode

- **Six** **`Input`** fields: `type="text"` `inputMode="decimal"` with existing placeholder style; labels **`USD → INR (manual)`** … **`BTC / USD (manual)`** matching **D-06**.
- **Actions:** **`Apply session rates`** (`variant="secondary"`) + **`Clear session rates`** (`variant="outline"`) + **`Cancel`** (`variant="ghost"`). Apply invokes existing **`setSessionRates`** semantics (non-empty trimmed fields only); Clear invokes **`clearSessionRates`** and exits edit with cleared drafts; Cancel exits edit without applying (**D-06**).
- After successful Apply: return to **read-only** (**D-06**).

### Accessibility

- Manual inputs **`aria-describedby`** → session explainer id.
- Edit toggle does not trap focus; buttons remain reachable in DOM order.

---

## Snapshot capture (no new UI chrome)

- Existing **Record snapshot** control unchanged; **`snapshotSaved`** / error patterns unchanged.
