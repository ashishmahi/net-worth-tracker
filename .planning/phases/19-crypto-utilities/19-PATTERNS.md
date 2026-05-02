# Phase 19 — Pattern Map

**Phase:** 19 — Crypto Utilities  
**Generated:** 2026-05-02

## New / Modified Files

| File | Role | Closest analog |
|------|------|----------------|
| `src/lib/cryptoUtils.ts` | Pure crypto API, named exports, no deps | `src/lib/liabilityCalcs.ts` — pure functions, explicit exports |
| `src/lib/__tests__/cryptoUtils.test.ts` | Vitest `describe`/`it`/`expect` | `src/lib/__tests__/liabilityCalcs.test.ts` |

## Analog Excerpts

**Exports and imports** (`liabilityCalcs.ts`):

```typescript
import type { AppData } from '@/types/data'
import { roundCurrency } from '@/lib/financials'

export function sumLiabilitiesInr(data: AppData): number {
  return data.liabilities.reduce(
    (sum, item) => roundCurrency(sum + roundCurrency(item.outstandingInr)),
    0
  )
}
```

**Test shell** (`liabilityCalcs.test.ts`):

```typescript
import { describe, expect, it } from 'vitest'
import { ... } from '@/lib/liabilityCalcs'
```

Apply the same: **`describe`/`it`/`expect` from `'vitest'`**, imports from **`@/lib/cryptoUtils`**, no default export.

## Data Flow

Passphrase + plaintext → **encryptData** → `EncryptedEnvelope` (JSON-serializable).  
`EncryptedEnvelope` + passphrase → **decryptData** → plaintext `string`. Phase 20 adds `JSON.stringify`/`JSON.parse` around this boundary.
