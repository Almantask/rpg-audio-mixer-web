/**
 * Capture product screenshots for README.md.
 *
 * Prerequisites: `npm run dev` on http://127.0.0.1:5173 and Playwright Chromium.
 * Usage: `npm run screenshots:readme`
 *
 * Optionally compress afterwards (keeps GitHub README payload small):
 *   pngquant --quality=70-90 --ext .png --force docs/screenshots/*.png
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const OUT_DIR = path.resolve('docs/screenshots')
const VIEWPORT = { width: 1440, height: 900 }

const DEMO_CAMPAIGN_ID = 'campaign-demo-adventure'
const DEMO_SESSION_ID = 'session-campaign-demo-adventure-1'
const DEMO_SCENE_ID = 'scene-the-ancient-gate'

async function waitForAppReady(page, locator) {
  await page.waitForLoadState('networkidle')
  await page.locator('[data-testid="sidebar"]').waitFor({ state: 'visible' })
  if (locator) {
    await page.locator(locator).first().waitFor({ state: 'visible', timeout: 15_000 })
  }
  // Let Cinzel/Figtree webfonts settle so serif headings are not fallback-faced.
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }
  })
  await page.waitForTimeout(250)
}

async function screenshot(page, name, { fullPage = false } = {}) {
  const filePath = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({
    path: filePath,
    fullPage,
    animations: 'disabled',
    caret: 'hide',
  })
  console.log(`wrote ${path.relative(process.cwd(), filePath)}`)
}

async function seedPlayStats(page) {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return
    const data = JSON.parse(raw)
    const forest = (data.soundscapeCategories ?? []).find((c) => c.name === 'Forest')
    const dragon = (data.fxTracks ?? []).find((t) => /dragon/i.test(t.name))
    const fx = dragon ?? data.fxTracks?.[0]
    data.playStats = {
      soundscapeCategories: forest ? { [forest.id]: 42 } : {},
      fxTracks: fx ? { [fx.id]: 128 } : {},
    }
    localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
  })
}

async function seedTrashSample(page) {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return
    const data = JSON.parse(raw)
    const deletedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const extraCampaign = {
      id: 'campaign-readme-trashed',
      name: 'Shadows of the Underdark',
      description: 'Retired after the party sealed the gate.',
      createdAt: deletedAt,
      lastPlayedAt: deletedAt,
      deletedAt,
    }
    if (!data.campaigns.some((c) => c.id === extraCampaign.id)) {
      data.campaigns.push(extraCampaign)
    }
    localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
  })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({
    args: ['--font-render-hinting=none'],
  })
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  })

  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-testid="active-campaign-hero"]')
  await seedPlayStats(page)
  await page.reload({ waitUntil: 'networkidle' })
  await waitForAppReady(page, 'text=Demo Adventure')

  await screenshot(page, 'home')

  await page.goto(`${BASE_URL}/campaigns`, { waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-campaign-card="Demo Adventure"]')
  await screenshot(page, 'campaigns')

  await page.goto(`${BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/sessions`, {
    waitUntil: 'networkidle',
  })
  await waitForAppReady(page, '[data-session-card="Session 1"]')
  await screenshot(page, 'sessions')

  await page.goto(
    `${BASE_URL}/campaigns/${DEMO_CAMPAIGN_ID}/sessions/${DEMO_SESSION_ID}/scenes`,
    { waitUntil: 'networkidle' },
  )
  await waitForAppReady(page, '[data-session-scene-card="The Ancient Gate"]')
  await screenshot(page, 'session-scenes')

  await page.goto(`${BASE_URL}/scenes`, { waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-scene-card="The Ancient Gate"]')
  await screenshot(page, 'scenes')

  await page.goto(`${BASE_URL}/scenes/${DEMO_SCENE_ID}/active`, { waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-soundscape-track-title="Forest"]')
  await screenshot(page, 'active-scene-soundscapes')

  await page.locator('[data-active-scene-tab="Soundboard"]').click()
  await page.locator('[data-soundboard-grid]').waitFor({ state: 'visible', timeout: 10_000 })
  await page.waitForTimeout(250)
  await screenshot(page, 'active-scene-soundboard')

  await page.goto(`${BASE_URL}/library?tab=soundscapes`, { waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-sc-card="Forest"]')
  await screenshot(page, 'library-soundscapes')

  await page.goto(`${BASE_URL}/library?tab=fx`, { waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-fx-card]')
  await screenshot(page, 'library-fx')

  await page.goto(`${BASE_URL}/library?tab=tracks`, { waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-track-card]')
  await screenshot(page, 'library-tracks')

  await page.goto(`${BASE_URL}/library/soundscapes/category-forest/compose`, {
    waitUntil: 'networkidle',
  })
  await waitForAppReady(page, 'text=Category Composer')
  await screenshot(page, 'category-composer')

  await page.goto(`${BASE_URL}/trash`, { waitUntil: 'networkidle' })
  await waitForAppReady(page)
  await seedTrashSample(page)
  await page.reload({ waitUntil: 'networkidle' })
  await waitForAppReady(page, '[data-trashed-campaign="Shadows of the Underdark"]')
  await screenshot(page, 'trash')

  await page.goto(`${BASE_URL}/credits`, { waitUntil: 'networkidle' })
  await waitForAppReady(page, 'text=Support Development')
  await screenshot(page, 'credits')

  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
