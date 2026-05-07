import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['src/lib/currencyConversion.ts'],
    },
  },
})
