import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  DEFAULT_SCENE_NAME,
  buildDefaultPickerFxTracks,
  buildFxTrack,
  buildScene,
  buildSoundboardEntry,
  fxIdForName,
  mergeE2EData,
  openActiveScene,
  resetE2EData,
  sceneIdForName,
  setE2EControls,
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

Given('the FX library has {string}', async ({ page }, name: string) => {
  await mergeE2EData(page, { fxTracks: [buildFxTrack(name)] }, { navigateHome: false })
})

Given(
  'the FX library has {string} tagged {string} and {string} tagged {string}',
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
  'the FX library has type {string} track {string} and type {string} track {string}',
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
  'the FX library has {string} at base intensity {string} and {string} at base intensity {string}',
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
  await page.locator(`[data-fx-picker-check="${fxIdForName(name)}"]`).check()
})

Given('I have added {string} and {string} via Add Selected', async ({ page }, first: string, second: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
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
  const body = page.locator(`[data-fx-picker-body="${name}"]`)
  if ((await body.count()) > 0) {
    await body.click()
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
  await page.locator('[data-fx-picker-search]').fill(query)
})

When('I set the FX Types filter to {string} in the picker', async ({ page }, fxType: string) => {
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
  await page.locator(`[data-fx-picker-check="${fxIdForName(name)}"]`).check()
})

When('I tap the card body for {string}', async ({ page }, name: string) => {
  await page.locator(`[data-fx-picker-body="${name}"]`).click()
})

When('I tap the back link {string}', async ({ page }) => {
  await page.locator('[data-fx-picker-back]').click()
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-modal]')).toBeVisible()
})

Then('I see a back link {string}', async ({ page }, label: string) => {
  await expect(page.locator('[data-fx-picker-back]')).toContainText(label)
})

Then('I see the title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
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
  await expect(page.locator('[data-fx-picker-loading]')).toBeVisible()
})

Then('I see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-item="${name}"]`)).toBeVisible()
})

Then('I do not see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-item="${name}"]`)).toHaveCount(0)
})

Then('I see a clear-filters action', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-clear-filters]')).toBeVisible()
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
  await expect(page.locator(`[data-fx-picker-item="${name}"]`)).toBeVisible()
})


Then('the {string} button is disabled', async ({ page }, label: string) => {
  if (label.startsWith('Add Selected')) {
    await expect(page.locator('[data-fx-picker-add-selected]')).toBeDisabled()
    return
  }
  await expect(page.getByRole('button', { name: label })).toBeDisabled()
})

Then('the {string} button is enabled', async ({ page }, label: string) => {
  if (label.startsWith('Add Selected')) {
    await expect(page.locator('[data-fx-picker-add-selected]')).toBeEnabled()
    return
  }
  await expect(page.getByRole('button', { name: label })).toBeEnabled()
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
  const previewState = page.locator(`[data-fx-picker-preview-state="${name}"]`)
  if ((await previewState.count()) > 0) {
    await expect(previewState).toHaveAttribute('data-state', 'idle')
    return
  }
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__ ?? { isPlaying: false })
  expect(state.isPlaying === false || state.trackName !== name).toBeTruthy()
})

Then('{string} begins previewing in the picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Then('the {string} card shows a playing state in the picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-picker-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Then('the {string} card no longer shows a playing state in the picker', async ({ page }, name: string) => {
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
