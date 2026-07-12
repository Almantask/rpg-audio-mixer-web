import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { getCategoryComposerPath } from '../../../src/lib/storage/db'
import {
  attachTrackToLevel,
  clearSeedData,
  createSoundscapeCategorySeed,
  createTrackSeed,
  getCategoryIdByName,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function openComposer(page: Page, categoryName: string): Promise<void> {
  const categoryId = await getCategoryIdByName(page, categoryName)
  await page.goto(getCategoryComposerPath(categoryId))
  await page.waitForLoadState('networkidle')
}

async function ensureCategoryWithTracks(page: Page, categoryName: string): Promise<void> {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, categoryName)
  const tracks = [
    { name: 'Thunderous Downpour', format: 'MP3', channel: 'Stereo', duration: '3:42' },
    { name: 'Distant Rolling Thunder', format: 'WAV', channel: 'Wide Stereo', duration: '2:15' },
    { name: 'Gentle Breeze', format: 'MP3', channel: 'Stereo', duration: '1:30' },
    { name: 'Light Rain', format: 'MP3', channel: 'Stereo', duration: '2:00' },
  ]
  for (const track of tracks) {
    await createTrackSeed(page, track)
  }
  void categoryId
}

// --- Given ---

Given(/^I am in the Soundscape Category Composer for "([^"]+)"$/, async ({ page }, name: string) => {
  await ensureCategoryWithTracks(page, name)
  await openComposer(page, name)
})

Given(/^I am in the Soundscape Category Composer for a new category "([^"]+)"$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await page.goto('/library')
  await page.getByTestId('add-soundscape-card').click()
  await page.getByLabel('Category name').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click()
  await page.waitForLoadState('networkidle')
})

Given(/^"Level I" in "([^"]+)" has (\d+) tracks and is expanded$/, async ({ page }, category: string, count: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, category)
  const trackCount = Number.parseInt(count, 10)
  for (let index = 0; index < trackCount; index += 1) {
    const trackId = await createTrackSeed(page, {
      name: `Track ${index + 1}`,
      format: 'MP3',
      channel: 'Stereo',
      duration: '3:42',
    })
    await attachTrackToLevel(page, categoryId, 1, trackId)
  }
  await openComposer(page, category)
})

Given(/^"Level I" in "([^"]+)" has (\d+) tracks and is collapsed$/, async ({ page }, category: string, count: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, category)
  const trackCount = Number.parseInt(count, 10)
  for (let index = 0; index < trackCount; index += 1) {
    const trackId = await createTrackSeed(page, {
      name: `Track ${index + 1}`,
      format: 'MP3',
      channel: 'Stereo',
      duration: '3:42',
    })
    await attachTrackToLevel(page, categoryId, 1, trackId)
  }
  await openComposer(page, category)
  await page.locator('[data-level="Level I"]').getByRole('button').first().click()
})

Given(/^"Level II" in "([^"]+)" is expanded with no tracks$/, async ({ page }, category: string) => {
  await ensureCategoryWithTracks(page, category)
  await openComposer(page, category)
  await page.locator('[data-level="Level II"]').getByRole('button').first().click()
})

Given(/^"([^"]+)" is attached to "Level I" in "([^"]+)"$/, async ({ page }, trackName: string, category: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, category)
  const trackId = await createTrackSeed(page, {
    name: trackName,
    format: 'MP3',
    channel: 'Stereo',
    duration: '3:42',
  })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await openComposer(page, category)
})

Given(/^"Level I" is expanded$/, async ({ page }) => {
  await expect(page.locator('[data-level="Level I"][data-expanded="true"]')).toBeVisible()
})

Given(/^I have made composition changes in "([^"]+)"$/, async ({ page }, category: string) => {
  await ensureCategoryWithTracks(page, category)
  await openComposer(page, category)
})

Given(/^I have added a track to "Level I" in "([^"]+)"$/, async ({ page }, category: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, category)
  const trackId = await createTrackSeed(page, {
    name: 'Thunderous Downpour',
    format: 'MP3',
    channel: 'Stereo',
    duration: '3:42',
  })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await openComposer(page, category)
})

Given(/^I opened the Track Picker from "Add track" on "Level II" in "([^"]+)"$/, async ({ page }, category: string) => {
  await ensureCategoryWithTracks(page, category)
  await openComposer(page, category)
  await page.locator('[data-level="Level II"]').getByRole('button', { name: 'Add track' }).click()
})

Given(/^the Track Picker modal is open for "Level I" in "([^"]+)"$/, async ({ page }, category: string) => {
  await ensureCategoryWithTracks(page, category)
  await openComposer(page, category)
  await page.locator('[data-level="Level I"]').getByRole('button', { name: 'Add track' }).click()
})

Given(/^the soundscape library has "([^"]+)"$/, async ({ page }, trackName: string) => {
  await createTrackSeed(page, {
    name: trackName,
    format: 'MP3',
    channel: 'Stereo',
    duration: '3:42',
  })
})

Given(/^the soundscape library has "([^"]+)" and "([^"]+)"$/, async ({ page }, first: string, second: string) => {
  for (const name of [first, second]) {
    await createTrackSeed(page, {
      name,
      format: 'MP3',
      channel: 'Stereo',
      duration: '3:42',
    })
  }
})

Given('the soundscape library has no tracks', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
})

Given('no track cards are checked', async ({ page }) => {
  await expect(page.getByTestId('track-picker-grid').locator('input:checked')).toHaveCount(0)
})

Given(/^I have checked "([^"]+)" and "([^"]+)"$/, async ({ page }, first: string, second: string) => {
  await page.locator(`[data-track-name="${first}"]`).getByRole('checkbox').check()
  await page.locator(`[data-track-name="${second}"]`).getByRole('checkbox').check()
})

Given(/^I have checked "([^"]+)"$/, async ({ page }, trackName: string) => {
  await page.locator(`[data-track-name="${trackName}"]`).getByRole('checkbox').check()
})

Given(/^"([^"]+)" is already attached to "Level I" in "([^"]+)"$/, async ({ page }, trackName: string, category: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const categoryId = await createSoundscapeCategorySeed(page, category)
  const trackId = await createTrackSeed(page, {
    name: trackName,
    format: 'MP3',
    channel: 'Stereo',
    duration: '3:42',
  })
  await attachTrackToLevel(page, categoryId, 1, trackId)
  await createTrackSeed(page, {
    name: 'Distant Rolling Thunder',
    format: 'WAV',
    channel: 'Wide Stereo',
    duration: '2:15',
  })
})

Given(/^the Track Picker modal is open for "Level II" in "([^"]+)"$/, async ({ page }, category: string) => {
  await ensureCategoryWithTracks(page, category)
  await openComposer(page, category)
  await page.locator('[data-level="Level II"]').getByRole('button', { name: 'Add track' }).click()
})

// --- When ---

When(/^I tap "Add track" on "Level II"$/, async ({ page }) => {
  await page.locator('[data-level="Level II"]').getByRole('button', { name: 'Add track' }).click()
})

When(/^I tap the collapse control on "Level I"$/, async ({ page }) => {
  await page.locator('[data-level="Level I"]').getByRole('button').first().click()
})

When(/^I tap the expand control on "Level I"$/, async ({ page }) => {
  await page.locator('[data-level="Level I"]').getByRole('button').first().click()
})

When(/^I tap the remove control on "([^"]+)" in "Level I"$/, async ({ page }, trackName: string) => {
  await page.getByRole('button', { name: `Remove ${trackName}` }).click()
})

When(/^I open the Track Picker for "Level I" in "([^"]+)"$/, async ({ page }, category: string) => {
  await openComposer(page, category)
  await page.locator('[data-level="Level I"]').getByRole('button', { name: 'Add track' }).click()
})

When(/^I import the audio file "([^"]+)"$/, async ({ page }, fileName: string) => {
  await page.getByRole('button', { name: 'Import' }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('fake-audio'),
  })
})

When(/^I reopen the Soundscape Category Composer for "([^"]+)"$/, async ({ page }, category: string) => {
  await openComposer(page, category)
})

// --- Then ---

Then(/^I see exactly three intensity level rows labelled "([^"]+)", "([^"]+)", and "([^"]+)"$/, async ({ page }, l1: string, l2: string, l3: string) => {
  await expect(page.locator('[data-level="Level I"]')).toBeVisible()
  await expect(page.locator('[data-level="Level II"]')).toBeVisible()
  await expect(page.locator('[data-level="Level III"]')).toBeVisible()
  await expect(page.getByText(l1)).toBeVisible()
  await expect(page.getByText(l2)).toBeVisible()
  await expect(page.getByText(l3)).toBeVisible()
})

Then(/^I do not see an "([^"]+)" control$/, async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toHaveCount(0)
})

Then(/^I see the category name "([^"]+)"$/, async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
})

Then(/^"Level II" and "Level III" are collapsed$/, async ({ page }) => {
  await expect(page.locator('[data-level="Level II"][data-expanded="false"]')).toBeVisible()
  await expect(page.locator('[data-level="Level III"][data-expanded="false"]')).toBeVisible()
})

Then(/^I see "Add track" in "([^"]+)"$/, async ({ page }, level: string) => {
  await expect(page.locator(`[data-level="${level}"]`).getByRole('button', { name: 'Add track' })).toBeVisible()
})

Then(/^I see only "Add track" in "([^"]+)"$/, async ({ page }, level: string) => {
  await expect(page.locator(`[data-level="${level}"]`).getByRole('button', { name: 'Add track' })).toBeVisible()
  await expect(page.locator(`[data-level="${level}"]`).locator('li')).toHaveCount(0)
})

Then(/^I do not see placeholder track rows$/, async ({ page }) => {
  await expect(page.getByText(/placeholder/i)).toHaveCount(0)
})

Then(/^the track list for "([^"]+)" is hidden$/, async ({ page }, level: string) => {
  await expect(page.locator(`[data-level="${level}"][data-expanded="false"]`)).toBeVisible()
})

Then(/^the collapsed "([^"]+)" row shows "([^"]+)"$/, async ({ page }, level: string, text: string) => {
  await expect(page.locator(`[data-level="${level}"]`)).toContainText(text)
})

Then(/^the track list for "([^"]+)" is visible$/, async ({ page }, level: string) => {
  await expect(page.locator(`[data-level="${level}"][data-expanded="true"]`)).toBeVisible()
})

Then(/^I see "([^"]+)" with subtitle "([^"]+)"$/, async ({ page }, name: string, subtitle: string) => {
  await expect(page.getByText(name)).toBeVisible()
  await expect(page.getByText(subtitle)).toBeVisible()
})

Then(/^"([^"]+)" remains available in the library$/, async ({ page }, trackName: string) => {
  const count = await page.evaluate(async (name) => {
    const { db } = await import('../../../src/lib/storage/db')
    return db.tracks.filter((track) => track.name === name).count()
  }, trackName)
  expect(count).toBeGreaterThan(0)
})

Then(/^I remain on the Soundscape Category Composer for "([^"]+)"$/, async ({ page }, name: string) => {
  await expect(page.getByText('Category Composer')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
})

Then(/^I return to the Library Soundscapes tab$/, async ({ page }) => {
  await expect(page).toHaveURL(/\/library$/)
  await expect(page.getByRole('tab', { name: 'Soundscapes', selected: true })).toBeVisible()
})

Then('I do not see a discard-changes confirmation dialog', async ({ page }) => {
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

Then(/^the added track is still attached to "([^"]+)"$/, async ({ page }, level: string) => {
  await expect(page.locator(`[data-level="${level}"]`).getByText('Thunderous Downpour')).toBeVisible()
})

Then(/^I see the Track Picker modal titled "([^"]+)"$/, async ({ page }, title: string) => {
  await expect(page.getByRole('dialog', { name: title })).toBeVisible()
})

Then(/^I see an "([^"]+)" action$/, async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then(/^I see a picker search bar$/, async ({ page }) => {
  await expect(page.getByLabel('Search tracks in picker')).toBeVisible()
})

Then(/^the "([^"]+)" card displays a selection checkbox$/, async ({ page }, trackName: string) => {
  await expect(page.locator(`[data-track-name="${trackName}"]`).getByRole('checkbox')).toBeVisible()
})

Then(/^the "([^"]+)" card shows format, channel, and duration metadata$/, async ({ page }, trackName: string) => {
  await expect(page.locator(`[data-track-name="${trackName}"]`)).toContainText(/MP3|WAV/)
})

Then(/^the "([^"]+)" card does not display a \+ button$/, async ({ page }, trackName: string) => {
  await expect(page.locator(`[data-track-name="${trackName}"]`).getByRole('button', { name: '+' })).toHaveCount(0)
})

Then(/^I see guidance to import tracks via Import$/, async ({ page }) => {
  await expect(page.getByText(/import tracks/i)).toBeVisible()
})

Then('I see skeleton cards in the picker grid', async ({ page }) => {
  await expect(page.getByRole('status', { name: 'Loading tracks' })).toBeVisible()
})

Then(/^"Level II" is still expanded$/, async ({ page }) => {
  await expect(page.locator('[data-level="Level II"][data-expanded="true"]')).toBeVisible()
})

Then(/^"([^"]+)" and "([^"]+)" appear in "([^"]+)"$/, async ({ page }, first: string, second: string, level: string) => {
  await expect(page.locator(`[data-level="${level}"]`).getByText(first)).toBeVisible()
  await expect(page.locator(`[data-level="${level}"]`).getByText(second)).toBeVisible()
})

Then('the Track Picker modal stays open', async ({ page }) => {
  await expect(page.getByTestId('track-picker-modal')).toBeVisible()
})

Then(/^both tracks appear in "([^"]+)"$/, async ({ page }, level: string) => {
  await expect(page.locator(`[data-level="${level}"]`).getByText('Thunderous Downpour')).toBeVisible()
  await expect(page.locator(`[data-level="${level}"]`).getByText('Distant Rolling Thunder')).toBeVisible()
})

Then(/^"([^"]+)" appears on both "([^"]+)" and "([^"]+)"$/, async ({ page }, track: string, l1: string, l2: string) => {
  await expect(page.locator(`[data-level="${l1}"]`).getByText(track)).toBeVisible()
  await expect(page.locator(`[data-level="${l2}"]`).getByText(track)).toBeVisible()
})

Then(/^the composition is persisted without tapping "([^"]+)"$/, async ({ page }, _label: string) => {
  await expect(page.locator('[data-level="Level I"]').getByText('Thunderous Downpour')).toBeVisible()
})

Then(/^"([^"]+)" is checked in the picker$/, async ({ page }, trackName: string) => {
  await expect(page.locator(`[data-track-name="${trackName}"]`).getByRole('checkbox')).toBeChecked()
})

Then(/^"([^"]+)" appears in "([^"]+)"$/, async ({ page }, trackName: string, level: string) => {
  await expect(page.locator(`[data-level="${level}"]`).getByText(trackName)).toBeVisible()
})
