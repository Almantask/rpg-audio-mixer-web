import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildDungeonCategoryPartialLevels,
  buildScene,
  buildSceneSoundscapeSlotWithOptions,
  buildSoundscapeCategory,
  buildSoundscapeTracksForCategory,
  buildSoundscapeTrack,
  buildWeatherCategoryWithTracks,
  buildForestCategoryWithLoop,
  isCategoryLooping,
  mergeE2EData,
  openActiveScene,
  resetE2EData,
  sceneIdForName,
  soundscapeTrackIdForName,
  tapCategoryPlay,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

async function seedTavernSoundscapes(page: import('@playwright/test').Page) {
  const tavernSceneId = sceneIdForName('Tavern')
  const forestSceneId = sceneIdForName('Forest')
  const { category: weather, tracks: weatherTracks } = buildWeatherCategoryWithTracks()
  const interior = buildSoundscapeCategory('Interior')
  const interiorTracks = buildSoundscapeTracksForCategory('Interior')
  const { category: dungeon, tracks: dungeonTracks } = buildDungeonCategoryPartialLevels()
  const { category: forest, tracks: forestTracks } = buildForestCategoryWithLoop()
  await mergeE2EData(
    page,
    {
      scenes: [buildScene('Tavern'), buildScene('Forest')],
      soundscapeCategories: [weather, interior, dungeon, forest],
      soundscapeTracks: [...weatherTracks, ...interiorTracks, ...dungeonTracks, ...forestTracks],
      sceneSoundscapeSlots: [
        buildSceneSoundscapeSlotWithOptions(tavernSceneId, weather.id, 0, { intensity: 'I' }),
        buildSceneSoundscapeSlotWithOptions(tavernSceneId, interior.id, 1, { intensity: 'II' }),
        buildSceneSoundscapeSlotWithOptions(tavernSceneId, dungeon.id, 2, { intensity: 'II' }),
        buildSceneSoundscapeSlotWithOptions(forestSceneId, forest.id, 0, { intensity: 'II' }),
      ],
    },
    { navigateHome: false },
  )
}

Given(
  'I have opened the {string} scene on the Active Scene — Soundscapes tab',
  async ({ page }, sceneName: string) => {
    await resetE2EData(page)
    await seedTavernSoundscapes(page)
    await openActiveScene(page, sceneName, 'Soundscapes')
  },
)

Given(
  'the {string} and {string} categories are configured but idle',
  async () => {
    // Seeded by the prior Tavern scene setup step.
  },
)

Given('the {string} category is idle with no tracks at its current Intensity Level', async () => {
  // Dungeon slot seeded empty at level II in Tavern setup.
})

Given('{string} is the current playing scene', async ({ page }, sceneName: string) => {
  await resetE2EData(page)
  await seedTavernSoundscapes(page)
  await openActiveScene(page, sceneName, 'Soundscapes')
  await tapCategoryPlay(page, 'Weather')
})

When(
  'I switch from the {string} scene to the {string} scene',
  async ({ page }, _from: string, to: string) => {
    await openActiveScene(page, to, 'Soundscapes')
    await page.locator('[data-play-scene]').click()
  },
)

Then(
  'a random track from each category\'s current intensity pool begins playing',
  async ({ page }) => {
    await expect(page.locator('[data-soundscape-playback-state="Weather"]')).toHaveAttribute(
      'data-state',
      'playing',
    )
    await expect(page.locator('[data-soundscape-playback-state="Interior"]')).toHaveAttribute(
      'data-state',
      'playing',
    )
  },
)

Then('both category cards show the playing state', async ({ page }) => {
  await expect(page.locator('[data-soundscape-playback-state="Weather"]')).toHaveAttribute(
    'data-state',
    'playing',
  )
  await expect(page.locator('[data-soundscape-playback-state="Interior"]')).toHaveAttribute(
    'data-state',
    'playing',
  )
})

Then('{string} resumes in the {string} category', async ({ page }, trackName: string, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-track-title="${categoryName}"]`)).toContainText(trackName)
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'playing',
  )
})

Then(
  'a random track from the {string} category\'s current intensity pool begins playing',
  async ({ page }, categoryName: string) => {
    await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
      'data-state',
      'playing',
    )
  },
)

Then('{string} continues playing in the {string} category', async ({ page }, trackName: string, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-track-title="${categoryName}"]`)).toContainText(trackName)
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'playing',
  )
})

Then(
  'a random track from each available category\'s current intensity pool begins playing',
  async ({ page }) => {
    await expect(page.locator('[data-soundscape-playback-state="Weather"]')).toHaveAttribute(
      'data-state',
      'playing',
    )
    await expect(page.locator('[data-soundscape-playback-state="Interior"]')).toHaveAttribute(
      'data-state',
      'playing',
    )
  },
)

Then('no track begins playing in the {string} category', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'idle',
  )
})

Then('the {string} category is idle', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'idle',
  )
})

Then(
  'the {string} audio fades out while the {string} audio fades in simultaneously',
  async ({ page }, _from: string, to: string) => {
    await expect
      .poll(async () => isCategoryLooping(page, to === 'Forest' ? 'Forest' : to), { timeout: 15_000 })
      .toBe(true)
  },
)

Given(
  'the {string} category is playing {string}',
  async ({ page }, categoryName: string, trackName: string) => {
    const sceneId = sceneIdForName('Tavern')
    if (categoryName === 'Interior') {
      const interior = buildSoundscapeCategory('Interior')
      const crackling = buildSoundscapeTrack('Crackling Fire', {
        id: soundscapeTrackIdForName('Crackling Fire'),
      })
      interior.levels = { I: [], II: [crackling.id], III: [] }
      await mergeE2EData(
        page,
        {
          scenes: [buildScene('Tavern')],
          soundscapeCategories: [interior],
          soundscapeTracks: [crackling],
          sceneSoundscapeSlots: [
            buildSceneSoundscapeSlotWithOptions(sceneId, interior.id, 1, {
              intensity: 'II',
              currentTrackId: crackling.id,
            }),
          ],
        },
        { navigateHome: false },
      )
      await openActiveScene(page, 'Tavern', 'Soundscapes')
      await tapCategoryPlay(page, categoryName)
      return
    }

    const { category, tracks } = buildWeatherCategoryWithTracks()
    const trackId = soundscapeTrackIdForName(trackName)
    await mergeE2EData(
      page,
      {
        scenes: [buildScene('Tavern')],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: trackName === 'Thunderstorm' ? 'II' : 'I',
            currentTrackId: trackId,
          }),
        ],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, 'Tavern', 'Soundscapes')
    await tapCategoryPlay(page, categoryName)
  },
)

Given('the {string} category is idle', async ({ page }, categoryName: string) => {
  void categoryName
  void page
})
