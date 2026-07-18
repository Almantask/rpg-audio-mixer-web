import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import { setE2EControls } from '../shared/test-data'

const { Given, When, Then } = createBdd()

async function openAttributionsPage(page: import('@playwright/test').Page) {
  await page.goto('/credits/attributions')
  await page.waitForLoadState('networkidle')
}

Given('the Attributions content is still loading', async ({ page }) => {
  await setE2EControls(page, { attributionsState: 'loading' })
})

Given('the Attributions content failed to load', async ({ page }) => {
  await setE2EControls(page, { attributionsState: 'error' })
})

When('I open the Attributions page', async ({ page }) => {
  await openAttributionsPage(page)
})

When('I tap "Buy the Devs a Coffee" on the Credits screen', async ({ page }) => {
  await page.goto('/credits')
  await page.waitForLoadState('networkidle')
  const popupPromise = page.waitForEvent('popup')
  await page.locator('[data-buy-coffee]').click()
  await popupPromise
})

When('I tap "Leave a Review" on the Credits screen', async ({ page }) => {
  await page.goto('/credits')
  await page.waitForLoadState('networkidle')
  const popupPromise = page.waitForEvent('popup')
  await page.locator('[data-leave-review]').click()
  await popupPromise
})

When('I tap retry', async ({ page }) => {
  await page.locator('[data-attributions-retry]').click()
})

Then('the tip or donation URL opens in a new browser tab', async ({ context }) => {
  const pages = context.pages()
  expect(pages.length).toBeGreaterThan(1)
  const popup = pages[pages.length - 1]
  await expect(popup).toHaveURL(/^https?:\/\//)
})

Then('the review URL opens in a new browser tab', async ({ context }) => {
  const pages = context.pages()
  expect(pages.length).toBeGreaterThan(1)
  const popup = pages[pages.length - 1]
  await expect(popup).toHaveURL(/^https?:\/\//)
})

Then('I see the sound library attributions section', async ({ page }) => {
  await expect(page.locator('[data-sound-library-attributions]')).toBeVisible()
})

Then('I see the open-source licenses section', async ({ page }) => {
  await expect(page.locator('[data-open-source-licenses]')).toBeVisible()
})

Then('I see skeleton placeholders for the attribution sections', async ({ page }) => {
  await expect(page.locator('[data-attributions-skeleton]')).toBeVisible()
})

Then('I see an inline error message', async ({ page }) => {
  await expect(page.locator('[data-attributions-error]')).toBeVisible()
})

Then('I see a retry control', async ({ page }) => {
  await expect(page.locator('[data-attributions-retry]')).toBeVisible()
})
