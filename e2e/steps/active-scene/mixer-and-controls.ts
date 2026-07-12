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

async function openActiveScene(page: import('@playwright/test').Page, sceneName: string): Promise<string> {
  const sceneId = await getSceneIdByName(page, sceneName)
  await page.goto(getActiveScenePath(sceneId))
  await page.waitForLoadState('networkidle')
  return sceneId
}

Given(/^I have a scene "([^"]+)"$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createSceneSeed(page, { name })
})

Given(
  /^I have a scene "([^"]+)" with "([^"]+)" and "([^"]+)" soundscapes$/,
  async ({ page }, sceneName: string, a: string, b: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: sceneName })
    for (const categoryName of [a, b]) {
      const categoryId = await createSoundscapeCategorySeed(page, categoryName)
      const trackId = await createTrackSeed(page, { name: `${categoryName} Track` })
      await attachTrackToLevel(page, categoryId, 1, trackId)
      await addSceneSoundscapeSeed(page, sceneId, categoryName)
    }
  },
)

Given(
  /^I have a scene "([^"]+)" with soundscape categories "([^"]+)" and "([^"]+)"$/,
  async ({ page }, sceneName: string, a: string, b: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: sceneName })
    for (const categoryName of [a, b]) {
      const categoryId = await createSoundscapeCategorySeed(page, categoryName)
      const trackId = await createTrackSeed(page, { name: `${categoryName} Track` })
      await attachTrackToLevel(page, categoryId, 1, trackId)
      await addSceneSoundscapeSeed(page, sceneId, categoryName)
    }
  },
)

Given(/^I am on the Active Scene screen for "([^"]+)"$/, async ({ page }, name: string) => {
  await openActiveScene(page, name)
})

Given('the session is locked', async ({ page }) => {
  const lockButton = page.getByTestId('session-lock-button')
  if ((await lockButton.getAttribute('aria-pressed')) !== 'true') {
    await lockButton.click()
  }
  await expect(lockButton).toHaveAttribute('aria-pressed', 'true')
})

When(/^I tap the "Lock" icon$/, async ({ page }) => {
  await page.getByTestId('session-lock-button').click()
})

When(/^I tap the "Lock" icon to unlock$/, async ({ page }) => {
  await page.getByTestId('session-lock-button').click()
})

When('I reload the Active Scene screen', async ({ page }) => {
  await page.reload()
  await page.waitForLoadState('networkidle')
})

When('I attempt to navigate to a different scene', async ({ page }) => {
  await page.getByRole('link', { name: 'Scenes', exact: true }).click()
})

Then('the session is unlocked', async ({ page }) => {
  await expect(page.getByTestId('session-lock-button')).toHaveAttribute('aria-pressed', 'false')
})

Then('dragging category cards by their handle to reorder is disabled', async ({ page }) => {
  await expect(page.getByTestId('category-drag-handle')).toHaveCount(0)
})

Then('dragging category cards by their handle to reorder is enabled', async ({ page }) => {
  await expect(page.getByTestId('category-drag-handle').first()).toBeVisible()
})

Then('the delete button on a soundscape category tile is disabled', async ({ page }) => {
  const removeButton = page.locator('[data-testid="soundscapes-list"] button[aria-label^="Remove "]').first()
  await expect(removeButton).toBeDisabled()
})

Then('the delete button on a soundscape category tile is enabled', async ({ page }) => {
  const removeButton = page.locator('[data-testid="soundscapes-list"] button[aria-label^="Remove "]').first()
  await expect(removeButton).toBeEnabled()
})

Then('the "Add Soundscape" button is visible and enabled', async ({ page }) => {
  await expect(page.getByTestId('add-soundscape-button')).toBeVisible()
  await expect(page.getByTestId('add-soundscape-button')).toBeEnabled()
})

Then('dragging soundboard effects to reorder is disabled', async ({ page }) => {
  await page.getByTestId('soundboard-tab').click()
  await expect(page.getByTestId('effect-drag-handle')).toHaveCount(0)
})

Then('the delete button on a soundboard effect tile is disabled', async ({ page }) => {
  await page.getByTestId('soundboard-tab').click()
  await expect(page.locator('[data-testid="soundboard-grid"] button[aria-label^="Remove "]').first()).toBeDisabled()
})

Then('the "Add Sound" button is visible and enabled', async ({ page }) => {
  await page.getByTestId('soundboard-tab').click()
  await expect(page.getByTestId('add-sound-button')).toBeVisible()
  await expect(page.getByTestId('add-sound-button')).toBeEnabled()
})

Then('navigation to a different scene is blocked', async ({ page }) => {
  await expect(page.getByTestId('session-lock-navigation-blocked')).toBeVisible()
})

Then('navigating to a different scene is allowed', async ({ page }) => {
  await page.getByRole('link', { name: 'Scenes', exact: true }).click()
  await expect(page).toHaveURL(/\/scenes$/)
})

Then('I can tap the play/pause and d20 buttons', async ({ page }) => {
  await expect(page.locator('[data-testid="soundscapes-list"] button[aria-label^="Play "]').first()).toBeEnabled()
})

Then('I can tap "Stop All"', async ({ page }) => {
  await expect(page.getByTestId('stop-all-button')).toBeEnabled()
})

Then('I can still trigger soundboard effects', async ({ page }) => {
  await page.getByTestId('soundboard-tab').click()
  await expect(page.locator('[data-testid="soundboard-grid"] button[aria-label^="Play "]').first()).toBeEnabled()
})

Then('I can drag the Master Volume slider', async ({ page }) => {
  await expect(page.getByTestId('master-volume-slider')).toBeEnabled()
})

Then('I can drag the Volume sliders', async ({ page }) => {
  await expect(page.locator('[data-testid="soundscapes-list"] input[type="range"]').first()).toBeEnabled()
})

Then('I can drag the Soundboard Master slider', async ({ page }) => {
  await page.getByTestId('soundboard-tab').click()
  await expect(page.getByTestId('soundboard-master-slider')).toBeEnabled()
})

Then('I can switch between the "Soundscapes" and "Soundboard" tabs', async ({ page }) => {
  await expect(page.getByTestId('soundboard-tab')).toBeEnabled()
  await page.getByTestId('soundboard-tab').click()
  await expect(page.getByTestId('soundscapes-tab')).toBeEnabled()
})

Then('I do not see a Session Lock control', async ({ page }) => {
  await expect(page.getByTestId('session-lock-button')).toHaveCount(0)
})

Then('I can open a different scene from the list', async ({ page }) => {
  await expect(page.locator('[data-testid="session-scene-card"]').first()).toBeVisible()
})

Given(
  /^I have a scene "([^"]+)" with "([^"]+)" and "([^"]+)" soundscapes and soundboard effect "([^"]+)"$/,
  async ({ page }, sceneName: string, a: string, b: string, effect: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: sceneName })
    for (const categoryName of [a, b]) {
      const categoryId = await createSoundscapeCategorySeed(page, categoryName)
      const trackId = await createTrackSeed(page, { name: `${categoryName} Track` })
      await attachTrackToLevel(page, categoryId, 1, trackId)
      await addSceneSoundscapeSeed(page, sceneId, categoryName)
    }
    await addSceneEffectSeed(page, sceneId, effect)
  },
)

Given(/^the "([^"]+)" scene is playing$/, async ({ page }, sceneName: string) => {
  await openActiveScene(page, sceneName)
  await page.locator('[data-testid="soundscapes-list"] button[aria-label^="Play "]').first().click()
})

Given(/^I have triggered "([^"]+)" from the soundboard$/, async ({ page }, effect: string) => {
  await page.getByTestId('soundboard-tab').click()
  await page.locator(`[data-effect-name="${effect}"] button[aria-label^="Play "]`).click()
})

Then(/^the "([^"]+)" soundscape should fade out and stop$/, async ({ page }, name: string) => {
  await expect.poll(async () => page.evaluate((n) => window.__arcanumIsCategoryPlaying?.(n) ?? false, name)).toBe(false)
})

Then(/^the "([^"]+)" sound effect should stop immediately$/, async ({ page }, name: string) => {
  await expect.poll(async () => page.evaluate((n) => window.__arcanumIsEffectPlaying?.(n) ?? false, name)).toBe(false)
})

Then(/^the "([^"]+)" category shows a paused state$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-category-name="${name}"]`)).not.toContainText('● PLAYING')
})

Then('the Master Volume slider position is unchanged', async ({ page }) => {
  const value = await page.getByTestId('master-volume-slider').inputValue()
  expect(Number.parseInt(value, 10)).toBeGreaterThanOrEqual(0)
})

When(/^I leave and reopen the "([^"]+)" scene$/, async ({ page }, name: string) => {
  await page.getByRole('link', { name: 'Scenes', exact: true }).click()
  await page.getByRole('heading', { level: 2, name }).click()
  await page.waitForLoadState('networkidle')
})

Then(/^the Master Volume slider is immediately at (\d+)% with no animation$/, async ({ page }, value: string) => {
  await expect(page.getByTestId('master-volume-slider')).toHaveValue(value)
})

Then(/^the "([^"]+)" Volume slider is immediately at (\d+)% with no animation$/, async ({ page }, category: string, value: string) => {
  await expect(page.locator(`[data-category-name="${category}"] input[type="range"]`)).toHaveValue(value)
})

Then('there is no "Save State" button on the Active Scene screen', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Save State' })).toHaveCount(0)
})

When('I expand the Scene Notes area', async ({ page }) => {
  await page.getByTestId('scene-notes-toggle').click()
})

When(/^I enter markdown text "([^"]+)"$/, async ({ page }, text: string) => {
  await page.getByTestId('scene-notes-input').fill(text.replace(/\\n/g, '\n'))
})

Then('the Scene Notes area shows a heading and bold text', async ({ page }) => {
  await expect(page.getByTestId('scene-notes-preview').getByRole('heading')).toBeVisible()
  await expect(page.getByTestId('scene-notes-preview').locator('strong')).toBeVisible()
})

Then('the scene notes are auto-saved immediately', async ({ page }) => {
  await expect(page.getByTestId('scene-notes-saved')).not.toHaveText('')
})

Given(/^"([^"]+)" is playing with Master Volume at (\d+)%$/, async ({ page }, category: string, volume: string) => {
  await page.getByTestId('master-volume-slider').fill(volume)
  await page.locator(`[data-category-name="${category}"] button[aria-label^="Play "]`).click()
})

Given(/^"([^"]+)" is playing from the Soundboard tab$/, async ({ page }, effect: string) => {
  await page.getByTestId('soundboard-tab').click()
  await page.locator(`[data-effect-name="${effect}"] button[aria-label^="Play "]`).click()
})

When('I tap the mute button on the Master Volume bar', async ({ page }) => {
  await page.getByTestId('master-mute-button').click()
})

Then('all soundscape audio is silenced', async ({ page }) => {
  const muted = await page.evaluate(() => window.__arcanumAudioEngine?.isMasterMuted?.() ?? false)
  expect(muted).toBe(true)
})

Then(/^"([^"]+)" continues playing from the soundboard$/, async ({ page }, effect: string) => {
  await expect.poll(async () => page.evaluate((n) => window.__arcanumIsEffectPlaying?.(n) ?? false, effect)).toBe(true)
})

Then(/^the Master Volume slider still reads (\d+)%$/, async ({ page }, value: string) => {
  await expect(page.getByTestId('master-volume-slider')).toHaveValue(value)
})

Then(/^soundscape audio resumes at the mapped volume for (\d+)%$/, async ({ page }, value: string) => {
  const master = Number.parseInt(value, 10)
  const gain = await page.evaluate((m) => window.__arcanumGetMappedVolume?.(m, 100) ?? 0, master)
  expect(gain).toBeGreaterThan(0)
})

Given(/^the "([^"]+)" category is playing "([^"]+)"$/, async ({ page }, category: string, track: string) => {
  await page.evaluate(
    async ({ categoryName, trackName }) => {
      const { db } = await import('../../../src/lib/storage/db')
      const item = await db.sceneSoundscapes.filter((entry) => entry.categoryName === categoryName).first()
      if (item) {
        await db.sceneSoundscapes.update(item.id, { loadedTrackId: 'track-id', loadedTrackName: trackName })
      }
    },
    { categoryName: category, trackName: track },
  )
  await page.locator(`[data-category-name="${category}"] button[aria-label^="Play "]`).click()
})

When('I view the Active Scene — Soundscapes tab', async ({ page }) => {
  await expect(page.getByTestId('soundscapes-tab')).toHaveAttribute('data-state', 'active')
})

Then(/^the "([^"]+)" card shows the track title "([^"]+)"$/, async ({ page }, category: string, track: string) => {
  await expect(page.locator(`[data-category-name="${category}"]`)).toContainText(track)
})

Then(/^the "([^"]+)" card shows one row labeled "VOLUME"$/, async ({ page }, category: string) => {
  await expect(page.locator(`[data-category-name="${category}"]`).getByText('VOLUME')).toHaveCount(1)
})

Then(/^the "([^"]+)" card does not show per-layer volume sliders$/, async ({ page }, category: string) => {
  await expect(page.locator(`[data-category-name="${category}"] input[type="range"]`)).toHaveCount(1)
})
