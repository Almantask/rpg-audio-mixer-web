import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Connect } from 'vite'
import { defineConfig } from 'vitest/config'

const base = process.env.VITE_BASE ?? '/'

function serveAssetsAudioPlugin() {
  const assetsRoot = path.resolve(__dirname, 'assets/audio')

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url ?? ''
    if (!url.startsWith('/assets/audio/')) {
      next()
      return
    }

    const relativePath = decodeURIComponent(url.replace('/assets/audio/', ''))
    const filePath = path.join(assetsRoot, relativePath)
    if (!filePath.startsWith(assetsRoot) || !fs.existsSync(filePath)) {
      next()
      return
    }

    res.setHeader('Content-Type', 'audio/ogg')
    fs.createReadStream(filePath).pipe(res)
  }

  return {
    name: 'serve-assets-audio',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), serveAssetsAudioPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, '.'), path.resolve(__dirname, 'assets')],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.features-gen', 'e2e'],
  },
})
