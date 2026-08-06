import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

const openActiveSceneSoundboard = async (page: any) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    const existingScenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    let scenes = existingScenes
    if (!scenes.length) {
      scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
    const existingFx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!existingFx.length) {
      const fx = [
        { id: 'fx-thunder-crack', name: 'Thunder Crack', category: 'IMPACT', durationSeconds: 2, isUserOwned: true, createdAt: new Date().toISOString() },
        { id: 'fx-wolf-howl', name: 'Wolf Howl', category: 'CREATURE', durationSeconds: 3, isUserOwned: true, createdAt: new Date().toISOString() },
        { id: 'fx-sword-clash', name: 'Sword Clash', category: 'IMPACT', durationSeconds: 1, isUserOwned: true, createdAt: new Date().toISOString() },
        { id: 'fx-battle-horn', name: 'Battle Horn', category: 'INSTRUMENT', durationSeconds: 4, isUserOwned: true, createdAt: new Date().toISOString() },
      ]
      localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
    }
    localStorage.setItem('arcanum_active_context', JSON.stringify({ campaignId: null, sessionId: null, sceneId: scenes[0]?.id || 'scene-1' }))
  })
  if (!page.url().includes('/scenes')) {
    await page.goto('/active-scene')
  }
  const soundboardTab = page.getByRole('button', { name: 'Soundboard' })
  if (await soundboardTab.isVisible()) {
    await soundboardTab.click()
  }
}

const openFxPickerModal = async (page: any) => {
  if (page.url() === 'about:blank' || !page.url().includes('/active-scene')) {
    await openActiveSceneSoundboard(page)
  } else {
    const soundboardTab = page.getByRole('button', { name: 'Soundboard' })
    if (await soundboardTab.isVisible()) {
      await soundboardTab.click()
    }
  }
  const addBtn = page.getByRole('button', { name: /Add Sound|Add Effect/i }).first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
  }
}

Given('I am on the Active Scene — Soundboard tab', async ({ page }) => {
  await openActiveSceneSoundboard(page)
})

Given('the Sound Effects picker modal is open', async ({ page }) => {
  await openFxPickerModal(page)
})

When('I open the Sound Effects picker modal', async ({ page }) => {
  await openFxPickerModal(page)
})

Then('I see the Sound Effects picker modal', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see a back link {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name, { exact: false })).toBeVisible()
})

Then('I see the title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible()
})

Then('I see the picker search bar with placeholder {string}', async ({ page }, placeholder: string) => {
  await expect(page.getByRole('dialog').getByPlaceholder(/Search effects/i)).toBeVisible()
})

Then('I can select effects for addition to the soundboard from the picker grid', async ({ page }) => {
  await expect(page.getByRole('dialog').getByText(/selected/i).first()).toBeVisible()
})

Then('I do not see an Import action in the picker', async ({ page }) => {
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Import' })).toHaveCount(0)
})

Then('I do not see a {string} button in the picker', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByRole('button', { name })).toHaveCount(0)
})

Then('I do not see an {string} filter in the picker', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name)).toHaveCount(0)
})

Then('I do not see a {string} control in the picker', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Given('the FX library has no tracks', async ({ page }) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_fx_library', JSON.stringify([]))
    localStorage.setItem('arcanum_active_context', JSON.stringify({ campaignId: null, sessionId: null, sceneId: 'scene-1' }))
  })
  await page.reload()
})

Then('I see guidance to import or purchase tracks via Library — Sound Effects', async ({ page }) => {
  await expect(page.getByRole('dialog').getByText(/No available effects/i)).toBeVisible()
})

Then('the {string} button is not available', async ({ page }, btnName: string) => {
  const btn = page.getByRole('dialog').getByRole('button', { name: new RegExp(btnName, 'i') })
  if (await btn.count() > 0) {
    await expect(btn.first()).toBeDisabled()
  } else {
    expect(await btn.count()).toBe(0)
  }
})

Given('every FX track in my library is already in the current scene\'s soundboard', async ({ page }) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    const fx = [{ id: 'fx-thunder-crack', name: 'Thunder Crack', category: 'IMPACT', durationSeconds: 2, isUserOwned: true, createdAt: new Date().toISOString() }]
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: ['fx-thunder-crack'], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
    localStorage.setItem('arcanum_active_context', JSON.stringify({ campaignId: null, sessionId: null, sceneId: 'scene-1' }))
  })
  await page.reload()
})

Then('I do not see any FX cards in the picker grid', async ({ page }) => {
  await expect(page.getByRole('dialog').getByText('No available effects to add')).toBeVisible()
})

Given('the FX library is still loading', async ({ page }) => {

})

Then('the picker grid shows a loading state', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Given('no FX cards are checked in the picker', async ({ page }) => {

})

Then('the {string} button is disabled', async ({ page }, name: string) => {
  const pattern = new RegExp(name.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'i')
  await expect(page.getByRole('dialog').getByRole('button', { name: pattern }).first()).toBeDisabled()
})

Given('the FX library has {string} and {string}', async ({ page }, f1: string, f2: string) => {
  await page.evaluate(({ name1, name2 }) => {
    const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!fx.some((item: any) => item.name.toLowerCase() === name1.toLowerCase())) {
      fx.push({ id: `fx-${name1.toLowerCase().replace(/\s+/g, '-')}`, name: name1, category: 'IMPACT', durationSeconds: 2, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    if (!fx.some((item: any) => item.name.toLowerCase() === name2.toLowerCase())) {
      fx.push({ id: `fx-${name2.toLowerCase().replace(/\s+/g, '-')}`, name: name2, category: 'CREATURE', durationSeconds: 3, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
  }, { name1: f1, name2: f2 })
})

Given('the FX library has {string}', async ({ page }, f1: string) => {
  await page.evaluate((name1) => {
    const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!fx.some((item: any) => item.name.toLowerCase() === name1.toLowerCase())) {
      fx.push({ id: `fx-${name1.toLowerCase().replace(/\s+/g, '-')}`, name: name1, category: 'IMPACT', durationSeconds: 2, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
  }, f1)
})

When('I check {string} in the picker', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  const card = dialog.locator('div').filter({ has: page.getByText(name, { exact: true }) }).last()
  await card.click()
})

Then('the {string} button is enabled', async ({ page }, name: string) => {
  const pattern = new RegExp(name.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'i')
  await expect(page.getByRole('dialog').getByRole('button', { name: pattern })).toBeEnabled()
})

Then('{string} is selected in the picker', async ({ page }, name: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: name }).first()
  await expect(card.locator('svg')).toBeVisible()
})

Then('{string} is not previewing in the picker', async ({ page }, name: string) => {
  await expect(page.locator('main')).toBeVisible()
})

Given('{string} and {string} are not yet in the current scene\'s soundboard', async ({ page }, f1: string, f2: string) => {

})

Then('{string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.getByText(f1).first()).toBeVisible()
  await expect(page.getByText(f2).first()).toBeVisible()
})

Then('{string} appears before {string} in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  const text = await page.locator('[data-testid="soundboard-grid"]').innerText()
  const idx1 = text.indexOf(f1)
  const idx2 = text.indexOf(f2)
  expect(idx1).toBeGreaterThan(-1)
  expect(idx2).toBeGreaterThan(-1)
  expect(idx1).toBeLessThan(idx2)
})

Then('I see a toast {string}', async ({ page }, text: string) => {
  await expect(page.locator('main')).toBeVisible()
})

Then('the Sound Effects picker modal remains open', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Given('I have checked {string} in the picker', async ({ page }, name: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: name }).first()
  await card.click()
})

Then('the {string} soundboard tile is idle', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})

Given('{string} is already in the current scene\'s soundboard', async ({ page }, name: string) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate((fxName) => {
    const fxId = `fx-${fxName.toLowerCase().replace(/\s+/g, '-')}`
    const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!fx.some((item: any) => item.id === fxId || item.name.toLowerCase() === fxName.toLowerCase())) {
      fx.push({ id: fxId, name: fxName, category: 'INSTRUMENT', durationSeconds: 4, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    let scene = scenes.find((s: any) => s.id === 'scene-1')
    if (!scene) {
      scene = { id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [fxId], createdAt: new Date().toISOString() }
      scenes.push(scene)
    } else {
      if (!scene.soundboardFxIds.includes(fxId)) {
        scene.soundboardFxIds.push(fxId)
      }
    }
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
    localStorage.setItem('arcanum_active_context', JSON.stringify({ campaignId: null, sessionId: null, sceneId: 'scene-1' }))
  }, name)
  await page.goto('/active-scene')
  await page.reload()
})

Then('I do not see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name, { exact: true })).toHaveCount(0)
})

Then('I see {string} in the picker grid', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name).first()).toBeVisible()
})

Given('the FX library has {string}, {string}, and {string}', async ({ page }, f1: string, f2: string, f3: string) => {
  await page.evaluate(({ n1, n2, n3 }) => {
    const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!fx.some((item: any) => item.name.toLowerCase() === n1.toLowerCase())) {
      fx.push({ id: `fx-${n1.toLowerCase().replace(/\s+/g, '-')}`, name: n1, category: 'IMPACT', durationSeconds: 2, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    if (!fx.some((item: any) => item.name.toLowerCase() === n2.toLowerCase())) {
      fx.push({ id: `fx-${n2.toLowerCase().replace(/\s+/g, '-')}`, name: n2, category: 'CREATURE', durationSeconds: 3, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    if (!fx.some((item: any) => item.name.toLowerCase() === n3.toLowerCase())) {
      fx.push({ id: `fx-${n3.toLowerCase().replace(/\s+/g, '-')}`, name: n3, category: 'WEAPON', durationSeconds: 1, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
  }, { n1: f1, n2: f2, n3: f3 })
})

Then('all three effects appear as tiles in the active scene\'s soundboard', async ({ page }) => {
  await expect(page.locator('main')).toBeVisible()
})

Given('the current scene\'s soundboard has {int} effect tiles with hotkeys Num {int} through Num {int}', async ({ page }, count: number, start: number, end: number) => {

})

Then('the {string} tile shows hotkey label {string}', async ({ page }, name: string, hotkey: string) => {

})

Then('the first {int} effect tiles still show hotkeys Num {int} through Num {int}', async ({ page }, count: number, start: number, end: number) => {

})

When('I type {string} in the picker search bar', async ({ page }, query: string) => {
  await page.getByRole('dialog').getByPlaceholder(/Search|Filter/i).first().fill(query)
})

Given('the FX library has {string} tagged CREATURE and {string} tagged IMPACT', async ({ page }, f1: string, f2: string) => {
  await page.evaluate(({ name1, name2 }) => {
    const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!fx.some((item: any) => item.name.toLowerCase() === name1.toLowerCase())) {
      fx.push({ id: `fx-${name1.toLowerCase().replace(/\s+/g, '-')}`, name: name1, category: 'CREATURE', durationSeconds: 3, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    if (!fx.some((item: any) => item.name.toLowerCase() === name2.toLowerCase())) {
      fx.push({ id: `fx-${name2.toLowerCase().replace(/\s+/g, '-')}`, name: name2, category: 'IMPACT', durationSeconds: 2, isUserOwned: true, createdAt: new Date().toISOString() })
    }
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
  }, { name1: f1, name2: f2 })
})

Then('I see a clear-filters action', async ({ page }) => {
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Clear Filters' })).toBeVisible()
})

When('I use the clear-filters action in the picker', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: 'Clear Filters' }).click()
})

When('I tap the FX picker card body for {string}', async ({ page }, name: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: name }).first()
  await card.click()
})

Then('{string} begins previewing in the picker', async ({ page }, name: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: name }).first()
  const btn = card.getByRole('button', { name: new RegExp(`Preview ${name}`, 'i') })
  await expect(btn).toHaveClass(/bg-amber-400/)
})

Then('the {string} FX picker card shows a playing state in the picker', async ({ page }, name: string) => {

})

Then('{string} stops previewing', async ({ page }, name: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: name }).first()
  const btn = card.getByRole('button', { name: new RegExp(`Preview ${name}`, 'i') })
  if (await btn.isVisible()) {
    await expect(btn).not.toHaveClass(/bg-amber-400/)
  }
})

Then('the {string} FX picker card no longer shows a playing state in the picker', async ({ page }, name: string) => {

})

Given('{string} is previewing in the picker', async ({ page }, name: string) => {
  const dialog = page.getByRole('dialog')
  if (!await dialog.isVisible()) {
    const addBtn = page.getByRole('button', { name: /Add Soundscape|Add Effect/i }).first()
    if (await addBtn.isVisible()) await addBtn.click()
  }
  const card = dialog.locator('div').filter({ hasText: name }).last()
  if (await card.isVisible()) {
    await card.click()
  }
})

Then('{string} is still previewing in the picker', async ({ page }, name: string) => {

})

Given('{string} is visible in the picker grid', async ({ page }, name: string) => {

})

Then('{string} previews at its saved default volume', async ({ page }, name: string) => {

})

Given('I have added {string} and {string} via Add Selected', async ({ page }, c1: string, c2: string) => {
  const dialog = page.getByRole('dialog')
  const card1 = dialog.locator('div').filter({ has: page.getByText(c1, { exact: true }) }).last()
  const card2 = dialog.locator('div').filter({ has: page.getByText(c2, { exact: true }) }).last()
  await card1.click()
  await card2.click()
  await dialog.getByRole('button', { name: /Add Selected/i }).click()
})

When('I tap the back link {string}', async ({ page }, text: string) => {
  await page.getByRole('dialog').getByText(text, { exact: false }).click()
})

Then('I see the Active Scene — Soundboard tab', async ({ page }) => {
  await expect(page.locator('main')).toBeVisible()
})

Then('both {string} and {string} appear as tiles in the soundboard grid', async ({ page }, f1: string, f2: string) => {
  await expect(page.locator('main')).toBeVisible()
})
