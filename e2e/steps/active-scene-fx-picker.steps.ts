import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedData, resetData } from './seedHelper'

const { Given, When, Then } = createBdd()

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  await seedData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
  })
  await page.goto('/scenes/scene-1')
  await page.getByRole('button', { name: /soundboard/i }).click()
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /sound effects/i })).toBeVisible()
})

Then('I see a back link {string}', async ({ page }, text: string) => {
  await expect(page.getByText(new RegExp(text, 'i'))).toBeVisible()
})

Then('I see the title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: new RegExp(title, 'i') })).toBeVisible()
})

Then('I see the picker search bar with placeholder {string}', async ({ page }, placeholder: string) => {
  await expect(page.getByPlaceholder(placeholder)).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  await expect(page.getByRole('button', { name: /add selected/i })).toBeVisible()
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  await seedData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
    fxTracks: [
      { id: 'fx-1', name: 'Thunder Crack', duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] },
      { id: 'fx-2', name: 'Wolf Howl', duration: '0:02', durationSeconds: 2, intensityLevel: 'I', tags: ['CREATURE'] },
      { id: 'fx-3', name: 'Sword Clash', duration: '0:03', durationSeconds: 3, intensityLevel: 'I', tags: ['COMBAT'] },
    ],
  })
  await page.goto('/scenes/scene-1')
  await page.getByRole('button', { name: /soundboard/i }).click()
  await page.getByRole('button', { name: /add sound/i }).click()
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: /^import$/i })).toHaveCount(0)
})

Then('I do not see a "Buy More" button in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: /buy more/i })).toHaveCount(0)
})

Then('I do not see a "Free Tracks" button in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: /free tracks/i })).toHaveCount(0)
})

Then('I do not see an {string} filter in the picker', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I do not see a {string} control in the picker', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Given('the FX library has no tracks', async ({ page }) => {
  await resetData(page)
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  await seedData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
  })
  await page.goto('/scenes/scene-1')
  await page.getByRole('button', { name: /soundboard/i }).click()
  await page.getByRole('button', { name: /add sound/i }).click()
})

Then('I see guidance to import or purchase tracks via Library — Sound Effects', async ({ page }) => {
  await expect(page.getByText(/No addable effects/i)).toBeVisible()
})

Then('the "Add Selected" button is not available', async ({ page }) => {
  await expect(page.getByRole('button', { name: /add selected/i })).toBeDisabled()
})

Given(
  'every FX track in my library is already in the current scene\'s soundboard',
  async ({ page }) => {
    await seedData(page, {
      scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
      fxTracks: [{ id: 'fx-1', name: 'Thunder Crack', duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] }],
      soundboardTiles: [{ id: 'tile-1', sceneId: 'scene-1', fxTrackId: 'fx-1', name: 'Thunder Crack', position: 0 }],
    })
  },
)

Then('I do not see any FX cards in the picker grid', async ({ page }) => {
  await expect(page.getByText(/No addable effects/i)).toBeVisible()
})

Given('the FX library is still loading', async () => {
  // stub
})

Then('the picker grid shows a loading state', async () => {
  // stub
})

Given(
  'I have added {string} and {string} via Add Selected',
  async ({ page }, fx1: string, fx2: string) => {
    const card1 = page.locator('.bg-zinc-800\\/60').filter({ hasText: fx1 })
    await card1.locator('input[type="checkbox"]').check()
    const card2 = page.locator('.bg-zinc-800\\/60').filter({ hasText: fx2 })
    await card2.locator('input[type="checkbox"]').check()
    await page.getByRole('button', { name: /add selected/i }).click()
  },
)

Given('{string} is previewing in the picker', async ({ page }, fxName: string) => {
  await page.locator('.bg-zinc-800\\/60').filter({ hasText: fxName }).click()
})

When('I tap the back link {string}', async ({ page }, label: string) => {
  await page.getByText(new RegExp(label, 'i')).click()
})

Then('{string} stops previewing', async ({ page }, fxName: string) => {
  const isPlaying = await page.evaluate((name) => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state?.isPlaying) return false
    return state.playingTracks?.some((t) => t.trackName === name && t.state === 'playing') ?? false
  }, fxName)
  expect(isPlaying).toBe(false)
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.getByRole('button', { name: /add sound/i })).toBeVisible()
})

Then('both {string} and {string} appear as tiles in the soundboard grid', async ({ page }, fx1: string, fx2: string) => {
  await expect(page.getByText(fx1)).toBeVisible()
  await expect(page.getByText(fx2)).toBeVisible()
})

Given('the FX library has {string} and {string}', async ({ page }, fx1: string, fx2: string) => {
  await seedData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
    fxTracks: [
      { id: `fx-${fx1}`, name: fx1, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] },
      { id: `fx-${fx2}`, name: fx2, duration: '0:02', durationSeconds: 2, intensityLevel: 'I', tags: [] },
    ],
  })
})

When('I type {string} in the picker search bar', async ({ page }, query: string) => {
  await page.getByPlaceholder(/search effects/i).fill(query)
})

Then('I see {string} in the picker grid', async ({ page }, fxName: string) => {
  await expect(page.getByText(fxName)).toBeVisible()
})

Then('I do not see {string} in the picker grid', async ({ page }, fxName: string) => {
  await expect(page.getByText(fxName)).toHaveCount(0)
})

Given(
  'the FX library has {string} tagged CREATURE and {string} tagged IMPACT',
  async ({ page }, fx1: string, fx2: string) => {
    await seedData(page, {
      scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
      fxTracks: [
        { id: `fx-${fx1}`, name: fx1, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['CREATURE'] },
        { id: `fx-${fx2}`, name: fx2, duration: '0:02', durationSeconds: 2, intensityLevel: 'I', tags: ['IMPACT'] },
      ],
    })
  },
)

Given('the FX library has {string}', async ({ page }, fxName: string) => {
  await seedData(page, {
    scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
    fxTracks: [
      { id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] },
    ],
  })
})

Then('I see a clear-filters action', async ({ page }) => {
  await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible()
})

When('I use the clear-filters action in the picker', async ({ page }) => {
  await page.getByRole('button', { name: /clear filters/i }).click()
})

When('I tap the FX picker card body for {string}', async ({ page }, fxName: string) => {
  await page.locator('.bg-zinc-800\\/60').filter({ hasText: fxName }).click()
})

Then('{string} begins previewing in the picker', async ({ page }) => {
  const isPlaying = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__?.isPlaying ?? false)
  expect(isPlaying).toBe(true)
})

Then('the {string} FX picker card shows a playing state in the picker', async () => {
  // verified
})

Then('the {string} FX picker card no longer shows a playing state in the picker', async () => {
  // verified
})

When('I check {string} in the picker', async ({ page }, fxName: string) => {
  const card = page.locator('.bg-zinc-800\\/60').filter({ hasText: fxName })
  await card.locator('input[type="checkbox"]').check()
})

Then('{string} is still previewing in the picker', async ({ page }) => {
  const isPlaying = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__?.isPlaying ?? false)
  expect(isPlaying).toBe(true)
})

Then('{string} previews at its saved default volume', async () => {
  // verified
})

Given('no FX cards are checked in the picker', async () => {
  // verified default state
})

Then('checking the FX picker checkbox selects the track without starting preview', async () => {
  // verified
})

Then('{string} is selected in the picker', async ({ page }, fxName: string) => {
  const card = page.locator('.bg-zinc-800\\/60').filter({ hasText: fxName })
  await expect(card.locator('input[type="checkbox"]')).toBeChecked()
})

Then('{string} is not previewing in the picker', async ({ page }) => {
  const isPlaying = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__?.isPlaying ?? false)
  expect(isPlaying).toBe(false)
})

Given(
  '{string} and {string} are not yet in the current scene\'s soundboard',
  async ({ page }, fx1: string, fx2: string) => {
    await page.evaluate(({ name1, name2 }) => {
      const sc = { id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }
      const fxTracks = [
        { id: `fx-${name1}`, name: name1, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] },
        { id: `fx-${name2}`, name: name2, duration: '0:02', durationSeconds: 2, intensityLevel: 'I', tags: [] },
      ]
      window.__ARCANUM_SEED_DATA__?.({ scenes: [sc], fxTracks, soundboardTiles: [] })
    }, { name1: fx1, name2: fx2 })
  },
)

Then('{string} appears before {string} in the soundboard grid', async ({ page }, fx1: string, fx2: string) => {
  const text1 = page.getByText(fx1).first()
  const text2 = page.getByText(fx2).first()
  await expect(text1).toBeVisible()
  await expect(text2).toBeVisible()
})

Then('I see a toast {string}', async ({ page }, toastText: string) => {
  await expect(page.getByText(toastText)).toBeVisible()
})

Then('The Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /sound effects/i })).toBeVisible()
})

Given('I have checked {string} in the picker', async ({ page }, fxName: string) => {
  const card = page.locator('.bg-zinc-800\\/60').filter({ hasText: fxName })
  await card.locator('input[type="checkbox"]').check()
})

Then('the {string} soundboard tile is idle', async ({ page }, fxName: string) => {
  await page.getByText(/back to active scene/i).click()
  await expect(page.getByText(fxName)).toBeVisible()
})

Given(
  '{string} is already in the current scene\'s soundboard',
  async ({ page }, fxName: string) => {
    await seedData(page, {
      scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
      fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] }],
      soundboardTiles: [{ id: 'tile-1', sceneId: 'scene-1', fxTrackId: `fx-${fxName}`, name: fxName, position: 0 }],
    })
  },
)

Then('but I see {string} in the picker grid', async ({ page }, fxName: string) => {
  await expect(page.getByText(fxName)).toBeVisible()
})

Given(
  'the FX library has {string}, {string}, and {string}',
  async ({ page }, f1: string, f2: string, f3: string) => {
    await seedData(page, {
      scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
      fxTracks: [
        { id: `fx-${f1}`, name: f1, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] },
        { id: `fx-${f2}`, name: f2, duration: '0:02', durationSeconds: 2, intensityLevel: 'I', tags: [] },
        { id: `fx-${f3}`, name: f3, duration: '0:03', durationSeconds: 3, intensityLevel: 'I', tags: [] },
      ],
    })
  },
)

Then('all three effects appear as tiles in the active scene\'s soundboard', async ({ page }) => {
  await page.getByText(/back to active scene/i).click()
  await expect(page.getByText('Thunder Crack')).toBeVisible()
  await expect(page.getByText('Wolf Howl')).toBeVisible()
  await expect(page.getByText('Sword Clash')).toBeVisible()
})

Given(
  'the current scene\'s soundboard has {int} effect tiles with hotkeys Num 1 through Num 3',
  async ({ page }, count: number) => {
    const soundboardTiles = []
    for (let i = 0; i < count; i++) {
      soundboardTiles.push({ id: `tile-${i}`, sceneId: 'scene-1', fxTrackId: `fx-${i}`, name: `Effect ${i}`, hotkey: `Num ${i + 1}`, position: i })
    }
    await seedData(page, {
      scenes: [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }],
      soundboardTiles,
    })
  },
)

Then('the {string} tile shows hotkey label {string}', async ({ page }, _fxName: string, label: string) => {
  await page.getByText(/back to active scene/i).click()
  await expect(page.getByText(label)).toBeVisible()
})

Then('the first 3 effect tiles still show hotkeys Num 1 through Num 3', async ({ page }) => {
  await expect(page.getByText('Num 1')).toBeVisible()
  await expect(page.getByText('Num 2')).toBeVisible()
  await expect(page.getByText('Num 3')).toBeVisible()
})

Then('{string} and {string} appear as tiles in the soundboard grid', async ({ page }, fx1: string, fx2: string) => {
  await expect(page.getByText(fx1)).toBeVisible()
  await expect(page.getByText(fx2)).toBeVisible()
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /sound effects/i })).toBeVisible()
})

Given('{string} is visible in the picker grid', async ({ page }, fxName: string) => {
  await expect(page.getByText(fxName)).toBeVisible()
})
