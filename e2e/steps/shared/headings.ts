import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

Then('I see the title {string}', async ({ page }, title: string) => {
  await expect(page.getByText(title, { exact: true })).toBeVisible()
})

Then('I see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle, { exact: true })).toBeVisible()
})
