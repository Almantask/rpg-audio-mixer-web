import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addSceneEffectSeed,
  attachTrackToLevel,
  clearSeedData,
  createFxTrackSeed,
  createSceneSeed,
  createSoundscapeCategorySeed,
  createTrackSeed,
  getSceneIdByName,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

export const SCENE_NAME = 'Forest Ambush'

export async function openSceneTab(
  page: Page,
  tab: 'soundscapes' | 'soundboard',
  sceneId?: string,
): Promise<string> {
  const id =
    sceneId ??
    (await getSceneIdByName(page, SCENE_NAME).catch(async () => {
      await page.goto('/')
      await clearSeedData(page)
      return createSceneSeed(page, { name: SCENE_NAME })
    }))

  await page.goto(`/scenes/${id}`)
  await page.waitForLoadState('networkidle')
  if (tab === 'soundboard') {
    await page.getByTestId('soundboard-tab').click()
  } else {
    await expect(page.getByTestId('soundscapes-tab')).toHaveAttribute('data-state', 'active')
  }
  return id
}

export function categoryCard(page: Page, name: string) {
  return page.locator('[data-testid="soundscape-category-card"]', {
    has: page.locator(`[data-category-name="${name}"]`),
  })
}

export function effectTile(page: Page, name: string) {
  return page.locator('[data-testid="soundboard-effect-tile"]', {
    has: page.locator(`[data-effect-name="${name}"]`),
  })
}

export async function seedCategoryWithTracks(
  page: Page,
  categoryName: string,
  tracks: Array<{ name: string; level: 1 | 2 | 3 }>,
): Promise<void> {
  let categoryId = await page.evaluate(async (name) => window.__arcanumGetCategoryIdByName?.(name), categoryName)
  if (!categoryId) {
    categoryId = await createSoundscapeCategorySeed(page, categoryName)
  }
  for (const track of tracks) {
    const trackId = await createTrackSeed(page, { name: track.name })
    await attachTrackToLevel(page, categoryId, track.level, trackId)
  }
}

export async function addCategoryToScene(
  page: Page,
  sceneId: string,
  categoryName: string,
  volume = 100,
): Promise<void> {
  await page.evaluate(
    async ({ sid, name, vol }) => {
      await window.__arcanumAddSceneSoundscape?.(sid, name, vol)
    },
    { sid: sceneId, name: categoryName, vol: volume },
  )
}

export async function addEffectToScene(page: Page, sceneId: string, name: string): Promise<void> {
  const trackId = await createFxTrackSeed(page, { name })
  await addSceneEffectSeed(page, sceneId, name, trackId)
}

export async function loadTrackViaRoll(page: Page, categoryName: string): Promise<void> {
  await categoryCard(page, categoryName).getByTestId('category-d20-button').click()
  await expect(categoryCard(page, categoryName).getByTestId('category-track-name')).not.toHaveText(
    'No track loaded',
  )
}

export async function startCategoryPlayback(page: Page, categoryName: string): Promise<void> {
  const playButton = categoryCard(page, categoryName).getByTestId('category-play-button')
  await playButton.click()
  await expect.poll(async () =>
    page.evaluate((cat) => window.__arcanumIsCategoryPlaying?.(cat) ?? false, categoryName),
  ).toBe(true)
}

export async function pauseCategoryPlayback(page: Page, categoryName: string): Promise<void> {
  await categoryCard(page, categoryName)
    .getByRole('button', { name: new RegExp(`Pause ${categoryName}`, 'i') })
    .click()
  await expect.poll(async () =>
    page.evaluate((cat) => window.__arcanumIsCategoryPlaying?.(cat) ?? false, categoryName),
  ).toBe(false)
}

export async function selectIntensityLevel(
  page: Page,
  categoryName: string,
  level: 'I' | 'II' | 'III',
): Promise<void> {
  const levelNum = level === 'I' ? '1' : level === 'II' ? '2' : '3'
  await categoryCard(page, categoryName).locator(`[data-intensity-level="${levelNum}"]`).click()
}

export async function triggerEffect(page: Page, name: string): Promise<void> {
  await effectTile(page, name).getByTestId('effect-tile-body').click()
  await expect.poll(async () =>
    page.evaluate((effect) => window.__arcanumIsEffectPlaying?.(effect) ?? false, name),
  ).toBe(true)
}

export async function expectCategoryPlaying(page: Page, name: string, playing = true): Promise<void> {
  await expect.poll(async () =>
    page.evaluate((cat) => window.__arcanumIsCategoryPlaying?.(cat) ?? false, name),
  ).toBe(playing)
}

export async function expectEffectPlaying(page: Page, name: string, playing = true): Promise<void> {
  await expect.poll(async () =>
    page.evaluate((effect) => window.__arcanumIsEffectPlaying?.(effect) ?? false, name),
  ).toBe(playing)
}

export async function getCategoryOrder(page: Page): Promise<string[]> {
  return page.locator('[data-testid="soundscape-category-card"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-category-name') ?? ''),
  )
}

export async function getEffectOrder(page: Page): Promise<string[]> {
  return page.locator('[data-testid="soundboard-effect-tile"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-effect-name') ?? ''),
  )
}

Given(/^"([^"]+)" and "([^"]+)" are both playing$/, async ({ page }, first: string, second: string) => {
  const onSoundboard =
    (await page.getByTestId('soundboard-tab').getAttribute('data-state')) === 'active' ||
    (await effectTile(page, first).count()) > 0

  if (onSoundboard) {
    const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => {
      await page.goto('/')
      await clearSeedData(page)
      return createSceneSeed(page, { name: SCENE_NAME })
    })
    for (const name of [first, second]) {
      if ((await effectTile(page, name).count()) === 0) {
        await addEffectToScene(page, sceneId, name)
      }
    }
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByTestId('soundboard-tab').click()
    await triggerEffect(page, first)
    await triggerEffect(page, second)
    return
  }

  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => {
    await page.goto('/')
    await clearSeedData(page)
    return createSceneSeed(page, { name: SCENE_NAME })
  })
  for (const name of [first, second]) {
    if ((await categoryCard(page, name).count()) === 0) {
      await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
      await addCategoryToScene(page, sceneId, name)
    }
  }
  await page.reload()
  await page.waitForLoadState('networkidle')
  for (const name of [first, second]) {
    await loadTrackViaRoll(page, name)
    await startCategoryPlayback(page, name)
  }
})

Then(/^the order becomes "([^"]+)", "([^"]+)", "([^"]+)"$/, async ({ page }, a: string, b: string, c: string) => {
  const expected = [a, b, c]
  if (await page.getByTestId('soundboard-grid').isVisible()) {
    await expect.poll(async () => getEffectOrder(page)).toEqual(expected)
    return
  }
  await expect.poll(async () => getCategoryOrder(page)).toEqual(expected)
})

async function bootstrapLoopingCategory(page: Page, categoryName: string): Promise<void> {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Loop`, level: 1 }])
  await addCategoryToScene(page, sceneId, categoryName)
  await openSceneTab(page, 'soundscapes', sceneId)
  await loadTrackViaRoll(page, categoryName)
  await startCategoryPlayback(page, categoryName)
}

Given(/^the "([^"]+)" category is looping$/, async ({ page }, categoryName: string) => {
  await bootstrapLoopingCategory(page, categoryName)
})

Given(
  /^"([^"]+)" and "([^"]+)" categories are both looping$/,
  async ({ page }, first: string, second: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
    for (const name of [first, second]) {
      await seedCategoryWithTracks(page, name, [{ name: `${name} Loop`, level: 1 }])
      await addCategoryToScene(page, sceneId, name)
    }
    await openSceneTab(page, 'soundscapes', sceneId)
    for (const name of [first, second]) {
      await loadTrackViaRoll(page, name)
      await startCategoryPlayback(page, name)
    }
  },
)

Given(
  /^"([^"]+)" is looping and "([^"]+)" is playing from the soundboard$/,
  async ({ page }, categoryName: string, effectName: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
    await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Loop`, level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName)
    await addEffectToScene(page, sceneId, effectName)
    await openSceneTab(page, 'soundscapes', sceneId)
    await loadTrackViaRoll(page, categoryName)
    await startCategoryPlayback(page, categoryName)
    await page.getByTestId('soundboard-tab').click()
    await triggerEffect(page, effectName)
  },
)

Given(
  /^"([^"]+)" is playing at Master (\d+)% and "([^"]+)" is on the soundboard$/,
  async ({ page }, categoryName: string, master: string, effectName: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
    await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Loop`, level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName)
    await addEffectToScene(page, sceneId, effectName)
    await openSceneTab(page, 'soundscapes', sceneId)
    await page.getByTestId('master-volume-slider').fill(master)
    await loadTrackViaRoll(page, categoryName)
    await startCategoryPlayback(page, categoryName)
    await page.getByTestId('soundboard-tab').click()
  },
)

Given(/^"([^"]+)" is looping at full volume$/, async ({ page }, categoryName: string) => {
  await bootstrapLoopingCategory(page, categoryName)
})

Given(
  /^"([^"]+)" is ducked to 40% volume while "([^"]+)" plays$/,
  async ({ page }, categoryName: string, effectName: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
    await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Loop`, level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName)
    await addEffectToScene(page, sceneId, effectName)
    await openSceneTab(page, 'soundscapes', sceneId)
    await loadTrackViaRoll(page, categoryName)
    await startCategoryPlayback(page, categoryName)
    await page.getByTestId('soundboard-tab').click()
    await triggerEffect(page, effectName)
    await expect.poll(async () => page.evaluate(() => window.__arcanumIsDucked?.() ?? false)).toBe(true)
  },
)

Given(/^there are 10 soundscape categories currently looping$/, async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  for (let index = 1; index <= 10; index += 1) {
    const name = `Loop ${index}`
    await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, name)
  }
  await seedCategoryWithTracks(page, 'Loop 11', [{ name: 'Loop 11 Track', level: 1 }])
  await addCategoryToScene(page, sceneId, 'Loop 11')
  await openSceneTab(page, 'soundscapes', sceneId)
  for (let index = 1; index <= 10; index += 1) {
    const name = `Loop ${index}`
    await loadTrackViaRoll(page, name)
    await startCategoryPlayback(page, name)
  }
})

Given(/^10 soundscape categories are looping$/, async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  for (let index = 1; index <= 10; index += 1) {
    const name = `Loop ${index}`
    await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, name)
  }
  await seedCategoryWithTracks(page, 'Loop 11', [{ name: 'Loop 11 Track', level: 1 }])
  await addCategoryToScene(page, sceneId, 'Loop 11')
  await openSceneTab(page, 'soundscapes', sceneId)
  for (let index = 1; index <= 10; index += 1) {
    const name = `Loop ${index}`
    await loadTrackViaRoll(page, name)
    await startCategoryPlayback(page, name)
  }
})

Given(/^there are 5 soundboard effects currently playing simultaneously$/, async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  const names = ['Fx One', 'Fx Two', 'Fx Three', 'Fx Four', 'Fx Five', 'Fx Six']
  for (const name of names) {
    await addEffectToScene(page, sceneId, name)
  }
  await openSceneTab(page, 'soundboard', sceneId)
  for (const name of names.slice(0, 5)) {
    await triggerEffect(page, name)
  }
})

Given(/^5 instances of "([^"]+)" are currently playing$/, async ({ page }, effectName: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  await addEffectToScene(page, sceneId, effectName)
  await openSceneTab(page, 'soundboard', sceneId)
  const tile = effectTile(page, effectName).getByTestId('effect-tile-body')
  for (let index = 0; index < 5; index += 1) {
    await tile.click()
  }
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumGetEffectInstanceCount?.(name) ?? 0, effectName),
  ).toBe(5)
})

When(/^I tap "([^"]+)" on the soundboard$/, async ({ page }, effectName: string) => {
  await page.getByTestId('soundboard-tab').click()
  await triggerEffect(page, effectName)
})

When(/^I pause the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  await page.getByTestId('soundscapes-tab').click()
  await pauseCategoryPlayback(page, categoryName)
})

When(/^I reduce the Master Volume to (\d+)%$/, async ({ page }, value: string) => {
  await page.getByTestId('soundscapes-tab').click()
  await page.getByTestId('master-volume-slider').fill(value)
})

When(/^I attempt to play an 11th soundscape category$/, async ({ page }) => {
  await loadTrackViaRoll(page, 'Loop 11')
  await startCategoryPlayback(page, 'Loop 11')
})

When(/^I pause one playing category$/, async ({ page }) => {
  await pauseCategoryPlayback(page, 'Loop 1')
})

When(/^I start an 11th soundscape category$/, async ({ page }) => {
  await loadTrackViaRoll(page, 'Loop 11')
  await startCategoryPlayback(page, 'Loop 11')
})

When(/^I trigger a 6th soundboard effect$/, async ({ page }) => {
  await triggerEffect(page, 'Fx Six')
})

When(/^I trigger "([^"]+)" again$/, async ({ page }, effectName: string) => {
  await effectTile(page, effectName).getByTestId('effect-tile-body').click()
})

Then(
  /^"([^"]+)" plays simultaneously with the "([^"]+)" loop$/,
  async ({ page }, effectName: string, categoryName: string) => {
    await expectEffectPlaying(page, effectName, true)
    await expectCategoryPlaying(page, categoryName, true)
  },
)

Then(
  /^"([^"]+)" and "([^"]+)" continue looping uninterrupted$/,
  async ({ page }, first: string, second: string) => {
    await expectCategoryPlaying(page, first, true)
    await expectCategoryPlaying(page, second, true)
  },
)

Then(/^"([^"]+)" continues to play$/, async ({ page }, effectName: string) => {
  await expectEffectPlaying(page, effectName, true)
})

Then(/^only "([^"]+)" has stopped$/, async ({ page }, categoryName: string) => {
  await expectCategoryPlaying(page, categoryName, false)
})

Then(/^"([^"]+)" plays at the reduced level$/, async ({ page }, categoryName: string) => {
  const master = 30
  const expected = await page.evaluate(
    ([m, c]) => window.__arcanumGetMappedVolume?.(m, c) ?? 0,
    [master, 100] as const,
  )
  const actual = await page.evaluate(
    (name) => window.__arcanumGetCategoryGain?.(name) ?? 0,
    categoryName,
  )
  expect(actual).toBeCloseTo(expected, 5)
})

Then(/^But "([^"]+)" is unaffected by the Master Volume slider$/, async ({ page }, effectName: string) => {
  await triggerEffect(page, effectName)
  const before = await page.evaluate(
    (name) => window.__arcanumGetEffectGain?.(name) ?? 0,
    effectName,
  )
  await page.getByTestId('soundscapes-tab').click()
  await page.getByTestId('master-volume-slider').fill('30')
  await page.getByTestId('soundboard-tab').click()
  const after = await page.evaluate(
    (name) => window.__arcanumGetEffectGain?.(name) ?? 0,
    effectName,
  )
  expect(after).toBeCloseTo(before, 5)
})

Then(/^all playing soundscape categories duck to 40% volume$/, async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumIsDucked?.() ?? false)).toBe(true)
  const expected = await page.evaluate(
    ([m, c]) => (window.__arcanumGetMappedVolume?.(m, c) ?? 0) * 0.4,
    [100, 100] as const,
  )
  const actual = await page.evaluate((name) => window.__arcanumGetCategoryGain?.(name) ?? 0, 'Weather')
  expect(actual).toBeCloseTo(expected, 5)
})

Then(/^"([^"]+)" restores to its previous volume$/, async ({ page }, categoryName: string) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumIsDucked?.() ?? false)).toBe(false)
  const expected = await page.evaluate(
    ([m, c]) => window.__arcanumGetMappedVolume?.(m, c) ?? 0,
    [100, 100] as const,
  )
  await expect.poll(async () => {
    const actual = await page.evaluate(
      (name) => window.__arcanumGetCategoryGain?.(name) ?? 0,
      categoryName,
    )
    return Math.abs(actual - expected) < 0.001
  }).toBe(true)
})

Then(/^the oldest playing soundscape category loop automatically stops$/, async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumGetActiveLoopCount?.() ?? 0)).toBe(10)
  const playing = await page.evaluate(() =>
    window.__arcanumAudioEngine
      ?.getSnapshot()
      .loops.filter((loop) => loop.status === 'playing')
      .map((loop) => loop.categoryName),
  )
  expect(playing).not.toContain('Loop 1')
})

Then(/^the new 11th soundscape begins playing$/, async ({ page }) => {
  await expectCategoryPlaying(page, 'Loop 11', true)
})

Then(/^the new category begins playing$/, async ({ page }) => {
  await expectCategoryPlaying(page, 'Loop 11', true)
})

Then(/^no other playing category is stopped$/, async ({ page }) => {
  for (const name of ['Loop 2', 'Loop 3', 'Loop 4', 'Loop 5']) {
    await expectCategoryPlaying(page, name, true)
  }
})

Then(/^the oldest playing soundboard effect instantly stops$/, async ({ page }) => {
  await expect.poll(async () => page.evaluate(() => window.__arcanumGetActiveFxCount?.() ?? 0)).toBe(5)
  await expectEffectPlaying(page, 'Fx One', false)
})

Then(/^the new 6th soundboard effect begins playing$/, async ({ page }) => {
  await expectEffectPlaying(page, 'Fx Six', true)
})

Then(/^the oldest "([^"]+)" instance instantly stops$/, async ({ page }, effectName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumGetEffectInstanceCount?.(name) ?? 0, effectName),
  ).toBe(5)
})

Then(/^the new "([^"]+)" instance begins playing$/, async ({ page }, effectName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumGetEffectInstanceCount?.(name) ?? 0, effectName),
  ).toBe(5)
  await expectEffectPlaying(page, effectName, true)
})
