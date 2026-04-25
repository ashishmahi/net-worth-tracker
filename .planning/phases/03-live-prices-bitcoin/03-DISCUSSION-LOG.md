# Phase 03: Live Prices + Bitcoin — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `03-CONTEXT.md`.

**Date:** 2026-04-25
**Phase:** 03 — Live Prices + Bitcoin
**Areas discussed:** Hook + APIs + caching; Settings + live rates; Bitcoin page; Loading/errors/stale; AED bank accounts

---

## Hook + APIs + caching

| Topic | Options / notes | Selected |
|--------|-----------------|----------|
| API policy | CLAUDE-locked vs flexible free APIs | **Flexible free public APIs**; notify on failure; session manual then auto when APIs return |
| TTL | CLAUDE (forex 24h) vs tighter forex | **BTC 5 min; forex ~hourly** |
| Manual fallback storage | session vs persisted | **Session only** — not in `data.json` |

**User's choice:** Any reasonable free APIs; on failure inform user and allow manual values for the session only; resume APIs when available. Forex TTL tighter than CLAUDE.md default.

---

## Settings + live rates

| Topic | Options | Selected |
|--------|-----------|----------|
| Display of live rates in Settings | Read-only block vs minimal vs discretion | **Claude's discretion** |
| Where session manual rates appear | Settings vs pages vs both | **Settings** (subsection ok) |

---

## Bitcoin page

| Topic | Options | Selected |
|--------|-----------|----------|
| Layout | Inline vs Card vs discretion | **Inline like Retirement** |
| Numbers shown | qty+INR vs qty+INR+USD vs discretion | **Quantity + INR + explicit USD value** |

---

## Loading / errors / staleness

| Topic | Options | Selected |
|--------|-----------|----------|
| Loading UI | Spinner/text vs skeleton vs discretion | **Spinner or short loading text** |
| Refresh after TTL | Background vs focus/nav vs discretion | **Claude's discretion** — prefer low API noise |

---

## AED bank accounts

| Topic | Options | Selected |
|--------|-----------|----------|
| Schema | `currency` + native balance vs optional AED field vs discretion | **`INR` \| `AED` + balance in native units** |
| Edit UX | Same Sheet + defaults | **Same Sheet**; sensible defaults (e.g. new account INR) |

---

## Claude's Discretion

- Settings layout for live vs manual-session blocks.
- Exact re-fetch strategy under low-noise bias.

## Deferred Ideas

None recorded.
