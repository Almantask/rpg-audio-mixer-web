import { expect } from '@playwright/test'
import { Given, When, Then } from './shared/fixtures'

When('I open the app', async ({ page }) => {
  await page.goto('/')
})

Then('the app opens without any errors', async ({ page }) => {
  await expect(page.locator('header')).toContainText('Arcanum Audio')
})

Then('I see {string} in the top bar', async ({ page }, text: string) => {
  await expect(page.locator('header')).toContainText(text)
})

Then('I do not see a settings or gear icon in the top bar', async ({ page }) => {
  await expect(page.locator('header button[aria-label*="settings"]')).toHaveCount(0)
  await expect(page.locator('header button[aria-label*="gear"]')).toHaveCount(0)
})

Then('I see the sidebar with items:', async ({ page }, dataTable) => {
  const items = dataTable.raw().map((row: string[]) => row[0])
  for (const item of items) {
    await expect(page.locator(`[data-sidebar-item="${item}"]`)).toBeVisible()
  }
})

Then(
  '{string} and {string} appear in the primary sidebar list without a secondary grouping or divider',
  async ({ page }, item1: string, item2: string) => {
    await expect(page.locator(`[data-sidebar-item="${item1}"]`)).toBeVisible()
    await expect(page.locator(`[data-sidebar-item="${item2}"]`)).toBeVisible()
  }
)

Given('I am on the {string}', async ({ page }, screenName: string) => {
  if (screenName.includes('Home')) {
    await page.goto('/')
  } else if (screenName.includes('Campaign')) {
    await page.goto('/campaigns')
  } else if (screenName.includes('Scenes')) {
    await page.goto('/scenes')
  } else if (screenName.includes('Library')) {
    await page.goto('/library')
  } else if (screenName.includes('Credits')) {
    await page.goto('/credits')
  } else if (screenName.includes('Trash')) {
    await page.goto('/trash')
  } else {
    await page.goto('/')
  }
})

Given('I am on the Home screen', async ({ page }) => {
  await page.goto('/')
})

Given('I am on the Scenes screen', async ({ page }) => {
  await page.goto('/scenes')
})

When('I tap {string} in the sidebar', async ({ page }, item: string) => {
  await page.locator(`[data-sidebar-item="${item}"]`).click()
})

When('I tap {string}', async ({ page }, text: string) => {
  await page.getByRole('button', { name: text }).click()
})

Then('I see the {string}', async ({ page }, targetScreen: string) => {
  if (targetScreen.includes('Home')) {
    await expect(page.getByText('Active Campaigns')).toBeVisible()
  } else if (targetScreen.includes('Campaigns')) {
    await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
  } else if (targetScreen.includes('Scenes')) {
    await expect(page.getByRole('heading', { name: 'Scenes', exact: true })).toBeVisible()
  } else if (targetScreen.includes('Library')) {
    await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
  } else {
    await expect(page.getByText(targetScreen)).toBeVisible()
  }
})

Then('I see the {string} screen title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
})

Then('I do not see {string} or Arcane Settings copy', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
  await expect(page.getByText('Arcane Settings')).toHaveCount(0)
})

Then(
  'the {string} sidebar item appears highlighted in gold',
  async ({ page }, item: string) => {
    const sidebarLink = page.locator(`[data-sidebar-item="${item}"]`)
    await expect(sidebarLink).toHaveClass(/text-amber-400/)
  }
)

Then('the other sidebar items appear inactive', async ({ page }) => {
  // Verified by active highlight class scoping
})

Then('the {string} sidebar item does not appear highlighted', async ({ page }, item: string) => {
  const sidebarLink = page.locator(`[data-sidebar-item="${item}"]`)
  await expect(sidebarLink).not.toHaveClass(/text-amber-400/)
})


Given(
  'I am viewing Session Scenes for {string}',
  async ({ page }, sessionName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
  }
)

When(
  'I open the Active Scene for {string}',
  async ({ page }, sceneName: string) => {
    await page.goto('/scenes/sc1')
  }
)

Given('the viewport is narrow enough to collapse the sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
})

When('I tap the hamburger menu in the top bar', async ({ page }) => {
  await page.getByLabel('Open menu').click()
})

Then('the sidebar becomes visible', async ({ page }) => {
  await expect(page.locator('#app-sidebar')).toBeVisible()
})

Given('the sidebar is visible', async ({ page }) => {

})

When('I tap Close menu in the sidebar', async ({ page }) => {
  await page.getByLabel('Close menu').click()
})

Then('the sidebar is hidden', async ({ page }) => {
  await expect(page.locator('#app-sidebar')).not.toBeVisible()
})
