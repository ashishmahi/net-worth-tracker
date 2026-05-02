import {
  BlobReader,
  BlobWriter,
  ERR_INVALID_PASSWORD,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter,
  type Entry,
  type FileEntry,
} from '@zip.js/zip.js'

/** Thrown when `data.json` is missing from the archive. Message includes this token for callers/tests. */
export const WEALTH_ZIP_NO_DATA_JSON = 'NO_DATA_JSON'

/** Encrypted entry but no passphrase supplied to `extractDataJsonFromZip`. */
export const WEALTH_ZIP_NEEDS_PASSPHRASE = 'NEEDS_PASSPHRASE'

export class WealthZipError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WealthZipError'
  }
}

function normalizeEntryFilename(filename: string): string {
  return filename.replace(/^\.\/+/, '')
}

function findDataJsonEntry(entries: Entry[]): FileEntry | null {
  for (const entry of entries) {
    if (entry.directory) continue
    if (normalizeEntryFilename(entry.filename) === 'data.json') {
      return entry
    }
  }
  return null
}

export function isZipInvalidPassword(err: unknown): boolean {
  if (err === ERR_INVALID_PASSWORD) return true
  const s = String(err instanceof Error ? err.message : err)
  return s.includes(ERR_INVALID_PASSWORD)
}

export async function createWealthExportZip(
  jsonText: string,
  password: string | null,
): Promise<Blob> {
  const blobWriter = new BlobWriter('application/zip')
  const zipWriter = new ZipWriter(blobWriter)
  const trimmed = password?.trim() ?? ''
  const options =
    trimmed === ''
      ? undefined
      : { password: trimmed, encryptionStrength: 3 as const }
  await zipWriter.add('data.json', new TextReader(jsonText), options)
  return zipWriter.close()
}

export async function isDataJsonEntryEncrypted(file: File): Promise<boolean> {
  const zipReader = new ZipReader(new BlobReader(file))
  try {
    const entries = await zipReader.getEntries()
    const dataEntry = findDataJsonEntry(entries)
    if (!dataEntry) {
      throw new WealthZipError(WEALTH_ZIP_NO_DATA_JSON)
    }
    return dataEntry.encrypted === true
  } finally {
    await zipReader.close()
  }
}

export async function extractDataJsonFromZip(
  file: File,
  password?: string,
): Promise<string> {
  const zipReader = new ZipReader(new BlobReader(file))
  try {
    const entries = await zipReader.getEntries()
    const dataEntry = findDataJsonEntry(entries)
    if (!dataEntry) {
      throw new WealthZipError(WEALTH_ZIP_NO_DATA_JSON)
    }
    const pwd = password?.trim() ?? ''
    if (dataEntry.encrypted && pwd === '') {
      throw new WealthZipError(WEALTH_ZIP_NEEDS_PASSPHRASE)
    }
    const opts = pwd ? { password: pwd } : undefined
    return await dataEntry.getData(new TextWriter(), opts)
  } finally {
    await zipReader.close()
  }
}
