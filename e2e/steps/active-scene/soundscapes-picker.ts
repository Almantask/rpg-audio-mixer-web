import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  attachTrackToLevel,
  clearSeedData,
  createSceneSeed,
  createSoundscapeCategorySeed,
  createTrackSeed,
  getSceneIdByName,
  setCategoryTypeSeed,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function openSceneSoundscapesTab(page: Page, sceneId: string): Promise<void> {
  await page.goto(`/scenes/${sceneId}`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByTestId('soundscapes-tab')).toHaveAttribute('data-state', 'active')
}

function soundscapePicker(page: Page): Locator {
  return page.getByTestId('soundscape-picker-modal')
}

function pickerCard(page: Page, name: string): Locator {
  return page.locator('[data-testid="soundscape-picker-card"]', {
    has: page.locator(`[data-category-name="${name}"]`),
  })
}

Given('I am on the Active Scene — Soundscapes tab', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Forest Ambush' })
  await openSceneSoundscapesTab(page, sceneId)
})

Given('the Add Soundscape picker modal is open', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Forest Ambush' })
  await openSceneSoundscapesTab(page, sceneId)
  await page.getByTestId('add-soundscape-button').click()
  await expect(soundscapePicker(page)).toBeVisible()
})

Given('my library has no soundscape categories', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
})

Given(/^my library has the categories "([^"]+)" and "([^"]+)"$/, async ({ page }, a: string, b: string) => {
  await page.goto('/')
  await clearSeedData(page)
  for (const name of [a, b]) {
    const categoryId = await createSoundscapeCategorySeed(page, name)
    const trackId = await createTrackSeed(page, { name: `${name} Track`, duration: '1:00' })
    await attachTrackToLevel(page, categoryId, 1, trackId)
  }
})

Given(/^my library has the category "([^"]+)" with at least one track$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, name)
  const trackId = await createTrackSeed(page, { name: `${name} Track`, duration: '1:00' })
  await attachTrackToLevel(page, categoryId, 1, trackId)
})

Given(/^my library has categories of different types$/, async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  for (const [name, type] of [
    ['Weather', 'Ambience'],
    ['Tavern', 'Interior'],
  ] as const) {
    const categoryId = await createSoundscapeCategorySeed(page, name)
    await setCategoryTypeSeed(page, categoryId, type)
    const trackId = await createTrackSeed(page, { name: `${name} Track` })
    await attachTrackToLevel(page, categoryId, 1, trackId)
  }
})

Given(/^my library has the category "([^"]+)"$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, name)
  const trackId = await createTrackSeed(page, { name: `${name} Track` })
  await attachTrackToLevel(page, categoryId, 1, trackId)
})

Given(/^"([^"]+)" is not yet in the current scene$/, async () => {
  // Exclusion is enforced by empty scene seed in picker scenarios.
})

Given(/^no categories are checked in the picker$/, async ({ page }) => {
  await expect(page.getByTestId('soundscape-picker-card').getByRole('checkbox', { checked: true })).toHaveCount(0)
})

Given(/^"([^"]+)" is already in the current scene$/, async ({ page }, name: string) => {
  const sceneId = await getSceneIdByName(page, 'Forest Ambush')
  await page.evaluate(
    async ({ sid, categoryName }) => {
      await window.__arcanumAddSceneSoundscape?.(sid, categoryName)
    },
    { sid: sceneId, categoryName: name },
  )
})

Given(/^my library has the category "([^"]+)" with (\d+) tracks across (\d+) layers$/, async ({ page }, name: string, tracks: string, layers: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, name)
  const total = Number.parseInt(tracks, 10)
  const layerCount = Number.parseInt(layers, 10)
  for (let level = 1; level <= layerCount; level += 1) {
    const perLayer = Math.ceil(total / layerCount)
    for (let index = 0; index < perLayer && (level - 1) * perLayer + index < total; index += 1) {
      const trackId = await createTrackSeed(page, { name: `${name} ${level}-${index}` })
      await attachTrackToLevel(page, categoryId, level as 1 | 2 | 3, trackId)
    }
  }
})

Given(/^my library has the category "([^"]+)" with no tracks at any intensity level$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createSoundscapeCategorySeed(page, name)
})

When('I open the Add Soundscape picker modal', async ({ page }) => {
  await page.getByTestId('add-soundscape-button').click()
  await expect(soundscapePicker(page)).toBeVisible()
})

When(/^I set the Category Type filter to "([^"]+)" in the picker$/, async ({ page }, type: string) => {
  await page.getByTestId('picker-category-type-filter').selectOption(type)
})

Then('I see the Add Soundscape picker modal', async ({ page }) => {
  await expect(soundscapePicker(page)).toBeVisible()
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Import' })).toHaveCount(0)
})

Then('I do not see an "Add Soundscape" creation card in the picker grid', async ({ page }) => {
  await expect(page.getByTestId('add-soundscape-card')).toHaveCount(0)
})

Then('I see a centred empty-state illustration', async ({ page }) => {
  await expect(page.getByTestId('soundscape-picker-empty')).toBeVisible()
})

Then('I do not see an enabled "Add Selected" button', async ({ page }) => {
  await expect(page.getByTestId('picker-add-selected')).toBeDisabled()
})

Then('the picker grid shows a loading state', async ({ page }) => {
  await expect(page.getByRole('status', { name: 'Loading picker items' })).toBeVisible()
})

Then('preview playback stops', async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(false)
})

Then('I see the Active Scene — Soundscapes tab', async ({ page }) => {
  await expect(page.getByTestId('soundscapes-tab')).toHaveAttribute('data-state', 'active')
  await expect(soundscapePicker(page)).toHaveCount(0)
})

Then(/^"([^"]+)" and "([^"]+)" are present as category cards$/, async ({ page }, a: string, b: string) => {
  await expect(page.locator(`[data-category-name="${a}"]`)).toBeVisible()
  await expect(page.locator(`[data-category-name="${b}"]`)).toBeVisible()
})

Then(/^I see the "([^"]+)" category in the picker grid$/, async ({ page }, name: string) => {
  await expect(pickerCard(page, name)).toBeVisible()
})

Then(/^I do not see the "([^"]+)" category in the picker grid$/, async ({ page }, name: string) => {
  await expect(pickerCard(page, name)).toHaveCount(0)
})

Then('I see only matching categories in the picker grid', async ({ page }) => {
  await expect(page.getByTestId('soundscape-picker-card')).toHaveCount(1)
  await expect(pickerCard(page, 'Weather')).toBeVisible()
})

Then(/^a sample track from "([^"]+)" begins previewing$/, async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(true)
})

Then(/^the "([^"]+)" card shows it is previewing$/, async ({ page }, name: string) => {
  await expect(pickerCard(page, name)).toHaveAttribute('data-previewing', 'true')
})

Then(/^the "([^"]+)" card no longer shows it is previewing$/, async ({ page }, name: string) => {
  await expect(pickerCard(page, name)).toHaveAttribute('data-previewing', 'false')
})

Then(/^I can select "([^"]+)" for addition to the scene from the picker grid$/, async ({ page }, name: string) => {
  await expect(pickerCard(page, name).getByRole('checkbox')).toBeEnabled()
})

Then(/^"([^"]+)" cannot be added instantly from its card$/, async ({ page }, name: string) => {
  await expect(pickerCard(page, name).getByRole('button', { name: /^Add / })).toHaveCount(0)
})

Then(/^"([^"]+)" and "([^"]+)" appear in the active scene's Soundscapes tab$/, async ({ page }, a: string, b: string) => {
  await expect(page.locator(`[data-category-name="${a}"]`)).toBeVisible()
  await expect(page.locator(`[data-category-name="${b}"]`)).toBeVisible()
})

Then(/^"([^"]+)" appears before "([^"]+)" in the category list$/, async ({ page }, first: string, second: string) => {
  const names = await page.locator('[data-testid="scene-soundscape-card"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-category-name')),
  )
  expect(names.indexOf(first)).toBeLessThan(names.indexOf(second))
})

Then(/^"([^"]+)" is added to the active scene$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-category-name="${name}"]`)).toBeVisible()
})

Then('the Add Soundscape picker modal is still open', async ({ page }) => {
  await expect(soundscapePicker(page)).toBeVisible()
})

Then(/^"([^"]+)", "([^"]+)", and "([^"]+)" appear in the active scene's Soundscapes tab$/, async ({ page }, a: string, b: string, c: string) => {
  for (const name of [a, b, c]) {
    await expect(page.locator(`[data-category-name="${name}"]`)).toBeVisible()
  }
})

Then(/^"([^"]+)" is idle and not auto-playing$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-category-name="${name}"]`)).toHaveAttribute('data-playing-state', 'idle')
})

Then(/^"([^"]+)" has volume 100%$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-category-name="${name}"]`)).toHaveAttribute('data-volume', '100%')
})

Then(/^"([^"]+)" has intensity II$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-category-name="${name}"]`)).toHaveAttribute('data-intensity', 'II')
})
