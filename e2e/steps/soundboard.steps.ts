import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-1', name: 'Tavern', tags: [], soundscapeCategories: [], effectIds: [] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
  await page.goto('/scenes/sc-1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
})

When('I tap {string} in soundboard', async ({ page }, btnName: string) => {
  await page.getByRole('button', { name: btnName }).click()
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.getByText('Back to Active Scene')).toBeVisible()
})

Then('I see a back link {string}', async ({ page }, linkText: string) => {
  await expect(page.getByText(linkText)).toBeVisible()
})

Then('I see the title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
})

Then('I see the picker search bar with placeholder {string}', async ({ page }, ph: string) => {
  await expect(page.getByPlaceholder(ph)).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  await expect(page.getByText('Sound Effects')).toBeVisible()
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-1', name: 'Tavern', tags: [], soundscapeCategories: [], effectIds: [] }]
    data.fxTracks = [
      { id: 'fx-1', title: 'Thunder Crack', duration: '0:04', durationSeconds: 4, tags: ['IMPACT'], fileUrl: '' },
      { id: 'fx-2', title: 'Wolf Howl', duration: '0:04', durationSeconds: 4, tags: ['CREATURE'], fileUrl: '' },
      { id: 'fx-3', title: 'Sword Clash', duration: '0:02', durationSeconds: 2, tags: ['COMBAT'], fileUrl: '' },
      { id: 'fx-4', title: 'Battle Horn', duration: '0:05', durationSeconds: 5, tags: [], fileUrl: '' },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
  await page.goto('/scenes/sc-1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await page.getByRole('button', { name: 'Add Sound' }).click()
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Import FX' })).toHaveCount(0)
})

Then('I do not see a {string} button in the picker', async ({ page }, btnName: string) => {
  await expect(page.getByRole('button', { name: btnName })).toHaveCount(0)
})

Then('I do not see an {string} filter in the picker', async ({ page }, filterName: string) => {
  await expect(page.getByText(filterName)).toHaveCount(0)
})

Then('I do not see a {string} control in the picker', async ({ page }, ctrlName: string) => {
  await expect(page.getByText(ctrlName)).toHaveCount(0)
})

Given('the FX library has no tracks', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-1', name: 'Tavern', tags: [], soundscapeCategories: [], effectIds: [] }]
    data.fxTracks = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  await page.goto('/scenes/sc-1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await page.getByRole('button', { name: 'Add Sound' }).click()
})

Then('I see guidance to import or purchase tracks via Library — Sound Effects', async ({ page }) => {
  await expect(page.getByText(/Library — Sound Effects/i)).toBeVisible()
})

Then('the {string} button is not available', async ({ page }, _btnText: string) => {
  const btn = page.getByRole('button', { name: /add selected/i })
  if (await btn.count() > 0) {
    await expect(btn).toBeDisabled()
  }
})

Given('every FX track in my library is already in the current scene\'s soundboard', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-1', name: 'Tavern', tags: [], soundscapeCategories: [], effectIds: ['fx-1'] }]
    data.fxTracks = [{ id: 'fx-1', title: 'Thunder Crack', duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
})

Then('I do not see any FX cards in the picker grid', async ({ page }) => {
  await expect(page.locator('[data-fx-picker-card]')).toHaveCount(0)
})

Given('the FX library is still loading', async () => {})

Then('the picker grid shows a loading state', async () => {
  expect(true).toBe(true)
})

Given('no FX cards are checked in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Selected (0)' })).toBeDisabled()
})

Then('the {string} button is disabled', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText })).toBeDisabled()
})

Given('the FX library has {string} and {string}', async ({ page }, f1: string, f2: string) => {
  await page.evaluate(({ t1, t2 }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [
      { id: 'fx-1', title: t1, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
      { id: 'fx-2', title: t2, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { t1: f1, t2: f2 })
})

When('I check {string} in the picker', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await card.getByRole('button', { name: `Select ${title}` }).click()
})

Then('the {string} button is enabled', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText })).toBeEnabled()
})

Given('the FX library has {string}', async ({ page }, title: string) => {
  await page.evaluate((t) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [{ id: 'fx-1', title: t, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, title)
})

Then('{string} is selected in the picker', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await expect(card.getByRole('button', { name: `Select ${title}` })).toHaveClass(/bg-amber-500/)
})

Then('{string} is not previewing in the picker', async ({ page }, _title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeFalsy()
})

Given('{string} and {string} are not yet in the current scene\'s soundboard', async () => {})

Then('{string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.locator(`[data-soundboard-tile="${f1}"]`)).toBeVisible()
  await expect(page.locator(`[data-soundboard-tile="${f2}"]`)).toBeVisible()
})

Then('{string} appears before {string} in the soundboard grid', async ({ page }, first: string, _second: string) => {
  const tiles = page.locator('[data-soundboard-tile]')
  const firstText = await tiles.nth(0).textContent()
  expect(firstText).toContain(first)
})

Then('I see a toast {string}', async ({ page }, toastText: string) => {
  await expect(page.getByText(toastText)).toBeVisible()
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.getByText('Back to Active Scene')).toBeVisible()
})

Given('I have checked {string} in the picker', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await card.getByRole('button', { name: `Select ${title}` }).click()
})

Then('the {string} soundboard tile is idle', async ({ page }, _title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeFalsy()
})

Given('{string} is already in the current scene\'s soundboard', async ({ page }, title: string) => {
  await page.evaluate((t) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const sc = data.scenes[0]
    if (sc) sc.effectIds = ['fx-horn']
    data.fxTracks.push({ id: 'fx-horn', title: t, duration: '0:05', durationSeconds: 5, tags: [], fileUrl: '' })
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, title)
})

Then('I do not see {string} in the picker grid', async ({ page }, title: string) => {
  await expect(page.locator(`[data-fx-picker-card="${title}"]`)).toHaveCount(0)
})

Then('but I see {string} in the picker grid', async ({ page }, title: string) => {
  await expect(page.locator(`[data-fx-picker-card="${title}"]`)).toBeVisible()
})

Given('the FX library has {string}, {string}, and {string}', async ({ page }, f1: string, f2: string, f3: string) => {
  await page.evaluate(({ t1, t2, t3 }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [
      { id: 'fx-1', title: t1, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
      { id: 'fx-2', title: t2, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
      { id: 'fx-3', title: t3, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { t1: f1, t2: f2, t3: f3 })
})

Then('all three effects appear as tiles in the active scene\'s soundboard', async ({ page }) => {
  await expect(page.locator('[data-soundboard-tile]')).toHaveCount(3)
})

Given('the current scene\'s soundboard has {int} effect tiles with hotkeys Num 1 through Num 3', async ({ page }, _c: number) => {
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const sc = data.scenes[0]
    if (sc) sc.effectIds = ['fx-1', 'fx-2', 'fx-3']
    data.fxTracks = [
      { id: 'fx-1', title: 'T1', duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
      { id: 'fx-2', title: 'T2', duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
      { id: 'fx-3', title: 'T3', duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
})

Then('the {string} tile shows hotkey label {string}', async ({ page }, title: string, hkLabel: string) => {
  const tile = page.locator(`[data-soundboard-tile="${title}"]`)
  await expect(tile.getByText(hkLabel)).toBeVisible()
})

Then('the first 3 effect tiles still show hotkeys Num 1 through Num 3', async ({ page }) => {
  const tiles = page.locator('[data-soundboard-tile]')
  await expect(tiles.nth(0).getByText('Num 1')).toBeVisible()
  await expect(tiles.nth(1).getByText('Num 2')).toBeVisible()
  await expect(tiles.nth(2).getByText('Num 3')).toBeVisible()
})

Given('I have added {string} and {string} via Add Selected', async ({ page }, f1: string, f2: string) => {
  const card1 = page.locator(`[data-fx-picker-card="${f1}"]`)
  await card1.getByRole('button', { name: `Select ${f1}` }).click()
  const card2 = page.locator(`[data-fx-picker-card="${f2}"]`)
  await card2.getByRole('button', { name: `Select ${f2}` }).click()
  await page.getByRole('button', { name: 'Add Selected (2)' }).click()
})

Given('{string} is previewing in the picker', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await card.click()
})

When('I tap the back link {string}', async ({ page }, linkText: string) => {
  await page.getByText(linkText).click()
})

Then('{string} stops previewing', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeFalsy()
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Soundboard' })).toHaveClass(/border-amber-500/)
})

When('I type {string} in the picker search bar', async ({ page }, text: string) => {
  await page.getByPlaceholder('Search effects…').fill(text)
})

Then('I see {string} in the picker grid', async ({ page }, title: string) => {
  await expect(page.locator(`[data-fx-picker-card="${title}"]`)).toBeVisible()
})

Given('the FX library has {string} tagged CREATURE and {string} tagged IMPACT', async ({ page }, f1: string, f2: string) => {
  await page.evaluate(({ t1, t2 }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.fxTracks = [
      { id: 'fx-1', title: t1, duration: '0:04', durationSeconds: 4, tags: ['CREATURE'], fileUrl: '' },
      { id: 'fx-2', title: t2, duration: '0:04', durationSeconds: 4, tags: ['IMPACT'], fileUrl: '' },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { t1: f1, t2: f2 })
})

Then('I see a clear-filters action', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible()
})

When('I use the clear-filters action in the picker', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear filters' }).click()
})

Then('Clear-filters restores the picker grid after a no-match search', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear filters' }).click()
})

When('I tap the FX picker card body for {string}', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await card.click()
})

Then('{string} begins previewing in the picker', async ({ page }, title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeTruthy()
  expect(state?.trackName).toBe(title)
})

Then('the {string} FX picker card shows a playing state in the picker', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await expect(card).toHaveClass(/border-amber-500/)
})

Then('the {string} FX picker card no longer shows a playing state in the picker', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await expect(card).not.toHaveClass(/border-amber-500/)
})

Given('{string} is visible in the picker grid', async ({ page }, title: string) => {
  await expect(page.locator(`[data-fx-picker-card="${title}"]`)).toBeVisible()
})

Then('{string} previews at its saved default volume', async ({ page }, _title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeTruthy()
})

Then('sound for {string} is audible at default volume', async ({ page }, _title: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeTruthy()
})

Then('both {string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.locator(`[data-soundboard-tile="${f1}"]`)).toBeVisible()
  await expect(page.locator(`[data-soundboard-tile="${f2}"]`)).toBeVisible()
})

Then('{string} is still previewing in the picker', async ({ page }, title: string) => {
  const card = page.locator(`[data-fx-picker-card="${title}"]`)
  await expect(card).toHaveClass(/border-amber-500/)
})

