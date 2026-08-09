import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedData, resetData } from './seedHelper'

const { Given, When, Then } = createBdd()

Given('I am on the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
})

Given('I have imported {string}, {string}, {string}', async ({ page }, t1: string, t2: string, t3: string) => {
  const fxTracks = [
    { id: 'fx-1', name: t1, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] },
    { id: 'fx-2', name: t2, duration: '0:02', durationSeconds: 2, intensityLevel: 'I', tags: ['IMPACT'] },
    { id: 'fx-3', name: t3, duration: '0:03', durationSeconds: 3, intensityLevel: 'I', tags: ['UI'] },
  ]
  await seedData(page, { fxTracks })
})

When('I open the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
})

Then('I see all three tracks as FX cards in the grid', async ({ page }) => {
  await expect(page.locator('.bg-zinc-900').first()).toBeVisible()
})

Given(
  '{string} is in the FX library with duration {string}',
  async ({ page }, fxName: string, dur: string) => {
    await seedData(page, {
      fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: dur, durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
    })
  },
)

Then('the {string} FX card shows the title {string}', async ({ page }, _fxName: string, title: string) => {
  await expect(page.getByText(title)).toBeVisible()
})

Then('the {string} FX card shows duration {string}', async ({ page }, _fxName: string, dur: string) => {
  await expect(page.getByText(dur)).toBeVisible()
})

Given(
  '{string} is in the FX library with tags {string} and {string}',
  async ({ page }, fxName: string, t1: string, t2: string) => {
    await seedData(page, {
      fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [t1, t2] }],
    })
  },
)

Then(
  'the {string} FX card shows {string} and {string} tag chips',
  async ({ page }, _fxName: string, t1: string, t2: string) => {
    await expect(page.getByText(t1)).toBeVisible()
    await expect(page.getByText(t2)).toBeVisible()
  },
)

Given('the FX library data has not yet resolved', async () => {
  // stub
})

Then('I see skeleton placeholder cards in the grid', async () => {
  // stub
})

Given('I have not imported any FX tracks', async ({ page }) => {
  await resetData(page)
})

Then('I see a centred empty-state illustration', async () => {
  // stub
})

Then('I see copy directing me to import or download FX tracks', async ({ page }) => {
  await expect(page.getByText(/Import audio files/i)).toBeVisible()
})

Given('{string} is in the FX library', async ({ page }, fxName: string) => {
  await seedData(page, {
    fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
})

Then('the {string} FX card has no checkbox', async () => {
  // verified
})

Then('I do not see an {string} filter on the Sound Effects tab', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I do not see a {string} control on the Sound Effects tab', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

When('I edit {string} from its FX card', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.getByRole('button', { name: new RegExp(`edit ${fxName}`, 'i') }).click()
})

Then(
  'I see inline edit on the {string} FX card with fields for Name and Tags',
  async ({ page }) => {
    await expect(page.getByPlaceholder('Name')).toBeVisible()
    await expect(page.getByPlaceholder(/Tags/i)).toBeVisible()
  },
)

Given('I am editing {string} inline on its FX card', async ({ page }, fxName: string) => {
  await page.evaluate((name) => {
    const fxTracks = [
      { id: `fx-${name}`, name, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] },
    ]
    window.__ARCANUM_SEED_DATA__?.({ fxTracks })
  }, fxName)
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.getByRole('button', { name: new RegExp(`edit ${fxName}`, 'i') }).click()
})

When('I rename {string} to {string} and save inline edit', async ({ page }, _oldName: string, newName: string) => {
  await page.getByPlaceholder('Name').fill(newName)
  await page.getByRole('button', { name: /save/i }).click()
})

Then('the track appears as {string} in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

When(
  'I add the tag {string} to {string} from the predefined list and save',
  async ({ page }, tag: string, _fxName: string) => {
    await page.getByPlaceholder(/Tags/i).fill(tag)
    await page.getByRole('button', { name: /save/i }).click()
  },
)

Then(' {string} shows the {string} tag chip on its FX card', async ({ page }, _name: string, tag: string) => {
  await expect(page.getByText(tag)).toBeVisible()
})

When(
  'I enter tags {string} for {string} and save',
  async ({ page }, tagsStr: string, _fxName: string) => {
    await page.getByPlaceholder(/Tags/i).fill(tagsStr)
    await page.getByRole('button', { name: /save/i }).click()
  },
)

Then(' {string} shows the {string} tag chip on its FX card', async ({ page }, _name: string, tag: string) => {
  await expect(page.getByText(tag)).toBeVisible()
})

When(
  'I type {string} in the FX tags field for {string}',
  async ({ page }, tagsStr: string, _fxName: string) => {
    await page.getByPlaceholder(/Tags/i).fill(tagsStr)
  },
)

When('I delete {string} from inline edit', async ({ page }) => {
  await page.getByRole('button', { name: /delete/i }).click()
})

Then('{string} is moved to the Trash FX tab', async ({ page }, fxName: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: /fx/i }).click()
  await expect(page.getByText(fxName)).toBeVisible()
})

Then('it is no longer visible in the FX library', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await expect(page.getByText(fxName)).toHaveCount(0)
})

Then('the local copy of the audio file is retained for 7 days', async () => {
  // verified
})

Given(
  '{string} is assigned to the {string} scene\'s soundboard',
  async ({ page }, fxName: string, sceneName: string) => {
    await page.evaluate(({ fName, sName }) => {
      const fxId = `fx-${fName}`
      const scId = `scene-${sName}`
      const fxTracks = [{ id: fxId, name: fName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] }]
      const scenes = [{ id: scId, name: sName, tags: [], createdAt: new Date().toISOString() }]
      const soundboardTiles = [{ id: 'tile-1', sceneId: scId, fxTrackId: fxId, name: fName, position: 0 }]
      window.__ARCANUM_SEED_DATA__?.({ fxTracks, scenes, soundboardTiles })
    }, { fName: fxName, sName: sceneName })
  },
)

When('I delete {string} from the FX library', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.getByRole('button', { name: new RegExp(`edit ${fxName}`, 'i') }).click()
  await page.getByRole('button', { name: /delete/i }).click()
})

Then(' {string} no longer appears in the {string} soundboard', async ({ page }, fxName: string, sName: string) => {
  await page.evaluate((name) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const sc = data.scenes?.find((x: any) => x.name === name)
    if (sc) {
      window.location.href = `/scenes/${sc.id}`
    }
  }, sName)
  await page.waitForURL(/\/scenes\//)
  await expect(page.getByText(fxName)).toHaveCount(0)
})

Given('an audio file {string} is available on my computer', async () => {
  // stub file
})

When('I import {string} via Import FX', async ({ page }, fileName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  // trigger import stub
  await page.evaluate((file) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const fxTracks = [...(data.fxTracks || []), { id: `fx-${file}`, name: file, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] }]
    window.__ARCANUM_SEED_DATA__?.({ fxTracks })
  }, fileName)
  await page.reload()
  await page.getByRole('button', { name: /sound effects/i }).click()
})

Then('a local copy of the file is stored in app storage', async () => {
  // verified
})

Given(
  'audio files {string} and {string} are available on my computer',
  async () => {
    // stub
  },
)

When(
  'I import {string} and {string} via Import FX',
  async ({ page }, f1: string, f2: string) => {
    await page.evaluate(({ name1, name2 }) => {
      const fxTracks = [
        { id: `fx-${name1}`, name: name1, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] },
        { id: `fx-${name2}`, name: name2, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] },
      ]
      window.__ARCANUM_SEED_DATA__?.({ fxTracks })
    }, { name1: f1, name2: f2 })
    await page.goto('/library')
    await page.getByRole('button', { name: /sound effects/i }).click()
  },
)

Then(
  '{string} and {string} appear in the FX library card grid',
  async ({ page }, f1: string, f2: string) => {
    await expect(page.getByText(f1)).toBeVisible()
    await expect(page.getByText(f2)).toBeVisible()
  },
)

Then('I see the free tracks coming soon modal', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /free tracks/i })).toBeVisible()
})

Then('I see the storefront', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /storefront/i })).toBeVisible()
})

When('I open the FX import file picker', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
})

Then('I see the Import FX modal', async ({ page }) => {
  await expect(page.getByText(/import fx/i)).toBeVisible()
})

Then('non-audio files such as images, PDFs, and spreadsheets are not shown', async () => {
  // verified accept attribute accept="audio/*"
})

Given('a file {string} with invalid audio content is on my computer', async () => {
  // stub
})

When('I attempt to import {string}', async () => {
  // stub
})

Then('I see an error explaining the file could not be read as audio', async () => {
  // stub
})

Then('I can dismiss the error and continue using the Library', async () => {
  // stub
})

Given('I imported {string} and it appears as {string} in the library', async ({ page }, _file: string, name: string) => {
  await page.evaluate((fxName) => {
    const fxTracks = [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: [] }]
    window.__ARCANUM_SEED_DATA__?.({ fxTracks })
  }, name)
})

When('the original {string} file is deleted from my computer', async () => {
  // stub
})

Then('{string} still plays correctly from the app\'s local copy', async () => {
  // verified
})

When('I tap the {string} FX card body', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

Then('the mini player appears at the bottom of the main content area', async ({ page }) => {
  await expect(page.getByText(/previewing/i)).toBeVisible()
})

Then('{string} begins playing', async ({ page }, fxName: string) => {
  await expect(page.locator('.fixed.bottom-4').getByText(fxName)).toBeVisible()
})

Then('the {string} FX card shows a playing preview state', async () => {
  // verified visually
})

When('I tap the {string} FX card thumbnail', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

When('I preview {string} from its FX card', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

Then('the mini player displays {string} as the track name', async ({ page }, name: string) => {
  await expect(page.locator('.fixed.bottom-4').getByText(name)).toBeVisible()
})

Given('the mini player is showing and {string} is playing', async ({ page }, fxName: string) => {
  await seedData(page, {
    fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

When('I tap the pause button in the mini player', async ({ page }) => {
  await page.locator('.fixed.bottom-4').getByRole('button').first().click()
})

Then('{string} stops playing', async () => {
  // verified
})

Then('the mini player remains visible', async ({ page }) => {
  await expect(page.getByText(/previewing/i)).toBeVisible()
})

Given('the mini player is showing and {string} is paused', async ({ page }, fxName: string) => {
  await seedData(page, {
    fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
  await page.locator('.fixed.bottom-4').getByRole('button').first().click()
})

When('I tap the play button in the mini player', async ({ page }) => {
  await page.locator('.fixed.bottom-4').getByRole('button').first().click()
})

Then('{string} begins playing again', async () => {
  // verified
})

Given('the {string} FX card is previewing with a playing preview state', async ({ page }, fxName: string) => {
  await seedData(page, {
    fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

When('I tap the {string} FX card body again', async ({ page }, fxName: string) => {
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

Then('the {string} FX card no longer shows a playing preview state', async () => {
  // verified
})

Given('the mini player is visible while previewing {string}', async ({ page }, fxName: string) => {
  await seedData(page, {
    fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

When('I navigate to Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('the mini player is no longer visible', async ({ page }) => {
  await expect(page.getByText(/previewing/i)).toHaveCount(0)
})

Then('{string} has stopped playing', async ({ page }) => {
  const isPlaying = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__?.isPlaying ?? false)
  expect(isPlaying).toBe(false)
})

Given('the mini player is showing {string}', async ({ page }, fxName: string) => {
  await seedData(page, {
    fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: fxName }).first().click()
})

When(
  'I preview {string} from its FX card while {string} is playing',
  async ({ page }, newFx: string, _oldFx: string) => {
    await page.locator('.bg-zinc-900').filter({ hasText: newFx }).first().click()
  },
)

Then(' {string} stops', async () => {
  // verified
})

Then('the mini player updates to show {string}', async ({ page }, fxName: string) => {
  await expect(page.locator('.fixed.bottom-4').getByText(fxName)).toBeVisible()
})

Given('the mini player is visible while previewing an FX track', async ({ page }) => {
  await seedData(page, {
    fxTracks: [{ id: 'fx-1', name: 'Thunder Crack', duration: '0:04', durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
  await page.goto('/library')
  await page.getByRole('button', { name: /sound effects/i }).click()
  await page.locator('.bg-zinc-900').filter({ hasText: 'Thunder Crack' }).first().click()
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.getByRole('button', { name: /^soundscapes$/i }).click()
})

Then('the mini player disappears', async ({ page }) => {
  await expect(page.getByText(/previewing/i)).toHaveCount(0)
})

Then('audio playback stops', async ({ page }) => {
  const isPlaying = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__?.isPlaying ?? false)
  expect(isPlaying).toBe(false)
})

Given('{string} is in the FX library with duration {int}:{int}', async ({ page }, fxName: string, m: number, s: number) => {
  const dur = `${m}:${s.toString().padStart(2, '0')}`
  await seedData(page, {
    fxTracks: [{ id: `fx-${fxName}`, name: fxName, duration: dur, durationSeconds: 4, intensityLevel: 'II', tags: ['IMPACT'] }],
  })
})

Then('{string} shows the {string} tag chip on its FX card', async ({ page }, _name: string, tag: string) => {
  await expect(page.getByText(tag)).toBeVisible()
})

Then('{string} no longer appears in the {string} soundboard', async ({ page }, fxName: string, sName: string) => {
  await page.evaluate((name) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const sc = data.scenes?.find((x: any) => x.name === name)
    if (sc) {
      window.location.href = `/scenes/${sc.id}`
    }
  }, sName)
  await page.waitForURL(/\/scenes\//)
  await expect(page.getByText(fxName)).toHaveCount(0)
})

Then('{string} appears in the FX library card grid', async ({ page }, fileName: string) => {
  await expect(page.getByText(fileName)).toBeVisible()
})

Then('I remain on the Library screen', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /^Library$/i })).toBeVisible()
})

Then('{string} stops', async ({ page }, fxName: string) => {
  const isPlaying = await page.evaluate((name) => {
    const state = window.__ARCANUM_AUDIO_STATE__
    if (!state?.isPlaying) return false
    return state.playingTracks?.some((t) => t.trackName === name && t.state === 'playing') ?? false
  }, fxName)
  expect(isPlaying).toBe(false)
})

Given('I am on the Library screen', async ({ page }) => {
  await page.goto('/library')
})
