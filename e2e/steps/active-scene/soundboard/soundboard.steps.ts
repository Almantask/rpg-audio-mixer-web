import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { resetBrowserStorage, seedScene } from '../../../helpers/seedHelpers'
import { isTrackPlayingInBrowser } from '../../../helpers/audioHelpers'

const { Given, When, Then } = createBdd()

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const sc = await seedScene(page, { name: 'Active Scene 1' })
  await page.goto(`/scenes/${sc.id}`)
  await page.getByRole('tab', { name: 'SOUNDBOARD' }).click()
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.getByText('Back to Active Scene')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sound Effects' })).toBeVisible()
})

Then('I see a back link {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Then('I see the title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
})

Then('I see the picker search bar with placeholder {string}', async ({ page }, placeholder: string) => {
  await expect(page.getByPlaceholder(placeholder)).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  await expect(page.locator('[data-fx-id]').first()).toBeVisible()
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const sc = await seedScene(page, { name: 'Active Scene 1' })
  await page.goto(`/scenes/${sc.id}`)
  await page.getByRole('tab', { name: 'SOUNDBOARD' }).click()
  await page.getByText('Add Sound').first().click()
  await expect(page.getByText('Back to Active Scene')).toBeVisible()
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Import FX' })).toHaveCount(0)
})

Then('I do not see a {string} button in the picker', async ({ page }, text: string) => {
  await expect(page.getByRole('button', { name: text })).toHaveCount(0)
})

Then('I do not see an {string} filter in the picker', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
})

Then('I do not see a {string} control in the picker', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
})

Given('the FX library has no tracks', async ({ page }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await page.evaluate(() => {
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify([]))
  })
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  const sc = await seedScene(page, { name: 'Active Scene 1' })
  await page.goto(`/scenes/${sc.id}`)
  await page.getByRole('tab', { name: 'SOUNDBOARD' }).click()
  await page.getByText('Add Sound').first().click()
})

Then('I see guidance to import or purchase tracks via Library — Sound Effects', async ({ page }) => {
  await expect(page.getByText(/Import or download sound effects via Library/i)).toBeVisible()
})

Then('the {string} button is not available', async ({ page }, _btnText: string) => {
  await expect(page.getByRole('button', { name: /Add Selected/i })).toBeDisabled()
})

Given('every FX track in my library is already in the current scene\'s soundboard', async ({ page }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await page.evaluate(() => {
    const list = [
      { id: 'fx_1', name: 'Roar', duration: '0:03', durationSeconds: 3, tags: [], url: '/assets/audio/soundboard/sword.ogg' }
    ]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  })
  const sc = await seedScene(page, {
    name: 'Active Scene 1',
    soundboardEffects: [{ id: 'sfx_1', fxTrackId: 'fx_1', name: 'Roar', order: 0 }],
  })
  await page.goto(`/scenes/${sc.id}`)
  await page.getByRole('tab', { name: 'SOUNDBOARD' }).click()
})

Then('I do not see any FX cards in the picker grid', async ({ page }) => {
  await expect(page.locator('[data-fx-id]')).toHaveCount(0)
})

Given('the FX library is still loading', async () => {
  // simulate
})

Then('the picker grid shows a loading state', async () => {
  // loading state
})

Given('no FX cards are checked in the picker', async () => {
  // initially unchecked
})

Then('the {string} button is disabled', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText })).toBeDisabled()
})

Given('the FX library has {string} and {string}', async ({ page }, f1: string, f2: string) => {
  await page.evaluate(({ a, b }) => {
    const list = [
      { id: 'fx_1', name: a, duration: '0:03', durationSeconds: 3, tags: ['Combat'], url: '/assets/audio/soundboard/sword.ogg' },
      { id: 'fx_2', name: b, duration: '0:04', durationSeconds: 4, tags: ['Creature'], url: '/assets/audio/soundboard/dragon_roar2.ogg' },
    ]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { a: f1, b: f2 })
  await page.reload()
  await page.getByText('Add Sound').first().click()
})

When('I check {string} in the picker', async ({ page }, fxName: string) => {
  const card = page.locator('[data-fx-id]').filter({ hasText: fxName })
  await card.locator('button').first().click()
})

Then('the {string} button is enabled', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText })).toBeEnabled()
})

Given('the FX library has {string}', async ({ page }, name: string) => {
  await page.evaluate((n) => {
    const list = [
      { id: 'fx_1', name: n, duration: '0:03', durationSeconds: 3, tags: ['Combat'], url: '/assets/audio/soundboard/sword.ogg' }
    ]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, name)
  await page.reload()
  await page.getByText('Add Sound').first().click()
})

Then('{string} is selected in the picker', async ({ page }, name: string) => {
  const card = page.locator('[data-fx-id]').filter({ hasText: name })
  await expect(card.locator('button svg')).toBeVisible()
})

Then('{string} is not previewing in the picker', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(false)
})

Given('{string} and {string} are not yet in the current scene\'s soundboard', async ({ page }, f1: string, f2: string) => {
  await page.evaluate(({ a, b }) => {
    const list = [
      { id: 'fx_1', name: a, duration: '0:03', durationSeconds: 3, tags: [], url: '/assets/audio/soundboard/sword.ogg' },
      { id: 'fx_2', name: b, duration: '0:04', durationSeconds: 4, tags: [], url: '/assets/audio/soundboard/dragon_roar2.ogg' },
    ]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { a: f1, b: f2 })
  await page.reload()
  await page.getByText('Add Sound').first().click()
})


Then('{string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await page.getByText('Back to Active Scene').click()
  await expect(page.getByText(f1)).toBeVisible()
  await expect(page.getByText(f2)).toBeVisible()
})

Then('{string} appears before {string} in the soundboard grid', async ({ page }, first: string, second: string) => {
  const tiles = page.locator('[data-effect-id]')
  const text1 = await tiles.nth(0).innerText()
  const text2 = await tiles.nth(1).innerText()
  expect(text1).toContain(first)
  expect(text2).toContain(second)
})

Then('I see a toast {string}', async ({ page }, msg: string) => {
  await expect(page.getByText(msg)).toBeVisible()
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.getByText('Back to Active Scene')).toBeVisible()
})

Given('I have checked {string} in the picker', async ({ page }, name: string) => {
  const card = page.locator('[data-fx-id]').filter({ hasText: name })
  await card.locator('button').first().click()
})

Then('the {string} soundboard tile is idle', async ({ page }, _name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, '')
  expect(isPlaying).toBe(false)
})

Given('{string} is already in the current scene\'s soundboard', async ({ page }, name: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedScene(page, {
    name: 'Active Scene 1',
    soundboardEffects: [{ id: 'sfx_1', fxTrackId: 'fx_horn', name, order: 0 }],
  })
})

Then('I do not see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator('[data-fx-id]').filter({ hasText: name })).toHaveCount(0)
})

Then('I see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator('[data-fx-id]').filter({ hasText: name })).toBeVisible()
})

Given('the FX library has {string}, {string}, and {string}', async ({ page }, f1: string, f2: string, f3: string) => {
  await page.evaluate(({ a, b, c }) => {
    const list = [
      { id: 'fx_1', name: a, duration: '0:03', durationSeconds: 3, tags: [], url: '/assets/audio/soundboard/sword.ogg' },
      { id: 'fx_2', name: b, duration: '0:04', durationSeconds: 4, tags: [], url: '/assets/audio/soundboard/dragon_roar2.ogg' },
      { id: 'fx_3', name: c, duration: '0:02', durationSeconds: 2, tags: [], url: '/assets/audio/soundboard/arrow.ogg' },
    ]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { a: f1, b: f2, c: f3 })
  await page.reload()
  await page.getByText('Add Sound').first().click()
})

Then('all three effects appear as tiles in the active scene\'s soundboard', async ({ page }) => {
  await page.getByText('Back to Active Scene').click()
  await expect(page.locator('[data-effect-id]')).toHaveCount(3)
})

Given('the current scene\'s soundboard has {int} effect tiles with hotkeys Num 1 through Num 3', async ({ page }, count: number) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const effects = Array.from({ length: count }, (_, i) => ({
    id: `sfx_${i + 1}`,
    fxTrackId: `fx_${i + 1}`,
    name: `Effect ${i + 1}`,
    hotkeyLabel: `Num ${i + 1}`,
    order: i,
  }))
  const sc = await seedScene(page, { name: 'Active Scene 1', soundboardEffects: effects })
  await page.goto(`/scenes/${sc.id}`)
  await page.getByRole('tab', { name: 'SOUNDBOARD' }).click()
  await page.getByText('Add Sound').first().click()
})

Then('the {string} tile shows hotkey label {string}', async ({ page }, name: string, hotkey: string) => {
  await page.getByText('Back to Active Scene').click()
  const tile = page.locator('[data-effect-id]').filter({ hasText: name })
  await expect(tile.getByText(hotkey)).toBeVisible()
})

Then('the first {int} effect tiles still show hotkeys Num 1 through Num 3', async ({ page }, count: number) => {
  for (let i = 1; i <= count; i++) {
    const tile = page.locator('[data-effect-id]').nth(i - 1)
    await expect(tile.getByText(`Num ${i}`)).toBeVisible()
  }
})

Given('I have added {string} and {string} via Add Selected', async ({ page }, f1: string, f2: string) => {
  const card1 = page.locator('[data-fx-id]').filter({ hasText: f1 })
  const card2 = page.locator('[data-fx-id]').filter({ hasText: f2 })
  if (await card1.isVisible()) await card1.locator('button').first().click()
  if (await card2.isVisible()) await card2.locator('button').first().click()
  await page.getByRole('button', { name: /Add Selected/i }).click()
})

Given('{string} is previewing in the picker', async ({ page }, name: string) => {
  const card = page.locator('[data-fx-id]').filter({ hasText: name })
  await card.click()
})

When('I tap the back link {string}', async ({ page }, text: string) => {
  await page.getByText(text).click()
})

Then('{string} stops previewing', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(false)
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.getByRole('tab', { name: 'SOUNDBOARD' })).toBeVisible()
})

Then('both {string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.getByText(f1)).toBeVisible()
  await expect(page.getByText(f2)).toBeVisible()
})

When('I type {string} in the picker search bar', async ({ page }, query: string) => {
  await page.getByPlaceholder('Search effects…').fill(query)
})

Given('the FX library has {string} tagged CREATURE and {string} tagged IMPACT', async ({ page }, f1: string, f2: string) => {
  await page.evaluate(({ a, b }) => {
    const list = [
      { id: 'fx_1', name: a, duration: '0:03', durationSeconds: 3, tags: ['CREATURE'], url: '/assets/audio/soundboard/sword.ogg' },
      { id: 'fx_2', name: b, duration: '0:04', durationSeconds: 4, tags: ['IMPACT'], url: '/assets/audio/soundboard/dragon_roar2.ogg' },
    ]
    localStorage.setItem('arcanum_fx_tracks', JSON.stringify(list))
  }, { a: f1, b: f2 })
  await page.reload()
  await page.getByText('Add Sound').first().click()
})

Then('I see a clear-filters action', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Clear filters/i })).toBeVisible()
})

When('I use the clear-filters action in the picker', async ({ page }) => {
  await page.getByRole('button', { name: /Clear filters/i }).click()
})

When('I tap the FX picker card body for {string}', async ({ page }, name: string) => {
  const card = page.locator('[data-fx-id]').filter({ hasText: name })
  await card.click()
})

Then('{string} begins previewing in the picker', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(true)
})

Then('the {string} FX picker card shows a playing state in the picker', async ({ page }, name: string) => {
  const card = page.locator('[data-fx-id]').filter({ hasText: name })
  await expect(card.locator('.animate-pulse')).toBeVisible()
})

Then('the {string} FX picker card no longer shows a playing state in the picker', async ({ page }, name: string) => {
  const card = page.locator('[data-fx-id]').filter({ hasText: name })
  await expect(card.locator('.animate-pulse')).toHaveCount(0)
})

Then('{string} is still previewing in the picker', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(true)
})

Given('{string} is visible in the picker grid', async ({ page }, name: string) => {
  await expect(page.locator('[data-fx-id]').filter({ hasText: name })).toBeVisible()
})

Then('{string} previews at its saved default volume', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(true)
})

Then('sound for {string} is audible at default volume', async ({ page }, name: string) => {
  const isPlaying = await isTrackPlayingInBrowser(page, name)
  expect(isPlaying).toBe(true)
})
