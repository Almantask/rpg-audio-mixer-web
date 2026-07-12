import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addSceneSoundscapeSeed,
  attachTrackToLevel,
  clearSeedData,
  createSceneSeed,
  createSoundscapeCategorySeed,
  createTrackSeed,
  getSceneIdByName,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

Given(
  /^I have opened the "([^"]+)" scene on the Active Scene — Soundscapes tab$/,
  async ({ page }, sceneName: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: sceneName })
    await page.goto(`/scenes/${sceneId}`)
    await page.getByTestId('soundscapes-tab').click()
  },
)

Given(/^the "([^"]+)" and "([^"]+)" categories are configured but idle$/, async ({ page }, a: string, b: string) => {
  const sceneId = await getSceneIdByName(page, 'Tavern')
  for (const name of [a, b]) {
    const categoryId = await createSoundscapeCategorySeed(page, name)
    const trackId = await createTrackSeed(page, { name: `${name} Track` })
    await attachTrackToLevel(page, categoryId, 2, trackId)
    await addSceneSoundscapeSeed(page, sceneId, name)
  }
})

When(/^I tap the d20 button on "([^"]+)"$/, async ({ page }, categoryName: string) => {
  await page
    .locator(`[data-category-name="${categoryName}"]`)
    .getByTestId('category-d20-button')
    .click()
})

Then(/^both category cards show the playing state$/, async ({ page }) => {
  await expect(page.locator('[data-playing="true"]')).toHaveCount(2)
})

Then(/^the d20 button on "([^"]+)" should be disabled$/, async ({ page }, categoryName: string) => {
  await expect(
    page.locator(`[data-category-name="${categoryName}"]`).getByTestId('category-d20-button'),
  ).toBeDisabled()
})

Then(/^a random track from each category's current intensity pool begins playing$/, async ({ page }) => {
  await expect(page.locator('[data-playing="true"]').first()).toBeVisible()
})

Then(/^"([^"]+)" continues playing in the "([^"]+)" category$/, async ({ page }, track: string, category: string) => {
  await expect(page.locator(`[data-category-name="${category}"]`)).toContainText(track)
})

Then(/^one of (.+) begins playing$/, async ({ page }, tracksList: string) => {
  const tracks = tracksList.replace(/"/g, '').split(',').map((item) => item.trim())
  const card = page.locator('[data-playing="true"]').first()
  await expect(card).toBeVisible()
  const text = await card.textContent()
  expect(tracks.some((track) => text?.includes(track))).toBeTruthy()
})

When(/^I invoke Media Session "Next Track"$/, async ({ page }) => {
  await page.evaluate(() => window.__arcanumInvokeMediaSessionNext?.())
})
