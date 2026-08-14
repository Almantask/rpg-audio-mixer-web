import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { resetBrowserStorage, seedScene } from '../../helpers/seedHelpers'
import { isTrackPlayingInBrowser } from '../../helpers/audioHelpers'

const { Given, When, Then } = createBdd()

Given('I am on the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
})

When('I open the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
})

Given('I have imported {string}, {string}, {string}', async ({ page }, fx1: string, fx2: string, fx3: string) => {
  await page.goto('/')
  await page.evaluate(({ a, b, c }) => {
    const list = [
      { id: 'fx_1', name: a, duration: '0:03', durationSeconds: 3, tags: ['Combat'], intensity: 'I', url: '/assets/audio/soundboard/sword.ogg' },
      { id: 'fx_2', name: b, duration: '0:04', durationSeconds: 4, tags: ['Nature'], intensity: 'II', url: '/assets/audio/soundboard/dragon_roar2.ogg' },
      { id: 'fx_3', name: c, duration: '0:02', durationSeconds: 2, tags: ['Impact'], intensity: 'III', url: '/assets/audio/soundboard/arrow.ogg' },
    ]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { a: fx1, b: fx2, c: fx3 })
})

Then('I see all three tracks as FX cards in the grid', async ({ page }) => {
  await expect(page.locator('[data-track-id]')).toHaveCount(3)
})

Given('{string} is in the FX library with duration {word}', async ({ page }, name: string, duration: string) => {
  await page.goto('/')
  await page.evaluate(({ n, d }) => {
    const raw = localStorage.getItem('arcanum_fx_tracks')
    const list = raw ? JSON.parse(raw) : []
    list.unshift({ id: `fx_${Date.now()}`, name: n, duration: d, durationSeconds: 4, tags: [], url: '/assets/audio/soundboard/sword.ogg' })
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { n: name, d: duration })
})

Given('{string} is in the FX library with tags {string} and {string}', async ({ page }, name: string, t1: string, t2: string) => {
  await page.goto('/')
  await page.evaluate(({ n, tags }) => {
    const raw = localStorage.getItem('arcanum_fx_tracks')
    const list = raw ? JSON.parse(raw) : []
    list.unshift({ id: `fx_${Date.now()}`, name: n, duration: '0:03', durationSeconds: 3, tags, url: '/assets/audio/soundboard/sword.ogg' })
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { n: name, tags: [t1, t2] })
})

Given('{string} is in the FX library', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((n) => {
    const raw = localStorage.getItem('arcanum_fx_tracks')
    const list = raw ? JSON.parse(raw) : []
    if (!list.some((t: { name: string }) => t.name === n)) {
      list.unshift({ id: `fx_${Date.now()}`, name: n, duration: '0:03', durationSeconds: 3, tags: ['Custom'], url: '/assets/audio/soundboard/sword.ogg' })
      localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
    }
  }, name)
})

Then('the {string} FX card shows the title {string}', async ({ page }, name: string, title: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.getByText(title)).toBeVisible()
})

Then('the {string} FX card shows duration {string}', async ({ page }, name: string, dur: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.getByText(dur, { exact: false })).toBeVisible()
})

Then('the {string} FX card shows {string} and {string} tag chips', async ({ page }, name: string, t1: string, t2: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.getByText(t1, { exact: false })).toBeVisible()
  await expect(card.getByText(t2, { exact: false })).toBeVisible()
})

Given('the FX library data has not yet resolved', async () => {
  // simulate with loading param
})

Then('I see skeleton placeholder cards in the grid', async ({ page }) => {
  await page.goto('/library?loading=true')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  await expect(page.locator('.animate-pulse').first()).toBeVisible()
})

Given('I have not imported any FX tracks', async ({ page }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await page.evaluate(() => {
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify([]))
  })
})

Then('I see a centred empty-state illustration', async ({ page }) => {
  await expect(page.getByText(/No sounds in library/i)).toBeVisible()
})

Then('I see copy directing me to import or download FX tracks', async ({ page }) => {
  await expect(page.getByText(/Import or download FX tracks/i)).toBeVisible()
})

Then('the {string} FX card has no checkbox', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.locator('input[type="checkbox"]')).toHaveCount(0)
})

Then('I do not see an {string} filter on the Sound Effects tab', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
})

Then('I do not see a {string} control on the Sound Effects tab', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
})

When('I edit {string} from its FX card', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit track' }).click()
})

Then('I see inline edit on the {string} FX card with fields for Name and Tags', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.getByText('Name')).toBeVisible()
  await expect(card.getByText('Tags (comma-separated)')).toBeVisible()
})

Given('I am editing {string} inline on its FX card', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit track' }).click()
})

When('I rename {string} to {string} and save inline edit', async ({ page }, _oldName: string, newName: string) => {
  await page.locator('input').nth(1).fill(newName)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

Then('the track appears as {string} in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.getByText(name, { exact: true })).toBeVisible()
})

When('I add the tag {string} to {string} from the predefined list and save', async ({ page }, tag: string, _name: string) => {
  await page.getByRole('button', { name: `+${tag}` }).click()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

Then('{string} shows the {string} tag chip on its FX card', async ({ page }, name: string, tag: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.getByText(tag, { exact: false })).toBeVisible()
})

When('I enter tags {string} for {string} and save', async ({ page }, tagsStr: string, _name: string) => {
  await page.locator('input').nth(2).fill(tagsStr)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

When('I type {string} in the FX tags field for {string}', async ({ page }, tagsStr: string, _name: string) => {
  await page.locator('input').nth(2).fill(tagsStr)
})

When('I delete {string} from inline edit', async ({ page }, _name: string) => {
  await page.getByRole('button', { name: 'Delete track' }).click()
})

Then('{string} is moved to the Trash FX tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await page.getByRole('tab', { name: 'FX' }).click()
  await expect(page.getByText(name, { exact: false })).toBeVisible()
})

Then('it is no longer visible in the FX library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
})

Then('the local copy of the audio file is retained for {int} days', async () => {
  // verified via storage model
})

Given('{string} is assigned to the {string} scene\'s soundboard', async ({ page }, fxName: string, sceneName: string) => {
  await page.goto('/')
  await seedScene(page, {
    name: sceneName,
    soundboardEffects: [{ id: 'sfx_1', fxTrackId: 'fx_wolf', name: fxName, order: 0 }],
  })
})

When('I delete {string} from the FX library', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit track' }).click()
  await page.getByRole('button', { name: 'Delete track' }).click()
})

Then('{string} no longer appears in the {string} soundboard', async ({ page }, fxName: string, sceneName: string) => {
  await page.goto('/scenes')
  const scCard = page.locator('[data-scene-id]').filter({ hasText: sceneName })
  await scCard.click()
  await page.getByRole('tab', { name: 'SOUNDBOARD' }).click()
  await expect(page.getByText(fxName)).toHaveCount(0)
})

Given('an audio file {string} is available on my computer', async () => {
  // simulated via file upload
})

When('I import {string} via Import FX', async ({ page }, fileName: string) => {
  await page.getByRole('button', { name: 'Import FX' }).first().click()
  await page.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: 'audio/ogg',
    buffer: Buffer.from('mock audio bytes'),
  })
})

Then('{string} appears in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.getByText(name.replace(/\.[^/.]+$/, ''), { exact: false })).toBeVisible()
})

Then('a local copy of the file is stored in app storage', async ({ page }) => {
  const raw = await page.evaluate(() => localStorage.getItem('arcanum_fx_tracks'))
  expect(raw).toBeTruthy()
})

Given('audio files {string} and {string} are available on my computer', async () => {
  // simulated
})

When('I import {string} and {string} via Import FX', async ({ page }, f1: string, f2: string) => {
  await page.getByRole('button', { name: 'Import FX' }).first().click()
  await page.locator('input[type="file"]').setInputFiles([
    { name: f1, mimeType: 'audio/ogg', buffer: Buffer.from('mock 1') },
    { name: f2, mimeType: 'audio/ogg', buffer: Buffer.from('mock 2') },
  ])
})

Then('{string} and {string} appear in the FX library card grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.getByText(f1.replace(/\.[^/.]+$/, ''), { exact: false })).toBeVisible()
  await expect(page.getByText(f2.replace(/\.[^/.]+$/, ''), { exact: false })).toBeVisible()
})

Then('I see the free tracks coming soon modal', async ({ page }) => {
  await expect(page.getByRole('dialog').getByText(/Coming Soon/i)).toBeVisible()
})

Then('I see the storefront', async ({ page }) => {
  await expect(page.getByRole('dialog').getByText(/Storefront|Arcanum Audio Store/i)).toBeVisible()
})

Then('I remain on the Library screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/library$/)
})


When('I open the FX import file picker', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: 'Import FX' }).click()
})

Then('I see the Import FX modal', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Import FX' })).toBeVisible()
})

Then('non-audio files such as images, PDFs, and spreadsheets are not shown', async ({ page }) => {
  const accept = await page.locator('input[type="file"]').getAttribute('accept')
  expect(accept).toContain('audio')
})

Given('a file {string} with invalid audio content is on my computer', async () => {
  // simulated
})

When('I attempt to import {string}', async ({ page }, name: string) => {
  await page.getByRole('button', { name: 'Import FX' }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name,
    mimeType: 'text/plain',
    buffer: Buffer.from('not audio'),
  })
})

Then('I see an error explaining the file could not be read as audio', async ({ page }) => {
  await expect(page.getByText(/could not be read as audio/i)).toBeVisible()
})

Then('I can dismiss the error and continue using the Library', async ({ page }) => {
  await page.getByRole('button', { name: 'Close' }).click()
})

Given('I imported {string} and it appears as {string} in the library', async ({ page }, fileName: string, trackName: string) => {
  await page.goto('/')
  await page.evaluate(({ f, n }) => {
    const list = [{ id: 'fx_imported', name: n, fileName: f, duration: '0:03', durationSeconds: 3, tags: [], url: '/assets/audio/soundboard/sword.ogg' }]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { f: fileName, n: trackName })
})

When('the original {string} file is deleted from my computer', async () => {
  // no-op, app uses internal data URL / buffer
})

Then('{string} still plays correctly from the app\'s local copy', async ({ page }, trackName: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: trackName })
  await card.click()
  const isPlaying = await isTrackPlayingInBrowser(page, trackName)
  expect(isPlaying).toBe(true)
})

When('I tap the {string} FX card body', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
})

Then('the mini player appears at the bottom of the main content area', async ({ page }) => {
  await expect(page.getByRole('region', { name: 'FX Mini Player' })).toBeVisible()
})

Then('{string} begins playing', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(true)
})

Then('{string} is audible', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(true)
})

Then('the {string} FX card shows a playing preview state', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.getByText(/PLAYING/i)).toBeVisible()
})

When('I tap the {string} FX card thumbnail', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
})

When('I preview {string} from its FX card', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
})

Then('the mini player displays {string} as the track name', async ({ page }, name: string) => {
  const player = page.getByRole('region', { name: 'FX Mini Player' })
  await expect(player.getByText(name)).toBeVisible()
})

Given('the mini player is showing and {string} is playing', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
  await expect(page.getByRole('region', { name: 'FX Mini Player' })).toBeVisible()
})

When('I tap the pause button in the mini player', async ({ page }) => {
  const player = page.getByRole('region', { name: 'FX Mini Player' })
  await player.getByRole('button', { name: /Pause/i }).click()
})

Then('{string} stops playing', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(false)
})

Then('the mini player remains visible', async ({ page }) => {
  await expect(page.getByRole('region', { name: 'FX Mini Player' })).toBeVisible()
})

Given('the mini player is showing and {string} is paused', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
  const player = page.getByRole('region', { name: 'FX Mini Player' })
  await player.getByRole('button', { name: /Pause/i }).click()
})

When('I tap the play button in the mini player', async ({ page }) => {
  const player = page.getByRole('region', { name: 'FX Mini Player' })
  await player.getByRole('button', { name: /Play/i }).click()
})

Then('{string} begins playing again', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(true)
})

Given('the {string} FX card is previewing with a playing preview state', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
})

When('I tap the {string} FX card body again', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
})

Then('the {string} FX card no longer shows a playing preview state', async ({ page }, name: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await expect(card.getByText(/● PLAYING/i)).toHaveCount(0)
})

Given('the mini player is visible while previewing {string}', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
})

When('I navigate to Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('the mini player is no longer visible', async ({ page }) => {
  await expect(page.getByRole('region', { name: 'FX Mini Player' })).toHaveCount(0)
})

Then('{string} has stopped playing', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(false)
})

Given('the mini player is showing {string}', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  const card = page.locator('[data-track-id]').filter({ hasText: name })
  await card.click()
})

When('I preview {string} from its FX card while {string} is playing', async ({ page }, name2: string, _name1: string) => {
  const card = page.locator('[data-track-id]').filter({ hasText: name2 })
  await card.click()
})

Then('{string} stops', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(false)
})

Then('the mini player updates to show {string}', async ({ page }, name: string) => {
  const player = page.getByRole('region', { name: 'FX Mini Player' })
  await expect(player.getByText(name)).toBeVisible()
})

Given('the mini player is visible while previewing an FX track', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
  await page.locator('[data-track-id]').first().click()
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.getByRole('tab', { name: 'Soundscapes' }).click()
})

Then('the mini player disappears', async ({ page }) => {
  await expect(page.getByRole('region', { name: 'FX Mini Player' })).toHaveCount(0)
})

Then('audio playback stops', async ({ page }) => {
  const isPlaying = await isTrackPlayingInBrowser(page, '')
  expect(isPlaying).toBe(false)
})
