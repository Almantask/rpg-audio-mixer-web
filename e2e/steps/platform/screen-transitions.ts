import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { SCREEN_PATHS } from '../../../src/lib/navigation'
import { createFxTrackSeed } from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function openFxLibrary(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/library')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
}

Given('no mini player is visible', async ({ page }) => {
  await page.goto(SCREEN_PATHS['Library screen'])
  await expect(page.getByTestId('fx-mini-player')).toHaveCount(0)
})

Given('the mini player is visible', async ({ page }) => {
  await page.goto('/')
  await createFxTrackSeed(page, { name: 'Preview Track' })
  await openFxLibrary(page)
  await page.locator('[data-testid="fx-track-card"]').first().getByTestId('fx-track-body').click()
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

When('I tap preview on an FX track', async ({ page }) => {
  await page.locator('[data-testid="fx-track-card"]').first().getByTestId('fx-track-body').click()
})

When('I tap the close button', async ({ page }) => {
  await page.getByTestId('mini-player-close').click()
})

When('I navigate away from the current screen', async ({ page }) => {
  await page.getByRole('link', { name: 'Scenes', exact: true }).click()
})

Then('the Home screen content is no longer visible', async ({ page }) => {
  await expect(page.getByTestId('home-campaign-hero')).toHaveCount(0)
})

Then(
  'I can interact with the Scenes screen immediately after the transition completes',
  async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Scene' })).toBeEnabled()
  },
)

Then('the transition completes without blocking interaction', async ({ page }) => {
  await expect(page.getByRole('button').first()).toBeEnabled()
})

Then('the mini player is visible at the bottom of the main content area', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})
