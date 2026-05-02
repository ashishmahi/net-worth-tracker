import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js'
import { describe, expect, it } from 'vitest'
import {
  createWealthExportZip,
  extractDataJsonFromZip,
  isDataJsonEntryEncrypted,
  isZipInvalidPassword,
  WealthZipError,
  WEALTH_ZIP_NEEDS_PASSPHRASE,
  WEALTH_ZIP_NO_DATA_JSON,
} from './wealthDataZip'

function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: 'application/zip' })
}

describe('wealthDataZip', () => {
  it('round-trips plain zip', async () => {
    const json = '{"version":1}'
    const blob = await createWealthExportZip(json, null)
    const file = blobToFile(blob, 't.zip')
    expect(await isDataJsonEntryEncrypted(file)).toBe(false)
    const out = await extractDataJsonFromZip(file)
    expect(out).toBe(json)
  })

  it('round-trips encrypted zip', async () => {
    const json = '{"version":1,"x":2}'
    const blob = await createWealthExportZip(json, 'test-secret')
    const file = blobToFile(blob, 't.zip')
    expect(await isDataJsonEntryEncrypted(file)).toBe(true)
    const out = await extractDataJsonFromZip(file, 'test-secret')
    expect(out).toBe(json)
  })

  it('rejects wrong password for encrypted zip', async () => {
    const blob = await createWealthExportZip('{}', 'test-secret')
    const file = blobToFile(blob, 't.zip')
    await expect(extractDataJsonFromZip(file, 'wrong')).rejects.toSatisfy((e: unknown) =>
      isZipInvalidPassword(e),
    )
  })

  it('isDataJsonEntryEncrypted is false for plain and true for encrypted', async () => {
    const plain = await createWealthExportZip('{}', null)
    const enc = await createWealthExportZip('{}', 'p')
    expect(await isDataJsonEntryEncrypted(blobToFile(plain, 'a.zip'))).toBe(false)
    expect(await isDataJsonEntryEncrypted(blobToFile(enc, 'b.zip'))).toBe(true)
  })

  it('throws when data.json is missing', async () => {
    const w = new BlobWriter('application/zip')
    const zw = new ZipWriter(w)
    await zw.add('notes.txt', new TextReader('hello'))
    const blob = await zw.close()
    const noDataJson = new File([blob], 'other.zip', { type: 'application/zip' })
    await expect(isDataJsonEntryEncrypted(noDataJson)).rejects.toThrow(WealthZipError)
    await expect(isDataJsonEntryEncrypted(noDataJson)).rejects.toMatchObject({
      message: WEALTH_ZIP_NO_DATA_JSON,
    })
  })

  it('needs passphrase when encrypted and password blank', async () => {
    const blob = await createWealthExportZip('{}', 'secret')
    const file = blobToFile(blob, 't.zip')
    await expect(extractDataJsonFromZip(file)).rejects.toMatchObject({
      message: WEALTH_ZIP_NEEDS_PASSPHRASE,
    })
  })
})
