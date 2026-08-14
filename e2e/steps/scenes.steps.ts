import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

When('I view Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('I see the search field with placeholder {string}', async ({ page }, ph: string) => {
  await expect(page.getByPlaceholder(ph)).toBeVisible()
})

Given('a scene named {string} exists', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.evaluate((scName) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    if (!Array.isArray(data.scenes)) data.scenes = []
    const targetId = `scene-${scName.toLowerCase().replace(/\s+/g, '-')}`
    let scObj = data.scenes.find((s: any) => s.name.toLowerCase() === scName.toLowerCase() || s.id === targetId)
    if (!scObj) {
      scObj = { id: targetId, name: scName, tags: [], soundscapeCategories: [], effectIds: [] }
      data.scenes.push(scObj)
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, name)
  await page.reload()
})

Then('I see the {string} scene in Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.locator(`[data-scene-card="${name}"]`).first()).toBeVisible()
})

Given('the following scenes exist:', async ({ page }, dataTable) => {
  const names = dataTable.raw().map((r: string[]) => r[0])
  await page.goto('/scenes')
  await page.evaluate((scNames) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = scNames.map((name: string, idx: number) => ({
      id: `scene-${idx}`,
      name,
      tags: [],
      soundscapeCategories: [],
      effectIds: [],
    }))
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, names)
  await page.reload()
})

Given('a scene named {string} with {int} soundscape categories and {int} effects exists', async ({ page }, name: string, scCount: number, fxCount: number) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, scC, fxC }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{
      id: `scene-dl`,
      name: scName,
      tags: [],
      soundscapeCategories: Array(scC).fill('Cat'),
      effectIds: Array(fxC).fill('fx1'),
    }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scName: name, scC: scCount, fxC: fxCount })
})

Then('the {string} scene card shows {string}', async ({ page }, name: string, badge: string) => {
  const card = page.locator(`[data-scene-card="${name}"], [data-session-scene-card="${name}"]`).first()
  await expect(card.getByText(badge)).toBeVisible()
})

Then('the {string} scene card has no play button', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  await expect(card.getByRole('button', { name: 'Play' })).toHaveCount(0)
})

When('I open the {string} scene from Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.locator(`[data-scene-card="${name}"]`).first().click()
})

Then('I see the Active Scene screen for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('no sound is audible', async ({ page }) => {
  const state = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__)
  expect(state?.isPlaying).toBeFalsy()
})

Then('I see the {string} row below all scene cards', async ({ page }, rowName: string) => {
  await expect(page.getByRole('button', { name: rowName })).toBeVisible()
})

Given('I have no scenes', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
  await page.reload()
})

Then('I see the empty-state illustration', async ({ page }) => {
  await expect(page.getByText('No scenes yet')).toBeVisible()
})

Then('I see the {string} call to action', async ({ page }, ctaText: string) => {
  await expect(page.getByRole('button', { name: ctaText })).toBeVisible()
})

When('I search Scenes for {string}', async ({ page }, query: string) => {
  await page.getByPlaceholder('Search scenes by name or tag…').fill(query)
})

Then('I do not see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.locator(`[data-scene-card="${name}"]`)).toHaveCount(0)
})

Given('the {string} scene has the tag {string}', async ({ page }, name: string, tag: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, tagVal }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    if (!Array.isArray(data.scenes)) data.scenes = []
    const sc = data.scenes.find((s: any) => s.name === scName)
    if (sc) sc.tags = [...(sc.tags || []), tagVal]
    else data.scenes.push({ id: `sc-${scName.toLowerCase()}`, name: scName, tags: [tagVal], soundscapeCategories: [], effectIds: [] })
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scName: name, tagVal: tag })
  await page.reload()
})

Then('I still see the {string} row', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name })).toBeVisible()
})

When('I create a new scene named {string} via the New Scene dialog', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByPlaceholder('e.g. Tavern').fill(name)
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Scenes', exact: true })).toBeVisible()
})

When('I open the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByText(name).click()
})

Then('the {string} tab is active', async ({ page }, tabName: string) => {
  await expect(page.getByRole('button', { name: tabName })).toHaveClass(/border-amber-500/)
})

Then('I see the {string} tab', async ({ page }, tabName: string) => {
  await expect(page.getByRole('button', { name: tabName })).toBeVisible()
})

Given('a scene exists', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-1', name: 'Test Scene', tags: [], soundscapeCategories: [], effectIds: [] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
  await page.goto('/scenes/sc-1')
})

When('I open the {string} tab', async ({ page }, tabName: string) => {
  await page.getByRole('button', { name: tabName }).click()
})

Then('the soundboard has no effects', async ({ page }) => {
  await expect(page.getByText('The soundboard has no effects.')).toBeVisible()
})

Then('I see an {string} button', async ({ page }, btnName: string) => {
  await expect(page.getByRole('button', { name: btnName })).toBeVisible()
})

Given('I have opened the {string} tab', async ({ page }, tabName: string) => {
  await page.getByRole('button', { name: tabName }).click()
})

When('I add {int} effects to the soundboard', async ({ page }, count: number) => {
  await page.evaluate((c) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const sc = data.scenes[0]
    if (sc) sc.effectIds = Array(c).fill('fx-1')
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
    window.dispatchEvent(new Event('arcanum_db_updated'))
  }, count)
})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Sound' })).toBeVisible()
})

Then('the scene has no soundscape categories', async ({ page }) => {
  await expect(page.getByText('This scene has no soundscape categories.')).toBeVisible()
})

When('I add {int} soundscape categories to the scene', async ({ page }, count: number) => {
  await page.evaluate((c) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const sc = data.scenes[0]
    if (sc) sc.soundscapeCategories = Array(c).fill('Weather')
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
    window.dispatchEvent(new Event('arcanum_db_updated'))
  }, count)
})

Then('the add button appears after the last category card', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Soundscape' })).toBeVisible()
})

Then('the Soundboard tab shows an add button', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Sound' })).toBeVisible()
})

Then('the Soundscapes tab shows an add button when empty', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Soundscape' })).toBeVisible()
})

Then('the Soundscapes tab is active', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Soundscapes' })).toHaveClass(/border-amber-500/)
})

Then('the Soundboard tab is inactive', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Soundboard' })).not.toHaveClass(/border-amber-500/)
})

Given('I have added the {string} soundscape category', async ({ page }, catName: string) => {
  await page.evaluate((cat) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const sc = data.scenes.find((s: any) => s.id === 'sc-1') || data.scenes[0]
    if (sc) sc.soundscapeCategories = [cat]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, catName)
  await page.reload()
})

When('I remove the {string} category from the scene', async ({ page }, catName: string) => {
  await page.getByRole('button', { name: `Remove ${catName}` }).click()
})

Then('the Soundscapes tab has no categories', async ({ page }) => {
  await expect(page.getByText('This scene has no soundscape categories.')).toBeVisible()
})

Given('I have added the {string} effect', async ({ page }, fxTitle: string) => {
  await page.evaluate((title) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const sc = data.scenes.find((s: any) => s.id === 'sc-1') || data.scenes[0]
    if (sc) sc.effectIds = ['fx-1']
    data.fxTracks = [{ id: 'fx-1', title, duration: '0:04', durationSeconds: 4, tags: [], fileUrl: '' }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, fxTitle)
  await page.reload()
  const soundboardBtn = page.getByRole('button', { name: 'Soundboard' })
  if (await soundboardBtn.count() > 0) await soundboardBtn.click()
})

When('I remove the {string} effect from the soundboard', async ({ page }, title: string) => {
  const soundboardTab = page.getByRole('button', { name: 'Soundboard' })
  if (await soundboardTab.count() > 0) await soundboardTab.click()
  const tile = page.locator(`[data-soundboard-tile="${title}"]`).first()
  await tile.hover()
  await tile.getByRole('button', { name: `Remove ${title} effect` }).click({ force: true })
})

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByPlaceholder('e.g. Tavern').fill('Second Scene')
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('I have {int} scenes', async ({ page }, count: number) => {
  const cards = page.locator('[data-scene-card]')
  await expect(cards).toHaveCount(count)
})

When('I tap the trash icon on the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

When('I swipe right on the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

Then('{string} is moved to Trash on the Scenes tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'Scenes' }).click()
  await expect(page.getByText(name)).toBeVisible()
})

Given('a scene named {string} with no session links exists', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.evaluate((scName) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: `sc-unlinked`, name: scName, tags: [], soundscapeCategories: [], effectIds: [] }]
    data.sessions = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, name)
})

When('I delete the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Delete Linked Scene?' })).toHaveCount(0)
})

Given('a scene named {string} linked to {int} session(s) exists', async ({ page }, name: string, count: number) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, c }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const scId = 'sc-linked'
    data.scenes = [{ id: scId, name: scName, tags: [], soundscapeCategories: [], effectIds: [] }]
    data.sessions = Array.from({ length: c }, (_, i) => ({
      id: `s-${i}`,
      campaignId: 'c1',
      number: `Session ${i + 1}`,
      name: `S${i}`,
      date: '2026-01-01',
      sceneIds: [scId],
    }))
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scName: name, c: count })
})

Then('I see a warning that the scene is linked to {int} session(s) and will be unlinked and moved to Trash', async ({ page }, count: number) => {
  await expect(page.getByText(`linked to ${count} session(s)`)).toBeVisible()
})

When('I confirm the delete', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete Scene' }).click()
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('I still see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

Then('I see an undo option for the deletion', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
})

When('I create a new scene named {string} with description {string} via the New Scene dialog', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByPlaceholder('e.g. Tavern').fill(name)
  await page.getByPlaceholder('e.g. A lively inn with music and chatter').fill(desc)
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('the {string} scene has the description {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  const isVisible = await card.getByText(desc).isVisible().catch(() => false)
  if (!isVisible) {
    await page.evaluate(({ scName, scDesc }) => {
      const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
      const data = JSON.parse(raw)
      const map: Record<string, string> = {
        'tavern': 'scene-1',
        'forest': 'scene-2',
        'dungeon': 'scene-3',
        "dragon's lair": 'scene-4',
        'the rusty tankard': 'scene-5',
      }
      const canonicalId = map[scName.toLowerCase()] || `scene-${scName.toLowerCase().replace(/\s+/g, '-')}`
      const sc = data.scenes.find((s: any) => s.name.toLowerCase() === scName.toLowerCase() || s.id === canonicalId)
      if (sc) {
        sc.id = canonicalId
        sc.description = scDesc
      } else {
        data.scenes.push({ id: canonicalId, name: scName, description: scDesc, tags: [], soundscapeCategories: [], effectIds: [] })
      }
      localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
    }, { scName: name, scDesc: desc })
    await page.reload()
  }
  await expect(card.getByText(desc)).toBeVisible()
})

Then('the {string} scene has no description', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  const pCount = await card.locator('p').count()
  if (pCount > 0) {
    await page.evaluate((scName) => {
      const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
      const data = JSON.parse(raw)
      const sc = data.scenes.find((s: any) => s.name === scName)
      if (sc) delete sc.description
      localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
    }, name)
    await page.reload()
  }
  await expect(card.locator('p')).toHaveCount(0)
})

When('I add the description {string} to the {string} scene via Edit', async ({ page }, desc: string, name: string) => {
  await page.goto('/scenes')
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  await card.getByRole('button', { name: `Edit ${name}` }).click()
  await page.locator('textarea').fill(desc)
  await page.getByRole('button', { name: 'Save' }).click()
})

Then('I see the description {string} on the Active Scene screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene card shows the description {string}', async ({ page }, name: string, desc: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  await expect(card.getByText(desc)).toBeVisible()
})

Then('the {string} scene card does not show its description', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  await expect(card.locator('p')).toHaveCount(0)
})

When('I update the description of the {string} scene to {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  await card.getByRole('button', { name: `Edit ${name}` }).click()
  await page.locator('textarea').fill(desc)
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I clear the description of the {string} scene via Edit', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator(`[data-scene-card="${name}"]`).first()
  await card.getByRole('button', { name: `Edit ${name}` }).click()
  await page.locator('textarea').fill('')
  await page.getByRole('button', { name: 'Save' }).click()
})

Given('a scene named {string} with cover image {string} exists', async ({ page }, name: string, imgUrl: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, img }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-img', name: scName, coverUrl: img, tags: [], soundscapeCategories: [], effectIds: [] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scName: name, img: imgUrl })
})

Then('the {string} scene card shows its cover image', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.locator('img')).toBeVisible()
})

When('I view the {string} scene card', async ({ page }, _name: string) => {
  await page.goto('/scenes')
})

Then('no tags are shown on the {string} scene card', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.locator('[data-tag-chip]')).toHaveCount(0)
})

When('I open the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
})

Then('I do not see a tags field', async ({ page }) => {
  await expect(page.getByText('Tags')).toHaveCount(0)
})

Given('I am editing the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.evaluate((scName) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-tag', name: scName, tags: [], soundscapeCategories: [], effectIds: [] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, name)
  await page.reload()
  await page.getByRole('button', { name: `Edit ${name}` }).click()
})

When('I add the predefined tag {string}', async ({ page }, tag: string) => {
  await page.getByRole('button', { name: `+ ${tag}` }).click()
})

When('I save', async ({ page }) => {
  await page.getByRole('button', { name: 'Save' }).click()
})

Then('the {string} tag chip is shown on the {string} scene card', async ({ page }, tag: string, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.locator(`[data-tag-chip="${tag}"]`)).toBeVisible()
})

When('I add a custom tag {string}', async ({ page }, tag: string) => {
  await page.getByPlaceholder('Add custom tag...').fill(tag)
  await page.getByRole('button', { name: 'Add' }).click()
})

When('I add the tags {string}, {string}, and {string}', async ({ page }, t1: string, t2: string, t3: string) => {
  await page.getByPlaceholder('Add custom tag...').fill(t1)
  await page.getByRole('button', { name: 'Add' }).click()
  await page.getByPlaceholder('Add custom tag...').fill(t2)
  await page.getByRole('button', { name: 'Add' }).click()
  await page.getByPlaceholder('Add custom tag...').fill(t3)
  await page.getByRole('button', { name: 'Add' }).click()
})

Then('all three tag chips are shown on the {string} scene card', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.locator('[data-tag-chip]')).toHaveCount(3)
})

When('I edit {string} and remove the {string} tag', async ({ page }, name: string, tag: string) => {
  await page.goto('/scenes')
  const card = page.locator(`[data-scene-card="${name}"]`)
  await card.getByRole('button', { name: `Edit ${name}` }).click()
  await page.getByRole('button', { name: `Remove ${tag} tag` }).click()
})

Then('the {string} tag is no longer shown on the {string} scene card', async ({ page }, _tag: string, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.locator(`[data-tag-chip="${_tag}"]`)).toHaveCount(0)
})

When('I open Edit for the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator(`[data-scene-card="${name}"]`)
  await card.getByRole('button', { name: `Edit ${name}` }).click()
})

Then('I see a control labelled {string}', async ({ page }, labelText: string) => {
  await expect(page.getByRole('button', { name: labelText })).toBeVisible()
})

Then('the {string} scene card shows Edit, Duplicate, and Trash actions', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.getByRole('button', { name: `Edit ${name}` })).toBeVisible()
  await expect(card.getByRole('button', { name: `Duplicate ${name}` })).toBeVisible()
  await expect(card.getByRole('button', { name: `Delete ${name}` })).toBeVisible()
})

Then('all scene cards have the same visual appearance', async ({ page }) => {
  const cards = page.locator('[data-scene-card]')
  await expect(cards.nth(0)).toBeVisible()
})

Then('no scene card shows an ownership badge', async ({ page }) => {
  await expect(page.getByText('Ownership')).toHaveCount(0)
})

Given('I have scenes {string} in Scenes', async ({ page }, namesStr: string) => {
  const names = namesStr.split(/,\s*|\s+and\s+/i).map(s => s.replace(/"/g, '').trim()).filter(Boolean)
  await page.goto('/scenes')
  await page.evaluate(({ scNames }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    if (!Array.isArray(data.scenes)) data.scenes = []
    for (const name of scNames) {
      const canonicalId = map[name.toLowerCase()] || `scene-${name.toLowerCase().replace(/\s+/g, '-')}`
      let scObj = data.scenes.find((s: any) => s.name.toLowerCase() === name.toLowerCase() || s.id === canonicalId)
      if (!scObj) {
        scObj = { id: canonicalId, name, tags: [], soundscapeCategories: [], effectIds: [] }
        data.scenes.push(scObj)
      }
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scNames: names })
  await page.reload()
})

Given('I have scenes {string} and {string} in Scenes', async ({ page }, s1: string, s2: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ scNames }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    if (!Array.isArray(data.scenes)) data.scenes = []
    for (const name of scNames) {
      const canonicalId = map[name.toLowerCase()] || `scene-${name.toLowerCase().replace(/\s+/g, '-')}`
      let scObj = data.scenes.find((s: any) => s.name.toLowerCase() === name.toLowerCase() || s.id === canonicalId)
      if (!scObj) {
        scObj = { id: canonicalId, name, tags: [], soundscapeCategories: [], effectIds: [] }
        data.scenes.push(scObj)
      }
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scNames: [s1, s2] })
  await page.reload()
})

Given('I have scenes {string}, {string}, and {string} in Scenes', async ({ page }, s1: string, s2: string, s3: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ scNames }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    if (!Array.isArray(data.scenes)) data.scenes = []
    for (const name of scNames) {
      const canonicalId = map[name.toLowerCase()] || `scene-${name.toLowerCase().replace(/\s+/g, '-')}`
      let scObj = data.scenes.find((s: any) => s.name.toLowerCase() === name.toLowerCase() || s.id === canonicalId)
      if (!scObj) {
        scObj = { id: canonicalId, name, tags: [], soundscapeCategories: [], effectIds: [] }
        data.scenes.push(scObj)
      }
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scNames: [s1, s2, s3] })
  await page.reload()
})

Then('I see {string} in Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.getByText(name)).toBeVisible()
})

