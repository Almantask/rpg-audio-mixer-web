import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import {
  buildFxTrack,
  buildSoundscapeCategory,
  mergeE2EData,
  openLibraryFxTab,
  tableRows,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

function parseHeaderTable(rows: string[][]): { headers: string[]; dataRows: string[][] } | null {
  if (rows.length < 2) return null
  const [headers, ...dataRows] = rows
  if (!headers.includes('name')) return null
  return { headers, dataRows }
}

function rowToRecord(headers: string[], row: string[]): Record<string, string> {
  return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']))
}

function buildTrackFromRecord(record: Record<string, string>) {
  const overrides: Partial<ReturnType<typeof buildFxTrack>> = {}
  if (record.tags) {
    overrides.tags = record.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  return buildFxTrack(record.name, overrides)
}

async function seedFxTracks(page: import('@playwright/test').Page, tracks: ReturnType<typeof buildFxTrack>[]) {
  await mergeE2EData(page, { fxTracks: tracks }, { navigateHome: false })
  if (page.url().includes('/library')) {
    await page.reload()
    await page.waitForLoadState('networkidle')
    await openLibraryFxTab(page)
  }
}

Given('there are FX tracks available:', async ({ page }, dataTable) => {
  const rows = tableRows(dataTable)
  const parsed = parseHeaderTable(rows)

  if (parsed) {
    const tracks = parsed.dataRows.map((row) => buildTrackFromRecord(rowToRecord(parsed.headers, row)))
    await seedFxTracks(page, tracks)
    return
  }

  const names = rows.flat().filter(Boolean)
  await seedFxTracks(page, names.map((name) => buildFxTrack(name)))
})

Given('I have categories {string}, {string}, {string}', async ({ page }, first, second, third) => {
  const seeded = [first, second, third].map((name) => buildSoundscapeCategory(name))
  await mergeE2EData(page, { soundscapeCategories: seeded }, { navigateHome: false })
})

Given('I have categories:', async ({ page }, dataTable) => {
  const rows = tableRows(dataTable)
  const [headers, ...dataRows] = rows
  if (!headers.includes('category')) throw new Error('Expected category table with headers')

  const categories = dataRows.map((row) => {
    const record = rowToRecord(headers, row)
    return {
      ...buildSoundscapeCategory(record.category),
      type: record.category_type,
    }
  })
  await mergeE2EData(page, { soundscapeCategories: categories }, { navigateHome: false })
  if (page.url().includes('/library')) {
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.goto('/library?tab=soundscapes')
    await page.waitForLoadState('networkidle')
  }
})

Given('I have categories added in this order:', async ({ page }, dataTable) => {
  const rows = tableRows(dataTable)
  const [headers, ...dataRows] = rows
  if (!headers.includes('category')) throw new Error('Expected table with category column')

  const categories = dataRows.map((row, index) => {
    const record = rowToRecord(headers, row)
    const createdAt = new Date(Date.now() - (dataRows.length - index) * 60_000).toISOString()
    return {
      ...buildSoundscapeCategory(record.category),
      createdAt,
    }
  })
  await mergeE2EData(page, { soundscapeCategories: categories }, { navigateHome: false })
  if (page.url().includes('/library')) {
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.goto('/library?tab=soundscapes')
    await page.waitForLoadState('networkidle')
  }
})

When('I search for {string} in the main search bar', async ({ page }, query: string) => {
  const fxSearch = page.locator('[data-fx-search]')
  const scSearch = page.locator('[data-sc-search]')
  if (await fxSearch.isVisible()) {
    await fxSearch.fill(query)
    return
  }
  await scSearch.fill(query)
})

When('I use the clear-filters action', async ({ page }) => {
  const libraryClear = page.getByRole('button', { name: 'Clear Filters', exact: true })
  if (await libraryClear.count() > 0) {
    await libraryClear.click()
    return
  }
  const fxPickerClear = page.locator('[data-fx-picker-clear-filters]')
  const scPickerClear = page.locator('[data-sc-picker-clear-filters]')
  if (await fxPickerClear.count() > 0) {
    await fxPickerClear.click()
  } else if (await scPickerClear.count() > 0) {
    await scPickerClear.click()
  }
})

Then('I see only FX tracks matching {string}:', async ({ page }, _query: string, dataTable) => {
  const expected = tableRows(dataTable).flat().filter(Boolean)
  const cards = page.locator('[data-fx-grid] [data-fx-card]')
  await expect(cards).toHaveCount(expected.length)
  for (const name of expected) {
    await expect(page.locator(`[data-fx-card="${name}"]`)).toBeVisible()
  }
})

Then('I do not see {string} in the FX library card grid', async ({ page }, name: string) => {
  await expect(page.locator(`[data-fx-grid] [data-fx-card="${name}"]`)).toHaveCount(0)
})

Then('I see {string} and {string} in the FX library card grid', async ({ page }, first: string, second: string) => {
  await expect(page.locator(`[data-fx-grid] [data-fx-card="${first}"]`)).toBeVisible()
  await expect(page.locator(`[data-fx-grid] [data-fx-card="${second}"]`)).toBeVisible()
})

Then('I see only {string} in the grid', async ({ page }, name: string) => {
  const cards = page.locator('[data-sc-grid] [data-sc-card]')
  await expect(cards).toHaveCount(1)
  await expect(page.locator(`[data-sc-card="${name}"]`)).toBeVisible()
})

Then('soundscape categories appear in this order:', async ({ page }, dataTable) => {
  const expected = tableRows(dataTable).flat().filter(Boolean)
  const actual = await page.locator('[data-sc-grid] [data-sc-card]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-sc-card')).filter(Boolean),
  )
  expect(actual).toEqual(expected)
})
