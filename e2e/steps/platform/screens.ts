import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

Then('I see the Home screen with the active campaign hero', async ({ page }) => {
  await expect(page.locator('[data-screen="Home screen"]')).toBeVisible()
  await expect(page.getByLabel('Active campaign hero')).toBeVisible()
})

Then('I see the Active Campaigns screen', async ({ page }) => {
  await expect(page.locator('[data-screen="Active Campaigns screen"]')).toBeVisible()
})

Then('I see the Scenes screen', async ({ page }) => {
  await expect(page.locator('[data-screen="Scenes screen"]')).toBeVisible()
})

Then('I see the Library screen', async ({ page }) => {
  await expect(page.locator('[data-screen="Library screen"]')).toBeVisible()
})
