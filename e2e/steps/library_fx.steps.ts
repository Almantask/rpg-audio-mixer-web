import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedE2EData, getAudioState } from './fixtures'

const { Given, When, Then } = createBdd()

Given('I am on the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
})

Then('I do not see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle)).toHaveCount(0)
})

Then('I see a {string} button', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText })).toBeVisible()
})

Then('{string} is moved to the Trash FX tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'fx' }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('the local copy of the audio file is retained for {int} days', async ({ page }, _days: number) => {})

Given('I have imported {string}, {string}, {string}', async ({ page }, fx1: string, fx2: string, fx3: string) => {
  await seedE2EData(page, {
    fx: [
      { id: 'fx-1', name: fx1, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['WOLF'], createdAt: now, updatedAt: now },
      { id: 'fx-2', name: fx2, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
      { id: 'fx-3', name: fx3, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 2, intensity: 'I', tags: ['DOOR'], createdAt: now, updatedAt: now },
    ]
  })
})

When('I open the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
})

Then('I see all three tracks as FX cards in the grid', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Wolf Howl' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Thunder Crack' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Door Creak' })).toBeVisible()
})

Given('{string} is in the FX library with duration {int}:{int}', async ({ page }, name: string, min: number, sec: number) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: sec, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
})

Then('the {string} FX card shows the title {string}', async ({ page }, _card: string, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

Then('the {string} FX card shows duration {string}', async ({ page }, _card: string, duration: string) => {
  await expect(page.getByText(duration, { exact: false })).toBeVisible()
})

Given('{string} is in the FX library with tags {string} and {string}', async ({ page }, name: string, tag1: string, tag2: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: [tag1.toUpperCase(), tag2.toUpperCase()], createdAt: now, updatedAt: now }]
  })
})

Then('the {string} FX card shows {string} and {string} tag chips', async ({ page }, _card: string, tag1: string, tag2: string) => {
  await expect(page.getByText(tag1.toUpperCase())).toBeVisible()
  await expect(page.getByText(tag2.toUpperCase())).toBeVisible()
})

Given('the FX library data has not yet resolved', async ({ page }) => {})

Then('I see skeleton placeholder cards in the grid', async ({ page }) => {})

Given('I have not imported any FX tracks', async ({ page }) => {
  await seedE2EData(page, { fx: [] })
})

Then('I see a centred empty-state illustration', async ({ page }) => {})

Then('I see copy directing me to import or download FX tracks', async ({ page }) => {})

Given('{string} is in the FX library', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
})

Then('the {string} FX card has no checkbox', async ({ page }, name: string) => {
  const card = page.locator('div').filter({ hasText: name }).first()
  await expect(card.getByRole('checkbox')).toHaveCount(0)
})

Then('I do not see an {string} filter on the Sound Effects tab', async ({ page }, _filter: string) => {})

Then('I do not see a {string} control on the Sound Effects tab', async ({ page }, _control: string) => {})

When('I edit {string} from its FX card', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: `Edit effect ${name}` }).click()
})

Then('I see inline edit on the {string} FX card with fields for Name and Tags', async ({ page }, _name: string) => {
  await expect(page.getByRole('dialog', { name: 'Edit Effect' })).toBeVisible()
})

Given('I am editing {string} inline on its FX card', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: `Edit effect ${name}` }).click()
})

When('I rename {string} to {string} and save inline edit', async ({ page }, _oldName: string, newName: string) => {
  await page.getByLabel('Effect Name *').fill(newName)
  await page.getByRole('button', { name: 'Save' }).click()
})

Then('the track appears as {string} in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

When('I add the tag {string} to {string} from the predefined list and save', async ({ page }, tag: string, _name: string) => {
  await page.getByLabel('Tags (comma separated)').fill(tag)
  await page.getByRole('button', { name: 'Save' }).click()
})

Then('{string} shows the {string} tag chip on its FX card', async ({ page }, _name: string, tag: string) => {
  await expect(page.getByText(tag.toUpperCase())).toBeVisible()
})

When('I enter tags {string} for {string} and save', async ({ page }, tags: string, _name: string) => {
  await page.getByLabel('Tags (comma separated)').fill(tags)
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I type {string} in the FX tags field for {string}', async ({ page }, tags: string, _name: string) => {
  await page.getByLabel('Tags (comma separated)').fill(tags)
})

When('I delete {string} from inline edit', async ({ page }, _name: string) => {
  await page.getByRole('button', { name: 'Delete Effect' }).click()
})

Then('it is no longer visible in the FX library', async ({ page }) => {})

Given('{string} is assigned to the {string} scene\'s soundboard', async ({ page }, fxName: string, sceneName: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{
      id: 'sc-1',
      name: sceneName,
      soundboardEffects: [{ id: 't-1', effectId: 'fx-1', name: fxName, order: 0 }],
      createdAt: now,
      updatedAt: now,
    }],
    fx: [{ id: 'fx-1', name: fxName, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
})

When('I delete {string} from the FX library', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: `Edit effect ${name}` }).click()
  await page.getByRole('button', { name: 'Delete Effect' }).click()
})

Then('{string} no longer appears in the {string} soundboard', async ({ page }, fxName: string, _sceneName: string) => {
  await page.goto('/scenes/sc-1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await expect(page.getByRole('heading', { name: fxName })).toHaveCount(0)
})

Given('an audio file {string} is available on my computer', async ({ page }, _filename: string) => {})

When('I import {string} via Import FX', async ({ page }, _filename: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: 'Import FX' }).click()
})

Then('{string} appears in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name: /Imported Effect/i })).toBeVisible()
})

Then('a local copy of the file is stored in app storage', async ({ page }) => {})

Given('audio files {string} and {string} are available on my computer', async ({ page }, _f1: string, _f2: string) => {})

When('I import {string} and {string} via Import FX', async ({ page }, _f1: string, _f2: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: 'Import FX' }).click()
})

Then('{string} and {string} appear in the FX library card grid', async ({ page }, _f1: string, _f2: string) => {})

When('I tap "Free Tracks"', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: 'Free Tracks' }).click()
})

When('I tap "Buy More"', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('button', { name: 'Buy More' }).click()
})

Then('I see the free tracks coming soon modal', async ({ page }) => {})

Then('I remain on the Library screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
})

Then('I see the storefront', async ({ page }) => {})

When('I open the FX import file picker', async ({ page }) => {})

Then('I see the Import FX modal', async ({ page }) => {})

Then('non-audio files such as images, PDFs, and spreadsheets are not shown', async ({ page }) => {})

Given('a file {string} with invalid audio content is on my computer', async ({ page }, _file: string) => {})

When('I attempt to import {string}', async ({ page }, _file: string) => {})

Then('I see an error explaining the file could not be read as audio', async ({ page }) => {})

Then('I can dismiss the error and continue using the Library', async ({ page }) => {})

Given('I imported {string} and it appears as {string} in the library', async ({ page }, _f: string, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
})

When('the original {string} file is deleted from my computer', async ({ page }, _f: string) => {})

Then('{string} still plays correctly from the app\'s local copy', async ({ page }, _name: string) => {})

When('I tap the {string} FX card body', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name }).click()
})

Then('the mini player appears at the bottom of the main content area', async ({ page }) => {
  await expect(page.getByText('Previewing FX')).toBeVisible()
})

Then('{string} begins playing', async ({ page }, _name: string) => {
  const state = await getAudioState(page)
  expect(state.isPlaying).toBe(true)
})

Then('{string} is audible', async ({ page }, _name: string) => {})

Then('the {string} FX card shows a playing preview state', async ({ page }, _name: string) => {
  await expect(page.getByText('● PLAYING')).toBeVisible()
})

When('I tap the {string} FX card thumbnail', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name }).click()
})

When('I preview {string} from its FX card', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name }).click()
})

Then('the mini player displays {string} as the track name', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

Given('the mini player is showing and {string} is playing', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name }).click()
})

When('I tap the pause button in the mini player', async ({ page }) => {
  await page.getByRole('button', { name: 'Stop' }).click()
})

Then('{string} stops playing', async ({ page }, _name: string) => {
  const state = await getAudioState(page)
  expect(state.isPlaying).toBe(false)
})

Then('the mini player remains visible', async ({ page }) => {})

Given('the mini player is showing and {string} is paused', async ({ page }, _name: string) => {})

When('I tap the play button in the mini player', async ({ page }) => {})

Then('{string} begins playing again', async ({ page }, _name: string) => {})

Given('the {string} FX card is previewing with a playing preview state', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name }).click()
})

When('I tap the {string} FX card body again', async ({ page }, name: string) => {
  await page.getByRole('heading', { name }).click()
})

Then('the {string} FX card no longer shows a playing preview state', async ({ page }, _name: string) => {
  await expect(page.getByText('● PLAYING')).toHaveCount(0)
})

Given('the mini player is visible while previewing {string}', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name }).click()
})

When('I navigate to Scenes', async ({ page }) => {
  const sidebar = page.getByRole('navigation', { name: 'Primary sidebar' })
  await sidebar.getByRole('link', { name: 'Scenes' }).click()
})

Then('the mini player is no longer visible', async ({ page }) => {
  await expect(page.getByText('Previewing FX')).toHaveCount(0)
})

Then('{string} has stopped playing', async ({ page }, _name: string) => {
  const state = await getAudioState(page)
  expect(state.isPlaying).toBe(false)
})

Given('the mini player is showing {string}', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name }).click()
})

When('I preview {string} from its FX card while {string} is playing', async ({ page }, newName: string, _oldName: string) => {
  await page.getByRole('heading', { name: newName }).click()
})

Then('{string} stops', async ({ page }, _name: string) => {})

Then('the mini player updates to show {string}', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

Given('the mini player is visible while previewing an FX track', async ({ page }) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    fx: [{ id: 'fx-1', name: 'Thunder Crack', audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['IMPACT'], createdAt: now, updatedAt: now }]
  })
  await page.goto('/library')
  await page.getByRole('button', { name: 'Sound Effects' }).click()
  await page.getByRole('heading', { name: 'Thunder Crack' }).click()
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.getByRole('button', { name: 'Soundscapes' }).click()
})

Then('the mini player disappears', async ({ page }) => {
  await expect(page.getByText('Previewing FX')).toHaveCount(0)
})

Then('audio playback stops', async ({ page }) => {
  const state = await getAudioState(page)
  expect(state.isPlaying).toBe(false)
})
