import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  DEFAULT_SCENE_NAME,
  buildDefaultPickerFxTracks,
  buildFxTrack,
  buildScene,
  buildSceneSoundboardSettings,
  buildSceneSoundscapeSlot,
  buildSoundboardEntry,
  buildSoundscapeCategory,
  buildForestCategoryWithLoop,
  buildSceneSoundscapeSettings,
  buildSceneSoundscapeSlotWithOptions,
  buildSoundscapeTracksForCategory,
  categoryIdForName,
  countPlayingInstances,
  fxIdForName,
  isTrackPlaying,
  mergeE2EData,
  openActiveScene,
  resetE2EData,
  sceneIdForName,
  seedSoundboardEffects,
  setE2EControls,
  simulateNativeDragDrop,
  ensureSoundboardEffectOnBoard,
  replaceSceneSoundboard,
  soundscapeTrackIdForName,
  tapCategoryPlay,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

async function openFxPicker(page: import('@playwright/test').Page) {
  await page.locator('[data-soundboard-add]').click()
  await expect(page.locator('[data-fx-picker-modal]')).toBeVisible()
}

async function seedActiveSceneWithSoundboardTab(
  page: import('@playwright/test').Page,
  sceneName = DEFAULT_SCENE_NAME,
  options?: { withDefaultFx?: boolean },
) {
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(sceneName)],
      ...(options?.withDefaultFx ? { fxTracks: buildDefaultPickerFxTracks() } : {}),
    },
    { navigateHome: false },
  )
  await openActiveScene(page, sceneName, 'Soundboard')
}

async function ensureActiveSceneSoundboard(page: import('@playwright/test').Page) {
  if (page.url().includes('/active')) {
    return
  }
  const hasScene = await page.evaluate((sceneName) => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return false
    const data = JSON.parse(raw)
    return (data.scenes ?? []).some((scene: { name: string }) => scene.name === sceneName)
  }, DEFAULT_SCENE_NAME)
  if (!hasScene) {
    await mergeE2EData(page, { scenes: [buildScene(DEFAULT_SCENE_NAME)] }, { navigateHome: false })
  }
  await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundboard')
}

function pickerSortValue(sortOrder: string): string {
  if (sortOrder === 'Name A–Z' || sortOrder === 'Name') {
    return 'name'
  }
  if (sortOrder === 'Recently Added') {
    return 'recent'
  }
  if (sortOrder === 'Duration') {
    return 'duration'
  }
  return sortOrder
}

const DEFAULT_PLAYBACK_EFFECTS = ['Thunder Crack', 'Wolf Howl', 'Whip', 'Sword Clash', 'Owl Hooting', 'Door Creak', 'Dragon Roar']

async function seedDefaultSoundboard(page: import('@playwright/test').Page) {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const { fxTracks, sceneSoundboardEntries } = seedSoundboardEffects(sceneId, DEFAULT_PLAYBACK_EFFECTS)
  await mergeE2EData(
    page,
    {
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
      fxTracks,
      sceneSoundboardEntries,
      sceneSoundboardSettings: [buildSceneSoundboardSettings(sceneId)],
    },
    { navigateHome: false },
  )
}

async function tapSoundboardTile(page: import('@playwright/test').Page, effectName: string) {
  await page
    .locator(`[data-soundboard-tile="${effectName}"]`)
    .first()
    .getByRole('button', { name: `Play ${effectName}`, exact: true })
    .click()
}

async function getSoundboardOrder(page: import('@playwright/test').Page): Promise<string[]> {
  return page
    .locator('[data-soundboard-tile]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-soundboard-tile') ?? ''),
    )
}

async function dragSoundboardHandle(
  page: import('@playwright/test').Page,
  sourceName: string,
  targetName: string,
) {
  await simulateNativeDragDrop(
    page,
    `[data-soundboard-tile="${sourceName}"] [data-drag-handle]`,
    `[data-soundboard-tile="${targetName}"]`,
  )
}

Given('the soundboard has effect tiles available for playback', async ({ page }) => {
  await seedDefaultSoundboard(page)
})

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  await resetE2EData(page)
  await seedActiveSceneWithSoundboardTab(page, DEFAULT_SCENE_NAME, { withDefaultFx: true })
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  await seedActiveSceneWithSoundboardTab(page, DEFAULT_SCENE_NAME, { withDefaultFx: true })
  await openFxPicker(page)
})

Given('the FX library has no tracks', async ({ page }) => {
  await mergeE2EData(
    page,
    { fxTracks: [], scenes: [buildScene(DEFAULT_SCENE_NAME)] },
    { navigateHome: false },
  )
})

Given(
  'every FX track in my library is already in the current scene\'s soundboard',
  async ({ page }) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const fx = buildFxTrack('Thunder Crack')
    await mergeE2EData(
      page,
      {
        fxTracks: [fx],
        sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
      },
      { navigateHome: false },
    )
  },
)

Given('the FX library is still loading', async ({ page }) => {
  await seedActiveSceneWithSoundboardTab(page)
  await setE2EControls(page, { fxLibraryState: 'loading' })
})

Given('the FX library has {string} and {string}', async ({ page }, first: string, second: string) => {
  await mergeE2EData(
    page,
    { fxTracks: [buildFxTrack(first), buildFxTrack(second)] },
    { navigateHome: false },
  )
})

Given(
  'the FX library has {string}, {string}, and {string}',
  async ({ page }, first: string, second: string, third: string) => {
    await mergeE2EData(
      page,
      { fxTracks: [buildFxTrack(first), buildFxTrack(second), buildFxTrack(third)] },
      { navigateHome: false },
    )
  },
)

Given('the FX library has {string}', async ({ page }, name: string) => {
  await mergeE2EData(page, { fxTracks: [buildFxTrack(name)] }, { navigateHome: false })
})

Given(
  'the FX library has {string} tagged {word} and {string} tagged {word}',
  async ({ page }, first: string, firstTag: string, second: string, secondTag: string) => {
    await mergeE2EData(
      page,
      {
        fxTracks: [
          buildFxTrack(first, { tags: [firstTag], type: firstTag as import('../../../src/types/library').FxType }),
          buildFxTrack(second, { tags: [secondTag], type: secondTag as import('../../../src/types/library').FxType }),
        ],
      },
      { navigateHome: false },
    )
  },
)

Given(
  'the FX library has type {word} track {string} and type {word} track {string}',
  async ({ page }, type1: string, name1: string, type2: string, name2: string) => {
    await mergeE2EData(
      page,
      {
        fxTracks: [
          buildFxTrack(name1, { type: type1 as import('../../../src/types/library').FxType, tags: [type1] }),
          buildFxTrack(name2, { type: type2 as import('../../../src/types/library').FxType, tags: [type2] }),
        ],
      },
      { navigateHome: false },
    )
  },
)

Given(
  'the FX library has {string} at base intensity {word} and {string} at base intensity {word}',
  async ({ page }, soft: string, softIntensity: string, loud: string, loudIntensity: string) => {
    await mergeE2EData(
      page,
      {
        fxTracks: [
          buildFxTrack(soft, { baseIntensity: softIntensity as 'I' | 'II' | 'III' }),
          buildFxTrack(loud, { baseIntensity: loudIntensity as 'I' | 'II' | 'III' }),
        ],
      },
      { navigateHome: false },
    )
  },
)

Given(
  'the FX library has {string} added before {string}',
  async ({ page }, first: string, second: string) => {
    const earlier = new Date(Date.now() - 86_400_000).toISOString()
    const later = new Date().toISOString()
    await mergeE2EData(
      page,
      {
        fxTracks: [
          buildFxTrack(first, { createdAt: earlier }),
          buildFxTrack(second, { createdAt: later }),
        ],
      },
      { navigateHome: false },
    )
  },
)

Given('no FX cards are checked in the picker', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-check]:checked')).toHaveCount(0)
})

Given(
  '{string} and {string} are not yet in the current scene\'s soundboard',
  async ({ page }, first: string, second: string) => {
    await mergeE2EData(
      page,
      {
        fxTracks: [buildFxTrack(first), buildFxTrack(second)],
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
      },
      { navigateHome: false },
    )
  },
)

Given('{string} is already in the current scene\'s soundboard', async ({ page }, name: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const fx = buildFxTrack(name)
  await mergeE2EData(
    page,
    {
      fxTracks: [fx],
      sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1, { hotkey: 'Num 1' })],
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
    },
    { navigateHome: false },
  )
})

Given(
  'the current scene\'s soundboard has {int} effect tiles with hotkeys Num {int} through Num {int}',
  async ({ page }, count: number, from: number, to: number) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const tracks = Array.from({ length: count }, (_, index) => buildFxTrack(`Effect ${index + 1}`))
    await mergeE2EData(
      page,
      {
        fxTracks: tracks,
        sceneSoundboardEntries: tracks.map((track, index) =>
          buildSoundboardEntry(sceneId, track.id, index + 1, { hotkey: `Num ${from + index}` }),
        ),
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
      },
      { navigateHome: false },
    )
    expect(from + count - 1).toBe(to)
  },
)

Given('I have checked {string} in the picker', async ({ page }, name: string) => {
  if (await page.locator('[data-soundscape-picker-modal]').count() > 0) {
    await page.locator(`[data-sc-picker-check="${categoryIdForName(name)}"]`).check()
    return
  }
  await page.locator(`[data-fx-picker-check="${fxIdForName(name)}"]`).check()
})

Given('I have added {string} and {string} via Add Selected', async ({ page }, first: string, second: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const onSoundscapesTab = (await page.locator('[data-soundscapes-tab]').count()) > 0
  const soundscapePickerOpen = (await page.locator('[data-soundscape-picker-modal]').count()) > 0
  if (onSoundscapesTab || soundscapePickerOpen) {
    const categories = [buildSoundscapeCategory(first), buildSoundscapeCategory(second)]
    await mergeE2EData(
      page,
      {
        soundscapeCategories: categories,
        sceneSoundscapeSlots: categories.map((category, index) =>
          buildSceneSoundscapeSlot(sceneId, category.id, index),
        ),
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
      },
      { navigateHome: false },
    )
    return
  }
  const tracks = [buildFxTrack(first), buildFxTrack(second)]
  await mergeE2EData(
    page,
    {
      fxTracks: tracks,
      sceneSoundboardEntries: tracks.map((track, index) =>
        buildSoundboardEntry(sceneId, track.id, index + 1),
      ),
      scenes: [buildScene(DEFAULT_SCENE_NAME)],
    },
    { navigateHome: false },
  )
})

Given('{string} is previewing in the picker', async ({ page }, name: string) => {
  const scBody = page.locator(`[data-sc-picker-body="${name}"]`)
  if ((await scBody.count()) > 0) {
    await scBody.click()
    return
  }
  const body = page.locator(`[data-fx-picker-body="${name}"]`)
  if ((await body.count()) > 0) {
    await body.click()
    return
  }
  const scTrack = page.locator(`[data-picker-track="${name}"]`)
  if ((await scTrack.count()) > 0) {
    const preview = scTrack.getByRole('button', { name: `Preview ${name}`, exact: true })
    await preview.click()
    await expect(
      scTrack.getByRole('button', { name: `Pause preview ${name}`, exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    return
  }
  await page.evaluate((trackName) => {
    window.__ARCANUM_AUDIO_STATE__ = {
      isPlaying: true,
      trackName,
      source: 'picker',
    }
  }, name)
})

When('I type {string} in the picker search bar', async ({ page }, query: string) => {
  const fxSearch = page.locator('[data-fx-picker-search]')
  const scSearch = page.locator('[data-sc-picker-search]')
  if (await fxSearch.count() > 0) {
    await fxSearch.fill(query)
  } else if (await scSearch.count() > 0) {
    await scSearch.fill(query)
  } else {
    await page.locator('[data-picker-search]').fill(query)
  }
})


When('I set the FX Types filter to {word} in the picker', async ({ page }, fxType: string) => {
  await page.locator('[data-fx-picker-filter-type]').selectOption(fxType)
})

When('I set the base intensity filter to {string} in the picker', async ({ page }, intensity: string) => {
  await page.locator('[data-fx-picker-filter-intensity]').selectOption(intensity)
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  await ensureActiveSceneSoundboard(page)
  await openFxPicker(page)
})

When('I set the Sort Order to {string} in the picker', async ({ page }, sortOrder: string) => {
  await page.locator('[data-fx-picker-filter-sort]').selectOption(pickerSortValue(sortOrder))
})

When('I use the clear-filters action in the picker', async ({ page }) => {
  await page.locator('[data-fx-picker-clear-filters]').click()
})

When('I check {string} in the picker', async ({ page }, name: string) => {
  if (await page.locator('[data-soundscape-picker-modal]').count() > 0) {
    await page.locator(`[data-sc-picker-check="${categoryIdForName(name)}"]`).check()
    return
  }
  await page.locator(`[data-fx-picker-check="${fxIdForName(name)}"]`).check()
})

When('I tap the FX picker card body for {string}', async ({ page }, name: string) => {
  await page.locator(`[data-fx-picker-body="${name}"]`).click()
})

When('I tap the soundscape picker card body for {string}', async ({ page }, name: string) => {
  await page.locator(`[data-sc-picker-body="${name}"]`).click()
})

When('I tap the soundscape picker card body for {string} again', async ({ page }, name: string) => {
  await page.locator(`[data-sc-picker-body="${name}"]`).click()
})

Then('the {string} soundscape picker card shows it is previewing', async ({ page }, name: string) => {
  await expect(page.locator(`[data-sc-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Then('the {string} soundscape picker card no longer shows it is previewing', async ({ page }, name: string) => {
  await expect(page.locator(`[data-sc-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'idle')
})

Then('the {string} soundscape picker card shows {string}', async ({ page }, name: string, text: string) => {
  await expect(page.locator(`[data-sc-picker-item="${name}"]`)).toContainText(text)
})

When('I tap the back link {string}', async ({ page }) => {
  const scBack = page.locator('[data-sc-picker-back]')
  if (await scBack.count() > 0) {
    await scBack.click()
    return
  }
  await page.locator('[data-fx-picker-back]').click()
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-modal]')).toBeVisible()
})

Then('I see a back link {string}', async ({ page }, label: string) => {
  const fxBack = page.locator('[data-fx-picker-back]')
  const scBack = page.locator('[data-sc-picker-back]')
  if (await fxBack.count() > 0) {
    await expect(fxBack).toContainText(label)
    return
  }
  if (await scBack.count() > 0) {
    await expect(scBack).toContainText(label)
    return
  }
  await expect(
    page.getByRole('dialog').getByRole('button', { name: label, exact: true })
  ).toBeVisible()
})



Then(
  'I see the picker search bar with placeholder {string}',
  async ({ page }, placeholder: string) => {
    await expect(page.locator('[data-fx-picker-search]')).toHaveAttribute('placeholder', placeholder)
  },
)

Then('I see FX Types, Base Intensity, and Sort Order filters for the picker', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-filter-type]')).toBeVisible()
  await expect(page.locator('[data-fx-picker-filter-intensity]')).toBeVisible()
  await expect(page.locator('[data-fx-picker-filter-sort]')).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-check]').first()).toBeVisible()
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Import FX' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Import' })).toHaveCount(0)
})

Then('I do not see a {string} button in the picker', async ({ page }, label: string) => {
  await expect(page.locator('[data-fx-picker-modal]').getByRole('button', { name: label })).toHaveCount(0)
})

Then('I see guidance to import or purchase tracks via Library — Sound Effects', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-empty]')).toContainText(/Library.*Sound Effects/i)
})

Then('the {string} button is not available', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toHaveCount(0)
})

Then('I do not see any FX cards in the picker grid', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-item]')).toHaveCount(0)
})

Then('the picker grid shows a loading state', async ({ page }) => {
  const fxLoading = page.locator('[data-fx-picker-loading]')
  const scLoading = page.locator('[data-sc-picker-loading]')
  if (await fxLoading.count() > 0) {
    await expect(fxLoading).toBeVisible()
    return
  }
  await expect(scLoading).toBeVisible()
})

Then('I see {string} in the picker grid', async ({ page }, name: string) => {
  const fxItem = page.locator(`[data-fx-picker-item="${name}"]`)
  const scItem = page.locator(`[data-sc-picker-item="${name}"]`)
  if (await fxItem.count() > 0) {
    await expect(fxItem).toBeVisible()
  } else if (await scItem.count() > 0) {
    await expect(scItem).toBeVisible()
  } else {
    await expect(page.locator(`[data-picker-track="${name}"]`)).toBeVisible()
  }
})

Then('I do not see {string} in the picker grid', async ({ page }, name: string) => {
  const fxItem = page.locator(`[data-fx-picker-item="${name}"]`)
  const scItem = page.locator(`[data-sc-picker-item="${name}"]`)
  const scTrack = page.locator(`[data-picker-track="${name}"]`)
  await expect(fxItem).toHaveCount(0)
  await expect(scItem).toHaveCount(0)
  await expect(scTrack).toHaveCount(0)
})

Then('I see a clear-filters action', async ({ page }) => {
  const libraryClear = page.getByRole('button', { name: 'Clear Filters', exact: true })
  if (await libraryClear.count() > 0) {
    await expect(libraryClear).toBeVisible()
    return
  }
  const fxFilters = page.locator('[data-fx-picker-clear-filters]')
  const scFilters = page.locator('[data-sc-picker-clear-filters]')
  if (await fxFilters.count() > 0) {
    await expect(fxFilters).toBeVisible()
  } else if (await scFilters.count() > 0) {
    await expect(scFilters).toBeVisible()
  } else {
    await expect(page.locator('[data-sc-picker-no-match] button, [data-picker-no-match] button')).toBeVisible()
  }
})

Then(
  '{string} appears before {string} in the picker grid',
  async ({ page }, first: string, second: string) => {
    const firstIndex = await page
      .locator('[data-fx-picker-item]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.getAttribute('data-fx-picker-item') === target)
      }, first)
    const secondIndex = await page
      .locator('[data-fx-picker-item]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.getAttribute('data-fx-picker-item') === target)
      }, second)
    expect(firstIndex).toBeGreaterThanOrEqual(0)
    expect(secondIndex).toBeGreaterThanOrEqual(0)
    expect(firstIndex).toBeLessThan(secondIndex)
  },
)

Then('But I see {string} in the picker grid', async ({ page }, name: string) => {
  const fxItem = page.locator(`[data-fx-picker-item="${name}"]`)
  const scItem = page.locator(`[data-sc-picker-item="${name}"]`)
  if (await scItem.count() > 0) {
    await expect(scItem).toBeVisible()
    return
  }
  await expect(fxItem).toBeVisible()
})


Then('the {string} button is disabled', async ({ page }, label: string) => {
  if (label.startsWith('Add Selected')) {
    const scBtn = page.locator('[data-picker-commit]')
    if (await scBtn.count() > 0) {
      await expect(scBtn).toBeDisabled()
    } else {
      await expect(page.locator('[data-fx-picker-add-selected]')).toBeDisabled()
    }
    return
  }
  await expect(page.getByRole('button', { name: label, exact: true })).toBeDisabled()
})

Then('the {string} button is enabled', async ({ page }, label: string) => {
  if (label.startsWith('Add Selected')) {
    const scBtn = page.locator('[data-picker-commit]')
    if (await scBtn.count() > 0) {
      await expect(scBtn).toBeEnabled()
    } else {
      await expect(page.locator('[data-fx-picker-add-selected]')).toBeEnabled()
    }
    return
  }
  await expect(page.getByRole('button', { name: label, exact: true })).toBeEnabled()
})

Then('{string} is selected in the picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-check="${fxIdForName(name)}"]`)).toBeChecked()
})

Then('{string} is not previewing in the picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'idle')
})

Then(
  '{string} and {string} appear as tiles in the soundboard grid',
  async ({ page }, first: string, second: string) => {
    const grid = page.locator('[data-soundboard-grid]')
    await expect(grid.locator(`[data-soundboard-tile="${first}"]`)).toBeVisible()
    await expect(grid.locator(`[data-soundboard-tile="${second}"]`)).toBeVisible()
  },
)

Then(
  '{string} appears before {string} in the soundboard grid',
  async ({ page }, first: string, second: string) => {
    const firstIndex = await page
      .locator('[data-soundboard-tile]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.getAttribute('data-soundboard-tile') === target)
      }, first)
    const secondIndex = await page
      .locator('[data-soundboard-tile]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.getAttribute('data-soundboard-tile') === target)
      }, second)
    expect(firstIndex).toBeGreaterThanOrEqual(0)
    expect(secondIndex).toBeGreaterThanOrEqual(0)
    expect(firstIndex).toBeLessThan(secondIndex)
  },
)

Then('I see a toast {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message)).toBeVisible()
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-modal]')).toBeVisible()
})

Then('the {string} soundboard tile is idle', async ({ page }, name: string) => {
  await expect(
    page.locator('[data-soundboard-grid]').locator(`[data-soundboard-tile-state="${name}"]`),
  ).toHaveAttribute('data-state', 'idle')
})

Then('all three effects appear as tiles in the active scene\'s soundboard', async ({ page }) => {
  await expect(page.locator('[data-soundboard-tile]')).toHaveCount(3)
})

Then('the {string} tile shows hotkey label {string}', async ({ page }, name: string, hotkey: string) => {
  await expect(page.locator(`[data-soundboard-hotkey="${name}"]`)).toHaveText(hotkey)
})

Then('the first {int} effect tiles still show hotkeys Num {int} through Num {int}', async ({ page }, count: number, from: number, to: number) => {
  for (let index = 0; index < count; index += 1) {
    const tile = page.locator('[data-soundboard-tile]').nth(index)
    await expect(tile.locator('[data-soundboard-hotkey]')).toHaveText(`Num ${from + index}`)
  }
  expect(from + count - 1).toBe(to)
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.locator('[data-screen="Active Scene screen"]')).toBeVisible()
  await expect(page.locator('[data-active-scene-tab="Soundboard"]')).toHaveAttribute('data-active', 'true')
})

Then('{string} stops previewing', async ({ page }, name: string) => {
  const scPreviewState = page.locator(`[data-sc-picker-preview-state="${name}"]`)
  if ((await scPreviewState.count()) > 0) {
    await expect(scPreviewState).toHaveAttribute('data-state', 'idle')
    return
  }
  const previewState = page.locator(`[data-fx-picker-preview-state="${name}"]`)
  if ((await previewState.count()) > 0) {
    await expect(previewState).toHaveAttribute('data-state', 'idle')
    return
  }
  const scTrack = page.locator(`[data-picker-track="${name}"]`)
  if (await scTrack.count() > 0) {
    await expect(
      scTrack.getByRole('button', { name: `Preview ${name}`, exact: true })
    ).toHaveAttribute('aria-pressed', 'false')
    return
  }
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__ ?? { isPlaying: false })
  expect(state.isPlaying === false || state.trackName !== name).toBeTruthy()
})

Then('{string} begins previewing in the picker', async ({ page }, name: string) => {
  const fxPreviewState = page.locator(`[data-fx-picker-preview-state="${name}"]`)
  if (await fxPreviewState.count() > 0) {
    await expect(fxPreviewState).toHaveAttribute('data-state', 'playing')
    return
  }
  await expect(
    page
      .locator(`[data-picker-track="${name}"]`)
      .getByRole('button', { name: `Pause preview ${name}`, exact: true })
  ).toHaveAttribute('aria-pressed', 'true')
})

Then('the {string} FX picker card shows a playing state in the picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Then('the {string} FX picker card no longer shows a playing state in the picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'idle')
})

Then('both {string} and {string} appear as tiles in the soundboard grid', async ({ page }, first: string, second: string) => {
  await expect(page.locator(`[data-soundboard-tile="${first}"]`)).toBeVisible()
  await expect(page.locator(`[data-soundboard-tile="${second}"]`)).toBeVisible()
})

Then('{string} previews at its saved default volume', async ({ page }, name: string) => {
  const volume = await page.evaluate((trackName) => {
    return window.__ARCANUM_AUDIO_STATE__?.trackName === trackName
      ? window.__ARCANUM_AUDIO_STATE__?.previewVolume
      : undefined
  }, name)
  expect(volume).toBeDefined()
})

Then('{string} is still previewing in the picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Given('{string} is visible in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-item="${name}"]`)).toBeVisible()
})

Given('{string} is on the soundboard and idle', async ({ page }, effectName: string) => {
  await ensureSoundboardEffectOnBoard(page, effectName)
})

Given(
  '{string} is on the soundboard and idle with a subtle play affordance',
  async ({ page }, effectName: string) => {
    await ensureSoundboardEffectOnBoard(page, effectName)
  },
)

Given('{string} is playing with a visible glow', async ({ page }, effectName: string) => {
  await tapSoundboardTile(page, effectName)
  await expect(
    page.locator('[data-soundboard-grid]').locator(`[data-soundboard-tile-state="${effectName}"]`),
  ).toHaveAttribute('data-state', 'playing')
})

Given('{string} and {string} are both playing with visible glow', async ({ page }, first: string, second: string) => {
  await tapSoundboardTile(page, first)
  await tapSoundboardTile(page, second)
})

Given('I have tapped {string} and it is currently playing', async ({ page }, effectName: string) => {
  await tapSoundboardTile(page, effectName)
})

Given('Soundboard Master is at {int}%', async ({ page }, volume: number) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  await mergeE2EData(
    page,
    { sceneSoundboardSettings: [buildSceneSoundboardSettings(sceneId, { masterVolume: volume })] },
    { navigateHome: false },
  )
  await page.locator('[data-soundboard-master-slider]').fill(String(volume))
})

Given('{string} is playing from the soundboard', async ({ page }, effectName: string) => {
  await tapSoundboardTile(page, effectName)
})

Given(
  '{string} is playing as a soundscape at Volume {int}% and Master Volume {int}%',
  async ({ page }, trackName: string, volume: number, master: number) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const { category, tracks } = buildForestCategoryWithLoop()
    const fx = buildFxTrack('Thunder Crack')
    await mergeE2EData(
      page,
      {
        scenes: [buildScene(DEFAULT_SCENE_NAME)],
        soundscapeCategories: [category],
        soundscapeTracks: tracks,
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            volume,
            intensity: 'II',
            currentTrackId: soundscapeTrackIdForName('Forest Loop'),
          }),
        ],
        sceneSoundscapeSettings: [buildSceneSoundscapeSettings(sceneId, { masterVolume: master })],
        fxTracks: [fx],
        sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
        sceneSoundboardSettings: [buildSceneSoundboardSettings(sceneId, { masterVolume: 50 })],
      },
      { navigateHome: false },
    )
    await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
    await tapCategoryPlay(page, category.name)
    void trackName
  },
)

Given(
  'the {string} category intensity is set to Level {word} on the Soundscapes tab',
  async ({ page }, categoryName: string, level: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    const category = buildSoundscapeCategory(categoryName)
    await mergeE2EData(
      page,
      {
        soundscapeCategories: [category],
        soundscapeTracks: buildSoundscapeTracksForCategory(categoryName),
        sceneSoundscapeSlots: [
          buildSceneSoundscapeSlotWithOptions(sceneId, category.id, 0, {
            intensity: level.replace('Level ', '') as 'I' | 'II' | 'III',
          }),
        ],
      },
      { navigateHome: false },
    )
    if (!page.url().includes('/active')) {
      await openActiveScene(page, DEFAULT_SCENE_NAME, 'Soundscapes')
      return
    }
    await page.locator('[data-active-scene-tab="Soundscapes"]').click()
  },
)

Given(
  'the soundboard has tiles in the order {string}, {string}, {string}',
  async ({ page }, first: string, second: string, third: string) => {
    const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
    await replaceSceneSoundboard(page, sceneId, [first, second, third])
  },
)

Given('{string} is the first tile in the soundboard', async ({ page }, effectName: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const others = DEFAULT_PLAYBACK_EFFECTS.filter((name) => name !== effectName).slice(0, 2)
  await replaceSceneSoundboard(page, sceneId, [effectName, ...others])
})

Given('{string} is currently playing from the soundboard', async ({ page }, effectName: string) => {
  await tapSoundboardTile(page, effectName)
})

Given(
  'those tiles show hotkey labels {string}, {string}, and {string}',
  async ({ page }, first: string, second: string, third: string) => {
    await expect(page.locator('[data-soundboard-hotkey]').nth(0)).toHaveText(first)
    await expect(page.locator('[data-soundboard-hotkey]').nth(1)).toHaveText(second)
    await expect(page.locator('[data-soundboard-hotkey]').nth(2)).toHaveText(third)
  },
)

When('I tap the pause icon on the {string} tile', async ({ page }, effectName: string) => {
  await page
    .locator(`[data-soundboard-tile="${effectName}"]`)
    .first()
    .getByRole('button', { name: `Stop ${effectName}`, exact: true })
    .click()
})

When('I drag {string} by its drag handle to the first position', async ({ page }, source: string) => {
  const firstTile = page.locator('[data-soundboard-tile]').first()
  const firstName = await firstTile.getAttribute('data-soundboard-tile')
  if (firstName && firstName !== source) {
    await dragSoundboardHandle(page, source, firstName)
  }
})

When(
  'I drag {string} by its drag handle to the position after {string}',
  async ({ page }, source: string, after: string) => {
    const tiles = page.locator('[data-soundboard-tile]')
    const count = await tiles.count()
    let targetName: string | null = null
    for (let index = 0; index < count; index += 1) {
      const name = await tiles.nth(index).getAttribute('data-soundboard-tile')
      if (name === after) {
        if (index === count - 1) {
          targetName = after
        } else {
          targetName = await tiles.nth(index + 1).getAttribute('data-soundboard-tile')
        }
        break
      }
    }
    if (targetName) {
      await dragSoundboardHandle(page, source, targetName)
    }
  },
)

Then(
  'the {string} sound begins playing before the tile leaves the idle state',
  async ({ page }, effectName: string) => {
    await expect
      .poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 })
      .toBe(true)
  },
)

Then('the {string} tile shows the playing state \\(glow or pulse\\)', async ({ page }, effectName: string) => {
  await expect(
    page.locator('[data-soundboard-grid]').locator(`[data-soundboard-tile-state="${effectName}"]`),
  ).toHaveAttribute('data-state', 'playing')
})

Then('the tile shows a pause icon instead of the idle play affordance', async ({ page }) => {
  await expect(page.locator('[data-soundboard-tile][data-state="playing"]').first()).toBeVisible()
})

Then('all {string} instances stop', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => countPlayingInstances(page, effectName), { timeout: 5_000 })
    .toBe(0)
})

Then('the {string} tile no longer glows', async ({ page }, effectName: string) => {
  await expect(
    page.locator(`[data-soundboard-tile-state="${effectName}"]`),
  ).toHaveAttribute('data-state', 'idle')
})

Then('the tile shows the idle play affordance', async ({ page }) => {
  await expect(page.locator('[data-soundboard-tile][data-state="idle"]').first()).toBeVisible()
})

Then('neither tile shows the playing glow', async ({ page }) => {
  await expect(page.locator('[data-soundboard-tile][data-state="playing"]')).toHaveCount(0)
})

Then('both tiles show the idle play affordance', async ({ page }) => {
  await expect(
    page.locator('[data-soundboard-grid]').locator('[data-soundboard-tile-state="Thunder Crack"]'),
  ).toHaveAttribute('data-state', 'idle')
  await expect(
    page.locator('[data-soundboard-grid]').locator('[data-soundboard-tile-state="Wolf Howl"]'),
  ).toHaveAttribute('data-state', 'idle')
})

Then(
  'the second {string} instance starts from the beginning before the tile leaves the playing state',
  async ({ page }, effectName: string) => {
    await expect
      .poll(async () => countPlayingInstances(page, effectName), { timeout: 5_000 })
      .toBeGreaterThanOrEqual(2)
  },
)

Then(
  'the first {string} instance continues playing simultaneously',
  async ({ page }, effectName: string) => {
    await expect
      .poll(async () => countPlayingInstances(page, effectName), { timeout: 5_000 })
      .toBeGreaterThanOrEqual(2)
  },
)

Then('{string} continues uninterrupted', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 })
    .toBe(true)
})

Then('{string} is still the first tile', async ({ page }, effectName: string) => {
  const order = await getSoundboardOrder(page)
  expect(order[0]).toBe(effectName)
})

Then('{string} continues playing uninterrupted', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 })
    .toBe(true)
})

Then('the soundboard order is {string}, {string}, {string}', async ({ page }, first: string, second: string, third: string) => {
  const order = await getSoundboardOrder(page)
  expect(order).toEqual([first, second, third])
})

Then('the {string} sound plays', async ({ page }, effectName: string) => {
  await expect
    .poll(async () => isTrackPlaying(page, effectName), { timeout: 5_000 })
    .toBe(true)
})

Then('{string} shows hotkey label {string}', async ({ page }, effectName: string, hotkey: string) => {
  await expect(page.locator(`[data-soundboard-hotkey="${effectName}"]`)).toHaveText(hotkey)
})

Then('Soundboard Master is immediately at {int}% with no animation', async ({ page }, volume: number) => {
  await expect(page.locator('[data-soundboard-master-slider]')).toHaveValue(String(volume))
})

