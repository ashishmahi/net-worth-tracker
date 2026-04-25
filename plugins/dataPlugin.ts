import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const DATA_PATH = path.resolve(process.cwd(), 'data.json')

export function dataPlugin(): Plugin {
  return {
    name: 'local-data-plugin',
    configureServer(server) {
      server.middlewares.use('/api/data', (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'GET') {
          try {
            const raw = fs.readFileSync(DATA_PATH, 'utf-8')
            res.end(raw)
          } catch {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'data.json not found' }))
          }
          return
        }

        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf-8')
              JSON.parse(body) // validate JSON before writing
              fs.writeFileSync(DATA_PATH, body, 'utf-8')
              res.statusCode = 200
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}
