import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { When, Then } = createBdd()

When('I tap {string}', async ({ page }, text: string) => {
  if (text === 'Create Campaign') {
    if (!page.url().includes('/campaigns')) {
      await page.goto('/campaigns')
    }
  }
  const el = page.getByText(text, { exact: false }).first()
  if (await el.isVisible()) {
    await el.click()
  } else {
    await page.getByRole('button', { name: text, exact: false }).first().click()
  }
})

When('I open {string}', async ({ page }, targetName: string) => {
  if (targetName.includes('Session')) {
    const card = page.locator('[data-session-id]').filter({ hasText: targetName.split('–')[0].trim() })
    if (await card.isVisible()) {
      await card.click()
    } else {
      await page.getByText(targetName, { exact: false }).first().click()
    }
  } else {
    await page.goto('/campaigns')
    const card = page.locator('[data-campaign-id]').filter({ hasText: targetName })
    if (await card.isVisible()) {
      await card.getByRole('button', { name: /Start|Resume/ }).click()
    } else {
      const heading = page.getByRole('heading', { name: targetName, exact: true })
      if (await heading.isVisible()) {
        await heading.click()
      } else {
        await page.getByText(targetName, { exact: false }).first().click()
      }
    }
  }
})

Then('I see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
})

Then('I see a {string} card', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
})

Then('I see a {string} button', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText, exact: false }).first()).toBeVisible()
})
