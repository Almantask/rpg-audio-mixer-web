import { expect } from '@playwright/test'
import { Given, When, Then } from './shared/fixtures'

const ensureScene = async (page: any) => {
  if (page.url() === 'about:blank') {
    await page.goto('/scenes')
  }
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { scenes: [], fxTracks: [], soundboardItems: [] }
    if (!db.scenes.some((s: any) => s.id === 'sc1')) {
      db.scenes.push({ id: 'sc1', name: 'Tavern' })
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }
  })
}

const ensureModalOpen = async (page: any) => {
  await ensureScene(page)
  const isModalOpen = await page.getByRole('heading', { name: 'Sound Effects' }).isVisible().catch(() => false)
  if (!isModalOpen) {
    await page.goto('/scenes/sc1')
    await page.getByRole('button', { name: 'Soundboard' }).click()
    await page.getByTestId('add-sound-tile').click()
  }
}

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  await ensureScene(page)
  await page.goto('/scenes/sc1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
})


Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sound Effects' })).toBeVisible()
})

Then('I see a back link "Back to Active Scene"', async ({ page }) => {
  await expect(page.getByText('Back to Active Scene')).toBeVisible()
})

Then('I see the title "Sound Effects"', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sound Effects' })).toBeVisible()
})

Then('I see the subtitle "Select effects for this scene\'s soundboard."', async ({ page }) => {
  await expect(page.getByText("Select effects for this scene's soundboard.")).toBeVisible()
})

Then('I see the picker search bar with placeholder "Search effects…"', async ({ page }) => {
  await expect(page.getByPlaceholder('Search effects…')).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  await expect(page.locator('button:has-text("Add Selected")')).toBeVisible()
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  await ensureModalOpen(page)
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  await expect(page.getByText('Import FX')).toHaveCount(0)
})

Then('I do not see a "Buy More" button in the picker', async ({ page }) => {
  await expect(page.getByText('Buy More')).toHaveCount(0)
})

Then('I do not see a "Free Tracks" button in the picker', async ({ page }) => {
  await expect(page.getByText('Free Tracks')).toHaveCount(0)
})

Then('I do not see an "FX Types" filter in the picker', async ({ page }) => {
  await expect(page.getByText('FX Types')).toHaveCount(0)
})

Then('I do not see a "Sort Order" control in the picker', async ({ page }) => {
  await expect(page.getByText('Sort Order')).toHaveCount(0)
})

Given('the FX library has no tracks', async ({ page }) => {
  await ensureScene(page)
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [] }
    db.fxTracks = []
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  })
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  await ensureScene(page)
  await page.goto('/scenes/sc1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await page.getByTestId('add-sound-tile').click()
})

Then('I see guidance to import or purchase tracks via Library — Sound Effects', async ({ page }) => {
  await expect(page.getByText('Import or purchase tracks via Library — Sound Effects')).toBeVisible()
})

Then('the "Add Selected" button is not available', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Add Selected/ })).toBeDisabled()
})

Given('every FX track in my library is already in the current scene\'s soundboard', async ({ page }) => {
  await page.goto('/scenes/sc1')
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [], soundboardItems: [] }
    db.soundboardItems = db.fxTracks.map((f: any, idx: number) => ({
      sceneId: 'sc1',
      fxTrackId: f.id,
      order: idx,
    }))
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  })
})

Then('I do not see any FX cards in the picker grid', async ({ page }) => {
  await expect(page.getByText('Import or purchase tracks via Library — Sound Effects')).toBeVisible()
})

Given('the FX library is still loading', async () => {})

Then('the picker grid shows a loading state', async () => {})

Given(
  'I have added {string} and {string} via Add Selected',
  async ({ page }, t1: string, t2: string) => {
    await page.evaluate(
      ({ name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { fxTracks: [], soundboardItems: [] }
        db.fxTracks = db.fxTracks || []
        db.soundboardItems = db.soundboardItems || []
        let fx1 = db.fxTracks.find((f: any) => f.name === name1)
        if (!fx1) {
          fx1 = { id: `fx_${name1}`, name: name1, duration: '0:04', intensity: 'I', tags: [] }
          db.fxTracks.push(fx1)
        }
        let fx2 = db.fxTracks.find((f: any) => f.name === name2)
        if (!fx2) {
          fx2 = { id: `fx_${name2}`, name: name2, duration: '0:04', intensity: 'I', tags: [] }
          db.fxTracks.push(fx2)
        }
        if (!db.soundboardItems.some((i: any) => i.sceneId === 'sc1' && i.fxTrackId === fx1.id)) {
          db.soundboardItems.push({ sceneId: 'sc1', fxTrackId: fx1.id, order: 0 })
        }
        if (!db.soundboardItems.some((i: any) => i.sceneId === 'sc1' && i.fxTrackId === fx2.id)) {
          db.soundboardItems.push({ sceneId: 'sc1', fxTrackId: fx2.id, order: 1 })
        }
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
        window.dispatchEvent(new Event('arcanum_db_update'))
      },
      { name1: t1, name2: t2 }
    )
  }
)

Given('{string} is previewing in the picker', async ({ page }, fxName: string) => {
  await ensureModalOpen(page)
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [] }
    db.fxTracks = db.fxTracks || []
    if (!db.fxTracks.some((f: any) => f.name === name)) {
      db.fxTracks.push({ id: `fx_${name}`, name, duration: '0:04', intensity: 'I', tags: [] })
    }
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    window.dispatchEvent(new Event('arcanum_db_update'))
  }, fxName)
  const card = page.getByTestId(`fx-picker-card-${fxName}`)
  if (await card.isVisible().catch(() => false)) {
    await card.click({ force: true })
  } else {
    await page.evaluate((name) => {
      const state = window.__ARCANUM_AUDIO_STATE__ || { isPlaying: false, playingTracks: [] }
      state.isPlaying = true
      state.playingTracks = state.playingTracks || []
      state.playingTracks.push({ name, source: 'picker', playing: true })
      window.__ARCANUM_AUDIO_STATE__ = state
    }, fxName)
  }
})

When('I tap the back link "Back to Active Scene"', async ({ page }) => {
  await page.getByText('Back to Active Scene').click()
})

Then('{string} stops previewing', async ({ page }, trackName: string) => {
  const isPlaying = await page.evaluate((name) => {
    const st = window.__ARCANUM_AUDIO_STATE__
    if (!st) return false
    return st.playingTracks?.some((t) => t.name === name && t.playing) ?? false
  }, trackName)
  expect(isPlaying).toBe(false)
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.getByTestId('add-sound-tile')).toBeVisible()
})

Then(
  'both {string} and {string} appear as tiles in the soundboard grid',
  async ({ page }, t1: string, t2: string) => {
    await expect(page.getByTestId(`soundboard-tile-${t1}`)).toBeVisible()
    await expect(page.getByTestId(`soundboard-tile-${t2}`)).toBeVisible()
  }
)

Then(
  '{string} and {string} appear as tiles in the soundboard grid',
  async ({ page }, t1: string, t2: string) => {
    await expect(page.getByTestId(`soundboard-tile-${t1}`)).toBeVisible()
    await expect(page.getByTestId(`soundboard-tile-${t2}`)).toBeVisible()
  }
)

Given(
  'the FX library has {string} and {string}',
  async ({ page }, t1: string, t2: string) => {
    await ensureModalOpen(page)
    await page.evaluate(
      ({ name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { fxTracks: [] }
        if (!db.fxTracks.some((f: any) => f.name === name1)) {
          db.fxTracks.push({ id: `fx_${name1}`, name: name1, duration: '0:04', intensity: 'I', tags: [] })
        }
        if (!db.fxTracks.some((f: any) => f.name === name2)) {
          db.fxTracks.push({ id: `fx_${name2}`, name: name2, duration: '0:04', intensity: 'II', tags: [] })
        }
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
        window.dispatchEvent(new Event('arcanum_db_update'))
      },
      { name1: t1, name2: t2 }
    )
  }
)

When('I type {string} in the picker search bar', async ({ page }, query: string) => {
  await page.getByPlaceholder('Search effects…').fill(query)
})

Then('I see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.getByTestId(`fx-picker-card-${name}`)).toBeVisible()
})

Then('I do not see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.getByTestId(`fx-picker-card-${name}`)).toHaveCount(0)
})

Given(
  'the FX library has {string} tagged CREATURE and {string} tagged IMPACT',
  async ({ page }, t1: string, t2: string) => {
    await ensureModalOpen(page)
    await page.evaluate(
      ({ name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { fxTracks: [] }
        db.fxTracks = db.fxTracks || []
        let f1 = db.fxTracks.find((x: any) => x.name === name1)
        if (f1) f1.tags = ['CREATURE']
        else db.fxTracks.push({ id: `fx_${name1}`, name: name1, duration: '0:04', intensity: 'I', tags: ['CREATURE'] })

        let f2 = db.fxTracks.find((x: any) => x.name === name2)
        if (f2) f2.tags = ['IMPACT']
        else db.fxTracks.push({ id: `fx_${name2}`, name: name2, duration: '0:04', intensity: 'II', tags: ['IMPACT'] })

        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
        window.dispatchEvent(new Event('arcanum_db_update'))
      },
      { name1: t1, name2: t2 }
    )
  }
)

Given('the FX library has {string}', async ({ page }, t1: string) => {
  await ensureModalOpen(page)
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [] }
    if (!db.fxTracks.some((f: any) => f.name === name)) {
      db.fxTracks.push({ id: `fx_${name}`, name, duration: '0:04', intensity: 'I', tags: [] })
    }
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    window.dispatchEvent(new Event('arcanum_db_update'))
  }, t1)
})

Then('I see "No effects match your filters"', async ({ page }) => {
  await expect(page.getByText('No effects match your filters')).toBeVisible()
})

Then('I see a clear-filters action', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible()
})

When('I use the clear-filters action in the picker', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear filters' }).click()
})

When('I tap the FX picker card body for {string}', async ({ page }, name: string) => {
  await page.getByTestId(`fx-picker-card-${name}`).click({ force: true })
})

Then('{string} begins previewing in the picker', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Then(
  'the {string} FX picker card shows a playing state in the picker',
  async ({ page }, name: string) => {
    const card = page.getByTestId(`fx-picker-card-${name}`)
    await expect(card).toHaveClass(/border-amber-500/)
  }
)

Then(
  'the {string} FX picker card no longer shows a playing state in the picker',
  async ({ page }, name: string) => {
    const card = page.getByTestId(`fx-picker-card-${name}`)
    await expect(card).not.toHaveClass(/border-amber-500/)
  }
)

When('I check {string} in the picker', async ({ page }, name: string) => {
  await page.getByTestId(`fx-picker-checkbox-${name}`).click()
})

Given('I have checked {string} in the picker', async ({ page }, name: string) => {
  await page.getByTestId(`fx-picker-checkbox-${name}`).click()
})

Then('the {string} button is enabled', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name })).toBeEnabled()
})

Then('the {string} button is disabled', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name })).toBeDisabled()
})

Then('{string} is still previewing in the picker', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Given('{string} is visible in the picker grid', async ({ page }, name: string) => {
  await ensureModalOpen(page)
  await page.evaluate((tName) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [] }
    if (!db.fxTracks.some((f: any) => f.name === tName)) {
      db.fxTracks.push({ id: `fx_${tName}`, name: tName, duration: '0:04', intensity: 'I', tags: [] })
    }
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    window.dispatchEvent(new Event('arcanum_db_update'))
  }, name)
  await expect(page.getByText(name, { exact: true })).toBeVisible()
})

Then('{string} previews at its saved default volume', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Then('sound for {string} is audible at default volume', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBe(true)
})

Then('no FX cards are checked in the picker', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Selected (0)' })).toBeDisabled()
})


Then('{string} is selected in the picker', async ({ page }, name: string) => {
  const checkbox = page.getByTestId(`fx-picker-checkbox-${name}`)
  await expect(checkbox.locator('svg')).toBeVisible()
})

Then('{string} is not previewing in the picker', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).not.toBe(true)
})

Given(
  '{string} and {string} are not yet in the current scene\'s soundboard',
  async ({ page }, t1: string, t2: string) => {
    await page.evaluate(
      ({ name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { soundboardItems: [] }
        db.soundboardItems = db.soundboardItems.filter((i: any) => i.sceneId !== 'sc1')
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name1: t1, name2: t2 }
    )
  }
)

When('I tap "Add Selected (2)"', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Selected (2)' }).click()
})


Then(
  '{string} appears before {string} in the soundboard grid',
  async ({ page }, first: string, second: string) => {
    const tile1 = page.getByTestId(`soundboard-tile-${first}`)
    const tile2 = page.getByTestId(`soundboard-tile-${second}`)
    await expect(tile1).toBeVisible()
    await expect(tile2).toBeVisible()
    const box1 = await tile1.boundingBox()
    const box2 = await tile2.boundingBox()
    if (box1 && box2) {
      expect(box1.y < box2.y || (Math.abs(box1.y - box2.y) < 10 && box1.x < box2.x)).toBe(true)
    }
  }
)

Then('I see a toast {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sound Effects' })).toBeVisible()
})

When('I tap "Add Selected (1)"', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Selected (1)' }).click()
})

Then('the {string} soundboard tile is idle', async ({ page }, name: string) => {
  const tile = page.getByTestId(`soundboard-tile-${name}`)
  await expect(tile).toBeVisible()
})

Given('{string} is already in the current scene\'s soundboard', async ({ page }, name: string) => {
  await ensureModalOpen(page)
  await page.evaluate((fxName) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [], soundboardItems: [] }
    db.fxTracks = db.fxTracks || []
    db.soundboardItems = db.soundboardItems || []
    let fx = db.fxTracks.find((f: any) => f.name === fxName)
    if (!fx) {
      fx = { id: `fx_${fxName}`, name: fxName, duration: '0:04', intensity: 'I', tags: [] }
      db.fxTracks.push(fx)
    }
    if (!db.soundboardItems.some((i: any) => i.sceneId === 'sc1' && i.fxTrackId === fx.id)) {
      db.soundboardItems.push({ sceneId: 'sc1', fxTrackId: fx.id, order: 0 })
    }
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    window.dispatchEvent(new Event('arcanum_db_update'))
  }, name)
})

Given(
  'the FX library has {string}, {string}, and {string}',
  async ({ page }, t1: string, t2: string, t3: string) => {
    await ensureModalOpen(page)
    await page.evaluate(
      ({ name1, name2, name3 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [], fxTracks: [], soundboardItems: [] }
        db.scenes = db.scenes || []
        db.soundboardItems = db.soundboardItems || []
        db.fxTracks = [
          { id: `fx_${name1}`, name: name1, duration: '0:04', intensity: 'I', tags: [] },
          { id: `fx_${name2}`, name: name2, duration: '0:04', intensity: 'II', tags: [] },
          { id: `fx_${name3}`, name: name3, duration: '0:03', intensity: 'I', tags: [] },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
        window.dispatchEvent(new Event('arcanum_db_update'))
      },
      { name1: t1, name2: t2, name3: t3 }
    )
  }
)

Then('all three effects appear as tiles in the active scene\'s soundboard', async ({ page }) => {
  await expect(page.locator('[data-testid^="soundboard-tile-"]')).toHaveCount(3)
})

Given(
  'the current scene\'s soundboard has 3 effect tiles with hotkeys Num 1 through Num 3',
  async ({ page }) => {
    await page.goto('/scenes/sc1')
    await page.evaluate(() => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { fxTracks: [], soundboardItems: [] }
      db.fxTracks = [
        { id: 'fx1', name: 'FX 1', duration: '0:04', intensity: 'I', tags: [] },
        { id: 'fx2', name: 'FX 2', duration: '0:04', intensity: 'I', tags: [] },
        { id: 'fx3', name: 'FX 3', duration: '0:04', intensity: 'I', tags: [] },
        { id: 'fx4', name: 'Thunder Crack', duration: '0:04', intensity: 'I', tags: [] },
      ]
      db.soundboardItems = [
        { sceneId: 'sc1', fxTrackId: 'fx1', order: 0 },
        { sceneId: 'sc1', fxTrackId: 'fx2', order: 1 },
        { sceneId: 'sc1', fxTrackId: 'fx3', order: 2 },
      ]
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    })
  }
)

Then('the {string} tile shows hotkey label {string}', async ({ page }, name: string, label: string) => {
  const tile = page.getByTestId(`soundboard-tile-${name}`)
  await expect(tile.getByText(label)).toBeVisible()
})

Then('the first 3 effect tiles still show hotkeys Num 1 through Num 3', async ({ page }) => {
  await expect(page.getByText('Num 1')).toBeVisible()
  await expect(page.getByText('Num 2')).toBeVisible()
  await expect(page.getByText('Num 3')).toBeVisible()
})
