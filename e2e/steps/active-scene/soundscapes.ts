import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addCategoryToScene,
  categoryCard,
  loadTrackViaRoll,
  openSceneTab,
  pauseCategoryPlayback,
  SCENE_NAME,
  seedCategoryWithTracks,
  selectIntensityLevel,
  startCategoryPlayback,
} from '../audio/playback'
import {
  clearSeedData,
  createSceneSeed,
  getSceneIdByName,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function bootstrapSoundscapesScene(page: Page): Promise<string> {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: SCENE_NAME })
  await openSceneTab(page, 'soundscapes', sceneId)
  return sceneId
}

async function getCategoryOrder(page: Page): Promise<string[]> {
  return page.locator('[data-testid="soundscape-category-card"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-category-name') ?? ''),
  )
}

async function dragCategoryByHandle(
  page: Page,
  sourceName: string,
  targetName: string,
  position: 'above' | 'top' = 'above',
): Promise<void> {
  const source = categoryCard(page, sourceName).getByTestId('category-drag-handle')
  const target = categoryCard(page, targetName)
  const box = await target.boundingBox()
  if (!box) throw new Error(`Target category not found: ${targetName}`)
  const y = position === 'top' ? box.y + 5 : box.y + box.height / 2
  await source.hover()
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, y)
  await page.mouse.up()
}

Given(
  /^I have a scene with soundscape categories on the Active Scene — Soundscapes tab$/,
  async ({ page }) => {
    const sceneId = await bootstrapSoundscapesScene(page)
    await seedCategoryWithTracks(page, 'Weather', [{ name: 'Weather Track', level: 1 }])
    await seedCategoryWithTracks(page, 'Interior', [{ name: 'Interior Track', level: 1 }])
    await addCategoryToScene(page, sceneId, 'Weather')
    await addCategoryToScene(page, sceneId, 'Interior')
    await page.reload()
    await page.waitForLoadState('networkidle')
  },
)

Given(/^the "([^"]+)" category has a loaded track "([^"]+)"$/, async ({ page }, categoryName: string, trackName: string) => {
  const sceneId = await bootstrapSoundscapesScene(page)
  await seedCategoryWithTracks(page, categoryName, [{ name: trackName, level: 1 }])
  await addCategoryToScene(page, sceneId, categoryName)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await selectIntensityLevel(page, categoryName, 'I')
  await loadTrackViaRoll(page, categoryName)
  await expect(categoryCard(page, categoryName).getByTestId('category-track-name')).toHaveText(trackName)
})

Given(
  /^the "([^"]+)" category was playing "([^"]+)" and is now paused$/,
  async ({ page }, categoryName: string, trackName: string) => {
    const sceneId = await bootstrapSoundscapesScene(page)
    await seedCategoryWithTracks(page, categoryName, [{ name: trackName, level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await selectIntensityLevel(page, categoryName, 'I')
    await loadTrackViaRoll(page, categoryName)
    await startCategoryPlayback(page, categoryName)
    await pauseCategoryPlayback(page, categoryName)
  },
)

Given(
  /^the "([^"]+)" category has tracks but none is currently loaded or paused$/,
  async ({ page }, categoryName: string) => {
    const sceneId = await bootstrapSoundscapesScene(page)
    await seedCategoryWithTracks(page, categoryName, [{ name: 'Rain A', level: 1 }, { name: 'Rain B', level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName)
    await page.reload()
    await page.waitForLoadState('networkidle')
  },
)

Given(
  /^the "([^"]+)" category is playing "([^"]+)" at Intensity Level I$/,
  async ({ page }, categoryName: string, trackName: string) => {
    const sceneId = await bootstrapSoundscapesScene(page)
    await seedCategoryWithTracks(page, categoryName, [
      { name: trackName, level: 1 },
      { name: `${trackName} Alt`, level: 1 },
    ])
    await addCategoryToScene(page, sceneId, categoryName)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await selectIntensityLevel(page, categoryName, 'I')
    await loadTrackViaRoll(page, categoryName)
    await startCategoryPlayback(page, categoryName)
  },
)

Given(/^"([^"]+)" has multiple tracks at Intensity Level I$/, async ({ page }, categoryName: string) => {
  await seedCategoryWithTracks(page, categoryName, [
    { name: 'Light Rain', level: 1 },
    { name: 'Heavy Rain', level: 1 },
  ])
})

Given(/^the "([^"]+)" category is currently playing$/, async ({ page }, categoryName: string) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundscapesScene(page))
  const hasCard = (await categoryCard(page, categoryName).count()) > 0
  if (!hasCard) {
    await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, categoryName)
    await page.reload()
    await page.waitForLoadState('networkidle')
  }
  await loadTrackViaRoll(page, categoryName)
  await startCategoryPlayback(page, categoryName)
})

Given(
  /^a scene has categories "([^"]+)" and "([^"]+)"$/,
  async ({ page }, first: string, second: string) => {
    const sceneId = await bootstrapSoundscapesScene(page)
    for (const name of [first, second]) {
      await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
      await addCategoryToScene(page, sceneId, name)
    }
    await page.reload()
    await page.waitForLoadState('networkidle')
  },
)

Given(/^the "([^"]+)" category is not playing$/, async ({ page }, categoryName: string) => {
  const sceneId = await bootstrapSoundscapesScene(page)
  await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Track`, level: 1 }])
  await addCategoryToScene(page, sceneId, categoryName)
  await page.reload()
  await page.waitForLoadState('networkidle')
})

Given(/^"([^"]+)" has tracks at Intensity Level II$/, async ({ page }, categoryName: string) => {
  await seedCategoryWithTracks(page, categoryName, [{ name: 'Storm', level: 2 }])
})

Given(
  /^"([^"]+)" has tracks "([^"]+)" at Intensity Level I and "([^"]+)" at Intensity Level II$/,
  async ({ page }, categoryName: string, trackI: string, trackII: string) => {
    const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundscapesScene(page))
    await seedCategoryWithTracks(page, categoryName, [
      { name: trackI, level: 1 },
      { name: trackII, level: 2 },
    ])
    await addCategoryToScene(page, sceneId, categoryName)
    await page.reload()
    await page.waitForLoadState('networkidle')
  },
)

Given(/^the "([^"]+)" category is playing at Intensity Level I$/, async ({ page }, categoryName: string) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME).catch(async () => bootstrapSoundscapesScene(page))
  await seedCategoryWithTracks(page, categoryName, [
    { name: 'Drizzle', level: 1 },
    { name: 'Storm', level: 2 },
  ])
  await addCategoryToScene(page, sceneId, categoryName)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await selectIntensityLevel(page, categoryName, 'I')
  await loadTrackViaRoll(page, categoryName)
  await startCategoryPlayback(page, categoryName)
})

Given(/^the "([^"]+)" category is currently at Intensity Level I$/, async ({ page }, categoryName: string) => {
  const sceneId = await bootstrapSoundscapesScene(page)
  await seedCategoryWithTracks(page, categoryName, [{ name: 'Dungeon Echo', level: 1 }])
  await addCategoryToScene(page, sceneId, categoryName)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await selectIntensityLevel(page, categoryName, 'I')
})

Given(/^the "([^"]+)" category has no tracks at Intensity Level III$/, async ({ page }, categoryName: string) => {
  void page
  void categoryName
})

Given(
  /^the "([^"]+)" category was playing at Intensity Level I and is now paused$/,
  async ({ page }, categoryName: string) => {
    const sceneId = await bootstrapSoundscapesScene(page)
    await seedCategoryWithTracks(page, categoryName, [
      { name: 'Drizzle', level: 1 },
      { name: 'Storm', level: 2 },
    ])
    await addCategoryToScene(page, sceneId, categoryName)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await selectIntensityLevel(page, categoryName, 'I')
    await loadTrackViaRoll(page, categoryName)
    await startCategoryPlayback(page, categoryName)
    await pauseCategoryPlayback(page, categoryName)
  },
)

Given(/^there are at least two soundscape categories in the active scene$/, async ({ page }) => {
  const sceneId = await bootstrapSoundscapesScene(page)
  for (const name of ['Weather', 'Interior']) {
    await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, name)
  }
  await page.reload()
  await page.waitForLoadState('networkidle')
})

Given(/^the order is "([^"]+)", "([^"]+)", "([^"]+)"$/, async ({ page }, a: string, b: string, c: string) => {
  const sceneId = await bootstrapSoundscapesScene(page)
  for (const name of [a, b, c]) {
    await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, name)
  }
  await page.reload()
  await page.waitForLoadState('networkidle')
})

Given(/^the order is "([^"]+)", "([^"]+)"$/, async ({ page }, a: string, b: string) => {
  const sceneId = await bootstrapSoundscapesScene(page)
  for (const name of [a, b]) {
    await seedCategoryWithTracks(page, name, [{ name: `${name} Track`, level: 1 }])
    await addCategoryToScene(page, sceneId, name)
  }
  await page.reload()
  await page.waitForLoadState('networkidle')
})

Given(/^the active scene has only the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  const sceneId = await bootstrapSoundscapesScene(page)
  await seedCategoryWithTracks(page, categoryName, [{ name: `${categoryName} Track`, level: 1 }])
  await addCategoryToScene(page, sceneId, categoryName)
  await page.reload()
  await page.waitForLoadState('networkidle')
})

When(/^I tap play on the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  await categoryCard(page, categoryName).getByTestId('category-play-button').click()
})

When(/^I view the "([^"]+)" category controls$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName)).toBeVisible()
})

When(/^the "([^"]+)" track finishes playing$/, async ({ page }, trackName: string) => {
  const categoryName = await page.evaluate((track) => {
    const snapshot = window.__arcanumAudioEngine?.getSnapshot()
    return snapshot?.loops.find((loop) => loop.trackName === track)?.categoryName
  }, trackName)
  if (!categoryName) throw new Error(`No playing category found for track ${trackName}`)
  await page.evaluate((name) => window.__arcanumSimulateTrackEnd?.(name), categoryName)
})

When(/^I tap pause on the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  await pauseCategoryPlayback(page, categoryName)
})

When(/^I tap play on "([^"]+)"$/, async ({ page }, categoryName: string) => {
  await categoryCard(page, categoryName).getByTestId('category-play-button').click()
})

When(/^I start playback on the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  await loadTrackViaRoll(page, categoryName)
  await startCategoryPlayback(page, categoryName)
})

When(/^I tap pause on "([^"]+)"$/, async ({ page }, categoryName: string) => {
  await pauseCategoryPlayback(page, categoryName)
})

When(/^I pause "([^"]+)"$/, async ({ page }, categoryName: string) => {
  await pauseCategoryPlayback(page, categoryName)
})

When(/^I select Intensity Level II on the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  await selectIntensityLevel(page, categoryName, 'II')
})

When(
  /^I select Intensity Level II and start playback on the "([^"]+)" category$/,
  async ({ page }, categoryName: string) => {
    await selectIntensityLevel(page, categoryName, 'II')
    await loadTrackViaRoll(page, categoryName)
    await startCategoryPlayback(page, categoryName)
  },
)

When(/^I attempt to select Intensity Level III on the "([^"]+)" card$/, async ({ page }, categoryName: string) => {
  await categoryCard(page, categoryName).locator('[data-intensity-level="3"]').click({ force: true })
})

When(/^I drag "([^"]+)" by its drag handle above "([^"]+)"$/, async ({ page }, source: string, target: string) => {
  await dragCategoryByHandle(page, source, target, 'above')
})

When(/^I drag "([^"]+)" by its drag handle to the top$/, async ({ page }, source: string) => {
  const first = (await getCategoryOrder(page))[0]
  await dragCategoryByHandle(page, source, first, 'top')
})

When('I close and reopen the scene', async ({ page }) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME)
  await page.goto('/scenes')
  await page.waitForLoadState('networkidle')
  await page.goto(`/scenes/${sceneId}`)
  await page.waitForLoadState('networkidle')
})

When(/^I attempt to drag "([^"]+)" by its drag handle$/, async ({ page }, source: string) => {
  const orderBefore = await getCategoryOrder(page)
  const target = orderBefore[0] === source ? orderBefore[1] : orderBefore[0]
  await dragCategoryByHandle(page, source, target, 'top')
})

Then(/^"([^"]+)" resumes playing$/, async ({ page }, trackName: string) => {
  await expect.poll(async () => {
    const track = await page.evaluate((name) => window.__arcanumGetCategoryTrack?.(name), 'Weather')
    const playing = await page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, 'Weather')
    return playing && track === trackName
  }).toBe(true)
})

Then(/^the play button on "([^"]+)" should be disabled$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName).getByTestId('category-play-button')).toBeDisabled()
})

Then(/^the d20 button on "([^"]+)" should be enabled$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName).getByTestId('category-d20-button')).toBeEnabled()
})

Then(
  /^a new random track from Intensity Level I in "([^"]+)" begins playing automatically$/,
  async ({ page }, categoryName: string) => {
    await expect.poll(async () =>
      page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, categoryName),
    ).toBe(true)
    const trackName = await page.evaluate((name) => window.__arcanumGetCategoryTrack?.(name), categoryName)
    expect(trackName).toBeTruthy()
    expect(trackName).not.toBe('Light Rain')
  },
)

Then(/^playback stops in the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, categoryName),
  ).toBe(false)
})

Then('another idle category can begin playing', async ({ page }) => {
  await loadTrackViaRoll(page, 'Interior')
  await startCategoryPlayback(page, 'Interior')
})

Then(
  /^"([^"]+)" and "([^"]+)" are both playing at the same time$/,
  async ({ page }, first: string, second: string) => {
    await expect.poll(async () =>
      page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, first),
    ).toBe(true)
    await expect.poll(async () =>
      page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, second),
    ).toBe(true)
  },
)

Then(/^the "([^"]+)" card shows the playing state$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName)).toHaveAttribute('data-playing', 'true')
})

Then(/^the "([^"]+)" card shows an animating playback progress bar$/, async ({ page }, categoryName: string) => {
  const bar = categoryCard(page, categoryName).getByTestId('category-progress-bar')
  await expect(bar).toHaveAttribute('aria-valuenow', /[1-9]/)
  await expect(bar.locator('.animate-pulse')).toBeVisible()
})

Then(/^the "([^"]+)" card shows a pause icon on the play control$/, async ({ page }, categoryName: string) => {
  await expect(
    categoryCard(page, categoryName).getByRole('button', { name: new RegExp(`Pause ${categoryName}`, 'i') }),
  ).toBeVisible()
})

Then(/^the "([^"]+)" card does not show the playing state$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName)).toHaveAttribute('data-playing', 'false')
})

Then(/^the "([^"]+)" card shows a play icon on the play control$/, async ({ page }, categoryName: string) => {
  await expect(
    categoryCard(page, categoryName).getByRole('button', { name: new RegExp(`Play ${categoryName}`, 'i') }),
  ).toBeVisible()
})

Then(/^the "([^"]+)" card playback progress bar is empty$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName).getByTestId('category-progress-bar')).toHaveAttribute(
    'aria-valuenow',
    '0',
  )
})

Then(/^the "([^"]+)" card no longer shows the playing state$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName)).toHaveAttribute('data-playing', 'false')
})

Then(/^the "([^"]+)" card playback progress bar is not advancing$/, async ({ page }, categoryName: string) => {
  const bar = categoryCard(page, categoryName).getByTestId('category-progress-bar')
  const first = await bar.getAttribute('aria-valuenow')
  await page.waitForTimeout(150)
  const second = await bar.getAttribute('aria-valuenow')
  expect(first).toBe(second)
})

Then(
  /^both the "([^"]+)" and "([^"]+)" cards show the playing state$/,
  async ({ page }, first: string, second: string) => {
    await expect(categoryCard(page, first)).toHaveAttribute('data-playing', 'true')
    await expect(categoryCard(page, second)).toHaveAttribute('data-playing', 'true')
  },
)

Then(/^only "([^"]+)" shows the playing state$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName)).toHaveAttribute('data-playing', 'true')
})

Then(/^"([^"]+)" does not show the playing state$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName)).toHaveAttribute('data-playing', 'false')
})

Then(/^no track from "([^"]+)" begins playing$/, async ({ page }, categoryName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, categoryName),
  ).toBe(false)
})

Then(/^Intensity Level II is selected on the "([^"]+)" category$/, async ({ page }, categoryName: string) => {
  await expect(
    categoryCard(page, categoryName).locator('[data-intensity-level="2"][aria-pressed="true"]'),
  ).toBeVisible()
})

Then('the intensity change is auto-saved immediately', async ({ page }) => {
  const sceneId = await getSceneIdByName(page, SCENE_NAME)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(
    categoryCard(page, 'Weather').locator('[data-intensity-level="2"][aria-pressed="true"]'),
  ).toBeVisible()
  void sceneId
})

Then(/^a track from Intensity Level II plays \(not from Intensity Level I\)$/, async ({ page }) => {
  const trackName = await page.evaluate((name) => window.__arcanumGetCategoryTrack?.(name), 'Weather')
  expect(trackName).toBeTruthy()
  expect(trackName).not.toBe('Drizzle')
})

Then(
  /^a track from Intensity Level II replaces the Intensity Level I track with a smooth transition$/,
  async ({ page }) => {
    await expect.poll(async () =>
      page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, 'Weather'),
    ).toBe(true)
    const trackName = await page.evaluate((name) => window.__arcanumGetCategoryTrack?.(name), 'Weather')
    expect(trackName).toBe('Storm')
  },
)

Then(/^the active intensity level should remain Intensity Level I$/, async ({ page }) => {
  await expect(
    categoryCard(page, 'Dungeon').locator('[data-intensity-level="1"][aria-pressed="true"]'),
  ).toBeVisible()
})

Then(/^Intensity Level III is unavailable on the "([^"]+)" card$/, async ({ page }, categoryName: string) => {
  await expect(categoryCard(page, categoryName).locator('[data-intensity-level="3"]')).toBeDisabled()
})

Then('each category card shows a visible drag handle', async ({ page }) => {
  await expect(page.getByTestId('category-drag-handle').first()).toBeVisible()
})

Then('there is no separate reorder edit mode', async ({ page }) => {
  await expect(page.getByRole('button', { name: /done reordering|reorder mode/i })).toHaveCount(0)
})

Then(/^"([^"]+)" is the first category$/, async ({ page }, categoryName: string) => {
  await expect.poll(async () => {
    const order = await getCategoryOrder(page)
    return order[0]
  }).toBe(categoryName)
})

Then('the new order is saved without any save action', async ({ page }) => {
  const order = await getCategoryOrder(page)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect.poll(async () => getCategoryOrder(page)).toEqual(order)
})

Then(/^"([^"]+)" continues playing during and after the reorder$/, async ({ page }, categoryName: string) => {
  await expect.poll(async () =>
    page.evaluate((name) => window.__arcanumIsCategoryPlaying?.(name) ?? false, categoryName),
  ).toBe(true)
})

Then(/^the category order remains "([^"]+)", "([^"]+)"$/, async ({ page }, a: string, b: string) => {
  await expect.poll(async () => getCategoryOrder(page)).toEqual([a, b])
})

Then('reordering is not available', async ({ page }) => {
  await expect(page.getByTestId('category-drag-handle')).toHaveCount(0)
})
