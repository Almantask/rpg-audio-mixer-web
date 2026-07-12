import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  clearSeedData,
  createFxTrackSeed,
  createSoundscapeCategorySeed,
  setCategoryTypeSeed,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

Given(/^I search for "([^"]+)" in the main search bar$/, async ({ page }, query: string) => {
  const input =
    (await page.getByLabel('Search compositions').count()) > 0
      ? page.getByLabel('Search compositions')
      : page.getByLabel('Search effects')
  await input.fill(query)
})

When(/^I filter FX by type "([^"]+)" in the sidebar$/, async ({ page }, fxType: string) => {
  await page.getByTestId('fx-type-filter').selectOption(fxType)
})

When(/^I set the base intensity filter to "([^"]+)" in the sidebar$/, async ({ page }, level: string) => {
  const map: Record<string, string> = { I: '1', II: '2', III: '3' }
  await page.getByTestId('fx-intensity-filter').selectOption(map[level] ?? '2')
})

When(/^I set the sort order to "Recently Added" in the sidebar$/, async ({ page }) => {
  await page.getByTestId('library-sort-order').selectOption('recently-added')
})

When(/^I filter soundscapes by category type "([^"]+)" in the sidebar$/, async ({ page }, type: string) => {
  await page.getByTestId('category-type-filter').selectOption(type)
})

When('I use the clear-filters action', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear filters' }).click()
})

Then(/^I see only "([^"]+)" in the grid$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-category-name="${name}"]`)).toBeVisible()
})

Then(/^I see only FX tracks of type "([^"]+)"$/, async ({ page }, _type: string, dataTable) => {
  const names = dataTable.raw()[0] as string[]
  for (const name of names) {
    await expect(page.locator(`[data-effect-name="${name}"]`)).toBeVisible()
  }
})

Then(/^I do not see "([^"]+)" in the FX library card grid$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-effect-name="${name}"]`)).toHaveCount(0)
})

Then(/^I see only FX tracks matching "([^"]+)"$/, async ({ page }, _query: string, dataTable) => {
  const names = dataTable.raw()[0] as string[]
  for (const name of names) {
    await expect(page.locator(`[data-effect-name="${name}"]`)).toBeVisible()
  }
})

Then(/^I see only FX tracks with base intensity up to "([^"]+)"$/, async ({ page }, _level: string, dataTable) => {
  const names = dataTable.raw()[0] as string[]
  for (const name of names) {
    await expect(page.locator(`[data-effect-name="${name}"]`)).toBeVisible()
  }
})

Then(/^the FX grid shows tracks in this order$/, async ({ page }, dataTable) => {
  const names = dataTable.raw()[0] as string[]
  const cards = page.getByTestId('fx-tracks-grid').locator('[data-testid="fx-track-card"]')
  for (let index = 0; index < names.length; index += 1) {
    await expect(cards.nth(index)).toContainText(names[index]!)
  }
})

Then(/^I see "([^"]+)" and "([^"]+)" in the FX library card grid$/, async ({ page }, a: string, b: string) => {
  await expect(page.locator(`[data-effect-name="${a}"]`)).toBeVisible()
  await expect(page.locator(`[data-effect-name="${b}"]`)).toBeVisible()
})

Then(/^soundscape categories appear in this order$/, async ({ page }, dataTable) => {
  const names = dataTable.raw()[0] as string[]
  const cards = page.getByTestId('soundscape-categories-grid').locator('[data-testid="soundscape-category-card"]')
  for (let index = 0; index < names.length; index += 1) {
    await expect(cards.nth(index)).toContainText(names[index]!)
  }
})

Given(/^I have categories "([^"]+)", "([^"]+)", "([^"]+)"$/, async ({ page }, a: string, b: string, c: string) => {
  await page.goto('/')
  await clearSeedData(page)
  for (const name of [a, b, c]) {
    await createSoundscapeCategorySeed(page, name)
  }
})

Given('I have categories', async ({ page }, dataTable) => {
  await page.goto('/')
  await clearSeedData(page)
  const rows = dataTable.hashes() as Array<{ category: string; category_type: string }>
  for (const row of rows) {
    const id = await createSoundscapeCategorySeed(page, row.category)
    await setCategoryTypeSeed(page, id, row.category_type)
  }
})

Given('I have categories added in this order', async ({ page }, dataTable) => {
  await page.goto('/')
  await clearSeedData(page)
  const rows = dataTable.hashes() as Array<{ category: string }>
  for (const row of rows) {
    await createSoundscapeCategorySeed(page, row.category)
  }
})

Given('there are FX tracks available', async ({ page }, dataTable) => {
  await page.goto('/')
  await clearSeedData(page)
  if (dataTable.hashes().length > 0) {
    const rows = dataTable.hashes() as Array<{ name: string; fx_type?: string; tags?: string; intensity?: string }>
    for (const row of rows) {
      await createFxTrackSeed(page, {
        name: row.name,
        fxType: row.fx_type,
        tags: row.tags?.split(',').map((tag) => tag.trim()),
        baseIntensity: row.intensity === 'I' ? 1 : row.intensity === 'III' ? 3 : 2,
      })
    }
    return
  }
  const names = dataTable.raw()[0] as string[]
  for (const name of names) {
    await createFxTrackSeed(page, { name })
  }
})

Given('FX tracks were added in this order', async ({ page }, dataTable) => {
  await page.goto('/')
  await clearSeedData(page)
  const rows = dataTable.hashes() as Array<{ name: string }>
  for (const row of rows) {
    await createFxTrackSeed(page, { name: row.name })
  }
})

Given('there are FX tracks with different base intensities', async ({ page }, dataTable) => {
  await page.goto('/')
  await clearSeedData(page)
  const rows = dataTable.hashes() as Array<{ name: string; intensity: string }>
  for (const row of rows) {
    const baseIntensity = row.intensity === 'I' ? 1 : row.intensity === 'III' ? 3 : 2
    await createFxTrackSeed(page, { name: row.name, baseIntensity })
  }
})
