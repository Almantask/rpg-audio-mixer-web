import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

Then('I see the title {string}', async ({ page }, title: string) => {
  const heading = page.getByRole('heading', { name: title, exact: true })
  if ((await heading.count()) > 0) {
    await expect(heading).toBeVisible()
    return
  }
  await expect(page.getByText(title, { exact: true })).toBeVisible()
})

Then('I see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle, { exact: true })).toBeVisible()
})

Then('I do not see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle, { exact: true })).toHaveCount(0)
})
