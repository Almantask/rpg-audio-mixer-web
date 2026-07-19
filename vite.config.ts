import fs from 'node:fs'
import { cpSync } from 'node:fs'
import path from 'node:path'
import type { ServerResponse } from 'node:http'
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
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist/assets/audio')
      cpSync(assetsRoot, outDir, { recursive: true })
    },
  }
}

function youtubeMetadataProxyPlugin() {
  const sendJson = (res: ServerResponse, status: number, body: unknown) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const rawUrl = req.url ?? ''
    if (!rawUrl.startsWith('/api/youtube/')) {
      next()
      return
    }

    void (async () => {
      try {
        const parsed = new URL(rawUrl, 'http://127.0.0.1')
        if (parsed.pathname === '/api/youtube/oembed') {
          const target = parsed.searchParams.get('url')
          if (!target) {
            sendJson(res, 400, { error: 'Missing url' })
            return
          }
          const upstream = await fetch(
            `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(target)}`,
          )
          if (!upstream.ok) {
            sendJson(res, upstream.status, { error: 'oEmbed lookup failed' })
            return
          }
          const data = (await upstream.json()) as { title?: string; author_name?: string }
          const videoIdMatch = target.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([^&?#/]+)/)
          sendJson(res, 200, {
            title: data.title,
            youtubeId: videoIdMatch?.[1],
            author: data.author_name,
          })
          return
        }

        if (parsed.pathname === '/api/youtube/playlist') {
          const listId = parsed.searchParams.get('list')
          if (!listId) {
            sendJson(res, 400, { error: 'Missing list' })
            return
          }
          const upstream = await fetch(
            `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(listId)}`,
          )
          if (!upstream.ok) {
            sendJson(res, upstream.status, { error: 'Playlist lookup failed' })
            return
          }
          const xml = await upstream.text()
          const title =
            xml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ||
            `YouTube Playlist (${listId.substring(0, 6)})`
          const entryBlocks = xml.split('<entry>').slice(1)
          const videos = entryBlocks
            .map((entry) => {
              const youtubeId =
                entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ||
                entry.match(/videoId>([^<]+)</)?.[1]
              const name =
                entry.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ||
                youtubeId
              if (!youtubeId || !name) {
                return null
              }
              return { youtubeId, name, durationSeconds: 180 }
            })
            .filter((video): video is { youtubeId: string; name: string; durationSeconds: number } =>
              Boolean(video),
            )
          sendJson(res, 200, { listId, title, videos })
          return
        }

        sendJson(res, 404, { error: 'Not found' })
      } catch (error) {
        sendJson(res, 502, {
          error: error instanceof Error ? error.message : 'YouTube proxy failed',
        })
      }
    })()
  }

  return {
    name: 'youtube-metadata-proxy',
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
  plugins: [react(), tailwindcss(), serveAssetsAudioPlugin(), youtubeMetadataProxyPlugin()],
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'node_modules',
        'dist',
        '.features-gen',
        'e2e',
      ],
    },
  },
})
