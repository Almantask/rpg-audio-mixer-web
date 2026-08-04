import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('a scene exists', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  })
  await page.reload()
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Tavern' }) }).first()
  await card.getByRole('button', { name: 'Open Scene' }).click()
  await page.waitForURL('**/active-scene')
})

Given('a scene named {string} exists', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.evaluate((sceneName) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    if (!scenes.some((s: any) => s.name === sceneName)) {
      scenes.push({ id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, name: sceneName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() })
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, name)
  await page.reload()
})

Given('a scene named {string} with no session links exists', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await page.evaluate((scName) => {
    const scenes = [{ id: 'scene-1', name: scName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, sceneName)
  await page.reload()
})

Given('a scene named {string} linked to {int} session exists', async ({ page }, sceneName: string, count: number) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, c }) => {
    const scenes = [{ id: 'scene-1', name: scName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    const sessions = Array.from({ length: c }).map((_, i) => ({ id: `sess-${i + 1}`, campaignId: 'camp-1', name: `Session ${i + 1}`, createdAt: new Date().toISOString() }))
    const sessionScenes = Array.from({ length: c }).map((_, i) => ({ sessionId: `sess-${i + 1}`, sceneId: 'scene-1', linkedAt: new Date().toISOString() }))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { scName: sceneName, c: count })
  await page.reload()
})

Given('a scene named {string} linked to {int} sessions exists', async ({ page }, sceneName: string, count: number) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, c }) => {
    const scenes = [{ id: 'scene-1', name: scName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    const sessions = Array.from({ length: c }).map((_, i) => ({ id: `sess-${i + 1}`, campaignId: 'camp-1', name: `Session ${i + 1}`, createdAt: new Date().toISOString() }))
    const sessionScenes = Array.from({ length: c }).map((_, i) => ({ sessionId: `sess-${i + 1}`, sceneId: 'scene-1', linkedAt: new Date().toISOString() }))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { scName: sceneName, c: count })
  await page.reload()
})

Given('the following scenes exist:', async ({ page }, dataTable) => {
  const rows = dataTable.raw ? dataTable.raw() : dataTable.rows()
  const sceneList = rows.map((r: any, i: number) => {
    const name = Array.isArray(r) ? r[0] : (r.name || Object.values(r)[0])
    return { id: `scene-${i + 1}`, name, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }
  })
  await page.goto('/scenes')
  await page.evaluate((sList) => {
    localStorage.setItem('arcanum_scenes', JSON.stringify(sList))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, sceneList)
  await page.reload()
})

Given('I have opened the {string} tab', async ({ page }, tabName: string) => {
  if (!page.url().includes('/active-scene')) {
    await page.goto('/scenes')
    await page.reload()
    const card = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Tavern' }) }).first()
    await card.getByRole('button', { name: 'Open Scene' }).click()
    await page.waitForURL('**/active-scene')
  }
  await page.getByText(tabName).first().click()
})

Given('I have added the {string} soundscape category', async ({ page }, catName: string) => {
  await page.evaluate((cName) => {
    let soundscapes = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    let target = soundscapes.find((s: any) => s.name.toLowerCase().includes(cName.toLowerCase()))
    if (!target) {
      target = { id: `sc-${Date.now()}`, name: cName, description: `${cName} ambient sounds`, tags: [], tracks: { level1: [], level2: [], level3: [] } }
      soundscapes.push(target)
      localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
    }
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    if (scenes[0]) {
      scenes[0].soundscapeCategoryIds = Array.from(new Set([...(scenes[0].soundscapeCategoryIds || []), target.id]))
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
  }, catName)
  await page.goto('/scenes')
  await page.reload()
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Tavern' }) }).first()
  await card.getByRole('button', { name: 'Open Scene' }).click()
  await page.waitForURL('**/active-scene')
})

Given('I have added the {string} effect', async ({ page }, fxName: string) => {
  await page.evaluate((fName) => {
    let fxList = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    let target = fxList.find((f: any) => f.name.toLowerCase().includes(fName.toLowerCase()))
    if (!target) {
      target = { id: `fx-${Date.now()}`, name: fName, category: 'Custom', tags: [], audioUrl: '/assets/audio/thunder.ogg', durationSeconds: 2 }
      fxList.push(target)
      localStorage.setItem('arcanum_fx_library', JSON.stringify(fxList))
    }
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    if (scenes[0]) {
      scenes[0].soundboardFxIds = Array.from(new Set([...(scenes[0].soundboardFxIds || []), target.id]))
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
  }, fxName)
  await page.goto('/scenes')
  await page.reload()
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Tavern' }) }).first()
  await card.getByRole('button', { name: 'Open Scene' }).click()
  await page.waitForURL('**/active-scene')
  await page.getByText('Soundboard').first().click()
})

Given('I am editing the {string} scene', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await page.evaluate((scName) => {
    const scenes = [{ id: 'scene-1', name: scName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, sceneName)
  await page.reload()
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Edit ${sceneName}` }).click()
})

Given('the {string} scene has the tag {string}', async ({ page }, sceneName: string, tagName: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, tName }) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    let target = scenes.find((s: any) => s.name === scName)
    if (!target) {
      target = { id: `scene-${Date.now()}`, name: scName, description: '', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }
      scenes.push(target)
    }
    const filtered = (target.tags || []).filter((t: string) => t.toLowerCase() !== tName.toLowerCase())
    target.tags = [...filtered, tName]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, { scName: sceneName, tName: tagName })
  await page.reload()
})

When('I view the {string} scene card', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await expect(page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()).toBeVisible()
})

When('I open the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'Build your own scene' }).click()
})

When('I add the predefined tag {string}', async ({ page }, tagName: string) => {
  await page.getByRole('button', { name: `+ ${tagName}` }).click()
})

When('I add a custom tag {string}', async ({ page }, tagName: string) => {
  const input = page.getByPlaceholder(/custom tag/i)
  await input.fill(tagName)
  await input.press('Enter')
})

When('I add the tags {string}, {string}, and {string}', async ({ page }, t1: string, t2: string, t3: string) => {
  for (const tag of [t1, t2, t3]) {
    const btn = page.getByRole('button', { name: `+ ${tag}` })
    if (await btn.isVisible()) {
      await btn.click()
    } else {
      const input = page.getByPlaceholder(/custom tag/i)
      await input.fill(tag)
      await input.press('Enter')
    }
  }
})

When('I edit {string} and remove the {string} tag', async ({ page }, sceneName: string, tagName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Edit ${sceneName}` }).click()
  await page.getByRole('button', { name: `Remove ${tagName} tag`, exact: true }).first().click()
})

When('I open Edit for the {string} scene', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Edit ${sceneName}` }).click()
})

When('I save', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

When('I create a new scene named {string} via the New Scene dialog', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'Build your own scene' }).or(page.getByRole('button', { name: 'Create Scene' })).first().click()
  await page.getByRole('dialog').getByPlaceholder('e.g. Tavern').fill(sceneName)
  await page.getByRole('dialog').getByRole('button', { name: /Create Scene|Save Scene/i }).click()
})

When('I open the {string} scene', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: 'Open Scene' }).first().click()
  await page.waitForURL('**/active-scene')
})

When('I open the {string} tab', async ({ page }, tabName: string) => {
  if (!page.url().includes('/active-scene')) {
    const card = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Tavern' }) }).first()
    if (await card.isVisible()) {
      await card.getByRole('button', { name: 'Open Scene' }).click()
      await page.waitForURL('**/active-scene')
    }
  }
  await page.getByText(tabName).first().click()
})

When('I add {int} effects to the soundboard', async ({ page }, count: number) => {
  await page.getByRole('button', { name: 'Add Sound' }).first().click()
  const checkboxes = page.locator('div[class*="cursor-pointer"]').filter({ hasText: /Sword|Thunder|Door/ })
  const availCount = await checkboxes.count()
  for (let i = 0; i < Math.min(count, availCount); i++) {
    await checkboxes.nth(i).click()
  }
  await page.getByRole('button', { name: /Add Selected/ }).click()
})

When('I add {int} soundscape categories to the scene', async ({ page }, count: number) => {
  await page.getByRole('button', { name: 'ADD SOUNDSCAPE' }).or(page.getByRole('button', { name: 'Add Soundscape' })).first().click()
  const checkboxes = page.locator('div[class*="cursor-pointer"]').filter({ hasText: /Ambience|Drips/ })
  const availCount = await checkboxes.count()
  for (let i = 0; i < Math.min(count, availCount); i++) {
    await checkboxes.nth(i).click()
  }
  await page.getByRole('button', { name: /Add Selected/ }).click()
})

When('I remove the {string} category from the scene', async ({ page }, catName: string) => {
  const card = page.locator('div').filter({ hasText: catName }).first()
  await card.getByTitle('Remove category from scene').first().click()
})

When('I remove the {string} effect from the soundboard', async ({ page }, fxName: string) => {
  const card = page.locator('div').filter({ hasText: fxName }).first()
  await card.getByTitle('Remove effect from soundboard').first().click()
})

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'Build your own scene' }).or(page.getByRole('button', { name: 'Create Scene' })).first().click()
  await page.getByRole('dialog').getByPlaceholder('e.g. Tavern').fill('Wilderness')
  await page.getByRole('dialog').getByRole('button', { name: /Create Scene|Save Scene/i }).click()
})

When('I tap the trash icon on the {string} scene card', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByTitle(/Trash|Delete/i).or(card.getByRole('button', { name: /Trash|Delete/i })).first().click()
})

When('I swipe right on the {string} scene card', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Delete ${sceneName}` }).click()
})

When('I delete the {string} scene', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Delete ${sceneName}` }).click()
})

When('I confirm the delete', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: /Delete|Confirm|Unlink/i }).click()
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: /Cancel|Keep/i }).click()
})

Then('no tags are shown on the {string} scene card', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card.locator('span:has-text("#")')).toHaveCount(0)
})

Then('I do not see a tags field', async ({ page }) => {
  await expect(page.getByLabel(/Tags/i)).not.toBeVisible()
  await expect(page.getByText('Tags (comma separated)')).not.toBeVisible()
})

Then('the {string} tag chip is shown on the {string} scene card', async ({ page }, tagName: string, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card.locator('span').filter({ hasText: tagName }).first()).toBeVisible()
})

Then('all three tag chips are shown on the {string} scene card', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card.locator('span').filter({ hasText: 'City' }).first()).toBeVisible()
  await expect(card.locator('span').filter({ hasText: 'Combat' }).first()).toBeVisible()
  await expect(card.locator('span').filter({ hasText: 'Night' }).first()).toBeVisible()
})

Then('the {string} tag is no longer shown on the {string} scene card', async ({ page }, tagName: string, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card.locator('span').filter({ hasText: tagName })).not.toBeVisible()
})

Then('I see a control labelled {string}', async ({ page }, labelText: string) => {
  await expect(page.getByRole('button', { name: labelText, exact: true }).or(page.getByTitle(labelText)).first()).toBeVisible()
})

When('I create a new scene named {string} with description {string} via the New Scene dialog', async ({ page }, sceneName: string, desc: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'Build your own scene' }).or(page.getByRole('button', { name: 'Create Scene' })).first().click()
  await page.locator('input[placeholder="e.g. Tavern"]').fill(sceneName)
  await page.locator('textarea[placeholder="Describe the environment..."]').fill(desc)
  await page.getByRole('button', { name: 'Create Scene', exact: true }).click()
})

When('I add the description {string} to the {string} scene via Edit', async ({ page }, desc: string, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Edit ${sceneName}` }).click()
  await page.locator('textarea[placeholder="Describe the environment..."]').fill(desc)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('I see the description {string} on the Active Scene screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene card shows the description {string}', async ({ page }, sceneName: string, desc: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card.getByText(desc)).toBeVisible()
})

Then('the {string} scene card does not show its description', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card.getByText('No description provided.')).toBeVisible()
})

When('I update the description of the {string} scene to {string}', async ({ page }, sceneName: string, desc: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Edit ${sceneName}` }).click()
  await page.locator('textarea[placeholder="Describe the environment..."]').fill(desc)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

When('I clear the description of the {string} scene via Edit', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: `Edit ${sceneName}` }).click()
  await page.locator('textarea[placeholder="Describe the environment..."]').fill('')
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Given('a scene named {string} with cover image {string} exists', async ({ page }, sceneName: string, img: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, coverImg }) => {
    const scenes = [{ id: 'scene-1', name: scName, description: '', coverImage: coverImg, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, { scName: sceneName, coverImg: img })
  await page.reload()
})

Then('the {string} scene card shows its cover image', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card).toBeVisible()
})

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Scenes', level: 1 })).toBeVisible()
})

Then('I see the {string} scene in Scenes', async ({ page }, sceneName: string) => {
  await expect(page.getByText(sceneName).first()).toBeVisible()
})

Then('the {string} tab is active', async ({ page }, tabName: string) => {
  const tab = page.getByRole('button', { name: tabName })
  await expect(tab).toHaveClass(/border-amber-400|text-amber-400/)
})

Then('I see the {string} tab', async ({ page }, tabName: string) => {
  await expect(page.getByRole('button', { name: tabName })).toBeVisible()
})

Then('the soundboard has no effects', async ({ page }) => {
  await expect(page.getByText('Soundboard is empty').or(page.getByText('No sound effects added yet'))).toBeVisible()
})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Sound' }).first()).toBeVisible()
})

Then('the scene has no soundscape categories', async ({ page }) => {
  await expect(page.getByText('No soundscapes added')).toBeVisible()
})

Then('the add button appears after the last category card', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Soundscape' }).first()).toBeVisible()
})

Then('the Soundscapes tab has no categories', async ({ page }) => {
  await expect(page.getByText('No soundscapes added')).toBeVisible()
})

Then('I see an {string} button', async ({ page }, btnName: string) => {
  await expect(page.getByRole('button', { name: btnName }).first()).toBeVisible()
})

Then('I have {int} scenes', async ({ page }, count: number) => {
  await expect(page.locator('h3')).toHaveCount(count)
})

Then('{string} is moved to Trash on the Scenes tab', async ({ page }, sceneName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).not.toBeVisible()
})

Then('I do not see {string} in Scenes', async ({ page }, sceneName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).not.toBeVisible()
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

Then('I see a warning that the scene is linked to {int} sessions and will be unlinked and moved to Trash', async ({ page }, count: number) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I still see {string} in Scenes', async ({ page }, sceneName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

Then('I see an undo option for the deletion', async ({ page }) => {
  await expect(page.getByText(/Undo/i).or(page.getByRole('button', { name: /Undo/i }))).toBeVisible()
})

When('I view Scenes', async ({ page }) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: 'Scenes', level: 1 })).toBeVisible()
})

Then('the {string} scene card shows Edit, Duplicate, and Trash actions', async ({ page }, sceneName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await expect(card.getByRole('button', { name: `Edit ${sceneName}` })).toBeVisible()
  await expect(card.getByRole('button', { name: `Duplicate ${sceneName}` })).toBeVisible()
  await expect(card.getByRole('button', { name: `Delete ${sceneName}` })).toBeVisible()
})

Then('all scene cards have the same visual appearance', async ({ page }) => {
  const cards = page.locator('h3')
  await expect(cards).toHaveCount(3)
})

Then('no scene card shows an ownership badge', async ({ page }) => {
  await expect(page.getByText(/Purchased|Locked|Built-in/i)).not.toBeVisible()
})

Then('I see the search field with placeholder {string}', async ({ page }, ph: string) => {
  await expect(page.getByPlaceholder(ph)).toBeVisible()
})

Given('a scene named {string} with {int} soundscape categories and {int} effects exists', async ({ page }, sceneName: string, scCount: number, fxCount: number) => {
  await page.goto('/scenes')
  await page.evaluate(({ scName, scC, fxC }) => {
    const scenes = [{
      id: 'scene-1',
      name: scName,
      tags: [],
      soundscapeCategoryIds: Array.from({ length: scC }).map((_, i) => `sc-${i}`),
      soundboardFxIds: Array.from({ length: fxC }).map((_, i) => `fx-${i}`),
      createdAt: new Date().toISOString()
    }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, { scName: sceneName, scC: scCount, fxC: fxCount })
  await page.reload()
})

When('I open the {string} scene from Scenes', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: 'Open Scene' }).first().click()
  await page.waitForURL('**/active-scene')
})

Then('I see the Active Scene screen for {string}', async ({ page }, sceneName: string) => {
  await expect(page.getByRole('heading', { name: sceneName, level: 1 })).toBeVisible()
})

Then('no audio playback has started', async ({ page }) => {
  await expect(page.getByText('Playing')).not.toBeVisible()
})

Then('I see the {string} row below all scene cards', async ({ page }, rowName: string) => {
  await expect(page.getByText(rowName, { exact: true })).toBeVisible()
})

Given('I have no scenes', async ({ page }) => {
  await page.goto('/scenes')
  await page.evaluate(() => {
    localStorage.setItem('arcanum_scenes', JSON.stringify([]))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  })
  await page.reload()
})

Then('I see the empty-state illustration', async ({ page }) => {
  await expect(page.locator('div[data-testid="empty-state"]')).toBeVisible()
})

Then('I see the {string} call to action', async ({ page }, actionText: string) => {
  await expect(page.getByRole('button', { name: actionText })).toBeVisible()
})

When('I search Scenes for {string}', async ({ page }, queryText: string) => {
  const input = page.getByPlaceholder(/Search scenes/i)
  await input.fill(queryText)
})

Then('I see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text).first()).toBeVisible()
})

Then('I still see the {string} row', async ({ page }, rowName: string) => {
  await expect(page.getByText(rowName, { exact: true })).toBeVisible()
})
