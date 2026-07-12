import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { getActiveScenePath } from '../../../src/lib/storage/db'
import {
  addSceneEffectSeed,
  addSceneSoundscapeSeed,
  attachTrackToLevel,
  clearSeedData,
  createSceneSeed,
  createSoundscapeCategorySeed,
  createTrackSeed,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

Given('the app is playing a soundscape and a soundboard effect', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Audio Test' })
  const categoryId = await createSoundscapeCategorySeed(page, 'Weather')
  const trackId = await createTrackSeed(page, { name: 'Rain' })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await addSceneSoundscapeSeed(page, sceneId, 'Weather')
  await addSceneEffectSeed(page, sceneId, 'Thunder')
  await page.goto(getActiveScenePath(sceneId))
  await page.locator('[data-category-name="Weather"] button[aria-label^="Play "]').click()
  await page.getByTestId('soundboard-tab').click()
  await page.locator('[data-effect-name="Thunder"] button[aria-label^="Play "]').click()
})

When('the browser receives an audio interruption (e.g., another tab takes exclusive audio focus)', async ({ page }) => {
  await page.evaluate(() => window.__arcanumSimulateAudioInterruption?.(0))
})

Given('the app is playing audio loops on the Active Scene screen', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Loop Test' })
  const categoryId = await createSoundscapeCategorySeed(page, 'Weather')
  const trackId = await createTrackSeed(page, { name: 'Rain' })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await addSceneSoundscapeSeed(page, sceneId, 'Weather')
  await page.goto(getActiveScenePath(sceneId))
  await page.locator('[data-category-name="Weather"] button[aria-label^="Play "]').click()
})

When(/^an audio interruption lasts for (.+)$/, async ({ page }, duration: string) => {
  const ms = parseDuration(duration)
  await page.evaluate((durationMs) => window.__arcanumSimulateAudioInterruption?.(durationMs), ms)
})

When('audio focus is regained', async ({ page }) => {
  await page.evaluate(() => window.__arcanumRegainAudioFocus?.())
})

When('I switch to another browser tab', async ({ page }) => {
  await page.evaluate(() => window.__arcanumSwitchToBackgroundTab?.())
})

Given('the app is playing a soundscape loop', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Media Session' })
  const categoryId = await createSoundscapeCategorySeed(page, 'Weather')
  const trackId = await createTrackSeed(page, { name: 'Rain' })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await addSceneSoundscapeSeed(page, sceneId, 'Weather')
  await page.goto(getActiveScenePath(sceneId))
  await page.locator('[data-category-name="Weather"] button[aria-label^="Play "]').click()
})

When('I view the browser media controls (OS media overlay or browser media hub)', async ({ page }) => {
  const title = await page.evaluate(() => navigator.mediaSession?.metadata?.title ?? '')
  expect(title.length).toBeGreaterThan(0)
})

Then('the media controls display a player for Arcanum Audio', async ({ page }) => {
  const album = await page.evaluate(() => navigator.mediaSession?.metadata?.album ?? '')
  expect(album).toBe('Arcanum Audio')
})

Then('they show the currently playing scene and master track information', async ({ page }) => {
  const artist = await page.evaluate(() => navigator.mediaSession?.metadata?.artist ?? '')
  expect(artist.length).toBeGreaterThan(0)
})

Given('the Media Session controls are active', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Media Pause' })
  const categoryId = await createSoundscapeCategorySeed(page, 'Weather')
  const trackId = await createTrackSeed(page, { name: 'Rain' })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await addSceneSoundscapeSeed(page, sceneId, 'Weather')
  await page.goto(getActiveScenePath(sceneId))
  await page.locator('[data-category-name="Weather"] button[aria-label^="Play "]').click()
})

When('I tap pause on the media controls', async ({ page }) => {
  await page.evaluate(() => {
    window.__arcanumAudioEngine?.pauseAllForSystemEvent?.()
  })
})

Then('all playing audio in the app pauses immediately', async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumIsPlaying?.() ?? true)).toBe(false)
})

Then('the app visually reflects the paused state on the active playing cards', async ({ page }) => {
  await expect(page.locator('[data-testid="soundscapes-list"]')).not.toContainText('● PLAYING')
})

Then('the previously playing loops and soundscapes resume automatically', async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)).toBe(true)
})

Then('the app remains paused', async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumIsPlaying?.() ?? true)).toBe(false)
})

Then('requires a manual play to resume the soundscape', async ({ page }) => {
  await expect(page.locator('[data-category-name="Weather"] button[aria-label^="Play "]')).toBeVisible()
})

Then('the soundscape loops continue playing without interruption', async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)).toBe(true)
})

Then('the app audio pauses', async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumIsPlaying?.() ?? true)).toBe(false)
})

function parseDuration(text: string): number {
  const normalized = text.trim().toLowerCase()
  const minuteMatch = normalized.match(/(\d+)\s*minutes?(?:\s+and\s+(\d+)\s*seconds?)?/)
  if (minuteMatch) {
    const minutes = Number.parseInt(minuteMatch[1], 10)
    const seconds = minuteMatch[2] ? Number.parseInt(minuteMatch[2], 10) : 0
    return minutes * 60_000 + seconds * 1000
  }
  return 0
}
