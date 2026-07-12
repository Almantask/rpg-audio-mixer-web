import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildFxTrack,
  buildScene,
  buildSoundboardEntry,
  expectAudioPlaying,
  expectAudioStopped,
  expectNoAudioPlayback,
  importDisplayName,
  mergeE2EData,
  parseDurationSeconds,
  mergeFxTrack,
  openLibraryFxTab,
  openScenes,
  resetE2EData,
  sceneIdForName,
  setE2EControls,
} from '../shared/test-data'
import { swipeRight } from '../shared/gestures'

const { Given, When, Then } = createBdd()

const SAMPLE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

Given('I am on the Sound Effects tab in the Library', async ({ page }) => {
  await openLibraryFxTab(page)
})

Given('I have imported {string}, {string}, {string}', async ({ page }, a, b, c) => {
  await mergeE2EData(
    page,
    { fxTracks: [buildFxTrack(a), buildFxTrack(b), buildFxTrack(c)] },
    { navigateHome: false },
  )
  await openLibraryFxTab(page)
})

Given(
  '{string} is in the FX library with duration {} and base intensity {}',
  async ({ page }, name: string, duration: string, intensity: string) => {
    await mergeFxTrack(
      page,
      buildFxTrack(name, {
        durationSeconds: parseDurationSeconds(duration),
        baseIntensity: intensity as 'I' | 'II' | 'III',
      }),
    )
  },
)

Given(
  '{string} is in the FX library with tags {string} and {string}',
  async ({ page }, name: string, tag1: string, tag2: string) => {
    await mergeFxTrack(page, buildFxTrack(name, { tags: [tag1, tag2] }))
  },
)

Given('the FX library data has not yet resolved', async ({ page }) => {
  await resetE2EData(page)
  await setE2EControls(page, { fxLibraryState: 'loading' })
})

Given('I have not imported any FX tracks', async ({ page }) => {
  await resetE2EData(page)
})

Given('{string} is in the FX library', async ({ page }, name: string) => {
  await mergeFxTrack(page, buildFxTrack(name))
})

Given('I am editing {string} inline on its FX card', async ({ page }, name: string) => {
  await mergeFxTrack(page, buildFxTrack(name))
  await openLibraryFxTab(page)
  await page.locator(`[data-fx-edit="${name}"]`).click()
})

Given(
  '{string} is assigned to the {string} scene\'s soundboard',
  async ({ page }, fxName: string, sceneName: string) => {
    const sceneId = sceneIdForName(sceneName)
    const fx = buildFxTrack(fxName)
    await mergeE2EData(page, {
      scenes: [buildScene(sceneName)],
      fxTracks: [fx],
      sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
    })
  },
)

Given('an audio file {string} is available on my computer', async () => {
  // File availability is simulated via Playwright setInputFiles in the When step.
})

Given('a file {string} with invalid audio content is on my computer', async ({ page }) => {
  await setE2EControls(page, { invalidAudioImport: true })
})

Given(
  'I imported {string} and it appears as {string} in the library',
  async ({ page }, fileName: string, displayName: string) => {
    await mergeFxTrack(page, buildFxTrack(displayName, { audioUrl: `/assets/audio/soundboard/${fileName}` }))
  },
)

Given('the mini player is showing and {string} is playing', async ({ page }, name: string) => {
  await mergeFxTrack(page, buildFxTrack(name))
  await openLibraryFxTab(page)
  await page.locator(`[data-fx-card-body="${name}"]`).click()
  await expectAudioPlaying(page, name)
})

Given('the mini player is showing and {string} is paused', async ({ page }, name: string) => {
  await mergeFxTrack(page, buildFxTrack(name))
  await openLibraryFxTab(page)
  await page.locator(`[data-fx-card-body="${name}"]`).click()
  await page.locator('[data-mini-player-pause]').click()
})

Given(
  'the {string} FX card is previewing with a playing preview state',
  async ({ page }, name: string) => {
    await mergeFxTrack(page, buildFxTrack(name))
    await openLibraryFxTab(page)
    await page.locator(`[data-fx-card-body="${name}"]`).click()
  },
)

Given('the mini player is visible while previewing {string}', async ({ page }, name: string) => {
  await mergeFxTrack(page, buildFxTrack(name))
  await openLibraryFxTab(page)
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

Given('the mini player is visible while previewing an FX track', async ({ page }) => {
  await mergeFxTrack(page, buildFxTrack('Thunder Crack'))
  await openLibraryFxTab(page)
  await page.locator('[data-fx-card-body="Thunder Crack"]').click()
})

Given('the mini player is showing {string}', async ({ page }, name: string) => {
  await mergeFxTrack(page, buildFxTrack(name))
  await openLibraryFxTab(page)
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

When('I open the Sound Effects tab in the Library', async ({ page }) => {
  await openLibraryFxTab(page)
})

When('I edit {string} from its FX card', async ({ page }, name: string) => {
  await page.locator(`[data-fx-edit="${name}"]`).click()
})

When('I rename {string} to {string} and save inline edit', async ({ page }, _from, to) => {
  await page.locator('[data-fx-inline-name]').fill(to)
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I add the tag {string} to {string} from the predefined list and save', async ({ page }, tag, name) => {
  await expect(page.locator(`[data-fx-card="${name}"]`)).toBeVisible()
  await page.locator('[data-fx-tag-input]').fill(tag)
  await page.getByRole('option', { name: tag, exact: true }).click()
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I delete {string} from inline edit', async ({ page }, name: string) => {
  await page.locator(`[data-fx-inline-delete="${name}"]`).click()
})

When('I delete {string} from the FX library', async ({ page }, name: string) => {
  await openLibraryFxTab(page)
  await page.locator(`[data-fx-edit="${name}"]`).click()
  await page.locator(`[data-fx-inline-delete="${name}"]`).click()
})

When('I import {string} via Import FX', async ({ page }, fileName: string) => {
  await openLibraryFxTab(page)
  await page.locator('[data-fx-import-input]').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: SAMPLE_PNG,
  })
})

When('I attempt to import {string}', async ({ page }, fileName: string) => {
  await openLibraryFxTab(page)
  await page.locator('[data-fx-import-input]').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: SAMPLE_PNG,
  })
})

When('the original {string} file is deleted from my computer', async () => {
  // Playback uses app storage; no browser action required.
})

When('I open the FX import file picker', async ({ page }) => {
  await openLibraryFxTab(page)
  await page.locator('[data-fx-import-input]').click({ force: true })
})

When('I tap the {string} FX card body', async ({ page }, name: string) => {
  if (!page.url().includes('/library')) {
    await openLibraryFxTab(page)
  }
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

When('I tap the {string} soundscape category card body', async ({ page }, name: string) => {
  await page.locator(`[data-sc-card-body="${name}"]`).click()
})

When('I tap the {string} FX card thumbnail', async ({ page }, name: string) => {
  if (!page.url().includes('/library')) {
    await openLibraryFxTab(page)
  }
  await page.locator(`[data-fx-card-thumb="${name}"]`).click()
})

When('I preview {string} from its FX card', async ({ page }, name: string) => {
  if (!page.url().includes('/library')) {
    await openLibraryFxTab(page)
  }
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

When('I preview {string} from its soundscape category card', async ({ page }, name: string) => {
  await page.locator(`[data-sc-preview="${name}"]`).click()
})

When(
  'I preview {string} from its FX card while {string} is playing',
  async ({ page }, nextTrack: string) => {
    if (!page.url().includes('/library')) {
      await openLibraryFxTab(page)
    }
    await page.locator(`[data-fx-card-body="${nextTrack}"]`).click()
  },
)

When('I tap the pause button in the mini player', async ({ page }) => {
  await page.locator('[data-mini-player-pause]').click()
})

When('I tap the play button in the mini player', async ({ page }) => {
  await page.locator('[data-mini-player-play]').click()
})

When('I tap the {string} FX card body again', async ({ page }, name: string) => {
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

When('I navigate to Scenes', async ({ page }) => {
  await openScenes(page)
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.locator('[data-library-tab="Soundscapes"]').click()
})

Then('I see all three tracks as FX cards in the grid', async ({ page }) => {
  await expect(page.locator('[data-fx-card]')).toHaveCount(3)
})

Then('the {string} FX card shows the title {string}', async ({ page }, name, title) => {
  await expect(page.locator(`[data-fx-card-title="${name}"]`)).toHaveText(title)
})

Then('the {string} FX card shows duration {string} and base intensity {string}', async ({ page }, name, duration, intensity) => {
  const card = page.locator(`[data-fx-card="${name}"]`)
  await expect(card.locator('[data-fx-card-meta]')).toContainText(duration)
  await expect(card.locator('[data-fx-card-meta]')).toContainText(intensity)
})

Then(
  'the {string} FX card shows {string} and {string} tag chips',
  async ({ page }, name, tag1, tag2) => {
    const card = page.locator(`[data-fx-card="${name}"]`)
    await expect(card.locator(`[data-fx-tag="${tag1}"]`)).toBeVisible()
    await expect(card.locator(`[data-fx-tag="${tag2}"]`)).toBeVisible()
  },
)

Then('I see skeleton placeholder cards in the grid', async ({ page }) => {
  const isSoundscapes = page.url().includes('tab=soundscapes') || (await page.locator('[data-library-tab="Soundscapes"]').getAttribute('aria-selected')) === 'true'
  if (isSoundscapes) {
    await expect(page.locator('[data-sc-library-loading]')).toBeVisible()
  } else {
    await expect(page.locator('[data-fx-library-loading]')).toBeVisible()
  }
})

Then('I see a centred empty-state illustration', async ({ page }) => {
  const fxEmpty = page.locator('[data-fx-library-empty]')
  const scPickerEmpty = page.locator('[data-sc-picker-empty]')
  if (await scPickerEmpty.count() > 0) {
    await expect(scPickerEmpty).toBeVisible()
    return
  }
  await expect(fxEmpty).toBeVisible()
})

Then('I see copy directing me to import or download FX tracks', async ({ page }) => {
  await expect(page.locator('[data-fx-library-empty]')).toContainText(/import|download/i)
})

Then('I see a {string} button', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('the {string} FX card has no checkbox', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-card="${name}"] [data-fx-checkbox]`)).toHaveCount(0)
})

Then('I see inline edit on the {string} FX card with fields for Name and Tags', async ({ page }, name) => {
  const card = page.locator(`[data-fx-card="${name}"]`)
  await expect(card.locator('[data-fx-inline-name]')).toBeVisible()
  await expect(card.locator('[data-fx-tag-input]')).toBeVisible()
})

Then('the track appears as {string} in the FX library card grid', async ({ page }, name) => {
  await expect(page.locator(`[data-fx-card-title="${name}"]`)).toBeVisible()
})

Then('{string} shows the {string} tag chip on its FX card', async ({ page }, name, tag) => {
  await expect(page.locator(`[data-fx-card="${name}"] [data-fx-tag="${tag}"]`)).toBeVisible()
})

Then('{string} is moved to the Trash FX tab', async ({ page }, name: string) => {
  await page.goto('/trash?tab=fx')
  await expect(page.locator(`[data-trashed-fx="${name}"]`)).toBeVisible()
})

Then('it is no longer visible in the FX library', async ({ page }) => {
  await expect(page.locator('[data-fx-card]')).toHaveCount(0)
})

Then('the local copy of the audio file is retained for 7 days', async ({ page }) => {
  const notice = page.locator('[data-fx-retention-notice]')
  if ((await notice.count()) === 0) {
    await page.goto('/trash?tab=fx')
  }
  await expect(page.locator('[data-fx-retention-notice]')).toBeVisible()
})

Then(
  '{string} no longer appears in the {string} soundboard',
  async ({ page }, fxName: string, sceneName: string) => {
    await page.goto(`/scenes/${sceneIdForName(sceneName)}/active?tab=soundboard`)
    await expect(page.locator(`[data-soundboard-tile="${fxName}"]`)).toHaveCount(0)
  },
)

Then('{string} appears in the FX library card grid', async ({ page }, name: string) => {
  const displayName = name.includes('.') ? importDisplayName(name) : name
  await expect(page.locator(`[data-fx-card="${displayName}"]`)).toBeVisible()
})

Then('a local copy of the file is stored in app storage', async ({ page }) => {
  const hasStorage = await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return false
    const data = JSON.parse(raw)
    return (data.fxTracks ?? []).some((track: { audioUrl?: string }) => Boolean(track.audioUrl))
  })
  expect(hasStorage).toBe(true)
})

Then('I see download progress for the demo FX pack', async ({ page }) => {
  await expect(page.locator('[data-fx-download-progress]')).toBeVisible()
})

Then('new FX tracks appear in the FX library card grid when the download completes', async ({ page }) => {
  await expect(page.locator('[data-fx-card]').first()).toBeVisible({ timeout: 15_000 })
})

Then('I see the storefront', async ({ page }) => {
  await expect(page.locator('[data-storefront]')).toBeVisible()
})

Then(
  'non-audio files such as images, PDFs, and spreadsheets are not shown',
  async ({ page }) => {
    await expect(page.locator('[data-fx-import-input]')).toHaveAttribute('accept', /audio/i)
  },
)

Then('I see an error explaining the file could not be read as audio', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText(/could not be read as audio/i)
})

Then('I can dismiss the error and continue using the Library', async ({ page }) => {
  await page.getByRole('button', { name: /dismiss|close/i }).click()
  await expect(page.locator('[data-screen="Library screen"]')).toBeVisible()
})

Then('{string} still plays correctly from the app\'s local copy', async ({ page }, name: string) => {
  await page.locator(`[data-fx-card-body="${name}"]`).click()
  await expectAudioPlaying(page, name)
})

Then('the mini player appears at the bottom of the main content area', async ({ page }) => {
  await expect(page.locator('[data-mini-player]')).toBeVisible()
})

Then('the {string} FX card shows a playing preview state', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-card-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Then('the mini player displays {string} as the track name', async ({ page }, name: string) => {
  await expect(page.locator('[data-mini-player-track]')).toHaveText(name)
})

Then('{string} stops playing', async ({ page }, name: string) => {
  await expectAudioStopped(page, name)
})

Then('the mini player remains visible', async ({ page }) => {
  await expect(page.locator('[data-mini-player]')).toBeVisible()
})

Then('{string} begins playing again', async ({ page }, name: string) => {
  await expectAudioPlaying(page, name)
})

Then('the {string} FX card no longer shows a playing preview state', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-card-preview-state="${name}"]`)).toHaveAttribute('data-state', 'idle')
})

Then('the {string} soundscape category card no longer shows a playing preview state', async ({ page }, name: string) => {
  await expect(page.locator(`[data-sc-card-preview-state="${name}"]`)).toHaveAttribute('data-state', 'idle')
})

Then('the mini player is no longer visible', async ({ page }) => {
  await expect(page.locator('[data-mini-player]')).toHaveCount(0)
})

Then('{string} has stopped playing', async ({ page }, name: string) => {
  await expectAudioStopped(page, name)
})

Then('{string} stops', async ({ page }, name: string) => {
  await expectAudioStopped(page, name)
})

Then('the mini player updates to show {string}', async ({ page }, name: string) => {
  await expect(page.locator('[data-mini-player-track]')).toHaveText(name)
})

Then('the mini player disappears', async ({ page }) => {
  await expect(page.locator('[data-mini-player]')).toHaveCount(0)
})

Then('audio playback stops', async ({ page }) => {
  await expectNoAudioPlayback(page)
})

Given('I am on the Soundscapes tab in the Library', async ({ page }) => {
  await page.goto('/library?tab=soundscapes')
  await page.waitForLoadState('networkidle')
})

Given('I have created categories {string}, {string}, {string}', async ({ page }, cat1, cat2, cat3) => {
  const buildCat = (name: string) => ({
    id: `category-${name.toLowerCase()}`,
    name,
    trackCount: 0,
    levels: { I: [], II: [], III: [] }
  })
  await mergeE2EData(page, {
    soundscapeCategories: [buildCat(cat1), buildCat(cat2), buildCat(cat3)]
  }, { navigateHome: false })
})

When('I open the Soundscapes tab in the Library', async ({ page }) => {
  await page.goto('/library?tab=soundscapes')
  await page.waitForLoadState('networkidle')
})

Then('I see {string}, {string}, and {string} in the grid', async ({ page }, cat1, cat2, cat3) => {
  await expect(page.locator(`[data-sc-card="${cat1}"]`)).toBeVisible()
  await expect(page.locator(`[data-sc-card="${cat2}"]`)).toBeVisible()
  await expect(page.locator(`[data-sc-card="${cat3}"]`)).toBeVisible()
})

Then('I see download progress UI', async ({ page }) => {
  await expect(page.locator('[data-sc-download-progress]')).toBeVisible()
})

Then('new soundscape categories appear in the grid when the demo pack download completes', async ({ page }) => {
  for (const name of ['Forest', 'Boss', 'Combat', 'Mystery']) {
    await expect(page.locator(`[data-sc-card="${name}"]`)).toBeVisible({ timeout: 15000 })
  }
})

Given('{string} has {int} tracks at level I, {int} at level II, and {int} at level III', async ({ page }, catName, c1, c2, c3) => {
  const tracks: string[] = []
  const levelI: string[] = []
  const levelII: string[] = []
  const levelIII: string[] = []
  for (let i = 0; i < c1; i++) {
    const id = `track-i-${i}`
    levelI.push(id)
    tracks.push(id)
  }
  for (let i = 0; i < c2; i++) {
    const id = `track-ii-${i}`
    levelII.push(id)
    tracks.push(id)
  }
  for (let i = 0; i < c3; i++) {
    const id = `track-iii-${i}`
    levelIII.push(id)
    tracks.push(id)
  }

  const soundscapeTracks = tracks.map(id => ({
    id,
    name: `Track ${id}`,
    durationSeconds: 120,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundscape/light_rain.mp3',
    createdAt: new Date().toISOString()
  }))

  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: new Set(tracks).size,
    levels: { I: levelI, II: levelII, III: levelIII }
  }

  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks
  }, { navigateHome: false })
})

Then('the {string} soundscape category card shows {string}', async ({ page }, catName, text) => {
  const card = page.locator(`[data-sc-card="${catName}"]`)
  await expect(card.locator('[data-sc-card-meta]')).toContainText(text)
})

Given('{string} is in the soundscape categories grid', async ({ page }, catName) => {
  const track = {
    id: `track-${catName.toLowerCase().replace(/\s+/g, '-')}-sample`,
    name: `${catName} Sample`,
    durationSeconds: 120,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    createdAt: new Date().toISOString()
  }
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 1,
    levels: { I: [track.id], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks: [track]
  }, { navigateHome: false })
  await page.goto('/library?tab=soundscapes')
  await page.waitForLoadState('networkidle')
})

Then('I see the Soundscape Category Composer for {string}', async ({ page }, catName) => {
  const composer = page.getByRole('region', { name: 'Category Composer screen' })
  await expect(composer.getByRole('heading', { name: catName, exact: true })).toBeVisible()
  await expect(composer.getByText('Category Composer', { exact: true })).toBeVisible()
})

Given('soundscape library data has not yet resolved', async ({ page }) => {
  await resetE2EData(page)
  await setE2EControls(page, { soundscapeLibraryState: 'loading' })
})

Given('I have not created any soundscape categories', async ({ page }) => {
  await resetE2EData(page)
})

Then('I see a centred empty-state illustration with a prompt', async ({ page }) => {
  await expect(page.locator('[data-sc-library-empty]')).toBeVisible()
})

Then('I see a "+ Add Soundscape" tile at the end of the grid', async ({ page }) => {
  await expect(page.locator('[data-sc-add-tile]')).toBeVisible()
})

Given('{string} exists with {int} tracks at all intensity levels', async ({ page }, catName, trackCount) => {
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount,
    levels: { I: [], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category]
  }, { navigateHome: false })
})

Then('I see {string} in the grid', async ({ page }, catName) => {
  await expect(page.locator(`[data-sc-card="${catName}"]`)).toBeVisible()
})

When('I create a soundscape category named {string} via Add Soundscape', async ({ page }, catName) => {
  page.once('dialog', async dialog => {
    await dialog.accept(catName)
  })
  await page.locator('[data-sc-add-tile]').click()
})

Then('the {string} soundscape category card shows a playing preview state on the thumbnail', async ({ page }, name) => {
  await expect(page.locator(`[data-sc-card-preview-state="${name}"]`)).toHaveAttribute('data-state', 'playing')
})

Then('no mini player appears', async ({ page }) => {
  await expect(page.locator('[data-mini-player]')).toHaveCount(0)
})

Given('the {string} category is previewing a sample track', async ({ page }, catName) => {
  const track = {
    id: 'track-weather-sample',
    name: 'Weather Sample',
    durationSeconds: 120,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    createdAt: new Date().toISOString()
  }
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 1,
    levels: { I: ['track-weather-sample'], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks: [track]
  }, { navigateHome: false })
  await page.goto('/library?tab=soundscapes')
  await page.locator(`[data-sc-preview="${catName}"]`).click()
  await expect(page.locator(`[data-sc-card-preview-state="${catName}"]`)).toHaveAttribute('data-state', 'playing')
})

When('I stop the preview on the {string} soundscape category card', async ({ page }, catName) => {
  await page.locator(`[data-sc-preview="${catName}"]`).click()
})

Given('I am in the Soundscape Category Composer for {string}', async ({ page }, name) => {
  const category = {
    id: `category-${name.toLowerCase()}`,
    name,
    trackCount: 0,
    levels: { I: [], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${name.toLowerCase()}/compose`)
  await page.waitForLoadState('networkidle')
})

Then('I see exactly three intensity level rows labelled {string}, {string}, and {string}', async ({ page }, l1, l2, l3) => {
  await expect(page.locator(`[data-sc-level-header="I"]`)).toContainText(l1)
  await expect(page.locator(`[data-sc-level-header="II"]`)).toContainText(l2)
  await expect(page.locator(`[data-sc-level-header="III"]`)).toContainText(l3)
})

Then('I do not see an "Add intensity level" control', async ({ page }) => {
  await expect(page.locator('button:has-text("Add intensity level")')).toHaveCount(0)
})

Then('I see the category name {string}', async ({ page }, name) => {
  await expect(page.locator('h1.text-3xl')).toHaveText(name)
})

Given('I am in the Soundscape Category Composer for a new category {string}', async ({ page }, name) => {
  const category = {
    id: `category-${name.toLowerCase()}`,
    name,
    trackCount: 0,
    levels: { I: [], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${name.toLowerCase()}/compose`)
  await page.waitForLoadState('networkidle')
})

Then('{string} is expanded', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await expect(page.locator(`[data-sc-level-content="${lvl}"]`)).toBeVisible()
})

Then('{string} and {string} are collapsed', async ({ page }, lvl1, lvl2) => {
  const l1 = lvl1.split(' ')[1]
  const l2 = lvl2.split(' ')[1]
  await expect(page.locator(`[data-sc-level-content="${l1}"]`)).toHaveCount(0)
  await expect(page.locator(`[data-sc-level-content="${l2}"]`)).toHaveCount(0)
})

Given('{string} is expanded with no tracks', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  const content = page.locator(`[data-sc-level-content="${lvl}"]`)
  if (await content.count() === 0) {
    await page.locator(`[data-sc-level-header="${lvl}"]`).click()
  }
})

Then('I see only "Add track" in {string}', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  const content = page.locator(`[data-sc-level-content="${lvl}"]`)
  await expect(content.locator('button:has-text("Add track")')).toBeVisible()
  await expect(content.locator('[data-sc-composer-track]')).toHaveCount(0)
})

Then('I do not see placeholder track rows', async ({ page }) => {
  await expect(page.locator('[data-sc-placeholder-track]')).toHaveCount(0)
})

Given('{string} in {string} has 2 tracks and is expanded', async ({ page }, levelName, catName) => {
  const lvl = levelName.split(' ')[1]
  const track1 = {
    id: 't-1',
    name: 'Track One',
    durationSeconds: 120,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundscape/light_rain.mp3',
    createdAt: new Date().toISOString()
  }
  const track2 = {
    id: 't-2',
    name: 'Track Two',
    durationSeconds: 180,
    format: 'WAV',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundscape/light_rain.mp3',
    createdAt: new Date().toISOString()
  }
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 2,
    levels: {
      I: lvl === 'I' ? ['t-1', 't-2'] : [],
      II: lvl === 'II' ? ['t-1', 't-2'] : [],
      III: lvl === 'III' ? ['t-1', 't-2'] : [],
    }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks: [track1, track2]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
  const content = page.locator(`[data-sc-level-content="${lvl}"]`)
  if (await content.count() === 0) {
    await page.locator(`[data-sc-level-header="${lvl}"]`).click()
  }
})

When('I tap the collapse control on {string}', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await page.locator(`[data-sc-level-header="${lvl}"]`).click()
})

Then('the track list for {string} is hidden', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await expect(page.locator(`[data-sc-level-content="${lvl}"]`)).toHaveCount(0)
})

Then('the collapsed {string} row shows {string}', async ({ page }, levelName, text) => {
  const lvl = levelName.split(' ')[1]
  await expect(page.locator(`[data-sc-level-header="${lvl}"] [data-sc-level-count="${lvl}"]`)).toHaveText(text)
})

Given('{string} in {string} has 2 tracks and is collapsed', async ({ page }, levelName, catName) => {
  const lvl = levelName.split(' ')[1]
  const track1 = {
    id: 't-1',
    name: 'Track One',
    durationSeconds: 120,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundscape/light_rain.mp3',
    createdAt: new Date().toISOString()
  }
  const track2 = {
    id: 't-2',
    name: 'Track Two',
    durationSeconds: 180,
    format: 'WAV',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundscape/light_rain.mp3',
    createdAt: new Date().toISOString()
  }
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 2,
    levels: {
      I: lvl === 'I' ? ['t-1', 't-2'] : [],
      II: lvl === 'II' ? ['t-1', 't-2'] : [],
      III: lvl === 'III' ? ['t-1', 't-2'] : [],
    }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks: [track1, track2]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
  const content = page.locator(`[data-sc-level-content="${lvl}"]`)
  if (await content.count() > 0) {
    await page.locator(`[data-sc-level-header="${lvl}"]`).click()
  }
})

When('I tap the expand control on {string}', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await page.locator(`[data-sc-level-header="${lvl}"]`).click()
})

Then('the track list for {string} is visible', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await expect(page.locator(`[data-sc-level-content="${lvl}"]`)).toBeVisible()
})

Given('{string} is attached to {string} in {string}', async ({ page }, trackName, levelName, catName) => {
  const lvl = levelName.split(' ')[1]
  const trackId = `t-${trackName.toLowerCase().replace(/\s+/g, '-')}`
  const track = {
    id: trackId,
    name: trackName,
    durationSeconds: 222,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundscape/owl_hooting.ogg',
    createdAt: new Date().toISOString()
  }
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 1,
    levels: {
      I: lvl === 'I' ? [trackId] : [],
      II: lvl === 'II' ? [trackId] : [],
      III: lvl === 'III' ? [trackId] : [],
    }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks: [track]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
  await page.waitForLoadState('networkidle')
})

Then('I see {string} with subtitle {string}', async ({ page }, trackName, subtitle) => {
  const trackRow = page.locator(`[data-sc-composer-track="${trackName}"]`)
  await expect(trackRow).toBeVisible()
  await expect(trackRow).toContainText(subtitle)
})

When('I tap the remove control on {string} in {string}', async ({ page }, trackName, levelName) => {
  const lvl = levelName.split(' ')[1]
  const levelContent = page.locator(`[data-sc-level-content="${lvl}"]`)
  await levelContent.locator(`[data-sc-composer-track="${trackName}"] button`).click()
})

Then('{string} remains available in the library', async ({ page }, trackName) => {
  const exists = await page.evaluate((name) => {
    const data = JSON.parse(localStorage.getItem('arcanum-audio-data') || '{}')
    return (data.soundscapeTracks ?? []).some(
      (track: { name: string; deletedAt?: string }) => track.name === name && !track.deletedAt
    )
  }, trackName)
  expect(exists).toBe(true)
})

Given('I have made composition changes in {string}', async ({ page }, catName) => {
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 0,
    levels: { I: [], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
  await page.locator('[data-sc-level-header="II"]').click()
})

Then('I remain on the Soundscape Category Composer for {string}', async ({ page }, catName) => {
  expect(page.url()).toContain(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
})

Given('I have added a track to {string} in {string}', async ({ page }, levelName, catName) => {
  const lvl = levelName.split(' ')[1]
  const track = {
    id: 't-sample',
    name: 'Sample Track',
    durationSeconds: 120,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundscape/light_rain.mp3',
    createdAt: new Date().toISOString()
  }
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 0,
    levels: { I: [], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks: [track]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
  const composer = page.getByRole('region', { name: 'Category Composer screen' })
  await composer
    .locator(`[data-sc-level-content="${lvl}"]`)
    .getByRole('button', { name: 'Add track', exact: true })
    .click()
  const picker = page.getByRole('dialog')
  await picker.getByRole('checkbox', { name: 'Select Sample Track', exact: true }).check()
  const commit = picker.getByRole('button', { name: 'Add Selected (1)', exact: true })
  await expect(commit).toBeEnabled()
  await commit.click()
  await picker.getByRole('button', { name: '← Category Composer', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

Then('I return to the Library Soundscapes tab', async ({ page }) => {
  expect(page.url()).toContain('/library?tab=soundscapes')
})

Then('I do not see a discard-changes confirmation dialog', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

When('I reopen the Soundscape Category Composer for {string}', async ({ page }, catName) => {
  await page.locator(`[data-sc-card-body="${catName}"]`).click()
})

Then('the added track is still attached to {string}', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await expect(page.locator(`[data-sc-level-content="${lvl}"] [data-sc-composer-track="Sample Track"]`)).toBeVisible()
})

When('I tap "Add track" on {string}', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  const levelContent = page.locator(`[data-sc-level-content="${lvl}"]`)
  if (!(await levelContent.isVisible())) {
    await page.locator(`[data-sc-level-header="${lvl}"]`).click()
  }
  await levelContent.getByRole('button', { name: 'Add track', exact: true }).click()
})

Then('I see the Track Picker modal titled "Add track"', async ({ page }) => {
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Add track', exact: true })
  ).toBeVisible()
})

Then('I see an "Import" action', async ({ page }) => {
  await expect(page.locator('button:has-text("Import")')).toBeVisible()
})

Then('I see a picker search bar', async ({ page }) => {
  await expect(page.locator('[data-picker-search]')).toBeVisible()
})

Given('the Track Picker modal is open for {string} in {string}', async ({ page }, levelName, catName) => {
  const lvl = levelName.split(' ')[1]
  const categoryId = `category-${catName.toLowerCase()}`
  const categoryExists = await page.evaluate((id) => {
    const data = JSON.parse(localStorage.getItem('arcanum-audio-data') || '{}')
    return (data.soundscapeCategories ?? []).some((category: { id: string }) => category.id === id)
  }, categoryId)
  if (!categoryExists) {
    await mergeE2EData(page, {
      soundscapeCategories: [{
        id: categoryId,
        name: catName,
        trackCount: 0,
        levels: { I: [], II: [], III: [] }
      }]
    }, { navigateHome: false })
  }
  await page.goto(`/library/soundscapes/${categoryId}/compose`)
  const levelContent = page.locator(`[data-sc-level-content="${lvl}"]`)
  if (!(await levelContent.isVisible())) {
    await page.locator(`[data-sc-level-header="${lvl}"]`).click()
  }
  await levelContent.getByRole('button', { name: 'Add track', exact: true }).click()
})

Given('the soundscape library has {string}', async ({ page }, trackName) => {
  const track = {
    id: `t-${trackName.toLowerCase().replace(/\s+/g, '-')}`,
    name: trackName,
    durationSeconds: 222,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    createdAt: new Date().toISOString()
  }
  await mergeE2EData(page, {
    soundscapeTracks: [track]
  }, { navigateHome: false })
})

Then('the {string} picker track card displays a selection checkbox', async ({ page }, trackName) => {
  await expect(page.locator(`[data-picker-track="${trackName}"] [data-picker-checkbox="${trackName}"]`)).toBeVisible()
})

Then('the {string} picker track card shows format, channel, and duration metadata', async ({ page }, trackName) => {
  await expect(page.locator(`[data-picker-track="${trackName}"]`)).toContainText(/MP3|WAV|Stereo|Mono/)
})

Then('the {string} picker track card does not display a + button', async ({ page }, trackName) => {
  await expect(page.locator(`[data-picker-track="${trackName}"] button:has-text("+")`)).toHaveCount(0)
})

Given('the soundscape library has no tracks', async ({ page }) => {
  await resetE2EData(page)
})

Then('I see guidance to import tracks via Import', async ({ page }) => {
  await expect(page.locator('[data-picker-empty]')).toBeVisible()
})

Given('the soundscape library is still loading', async ({ page }) => {
  await setE2EControls(page, {
    fxLibraryState: 'loading',
    soundscapeLibraryState: 'loading',
  })
})

When('I open the Track Picker for {string} in {string}', async ({ page }, levelName, catName) => {
  const lvl = levelName.split(' ')[1]
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 0,
    levels: { I: [], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
  const levelContent = page.locator(`[data-sc-level-content="${lvl}"]`)
  if (!(await levelContent.isVisible())) {
    await page.locator(`[data-sc-level-header="${lvl}"]`).click()
  }
  await levelContent.getByRole('button', { name: 'Add track', exact: true }).click()
})

Then('I see picker track skeleton cards in the picker grid', async ({ page }) => {
  await expect(page.locator('[data-picker-loading]')).toBeVisible()
})

When('I import the audio file {string}', async ({ page }, fileName) => {
  await page.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: SAMPLE_PNG,
  })
})

Then('{string} is checked in the picker', async ({ page }, trackName) => {
  await expect(page.locator(`[data-picker-track="${trackName}"] input[type="checkbox"]`)).toBeChecked()
})

Then('no picker track cards are checked', async ({ page }) => {
  const checkboxes = page.locator('[data-picker-grid] input[type="checkbox"]')
  const count = await checkboxes.count()
  for (let i = 0; i < count; i++) {
    await expect(checkboxes.nth(i)).not.toBeChecked()
  }
})

Given('I have checked {string} and {string}', async ({ page }, t1, t2) => {
  await page.getByRole('checkbox', { name: `Select ${t1}`, exact: true }).check()
  await page.getByRole('checkbox', { name: `Select ${t2}`, exact: true }).check()
})

Given('I have checked {string}', async ({ page }, trackName) => {
  await page.getByRole('checkbox', { name: `Select ${trackName}`, exact: true }).check()
})

Then('the Track Picker modal stays open', async ({ page }) => {
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Add track', exact: true })
  ).toBeVisible()
})

When('I check {string} in the track picker', async ({ page }, trackName) => {
  await page.getByRole('checkbox', { name: `Select ${trackName}`, exact: true }).check()
})

When('I tap the picker track card body for {string}', async ({ page }, name: string) => {
  await page
    .locator(`[data-picker-track="${name}"]`)
    .getByRole('button', { name: `Preview ${name}`, exact: true })
    .click()
})

Given('the soundscape library has {string} and {string}', async ({ page }, t1, t2) => {
  const track1 = {
    id: `t-${t1.toLowerCase().replace(/\s+/g, '-')}`,
    name: t1,
    durationSeconds: 222,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    createdAt: new Date().toISOString()
  }
  const track2 = {
    id: `t-${t2.toLowerCase().replace(/\s+/g, '-')}`,
    name: t2,
    durationSeconds: 135,
    format: 'WAV',
    channels: 'Wide Stereo',
    audioUrl: '/assets/audio/soundboard/whip.ogg',
    createdAt: new Date().toISOString()
  }
  await mergeE2EData(page, {
    soundscapeTracks: [track1, track2]
  }, { navigateHome: false })
})

When('I open the Track Picker for {string}', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await page.locator(`[data-sc-level-content="${lvl}"] button:has-text("Add track")`).click()
})

Then('{string} appears on both {string} and {string}', async ({ page }, trackName, lvl1Name, lvl2Name) => {
  const l1 = lvl1Name.split(' ')[1]
  const l2 = lvl2Name.split(' ')[1]
  await expect(page.locator(`[data-sc-level-content="${l1}"] [data-sc-composer-track="${trackName}"]`)).toBeVisible()
  const content = page.locator(`[data-sc-level-content="${l2}"]`)
  if (await content.count() === 0) {
    await page.locator(`[data-sc-level-header="${l2}"]`).click()
  }
  await expect(page.locator(`[data-sc-level-content="${l2}"] [data-sc-composer-track="${trackName}"]`)).toBeVisible()
})

Then('the composition is persisted without tapping "Save Composition"', async ({ page }) => {
  const saved = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('arcanum-audio-data') || '{}')
    const weather = data.soundscapeCategories?.find(
      (category: { name: string; levels?: { I?: string[] } }) => category.name === 'Weather'
    )
    return weather?.levels?.I?.includes('t-thunderous-downpour')
  })
  expect(saved).toBe(true)
})

Given('I opened the Track Picker from "Add track" on {string} in {string}', async ({ page }, levelName, catName) => {
  const lvl = levelName.split(' ')[1]
  const track = {
    id: 't-thunderous-downpour',
    name: 'Thunderous Downpour',
    durationSeconds: 222,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    createdAt: new Date().toISOString()
  }
  const category = {
    id: `category-${catName.toLowerCase()}`,
    name: catName,
    trackCount: 0,
    levels: { I: [], II: [], III: [] }
  }
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    soundscapeTracks: [track]
  }, { navigateHome: false })
  await page.goto(`/library/soundscapes/category-${catName.toLowerCase()}/compose`)
  const levelContent = page.locator(`[data-sc-level-content="${lvl}"]`)
  if (!(await levelContent.isVisible())) {
    await page.locator(`[data-sc-level-header="${lvl}"]`).click()
  }
  await levelContent.getByRole('button', { name: 'Add track', exact: true }).click()
})

Then('{string} is still expanded', async ({ page }, levelName) => {
  const lvl = levelName.split(' ')[1]
  await expect(page.locator(`[data-sc-level-content="${lvl}"]`)).toBeVisible()
})

When('I delete {string} from the soundscape grid', async ({ page }, catName) => {
  await page.locator(`[data-sc-delete="${catName}"]`).click()
})

When('I swipe right on the {string} soundscape card', async ({ page }, catName) => {
  const card = page.locator(`[data-sc-card="${catName}"]`)
  const swipeTarget = page.locator('[data-swipe-delete]').filter({ has: card })
  await swipeRight(swipeTarget)
})

Then('{string} is moved to the Trash Soundscapes tab', async ({ page }, name) => {
  await page.goto('/trash?tab=soundscapes')
  await expect(page.locator(`[data-trashed-soundscape="${name}"]`)).toBeVisible()
})

Then('{string} is no longer in the soundscape categories grid', async ({ page }, name) => {
  await page.goto('/library?tab=soundscapes')
  await expect(page.locator(`[data-sc-card="${name}"]`)).toHaveCount(0)
})
