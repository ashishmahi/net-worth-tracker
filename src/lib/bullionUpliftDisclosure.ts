/**
 * Read-only disclosure copy for import-style bullion uplift on Settings pricing cards (BLN-04).
 * Strings are illustrative ballpark guidance — not bound to persisted uplift decimals in UI.
 */

/** Gold: illustrative ~10% import-style uplift; not editable from Settings. */
export const BULLION_UPLIFT_BALLPARK_GOLD =
  'Gold live ₹/g hints apply an illustrative ~10% import-style uplift on parity ₹/g — a ballpark default, not something you can tune here.'

/** Silver: illustrative ~8% import-style uplift; not editable from Settings. */
export const BULLION_UPLIFT_BALLPARK_SILVER =
  'Silver live ₹/g hints apply an illustrative ~8% import-style uplift on parity ₹/g — a ballpark default, not something you can tune here.'

/** How uplift relates to spot × forex parity (shared gold/silver). */
export const BULLION_UPLIFT_PARITY_LINE =
  'Import-style uplift is applied on top of ₹/g built from international spot combined with USD→INR (parity).'

/** Per-card footnote: approximation + non-advice (substance required for BLN-04). */
export const BULLION_UPLIFT_DISCLAIMER_FOOTNOTE =
  'Figures are approximate and for illustration only; this is not legal, customs, or tax advice.'
