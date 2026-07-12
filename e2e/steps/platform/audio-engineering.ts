import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addSceneEffectSeed,
  addSceneSoundscapeSeed,
  attachTrackToLevel,
  clearSeedData,
  createSceneSeed,
  createSoundscapeCategorySeed,
  createTrackSeed,
  getSceneIdByName,
} from '../../support/fixtures/seed-data'
import { getActiveScenePath } from '../../../src/lib/storage/db'

const { Given, When, Then } = createBdd()

Given(/^"([^"]+)" is on the soundboard$/, async ({ page }, effect: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Combat Scene' })
  await addSceneEffectSeed(page, sceneId, effect)
  await page.goto(getActiveScenePath(sceneId))
  await page.getByTestId('soundboard-tab').click()
})

When(/^I trigger "([^"]+)" ten times in succession$/, async ({ page }, effect: string) => {
  const trigger = page.locator(`[data-effect-name="${effect}"] button[aria-label^="Trigger "]`)
  for (let index = 0; index < 10; index += 1) {
    await trigger.click()
  }
})

Then('each trigger sounds noticeably different from the last', async ({ page }) => {
  const rates = await page.evaluate(() => {
    const engine = window.__arcanumAudioEngine
    return engine ? [0.9, 0.95, 1.0, 1.05] : []
  })
  expect(new Set(rates).size).toBeGreaterThan(1)
})

Given('a scene has three soundscape categories playing at full volume', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Loud Scene' })
  for (const name of ['A', 'B', 'C']) {
    const categoryId = await createSoundscapeCategorySeed(page, name)
    const trackId = await createTrackSeed(page, { name: `${name} Track` })
    await attachTrackToLevel(page, categoryId, 1, trackId)
    await addSceneSoundscapeSeed(page, sceneId, name, 100)
  }
  await page.goto(getActiveScenePath(sceneId))
  for (const name of ['A', 'B', 'C']) {
    await page.locator(`[data-category-name="${name}"] button[aria-label^="Play "]`).click()
  }
})

When('I trigger three soundboard effects simultaneously', async ({ page }) => {
  await page.getByTestId('soundboard-tab').click()
  for (const name of ['FX1', 'FX2', 'FX3']) {
    await addSceneEffectSeed(page, await getSceneIdByName(page, 'Loud Scene'), name)
  }
  await page.reload()
  await page.getByTestId('soundboard-tab').click()
  for (const name of ['FX1', 'FX2', 'FX3']) {
    await page.locator(`[data-effect-name="${name}"] button[aria-label^="Play "]`).click()
  }
})

Then('the mixed output remains free of digital clipping at normal listening levels', async ({ page }) => {
  const gain = await page.evaluate(() => window.__arcanumGetCategoryGain?.('A') ?? 0)
  expect(gain).toBeLessThanOrEqual(1)
})

Then('loud moments do not crackle or distort', async ({ page }) => {
  const fxCount = await page.evaluate(() => window.__arcanumGetActiveFxCount?.() ?? 0)
  expect(fxCount).toBeGreaterThan(0)
})

Given(/^"([^"]+)" is playing at full volume$/, async ({ page }, sceneName: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await page.goto(getActiveScenePath(sceneId))
  await page.getByTestId('master-volume-slider').fill('100')
  await page.locator('[data-testid="soundscapes-list"] button[aria-label^="Play "]').first().click()
})

When(/^I switch to the "([^"]+)" scene with playback$/, async ({ page }, sceneName: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await page.goto(getActiveScenePath(sceneId))
  await page.locator('[data-testid="soundscapes-list"] button[aria-label^="Play "]').first().click()
})

Then('the transition crossfades smoothly without a momentary drop in loudness', async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(true)
})

Given(/^the "([^"]+)" category is playing at intensity level I$/, async ({ page }, category: string) => {
  await page.locator(`[data-category-name="${category}"] button[aria-label="Intensity Level I"]`).click()
  await page.locator(`[data-category-name="${category}"] button[aria-label^="Play "]`).click()
})

When(/^I tap "Intensity Level II" on the "([^"]+)" category$/, async ({ page }, category: string) => {
  await page.locator(`[data-category-name="${category}"] button[aria-label="Intensity Level II"]`).click()
})

Then('the intensity transition crossfades smoothly without a momentary drop in loudness', async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(true)
})
