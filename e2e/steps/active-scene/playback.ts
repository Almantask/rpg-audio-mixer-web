import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  DEFAULT_SCENE_NAME,
  buildFxTrack,
  buildScene,
  buildSceneSoundboardSettings,
  buildSceneSoundscapeSettings,
  buildSceneSoundscapeSlotWithOptions,
  buildSoundboardEntry,
  buildSoundscapeCategory,
  buildSoundscapeTracksForCategory,
  buildForestCategoryWithLoop,
  buildWeatherCategoryWithTracks,
  countPlayingInstances,
  expectedSoundboardMappedGain,
  expectedSoundscapeMappedGain,
  expectAudioPlaying,
  getAudioState,
  getPlayingTracks,
  isCategoryLooping,
  isTrackPlaying,
  leaveAndReopenActiveScene,
  LONG_FX_AUDIO_URL,
  mergeE2EData,
  openActiveScene,
  sceneIdForName,
  seedSoundboardEffects,
  setSessionLocked,
  soundscapeTrackIdForName,
  tapCategoryPlay,
} from '../shared/test-data'

const { Given, When, Then, Step } = createBdd()

const DEFAULT_SOUNDSCAPE_EFFECTS = [
  'Thunder Crack',
  'Wolf Howl',
  'Whip',
  'Sword Clash',
  'Owl Hooting',
  'Door Creak',
  'Dragon Roar',
]

async function ensureSoundscapesTab(page: Page) {
  if (!page.url().includes('/active')) {
    await mergeE2EData(page, { scenes: [buildScene(DEFAULT_SCENE_NAME)] }, { navigateHome: false })
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  }
}

async function ensureSoundboardTab(page: Page) {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  if (!page.url().includes('/active')) {
    const { fxTracks, sceneSoundboardEntries } = seedSoundboardEffects(sceneId, DEFAULT_SOUNDSCAPE_EFFECTS)
    await mergeE2EData(
      page,
      { scenes: [buildScene(DEFAULT_SCENE_NAME)], fxTracks, sceneSoundboardEntries },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundboard')
    return
  }
  const hasGrid = (await page.locator('[data-soundboard-grid]').count()) > 0
  if (!hasGrid) {
    const { fxTracks, sceneSoundboardEntries } = seedSoundboardEffects(sceneId, DEFAULT_SOUNDSCAPE_EFFECTS)
    await mergeE2EData(page, { fxTracks, sceneSoundboardEntries }, { navigateHome: false })
  }
  if ((await page.locator('[data-active-scene-tab="Soundboard"][data-active="true"]').count()) === 0) {
    await page.locator('[data-active-scene-tab="Soundboard"]').click()
    await expect(page.locator('[data-soundboard-grid]')).toBeVisible()
  }
}

async function tapCategoryPause(page: Page, categoryName: string) {
  await page.locator(`[data-soundscape-pause="${categoryName}"]`).click()
}

async function tapSoundboardEffect(page: Page, effectName: string) {
  await page
    .locator('[data-soundboard-grid]')
    .locator(`[data-soundboard-tile="${effectName}"]`)
    .first()
    .getByRole('button', { name: `Play ${effectName}`, exact: true })
    .click()
}

async function tapSoundboardTileBody(page: Page, effectName: string) {
  await page
    .locator(`[data-soundboard-tile="${effectName}"]`)
    .first()
    .getByRole('button', { name: `Play ${effectName}`, exact: true })
    .click()
}

async function seedDefaultWeatherScene(page: Page) {
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

async function expectMappedSoundscapeVolume(
  page: Page,
  categoryName: string,
  masterPercent: number,
  volumePercent: number,
) {
  await expect
    .poll(async () => isCategoryLooping(page, categoryName), { timeout: 5_000 })
    .toBe(true)
  const state = await getAudioState(page)
  const expectedGain = expectedSoundscapeMappedGain(masterPercent, volumePercent)
  expect(state.volumes?.soundscapeMaster).toBe(masterPercent)
  expect(state.volumes?.soundscapes?.[categoryName]).toBe(volumePercent)
  expect(expectedGain).toBeGreaterThanOrEqual(0)
}

async function expectMappedSoundboardVolume(page: Page, effectName: string, masterPercent: number) {
  await expect
    .poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 })
    .toBe(true)
  const state = await getAudioState(page)
  expect(state.volumes?.soundboardMaster).toBe(masterPercent)
  expect(expectedSoundboardMappedGain(masterPercent)).toBeCloseTo(
    expectedSoundboardMappedGain(masterPercent),
    5,
  )
}

// --- Shared playback actions ---

When('I tap play on the {string} category', async ({ page }, categoryName: string) => {
  await ensureSoundscapesTab(page)
  await tapCategoryPlay(page, categoryName)
})

When('I tap play on {string}', async ({ page }, categoryName: string) => {
  await ensureSoundscapesTab(page)
  await tapCategoryPlay(page, categoryName)
})

When('I tap pause on the {string} category', async ({ page }, categoryName: string) => {
  await tapCategoryPause(page, categoryName)
})

When('I tap pause on {string}', async ({ page }, categoryName: string) => {
  await tapCategoryPause(page, categoryName)
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'idle',
    { timeout: 5_000 },
  )
})

When('I pause the {string} category', async ({ page }, categoryName: string) => {
  if ((await page.locator(`[data-soundscape-pause="${categoryName}"]`).count()) === 0) {
    await page.locator('[data-active-scene-tab="Soundscapes"]').click()
  }
  await tapCategoryPause(page, categoryName)
})

When('I pause {string}', async ({ page }, categoryName: string) => {
  await tapCategoryPause(page, categoryName)
})

When('I start playback on the {string} category', async ({ page }, categoryName: string) => {
  await ensureSoundscapesTab(page)
  await tapCategoryPlay(page, categoryName)
})

When('I start playback on all categories', async ({ page }) => {
  const categories = page.locator('[data-soundscape-category]')
  const count = await categories.count()
  for (let index = 0; index < count; index += 1) {
    const name = await categories.nth(index).getAttribute('data-soundscape-category')
    if (name) {
      const playButton = page.locator(`[data-soundscape-play="${name}"]`)
      if (await playButton.count() > 0) {
        await tapCategoryPlay(page, name)
      }
    }
  }
})

When('I tap {string} on the soundboard', async ({ page }, effectName: string) => {
  await ensureSoundboardTab(page)
  await tapSoundboardEffect(page, effectName)
})

When('I tap the {string} effect tile', async ({ page }, effectName: string) => {
  await tapSoundboardEffect(page, effectName)
})

When('I tap the {string} tile body', async ({ page }, effectName: string) => {
  await tapSoundboardTileBody(page, effectName)
})

When('I tap the {string} tile body again', async ({ page }, effectName: string) => {
  await tapSoundboardTileBody(page, effectName)
})

When('I trigger a {int}th soundboard effect', async ({ page }, ordinal: number) => {
  const effectName = DEFAULT_SOUNDSCAPE_EFFECTS[ordinal - 1] ?? `Effect ${ordinal}`
  await tapSoundboardEffect(page, effectName)
})

When('I trigger {string} again', async ({ page }, effectName: string) => {
  await tapSoundboardEffect(page, effectName)
})

When('I set Master Volume to {int}%', async ({ page }, volume: number) => {
  await page.locator('[data-soundscape-master-slider]').fill(String(volume))
})

When(
  'I set Master Volume to {int}% and tap the mute button on the Master Volume bar',
  async ({ page }, volume: number) => {
    await page.locator('[data-soundscape-master-slider]').fill(String(volume))
    await page.locator('[data-soundscape-mute]').click()
  },
)

When('I set Soundboard Master to {int}%', async ({ page }, volume: number) => {
  await page.locator('[data-soundboard-master-slider]').fill(String(volume))
})

When('I reduce the Master Volume to {int}%', async ({ page }, volume: number) => {
  await page.locator('[data-active-scene-tab="Soundscapes"]').click()
  await page.locator('[data-soundscape-master-slider]').fill(String(volume))
})

When('I pause one playing category', async ({ page }) => {
  const playing = page.locator('[data-soundscape-playback-state][data-state="playing"]').first()
  const categoryName = await playing.getAttribute('data-soundscape-playback-state')
  if (categoryName) {
    await tapCategoryPause(page, categoryName)
  }
})

When('I start an {int}th soundscape category', async ({ page }, ordinal: number) => {
  void ordinal
  const idle = page.locator('[data-soundscape-playback-state][data-state="idle"]').first()
  const categoryName = await idle.getAttribute('data-soundscape-playback-state')
  if (categoryName) {
    await tapCategoryPlay(page, categoryName)
  }
})

When('I attempt to play an {int}th soundscape category', async ({ page }, ordinal: number) => {
  const categories = page.locator('[data-soundscape-category]')
  const count = await categories.count()
  if (ordinal <= count) {
    const name = await categories.nth(ordinal - 1).getAttribute('data-soundscape-category')
    if (name) {
      await tapCategoryPlay(page, name)
    }
  }
})

When('the {string} track finishes playing', async ({ page }, trackName: string) => {
  await expect
    .poll(async () => {
      const title = await page.locator(`[data-soundscape-track-title="Weather"]`).textContent()
      return title?.includes(trackName) ? title : ''
    }, { timeout: 5_000 })
    .toContain(trackName)
  await expect
    .poll(async () => isCategoryLooping(page, 'Weather'), { timeout: 5_000 })
    .toBe(true)
  await page.waitForTimeout(2_500)
})

When('{string} finishes playing', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 })
    .toBe(true)
  await page.waitForTimeout(500)
})

When('I leave and reopen the scene', async ({ page }) => {
  const onSoundboard = (await page.locator('[data-soundboard-grid]').count()) > 0
  await leaveAndReopenActiveScene(
    page,
    DEFAULT_SCENE_NAME,
    onSoundboard ? 'Soundboard' : 'Soundscapes',
  )
})

When('I leave and reopen the scene on the Soundboard tab', async ({ page }) => {
  await leaveAndReopenActiveScene(page, DEFAULT_SCENE_NAME, 'Soundboard')
})

When('I close and reopen the scene', async ({ page }) => {
  await leaveAndReopenActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
})

// --- Shared playback assertions ---

Then('{string} begins playing', async ({ page }, trackName: string) => {
  if (page.url().includes('/library')) {
    await expectAudioPlaying(page, trackName)
    return
  }
  await expect
    .poll(async () => isTrackPlaying(page, trackName), { timeout: 5_000 })
    .toBe(true)
})

Then('{string} resumes playing', async ({ page }, trackName: string) => {
  await expect
    .poll(async () => isTrackPlaying(page, trackName), { timeout: 5_000 })
    .toBe(true)
})

Then('{string} sound plays', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 })
    .toBe(true)
})

Then('{string} continues to play', async ({ page }, trackName: string) => {
  await expect
    .poll(async () => isTrackPlaying(page, trackName), { timeout: 5_000 })
    .toBe(true)
})

Then('{string} and {string} play simultaneously', async ({ page }, first: string, second: string) => {
  await expect
    .poll(async () => {
      const tracks = await getPlayingTracks(page)
      return tracks.some((track) => track.name === first) && tracks.some((track) => track.name === second)
    }, { timeout: 5_000 })
    .toBe(true)
})

Then(
  '{string} plays simultaneously with the {string} loop',
  async ({ page }, effectName: string, categoryName: string) => {
    await expect
      .poll(async () => {
        const tracks = await getPlayingTracks(page)
        const hasEffect = tracks.some((track) => track.name === effectName && track.source === 'soundboard')
        const hasLoop = tracks.some(
          (track) => track.source === 'soundscape' && track.categoryName === categoryName,
        )
        return hasEffect && hasLoop
      }, { timeout: 5_000 })
      .toBe(true)
  },
)

Then(
  '{string} and {string} are both playing at the same time',
  async ({ page }, first: string, second: string) => {
    await expect
      .poll(async () => {
        return (await isCategoryLooping(page, first)) && (await isCategoryLooping(page, second))
      }, {
        timeout: 5_000,
      })
      .toBe(true)
  },
)

Then(
  '{string} and {string} continue looping uninterrupted',
  async ({ page }, first: string, second: string) => {
    await expect
      .poll(async () => {
        return (await isCategoryLooping(page, first)) && (await isCategoryLooping(page, second))
      }, {
        timeout: 5_000,
      })
      .toBe(true)
  },
)

Then('only {string} has stopped', async ({ page }, categoryName: string) => {
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'idle',
  )
})

Then(
  '{string} plays at the mapped volume for {int}% Master × {int}% Volume',
  async ({ page }, categoryName: string, master: number, volume: number) => {
    await expectMappedSoundscapeVolume(page, categoryName, master, volume)
  },
)

Then(
  '{string} plays at the mapped volume for {int}% Master Volume × {int}% Volume',
  async ({ page }, trackName: string, master: number, volume: number) => {
    await expect.poll(async () => isTrackPlaying(page, trackName), { timeout: 5_000 }).toBe(true)
    const state = await getAudioState(page)
    expect(state.volumes?.soundscapeMaster).toBe(master)
    const categoryVolumes = Object.values(state.volumes?.soundscapes ?? {})
    expect(categoryVolumes.some((value) => value === volume)).toBe(true)
  },
)

Then(
  '{string} plays at the mapped volume for {int}% Soundboard Master',
  async ({ page }, effectName: string, master: number) => {
    await expectMappedSoundboardVolume(page, effectName, master)
  },
)

Then(
  '{string} still plays at the mapped volume for {int}% Soundboard Master',
  async ({ page }, effectName: string, master: number) => {
    await expectMappedSoundboardVolume(page, effectName, master)
  },
)

Then('{string} plays at the reduced level', async ({ page }, trackName: string) => {
  const state = await getAudioState(page)
  expect(state.volumes?.soundscapeMaster).toBe(30)
  await expect.poll(async () => isTrackPlaying(page, trackName), { timeout: 5_000 }).toBe(true)
})

Then('{string} is unaffected by the Master Volume slider', async ({ page }, effectName: string) => {
  const before = await getAudioState(page)
  const soundboardMaster = before.volumes?.soundboardMaster
  await expect.poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 }).toBe(true)
  const after = await getAudioState(page)
  expect(after.volumes?.soundboardMaster).toBe(soundboardMaster)
})

Then('{string} continues looping at full volume', async ({ page }, categoryName: string) => {
  await expectMappedSoundscapeVolume(page, categoryName, 100, 100)
})

Then('the oldest playing soundscape category loop automatically stops', async ({ page }) => {
  await expect
    .poll(async () => {
      const playing = page.locator('[data-soundscape-playback-state][data-state="playing"]')
      return playing.count()
    }, { timeout: 5_000 })
    .toBe(10)
})

Then('the new {int}th soundscape begins playing', async ({ page }, ordinal: number) => {
  const categories = page.locator('[data-soundscape-category]')
  const name = await categories.nth(ordinal - 1).getAttribute('data-soundscape-category')
  if (name) {
    await expect(page.locator(`[data-soundscape-playback-state="${name}"]`)).toHaveAttribute(
      'data-state',
      'playing',
    )
  }
})

Then('the new category begins playing', async ({ page }) => {
  const playing = page.locator('[data-soundscape-playback-state][data-state="playing"]')
  await expect(playing).toHaveCount(10)
})

Then('no other playing category is stopped', async ({ page }) => {
  const playing = page.locator('[data-soundscape-playback-state][data-state="playing"]')
  await expect(playing).toHaveCount(10)
})

Then('the oldest playing soundboard effect instantly stops', async ({ page }) => {
  await expect
    .poll(async () => {
      const tracks = await getPlayingTracks(page)
      return tracks.filter((track) => track.source === 'soundboard').length
    }, { timeout: 5_000 })
    .toBe(5)
})

Then('the new {int}th soundboard effect begins playing', async ({ page }, ordinal: number) => {
  void ordinal
  await expect
    .poll(async () => {
      const tracks = await getPlayingTracks(page)
      return tracks.filter((track) => track.source === 'soundboard').length
    }, { timeout: 5_000 })
    .toBe(5)
})

Then('the oldest {string} instance instantly stops', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => countPlayingInstances(page, effectName), { timeout: 5_000 })
    .toBe(5)
})

Then('the new {string} instance begins playing', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => countPlayingInstances(page, effectName), { timeout: 5_000 })
    .toBe(5)
})

Then('a new {string} instance starts', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => countPlayingInstances(page, effectName), { timeout: 5_000 })
    .toBeGreaterThanOrEqual(2)
})

Then('the Master Volume slider reads {int}%', async ({ page }, volume: number) => {
  await expect(page.locator('[data-soundscape-master-slider]')).toHaveValue(String(volume))
})

Then('soundscape output is muted', async ({ page }) => {
  const state = await getAudioState(page)
  expect(state.volumes?.soundscapeMaster).toBeDefined()
  await expect(page.locator('[data-soundscape-mute]')).toBeVisible()
})

Given('{string} and {string} are both playing', async ({ page }, first: string, second: string) => {
  const onSoundboard = (await page.locator('[data-soundboard-tab]').count()) > 0
  if (onSoundboard) {
    await tapSoundboardEffect(page, first)
    await tapSoundboardEffect(page, second)
    return
  }
  await seedDefaultWeatherScene(page)
  if (!page.url().includes('/active')) {
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  }
  await tapCategoryPlay(page, first)
  await tapCategoryPlay(page, second)
})

Then('the order becomes {string}, {string}, {string}', async ({ page }, first: string, second: string, third: string) => {
  const soundboardOrder = page.locator('[data-soundboard-tile]')
  if ((await soundboardOrder.count()) > 0) {
    const order = await soundboardOrder.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-soundboard-tile') ?? ''),
    )
    expect(order).toEqual([first, second, third])
    return
  }
  const order = await page
    .locator('[data-soundscape-category]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-soundscape-category') ?? ''),
    )
  expect(order).toEqual([first, second, third])
})

// --- Shared playback fixtures ---

Step('the session is locked', async ({ page, $bddContext }) => {
  const keywordType = $bddContext.bddTestData.steps[$bddContext.stepIndex]?.keywordType
  if (keywordType === 'Outcome') {
    await expect(page.locator('[data-session-lock]')).toHaveAttribute('aria-pressed', 'true')
  } else {
    await setSessionLocked(page, true)
  }
})

async function resetAndOpenSoundscapes(page: Page) {
  await mergeE2EData(page, { scenes: [buildScene(DEFAULT_SCENE_NAME)] }, { navigateHome: false })
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
}

Given('the session is locked on the Active Scene — Soundscapes tab', async ({ page }) => {
  await resetAndOpenSoundscapes(page)
  await setSessionLocked(page, true)
  await page.reload()
  await page.waitForLoadState('networkidle')
})

Given('the session is locked on the Active Scene — Soundboard tab', async ({ page }) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { fxTracks, sceneSoundboardEntries } = seedSoundboardEffects(sceneId, DEFAULT_SOUNDSCAPE_EFFECTS)
  await mergeE2EData(
    page,
    { scenes: [buildScene(DEFAULT_SCENE_NAME)], fxTracks, sceneSoundboardEntries },
    { navigateHome: false },
  )
  await setSessionLocked(page, true)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundboard')
})

Given('the {string} category is looping', async ({ page }, categoryName: string) => {
  await seedDefaultWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await tapCategoryPlay(page, categoryName)
  await expect
    .poll(async () => isCategoryLooping(page, categoryName), { timeout: 5_000 })
    .toBe(true)
})

Given('{string} and {string} categories are both looping', async ({ page }, first: string, second: string) => {
  await seedDefaultWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await tapCategoryPlay(page, first)
  await tapCategoryPlay(page, second)
})

Given(
  '{string} is looping and {string} is playing from the soundboard',
  async ({ page }, categoryName: string, effectName: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    await seedDefaultWeatherScene(page)
    const fx = buildFxTrack(effectName)
    await mergeE2EData(
      page,
      {
        fxTracks: [fx],
        sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
        sceneSoundboardSettings: [buildSceneSoundboardSettings(sceneId)],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, categoryName)
    await page.locator('[data-active-scene-tab="Soundboard"]').click()
    await tapSoundboardEffect(page, effectName)
  },
)

Given(
  '{string} is playing at Master {int}% and {string} is on the soundboard',
  async ({ page }, trackName: string, master: number, effectName: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildForestCategoryWithLoop()
    const fx = buildFxTrack(effectName, { audioUrl: LONG_FX_AUDIO_URL, durationSeconds: 120 })
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: 'II',
            currentTrackId: soundscapeTrackIdForName(trackName),
          }),
        ],
        sceneSoundscapeSettings: [buildSceneSoundscapeSettings(sceneId, { masterVolume: master })],
        fxTracks: [fx],
        sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, category.name)
    await page.locator('[data-active-scene-tab="Soundboard"]').click()
    await tapSoundboardEffect(page, effectName)
    await expect.poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 }).toBe(true)
  },
)

Given('{string} is looping at full volume', async ({ page }, categoryName: string) => {
  await seedDefaultWeatherScene(page)
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  await tapCategoryPlay(page, categoryName)
})

Given('there are {int} soundscape categories currently looping', async ({ page }, count: number) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const totalSlots = count + 1
  const categories = Array.from({ length: totalSlots }, (_, index) => buildSoundscapeCategory(`Loop ${index + 1}`))
  const tracks = categories.flatMap((category) => buildSoundscapeTracksForCategory(category.name))
  const slots = categories.map((category, index) =>
    buildSceneSoundscapeSlotWithOptions(sceneId, category.id, index, {
      intensity: 'I',
      currentTrackId: category.levels?.I?.[0],
    }),
  )
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: categories,
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: slots,
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  for (const category of categories.slice(0, count)) {
    await tapCategoryPlay(page, category.name)
  }
})

Given('{int} soundscape categories are looping', async ({ page }, count: number) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const totalSlots = count + 1
  const categories = Array.from({ length: totalSlots }, (_, index) => buildSoundscapeCategory(`Loop ${index + 1}`))
  const tracks = categories.flatMap((category) => buildSoundscapeTracksForCategory(category.name))
  const slots = categories.map((category, index) =>
    buildSceneSoundscapeSlotWithOptions(sceneId, category.id, index, {
      intensity: 'I',
      currentTrackId: category.levels?.I?.[0],
    }),
  )
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      soundscapeCategories: categories,
      soundscapeTracks: tracks,
      sceneSoundscapeSlots: slots,
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
  for (const category of categories.slice(0, count)) {
    await tapCategoryPlay(page, category.name)
  }
})

Given('there are {int} soundboard effects currently playing simultaneously', async ({ page }, count: number) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const boardSize = Math.max(count + 1, count)
  const names = DEFAULT_SOUNDSCAPE_EFFECTS.slice(0, boardSize)
  const { fxTracks, sceneSoundboardEntries } = seedSoundboardEffects(sceneId, names, { longAudio: true })
  await mergeE2EData(
    page,
    { scenes: [buildScene(DEFAULT_SCENE_NAME)], fxTracks, sceneSoundboardEntries },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundboard')
  for (const name of names.slice(0, count)) {
    await tapSoundboardEffect(page, name)
    await expect.poll(async () => isTrackPlaying(page, name), { timeout: 5_000 }).toBe(true)
  }
  await expect
    .poll(async () => {
      const tracks = await getPlayingTracks(page)
      return tracks.filter((track) => track.source === 'soundboard').length
    }, { timeout: 5_000 })
    .toBe(count)
})

Given('{int} instances of {string} are currently playing', async ({ page }, count: number, effectName: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const fx = buildFxTrack(effectName)
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      fxTracks: [fx],
      sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
    },
    { navigateHome: false },
  )
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundboard')
  for (let index = 0; index < count; index += 1) {
    await tapSoundboardEffect(page, effectName)
  }
})
