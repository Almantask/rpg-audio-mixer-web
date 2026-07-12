import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  clearSeedData,
  createFxTrackSeed,
  getFxTrackIdByName,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function softDeleteFx(page: import('@playwright/test').Page, name: string): Promise<void> {
  const id = await getFxTrackIdByName(page, name)
  await page.evaluate(async (fxId) => {
    await window.__arcanumSoftDeleteFx?.(fxId)
  }, id)
}

Given(/^"([^"]+)" is in Trash$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createFxTrackSeed(page, { name })
  await softDeleteFx(page, name)
})

Given(/^the "([^"]+)" tab contains "([^"]+)" and "([^"]+)"$/, async ({ page }, tab: string, a: string, b: string) => {
  await page.goto('/')
  await clearSeedData(page)
  if (tab === 'FX') {
    await createFxTrackSeed(page, { name: a })
    await createFxTrackSeed(page, { name: b })
    await softDeleteFx(page, a)
    await softDeleteFx(page, b)
  }
})

Given(/^I have selected "([^"]+)" and "([^"]+)"$/, async ({ page }, a: string, b: string) => {
  await page.goto('/trash')
  await page.getByRole('tab', { name: 'FX' }).click()
  await page.locator(`[data-trash-item-name="${a}"]`).getByTestId('trash-item-checkbox').check()
  await page.locator(`[data-trash-item-name="${b}"]`).getByTestId('trash-item-checkbox').check()
})

When(/^I select "([^"]+)" and "([^"]+)" on the "([^"]+)" tab$/, async ({ page }, a: string, b: string, tab: string) => {
  await page.goto('/trash')
  await page.getByRole('tab', { name: tab }).click()
  await page.locator(`[data-trash-item-name="${a}"]`).getByTestId('trash-item-checkbox').check()
  await page.locator(`[data-trash-item-name="${b}"]`).getByTestId('trash-item-checkbox').check()
})

When(/^I tap "Select all \((\d+)\)" on the "([^"]+)" tab$/, async ({ page }, _count: string, tab: string) => {
  await page.goto('/trash')
  await page.getByRole('tab', { name: tab }).click()
  await page.getByTestId('trash-select-all').check()
})

When(/^I tap "Restore" on the "([^"]+)" card$/, async ({ page }, name: string) => {
  await page.locator(`[data-trash-item-name="${name}"]`).getByRole('button', { name: 'Restore' }).click()
})

When(/^I tap "Purge" on the "([^"]+)" card and confirm the destructive action$/, async ({ page }, name: string) => {
  await page.locator(`[data-trash-item-name="${name}"]`).getByRole('button', { name: 'Purge' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
})

When(/^I tap "Empty Trash" and confirm the destructive action$/, async ({ page }) => {
  await page.getByTestId('trash-empty-tab').click()
  await page.getByRole('button', { name: 'Confirm' }).click()
})

When(/^I tap "Purge Selected" and confirm the destructive action$/, async ({ page }) => {
  await page.getByRole('button', { name: 'Purge Selected' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
})

When(/^I tap "Restore All" and confirm the restore action$/, async ({ page }) => {
  await page.getByTestId('trash-restore-all').click()
  await page.getByRole('button', { name: 'Confirm' }).click()
})

When(/^I open the "([^"]+)" tab on the Trash screen$/, async ({ page }, tab: string) => {
  await page.goto('/trash')
  await page.getByRole('tab', { name: tab }).click()
})

Then('I see a selection bar showing {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('trash-selection-bar')).toContainText(text)
})

Then(/^I see "Restore Selected" and "Purge Selected" actions$/, async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Restore Selected' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Purge Selected' })).toBeVisible()
})

Then(/^all (\d+) scene cards are selected$/, async ({ page }, count: string) => {
  await expect(page.getByTestId('trash-item-checkbox')).toHaveCount(Number.parseInt(count, 10))
})

Then(/^"([^"]+)" is permanently deleted$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-trash-item-name="${name}"]`)).toHaveCount(0)
})

Then(/^"([^"]+)" and "([^"]+)" are removed from Trash$/, async ({ page }, a: string, b: string) => {
  await expect(page.locator(`[data-trash-item-name="${a}"]`)).toHaveCount(0)
  await expect(page.locator(`[data-trash-item-name="${b}"]`)).toHaveCount(0)
})

Then(/^I do not see "([^"]+)" on the "([^"]+)" tab$/, async ({ page }, name: string, tab: string) => {
  await page.getByRole('tab', { name: tab }).click()
  await expect(page.locator(`[data-trash-item-name="${name}"]`)).toHaveCount(0)
})

Then(/^"([^"]+)" remains on the "([^"]+)" tab$/, async ({ page }, name: string, tab: string) => {
  await page.getByRole('tab', { name: tab }).click()
  await expect(page.locator(`[data-trash-item-name="${name}"]`)).toBeVisible()
})

Then(/^the "([^"]+)" tab shows the "([^"]+)" empty state$/, async ({ page }, tab: string, headline: string) => {
  await page.getByRole('tab', { name: tab }).click()
  await expect(page.getByTestId('trash-empty-state')).toContainText(headline)
})

Then(/^I see a summary toast "([^"]+)"$/, async ({ page }, message: string) => {
  await expect(page.getByText(message)).toBeVisible()
})
