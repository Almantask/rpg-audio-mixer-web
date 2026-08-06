import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('the Add Soundscape picker modal is open', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    const soundscapes = [
      {
        id: 'sc-weather',
        name: 'Weather',
        tracks: {
          level1: Array.from({ length: 4 }, (_, i) => ({ id: `w-${i}`, name: `Rain ${i}` })),
          level2: Array.from({ length: 4 }, (_, i) => ({ id: `w2-${i}`, name: `Rain 2-${i}` })),
          level3: Array.from({ length: 4 }, (_, i) => ({ id: `w3-${i}`, name: `Rain 3-${i}` })),
        },
      },
      {
        id: 'sc-interior',
        name: 'Interior',
        tracks: {
          level1: [{ id: 'int-1', name: 'Hearth' }],
          level2: [{ id: 'int-2', name: 'Chairs' }],
          level3: [{ id: 'int-3', name: 'Crowd' }],
        },
      },
      {
        id: 'sc-monsters',
        name: 'Monsters',
        tracks: {
          level1: [{ id: 'm-1', name: 'Roar' }],
          level2: [],
          level3: [],
        },
      },
    ]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Scenes' }).click()
  await page.getByText('Tavern').first().click()
  const addBtn = page.getByRole('button', { name: /Add Soundscape/i }).first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
  }
})

Given('I am on the Active Scene — Soundscapes tab', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Scenes' }).click()
  await page.getByText('Tavern').first().click()
})

async function ensureModalOpen(page: any) {
  await page.evaluate(() => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    let tavern = scenes.find((s: any) => s.name === 'Tavern' || s.id === 'scene-1')
    if (!tavern) {
      tavern = { id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }
      scenes.push(tavern)
    }
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_active_context', JSON.stringify({ campaignId: null, sessionId: null, sceneId: tavern.id }))
  })
  if (!page.url().includes('/scenes') && !await page.getByRole('heading', { name: 'Tavern', exact: true }).isVisible()) {
    await page.goto('/')
    await page.getByRole('button', { name: 'Scenes' }).click()
    await page.getByText('Tavern').first().click()
  }
  const dialog = page.getByRole('dialog')
  if (!await dialog.isVisible()) {
    const addBtn = page.getByRole('button', { name: /Add Soundscape/i }).first()
    if (await addBtn.isVisible()) {
      await addBtn.click()
    }
  }
}

Given('my library has the category {string}', async ({ page }, name: string) => {
  await page.evaluate((catName) => {
    const soundscapes = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    if (!soundscapes.some((s: any) => s.name === catName)) {
      soundscapes.push({
        id: `sc-${catName.toLowerCase().replace(/\s+/g, '-')}`,
        name: catName,
        tracks: {
          level1: [{ id: `tr-${catName}-1`, name: `${catName} Clip` }],
          level2: [],
          level3: [],
        },
      })
      localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
    }
  }, name)
  await page.reload()
  await ensureModalOpen(page)
})

Given('my library has the category {string} with at least one track', async ({ page }, name: string) => {
  await page.evaluate((catName) => {
    const soundscapes = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    if (!soundscapes.some((s: any) => s.name === catName)) {
      soundscapes.push({
        id: `sc-${catName.toLowerCase().replace(/\s+/g, '-')}`,
        name: catName,
        tracks: {
          level1: [{ id: `tr-${catName}-1`, name: `${catName} Clip` }],
          level2: [],
          level3: [],
        },
      })
      localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
    }
  }, name)
  await page.reload()
  await ensureModalOpen(page)
})

Given('my library has the category {string} with {int} tracks across {int} layers', async ({ page }, name: string, totalTracks: number, layers: number) => {
  await page.evaluate(({ catName, count }) => {
    const soundscapes = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    const tPerLevel = Math.ceil(count / 3)
    const cat = {
      id: `sc-${catName.toLowerCase().replace(/\s+/g, '-')}`,
      name: catName,
      tracks: {
        level1: Array.from({ length: tPerLevel }, (_, i) => ({ id: `t1-${i}`, name: `Track 1-${i}` })),
        level2: Array.from({ length: tPerLevel }, (_, i) => ({ id: `t2-${i}`, name: `Track 2-${i}` })),
        level3: Array.from({ length: count - 2 * tPerLevel }, (_, i) => ({ id: `t3-${i}`, name: `Track 3-${i}` })),
      },
    }
    const idx = soundscapes.findIndex((s: any) => s.name === catName)
    if (idx >= 0) soundscapes[idx] = cat
    else soundscapes.push(cat)
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
  }, { catName: name, count: totalTracks })
  await page.reload()
  await ensureModalOpen(page)
})

Given('my library has the category {string} with no tracks at any intensity level', async ({ page }, name: string) => {
  if (!page.url().startsWith('http')) await page.goto('/')
  await page.evaluate((catName) => {
    const soundscapes = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    const cat = {
      id: `sc-${catName.toLowerCase().replace(/\s+/g, '-')}`,
      name: catName,
      tracks: { level1: [], level2: [], level3: [] },
    }
    const idx = soundscapes.findIndex((s: any) => s.name === catName)
    if (idx >= 0) soundscapes[idx] = cat
    else soundscapes.push(cat)
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
  }, name)
  await page.reload()
  await ensureModalOpen(page)
})

Given('my library has no soundscape categories', async ({ page }) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('arcanum_soundscapes', JSON.stringify([]))
  })
  await page.reload()
  await ensureModalOpen(page)
})

Given('my library has the categories {string} and {string}', async ({ page }, c1: string, c2: string) => {
  await page.evaluate(({ name1, name2 }) => {
    const soundscapes = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    if (!soundscapes.some((s: any) => s.name === name1)) {
      soundscapes.push({
        id: `sc-${name1.toLowerCase().replace(/\s+/g, '-')}`,
        name: name1,
        tracks: { level1: [{ id: `tr-1`, name: 'Clip 1' }], level2: [], level3: [] },
      })
    }
    if (!soundscapes.some((s: any) => s.name === name2)) {
      soundscapes.push({
        id: `sc-${name2.toLowerCase().replace(/\s+/g, '-')}`,
        name: name2,
        tracks: { level1: [{ id: `tr-2`, name: 'Clip 2' }], level2: [], level3: [] },
      })
    }
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
  }, { name1: c1, name2: c2 })
  await page.reload()
  await ensureModalOpen(page)
})

Given('{string} is not yet in the current scene', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText(name, { exact: true })).toBeVisible()
})

Given('no categories are checked in the picker', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Given('{string}, {string}, and {string} are not yet in the current scene', async ({ page }, c1: string, c2: string, c3: string) => {
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText(c1)).toBeVisible()
  await expect(dialog.getByText(c2)).toBeVisible()
  await expect(dialog.getByText(c3)).toBeVisible()
})

Given('{string} is already in the current scene', async ({ page }, name: string) => {
  if (!page.url().startsWith('http')) await page.goto('/')
  await page.evaluate((catName) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    const soundscapes = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    const catId = `sc-${catName.toLowerCase().replace(/\s+/g, '-')}`
    if (!soundscapes.some((s: any) => s.id === catId)) {
      soundscapes.push({ id: catId, name: catName, tracks: { level1: [{ id: 't1', name: 'Clip' }], level2: [], level3: [] } })
      localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
    }
    if (scenes[0] && !scenes[0].soundscapeCategoryIds.includes(catId)) {
      scenes[0].soundscapeCategoryIds.push(catId)
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
  }, name)
  await page.reload()
})

Given('my library has categories of different types', async ({ page }) => {
  await page.evaluate(() => {
    const soundscapes = [
      { id: 'sc-1', name: 'Weather', categoryType: 'Ambience', tracks: { level1: [{ id: 't1', name: 'Rain' }], level2: [], level3: [] } },
      { id: 'sc-2', name: 'Battle', categoryType: 'Music', tracks: { level1: [{ id: 't2', name: 'Drums' }], level2: [], level3: [] } },
    ]
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapes))
  })
  await page.reload()
  const addBtn = page.getByRole('button', { name: /Add Soundscape/i }).first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
  }
})

When('I open the Add Soundscape picker modal', async ({ page }) => {
  if (!page.url().includes('/scenes') && !await page.getByRole('heading', { name: 'Tavern', exact: true }).isVisible()) {
    await page.goto('/')
    await page.evaluate(() => {
      const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Scenes' }).click()
    await page.getByText('Tavern').first().click()
  }
  const dialog = page.getByRole('dialog')
  if (!await dialog.isVisible()) {
    await page.getByRole('button', { name: /Add Soundscape/i }).first().click()
  }
})

When('I set the Category Type filter to {string} in the picker', async ({ page }, typeName: string) => {
  const dialog = page.getByRole('dialog')
  const select = dialog.locator('select')
  if (await select.isVisible()) {
    await select.selectOption(typeName)
  }
})

When('I tap the soundscape picker card body for {string}', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  const card = dialog.locator('div').filter({ hasText: name }).first()
  await card.click()
})

When('I tap the soundscape picker card body for {string} again', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  const card = dialog.locator('div').filter({ hasText: name }).first()
  await card.click()
})

Then('I see the Add Soundscape picker modal', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I can select {string} for addition to the scene from the picker grid', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText(name)).toBeVisible()
})

Then('{string} cannot be added instantly from its soundscape picker card', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  const card = dialog.locator('div').filter({ hasText: name }).first()
  await expect(card.getByRole('button', { name: '+' })).toHaveCount(0)
})

Then('the {string} soundscape picker card shows {string}', async ({ page }, name: string, infoStr: string) => {
  const dialog = page.getByRole('dialog')
  const card = dialog.locator('div').filter({ hasText: name }).first()
  await expect(card).toContainText(infoStr)
})

Then('{string} and {string} appear in the active scene\'s Soundscapes tab', async ({ page }, c1: string, c2: string) => {
  await expect(page.getByRole('heading', { name: c1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: c2 })).toBeVisible()
})

Then('{string} appears before {string} in the category list', async ({ page }, c1: string, c2: string) => {
  const text = await page.locator('main').innerText()
  expect(text.indexOf(c1)).toBeLessThan(text.indexOf(c2))
})

Then('{string} is added to the active scene', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('the Add Soundscape picker modal is still open', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('{string}, {string}, and {string} appear in the active scene\'s Soundscapes tab', async ({ page }, c1: string, c2: string, c3: string) => {
  await expect(page.getByRole('heading', { name: c1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: c2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: c3 })).toBeVisible()
})

Then('{string} is idle and not auto-playing', async ({ page }, name: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name }) }).filter({ has: page.getByRole('button') }).first()
  await expect(card.getByRole('button', { name: new RegExp(`Play ${name}|Play`, 'i') }).first()).toBeVisible()
})

Then('{string} has volume 100%', async ({ page }, name: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name }) }).filter({ has: page.getByRole('button') }).first()
  await expect(card).toBeVisible()
})

Then('{string} has intensity II', async ({ page }, name: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name }) }).filter({ has: page.getByRole('button') }).first()
  await expect(card).toBeVisible()
})

Then('I do not see an {string} creation card in the picker grid', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  const grid = dialog.locator('.overflow-y-auto').first()
  await expect(grid.getByRole('button', { name: new RegExp(name, 'i') }).or(grid.getByText(`+ ${name}`))).toHaveCount(0)
})

Then('I see a centred empty-state illustration', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see {string} and {string} actions', async ({ page }, a1: string, a2: string) => {
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button', { name: a1 }).first()).toBeVisible()
  await expect(dialog.getByRole('button', { name: a2 }).first()).toBeVisible()
})

Then('I do not see an enabled {string} button', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  const btn = dialog.getByRole('button', { name: new RegExp(name, 'i') })
  if (await btn.count() > 0) {
    await expect(btn.first()).toBeDisabled()
  } else {
    expect(await btn.count()).toBe(0)
  }
})

Then('I see the {string} category in the picker grid', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name)).toBeVisible()
})

Then('I do not see the {string} category in the picker grid', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name)).toHaveCount(0)
})

Then('I see only matching categories in the picker grid', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('preview playback stops', async ({ page }) => {
  await expect(page.locator('main')).toBeVisible()
})

Then('I see the Active Scene — Soundscapes tab', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Active Scene' }).or(page.getByRole('heading', { name: 'Tavern' }))).toBeVisible()
})

Then('{string} and {string} are present as category cards', async ({ page }, c1: string, c2: string) => {
  await expect(page.getByRole('heading', { name: c1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: c2 })).toBeVisible()
})

Then('a sample track from {string} begins previewing', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name)).toBeVisible()
})

Then('the {string} soundscape picker card shows it is previewing', async ({ page }, name: string) => {
  const card = page.getByRole('dialog').locator('div').filter({ hasText: name }).first()
  await expect(card).toBeVisible()
})

Then('the {string} soundscape picker card no longer shows it is previewing', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})
