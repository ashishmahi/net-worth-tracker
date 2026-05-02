# Phase 21 — Pattern Map

Analogs in-repo for Phase 21 changes (modal + async + errors).

| New / changed surface | Closest existing analog | Notes |
|----------------------|-------------------------|--------|
| `AlertDialog` for destructive/confirm flows | `SettingsPage.tsx` — import confirmation `AlertDialog` (~835–887) | Mirror structure for export/import passphrase modals; separate `open` state per dialog |
| Passphrase + Eye toggle | Current inline export/import passphrase blocks (~662–817) | Move markup into dialog body; keep `pr-10` + absolute ghost button |
| Busy + `Loader2` | Export / Import / Decrypt buttons (~736–810) | Reuse `exportBusy` / `importBusy`; UI-SPEC busy labels "Exporting…" / "Decrypting…" |
| Inline `role="alert"` errors | Multiple `text-destructive` paragraphs | Modal errors inside dialog; unsupported format below Import button (page-level) |
| File input hidden + outline button | `importFileInputRef` + Button (~694–756) | Change `accept` to `.zip`; aria-labels → "Import from Zip" per UI-SPEC |
| Download blob | `handleExport` / encrypted branch (~718–726) | Swap body for zip `Blob` from new zip helper; filename `.zip` |
| Parse gate | `parseAppDataFromImport` after decrypt | Unchanged — feed JSON string from extracted `data.json` |

**New module (no analog):** `src/lib/` zip helper using `@zip.js/zip.js` — follow `cryptoUtils.ts` style: pure functions, explicit errors, no `console.log` of secrets.
