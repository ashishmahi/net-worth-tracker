import { describe, expect, it } from 'vitest'
import {
  decryptData,
  encryptData,
  isCryptoError,
} from '@/lib/cryptoUtils'

const PASS = 'test-passphrase-123'
const PLAINTEXT = '{"hello":"world"}'

describe('cryptoUtils', () => {
  it('round-trips plaintext with the same passphrase', async () => {
    const envelope = await encryptData(PLAINTEXT, PASS)
    const result = await decryptData(envelope, PASS)
    expect(result).toBe(PLAINTEXT)
  })

  it('decrypts with the correct passphrase to the original string', async () => {
    const envelope = await encryptData(PLAINTEXT, PASS)
    const decrypted = await decryptData(envelope, PASS)
    expect(decrypted).toBe(PLAINTEXT)
  })

  it('rejects wrong passphrase with CryptoError WRONG_PASSPHRASE', async () => {
    const envelope = await encryptData(PLAINTEXT, PASS)
    try {
      await decryptData(envelope, 'different-wrong-passphrase')
      expect.fail('expected decryptData to throw')
    } catch (e) {
      expect(isCryptoError(e)).toBe(true)
      if (isCryptoError(e)) {
        expect(e.code).toBe('WRONG_PASSPHRASE')
      }
    }
  })

  it('produces envelope with expected shape after encrypt', async () => {
    const envelope = await encryptData(PLAINTEXT, PASS)
    expect(envelope.encrypted).toBe(true)
    expect(envelope.version).toBe(1)
    expect(envelope.salt.length).toBeGreaterThan(0)
    expect(envelope.iv.length).toBeGreaterThan(0)
    expect(envelope.data.length).toBeGreaterThan(0)
  })
})
