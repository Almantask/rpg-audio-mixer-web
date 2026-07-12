import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  attachTrackToLevel,
  clearSeedData,
  createSoundscapeCategorySeed,
  createTrackSeed,
  setE2EFlags,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

function categoryCard(page: Page, name: string): Locator {
  return page.locator('[data-testid="soundscape-category-card"]', {
    has: page.locator(`[data-category-name="${name}"]`),
  })
}

async function openLibrarySoundscapes(page: Page): Promise<void> {
  await page.goto('/library')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Soundscapes' }).click()
}

// --- Given ---

Given('I am on the Soundscapes tab in the Library', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await openLibrarySoundscapes(page)
})

Given(/^I have created categories "([^"]+)", "([^"]+)", and "([^"]+)"$/, async ({ page }, w: string, i: string, m: string) => {
  await page.goto('/')
  await clearSeedData(page)
  for (const name of [w, i, m]) {
    await createSoundscapeCategorySeed(page, name)
  }
})

Given(
  /^"([^"]+)" has (\d+) tracks at level I, (\d+) at level II, and (\d+) at level III$/,
  async ({ page }, name: string, i: string, ii: string, iii: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const categoryId = await createSoundscapeCategorySeed(page, name)
    const counts = [Number.parseInt(i, 10), Number.parseInt(ii, 10), Number.parseInt(iii, 10)] as const
    for (let level = 1; level <= 3; level += 1) {
      const count = counts[level - 1]
      for (let index = 0; index < count; index += 1) {
        const trackId = await createTrackSeed(page, {
          name: `${name} Track ${level}-${index + 1}`,
          format: 'MP3',
          channel: 'Stereo',
          duration: '3:42',
        })
        await attachTrackToLevel(page, categoryId, level as 1 | 2 | 3, trackId)
      }
    }
  },
)

Given(/^"([^"]+)" is in the soundscape categories grid$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createSoundscapeCategorySeed(page, name)
})

Given('soundscape library data has not yet resolved', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await setE2EFlags(page, { soundscapesLoading: true })
})

Given('I have not created any soundscape categories', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
})

Given(/^"([^"]+)" exists with 0 tracks at all intensity levels$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createSoundscapeCategorySeed(page, name)
})

Given(/^the "([^"]+)" category is previewing a sample track$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createSoundscapeCategorySeed(page, name)
  await openLibrarySoundscapes(page)
  await categoryCard(page, name).getByRole('button', { name: `Preview ${name}` }).click()
})

// --- When ---

When('I open the Soundscapes tab in the Library', async ({ page }) => {
  await openLibrarySoundscapes(page)
})

When(/^I create a soundscape category named "([^"]+)" via Add Soundscape$/, async ({ page }, name: string) => {
  await page.getByTestId('add-soundscape-card').click()
  await page.getByLabel('Category name').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click()
  await page.waitForLoadState('networkidle')
})

When(/^I delete "([^"]+)" from the grid$/, async ({ page }, name: string) => {
  await categoryCard(page, name).getByRole('button', { name: `Delete ${name}` }).click()
})

When(/^I stop the preview on the "([^"]+)" card$/, async ({ page }, name: string) => {
  await categoryCard(page, name).getByRole('button', { name: `Preview ${name}` }).click()
})

// --- Then ---

Then(/^I see "([^"]+)", "([^"]+)", and "([^"]+)" in the grid$/, async ({ page }, w: string, i: string, m: string) => {
  await expect(categoryCard(page, w)).toBeVisible()
  await expect(categoryCard(page, i)).toBeVisible()
  await expect(categoryCard(page, m)).toBeVisible()
})

Then('I see download progress UI', async ({ page }) => {
  await expect(page.getByTestId('download-progress')).toBeVisible()
})

Then('new soundscape categories appear in the grid when the demo pack download completes', async ({ page }) => {
  await expect(page.getByTestId('soundscape-categories-grid').locator('[data-testid="soundscape-category-card"]')).not.toHaveCount(0)
})

Then(/^I see the Soundscape Category Composer for "([^"]+)"$/, async ({ page }, name: string) => {
  await expect(page.getByText('Category Composer')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
})

Then('I see a centred empty-state illustration with a prompt', async ({ page }) => {
  await expect(page.getByTestId('soundscapes-empty-illustration')).toBeVisible()
})

Then(/^I see a "\+ Add Soundscape" tile at the end of the grid$/, async ({ page }) => {
  await expect(page.getByTestId('add-soundscape-card')).toBeVisible()
})

Then(/^I see "([^"]+)" in the grid$/, async ({ page }, name: string) => {
  await expect(categoryCard(page, name)).toBeVisible()
})

Then(/^"([^"]+)" is moved to the Trash Soundscapes tab$/, async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.getByTestId('trash-soundscapes-tab')).toContainText(name)
})

Then(/^"([^"]+)" is no longer in the soundscape categories grid$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-category-name="${name}"]`)).toHaveCount(0)
})

Then(/^the "([^"]+)" card shows a playing preview state on the thumbnail$/, async ({ page }, name: string) => {
  await expect(categoryCard(page, name)).toContainText('● PLAYING')
})

Then('no mini player appears', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toHaveCount(0)
})
