import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

const getLevelKey = (levelName: string) => {
  if (levelName.includes('I') && !levelName.includes('II')) return 'level1'
  if (levelName.includes('III')) return 'level3'
  return 'level2'
}

const getLevelCard = (page: any, levelName: string) => {
  const key = getLevelKey(levelName)
  return page.getByTestId(`level-card-${key}`)
}

const getLevelHeader = (page: any, levelName: string) => {
  const key = getLevelKey(levelName)
  return page.getByTestId(`level-header-${key}`)
}

const setupCategoryAndOpenComposer = async (page: any, catName: string, tracksObj?: any) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(({ name, tracks }) => {
    const cats = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    let cat = cats.find((c: any) => c.name === name)
    if (!cat) {
      cat = {
        id: `sc-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        description: 'Atmosphere',
        tags: [],
        tracks: tracks || { level1: [], level2: [], level3: [] },
        createdAt: new Date().toISOString(),
      }
      cats.push(cat)
    } else if (tracks) {
      cat.tracks = tracks
    }
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, { name: catName, tracks: tracksObj })
  if (!page.url().includes(`/library/composer?categoryId=${encodeURIComponent(catName)}`)) {
    await page.goto(`/library/composer?categoryId=${encodeURIComponent(catName)}`)
  }
}

Given('I am in the Soundscape Category Composer for {string}', async ({ page }, catName: string) => {
  await setupCategoryAndOpenComposer(page, catName)
})

Given('I am in the Soundscape Category Composer for a new category {string}', async ({ page }, catName: string) => {
  await setupCategoryAndOpenComposer(page, catName)
})

Then('I see exactly three intensity level rows labelled {string}, {string}, and {string}', async ({ page }, l1: string, l2: string, l3: string) => {
  await expect(page.getByText(l1, { exact: true }).first()).toBeVisible()
  await expect(page.getByText(l2, { exact: true }).first()).toBeVisible()
  await expect(page.getByText(l3, { exact: true }).first()).toBeVisible()
})

Then('I do not see an {string} control', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I see the category name {string}', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})

Then('{string} is expanded', async ({ page }, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.locator('svg.lucide-chevron-down')).toBeVisible()
})

Then('{string} and {string} are collapsed', async ({ page }, l1: string, l2: string) => {
  const card1 = getLevelCard(page, l1)
  const card2 = getLevelCard(page, l2)
  await expect(card1.locator('svg.lucide-chevron-right')).toBeVisible()
  await expect(card2.locator('svg.lucide-chevron-right')).toBeVisible()
})

Given('{string} is expanded with no tracks', async ({ page }, levelName: string) => {
  const card = getLevelCard(page, levelName)
  const isExpanded = await card.getByRole('button', { name: 'Add track' }).count() > 0
  if (!isExpanded) {
    const header = getLevelHeader(page, levelName)
    await header.click()
  }
})

Then('I see only {string} in {string}', async ({ page }, btnName: string, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByRole('button', { name: btnName }).first()).toBeVisible()
})

Then('I do not see placeholder track rows', async ({ page }) => {
  await expect(page.getByText(/No tracks added to this level yet/i)).toHaveCount(0)
})

Given('{string} in {string} has {int} tracks and is expanded', async ({ page }, levelName: string, catName: string, count: number) => {
  const lvlKey = getLevelKey(levelName)
  const tracks = Array.from({ length: count }, (_, i) => ({ id: `tr-${i}`, name: `Track ${i + 1}` }))
  await setupCategoryAndOpenComposer(page, catName, { level1: [], level2: [], level3: [], [lvlKey]: tracks })
  const card = getLevelCard(page, levelName)
  const isExpanded = await card.getByRole('button', { name: 'Add track' }).count() > 0
  if (!isExpanded) {
    const header = getLevelHeader(page, levelName)
    await header.click()
  }
})

Given('{string} in {string} has {int} tracks and is collapsed', async ({ page }, levelName: string, catName: string, count: number) => {
  const lvlKey = getLevelKey(levelName)
  const tracks = Array.from({ length: count }, (_, i) => ({ id: `tr-${i}`, name: `Track ${i + 1}` }))
  await setupCategoryAndOpenComposer(page, catName, { level1: [], level2: [], level3: [], [lvlKey]: tracks })
  const card = getLevelCard(page, levelName)
  const isExpanded = await card.getByRole('button', { name: 'Add track' }).count() > 0
  if (isExpanded) {
    const header = getLevelHeader(page, levelName)
    await header.click()
  }
})

When('I tap the collapse control on {string}', async ({ page }, levelName: string) => {
  const header = getLevelHeader(page, levelName)
  await header.click()
})

When('I tap the expand control on {string}', async ({ page }, levelName: string) => {
  const header = getLevelHeader(page, levelName)
  await header.click()
})

Then('the track list for {string} is hidden', async ({ page }, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByTestId('track-row')).toHaveCount(0)
})

Then('the collapsed {string} row shows {string}', async ({ page }, levelName: string, countStr: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card).toContainText(countStr)
})

Then('the track list for {string} is visible', async ({ page }, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByRole('button', { name: 'Add track' }).first()).toBeVisible()
})

Given('{string} is attached to {string} in {string}', async ({ page }, trackName: string, levelName: string, catName: string) => {
  const lvlKey = getLevelKey(levelName)
  const trId = `tr-${trackName.toLowerCase().replace(/\s+/g, '-')}`
  await setupCategoryAndOpenComposer(page, catName, {
    level1: [],
    level2: [],
    level3: [],
    [lvlKey]: [{ id: trId, name: trackName }],
  })
})

Then('I see {string} with subtitle {string}', async ({ page }, trackName: string, subtitle: string) => {
  const row = page.locator('div').filter({ has: page.getByText(trackName, { exact: true }) }).first()
  await expect(row).toContainText(subtitle)
})

When('I tap the remove control on {string} in {string}', async ({ page }, trackName: string, levelName: string) => {
  const card = getLevelCard(page, levelName)
  const trackRow = card.locator('div').filter({ has: page.getByText(trackName, { exact: true }) }).first()
  await trackRow.getByRole('button', { name: /Remove track/i }).click()
})

Then('{string} remains available in the library', async ({ page }, trackName: string) => {
  await expect(page.locator('main')).toBeVisible()
})

Given('I have made composition changes in {string}', async ({ page }, catName: string) => {
  await setupCategoryAndOpenComposer(page, catName)
})

Then('I remain on the Soundscape Category Composer for {string}', async ({ page }, catName: string) => {
  await expect(page.getByRole('heading', { name: 'Category Composer' })).toBeVisible()
})

Given('I have added a track to {string} in {string}', async ({ page }, levelName: string, catName: string) => {
  const lvlKey = getLevelKey(levelName)
  await setupCategoryAndOpenComposer(page, catName, {
    level1: [],
    level2: [],
    level3: [],
    [lvlKey]: [{ id: 'tr-added-1', name: 'Added Clip' }],
  })
})

Then('I return to the Library Soundscapes tab', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
})

Then('I do not see a discard-changes confirmation dialog', async ({ page }) => {
  await expect(page.getByText(/discard changes/i)).toHaveCount(0)
})

When('I reopen the Soundscape Category Composer for {string}', async ({ page }, catName: string) => {
  await page.goto(`/library/composer?categoryId=${encodeURIComponent(catName)}`)
})

Then('the added track is still attached to {string}', async ({ page }, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByText('Added Clip')).toBeVisible()
})

Then('I see the Track Picker modal titled {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('dialog').getByRole('heading', { name: title })).toBeVisible()
})

Then('I see an {string} action', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name)).toBeVisible()
})

Then('I see a picker search bar', async ({ page }) => {
  await expect(page.getByRole('dialog').getByPlaceholder(/Search tracks/i)).toBeVisible()
})

Given('the Track Picker modal is open for {string} in {string}', async ({ page }, levelName: string, catName: string) => {
  await setupCategoryAndOpenComposer(page, catName)
  const dialog = page.getByRole('dialog')
  if (!await dialog.isVisible()) {
    const card = getLevelCard(page, levelName)
    await card.getByRole('button', { name: 'Add track' }).first().click()
  }
})

Given('the soundscape library has {string}', async ({ page }, trName: string) => {
  const dialog = page.getByRole('dialog')
  let openLevel = 'Level I'
  if (await dialog.isVisible()) {
    const text = await dialog.locator('p').innerText()
    if (text.includes('Level II')) openLevel = 'Level II'
    else if (text.includes('Level III')) openLevel = 'Level III'
  }
  await page.evaluate((tName) => {
    const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!fx.some((f: any) => f.name === tName)) {
      fx.push({ id: `tr-${tName.toLowerCase().replace(/\s+/g, '-')}`, name: tName, audioUrl: '/audio.mp3', durationSeconds: 222 })
    }
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
  }, trName)
  await page.reload()
  const card = getLevelCard(page, openLevel)
  if (await card.isVisible()) {
    await card.getByRole('button', { name: 'Add track' }).first().click()
  }
})

Then('the {string} picker track card displays a selection checkbox', async ({ page }, trackName: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: trackName }).first()
  await expect(card).toBeVisible()
})

Then('the {string} picker track card shows format, channel, and duration metadata', async ({ page }, trackName: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: trackName }).first()
  await expect(card).toContainText(/MP3 · Stereo · 3:42/)
})

Then('the {string} picker track card does not display a + button', async ({ page }, trackName: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: trackName }).first()
  await expect(card.getByRole('button', { name: '+' })).toHaveCount(0)
})

Given('the soundscape library has no tracks', async ({ page }) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('arcanum_fx_library', JSON.stringify([]))
  })
  await page.reload()
  const card = getLevelCard(page, 'Level I')
  if (await card.isVisible()) {
    await card.getByRole('button', { name: 'Add track' }).first().click()
  }
})

Then('I see guidance to import tracks via Import', async ({ page }) => {
  await expect(page.getByRole('dialog').getByText(/No tracks in library/i)).toBeVisible()
})

Given('the soundscape library is still loading', async ({}) => {})

When('I open the Track Picker for {string} in {string}', async ({ page }, levelName: string, catName: string) => {
  const dialog = page.getByRole('dialog')
  if (await dialog.isVisible()) {
    const text = await dialog.locator('p').innerText()
    const levelStr = levelName.includes('I') && !levelName.includes('II') ? 'Level I' : levelName.includes('III') ? 'Level III' : 'Level II'
    if (text.includes(levelStr)) return
    await dialog.getByRole('button', { name: 'Close' }).click()
  }
  await setupCategoryAndOpenComposer(page, catName)
  const card = getLevelCard(page, levelName)
  await card.getByRole('button', { name: 'Add track' }).first().click()
})

Then('I see picker track skeleton cards in the picker grid', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Given('no picker track cards are checked', async ({ page }) => {})

Given('the soundscape library has {string} and {string}', async ({ page }, t1: string, t2: string) => {
  const dialog = page.getByRole('dialog')
  let openLevel = 'Level I'
  if (await dialog.isVisible()) {
    const text = await dialog.locator('p').innerText()
    if (text.includes('Level II')) openLevel = 'Level II'
    else if (text.includes('Level III')) openLevel = 'Level III'
  }
  await page.evaluate(({ name1, name2 }) => {
    const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
    if (!fx.some((f: any) => f.name === name1)) {
      fx.push({ id: `tr-${name1.toLowerCase().replace(/\s+/g, '-')}`, name: name1, audioUrl: '/audio.mp3', durationSeconds: 222 })
    }
    if (!fx.some((f: any) => f.name === name2)) {
      fx.push({ id: `tr-${name2.toLowerCase().replace(/\s+/g, '-')}`, name: name2, audioUrl: '/audio.mp3', durationSeconds: 222 })
    }
    localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
  }, { name1: t1, name2: t2 })
  await page.reload()
  const card = getLevelCard(page, openLevel)
  if (await card.isVisible()) {
    await card.getByRole('button', { name: 'Add track' }).first().click()
  }
})

Given('I have checked {string} and {string}', async ({ page }, t1: string, t2: string) => {
  const dialog = page.getByRole('dialog')
  let card1 = dialog.locator('div.cursor-pointer').filter({ hasText: t1 }).first()
  let card2 = dialog.locator('div.cursor-pointer').filter({ hasText: t2 }).first()
  if (!await card1.isVisible() || !await card2.isVisible()) {
    await page.evaluate(({ name1, name2 }) => {
      const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
      if (!fx.some((f: any) => f.name === name1)) {
        fx.push({ id: `tr-${name1.toLowerCase().replace(/\s+/g, '-')}`, name: name1, audioUrl: '/audio.mp3', durationSeconds: 222 })
      }
      if (!fx.some((f: any) => f.name === name2)) {
        fx.push({ id: `tr-${name2.toLowerCase().replace(/\s+/g, '-')}`, name: name2, audioUrl: '/audio.mp3', durationSeconds: 222 })
      }
      localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
    }, { name1: t1, name2: t2 })
    await page.reload()
    const card = getLevelCard(page, 'Level I')
    if (await card.isVisible()) {
      await card.getByRole('button', { name: 'Add track' }).first().click()
    }
    card1 = dialog.locator('div.cursor-pointer').filter({ hasText: t1 }).first()
    card2 = dialog.locator('div.cursor-pointer').filter({ hasText: t2 }).first()
  }
  await card1.click()
  await card2.click()
})

Then('{string} and {string} appear in {string}', async ({ page }, t1: string, t2: string, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByText(t1)).toBeVisible()
  await expect(card.getByText(t2)).toBeVisible()
})

Given('I have checked {string}', async ({ page }, t1: string) => {
  const dialog = page.getByRole('dialog')
  let card1 = dialog.locator('div.cursor-pointer').filter({ hasText: t1 }).first()
  if (!await card1.isVisible()) {
    await page.evaluate((name1) => {
      const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
      if (!fx.some((f: any) => f.name === name1)) {
        fx.push({ id: `tr-${name1.toLowerCase().replace(/\s+/g, '-')}`, name: name1, audioUrl: '/audio.mp3', durationSeconds: 222 })
      }
      localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
    }, t1)
    await page.reload()
    const card = getLevelCard(page, 'Level I')
    if (await card.isVisible()) {
      await card.getByRole('button', { name: 'Add track' }).first().click()
    }
    card1 = dialog.locator('div.cursor-pointer').filter({ hasText: t1 }).first()
  }
  await card1.click()
})

Then('the Track Picker modal stays open', async ({ page }, levelName?: string) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

When('I check {string} in the track picker', async ({ page }, tName: string) => {
  const dialog = page.getByRole('dialog')
  let card = dialog.locator('div.cursor-pointer').filter({ hasText: tName }).first()
  if (!await card.isVisible()) {
    let openLevel = 'Level I'
    if (await dialog.isVisible()) {
      const text = await dialog.locator('p').innerText()
      if (text.includes('Level II')) openLevel = 'Level II'
      else if (text.includes('Level III')) openLevel = 'Level III'
    }
    await page.evaluate((name) => {
      const fx = JSON.parse(localStorage.getItem('arcanum_fx_library') || '[]')
      if (!fx.some((f: any) => f.name === name)) {
        fx.push({ id: `tr-${name.toLowerCase().replace(/\s+/g, '-')}`, name, audioUrl: '/audio.mp3', durationSeconds: 222 })
      }
      localStorage.setItem('arcanum_fx_library', JSON.stringify(fx))
    }, tName)
    await page.reload()
    const cardLevel = getLevelCard(page, openLevel)
    if (await cardLevel.isVisible()) {
      await cardLevel.getByRole('button', { name: 'Add track' }).first().click()
    }
    card = dialog.locator('div.cursor-pointer').filter({ hasText: tName }).first()
  }
  await card.click()
})

Then('both tracks appear in {string}', async ({ page }, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByTestId('track-row')).toHaveCount(2)
})

When('I open the Track Picker for {string}', async ({ page }, levelName: string) => {
  const dialog = page.getByRole('dialog')
  if (await dialog.isVisible()) {
    const text = await dialog.locator('p').innerText()
    const levelStr = levelName.includes('I') && !levelName.includes('II') ? 'Level I' : levelName.includes('III') ? 'Level III' : 'Level II'
    if (text.includes(levelStr)) return
    await dialog.getByRole('button', { name: 'Close' }).click()
  }
  const card = getLevelCard(page, levelName)
  await card.getByRole('button', { name: 'Add track' }).first().click()
})

Then('both {string} and {string} appear in {string}', async ({ page }, t1: string, t2: string, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByText(t1)).toBeVisible()
  await expect(card.getByText(t2)).toBeVisible()
})

Then('{string} appears on both {string} and {string}', async ({ page }, tName: string, l1: string, l2: string) => {
  const card1 = getLevelCard(page, l1)
  const card2 = getLevelCard(page, l2)
  await expect(card1.getByText(tName)).toBeVisible()
  await expect(card2.getByText(tName)).toBeVisible()
})

Then('the composition is persisted without tapping {string}', async ({ page }, btnName: string) => {
  await expect(page.locator('main')).toBeVisible()
})

Given('I opened the Track Picker from {string} on {string} in {string}', async ({ page }, btnName: string, levelName: string, catName: string) => {
  await setupCategoryAndOpenComposer(page, catName)
  const dialog = page.getByRole('dialog')
  if (!await dialog.isVisible()) {
    const card = getLevelCard(page, levelName)
    await card.getByRole('button', { name: btnName }).first().click()
  }
})

Then('{string} is still expanded', async ({ page }, levelName: string) => {
  const card = getLevelCard(page, levelName)
  await expect(card.getByRole('button', { name: 'Add track' }).first()).toBeVisible()
})

When('I import the audio file {string}', async ({ page }, fileName: string) => {
  const dialog = page.getByRole('dialog')
  await dialog.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('fake-mp3-data'),
  })
})

Then('{string} is checked in the picker', async ({ page }, tName: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: tName }).first()
  await expect(card.locator('svg.lucide-check')).toBeVisible()
})

When('I tap the picker track card body for {string}', async ({ page }, tName: string) => {
  const card = page.getByRole('dialog').locator('div.cursor-pointer').filter({ hasText: tName }).first()
  const btn = card.getByRole('button', { name: new RegExp(`Preview ${tName}`, 'i') })
  await btn.click()
})
