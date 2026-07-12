import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { openApp } from '../common/interactions'

const { When, Then } = createBdd()

When('I open the app', async ({ page }) => {
  await openApp(page)
})

Then('the app opens without any errors', async ({ page }) => {
  await expect(page.locator('#root')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Arcanum Audio' })).toBeVisible()

  const errors: string[] = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  await page.waitForTimeout(250)
  expect(errors).toEqual([])
})
