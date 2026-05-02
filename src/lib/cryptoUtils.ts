export interface EncryptedEnvelope {
  encrypted: true
  version: 1
  salt: string
  iv: string
  data: string
}

export interface CryptoError extends Error {
  code: 'WRONG_PASSPHRASE'
}

export function isCryptoError(e: unknown): e is CryptoError {
  return (
    e instanceof Error &&
    'code' in e &&
    (e as CryptoError).code === 'WRONG_PASSPHRASE'
  )
}

export async function encryptData(
  _plaintext: string,
  _passphrase: string
): Promise<EncryptedEnvelope> {
  throw new Error('Not implemented')
}

export async function decryptData(
  _envelope: EncryptedEnvelope,
  _passphrase: string
): Promise<string> {
  throw new Error('Not implemented')
}
