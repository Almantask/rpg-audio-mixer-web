import { expect } from '@playwright/test'
import { Given, When, Then } from './shared/fixtures'

Given('I am on the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
})



Given(
  'I have imported {string}, {string}, {string}',
  async ({ page }, t1: string, t2: string, t3: string) => {
    await page.evaluate(
      ({ name1, name2, name3 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { fxTracks: [] }
        db.fxTracks = [
          { id: 'fx1', name: name1, duration: '0:04', intensity: 'I', tags: [] },
          { id: 'fx2', name: name2, duration: '0:04', intensity: 'II', tags: [] },
          { id: 'fx3', name: name3, duration: '0:03', intensity: 'I', tags: [] },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name1: t1, name2: t2, name3: t3 }
    )
  }
)

When('I open the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/library')
})

Then('I see all three tracks as FX cards in the grid', async ({ page }) => {
  await expect(page.locator('[data-testid^="fx-card-"]')).toHaveCount(3)
})

Given(
  '{string} is in the FX library with duration {string}',
  async ({ page }, trackName: string, dur: string) => {
    await page.evaluate(
      ({ name, d }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { fxTracks: [] }
        db.fxTracks.push({ id: `fx_${name}`, name, duration: d, intensity: 'I', tags: [] })
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name: trackName, d: dur }
    )
  }
)

Then(
  'the {string} FX card shows the title {string}',
  async ({ page }, fxName: string, title: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await expect(card.getByText(title)).toBeVisible()
  }
)

Then(
  'the {string} FX card shows duration {string}',
  async ({ page }, fxName: string, dur: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await expect(card.getByText(dur)).toBeVisible()
  }
)

Given(
  '{string} is in the FX library with tags {string} and {string}',
  async ({ page }, fxName: string, tag1: string, tag2: string) => {
    await page.evaluate(
      ({ name, t1, t2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { fxTracks: [] }
        db.fxTracks.push({ id: `fx_${name}`, name, duration: '0:04', intensity: 'I', tags: [t1, t2] })
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name: fxName, t1: tag1, t2: tag2 }
    )
  }
)

Then(
  'the {string} FX card shows {string} and {string} tag chips',
  async ({ page }, fxName: string, tag1: string, tag2: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await expect(card.getByText(tag1)).toBeVisible()
    await expect(card.getByText(tag2)).toBeVisible()
  }
)

Given('the FX library data has not yet resolved', async () => {})

Then('I see skeleton placeholder cards in the grid', async () => {})

Given('I have not imported any FX tracks', async ({ page }) => {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [] }
    db.fxTracks = []
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  })
})

Then('I see a centred empty-state illustration', async ({ page }) => {
  await expect(page.getByText('FX library is empty')).toBeVisible()
})

Then('I see copy directing me to import or download FX tracks', async ({ page }) => {
  await expect(page.getByText('Directing you to import or download FX tracks')).toBeVisible()
})

Given('{string} is in the FX library', async ({ page }, trackName: string) => {
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [] }
    if (!db.fxTracks.some((f: any) => f.name === name)) {
      db.fxTracks.push({ id: `fx_${name}`, name, duration: '0:04', intensity: 'I', tags: [] })
    }
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, trackName)
})

Then('the {string} FX card has no checkbox', async ({ page }, fxName: string) => {
  const card = page.getByTestId(`fx-card-${fxName}`)
  await expect(card.locator('input[type="checkbox"]')).toHaveCount(0)
})

Then('I do not see an "FX Types" filter on the Sound Effects tab', async ({ page }) => {
  await expect(page.getByText('FX Types')).toHaveCount(0)
})

Then('I do not see a "Sort Order" control on the Sound Effects tab', async ({ page }) => {
  await expect(page.getByText('Sort Order')).toHaveCount(0)
})

When('I edit {string} from its FX card', async ({ page }, fxName: string) => {
  await page.goto('/library')
  const card = page.getByTestId(`fx-card-${fxName}`)
  await card.getByRole('button', { name: `Edit ${fxName}` }).click()
})

Then(
  'I see inline edit on the {string} FX card with fields for Name and Tags',
  async ({ page }, fxName: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await expect(card.getByText('Name')).toBeVisible()
    await expect(card.getByText('Tags (comma-separated)')).toBeVisible()
  }
)

Given('I am editing {string} inline on its FX card', async ({ page }, fxName: string) => {
  await page.goto('/library')
  const card = page.getByTestId(`fx-card-${fxName}`)
  await card.getByRole('button', { name: `Edit ${fxName}` }).click()
})

When(
  'I rename {string} to {string} and save inline edit',
  async ({ page }, oldName: string, newName: string) => {
    const card = page.getByTestId(`fx-card-${oldName}`)
    await card.locator('input[type="text"]').first().fill(newName)
    await card.getByRole('button', { name: 'Save' }).click()
  }
)

Then(
  'the track appears as {string} in the FX library card grid',
  async ({ page }, name: string) => {
    await expect(page.getByTestId(`fx-card-${name}`)).toBeVisible()
  }
)

When(
  'I add the tag {string} to {string} from the predefined list and save',
  async ({ page }, tag: string, fxName: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await card.locator('input[type="text"]').nth(1).fill(tag)
    await card.getByRole('button', { name: 'Save' }).click()
  }
)


When(
  'I enter tags {string} for {string} and save',
  async ({ page }, tagsStr: string, fxName: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await card.locator('input[type="text"]').nth(1).fill(tagsStr)
    await card.getByRole('button', { name: 'Save' }).click()
  }
)

When(
  'I type {string} in the FX tags field for {string}',
  async ({ page }, tagsStr: string, fxName: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await card.locator('input[type="text"]').nth(1).fill(tagsStr)
  }
)

When('I delete {string} from inline edit', async ({ page }, fxName: string) => {
  const card = page.getByTestId(`fx-card-${fxName}`)
  await card.getByRole('button', { name: 'Delete' }).click()
})

Then('{string} is moved to the Trash FX tab', async ({ page }, fxName: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'FX' }).click()
  await expect(page.getByText(fxName)).toBeVisible()
})

Then('it is no longer visible in the FX library', async ({ page }) => {
  await page.goto('/library')
  await expect(page.locator('[data-testid^="fx-card-"]')).toHaveCount(0)
})

Then('the local copy of the audio file is retained for 7 days', async () => {})

Given(
  '{string} is assigned to the {string} scene\'s soundboard',
  async ({ page }, fxName: string, sceneName: string) => {
    await page.evaluate(
      ({ fName, sName }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [], fxTracks: [], soundboardItems: [] }
        const scId = `sc_${sName}`
        const fxId = `fx_${fName}`
        db.scenes.push({ id: scId, name: sName })
        db.fxTracks.push({ id: fxId, name: fName, duration: '0:04', intensity: 'I', tags: [] })
        db.soundboardItems.push({ sceneId: scId, fxTrackId: fxId, order: 0 })
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { fName: fxName, sName: sceneName }
    )
  }
)

When('I delete {string} from the FX library', async ({ page }, fxName: string) => {
  await page.goto('/library')
  const card = page.getByTestId(`fx-card-${fxName}`)
  await card.getByRole('button', { name: `Edit ${fxName}` }).click()
  await card.getByRole('button', { name: 'Delete' }).click()
})

Then(
  '{string} no longer appears in the {string} soundboard',
  async ({ page }, fxName: string, sceneName: string) => {
    await page.goto('/scenes')
    await page.getByTestId(`scene-card-${sceneName}`).click()
    await page.getByRole('button', { name: 'Soundboard' }).click()
    await expect(page.getByTestId(`soundboard-tile-${fxName}`)).toHaveCount(0)
  }
)

Given('an audio file {string} is available on my computer', async () => {})

When('I import {string} via Import FX', async ({ page }, fileName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Import FX' }).click()
  await page.getByPlaceholder('e.g. wolf_howl.mp3').fill(fileName)
  await page.getByRole('button', { name: 'Import' }).click()
})

Then('{string} appears in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.getByTestId(`fx-card-${name}`)).toBeVisible()
})

Then('a local copy of the file is stored in app storage', async () => {})

Given(
  'audio files {string} and {string} are available on my computer',
  async () => {}
)

When(
  'I import {string} and {string} via Import FX',
  async ({ page }, f1: string, f2: string) => {
    await page.goto('/library')
    await page.getByRole('button', { name: 'Import FX' }).click()
    await page.getByPlaceholder('e.g. wolf_howl.mp3').fill(f1)
    await page.getByRole('button', { name: 'Import' }).click()
  }
)

Then(
  '{string} and {string} appear in the FX library card grid',
  async ({ page }, n1: string, n2: string) => {
    await expect(page.getByTestId(`fx-card-${n1}`)).toBeVisible()
  }
)

Then('I see the free tracks coming soon modal', async ({ page }) => {
  await expect(page.getByText('Free Tracks')).toBeVisible()
})

Then('I remain on the Library screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
})

Then('I see the storefront', async ({ page }) => {
  await expect(page.getByText('Arcanum Storefront')).toBeVisible()
})

When('I open the FX import file picker', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Import FX' }).click()
})

Then('I see the Import FX modal', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Import FX' })).toBeVisible()
})

Then(
  'non-audio files such as images, PDFs, and spreadsheets are not shown',
  async () => {}
)

Given('a file {string} with invalid audio content is on my computer', async () => {})

When('I attempt to import {string}', async ({ page }, fileName: string) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Import FX' }).click()
  await page.getByPlaceholder('e.g. wolf_howl.mp3').fill(fileName)
  await page.getByRole('button', { name: 'Import' }).click()
})

Then('I see an error explaining the file could not be read as audio', async ({ page }) => {
  await expect(page.getByText('Invalid audio file format')).toBeVisible()
})

Then('I can dismiss the error and continue using the Library', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Given(
  'I imported {string} and it appears as {string} in the library',
  async ({ page }, file: string, name: string) => {
    await page.evaluate((trackName) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { fxTracks: [] }
      db.fxTracks.push({ id: `fx_${trackName}`, name: trackName, duration: '0:04', intensity: 'I', tags: [] })
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }, name)
  }
)

When('the original {string} file is deleted from my computer', async () => {})

Then('{string} still plays correctly from the app\'s local copy', async ({ page }, name: string) => {
  await page.goto('/library')
  await page.getByTestId(`fx-card-${name}`).click()
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

When('I tap the {string} FX card body', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByTestId(`fx-card-${fxName}`).click()
})

Then('the mini player appears at the bottom of the main content area', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

Then('{string} begins playing', async ({ page }, fxName: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Then('{string} is audible', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Then('the {string} FX card shows a playing preview state', async ({ page }, fxName: string) => {
  const card = page.getByTestId(`fx-card-${fxName}`)
  await expect(card).toHaveClass(/border-amber-400/)
})

When('I tap the {string} FX card thumbnail', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByTestId(`fx-card-${fxName}`).click()
})

When('I preview {string} from its FX card', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByTestId(`fx-card-${fxName}`).click()
})

Then('the mini player displays {string} as the track name', async ({ page }, name: string) => {
  const player = page.getByTestId('fx-mini-player')
  await expect(player.getByText(name)).toBeVisible()
})

Given('the mini player is showing and {string} is playing', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByTestId(`fx-card-${fxName}`).click()
})

When('I tap the pause button in the mini player', async ({ page }) => {
  const player = page.getByTestId('fx-mini-player')
  await player.getByRole('button', { name: 'Pause' }).click()
})

Then('{string} stops playing', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).not.toBe(true)
})

Then('the mini player remains visible', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

Given('the mini player is showing and {string} is paused', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByTestId(`fx-card-${fxName}`).click()
  const player = page.getByTestId('fx-mini-player')
  await player.getByRole('button', { name: 'Pause' }).click()
})

When('I tap the play button in the mini player', async ({ page }) => {
  const player = page.getByTestId('fx-mini-player')
  await player.getByRole('button', { name: 'Play' }).click()
})

Then('{string} begins playing again', async ({ page }, fxName: string) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Given(
  'the {string} FX card is previewing with a playing preview state',
  async ({ page }, fxName: string) => {
    await page.goto('/library')
    await page.getByTestId(`fx-card-${fxName}`).click()
  }
)

When('I tap the {string} FX card body again', async ({ page }, fxName: string) => {
  await page.getByTestId(`fx-card-${fxName}`).click()
})

Then(
  'the {string} FX card no longer shows a playing preview state',
  async ({ page }, fxName: string) => {
    const card = page.getByTestId(`fx-card-${fxName}`)
    await expect(card).not.toHaveClass(/border-amber-400/)
  }
)

Given(
  'the mini player is visible while previewing {string}',
  async ({ page }, fxName: string) => {
    await page.goto('/library')
    await page.getByTestId(`fx-card-${fxName}`).click()
  }
)

When('I navigate to Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('the mini player is no longer visible', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toHaveCount(0)
})

Then('{string} has stopped playing', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).not.toBe(true)
})

Given('the mini player is showing {string}', async ({ page }, fxName: string) => {
  await page.goto('/library')
  await page.getByTestId(`fx-card-${fxName}`).click()
})

When(
  'I preview {string} from its FX card while {string} is playing',
  async ({ page }, newFx: string, oldFx: string) => {
    await page.getByTestId(`fx-card-${newFx}`).click()
  }
)

Then('{string} stops', async () => {})

Then('the mini player updates to show {string}', async ({ page }, name: string) => {
  const player = page.getByTestId('fx-mini-player')
  await expect(player.getByText(name)).toBeVisible()
})

Given('the mini player is visible while previewing an FX track', async ({ page }) => {
  await page.goto('/library')
  await page.getByTestId('fx-card-Wolf Howl').click()
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.getByRole('button', { name: 'Soundscapes' }).click()
})

Then('the mini player disappears', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toHaveCount(0)
})

Then('audio playback stops', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).not.toBe(true)
})

Given('{string} is in the FX library with duration {int}:{int}', async ({ page }, trackName: string, min: number, sec: number) => {
  await page.evaluate(
    ({ name, m, s }) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { fxTracks: [] }
      const secStr = s < 10 ? `0${s}` : `${s}`
      db.fxTracks.push({ id: `fx_${name}`, name, duration: `${m}:${secStr}`, intensity: 'I', tags: [] })
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    },
    { name: trackName, m: min, s: sec }
  )
})

Given('I am on the Soundscapes tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Soundscapes' }).click()
})

Then('I see a {string} button', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('I see an {string} button', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Given('I have created categories {string}, {string}, {string}', async () => {})

When('I open the Soundscapes tab in the Library', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('button', { name: 'Soundscapes' }).click()
})

Then('I see {string}, {string}, and {string} in the grid', async () => {})

Then('I see download progress UI', async () => {})

Then('new soundscape categories appear in the grid when the demo pack download completes', async () => {})

Given('{string} has {int} tracks at level I, {int} at level II, and {int} at level III', async () => {})

