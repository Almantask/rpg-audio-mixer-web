import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('I open the app', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

Then('the app opens without any errors', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Arcanum Audio' })).toBeVisible()
  await expect(page.locator('[data-screen]')).toBeVisible()
})
