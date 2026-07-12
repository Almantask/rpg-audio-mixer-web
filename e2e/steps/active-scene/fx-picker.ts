import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addSceneEffectSeed,
  clearSeedData,
  createFxTrackSeed,
  createSceneSeed,
  getFxTrackIdByName,
  getSceneIdByName,
  setE2EFlags,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function openSoundboardTab(page: Page, sceneId: string): Promise<void> {
  await page.goto(`/scenes/${sceneId}`)
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
}

function fxPicker(page: Page): Locator {
  return page.getByTestId('fx-picker-modal')
}

function fxPickerCard(page: Page, name: string): Locator {
  return page.locator('[data-testid="fx-picker-card"]', {
    has: page.locator(`[data-effect-name="${name}"]`),
  })
}

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Forest Ambush' })
  await openSoundboardTab(page, sceneId)
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Forest Ambush' })
  await openSoundboardTab(page, sceneId)
  await page.getByTestId('add-sound-button').click()
  await expect(fxPicker(page)).toBeVisible()
})

Given('the FX library has no tracks', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
})

Given('the FX library is still loading', async ({ page }) => {
  await setE2EFlags(page, { fxLoading: true })
})

Given(/^every FX track in my library is already in the current scene's soundboard$/, async ({ page }) => {
  const sceneId = await getSceneIdByName(page, 'Forest Ambush')
  for (const name of ['Thunder Crack', 'Wolf Howl']) {
    const trackId = await createFxTrackSeed(page, { name })
    await addSceneEffectSeed(page, sceneId, name, trackId)
  }
})

Given(/^the FX library has "([^"]+)" and "([^"]+)"$/, async ({ page }, a: string, b: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createFxTrackSeed(page, { name: a, fxType: 'IMPACT', tags: ['Impact'] })
  await createFxTrackSeed(page, { name: b, fxType: 'CREATURE', tags: ['Creature'] })
})

Given(/^the FX library has "([^"]+)" tagged CREATURE and "([^"]+)" tagged IMPACT$/, async ({ page }, creature: string, impact: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createFxTrackSeed(page, { name: creature, fxType: 'CREATURE', tags: ['Creature'] })
  await createFxTrackSeed(page, { name: impact, fxType: 'IMPACT', tags: ['Impact'] })
})

Given(/^the FX library has type IMPACT track "([^"]+)" and type CREATURE track "([^"]+)"$/, async ({ page }, impact: string, creature: string) => {
  await createFxTrackSeed(page, { name: impact, fxType: 'IMPACT' })
  await createFxTrackSeed(page, { name: creature, fxType: 'CREATURE' })
})

Given(/^the FX library has "([^"]+)" at base intensity I and "([^"]+)" at base intensity III$/, async ({ page }, soft: string, loud: string) => {
  await createFxTrackSeed(page, { name: soft, baseIntensity: 1 })
  await createFxTrackSeed(page, { name: loud, baseIntensity: 3 })
})

Given(/^the FX library has "([^"]+)" added before "([^"]+)"$/, async ({ page }, first: string, second: string) => {
  await createFxTrackSeed(page, { name: first })
  await page.waitForTimeout(10)
  await createFxTrackSeed(page, { name: second })
})

Given(/^the FX library has "([^"]+)"$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createFxTrackSeed(page, { name })
})

Given(/^no FX cards are checked in the picker$/, async ({ page }) => {
  await expect(page.getByTestId('fx-picker-card').getByRole('checkbox', { checked: true })).toHaveCount(0)
})

Given(/^"([^"]+)" and "([^"]+)" are not yet in the current scene's soundboard$/, async () => {})

Given(/^"([^"]+)" is already in the current scene's soundboard$/, async ({ page }, name: string) => {
  const sceneId = await getSceneIdByName(page, 'Forest Ambush')
  const trackId = await getFxTrackIdByName(page, name)
  await addSceneEffectSeed(page, sceneId, name, trackId)
})

Given(/^the current scene's soundboard has 3 effect tiles with hotkeys Num 1 through Num 3$/, async ({ page }) => {
  const sceneId = await getSceneIdByName(page, 'Forest Ambush')
  for (const name of ['Tile 1', 'Tile 2', 'Tile 3']) {
    const trackId = await createFxTrackSeed(page, { name })
    await addSceneEffectSeed(page, sceneId, name, trackId)
  }
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  await page.getByTestId('add-sound-button').click()
  await expect(fxPicker(page)).toBeVisible()
})

When(/^I set the FX Types filter to IMPACT in the picker$/, async ({ page }) => {
  await page.getByTestId('picker-fx-type-filter').selectOption('IMPACT')
})

When(/^I set the base intensity filter to "([^"]+)" in the picker$/, async ({ page }, level: string) => {
  const value = level === 'III' ? '3' : level === 'II' ? '2' : '1'
  await page.getByTestId('picker-base-intensity-filter').selectOption(value)
})

When(/^I set the Sort Order to "Name A–Z" in the picker$/, async ({ page }) => {
  await page.getByTestId('picker-sort-order-filter').selectOption('name-asc')
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(fxPicker(page)).toBeVisible()
})

Then(/^I see the picker search bar with placeholder "Search effects…"$/, async ({ page }) => {
  await expect(page.getByTestId('picker-search')).toHaveAttribute('placeholder', 'Search effects…')
})

Then('I see FX Types, Base Intensity, and Sort Order filters for the picker', async ({ page }) => {
  await expect(page.getByTestId('picker-fx-type-filter')).toBeVisible()
  await expect(page.getByTestId('picker-base-intensity-filter')).toBeVisible()
  await expect(page.getByTestId('picker-sort-order-filter')).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  await expect(page.getByTestId('fx-picker-card').first().getByRole('checkbox')).toBeVisible()
})

Then('I do not see a "Buy More" button in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Buy More' })).toHaveCount(0)
})

Then('I do not see a "Free Tracks" button in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Free Tracks' })).toHaveCount(0)
})

Then(/^I see guidance to import or purchase tracks via Library — Sound Effects$/, async ({ page }) => {
  await expect(page.getByText(/Library — Sound Effects/)).toBeVisible()
})

Then('I do not see any FX cards in the picker grid', async ({ page }) => {
  await expect(page.getByTestId('fx-picker-card')).toHaveCount(0)
})

Then(/^the "([^"]+)" card shows a playing state in the picker$/, async ({ page }, name: string) => {
  await expect(fxPickerCard(page, name)).toContainText('● PLAYING')
})

Then(/^the "([^"]+)" card no longer shows a playing state in the picker$/, async ({ page }, name: string) => {
  await expect(fxPickerCard(page, name)).not.toContainText('● PLAYING')
})

Then(/^"([^"]+)" is selected in the picker$/, async ({ page }, name: string) => {
  await expect(fxPickerCard(page, name).getByRole('checkbox')).toBeChecked()
})

Then(/^"([^"]+)" is not previewing in the picker$/, async ({ page }, name: string) => {
  await expect(fxPickerCard(page, name)).toHaveAttribute('data-previewing', 'false')
})

Then(/^"([^"]+)" and "([^"]+)" appear as tiles in the soundboard grid$/, async ({ page }, a: string, b: string) => {
  await expect(page.locator(`[data-effect-name="${a}"]`)).toBeVisible()
  await expect(page.locator(`[data-effect-name="${b}"]`)).toBeVisible()
})

Then(/^"([^"]+)" appears before "([^"]+)" in the soundboard grid$/, async ({ page }, first: string, second: string) => {
  const names = await page.locator('[data-testid="soundboard-tile"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-effect-name')),
  )
  expect(names.indexOf(first)).toBeLessThan(names.indexOf(second))
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(fxPicker(page)).toBeVisible()
})

Then(/^the "([^"]+)" soundboard tile is idle$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-effect-name="${name}"]`)).toHaveAttribute('data-playing-state', 'idle')
})

Then(/^all three effects appear as tiles in the active scene's soundboard$/, async ({ page }) => {
  for (const name of ['Thunder Crack', 'Wolf Howl', 'Sword Clash']) {
    await expect(page.locator(`[data-effect-name="${name}"]`)).toBeVisible()
  }
})

Then(/^the "([^"]+)" tile shows hotkey label "([^"]+)"$/, async ({ page }, name: string, hotkey: string) => {
  await expect(page.locator(`[data-effect-name="${name}"]`)).toHaveAttribute('data-hotkey', hotkey)
})

Then(/^the first 3 effect tiles still show hotkeys Num 1 through Num 3$/, async ({ page }) => {
  await expect(page.locator('[data-hotkey="Num 1"]')).toBeVisible()
  await expect(page.locator('[data-hotkey="Num 2"]')).toBeVisible()
  await expect(page.locator('[data-hotkey="Num 3"]')).toBeVisible()
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.getByTestId('soundboard-tab')).toHaveAttribute('data-state', 'active')
  await expect(fxPicker(page)).toHaveCount(0)
})

Then(/^both "([^"]+)" and "([^"]+)" appear as tiles in the soundboard grid$/, async ({ page }, a: string, b: string) => {
  await expect(page.locator(`[data-effect-name="${a}"]`)).toBeVisible()
  await expect(page.locator(`[data-effect-name="${b}"]`)).toBeVisible()
})

Then(/^"([^"]+)" is still previewing in the picker$/, async ({ page }, name: string) => {
  await expect(fxPickerCard(page, name)).toHaveAttribute('data-previewing', 'true')
})

Then(/^"([^"]+)" previews at its saved default volume$/, async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(true)
})

Then(/^"([^"]+)" appears before "([^"]+)" in the picker grid$/, async ({ page }, first: string, second: string) => {
  const names = await page.getByTestId('fx-picker-card').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-effect-name')),
  )
  expect(names.indexOf(first)).toBeLessThan(names.indexOf(second))
})
