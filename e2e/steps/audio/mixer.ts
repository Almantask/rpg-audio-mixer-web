import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addCategoryToScene,
  categoryCard,
  openSceneTab,
  SCENE_NAME,
  seedCategoryWithTracks,
  startCategoryPlayback,
  triggerEffect,
} from './playback'
import {
  addSceneEffectSeed,
  clearSeedData,
  createFxTrackSeed,
  createSceneSeed,
  getSceneIdByName,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function expectMappedCategoryGain(
  page: Page,
  categoryName: string,
  masterPercent: number,
  categoryPercent: number,
): Promise<void> {
  const expected = await page.evaluate(
    ([master, category]) => window.__arcanumGetMappedVolume?.(master, category) ?? 0,
    [masterPercent, categoryPercent] as const,
  )
  await expect.poll(async () => {
    const actual = await page.evaluate(
      (name) => window.__arcanumGetCategoryGain?.(name) ?? 0,
      categoryName,
    )
    return Math.abs(actual - expected) < 0.001
  }).toBe(true)
}

async function expectMappedSoundboardGain(
  page: Page,
  effectName: string,
  soundboardMasterPercent: number,
): Promise<void> {
  const expected = await page.evaluate(
    (master) => window.__arcanumGetMappedVolume?.(master, 100) ?? 0,
    soundboardMasterPercent,
  )
  await expect.poll(async () => {
    const actual = await page.evaluate(
      (name) => window.__arcanumGetEffectGain?.(name) ?? 0,
      effectName,
    )
    return Math.abs(actual - expected) < 0.001
  }).toBe(true)
}

Given(/^I have opened a scene on the Active Scene — Soundscapes tab$/, async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  await openSceneTab(page, 'soundscapes', sceneId)
})

Given(
  /^a scene has categories "([^"]+)" at Volume (\d+)% and "([^"]+)" at Volume (\d+)%$/,
  async ({ page }, first: string, firstVol: string, second: string, secondVol: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME)
    for (const [name, volume] of [
      [first, Number.parseInt(firstVol, 10)],
      [second, Number.parseInt(secondVol, 10)],
    ] as const) {
      await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
      await addCategoryToScene(page, sceneId, name, volume)
    }
    await page.reload()
    await page.waitForLoadState('networkidle')
  },
)

Given(/^Master Volume is at (\d+)%$/, async ({ page }, value: string) => {
  await page.getByTestId('master-volume-slider').fill(value)
})

Given(
  /^"([^"]+)" is playing with Master at (\d+)% and Volume at (\d+)%$/,
  async ({ page }, categoryName: string, master: string, volume: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME)
    await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName, Number.parseInt(volume, 10))
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByTestId('master-volume-slider').fill(master)
    await categoryCard(page, categoryName).getByTestId('category-d20-button').click()
    await startCategoryPlayback(page, categoryName)
  },
)

Given(
  /^"([^"]+)" has Volume at (\d+)% and "([^"]+)" has Volume at (\d+)%$/,
  async ({ page }, first: string, firstVol: string, second: string, secondVol: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME)
    for (const [name, volume] of [
      [first, Number.parseInt(firstVol, 10)],
      [second, Number.parseInt(secondVol, 10)],
    ] as const) {
      await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
      await addCategoryToScene(page, sceneId, name, volume)
    }
    await page.reload()
    await page.waitForLoadState('networkidle')
    for (const name of [first, second]) {
      await categoryCard(page, name).getByTestId('category-d20-button').click()
      await startCategoryPlayback(page, name)
    }
  },
)

Given(/^the session is locked on the Active Scene — Soundscapes tab$/, async ({ page }) => {
  await page.getByTestId('session-lock-button').click()
  await expect(page.getByTestId('session-lock-button')).toHaveAttribute('aria-pressed', 'true')
})

Given(/^Soundboard Master is at (\d+)%$/, async ({ page }, value: string) => {
  await page.getByTestId('soundboard-master-slider').fill(value)
})

Given(/^"([^"]+)" is playing from the soundboard$/, async ({ page }, effectName: string) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME)
  const trackId = await createFxTrackSeed(page, { name: effectName })
  await addSceneEffectSeed(page, sceneId, effectName, trackId)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
  await triggerEffect(page, effectName)
})

Given(
  /^"([^"]+)" is playing as a soundscape at Volume (\d+)% and Master Volume (\d+)%$/,
  async ({ page }, categoryName: string, volume: string, master: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME)
    await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName, Number.parseInt(volume, 10))
    await page.getByTestId('soundscapes-tab').click()
    await page.getByTestId('master-volume-slider').fill(master)
    await categoryCard(page, categoryName).getByTestId('category-d20-button').click()
    await startCategoryPlayback(page, categoryName)
  },
)

Given(
  /^the "([^"]+)" category intensity is set to Level III on the Soundscapes tab$/,
  async ({ page }, categoryName: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME)
    await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Storm`, level: 3 }])
    await addCategoryToScene(page, sceneId, categoryName)
    await page.getByTestId('soundscapes-tab').click()
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByTestId('soundscapes-tab').click()
    await categoryCard(page, categoryName).locator('[data-intensity-level="3"]').click()
  },
)

Given(/^the session is locked on the Active Scene — Soundboard tab$/, async ({ page }) => {
  await page.getByTestId('session-lock-button').click()
  await expect(page.getByTestId('session-lock-button')).toHaveAttribute('aria-pressed', 'true')
})

When(/^I start playback on all categories$/, async ({ page }) => {
  const cards = page.getByTestId('soundscape-category-card')
  const count = await cards.count()
  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index)
    await card.getByTestId('category-d20-button').click()
    await card.getByTestId('category-play-button').click()
  }
})

Given(/^I set Master Volume to (\d+)%$/, async ({ page }, value: string) => {
  await page.getByTestId('master-volume-slider').fill(value)
})

Given(/^I set the "([^"]+)" Volume slider to (\d+)%$/, async ({ page }, categoryName: string, value: string) => {
  const byLabel = page.locator(`[data-category-name="${categoryName}"]`).getByLabel(`${categoryName} volume`)
  if (await byLabel.count()) {
    await byLabel.fill(value)
    return
  }
  await page.locator(`[data-category-name="${categoryName}"] input[type="range"]`).fill(value)
})

When(
  /^I set Master Volume to (\d+)% and tap the mute button on the Master Volume bar$/,
  async ({ page }, value: string) => {
    await page.getByTestId('master-volume-slider').fill(value)
    await page.getByTestId('master-mute-button').click()
  },
)

When(/^I set Soundboard Master to (\d+)%$/, async ({ page }, value: string) => {
  await page.getByTestId('soundboard-master-slider').fill(value)
})

When(/^I leave and reopen the scene on the Soundboard tab$/, async ({ page }) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME)
  await page.goto('/scenes')
  await page.waitForLoadState('networkidle')
  await page.goto(`/scenes/${sceneId}`)
  await page.waitForLoadState('networkidle')
  await page.getByTestId('soundboard-tab').click()
})

Then(
  /^"([^"]+)" plays at the mapped volume for (\d+)% Master × (\d+)% Volume$/,
  async ({ page }, categoryName: string, master: string, volume: string) => {
    await expectMappedCategoryGain(
      page,
      categoryName,
      Number.parseInt(master, 10),
      Number.parseInt(volume, 10),
    )
  },
)

Then(/^the Master Volume slider reads (\d+)%$/, async ({ page }, value: string) => {
  await expect(page.getByTestId('master-volume-slider')).toHaveValue(value)
  await expect(page.getByTestId('master-volume-bar')).toContainText(`${value}%`)
})

Then(/^soundscape output is muted$/, async ({ page }) => {
  await expect(page.getByTestId('master-mute-button')).toHaveAttribute('aria-pressed', 'true')
})

Then(
  /^"([^"]+)" plays at the mapped volume for (\d+)% Soundboard Master$/,
  async ({ page }, effectName: string, master: string) => {
    await expectMappedSoundboardGain(page, effectName, Number.parseInt(master, 10))
  },
)

Then(/^Soundboard Master is immediately at (\d+)% with no animation$/, async ({ page }, value: string) => {
  await expect(page.getByTestId('soundboard-master-slider')).toHaveValue(value)
  await expect(page.getByTestId('soundboard-master-bar')).toContainText(`${value}%`)
})
