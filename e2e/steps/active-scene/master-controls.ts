import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildScene,
  buildSoundscapeCategory,
  buildSceneSoundscapeSlot,
  buildFxTrack,
  buildSoundboardEntry,
  mergeE2EData,
  openActiveScene,
  resetE2EData,
} from '../shared/test-data'

async function tapSoundboardEffect(page: Page, effectName: string) {
  await page
    .locator('[data-soundboard-grid]')
    .locator(`[data-soundboard-tile="${effectName}"]`)
    .first()
    .getByRole('button', { name: `Play ${effectName}`, exact: true })
    .click()
}

const { Given, Then } = createBdd()

Given(
  'I have a scene {string} with {string} and {string} soundscapes',
  async ({ page }, sceneName: string, sc1Name: string, sc2Name: string) => {
    await resetE2EData(page)
    const sceneId = 'scene-battle'
    const sc1 = buildSoundscapeCategory(sc1Name)
    const sc2 = buildSoundscapeCategory(sc2Name)
    const fx = buildFxTrack('Scream')
    
    await mergeE2EData(page, {
      scenes: [buildScene(sceneName, { id: sceneId })],
      soundscapeCategories: [sc1, sc2],
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlot(sceneId, sc1.id, 0),
        buildSceneSoundscapeSlot(sceneId, sc2.id, 1),
      ],
      fxTracks: [fx],
      sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
    })
  }
)

Given('the {string} scene is playing', async ({ page }, sceneName: string) => {
  await openActiveScene(page, sceneName, 'Soundscapes')
  await page.locator('[data-play-scene]').click()
  await page.waitForTimeout(500)
})

Given('I have triggered {string} from the soundboard', async ({ page }, effectName: string) => {
  await page.locator('[data-active-scene-tab="Soundboard"]').click()
  await tapSoundboardEffect(page, effectName)
  await page.locator('[data-active-scene-tab="Soundscapes"]').click()
})

Then('the {string} soundscape should fade out and stop', async ({ page }, categoryName: string) => {
  const playbackState = page.locator(`[data-soundscape-playback-state="${categoryName}"]`)
  await expect(playbackState).toHaveAttribute('data-state', 'idle', { timeout: 5000 })
})

Then('the {string} sound effect should stop immediately', async ({ page }, effectName: string) => {
  await page.locator('[data-active-scene-tab="Soundboard"]').click()
  const tileState = page.locator(`[data-soundboard-tile-state="${effectName}"]`)
  await expect(tileState).toHaveAttribute('data-state', 'idle')
  await page.locator('[data-active-scene-tab="Soundscapes"]').click()
})

Then('the {string} category shows a paused state', async ({ page }, categoryName: string) => {
  const playbackState = page.locator(`[data-soundscape-playback-state="${categoryName}"]`)
  await expect(playbackState).toHaveAttribute('data-state', 'paused')
  await expect(playbackState).toHaveText('Paused')
})

Then('the Master Volume slider position is unchanged', async ({ page }) => {
  const slider = page.locator('[data-soundscape-master-slider]')
  await expect(slider).toBeVisible()
  const val = await slider.inputValue()
  expect(val).toBe('100')
})
