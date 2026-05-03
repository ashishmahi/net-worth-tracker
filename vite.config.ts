import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

function normalizeBaseUrl(raw: string | undefined): string {
  if (raw === undefined || raw === null) return '/'
  const trimmed = raw.trim()
  if (trimmed === '') return '/'
  let result = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  if (result === '/') return '/'
  if (!result.endsWith('/')) result = `${result}/`
  return result
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: normalizeBaseUrl(env.BASE_URL),
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
