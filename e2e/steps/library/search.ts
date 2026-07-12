import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import type { FxIntensity, FxType } from '../../../src/types/library'
import {
  buildFxTrack,
  buildSoundscapeCategory,
  mergeE2EData,
  openLibraryFxTab,
  tableRows,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

function normalizeFxType(raw: string): FxType {
  if (raw === 'NATURE') return 'AMBIENT'
  return raw as FxType
}

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
  if (record.fx_type) {
    overrides.type = normalizeFxType(record.fx_type)
  }
  if (record.tags) {
    overrides.tags = record.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  if (record.intensity) {
    overrides.baseIntensity = record.intensity as FxIntensity
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

Given('there are FX tracks with different base intensities:', async ({ page }, dataTable) => {
  const rows = tableRows(dataTable)
  const parsed = parseHeaderTable(rows)
  if (!parsed) throw new Error('Expected table with name and intensity columns')

  const tracks = parsed.dataRows.map((row) => buildTrackFromRecord(rowToRecord(parsed.headers, row)))
  await seedFxTracks(page, tracks)
})

Given('FX tracks were added in this order:', async ({ page }, dataTable) => {
  const rows = tableRows(dataTable)
  const parsed = parseHeaderTable(rows)
  if (!parsed) throw new Error('Expected table with name column')

  const tracks = parsed.dataRows.map((row, index) => {
    const record = rowToRecord(parsed.headers, row)
    const createdAt = new Date(Date.now() - (parsed.dataRows.length - index) * 60_000).toISOString()
    return buildFxTrack(record.name, { createdAt })
  })
  await seedFxTracks(page, tracks)
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

When('I filter FX by type {string} in the sidebar', async ({ page }, fxType: string) => {
  await page.locator('#library-fx-type').selectOption(fxType)
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

When('I set the base intensity filter to {string} in the sidebar', async ({ page }, intensity: string) => {
  await page.locator('#library-fx-intensity').selectOption(intensity)
})

When('I set the sort order to {string} in the sidebar', async ({ page }, sortOrder: string) => {
  const labelToValue: Record<string, string> = {
    'Recently Added': 'recent',
    Name: 'name',
    Duration: 'duration',
  }
  const value = labelToValue[sortOrder] ?? sortOrder.toLowerCase()
  const fxSort = page.locator('#library-fx-sort')
  const scSort = page.locator('#library-sc-sort')
  if (await fxSort.isVisible()) {
    await fxSort.selectOption(value)
    return
  }
  await scSort.selectOption(value)
})

When('I filter soundscapes by category type {string} in the sidebar', async ({ page }, categoryType: string) => {
  await page.locator('#library-sc-type').selectOption(categoryType)
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

Then('I see only FX tracks of type {string}:', async ({ page }, _fxType: string, dataTable) => {
  const expected = tableRows(dataTable).flat().filter(Boolean)
  const cards = page.locator('[data-fx-grid] [data-fx-card]')
  await expect(cards).toHaveCount(expected.length)
  for (const name of expected) {
    await expect(page.locator(`[data-fx-card="${name}"]`)).toBeVisible()
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

Then('I see only FX tracks with base intensity up to {string}:', async ({ page }, _intensity: string, dataTable) => {
  const rank: Record<string, number> = { I: 1, II: 2, III: 3 }
  const intensity = await page.locator('#library-fx-intensity').inputValue()
  const maxRank = rank[intensity] ?? 3
  const expected = tableRows(dataTable).flat().filter(Boolean)
  const cards = page.locator('[data-fx-grid] [data-fx-card]')
  await expect(cards).toHaveCount(expected.length)
  for (const name of expected) {
    await expect(page.locator(`[data-fx-card="${name}"]`)).toBeVisible()
  }
  const visibleNames = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-fx-card')).filter(Boolean),
  )
  for (const visibleName of visibleNames) {
    const meta = await page.locator(`[data-fx-card="${visibleName}"] [data-fx-card-meta]`).innerText()
    const match = meta.match(/\b(I{1,3})\b/)
    if (match) {
      expect(rank[match[1]]).toBeLessThanOrEqual(maxRank)
    }
  }
})

Then('the FX grid shows tracks in this order:', async ({ page }, dataTable) => {
  const expected = tableRows(dataTable).flat().filter(Boolean)
  const actual = await page.locator('[data-fx-grid] [data-fx-card]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-fx-card')).filter(Boolean),
  )
  expect(actual).toEqual(expected)
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
