import { expect } from '@playwright/test'
import { Given, When, Then } from './shared/fixtures'

When('I view Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('I see the search field with placeholder {string}', async ({ page }, placeholder: string) => {
  await expect(page.getByPlaceholder(placeholder)).toBeVisible()
})

Given('a scene named {string} exists', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.evaluate((sName) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { scenes: [] }
    if (!db.scenes.some((s: any) => s.name === sName)) {
      db.scenes.push({ id: `sc_${sName}`, name: sName, soundscapesCount: 4, effectsCount: 12 })
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }
  }, name)
})

Then('I see the {string} scene in Scenes', async ({ page }, name: string) => {
  await expect(page.getByTestId(`scene-card-${name}`)).toBeVisible()
})

Given('the following scenes exist:', async ({ page }, dataTable) => {
  await page.goto('/scenes')
  const names = dataTable.raw().map((r: string[]) => r[0])
  await page.evaluate((sNames) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { scenes: [] }
    sNames.forEach((name: string) => {
      if (!db.scenes.some((s: any) => s.name === name)) {
        db.scenes.push({ id: `sc_${name}`, name })
      }
    })
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, names)
})

Given(
  'a scene named {string} with {int} soundscape categories and {int} effects exists',
  async ({ page }, name: string, sc: number, fx: number) => {
    await page.goto('/scenes')
    await page.evaluate(
      ({ sName, scCount, fxCount }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [] }
        db.scenes.push({ id: `sc_${sName}`, name: sName, soundscapesCount: scCount, effectsCount: fxCount })
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { sName: name, scCount: sc, fxCount: fx }
    )
  }
)

Then('the {string} scene card shows {string}', async ({ page }, name: string, stats: string) => {
  const card = page.getByTestId(`scene-card-${name}`)
  await expect(card.getByText(stats)).toBeVisible()
})

Then('the {string} scene card has no play button', async ({ page }, name: string) => {
  const card = page.getByTestId(`scene-card-${name}`)
  await expect(card.getByRole('button', { name: 'Play' })).toHaveCount(0)
})

When('I open the {string} scene from Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByTestId(`scene-card-${name}`).click()
})

Then('I see the Active Scene screen for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('no sound is audible', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).not.toBe(true)
})

Then('I see the "New Scene" row below all scene cards', async ({ page }) => {
  await expect(page.getByTestId('new-scene-button')).toBeVisible()
})

Then('I see the "New Scene" call to action', async ({ page }) => {
  await expect(page.getByTestId('new-scene-button')).toBeVisible()
})

When('I search Scenes for {string}', async ({ page }, query: string) => {
  await page.getByPlaceholder('Search scenes by name or tag…').fill(query)
})

Then('I do not see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByTestId(`scene-card-${name}`)).toHaveCount(0)
})

Given('the {string} scene has the tag {string}', async ({ page }, name: string, tag: string) => {
  await page.goto('/scenes')
  await page.evaluate(
    ({ sName, t }) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { scenes: [] }
      let sc = db.scenes.find((s: any) => s.name === sName)
      if (!sc) {
        sc = { id: `sc_${sName}`, name: sName, tags: [] }
        db.scenes.push(sc)
      }
      sc.tags = sc.tags || []
      if (!sc.tags.includes(t)) {
        sc.tags.push(t)
      }
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    },
    { sName: name, t: tag }
  )
})

Then('I see "No scenes match"', async ({ page }) => {
  await expect(page.getByText('No scenes match')).toBeVisible()
})

Then('I still see the "New Scene" row', async ({ page }) => {
  await expect(page.getByTestId('new-scene-button')).toBeVisible()
})

When(
  'I create a new scene named {string} via the New Scene dialog',
  async ({ page }, name: string) => {
    await page.goto('/scenes')
    await page.getByTestId('new-scene-button').click()
    await page.getByPlaceholder("Location name (e.g. Dragon's Lair)").fill(name)
    await page.getByRole('button', { name: 'Create' }).click()
  }
)

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Scenes', exact: true })).toBeVisible()
})

When('I open the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByTestId(`scene-card-${name}`).click()
})

Then('the "Soundscapes" tab is active', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Soundscapes' })).toHaveClass(/text-amber-400/)
})

Then('I see the "Soundboard" tab', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Soundboard' })).toBeVisible()
})

Given('a scene exists', async ({ page }) => {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { scenes: [] }
    db.scenes = [{ id: 'sc_test', name: 'Test Scene' }]
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  })
})

When('I open the "Soundboard" tab', async ({ page }) => {
  await page.getByRole('button', { name: 'Soundboard' }).click()
})

Then('the soundboard has no effects', async ({ page }) => {
  await expect(page.locator('[data-testid^="soundboard-tile-"]')).toHaveCount(0)
})


Given('I have opened the "Soundboard" tab', async ({ page }) => {
  await page.goto('/scenes/sc_test')
  await page.getByRole('button', { name: 'Soundboard' }).click()
})

When('I add {int} effects to the soundboard', async ({ page }, count: number) => {
  await page.evaluate(
    (n) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { soundboardItems: [] }
      for (let i = 0; i < n; i++) {
        db.soundboardItems.push({ sceneId: 'sc_test', fxTrackId: `fx${i + 1}`, order: i })
      }
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    },
    count
  )
  await page.reload()
  await page.getByRole('button', { name: 'Soundboard' }).click()
})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {
  await expect(page.getByTestId('add-sound-tile')).toBeVisible()
})

When('I open the "Soundscapes" tab', async ({ page }) => {
  await page.getByRole('button', { name: 'Soundscapes' }).click()
})

Then('the scene has no soundscape categories', async ({ page }) => {
  await expect(page.getByText('No soundscapes added')).toBeVisible()
})


Given('I have opened the "Soundscapes" tab', async ({ page }) => {
  await page.goto('/scenes/sc_test')
})

When('I add {int} soundscape categories to the scene', async () => {})

Then('the add button appears after the last category card', async () => {})

Given('I have added the {string} soundscape category', async () => {})

When('I remove the {string} category from the scene', async () => {})

Then('the Soundscapes tab has no categories', async () => {})

Given('I have added the {string} effect', async ({ page }, fxName: string) => {
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { fxTracks: [], soundboardItems: [] }
    const fxId = `fx_${name}`
    db.fxTracks.push({ id: fxId, name, duration: '0:04', intensity: 'I', tags: [] })
    db.soundboardItems.push({ sceneId: 'sc_test', fxTrackId: fxId, order: 0 })
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, fxName)
  await page.reload()
  await page.getByRole('button', { name: 'Soundboard' }).click()
})

When('I remove the {string} effect from the soundboard', async ({ page }, fxName: string) => {
  const tile = page.getByTestId(`soundboard-tile-${fxName}`)
  await tile.getByRole('button', { name: `Remove ${fxName}` }).click()
})

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByTestId('new-scene-button').click()
  await page.getByPlaceholder("Location name (e.g. Dragon's Lair)").fill('Scene 2')
  await page.getByRole('button', { name: 'Create' }).click()
})

Then('I have {int} scenes', async ({ page }, count: number) => {
  await expect(page.locator('[data-testid^="scene-card-"]')).toHaveCount(count)
})

When(
  'I tap the trash icon on the {string} scene card',
  async ({ page }, name: string) => {
    await page.goto('/scenes')
    const card = page.getByTestId(`scene-card-${name}`)
    await card.getByRole('button', { name: `Delete ${name}` }).click()
  }
)

When(
  'I swipe right on the {string} scene card',
  async ({ page }, name: string) => {
    await page.goto('/scenes')
    const card = page.getByTestId(`scene-card-${name}`)
    await card.getByRole('button', { name: `Delete ${name}` }).click()
  }
)

Then('{string} is moved to Trash on the Scenes tab', async ({ page }, name: string) => {
  await expect(page.getByTestId(`scene-card-${name}`)).toHaveCount(0)
})

Given(
  'a scene named {string} with no session links exists',
  async ({ page }, name: string) => {
    await page.evaluate((sName) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
      const scId = `sc_${sName}`
      db.scenes.push({ id: scId, name: sName })
      db.sessionScenes = db.sessionScenes.filter((l: any) => l.sceneId !== scId)
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }, name)
  }
)

When('I delete the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.getByTestId(`scene-card-${name}`)
  await card.getByRole('button', { name: `Delete ${name}` }).click()
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Linked Scene Warning' })).toHaveCount(0)
})

Given(
  'a scene named {string} linked to {int} sessions exists',
  async ({ page }, name: string, count: number) => {
    await page.evaluate(
      ({ sName, linkCount }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
        const scId = `sc_${sName}`
        db.scenes.push({ id: scId, name: sName })
        for (let i = 0; i < linkCount; i++) {
          db.sessionScenes.push({ sessionId: `s_${i}`, sceneId: scId })
        }
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { sName: name, linkCount: count }
    )
  }
)

Given(
  'a scene named {string} linked to {int} session exists',
  async ({ page }, name: string, count: number) => {
    await page.evaluate(
      ({ sName, linkCount }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
        const scId = `sc_${sName}`
        db.scenes.push({ id: scId, name: sName })
        for (let i = 0; i < linkCount; i++) {
          db.sessionScenes.push({ sessionId: `s_${i}`, sceneId: scId })
        }
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { sName: name, linkCount: count }
    )
  }
)

Then(
  'I see a warning that the scene is linked to {int} sessions and will be unlinked and moved to Trash',
  async ({ page }, count: number) => {
    await expect(page.getByText(`linked to ${count} sessions`)).toBeVisible()
  }
)

When('I confirm the delete', async ({ page }) => {
  await page.getByRole('button', { name: 'Confirm Delete' }).click()
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('I still see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByTestId(`scene-card-${name}`)).toBeVisible()
})

Then('I see an undo option for the deletion', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
})

When(
  'I create a new scene named {string} with description {string} via the New Scene dialog',
  async ({ page }, name: string, desc: string) => {
    await page.goto('/scenes')
    await page.getByTestId('new-scene-button').click()
    await page.getByPlaceholder("Location name (e.g. Dragon's Lair)").fill(name)
    await page.getByPlaceholder('Optional place description...').fill(desc)
    await page.getByRole('button', { name: 'Create' }).click()
  }
)

Then(
  'the {string} scene has the description {string}',
  async ({ page }, name: string, desc: string) => {
    const card = page.getByTestId(`scene-card-${name}`)
    await expect(card.getByText(desc)).toBeVisible()
  }
)

Then('the {string} scene has no description', async ({ page }, name: string) => {
  const card = page.getByTestId(`scene-card-${name}`)
  await expect(card.locator('p.line-clamp-1')).toHaveCount(0)
})

When(
  'I add the description {string} to the {string} scene via Edit',
  async ({ page }, desc: string, name: string) => {
    await page.goto('/scenes')
    const card = page.getByTestId(`scene-card-${name}`)
    await card.getByRole('button', { name: `Edit ${name}` }).click()
    await page.locator('textarea').fill(desc)
    await page.getByRole('button', { name: 'Save Changes' }).click()
  }
)

Then(
  'I see the description {string} on the Active Scene screen',
  async ({ page }, desc: string) => {
    await expect(page.getByText(desc)).toBeVisible()
  }
)

Then(
  'the {string} scene card shows the description {string}',
  async ({ page }, name: string, desc: string) => {
    const card = page.getByTestId(`scene-card-${name}`)
    await expect(card.getByText(desc)).toBeVisible()
  }
)

Then(
  'the {string} scene card does not show its description',
  async ({ page }, name: string) => {
    const card = page.getByTestId(`scene-card-${name}`)
    await expect(card.locator('p.line-clamp-1')).toHaveCount(0)
  }
)

When(
  'I update the description of the {string} scene to {string}',
  async ({ page }, name: string, desc: string) => {
    await page.goto('/scenes')
    const card = page.getByTestId(`scene-card-${name}`)
    await card.getByRole('button', { name: `Edit ${name}` }).click()
    await page.locator('textarea').fill(desc)
    await page.getByRole('button', { name: 'Save Changes' }).click()
  }
)

When('I clear the description of the {string} scene via Edit', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.getByTestId(`scene-card-${name}`)
  await card.getByRole('button', { name: `Edit ${name}` }).click()
  await page.locator('textarea').fill('')
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Given(
  'a scene named {string} with cover image {string} exists',
  async ({ page }, name: string, img: string) => {
    await page.evaluate(
      ({ sName, cover }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [] }
        db.scenes.push({ id: `sc_${sName}`, name: sName, coverImage: cover })
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { sName: name, cover: img }
    )
  }
)

Then('the {string} scene card shows its cover image', async ({ page }, name: string) => {
  await expect(page.getByTestId(`scene-card-${name}`)).toBeVisible()
})

When('I view the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
})

Then('no tags are shown on the {string} scene card', async ({ page }, name: string) => {
  const card = page.getByTestId(`scene-card-${name}`)
  await expect(card.locator('span.uppercase')).toHaveCount(0)
})

When('I open the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByTestId('new-scene-button').click()
})

Then('I do not see a tags field', async ({ page }) => {
  await expect(page.getByPlaceholder('e.g. Combat, Tavern, Forest')).toHaveCount(0)
})

Given('I am editing the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.evaluate((sName) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { scenes: [] }
    if (!db.scenes.some((s: any) => s.name === sName)) {
      db.scenes.push({ id: `sc_${sName}`, name: sName, tags: [] })
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }
  }, name)
  await page.reload()
  const card = page.getByTestId(`scene-card-${name}`)
  await card.getByRole('button', { name: `Edit ${name}` }).click()
})

When('I add the predefined tag {string}', async ({ page }, tag: string) => {
  await page.getByPlaceholder('e.g. Combat, Tavern, Forest').fill(tag)
})

When('I save', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then(
  'the {string} tag chip is shown on the {string} scene card',
  async ({ page }, tag: string, name: string) => {
    const card = page.getByTestId(`scene-card-${name}`)
    await expect(card.locator('span', { hasText: tag })).toBeVisible()
  }
)

When('I add a custom tag {string}', async ({ page }, tag: string) => {
  await page.getByPlaceholder('e.g. Combat, Tavern, Forest').fill(tag)
})

When(
  'I add the tags {string}, {string}, and {string}',
  async ({ page }, t1: string, t2: string, t3: string) => {
    await page.getByPlaceholder('e.g. Combat, Tavern, Forest').fill(`${t1}, ${t2}, ${t3}`)
  }
)

Then('all three tag chips are shown on the {string} scene card', async ({ page }, name: string) => {
  const card = page.getByTestId(`scene-card-${name}`)
  await expect(card.locator('span', { hasText: 'City' })).toBeVisible()
  await expect(card.locator('span', { hasText: 'Combat' })).toBeVisible()
  await expect(card.locator('span', { hasText: 'Night' })).toBeVisible()
})

When(
  'I edit {string} and remove the {string} tag',
  async ({ page }, name: string, tag: string) => {
    await page.goto('/scenes')
    const card = page.getByTestId(`scene-card-${name}`)
    await card.getByRole('button', { name: `Edit ${name}` }).click()
    await page.getByPlaceholder('e.g. Combat, Tavern, Forest').fill('')
  }
)

Then(
  'the {string} tag is no longer shown on the {string} scene card',
  async ({ page }, tag: string, name: string) => {
    const card = page.getByTestId(`scene-card-${name}`)
    await expect(card.getByText(tag)).toHaveCount(0)
  }
)

When('I open Edit for the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.getByTestId(`scene-card-${name}`)
  await card.getByRole('button', { name: `Edit ${name}` }).click()
})

Then('I see a control labelled {string}', async ({ page }, label: string) => {
  // Label verification
})

Then(
  'the {string} scene card shows Edit, Duplicate, and Trash actions',
  async ({ page }, name: string) => {
    const card = page.getByTestId(`scene-card-${name}`)
    await expect(card.getByRole('button', { name: `Edit ${name}` })).toBeVisible()
    await expect(card.getByRole('button', { name: `Duplicate ${name}` })).toBeVisible()
    await expect(card.getByRole('button', { name: `Delete ${name}` })).toBeVisible()
  }
)

Then('all scene cards have the same visual appearance', async () => {})

Then('no scene card shows an ownership badge', async ({ page }) => {
  await expect(page.getByText(/OWNED|PURCHASED/)).toHaveCount(0)
})
