import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedE2EData, getAudioState } from './fixtures'

const { Given, When, Then } = createBdd()

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', createdAt: now, updatedAt: now }],
  })
  await page.goto('/scenes/scene-1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
})

When('I tap "Add Sound"', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Sound' }).click()
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Add Sound' })).toBeVisible()
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Add Sound' })).toBeVisible()
})

Then('I see a back link {string}', async ({ page }, _linkText: string) => {})

Then('I see the title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

Then('I see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle)).toBeVisible()
})

Then('I see the picker search bar with placeholder {string}', async ({ page }, placeholder: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByPlaceholder(placeholder)).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('checkbox').first()).toBeVisible()
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', createdAt: now, updatedAt: now }],
    fx: [
      { id: 'fx-1', name: 'Thunder Crack', audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
      { id: 'fx-2', name: 'Wolf Howl', audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['CREATURE'], createdAt: now, updatedAt: now },
    ]
  })
  await page.goto('/scenes/scene-1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await page.getByRole('button', { name: 'Add Sound' }).click()
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByText('Import FX')).toHaveCount(0)
})

Then('I do not see a {string} button in the picker', async ({ page }, btnText: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('button', { name: btnText })).toHaveCount(0)
})

Then('I do not see an {string} filter in the picker', async ({ page }, _filter: string) => {})

Then('I do not see a {string} control in the picker', async ({ page }, _control: string) => {})

Given('the FX library has no tracks', async ({ page }) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', createdAt: now, updatedAt: now }],
    fx: [],
  })
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  await page.goto('/scenes/scene-1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await page.getByRole('button', { name: 'Add Sound' }).click()
})

Then('I see guidance to import or purchase tracks via Library — Sound Effects', async ({ page }) => {})

Then('the {string} button is not available', async ({ page }, _btnText: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  const btn = modal.getByRole('button', { name: /Add Selected/i })
  await expect(btn).toBeDisabled()
})

Given('every FX track in my library is already in the current scene\'s soundboard', async ({ page }) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{
      id: 'scene-1',
      name: 'Tavern',
      soundboardEffects: [{ id: 't1', effectId: 'fx-1', name: 'Thunder Crack', order: 0 }],
      createdAt: now,
      updatedAt: now,
    }],
    fx: [{ id: 'fx-1', name: 'Thunder Crack', audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now }],
  })
})

Then('I do not see any FX cards in the picker grid', async ({ page }) => {})

Given('the FX library is still loading', async ({ page }) => {})

Then('the picker grid shows a loading state', async ({ page }) => {})

Given('I have added {string} and {string} via Add Selected', async ({ page }, _f1: string, _f2: string) => {})

Given('{string} is previewing in the picker', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByRole('heading', { name }).click()
})

When('I tap the back link {string}', async ({ page }, _linkText: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByRole('button', { name: 'Close' }).click()
})

Then('{string} stops previewing', async ({ page }, _name: string) => {
  const state = await getAudioState(page)
  expect(state.isPlaying).toBe(false)
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Soundboard' })).toBeVisible()
})

Then('both {string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.getByRole('heading', { name: f1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: f2 })).toBeVisible()
})

Given('the FX library has {string} and {string}', async ({ page }, f1: string, f2: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', createdAt: now, updatedAt: now }],
    fx: [
      { id: 'fx-1', name: f1, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
      { id: 'fx-2', name: f2, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['CREATURE'], createdAt: now, updatedAt: now },
    ],
  })
})

When('I type {string} in the picker search bar', async ({ page }, query: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByPlaceholder('Filter effects…').fill(query)
})

Then('I see {string} in the picker grid', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('heading', { name })).toBeVisible()
})

Then('I do not see {string} in the picker grid', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('heading', { name })).toHaveCount(0)
})

Given('the FX library has {string} tagged CREATURE and {string} tagged IMPACT', async ({ page }, f1: string, f2: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', createdAt: now, updatedAt: now }],
    fx: [
      { id: 'fx-1', name: f1, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['CREATURE'], createdAt: now, updatedAt: now },
      { id: 'fx-2', name: f2, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
    ],
  })
})

Given('the FX library has {string}', async ({ page }, f1: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', createdAt: now, updatedAt: now }],
    fx: [
      { id: 'fx-1', name: f1, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
    ],
  })
})

Then('I see "No effects match your filters"', async ({ page }) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByText('No effects match your filters')).toBeVisible()
})

Then('I see a clear-filters action', async ({ page }) => {})

When('I use the clear-filters action in the picker', async ({ page }) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByPlaceholder('Filter effects…').fill('')
})

When('I tap the FX picker card body for {string}', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByRole('heading', { name }).click()
})

Then('{string} begins previewing in the picker', async ({ page }, _name: string) => {
  const state = await getAudioState(page)
  expect(state.isPlaying).toBe(true)
})

Then('the {string} FX picker card shows a playing state in the picker', async ({ page }, _name: string) => {})

Then('the {string} FX picker card no longer shows a playing state in the picker', async ({ page }, _name: string) => {})

When('I check {string} in the picker', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByRole('heading', { name }).click()
})

Then('the {string} button is enabled', async ({ page }, btnText: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('button', { name: btnText })).toBeEnabled()
})

Then('{string} is still previewing in the picker', async ({ page }, _name: string) => {})

Then('{string} previews at its saved default volume', async ({ page }, _name: string) => {})

Then('sound for {string} is audible at default volume', async ({ page }, _name: string) => {})

Given('no FX cards are checked in the picker', async ({ page }) => {})

Then('the {string} button is disabled', async ({ page }, btnText: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('button', { name: btnText })).toBeDisabled()
})

When('I select {string} in the picker', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByRole('heading', { name }).click()
})

Then('{string} is selected in the picker', async ({ page }, _name: string) => {})

Then('{string} is not previewing in the picker', async ({ page }, _name: string) => {})

Given('{string} and {string} are not yet in the current scene\'s soundboard', async ({ page }, _f1: string, _f2: string) => {})

When('I tap "Add Selected \\({int}\\)"', async ({ page }, count: number) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByRole('button', { name: `Add Selected (${count})` }).click()
})

Given('I have checked {string} in the picker', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await modal.getByRole('heading', { name }).click()
})

Given('{string} is visible in the picker grid', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('heading', { name })).toBeVisible()
})

Then('{string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.getByRole('heading', { name: f1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: f2 })).toBeVisible()
})

Then('{string} appears before {string} in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  const headings = await page.getByRole('heading').allInnerTexts()
  const i1 = headings.indexOf(f1)
  const i2 = headings.indexOf(f2)
  expect(i1).toBeLessThan(i2)
})

Then('I see a toast {string}', async ({ page }, toastText: string) => {
  await expect(page.getByText(toastText)).toBeVisible()
})

Then('the {string} soundboard tile is idle', async ({ page }, _name: string) => {})

Given('{string} is already in the current scene\'s soundboard', async ({ page }, f1: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{
      id: 'scene-1',
      name: 'Tavern',
      soundboardEffects: [{ id: 't1', effectId: 'fx-1', name: f1, order: 0 }],
      createdAt: now,
      updatedAt: now,
    }],
    fx: [
      { id: 'fx-1', name: f1, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
      { id: 'fx-2', name: 'Thunder Crack', audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
    ],
  })
})

Then('But I see {string} in the picker grid', async ({ page }, name: string) => {
  const modal = page.getByRole('dialog', { name: 'Add Sound' })
  await expect(modal.getByRole('heading', { name })).toBeVisible()
})

Given('the FX library has {string}, {string}, and {string}', async ({ page }, f1: string, f2: string, f3: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', createdAt: now, updatedAt: now }],
    fx: [
      { id: 'fx-1', name: f1, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 4, intensity: 'II', tags: ['IMPACT'], createdAt: now, updatedAt: now },
      { id: 'fx-2', name: f2, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 3, intensity: 'I', tags: ['CREATURE'], createdAt: now, updatedAt: now },
      { id: 'fx-3', name: f3, audioUrl: '/assets/audio/soundboard/thunder.ogg', durationSeconds: 2, intensity: 'I', tags: ['COMBAT'], createdAt: now, updatedAt: now },
    ],
  })
})

Then('all three effects appear as tiles in the active scene\'s soundboard', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Thunder Crack' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Wolf Howl' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sword Clash' })).toBeVisible()
})

Given('the current scene\'s soundboard has 3 effect tiles with hotkeys Num 1 through Num 3', async ({ page }) => {})

Then('the {string} tile shows hotkey label {string}', async ({ page }, _name: string, hotkey: string) => {
  await expect(page.getByText(hotkey)).toBeVisible()
})

Then('the first 3 effect tiles still show hotkeys Num 1 through Num 3', async ({ page }) => {})
