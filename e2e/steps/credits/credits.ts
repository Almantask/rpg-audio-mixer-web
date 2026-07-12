import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { setE2EFlags } from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

When('I open the Attributions page', async ({ page }) => {
  await page.goto('/credits/attributions')
  await page.waitForLoadState('networkidle')
})

When('I tap retry', async ({ page }) => {
  await page.getByRole('button', { name: 'Retry' }).click()
})

When(/^I tap "Buy the Devs a Coffee" on the Credits screen$/, async ({ page }) => {
  await page.goto('/credits')
  await page.getByRole('link', { name: /buy the devs a coffee/i }).click()
})

When(/^I tap "Leave a Review" on the Credits screen$/, async ({ page }) => {
  await page.goto('/credits')
  await page.getByRole('link', { name: /leave a review/i }).click()
})

Given('the Attributions content is still loading', async ({ page }) => {
  await page.goto('/')
  await setE2EFlags(page, { attributionsLoading: true })
})

Given('the Attributions content failed to load', async ({ page }) => {
  await page.goto('/')
  await setE2EFlags(page, { attributionsLoadFail: true })
})

Then('I see the sound library attributions section', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sound library attributions' })).toBeVisible()
})

Then('I see the open-source licenses section', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Open-source licenses' })).toBeVisible()
})

Then('I see skeleton placeholders for the attribution sections', async ({ page }) => {
  await expect(page.getByTestId('attributions-skeleton')).toBeVisible()
})

Then('I see an inline error message', async ({ page }) => {
  await expect(page.getByRole('alert')).toBeVisible()
})

Then('I see a retry control', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

Then('the tip or donation URL opens in a new browser tab', async ({ context }) => {
  const popup = await context.waitForEvent('page')
  expect(popup.url()).toContain('buymeacoffee.com')
})

Then('the review URL opens in a new browser tab', async ({ context }) => {
  const popup = await context.waitForEvent('page')
  expect(popup.url()).toContain('example.com/review')
})
