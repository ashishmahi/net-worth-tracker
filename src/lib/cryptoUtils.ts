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

function cryptoTag(message: string): CryptoError {
  return Object.assign(new Error(message), {
    code: 'WRONG_PASSPHRASE' as const,
  })
}

export function isCryptoError(e: unknown): e is CryptoError {
  return (
    e instanceof Error &&
    'code' in e &&
    (e as CryptoError).code === 'WRONG_PASSPHRASE'
  )
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i)
  }
  return out
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 600000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(
  plaintext: string,
  passphrase: string
): Promise<EncryptedEnvelope> {
  const enc = new TextEncoder()
  const salt = new Uint8Array(16)
  const iv = new Uint8Array(12)
  crypto.getRandomValues(salt)
  crypto.getRandomValues(iv)
  const key = await deriveKey(passphrase, salt)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  )
  return {
    encrypted: true,
    version: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  }
}

export async function decryptData(
  envelope: EncryptedEnvelope,
  passphrase: string
): Promise<string> {
  if (envelope.encrypted !== true || envelope.version !== 1) {
    throw cryptoTag('Invalid encrypted envelope')
  }
  const salt = base64ToBytes(envelope.salt)
  const iv = base64ToBytes(envelope.iv)
  const ciphertextBytes = base64ToBytes(envelope.data)
  const key = await deriveKey(passphrase, salt)
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertextBytes
    )
    return new TextDecoder().decode(plain)
  } catch {
    throw cryptoTag('Wrong passphrase or corrupted data')
  }
}
