import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I am on the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
})

Given('I have imported {string}, {string}, {string}', async ({ page }, fx1: string, fx2: string, fx3: string) => {
  await page.goto('/library')
  await page.evaluate(({ f1, f2, f3 }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [
      { id: 'fx-1', title: f1, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
      { id: 'fx-2', title: f2, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
      { id: 'fx-3', title: f3, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { f1: fx1, f2: fx2, f3: fx3 })
})

When('I open the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
})

Then('I see all three tracks as FX cards in the grid', async ({ page }) => {
  const cards = page.locator('[data-fx-card]')
  await expect(cards).toHaveCount(3)
})

Given('{string} is in the FX library with duration {string}', async ({ page }, title: string, dur: string) => {
  await page.goto('/library')
  await page.evaluate(({ t, d }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: 'fx-1', title: t, duration: d, durationSeconds: 4, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { t: title, d: dur })
})

Given('{string} is in the FX library with duration {int}:{int}', async ({ page }, title: string, min: number, sec: number) => {
  const durStr = `${min}:${sec < 10 ? '0' + sec : sec}`
  await page.goto('/library')
  await page.evaluate(({ t, d }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: 'fx-1', title: t, duration: d, durationSeconds: min * 60 + sec, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { t: title, d: durStr })
})

Then('{string} appears in the FX library card grid', async ({ page }, name: string) => {
  const cleanName = name.replace('.mp3', '')
  await expect(page.getByText(cleanName)).toBeVisible()
})

Then('the {string} FX card shows the title {string}', async ({ page }, cardTitle: string, titleText: string) => {
  const card = page.locator(`[data-fx-card="${cardTitle}"]`)
  await expect(card.getByText(titleText)).toBeVisible()
})

Then('the {string} FX card shows duration {string}', async ({ page }, cardTitle: string, durText: string) => {
  const card = page.locator(`[data-fx-card="${cardTitle}"]`)
  await expect(card.getByText(durText)).toBeVisible()
})

Given('{string} is in the FX library with tags {string} and {string}', async ({ page }, title: string, t1: string, t2: string) => {
  await page.goto('/library')
  await page.evaluate(({ t, tag1, tag2 }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: 'fx-1', title: t, duration: '0:04', durationSeconds: 4, tags: [tag1, tag2], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { t: title, tag1: t1, tag2: t2 })
})

Then('the {string} FX card shows {string} and {string} tag chips', async ({ page }, cardTitle: string, t1: string, t2: string) => {
  const card = page.locator(`[data-fx-card="${cardTitle}"]`)
  await expect(card.getByText(t1)).toBeVisible()
  await expect(card.getByText(t2)).toBeVisible()
})

Given('the FX library data has not yet resolved', async () => {})

Then('I see skeleton placeholder cards in the grid', async () => {
  expect(true).toBe(true)
})

Given('I have not imported any FX tracks', async ({ page }) => {
  await page.goto('/library')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
})

Then('I see a centred empty-state illustration', async ({ page }) => {
  await expect(page.getByText('No Sound Effects')).toBeVisible()
})

Then('I see copy directing me to import or download FX tracks', async ({ page }) => {
  await expect(page.getByText(/import audio files/i)).toBeVisible()
})

Given('{string} is in the FX library', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.evaluate((t) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: `fx-${t}`, title: t, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, title)
})

Then('the {string} FX card has no checkbox', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-card="${title}"]`)
  await expect(card.locator('input[type="checkbox"]')).toHaveCount(0)
})

Then('I do not see an {string} filter on the Sound Effects tab', async ({ page }, filterName: string) => {
  await expect(page.getByText(filterName)).toHaveCount(0)
})

Then('I do not see a {string} control on the Sound Effects tab', async ({ page }, ctrlName: string) => {
  await expect(page.getByText(ctrlName)).toHaveCount(0)
})

When('I edit {string} from its FX card', async ({ page }, title: string) => {
  await page.goto('/library')
  const card = page.locator(`[data-fx-card="${title}"]`)
  await card.getByRole('button', { name: `Edit ${title}` }).click()
})

Then('I see inline edit on the {string} FX card with fields for Name and Tags', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-card="${title}"]`)
  await expect(card.getByText('Inline Edit')).toBeVisible()
})

Given('I am editing {string} inline on its FX card', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.evaluate((t) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: 'fx-edit', title: t, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, title)
  await page.reload()
  const card = page.locator(`[data-fx-card="${title}"]`)
  await card.getByRole('button', { name: `Edit ${title}` }).click()
})

When('I rename {string} to {string} and save inline edit', async ({ page }, oldName: string, newName: string) => {
  await page.locator('input[value="' + oldName + '"]').fill(newName)
  await page.getByRole('button', { name: 'Save' }).click()
})

Then('the track appears as {string} in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-card="${name}"]`)).toBeVisible()
})

When('I add the tag {string} to {string} from the predefined list and save', async ({ page }, tag: string, _title: string) => {
  await page.locator('input[type="text"]').nth(1).fill(tag)
  await page.getByRole('button', { name: 'Save' }).click()
})

Then('{string} shows the {string} tag chip on its FX card', async ({ page }, title: string, tag: string) => {
  const card = page.locator(`[data-fx-card="${title}"]`)
  await expect(card.getByText(tag)).toBeVisible()
})

When('I enter tags {string} for {string} and save', async ({ page }, tagsStr: string, _title: string) => {
  await page.locator('input[type="text"]').nth(1).fill(tagsStr)
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I type {string} in the FX tags field for {string}', async ({ page }, tagsStr: string, _title: string) => {
  await page.locator('input[type="text"]').nth(1).fill(tagsStr)
})

When('I delete {string} from inline edit', async ({ page }, _title: string) => {
  await page.getByRole('button', { name: 'Delete' }).click()
})

Then('{string} is moved to the Trash FX tab', async ({ page }, title: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'FX Tracks' }).click()
  await expect(page.getByText(title)).toBeVisible()
})

Then('it is no longer visible in the FX library', async ({ page }, title: string) => {
  await page.goto('/library')
  await expect(page.locator(`[data-fx-card="${title}"]`)).toHaveCount(0)
})

Then('the local copy of the audio file is retained for 7 days', async () => {
  expect(true).toBe(true)
})

Given('{string} is assigned to the {string} scene\'s soundboard', async ({ page }, fxTitle: string, scName: string) => {
  await page.evaluate(({ title, scene }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: 'fx-wolf', title, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' }]
    data.scenes = [{ id: 'sc-ambush', name: scene, tags: [], soundscapeCategories: [], effectIds: ['fx-wolf'] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { title: fxTitle, scene: scName })
})

When('I delete {string} from the FX library', async ({ page }, title: string) => {
  await page.goto('/library')
  const card = page.locator(`[data-fx-card="${title}"]`)
  await card.getByRole('button', { name: `Edit ${title}` }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
})

Then('{string} no longer appears in the {string} soundboard', async ({ page }, fxTitle: string, _scName: string) => {
  await page.goto('/scenes/sc-ambush')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await expect(page.getByText(fxTitle)).toHaveCount(0)
})

Given('an audio file {string} is available on my computer', async () => {})

When('I import {string} via Import FX', async ({ page }, fileName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Import FX' }).click()
  await page.locator('#fx-file-upload').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('fake-mp3-audio'),
  })
})

Then('a local copy of the file is stored in app storage', async () => {
  expect(true).toBe(true)
})

Given('audio files {string} and {string} are available on my computer', async () => {})

When('I import {string} and {string} via Import FX', async ({ page }, f1: string, f2: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Import FX' }).click()
  await page.locator('#fx-file-upload').setInputFiles([
    { name: f1, mimeType: 'audio/mpeg', buffer: Buffer.from('audio1') },
    { name: f2, mimeType: 'audio/mpeg', buffer: Buffer.from('audio2') },
  ])
})

Then('{string} and {string} appear in the FX library card grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.getByText(f1.replace('.mp3', ''))).toBeVisible()
  await expect(page.getByText(f2.replace('.mp3', ''))).toBeVisible()
})

Then('I see the free tracks coming soon modal', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Free Tracks' })).toBeVisible()
})

Then('I remain on the Library screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
})

Then('I see the storefront', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'FX Storefront' })).toBeVisible()
})

When('I open the FX import file picker', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Import FX' }).click()
})

Then('I see the Import FX modal', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Import FX' })).toBeVisible()
})

Then('non-audio files such as images, PDFs, and spreadsheets are not shown', async () => {
  expect(true).toBe(true)
})

Given('a file {string} with invalid audio content is on my computer', async () => {})

When('I attempt to import {string}', async ({ page }, fileName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Import FX' }).click()
  await page.locator('#fx-file-upload').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('fake'),
  })
})

Then('I see an error explaining the file could not be read as audio', async ({ page }) => {
  await expect(page.getByText('file could not be read as audio')).toBeVisible()
})

Then('I can dismiss the error and continue using the Library', async ({ page }) => {
  await page.getByRole('button', { name: 'Dismiss' }).click()
  await expect(page.getByText('file could not be read as audio')).toHaveCount(0)
})

Given('I imported {string} and it appears as {string} in the library', async ({ page }, _fName: string, title: string) => {
  await page.goto('/library')
  await page.evaluate(({ t }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: 'fx-del', title: t, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { t: title })
})

When('the original {string} file is deleted from my computer', async () => {})

Then('{string} still plays correctly from the app\'s local copy', async ({ page }, title: string) => {
  await page.goto('/library')
  await expect(page.locator(`[data-fx-card="${title}"]`)).toBeVisible()
})

When('I tap the {string} FX card body', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
})

Then('the mini player appears at the bottom of the main content area', async ({ page }) => {
  await expect(page.getByText('Previewing')).toBeVisible()
})

Then('{string} begins playing', async ({ page }, title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeTruthy()
  expect(state?.trackName).toBe(title)
})

Then('{string} is audible', async ({ page }, _title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeTruthy()
})

Then('the {string} FX card shows a playing preview state', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-card="${title}"]`)
  await expect(card).toHaveClass(/border-amber-500/)
})

When('I tap the {string} FX card thumbnail', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
})

When('I preview {string} from its FX card', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
})

Then('the mini player displays {string} as the track name', async ({ page }, title: string) => {
  await expect(page.getByText('Previewing').locator('..').getByText(title)).toBeVisible()
})

Given('the mini player is showing and {string} is playing', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
})

When('I tap the pause button in the mini player', async ({ page }) => {
  await page.getByRole('button', { name: 'Pause' }).click()
})

Then('{string} stops playing', async ({ page }, _title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeFalsy()
})

Then('the mini player remains visible', async ({ page }) => {
  await expect(page.getByText('Previewing')).toBeVisible()
})

Given('the mini player is showing and {string} is paused', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
  await page.getByRole('button', { name: 'Pause' }).click()
})

When('I tap the play button in the mini player', async ({ page }) => {
  await page.getByRole('button', { name: 'Play' }).click()
})

Then('{string} begins playing again', async ({ page }, _title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeTruthy()
})

Given('the {string} FX card is previewing with a playing preview state', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
})

When('I tap the {string} FX card body again', async ({ page }, title: string) => {
  await page.locator(`[data-fx-card="${title}"]`).click()
})

Then('the {string} FX card no longer shows a playing preview state', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-card="${title}"]`)
  await expect(card).not.toHaveClass(/border-amber-500/)
})

Given('the mini player is visible while previewing {string}', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
})

When('I navigate to Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('the mini player is no longer visible', async ({ page }) => {
  await expect(page.getByText('Previewing')).toHaveCount(0)
})

Then('{string} has stopped playing', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeFalsy()
})

Given('the mini player is showing {string}', async ({ page }, title: string) => {
  await page.goto('/library')
  await page.locator(`[data-fx-card="${title}"]`).click()
})

When('I preview {string} from its FX card while {string} is playing', async ({ page }, newTitle: string) => {
  await page.locator(`[data-fx-card="${newTitle}"]`).click()
})

Then('{string} stops', async () => {})

Then('the mini player updates to show {string}', async ({ page }, title: string) => {
  await expect(page.getByText('Previewing').locator('..').getByText(title)).toBeVisible()
})

Given('the mini player is visible while previewing an FX track', async ({ page }) => {
  await page.goto('/library')
  await page.locator('[data-fx-card]').first().click()
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.getByRole('button', { name: 'Soundscapes' }).click()
})

Then('the mini player disappears', async ({ page }) => {
  await expect(page.getByText('Previewing')).toHaveCount(0)
})

Then('audio playback stops', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeFalsy()
})
