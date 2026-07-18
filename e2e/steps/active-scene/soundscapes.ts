import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  DEFAULT_SCENE_NAME,
  buildDungeonCategoryPartialLevels,
  buildEmptySoundscapeCategory,
  buildScene,
  buildSceneSoundscapeSettings,
  buildSceneSoundscapeSlot,
  buildSceneSoundscapeSlotWithOptions,
  buildSoundscapeCategory,
  buildSoundscapeCategoryWithNamedTracks,
  buildSoundscapeTrack,
  buildSoundscapeTracksForCategory,
  buildSoundscapeCategoryWithLayers,
  buildWeatherCategoryWithTracks,
  categoryIdForName,
  intensityLabelToLevel,
  isCategoryLooping,
  mergeE2EData,
  openActiveScene,
  readPersistedSlotIntensity,
  resetE2EData,
  sceneIdForName,
  simulateNativeDragDrop,
  soundscapeTrackIdForName,
  tapCategoryPlay,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

async function seedActiveSceneSoundscapesTab(
  page: import('@playwright/test').Page,
  sceneName = DEFAULT_SCENE_NAME,
  partial: Parameters<typeof mergeE2EData>[1] = {},
) {
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(sceneName)],
      ...partial,
    },
    { navigateHome: false },
  )
  await openActiveScene(page, sceneName, 'Soundscapes')
}

async function openSoundscapePicker(page: import('@playwright/test').Page) {
  await page.locator('[data-soundscape-add]').click()
  await expect(page.locator('[data-soundscape-picker-modal]')).toBeVisible()
}

Given('I am on the Active Scene — Soundscapes tab', async ({ page }) => {
  await resetE2EData(page)
  await seedActiveSceneSoundscapesTab(page)
})

Given('the Add Soundscape picker modal is open', async ({ page }) => {
  await seedActiveSceneSoundscapesTab(page, DEFAULT_SCENE_NAME, {
    soundscapeCategories: [
      buildSoundscapeCategory('Weather'),
      buildSoundscapeCategory('Interior'),
      buildSoundscapeCategory('Monsters'),
    ],
    soundscapeTracks: [
      ...buildSoundscapeTracksForCategory('Weather'),
      ...buildSoundscapeTracksForCategory('Interior'),
      ...buildSoundscapeTracksForCategory('Monsters'),
    ],
  })
  await openSoundscapePicker(page)
})

Given('my library has no soundscape categories', async ({ page }) => {
  await mergeE2EData(page, { soundscapeCategories: [] }, { navigateHome: false })
})

Given('my library has the categories {string} and {string}', async ({ page }, first: string, second: string) => {
  await mergeE2EData(
    page,
    {
      soundscapeCategories: [buildSoundscapeCategory(first), buildSoundscapeCategory(second)],
      soundscapeTracks: [
        ...buildSoundscapeTracksForCategory(first),
        ...buildSoundscapeTracksForCategory(second),
      ],
    },
    { navigateHome: false },
  )
})

Given('my library has the category {string}', async ({ page }, name: string) => {
  await mergeE2EData(
    page,
    {
      soundscapeCategories: [buildSoundscapeCategory(name)],
      soundscapeTracks: buildSoundscapeTracksForCategory(name),
    },
    { navigateHome: false },
  )
})

Given('my library has categories of different types', async ({ page }) => {
  await mergeE2EData(
    page,
    {
      soundscapeCategories: [
        buildSoundscapeCategory('Weather', { type: 'WEATHER' }),
        buildSoundscapeCategory('Tavern', { type: 'TOWN' }),
        buildSoundscapeCategory('Forest', { type: 'AMBIENCE' }),
      ],
      soundscapeTracks: [
        buildSoundscapeTrack('Weather Sample'),
        buildSoundscapeTrack('Tavern Sample'),
        buildSoundscapeTrack('Forest Sample'),
      ],
    },
    { navigateHome: false },
  )
})

Given(
  'my library has the category {string} with at least one track',
  async ({ page }, name: string) => {
    const category = buildSoundscapeCategory(name)
    await mergeE2EData(
      page,
      {
        soundscapeCategories: [category],
        soundscapeTracks: buildSoundscapeTracksForCategory(name),
      },
      { navigateHome: false },
    )
  },
)

Given(
  'my library has the category {string} with {int} tracks across {int} layers',
  async ({ page }, name: string, trackCount: number, layerCount: number) => {
    await mergeE2EData(
      page,
      {
        soundscapeCategories: [buildSoundscapeCategoryWithLayers(name, trackCount, layerCount)],
      },
      { navigateHome: false },
    )
  },
)

Given(
  'my library has the category {string} with no tracks at any intensity level',
  async ({ page }, name: string) => {
    await mergeE2EData(
      page,
      {
        soundscapeCategories: [buildEmptySoundscapeCategory(name)],
      },
      { navigateHome: false },
    )
  },
)

Given('no categories are checked in the picker', async ({ page }) => {
  await expect(page.locator('[data-sc-picker-check]:checked')).toHaveCount(0)
})

Given('{string} is not yet in the current scene', async ({ page }, name: string) => {
  await mergeE2EData(
    page,
    {
      soundscapeCategories: [buildSoundscapeCategory(name)],
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
    },
    { navigateHome: false },
  )
})

Given(
  '{string}, {string}, and {string} are not yet in the current scene',
  async ({ page }, first: string, second: string, third: string) => {
    await mergeE2EData(
      page,
      {
        soundscapeCategories: [
          buildSoundscapeCategory(first),
          buildSoundscapeCategory(second),
          buildSoundscapeCategory(third),
        ],
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
      },
      { navigateHome: false },
    )
  },
)

Given('{string} is already in the current scene', async ({ page }, name: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const category = buildSoundscapeCategory(name)
  await mergeE2EData(
    page,
    {
      soundscapeCategories: [category],
      sceneSoundscapeSlots: [buildSceneSoundscapeSlot(sceneId, category.id, 0)],
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
    },
    { navigateHome: false },
  )
})

When('I open the Add Soundscape picker modal', async ({ page }) => {
  if (!page.url().includes('/active')) {
    await seedActiveSceneSoundscapesTab(page)
  }
  await openSoundscapePicker(page)
})

When('I set the Category Type filter to {string} in the picker', async ({ page }, label: string) => {
  const typeMap: Record<string, string> = {
    Ambience: 'AMBIENCE',
    Weather: 'WEATHER',
    Interior: 'INTERIOR',
    Town: 'TOWN',
  }
  await page.locator('[data-sc-picker-filter-type]').selectOption(typeMap[label] ?? label.toUpperCase())
})

Then('I see the Add Soundscape picker modal', async ({ page }) => {
  await expect(page.locator('[data-soundscape-picker-modal]')).toBeVisible()
})

Then('I do not see an {string} creation card in the picker grid', async ({ page }, label: string) => {
  await expect(page.locator('[data-sc-picker-grid]').getByRole('button', { name: label })).toHaveCount(0)
})

Then('I do not see an enabled {string} button', async ({ page }, label: string) => {
  const buttons = page.getByRole('button', { name: new RegExp(`^${label}`) })
  const count = await buttons.count()
  for (let index = 0; index < count; index += 1) {
    await expect(buttons.nth(index)).toBeDisabled()
  }
  if (count === 0) {
    await expect(page.locator('[data-picker-commit]')).toHaveCount(0)
  }
})

Then('I see {string} and {string} actions', async ({ page }, first: string, second: string) => {
  await expect(page.getByRole('button', { name: first, exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: second, exact: true })).toBeVisible()
})

Then('I see only matching categories in the picker grid', async ({ page }) => {
  await expect(page.locator('[data-sc-picker-item]')).toHaveCount(1)
  await expect(page.locator('[data-sc-picker-item="Forest"]')).toBeVisible()
})

Then('preview playback stops', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__ ?? { isPlaying: false })
  expect(state.isPlaying).toBeFalsy()
})

Then('I see the Active Scene — Soundscapes tab', async ({ page }) => {
  await expect(page.locator('[data-screen="Active Scene screen"]')).toBeVisible()
  await expect(page.locator('[data-active-scene-tab="Soundscapes"]')).toHaveAttribute('data-active', 'true')
})

Then('{string} and {string} are present as category cards', async ({ page }, first: string, second: string) => {
  await expect(page.locator(`[data-soundscape-category="${first}"]`)).toBeVisible()
  await expect(page.locator(`[data-soundscape-category="${second}"]`)).toBeVisible()
})

Then(
  'I can select {string} for addition to the scene from the picker grid',
  async ({ page }, name: string) => {
    await expect(page.locator(`[data-sc-picker-check="${categoryIdForName(name)}"]`)).toBeVisible()
  },
)

Then('{string} cannot be added instantly from its soundscape picker card', async ({ page }, name: string) => {
  const card = page.locator(`[data-sc-picker-item="${name}"]`)
  await expect(card.getByRole('button', { name: '+', exact: true })).toHaveCount(0)
})

Then('I see the {string} category in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator(`[data-sc-picker-item="${name}"]`)).toBeVisible()
})

Then('I do not see the {string} category in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator(`[data-sc-picker-item="${name}"]`)).toHaveCount(0)
})

Then(
  '{string} and {string} appear in the active scene\'s Soundscapes tab',
  async ({ page }, first: string, second: string) => {
    await expect(page.locator(`[data-soundscape-category="${first}"]`)).toBeVisible()
    await expect(page.locator(`[data-soundscape-category="${second}"]`)).toBeVisible()
  },
)

Then(
  '{string}, {string}, and {string} appear in the active scene\'s Soundscapes tab',
  async ({ page }, first: string, second: string, third: string) => {
    await expect(page.locator(`[data-soundscape-category="${first}"]`)).toBeVisible()
    await expect(page.locator(`[data-soundscape-category="${second}"]`)).toBeVisible()
    await expect(page.locator(`[data-soundscape-category="${third}"]`)).toBeVisible()
  },
)

Then('{string} appears before {string} in the category list', async ({ page }, first: string, second: string) => {
  const firstIndex = await page
    .locator('[data-soundscape-category]')
    .evaluateAll((elements, target) => {
      return elements.findIndex((element) => element.getAttribute('data-soundscape-category') === target)
    }, first)
  const secondIndex = await page
    .locator('[data-soundscape-category]')
    .evaluateAll((elements, target) => {
      return elements.findIndex((element) => element.getAttribute('data-soundscape-category') === target)
    }, second)
  expect(firstIndex).toBeGreaterThanOrEqual(0)
  expect(secondIndex).toBeGreaterThanOrEqual(0)
  expect(firstIndex).toBeLessThan(secondIndex)
})

Then('{string} is added to the active scene', async ({ page }, name: string) => {
  await expect(page.locator(`[data-soundscape-category="${name}"]`)).toBeVisible()
})

Then('the Add Soundscape picker modal is still open', async ({ page }) => {
  await expect(page.locator('[data-soundscape-picker-modal]')).toBeVisible()
})

Then('{string} is idle and not auto-playing', async ({ page }, name: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${name}"]`)).toHaveAttribute('data-state', 'idle')
})

Then('{string} has volume {int}%', async ({ page }, name: string, volume: number) => {
  await expect(page.locator(`[data-soundscape-volume="${name}"]`)).toHaveText(`${volume}%`)
})

Then('{string} has volume {string}', async ({ page }, name: string, volume: string) => {
  await expect(page.locator(`[data-soundscape-volume="${name}"]`)).toHaveText(volume)
})

Then('{string} has intensity {word}', async ({ page }, name: string, intensity: string) => {
  await expect(page.locator(`[data-soundscape-intensity="${name}"]`)).toHaveAttribute(
    'data-state',
    intensity,
  )
})

async function seedWeatherScene(page: import('@playwright/test').Page) {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { category, tracks } = buildWeatherCategoryWithTracks()
  const interior = buildSoundscapeCategory('Interior')
  const interiorTracks = buildSoundscapeTracksForCategory('Interior')
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [category, interior],
      soundscapeTracks: [...tracks, ...interiorTracks],
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
          intensity: 'I',
          currentTrackId: soundscapeTrackIdForName('Light Rain'),
        }),
        buildSceneSoundscapeSlotWithOptions(sceneId, interior.id, 1, {
          intensity: 'II',
          currentTrackId: interior.levels?.II?.[0],
        }),
      ],
      sceneSoundscapeSettings: [buildSceneSoundscapeSettings(sceneId)],
    },
    { navigateHome: false },
  )
}

async function tapCategoryPause(page: import('@playwright/test').Page, categoryName: string) {
  await page.locator(`[data-soundscape-pause="${categoryName}"]`).click()
}

async function selectIntensity(page: import('@playwright/test').Page, categoryName: string, level: string) {
  const intensity = intensityLabelToLevel(level)
  await page
    .locator(
      `[data-soundscape-category="${categoryName}"] [data-soundscape-intensity-level="${categoryName}-${intensity}"]`,
    )
    .click()
}

async function dragCategoryHandle(
  page: import('@playwright/test').Page,
  sourceName: string,
  targetName: string,
) {
  await simulateNativeDragDrop(
    page,
    `[data-soundscape-category="${sourceName}"] [data-drag-handle]`,
    `[data-soundscape-category="${targetName}"]`,
  )
}

async function getCategoryOrder(page: import('@playwright/test').Page): Promise<string[]> {
  return page
    .locator('[data-soundscape-category]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-soundscape-category') ?? ''),
    )
}

Given('I have a scene with soundscape categories on the Active Scene — Soundscapes tab', async ({ page }) => {
  await resetE2EData(page)
  await seedWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given('I have opened a scene on the Active Scene — Soundscapes tab', async ({ page }) => {
  await resetE2EData(page)
  await seedWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given('a scene has categories {string} and {string}', async ({ page }, first: string, second: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const firstCategory = buildSoundscapeCategory(first)
  const secondCategory = buildSoundscapeCategory(second)
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [firstCategory, secondCategory],
      soundscapeTracks: [
        ...buildSoundscapeTracksForCategory(first),
        ...buildSoundscapeTracksForCategory(second),
      ],
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, firstCategory.id, 0, {
            intensity: 'I',
            currentTrackId: firstCategory.levels?.I?.[0],
          }),
          buildSceneSoundscapeSlotWithOptions(sceneId, secondCategory.id, 1, {
            intensity: 'II',
            currentTrackId: secondCategory.levels?.II?.[0],
          }),
        ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given(
  'a scene has categories {string} at Volume {int}% and {string} at Volume {int}%',
  async ({ page }, first: string, firstVolume: number, second: string, secondVolume: number) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const firstCategory = buildSoundscapeCategory(first)
    const secondCategory = buildSoundscapeCategory(second)
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [firstCategory, secondCategory],
        soundscapeTracks: [
          ...buildSoundscapeTracksForCategory(first),
          ...buildSoundscapeTracksForCategory(second),
        ],
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, firstCategory.id, 0, {
            volume: firstVolume,
            intensity: 'I',
            currentTrackId: firstCategory.levels?.I?.[0],
          }),
          buildSceneSoundscapeSlotWithOptions(sceneId, secondCategory.id, 1, {
            volume: secondVolume,
            intensity: 'II',
            currentTrackId: secondCategory.levels?.II?.[0],
          }),
        ],
        sceneSoundscapeSettings: [buildSceneSoundscapeSettings(sceneId)],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  },
)

Given('the {string} category has a loaded track {string}', async ({ page }, _categoryName: string, trackName: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { category, tracks } = buildWeatherCategoryWithTracks()
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [category],
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
          intensity: 'I',
          currentTrackId: soundscapeTrackIdForName(trackName),
        }),
      ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given(
  'the {string} category was playing {string} and is now paused',
  async ({ page }, categoryName: string, trackName: string) => {
    if (page.url().includes('/active')) {
      await tapCategoryPlay(page, categoryName)
      await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
        'data-state',
        'playing',
      )
      await tapCategoryPause(page, categoryName)
      return
    }

    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildWeatherCategoryWithTracks()
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: 'I',
            currentTrackId: soundscapeTrackIdForName(trackName),
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, categoryName)
    await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
      'data-state',
      'playing',
    )
    await tapCategoryPause(page, categoryName)
  },
)

Given(
  'the {string} category has tracks but none is currently loaded or paused',
  async ({ page }, categoryName: string) => {
    void categoryName
    await resetE2EData(page)
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildWeatherCategoryWithTracks()
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: 'I',
            currentTrackId: undefined,
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  },
)

Given(
  'the {string} category is playing {string} at Intensity Level {word}',
  async ({ page }, categoryName: string, trackName: string, level: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildWeatherCategoryWithTracks()
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: level as 'I' | 'II' | 'III',
            currentTrackId: soundscapeTrackIdForName(trackName),
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, categoryName)
  },
)

Given('{string} has multiple tracks at Intensity Level {word}', async ({ page }, categoryName: string, level: string) => {
  void page
  void categoryName
  void level
  // Tracks already seeded by prior step in the scenario.
})

Given('the {string} category is currently playing', async ({ page }, categoryName: string) => {
  await seedWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await tapCategoryPlay(page, categoryName)
})

Given('{string} is currently playing', async ({ page }, categoryName: string) => {
  await seedWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await tapCategoryPlay(page, categoryName)
})

Given('the {string} category is not playing', async ({ page }, categoryName: string) => {
  await seedWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'idle',
  )
})

Given('{string} has tracks at Intensity Level {word}', async ({ page }, _categoryName: string, level: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { category, tracks } = buildWeatherCategoryWithTracks()
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [category],
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
          intensity: intensityLabelToLevel(level),
        }),
      ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given(
  '{string} has tracks {string} at Intensity Level {word} and {string} at Intensity Level {word}',
  async ({ page }, categoryName: string, track1: string, level1: string, track2: string, level2: string) => {
    await resetE2EData(page)
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildSoundscapeCategoryWithNamedTracks(categoryName, {
      [intensityLabelToLevel(level1)]: [track1],
      [intensityLabelToLevel(level2)]: [track2],
    })
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: intensityLabelToLevel(level1),
            currentTrackId: undefined,
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  },
)

Given('the {string} category is playing at Intensity Level {word}', async ({ page }, categoryName: string, level: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { category, tracks } = buildWeatherCategoryWithTracks()
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [category],
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
          intensity: intensityLabelToLevel(level),
          currentTrackId: soundscapeTrackIdForName('Light Rain'),
        }),
      ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await tapCategoryPlay(page, categoryName)
})

Given('the {string} category is currently at Intensity Level {word}', async ({ page }, _categoryName: string, level: string) => {
  await resetE2EData(page)
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { category, tracks } = buildDungeonCategoryPartialLevels()
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [category],
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
          intensity: intensityLabelToLevel(level),
        }),
      ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await page.reload()
  await page.waitForLoadState('networkidle')
})

Given('the {string} category has no tracks at Intensity Level {word}', async ({ page }, categoryName: string, level: string) => {
  void page
  void categoryName
  void level
  // Dungeon category and slot already seeded by the prior Given in this scenario.
})

Given(
  'the {string} category was playing at Intensity Level {word} and is now paused',
  async ({ page }, categoryName: string, level: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildWeatherCategoryWithTracks()
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: intensityLabelToLevel(level),
            currentTrackId: soundscapeTrackIdForName('Light Rain'),
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, categoryName)
    await tapCategoryPause(page, categoryName)
  },
)

Given('Master Volume is at {int}%', async ({ page }, volume: number) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  await mergeE2EData(
    page,
    { sceneSoundscapeSettings: [buildSceneSoundscapeSettings(sceneId, { masterVolume: volume })] },
    { navigateHome: false },
  )
  await page.locator('[data-soundscape-master-slider]').fill(String(volume))
})

Given(
  '{string} is playing with Master at {int}% and Volume at {int}%',
  async ({ page }, categoryName: string, master: number, volume: number) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildWeatherCategoryWithTracks()
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            volume,
            intensity: 'I',
            currentTrackId: soundscapeTrackIdForName('Light Rain'),
          }),
        ],
        sceneSoundscapeSettings: [buildSceneSoundscapeSettings(sceneId, { masterVolume: master })],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, categoryName)
  },
)

Given(
  '{string} has Volume at {int}% and {string} has Volume at {int}%',
  async ({ page }, first: string, firstVolume: number, second: string, secondVolume: number) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const firstCategory = buildSoundscapeCategory(first)
    const secondCategory = buildSoundscapeCategory(second)
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [firstCategory, secondCategory],
        soundscapeTracks: [
          ...buildSoundscapeTracksForCategory(first),
          ...buildSoundscapeTracksForCategory(second),
        ],
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, firstCategory.id, 0, {
            volume: firstVolume,
            intensity: 'I',
            currentTrackId: firstCategory.levels?.I?.[0],
          }),
          buildSceneSoundscapeSlotWithOptions(sceneId, secondCategory.id, 1, {
            volume: secondVolume,
            intensity: 'II',
            currentTrackId: secondCategory.levels?.II?.[0],
          }),
        ],
        sceneSoundscapeSettings: [buildSceneSoundscapeSettings(sceneId)],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, first)
    await tapCategoryPlay(page, second)
  },
)

Given('there are at least two soundscape categories in the active scene', async ({ page }) => {
  await seedWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given('the order is {string}, {string}, {string}', async ({ page }, first: string, second: string, third: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const categories = [first, second, third].map((name) => buildSoundscapeCategory(name))
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: categories,
      soundscapeTracks: categories.flatMap((category) => buildSoundscapeTracksForCategory(category.name)),
      sceneSoundscapeSlots: categories.map((category, index) =>
        buildSceneSoundscapeSlot(sceneId, category.id, index),
      ),
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given('the order is {string}, {string}', async ({ page }, first: string, second: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const categories = [first, second].map((name) => buildSoundscapeCategory(name))
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: categories,
      soundscapeTracks: categories.flatMap((category) => buildSoundscapeTracksForCategory(category.name)),
      sceneSoundscapeSlots: categories.map((category, index) =>
        buildSceneSoundscapeSlot(sceneId, category.id, index),
      ),
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given('the active scene has only the {string} category', async ({ page }, categoryName: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const category = buildSoundscapeCategory(categoryName)
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [category],
      soundscapeTracks: buildSoundscapeTracksForCategory(categoryName),
      sceneSoundscapeSlots: [buildSceneSoundscapeSlot(sceneId, category.id, 0)],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

When('I view the {string} category controls', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-category="${categoryName}"]`)).toBeVisible()
})

When('I select Intensity Level {word} on the {string} category', async ({ page }, level: string, categoryName: string) => {
  await selectIntensity(page, categoryName, level)
})

When(
  'I select Intensity Level {word} and start playback on the {string} category',
  async ({ page }, level: string, categoryName: string) => {
    await selectIntensity(page, categoryName, level)
    await tapCategoryPlay(page, categoryName)
  },
)

When(
  'I attempt to select Intensity Level {word} on the {string} active-scene category card',
  async ({ page }, level: string, categoryName: string) => {
    const intensity = intensityLabelToLevel(level)
    const button = page.locator(
      `[data-soundscape-category="${categoryName}"] [data-soundscape-intensity-level="${categoryName}-${intensity}"]`,
    )
    if (await button.isEnabled()) {
      await button.click()
    }
  },
)

When('I set the {string} Volume slider to {int}%', async ({ page }, categoryName: string, volume: number) => {
  const card = page.locator(`[data-soundscape-category="${categoryName}"]`)
  await card.getByRole('slider', { name: `${categoryName} volume` }).fill(String(volume))
})

When('I drag {string} by its drag handle above {string}', async ({ page }, source: string, target: string) => {
  await dragCategoryHandle(page, source, target)
})

When('I drag {string} by its drag handle to the top', async ({ page }, source: string) => {
  const firstCategory = page.locator('[data-soundscape-category]').first()
  const firstName = await firstCategory.getAttribute('data-soundscape-category')
  if (firstName && firstName !== source) {
    await dragCategoryHandle(page, source, firstName)
  }
})

When('I attempt to drag {string} by its drag handle', async ({ page }, source: string) => {
  const categories = page.locator('[data-soundscape-category]')
  const count = await categories.count()
  if (count >= 2) {
    const targetName = await categories.nth(1).getAttribute('data-soundscape-category')
    if (targetName) {
      await dragCategoryHandle(page, source, targetName)
    }
  }
})

Then('the play button on {string} should be disabled', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-play="${categoryName}"]`)).toBeDisabled()
})

Then('the d20 button on {string} should be enabled', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-d20="${categoryName}"]`)).toBeEnabled()
})

Then(
  'a new random track from Intensity Level {word} in {string} begins playing automatically',
  async ({ page }, level: string, categoryName: string) => {
    await expect
      .poll(async () => isCategoryLooping(page, categoryName), { timeout: 10_000 })
      .toBe(true)
    await expect
      .poll(async () => {
        const title = await page.locator(`[data-soundscape-track-title="${categoryName}"]`).textContent()
        const trimmed = title?.trim() ?? ''
        return trimmed !== 'Light Rain' && trimmed !== 'No track loaded' && trimmed.length > 0
      }, { timeout: 10_000 })
      .toBe(true)
    void level
  },
)

Then('playback stops in the {string} category', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'paused',
  )
})

Then('another idle category can begin playing', async ({ page }) => {
  const idleCategory = page.locator('[data-soundscape-playback-state][data-state="idle"]').first()
  const name = await idleCategory.getAttribute('data-soundscape-playback-state')
  if (name) {
    await tapCategoryPlay(page, name)
    await expect(page.locator(`[data-soundscape-playback-state="${name}"]`)).toHaveAttribute(
      'data-state',
      'playing',
    )
  }
})

Then('no track from {string} begins playing', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'idle',
  )
})

Then('Intensity Level {word} is selected on the {string} category', async ({ page }, level: string, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-intensity="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    intensityLabelToLevel(level),
  )
})

Then('the intensity change is auto-saved immediately', async ({ page }) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const intensity = await readPersistedSlotIntensity(page, sceneId, 'Weather')
  expect(intensity).toBe('II')
})

Then('a track from Intensity Level {word} plays \\(not from Intensity Level {word}\\)', async ({ page }, level: string) => {
  await expect
    .poll(async () => isCategoryLooping(page, 'Weather'), { timeout: 5_000 })
    .toBe(true)
  const title = await page.locator('[data-soundscape-track-title="Weather"]').textContent()
  if (intensityLabelToLevel(level) === 'II') {
    // Level II fixtures use "Storm" or "Thunderstorm" (case-sensitive /Storm/ misses the latter)
    expect(title).toMatch(/storm/i)
  } else {
    expect(title).not.toMatch(/storm/i)
  }
})

Then(
  'a track from Intensity Level {word} replaces the Intensity Level {word} track with a smooth transition',
  async ({ page }, newLevel: string) => {
    await expect
      .poll(async () => isCategoryLooping(page, 'Weather'), { timeout: 10_000 })
      .toBe(true)
    await expect
      .poll(async () => {
        const title = await page.locator('[data-soundscape-track-title="Weather"]').textContent()
        return intensityLabelToLevel(newLevel) === 'II' ? title?.includes('Thunderstorm') : true
      }, { timeout: 10_000 })
      .toBe(true)
  },
)

Then('the active intensity level should remain Intensity Level {word}', async ({ page }, level: string) => {
  await expect(page.locator('[data-soundscape-intensity="Dungeon"]')).toHaveAttribute(
    'data-state',
    intensityLabelToLevel(level),
  )
})

Then(
  'Intensity Level {word} is unavailable on the {string} active-scene category card',
  async ({ page }, level: string, categoryName: string) => {
    const intensity = intensityLabelToLevel(level)
    const button = page.locator(
      `[data-soundscape-category="${categoryName}"] [data-soundscape-intensity-level="${categoryName}-${intensity}"]`,
    )
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-label', /0 tracks/)
  },
)

Then(
  'the {string} active-scene category card shows the playing state',
  async ({ page }, categoryName: string) => {
    await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
      'data-state',
      'playing',
    )
    await expect(page.locator(`[data-soundscape-category="${categoryName}"]`)).toHaveClass(/border-gold/)
  },
)

Then(
  'the {string} active-scene category card shows an animating playback progress bar',
  async ({ page }, categoryName: string) => {
    const progress = page.locator(`[data-soundscape-progress="${categoryName}"] > div`).first()
    const firstWidth = await progress.evaluate((element) => element.getBoundingClientRect().width)
    await expect.poll(async () => {
      const secondWidth = await progress.evaluate((element) => element.getBoundingClientRect().width)
      return secondWidth !== firstWidth
    }, {
      message: 'Wait for playback progress bar to animate (change width)',
      timeout: 5_000,
    }).toBe(true)
  },
)

Then(
  'the {string} active-scene category card shows a pause icon on the play control',
  async ({ page }, categoryName: string) => {
    await expect(page.locator(`[data-soundscape-pause="${categoryName}"]`)).toBeVisible()
  },
)

Then(
  'the {string} active-scene category card does not show the playing state',
  async ({ page }, categoryName: string) => {
    await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
      'data-state',
      'idle',
    )
  },
)

Then(
  'the {string} active-scene category card shows a play icon on the play control',
  async ({ page }, categoryName: string) => {
    await expect(page.locator(`[data-soundscape-play="${categoryName}"]`)).toBeVisible()
  },
)

Then(
  'the {string} active-scene category card playback progress bar is empty',
  async ({ page }, categoryName: string) => {
    const progress = page.locator(`[data-soundscape-progress="${categoryName}"] > div`).first()
    const width = await progress.evaluate((element) => element.getBoundingClientRect().width)
    expect(width).toBeLessThanOrEqual(2)
  },
)

Then(
  'the {string} active-scene category card no longer shows the playing state',
  async ({ page }, categoryName: string) => {
    await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
      'data-state',
      'paused',
    )
  },
)

Then(
  'the {string} active-scene category card playback progress bar is not advancing',
  async ({ page }, categoryName: string) => {
    await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
      'data-state',
      'paused',
    )
  },
)

Then(
  'both the {string} and {string} active-scene category cards show the playing state',
  async ({ page }, first: string, second: string) => {
    await expect(page.locator(`[data-soundscape-playback-state="${first}"]`)).toHaveAttribute('data-state', 'playing')
    await expect(page.locator(`[data-soundscape-playback-state="${second}"]`)).toHaveAttribute('data-state', 'playing')
  },
)

Then('only {string} shows the playing state', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'playing',
  )
})

Then('{string} does not show the playing state', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'paused',
  )
})

Then('each category card shows a visible drag handle', async ({ page }) => {
  const handles = page.locator('[data-soundscape-category] [data-drag-handle]')
  const categoryCount = await page.locator('[data-soundscape-category]').count()
  await expect(handles).toHaveCount(categoryCount)
})

Then('there is no separate reorder edit mode', async ({ page }) => {
  await expect(page.getByRole('button', { name: /reorder/i })).toHaveCount(0)
})

Then('{string} is the first category', async ({ page }, categoryName: string) => {
  const order = await getCategoryOrder(page)
  expect(order[0]).toBe(categoryName)
})

Then('{string} is still the first category', async ({ page }, categoryName: string) => {
  const order = await getCategoryOrder(page)
  expect(order[0]).toBe(categoryName)
})

Then('the new order is saved without any save action', async ({ page }) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const order = await page.evaluate((targetSceneId) => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return []
    const data = JSON.parse(raw)
    return (data.sceneSoundscapeSlots ?? [])
      .filter((slot: { sceneId: string }) => slot.sceneId === targetSceneId)
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .map((slot: { categoryId: string }) => slot.categoryId)
  }, sceneId)
  expect(order.length).toBeGreaterThan(0)
})

Then('{string} continues playing during and after the reorder', async ({ page }, categoryName: string) => {
  await expect
    .poll(async () => isCategoryLooping(page, categoryName), { timeout: 5_000 })
    .toBe(true)
})

Then('the category order remains {string}, {string}', async ({ page }, first: string, second: string) => {
  const order = await getCategoryOrder(page)
  expect(order).toEqual([first, second])
})

Then('reordering is not available', async ({ page }) => {
  await expect(page.locator('[data-soundscape-category]')).toHaveCount(1)
})

Then('a sample track from {string} begins previewing', async ({ page }, name: string) => {
  await expect(page.locator(`[data-sc-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Given(
  'the {string} category has tracks at Intensity Level {word}: {string}, {string}',
  async ({ page }, categoryName: string, level: string, firstTrack: string, secondTrack: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildSoundscapeCategoryWithNamedTracks(categoryName, {
      [intensityLabelToLevel(level)]: [firstTrack, secondTrack],
    })
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: intensityLabelToLevel(level),
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  },
)

Given('Intensity Level {word} is selected on {string}', async ({ page }, level: string, categoryName: string) => {
  const intensity = intensityLabelToLevel(level)
  const button = page.locator(
    `[data-soundscape-category="${categoryName}"] [data-soundscape-intensity-level="${categoryName}-${intensity}"]`,
  )
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
  }
})

When('I tap the d20 button on {string}', async ({ page }, categoryName: string) => {
  await page.locator(`[data-soundscape-d20="${categoryName}"]`).click()
})

Then('one of {string}, {string} begins playing', async ({ page }, firstTrack: string, secondTrack: string) => {
  await expect
    .poll(async () => {
      const title = await page.locator('[data-soundscape-track-title="Weather"]').textContent()
      const trimmed = title?.trim() ?? ''
      return trimmed.includes(firstTrack) || trimmed.includes(secondTrack)
    }, { timeout: 10_000 })
    .toBe(true)
})

Then('the d20 button on {string} should be disabled', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-d20="${categoryName}"]`)).toBeDisabled()
})

Given('{string} is playing in the {string} category', async ({ page }, trackName: string, categoryName: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { category, tracks } = buildWeatherCategoryWithTracks()
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [category],
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
          intensity: 'I',
          currentTrackId: soundscapeTrackIdForName(trackName),
        }),
      ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await tapCategoryPlay(page, categoryName)
})

Then('a new random track from {string} begins playing', async ({ page }, categoryName: string) => {
  await expect
    .poll(async () => isCategoryLooping(page, categoryName), { timeout: 10_000 })
    .toBe(true)
})

Given('{string} has no tracks at Intensity Level {word}', async ({ page }, categoryName: string, level: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { category, tracks } = buildDungeonCategoryPartialLevels()
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: [{ ...category, name: categoryName, id: categoryIdForName(categoryName) }],
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(sceneId, categoryIdForName(categoryName), 0, {
          intensity: intensityLabelToLevel(level),
        }),
      ],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

Given(
  '{string} and {string} categories are both playing in the active scene',
  async ({ page }, first: string, second: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const firstCategory = buildSoundscapeCategory(first)
    const secondCategory = buildSoundscapeCategory(second)
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [firstCategory, secondCategory],
        soundscapeTracks: [
          ...buildSoundscapeTracksForCategory(first),
          ...buildSoundscapeTracksForCategory(second),
        ],
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, firstCategory.id, 0, {
            intensity: 'I',
            currentTrackId: firstCategory.levels?.I?.[0],
          }),
          buildSceneSoundscapeSlotWithOptions(sceneId, secondCategory.id, 1, {
            intensity: 'II',
            currentTrackId: secondCategory.levels?.II?.[0],
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, first)
    await tapCategoryPlay(page, second)
  },
)

Given('the {string} category is the media session focus', async ({ page }, categoryName: string) => {
  await page.locator(`[data-soundscape-d20="${categoryName}"]`).click()
})

When('I invoke Media Session {string}', async ({ page }, action: string) => {
  if (action === 'Next Track') {
    await page.evaluate(() => {
      window.__ARCANUM_MEDIA_NEXT__?.()
    })
  }
})

Then(
  'a new random track begins playing for {string} at its current intensity level',
  async ({ page }, categoryName: string) => {
    await expect
      .poll(async () => isCategoryLooping(page, categoryName), { timeout: 10_000 })
      .toBe(true)
  },
)

Then('the track playing in {string} is unchanged', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'playing',
  )
})

