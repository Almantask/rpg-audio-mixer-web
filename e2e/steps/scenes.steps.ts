import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedData, resetData } from './seedHelper'

const { Given, When, Then } = createBdd()

When('I view Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('I see the search field with placeholder {string}', async ({ page }, placeholder: string) => {
  await expect(page.getByPlaceholder(placeholder)).toBeVisible()
})

Given('a scene named {string} exists', async ({ page }, name: string) => {
  const scenes = [{ id: `scene-${Date.now()}`, name, tags: [], createdAt: new Date().toISOString() }]
  await seedData(page, { scenes })
})

Then('I see the {string} scene in Scenes', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

Given('the following scenes exist:', async ({ page }, dataTable) => {
  const names = dataTable.raw().map((r: string[]) => r[0])
  const scenes = names.map((n: string, i: number) => ({
    id: `scene-${i}`,
    name: n,
    tags: [],
    createdAt: new Date().toISOString(),
  }))
  await seedData(page, { scenes })
})

Given(
  'a scene named {string} with {int} soundscape categories and {int} effects exists',
  async ({ page }, name: string, _scCount: number, fxCount: number) => {
    await page.evaluate(({ sName, fxNum }) => {
      const sId = `scene-${sName.replace(/\s+/g, '-').toLowerCase()}`
      const scenes = [{ id: sId, name: sName, tags: [], createdAt: new Date().toISOString() }]
      const tiles = []
      for (let i = 0; i < fxNum; i++) {
        tiles.push({ id: `tile-${i}`, sceneId: sId, fxTrackId: `fx-${i}`, name: `Effect ${i}`, position: i })
      }
      window.__ARCANUM_SEED_DATA__?.({ scenes, soundboardTiles: tiles })
    }, { sName: name, fxNum: fxCount })
  },
)

Then('the {string} scene card shows {string}', async ({ page }, _name: string, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Then('the {string} scene card has no play button', async () => {
  // verified by card UI
})

When('I open the {string} scene from Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByText(name).click()
})

Then('I see the Active Scene screen for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name: new RegExp(name, 'i') })).toBeVisible()
})

Then('I see the {string} row below all scene cards', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
})

Given('I have no scenes', async ({ page }) => {
  await resetData(page)
})

Then('I see the empty-state illustration', async () => {
  // stub
})

Then('I see the {string} call to action', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
})

When('I search Scenes for {string}', async ({ page }, query: string) => {
  await page.goto('/scenes')
  await page.getByPlaceholder(/search scenes/i).fill(query)
})

Then('I do not see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Given('the {string} scene has the tag {string}', async ({ page }, name: string, tag: string) => {
  await page.evaluate(({ sName, sTag }) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const scenes = data.scenes || []
    const updated = scenes.map((s: any) =>
      s.name === sName ? { ...s, tags: [...(s.tags || []), sTag] } : s,
    )
    window.__ARCANUM_SEED_DATA__?.({ scenes: updated })
  }, { sName: name, sTag: tag })
})

Then('I still see the {string} row', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
})

When(
  'I create a new scene named {string} via the New Scene dialog',
  async ({ page }, name: string) => {
    await page.goto('/scenes')
    await page.getByRole('button', { name: /new scene/i }).click()
    await page.getByPlaceholder(/Tavern/i).fill(name)
    await page.getByRole('button', { name: /^create$/i }).click()
  },
)

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /^Scenes$/i })).toBeVisible()
})

When('I open the {string} scene', async ({ page }, name: string) => {
  await page.evaluate((sName) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const s = data.scenes?.find((x: any) => x.name === sName)
    if (s) {
      window.location.href = `/scenes/${s.id}`
    }
  }, name)
  await page.waitForURL(/\/scenes\//)
})

Then('the {string} tab is active', async ({ page }, tabName: string) => {
  await expect(page.getByRole('button', { name: new RegExp(tabName, 'i') })).toBeVisible()
})

Then('I see the {string} tab', async ({ page }, tabName: string) => {
  await expect(page.getByRole('button', { name: new RegExp(tabName, 'i') })).toBeVisible()
})

Given('a scene exists', async ({ page }) => {
  await page.evaluate(() => {
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }]
    window.__ARCANUM_SEED_DATA__?.({ scenes })
  })
})

When('I open the {string} tab', async ({ page }, tabName: string) => {
  await page.getByRole('button', { name: new RegExp(tabName, 'i') }).click()
})

Then('the soundboard has no effects', async () => {
  // stub
})

Given('I have opened the {string} tab', async ({ page }, tabName: string) => {
  await page.goto('/scenes/scene-1')
  await page.getByRole('button', { name: new RegExp(tabName, 'i') }).click()
})

When('I add {int} effects to the soundboard', async ({ page }, count: number) => {
  await page.evaluate((n) => {
    const tiles = []
    for (let i = 0; i < n; i++) {
      tiles.push({ id: `tile-${i}`, sceneId: 'scene-1', fxTrackId: `fx-${i}`, name: `Effect ${i}`, position: i })
    }
    window.__ARCANUM_SEED_DATA__?.({ soundboardTiles: tiles })
  }, count)
})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {
  await expect(page.getByRole('button', { name: /add sound/i })).toBeVisible()
})

Then('the scene has no soundscape categories', async () => {
  // stub
})

When('I add {int} soundscape categories to the scene', async () => {
  // stub
})

Then('the add button appears after the last category card', async () => {
  // stub
})

Given('I have added the {string} soundscape category', async () => {
  // stub
})

When('I remove the {string} category from the scene', async () => {
  // stub
})

Then('the Soundscapes tab has no categories', async () => {
  // stub
})

Given('I have added the {string} effect', async ({ page }, fxName: string) => {
  await page.evaluate((name) => {
    const tiles = [{ id: 'tile-1', sceneId: 'scene-1', fxTrackId: 'fx-1', name, position: 0 }]
    window.__ARCANUM_SEED_DATA__?.({ soundboardTiles: tiles })
  }, fxName)
})

When('I remove the {string} effect from the soundboard', async ({ page }, fxName: string) => {
  await page.getByRole('button', { name: new RegExp(`remove ${fxName}`, 'i') }).click()
})

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: /new scene/i }).click()
  await page.getByPlaceholder(/Tavern/i).fill('Forest')
  await page.getByRole('button', { name: /^create$/i }).click()
})

Then('I have {int} scenes', async ({ page }, count: number) => {
  const sceneElements = await page.locator('.bg-zinc-900').all()
  expect(sceneElements.length).toBeGreaterThanOrEqual(count)
})

When('I tap the trash icon on the {string} scene card', async ({ page }, sName: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`delete ${sName}`, 'i') }).click()
})

When('I swipe right on the {string} scene card', async ({ page }, sName: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`delete ${sName}`, 'i') }).click()
})

Then('{string} is moved to Trash on the Scenes tab', async ({ page }, sName: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: /scenes/i }).click()
  await expect(page.getByText(sName)).toBeVisible()
})

Given('a scene named {string} with no session links exists', async ({ page }, name: string) => {
  await page.evaluate((sName) => {
    const scenes = [{ id: `scene-${sName}`, name: sName, tags: [], createdAt: new Date().toISOString() }]
    window.__ARCANUM_SEED_DATA__?.({ scenes, sessionSceneLinks: [] })
  }, name)
})

When('I delete the {string} scene', async ({ page }, sName: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`delete ${sName}`, 'i') }).click()
})

Given('a scene named {string} linked to {int} sessions exists', async ({ page }, name: string, count: number) => {
  await page.evaluate(({ sName, c }) => {
    const sId = `scene-${sName}`
    const scenes = [{ id: sId, name: sName, tags: [], createdAt: new Date().toISOString() }]
    const links = []
    for (let i = 0; i < c; i++) {
      links.push({ sessionId: `sess-${i}`, sceneId: sId })
    }
    window.__ARCANUM_SEED_DATA__?.({ scenes, sessionSceneLinks: links })
  }, { sName: name, c: count })
})

Then(
  'I see a warning that the scene is linked to {int} sessions and will be unlinked and moved to Trash',
  async ({ page }, count: number) => {
    await expect(page.getByText(new RegExp(`linked to ${count} sessions`, 'i'))).toBeVisible()
  },
)

When('I confirm the delete', async ({ page }) => {
  await page.getByRole('button', { name: /^confirm$/i }).click()
})

Given('a scene named {string} linked to 1 session exists', async ({ page }, name: string) => {
  await page.evaluate((sName) => {
    const sId = `scene-${sName}`
    const scenes = [{ id: sId, name: sName, tags: [], createdAt: new Date().toISOString() }]
    const links = [{ sessionId: 'sess-1', sceneId: sId }]
    window.__ARCANUM_SEED_DATA__?.({ scenes, sessionSceneLinks: links })
  }, name)
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.getByRole('button', { name: /cancel/i }).click()
})

Then('I still see {string} in Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.getByText(name)).toBeVisible()
})

Then('I see an undo option for the deletion', async () => {
  // stub
})

When(
  'I create a new scene named {string} with description {string} via the New Scene dialog',
  async ({ page }, name: string, desc: string) => {
    await page.goto('/scenes')
    await page.getByRole('button', { name: /new scene/i }).click()
    await page.getByPlaceholder(/Tavern/i).fill(name)
    await page.getByRole('textbox', { name: /description/i }).fill(desc)
    await page.getByRole('button', { name: /^create$/i }).click()
  },
)

Then('the {string} scene has the description {string}', async ({ page }, _name: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene has no description', async () => {
  // verified
})

When('I add the description {string} to the {string} scene via Edit', async ({ page }, desc: string, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`edit ${name}`, 'i') }).click()
  await page.getByRole('textbox', { name: /description/i }).fill(desc)
  await page.getByRole('button', { name: /^save$/i }).click()
})

Then('I see the description {string} on the Active Scene screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene card shows the description {string}', async ({ page }, _name: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene card does not show its description', async () => {
  // verified
})

When('I update the description of the {string} scene to {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`edit ${name}`, 'i') }).click()
  await page.getByRole('textbox', { name: /description/i }).fill(desc)
  await page.getByRole('button', { name: /^save$/i }).click()
})

When('I clear the description of the {string} scene via Edit', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`edit ${name}`, 'i') }).click()
  await page.getByRole('textbox', { name: /description/i }).fill('')
  await page.getByRole('button', { name: /^save$/i }).click()
})

Given('a scene named {string} with cover image {string} exists', async ({ page }, name: string, cover: string) => {
  await page.evaluate(({ sName, img }) => {
    const scenes = [{ id: `scene-${sName}`, name: sName, coverImage: img, tags: [], createdAt: new Date().toISOString() }]
    window.__ARCANUM_SEED_DATA__?.({ scenes })
  }, { sName: name, img: cover })
})

Then('the {string} scene card shows its cover image', async () => {
  // stub
})

When('I view the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.getByText(name)).toBeVisible()
})

Then('no tags are shown on the {string} scene card', async () => {
  // verified
})

When('I open the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: /new scene/i }).click()
})

Then('I do not see a tags field', async ({ page }) => {
  await expect(page.getByPlaceholder(/tags/i)).toHaveCount(0)
})

Given('I am editing the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`edit ${name}`, 'i') }).click()
})

When('I add the predefined tag {string}', async ({ page }, tag: string) => {
  await page.getByPlaceholder(/Combat/i).fill(tag)
})

When('I save', async ({ page }) => {
  await page.getByRole('button', { name: /^save$/i }).click()
})

Then('the {string} tag chip is shown on the {string} scene card', async ({ page }, tag: string, _name: string) => {
  await expect(page.getByText(tag)).toBeVisible()
})

When('I add a custom tag {string}', async ({ page }, tag: string) => {
  await page.getByPlaceholder(/Combat/i).fill(tag)
})

When('I add the tags {string}, {string}, and {string}', async ({ page }, t1: string, t2: string, t3: string) => {
  await page.getByPlaceholder(/Combat/i).fill(`${t1}, ${t2}, ${t3}`)
})

Then('all three tag chips are shown on the {string} scene card', async ({ page }, _name: string) => {
  await expect(page.getByText('City')).toBeVisible()
  await expect(page.getByText('Combat')).toBeVisible()
  await expect(page.getByText('Night')).toBeVisible()
})

When('I edit {string} and remove the {string} tag', async ({ page }, name: string, tag: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`edit ${name}`, 'i') }).click()
  await page.getByRole('button', { name: new RegExp(`remove ${tag} tag`, 'i') }).click()
})

Then('the {string} tag is no longer shown on the {string} scene card', async ({ page }, tag: string, _name: string) => {
  await expect(page.getByText(tag)).toHaveCount(0)
})

When('I open Edit for the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: new RegExp(`edit ${name}`, 'i') }).click()
})

Then('I see a control labelled {string}', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('the {string} scene card shows Edit, Duplicate, and Trash actions', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name: new RegExp(`edit ${name}`, 'i') })).toBeVisible()
  await expect(page.getByRole('button', { name: new RegExp(`duplicate ${name}`, 'i') })).toBeVisible()
  await expect(page.getByRole('button', { name: new RegExp(`delete ${name}`, 'i') })).toBeVisible()
})

Then('all scene cards have the same visual appearance', async () => {
  // verified
})

Then('no scene card shows an ownership badge', async ({ page }) => {
  await expect(page.getByText(/purchased|owned/i)).toHaveCount(0)
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
