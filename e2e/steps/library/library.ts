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
  '{string} is in the FX library with duration {string} and base intensity {string}',
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
  'the {string} card is previewing with a playing preview state',
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

When('I edit {string} from its card', async ({ page }, name: string) => {
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

When('I tap the {string} card body', async ({ page }, name: string) => {
  if (!page.url().includes('/library')) {
    await openLibraryFxTab(page)
  }
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

When('I tap the {string} card thumbnail', async ({ page }, name: string) => {
  if (!page.url().includes('/library')) {
    await openLibraryFxTab(page)
  }
  await page.locator(`[data-fx-card-thumb="${name}"]`).click()
})

When('I preview {string} from its card', async ({ page }, name: string) => {
  if (!page.url().includes('/library')) {
    await openLibraryFxTab(page)
  }
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

When(
  'I preview {string} from its card while {string} is playing',
  async ({ page }, nextTrack: string) => {
    await mergeFxTrack(page, buildFxTrack(nextTrack), { openLibrary: true })
    await page.locator(`[data-fx-card-body="${nextTrack}"]`).click()
  },
)

When('I tap the pause button in the mini player', async ({ page }) => {
  await page.locator('[data-mini-player-pause]').click()
})

When('I tap the play button in the mini player', async ({ page }) => {
  await page.locator('[data-mini-player-play]').click()
})

When('I tap the {string} card body again', async ({ page }, name: string) => {
  await page.locator(`[data-fx-card-body="${name}"]`).click()
})

When('I navigate to Scenes', async ({ page }) => {
  await openScenes(page)
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.locator('[data-library-tab="Soundscapes"]').click()
})

Then('I see all three tracks as cards in the grid', async ({ page }) => {
  await expect(page.locator('[data-fx-card]')).toHaveCount(3)
})

Then('the {string} card shows the title {string}', async ({ page }, name, title) => {
  await expect(page.locator(`[data-fx-card-title="${name}"]`)).toHaveText(title)
})

Then('the card shows duration {string} and base intensity {string}', async ({ page }, duration, intensity) => {
  await expect(page.locator('[data-fx-card-meta]').first()).toContainText(duration)
  await expect(page.locator('[data-fx-card-meta]').first()).toContainText(intensity)
})

Then(
  'the {string} card shows {string} and {string} tag chips',
  async ({ page }, name, tag1, tag2) => {
    const card = page.locator(`[data-fx-card="${name}"]`)
    await expect(card.locator(`[data-fx-tag="${tag1}"]`)).toBeVisible()
    await expect(card.locator(`[data-fx-tag="${tag2}"]`)).toBeVisible()
  },
)

Then('I see skeleton placeholder cards in the grid', async ({ page }) => {
  await expect(page.locator('[data-fx-library-loading]')).toBeVisible()
})

Then('I see a centred empty-state illustration', async ({ page }) => {
  await expect(page.locator('[data-fx-library-empty]')).toBeVisible()
})

Then('I see copy directing me to import or download FX tracks', async ({ page }) => {
  await expect(page.locator('[data-fx-library-empty]')).toContainText(/import|download/i)
})

Then('I see a {string} button', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('the {string} card has no checkbox', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-card="${name}"] [data-fx-checkbox]`)).toHaveCount(0)
})

Then('I see inline edit on the {string} card with fields for Name and Tags', async ({ page }, name) => {
  const card = page.locator(`[data-fx-card="${name}"]`)
  await expect(card.locator('[data-fx-inline-name]')).toBeVisible()
  await expect(card.locator('[data-fx-tag-input]')).toBeVisible()
})

Then('the track appears as {string} in the FX library card grid', async ({ page }, name) => {
  await expect(page.locator(`[data-fx-card-title="${name}"]`)).toBeVisible()
})

Then('{string} shows the {string} tag chip on its card', async ({ page }, name, tag) => {
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

Then('new FX tracks appear in the card grid when the download completes', async ({ page }) => {
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

Then('{string} begins playing', async ({ page }, name: string) => {
  await expectAudioPlaying(page, name)
})

Then('the {string} card shows a playing preview state', async ({ page }, name: string) => {
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

Then('the {string} card no longer shows a playing preview state', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-card-preview-state="${name}"]`)).toHaveAttribute('data-state', 'idle')
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
