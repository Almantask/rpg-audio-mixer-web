import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildScene,
  buildSoundscapeCategory,
  buildSceneSoundscapeSlot,
  buildFxTrack,
  buildSoundboardEntry,
  mergeE2EData,
  openScenes,
  sceneIdForName,
  categoryIdForName,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

Given('{string} has the description {string}', async ({ page }, sceneName: string, description: string) => {
  const sceneId = sceneIdForName(sceneName)
  await mergeE2EData(page, {
    scenes: [buildScene(sceneName, { id: sceneId, description })],
  }, { navigateHome: false })
})


Given('{string} has cover image {string}', async ({ page }, sceneName: string, coverImage: string) => {
  const sceneId = sceneIdForName(sceneName)
  await mergeE2EData(page, {
    scenes: [buildScene(sceneName, { id: sceneId, coverArtUrl: coverImage })],
  }, { navigateHome: false })
})

Given(
  '{string} has {string} soundscape category at Volume {int}%',
  async ({ page }, sceneName: string, categoryName: string, volume: number) => {
    const sceneId = sceneIdForName(sceneName)
    const category = buildSoundscapeCategory(categoryName)
    const slot = buildSceneSoundscapeSlot(sceneId, category.id, 0)
    slot.volume = volume
    
    await mergeE2EData(page, {
      soundscapeCategories: [category],
      sceneSoundscapeSlots: [slot],
    }, { navigateHome: false })
  }
)

Given(
  '{string} has {string} sound effect at Volume {int}%',
  async ({ page }, sceneName: string, effectName: string, volume: number) => {
    const sceneId = sceneIdForName(sceneName)
    const fx = buildFxTrack(effectName)
    const entry = buildSoundboardEntry(sceneId, fx.id, 1)
    
    await mergeE2EData(page, {
      fxTracks: [fx],
      sceneSoundboardEntries: [entry],
      sceneSoundboardSettings: [{ sceneId, masterVolume: volume }],
    }, { navigateHome: false })
  }
)

Given('{string} has {string} tag', async ({ page }, sceneName: string, tag: string) => {
  const sceneId = sceneIdForName(sceneName)
  await mergeE2EData(page, {
    scenes: [buildScene(sceneName, { id: sceneId, tags: [tag] })],
  }, { navigateHome: false })
})

When('I tap the duplicate icon on the {string} scene card', async ({ page }, sceneName: string) => {
  await openScenes(page)
  await page.locator(`[data-duplicate-scene="${sceneName}"]`).click()
})

Then('no duplicate-name dialog is shown', async ({ page }) => {
  const dialog = page.locator('role=dialog')
  await expect(dialog).toHaveCount(0)
})

Given('I have duplicated the {string} scene', async ({ page }, sceneName: string) => {
  await openScenes(page)
  await page.locator(`[data-duplicate-scene="${sceneName}"]`).click()
})

Then(
  'the {string} scene has {string} at Volume {int}%',
  async ({ page }, sceneName: string, categoryName: string, volume: number) => {
    const title = page.locator('[data-screen="Active Scene screen"] h2')
    if (await title.count() === 0 || (await title.innerText()) !== sceneName) {
      await openScenes(page)
      await page.locator(`[data-scene-body="${sceneName}"]`).click()
      await page.waitForLoadState('networkidle')
    }
    
    await page.locator('[data-active-scene-tab="Soundscapes"]').click()
    
    const volLabel = page.locator(`[data-soundscape-volume="${categoryName}"]`)
    await expect(volLabel).toHaveText(`${volume}%`)
  }
)

Then('the {string} scene has {string} sound effect', async ({ page }, sceneName: string, effectName: string) => {
  const title = page.locator('[data-screen="Active Scene screen"] h2')
  if (await title.count() === 0 || (await title.innerText()) !== sceneName) {
    await openScenes(page)
    await page.locator(`[data-scene-body="${sceneName}"]`).click()
    await page.waitForLoadState('networkidle')
  }
  
  await page.locator('[data-active-scene-tab="Soundboard"]').click()
  
  await expect(page.locator(`[data-soundboard-tile-state="${effectName}"]`)).toBeVisible()
})

Then('the {string} scene has {string} tag', async ({ page }, sceneName: string, tag: string) => {
  await openScenes(page)
  const badge = page.locator(`[data-scene-card="${sceneName}"] [data-scene-tag="${tag}"]`)
  await expect(badge).toBeVisible()
})


Then('the {string} scene has cover image {string}', async ({ page }, sceneName: string, coverImage: string) => {
  await openScenes(page)
  const coverDiv = page.locator(`[data-scene-cover="${sceneName}"] img`)
  await expect(coverDiv).toHaveAttribute('src', coverImage)
})

When(
  'I add {string} to the {string} soundscape categories',
  async ({ page }, categoryName: string, sceneName: string) => {
    const hasCategory = await page.evaluate((name) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      if (!raw) return false
      const data = JSON.parse(raw)
      return data.soundscapeCategories?.some((c: { name: string }) => c.name === name)
    }, categoryName)

    if (!hasCategory) {
      await mergeE2EData(page, {
        soundscapeCategories: [buildSoundscapeCategory(categoryName)],
      }, { navigateHome: false })
      await page.reload()
      await page.waitForLoadState('networkidle')
    }

    const title = page.locator('[data-screen="Active Scene screen"] h2')
    if (await title.count() === 0 || (await title.innerText()) !== sceneName) {
      await openScenes(page)
      await page.locator(`[data-scene-body="${sceneName}"]`).click()
      await page.waitForLoadState('networkidle')
    }
    
    await page.locator('[data-active-scene-tab="Soundscapes"]').click()
    await page.locator('[data-soundscape-add]').click()
    await page.locator(`[data-sc-picker-check="${categoryIdForName(categoryName)}"]`).check()
    await page.locator('[data-picker-commit]').click()
    await page.waitForTimeout(200)
  }
)

Then('the original {string} scene does not contain {string}', async ({ page }, sceneName: string, categoryName: string) => {
  await openScenes(page)
  await page.locator(`[data-scene-body="${sceneName}"]`).click()
  await page.waitForLoadState('networkidle')
  await page.locator('[data-active-scene-tab="Soundscapes"]').click()
  
  await expect(page.locator(`[data-soundscape-category="${categoryName}"]`)).toHaveCount(0)
})

When(
  'I change {string} Volume to {int}% on {string}',
  async ({ page }, categoryName: string, volume: number, sceneName: string) => {
    const title = page.locator('[data-screen="Active Scene screen"] h2')
    if (await title.count() === 0 || (await title.innerText()) !== sceneName) {
      await openScenes(page)
      await page.locator(`[data-scene-body="${sceneName}"]`).click()
      await page.waitForLoadState('networkidle')
    }
    
    await page.locator('[data-active-scene-tab="Soundscapes"]').click()
    await page.locator(`input[aria-label="${categoryName} volume"]`).fill(String(volume))
    await page.waitForTimeout(200)
  }
)

Then('the {string} scene still has {string} at Volume {int}%', async ({ page }, sceneName: string, categoryName: string, volume: number) => {
  const title = page.locator('[data-screen="Active Scene screen"] h2')
  if (await title.count() === 0 || (await title.innerText()) !== sceneName) {
    await openScenes(page)
    await page.locator(`[data-scene-body="${sceneName}"]`).click()
    await page.waitForLoadState('networkidle')
  }
  
  await page.locator('[data-active-scene-tab="Soundscapes"]').click()
  const volLabel = page.locator(`[data-soundscape-volume="${categoryName}"]`)
  await expect(volLabel).toHaveText(`${volume}%`)
})
