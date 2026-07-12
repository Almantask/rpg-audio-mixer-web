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
  setE2EFlags,
} from '../../support/fixtures/seed-data'
import { getActiveScenePath } from '../../../src/lib/storage/db'

const { Given, When, Then } = createBdd()

Given('a scene references an audio file that cannot be found in app storage', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Missing Audio' })
  await addSceneEffectSeed(page, sceneId, 'Broken Effect')
  await setE2EFlags(page, { playbackFailEffects: ['Broken Effect'] })
  await page.goto(getActiveScenePath(sceneId))
})

When('I attempt to play that track', async ({ page }) => {
  await page.getByTestId('soundboard-tab').click()
  await page.locator('[data-effect-name="Broken Effect"] button[aria-label^="Play "]').click()
})

Then('the overlay shows a descriptive error message', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).not.toHaveText('')
})

Then('I see a dismiss button labelled "Close"', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible()
})

Given(/^"([^"]+)" is playing successfully$/, async ({ page }, category: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Overlay Test' })
  const categoryId = await createSoundscapeCategorySeed(page, category)
  const trackId = await createTrackSeed(page, { name: `${category} Track` })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await addSceneSoundscapeSeed(page, sceneId, category)
  await page.goto(getActiveScenePath(sceneId))
  await page.locator(`[data-category-name="${category}"] button[aria-label^="Play "]`).click()
})

Given('a soundboard effect fails to load', async ({ page }) => {
  await setE2EFlags(page, { playbackFailEffects: ['Broken Effect'] })
  await page.getByTestId('soundboard-tab').click()
  await addSceneEffectSeed(page, await getSceneIdByName(page, 'Overlay Test'), 'Broken Effect')
  await page.locator('[data-effect-name="Broken Effect"] button[aria-label^="Play "]').click()
})

When('the error overlay appears', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).toBeVisible()
})

When('I dismiss the error overlay', async ({ page }) => {
  await page.getByRole('button', { name: 'Close' }).click()
})

Then(/^"([^"]+)" continues playing$/, async ({ page }, category: string) => {
  await expect.poll(async () => page.evaluate((n) => window.__arcanumIsCategoryPlaying?.(n) ?? false, category)).toBe(true)
})

Given('I have unsaved changes in the Category Composer', async ({ page }) => {
  await page.goto('/library')
})

When('saving fails due to a storage error', async ({ page }) => {
  await setE2EFlags(page, { composerSaveFail: true })
  await page.evaluate(() => {
    window.__arcanumShowError?.('Failed to save composer changes due to a storage error.')
  })
})

Then('I see a scrollable error overlay describing the save failure', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).toContainText(/storage error/i)
})

Then('my unsaved composer changes remain visible after I dismiss the overlay', async ({ page }) => {
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
})

Given('the active campaign hero loaded successfully', async ({ page }) => {
  await page.goto('/')
})

Given('the Top Soundscape stat failed to load', async ({ page }) => {
  await setE2EFlags(page, { homeStatLoadFail: true })
})

When('the Home screen finishes loading', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

Then('I see the active campaign hero', async ({ page }) => {
  await expect(page.getByTestId('home-campaign-hero')).toBeVisible()
})

Then('I see a scrollable error overlay describing the stat failure', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).toContainText(/stat/i)
})

Given('the error overlay is visible', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).toBeVisible()
})

When('a soundscape category fails to load', async ({ page }) => {
  await setE2EFlags(page, { playbackFailCategories: ['Weather'] })
  await page.locator('[data-category-name="Weather"] button[aria-label^="Play "]').click()
})

Then('I see a scrollable error overlay describing the soundscape failure', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).toContainText(/Weather|soundscape|category/i)
})

Then('I do not see the previous soundboard error message', async ({ page }) => {
  await expect(page.getByTestId('error-overlay')).not.toContainText('Broken Effect')
})
