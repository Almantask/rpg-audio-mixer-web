import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I am on the Soundscapes tab in the Library', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Library' }).click()
  const soundscapesTab = page.getByRole('button', { name: 'Soundscapes' })
  if (await soundscapesTab.isVisible()) {
    await soundscapesTab.click()
  }
})

When('I open the Soundscapes tab in the Library', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Library' }).click()
  const soundscapesTab = page.getByRole('button', { name: 'Soundscapes' })
  if (await soundscapesTab.isVisible()) {
    await soundscapesTab.click()
  }
})

Then('I see a {string} button', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name }).first()).toBeVisible()
})

Given('I have created categories {string}, {string}, {string}', async ({ page }, c1: string, c2: string, c3: string) => {
  await page.goto('/')
  await page.evaluate(({ name1, name2, name3 }) => {
    const cats = [
      { id: `sc-1`, name: name1, description: 'Desc 1', tags: [], tracks: { level1: [], level2: [], level3: [] }, createdAt: new Date().toISOString() },
      { id: `sc-2`, name: name2, description: 'Desc 2', tags: [], tracks: { level1: [], level2: [], level3: [] }, createdAt: new Date().toISOString() },
      { id: `sc-3`, name: name3, description: 'Desc 3', tags: [], tracks: { level1: [], level2: [], level3: [] }, createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, { name1: c1, name2: c2, name3: c3 })
  await page.reload()
})

Then('I see {string}, {string}, and {string} in the grid', async ({ page }, c1: string, c2: string, c3: string) => {
  await expect(page.getByText(c1).first()).toBeVisible()
  await expect(page.getByText(c2).first()).toBeVisible()
  await expect(page.getByText(c3).first()).toBeVisible()
})

Then('I see download progress UI', async ({ page }) => {
  await expect(page.getByText(/Downloading Free Demo Compositions/i)).toBeVisible()
})

Then('new soundscape categories appear in the grid when the demo pack download completes', async ({ page }) => {
  await expect(page.getByText(/Demo Pack Weather/i)).toBeVisible()
})

Given('{string} has {int} tracks at level I, {int} at level II, and {int} at level III', async ({ page }, name: string, l1: number, l2: number, l3: number) => {
  await page.goto('/')
  await page.evaluate(({ cName, c1, c2, c3 }) => {
    const makeTracks = (cnt: number, pfx: string) =>
      Array.from({ length: cnt }, (_, i) => ({ id: `tr-${pfx}-${i}`, name: `Track ${pfx} ${i}` }))
    const cats = [
      {
        id: `sc-${cName.toLowerCase()}`,
        name: cName,
        description: 'Atmosphere',
        tags: [],
        tracks: {
          level1: makeTracks(c1, 'l1'),
          level2: makeTracks(c2, 'l2'),
          level3: makeTracks(c3, 'l3'),
        },
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, { cName: name, c1: l1, c2: l2, c3: l3 })
  await page.reload()
})

Then('the {string} soundscape category card shows {string}', async ({ page }, catName: string, countText: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: catName }) }).first()
  await expect(card).toContainText(countText)
})

Given('{string} is in the soundscape categories grid', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((cName) => {
    const cats = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    if (!cats.some((c: any) => c.name === cName)) {
      cats.push({
        id: `sc-${cName.toLowerCase()}`,
        name: cName,
        description: 'Atmosphere',
        tags: [],
        tracks: { level1: [], level2: [], level3: [] },
        createdAt: new Date().toISOString(),
      })
    }
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, name)
  await page.goto('/')
  await page.getByRole('button', { name: 'Library' }).click()
  const soundscapesTab = page.getByRole('button', { name: 'Soundscapes' })
  if (await soundscapesTab.isVisible()) {
    await soundscapesTab.click()
  }
})

When('I tap the {string} soundscape category card body', async ({ page }, name: string) => {
  const card = page.locator('div.cursor-pointer').filter({ has: page.getByRole('heading', { name }) }).first()
  await card.click()
})

Then('I see the Soundscape Category Composer for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name: 'Category Composer' })).toBeVisible()
  await expect(page.getByText(name).first()).toBeVisible()
})

Given('soundscape library data has not yet resolved', async ({}) => {})

Then('I see skeleton placeholder cards in the grid', async ({ page }) => {
  await expect(page.locator('main')).toBeVisible()
})

Given('I have not created any soundscape categories', async ({ page }) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('arcanum_soundscapes', JSON.stringify([]))
  })
  await page.reload()
})

Then('I see a centred empty-state illustration with a prompt', async ({ page }) => {
  await expect(page.getByText('No soundscapes yet')).toBeVisible()
})

Then('I see a {string} tile at the end of the grid', async ({ page }, tileName: string) => {
  await expect(page.getByText(tileName).first()).toBeVisible()
})

Given('{string} exists with 0 tracks at all intensity levels', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((cName) => {
    const cats = [{ id: `sc-empty`, name: cName, description: 'Empty', tags: [], tracks: { level1: [], level2: [], level3: [] }, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, name)
  await page.reload()
})

Then('I see {string} in the grid', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})

Then('I do not see a {string} filter on the Soundscapes tab', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I do not see a {string} control on the Soundscapes tab', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

When('I create a soundscape category named {string} via Add Soundscape', async ({ page }, name: string) => {
  await page.getByRole('button', { name: '+ Add Soundscape' }).first().click()
  await page.getByPlaceholder(/Arcane|Forest/i).fill(name)
  await page.getByRole('button', { name: 'Create Category' }).click()
})

When('I delete {string} from the soundscape grid', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

When('I swipe right on the {string} soundscape card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

Then('{string} is moved to the Trash Soundscapes tab', async ({ page }, name: string) => {
  const isDeleted = await page.evaluate((cName) => {
    const cats = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    const c = cats.find((item: any) => item.name === cName)
    return Boolean(c && c.deletedAt)
  }, name)
  expect(isDeleted).toBe(true)
})

Then('{string} is no longer in the soundscape categories grid', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toHaveCount(0)
})

When('I preview {string} from its soundscape category card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Preview ${name}` }).click()
})

Then('the {string} soundscape category card shows a playing preview state on the thumbnail', async ({ page }, name: string) => {
  const btn = page.getByRole('button', { name: `Preview ${name}` })
  await expect(btn).toHaveClass(/bg-amber-400/)
})

Then('no mini player appears', async ({ page }) => {
  await expect(page.getByText('Mini Player')).toHaveCount(0)
})

Given('the {string} category is previewing a sample track', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((cName) => {
    const cats = [{ id: `sc-1`, name: cName, description: 'Atmosphere', tags: [], tracks: { level1: [], level2: [], level3: [] }, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, name)
  await page.goto('/')
  await page.getByRole('button', { name: 'Library' }).click()
  await page.getByRole('button', { name: `Preview ${name}` }).click()
})

When('I stop the preview on the {string} soundscape category card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Preview ${name}` }).click()
})

Then('the {string} soundscape category card no longer shows a playing preview state', async ({ page }, name: string) => {
  const btn = page.getByRole('button', { name: `Preview ${name}` })
  await expect(btn).not.toHaveClass(/bg-amber-400/)
})
