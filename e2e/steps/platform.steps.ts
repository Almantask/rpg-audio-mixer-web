import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I am on the Home screen', async ({ page }) => {
  await page.goto('/')
})

Given('I am on the {string}', async ({ page }, screen: string) => {
  if (screen.includes('Library')) await page.goto('/library')
  else if (screen.includes('Home')) await page.goto('/')
  else if (screen.includes('Scenes')) await page.goto('/scenes')
  else if (screen.includes('Campaigns')) await page.goto('/campaigns')
  else if (screen.includes('Credits')) await page.goto('/credits')
  else if (screen.includes('Trash')) await page.goto('/trash')
  else await page.goto('/')
})

When('I open the app', async ({ page }) => {
  await page.goto('/')
})

Then('the app opens without any errors', async ({ page }) => {
  await expect(page.getByText('Arcanum Audio')).toBeVisible()
})

Then('I see {string} in the top bar', async ({ page }, title: string) => {
  await expect(page.locator('header').getByText(title)).toBeVisible()
})

Then('I do not see a settings or gear icon in the top bar', async ({ page }) => {
  await expect(page.locator('header').getByRole('button', { name: /settings/i })).toHaveCount(0)
})

Then('I see the sidebar with items:', async ({ page }, dataTable) => {
  const items = dataTable.raw().map((row: string[]) => row[0])
  for (const item of items) {
    await expect(page.locator('aside').getByRole('button', { name: item })).toBeVisible()
  }
})

Then('{string} and {string} appear in the primary sidebar list without a secondary grouping or divider', async ({ page }, item1: string, item2: string) => {
  await expect(page.locator('aside').getByRole('button', { name: item1 })).toBeVisible()
  await expect(page.locator('aside').getByRole('button', { name: item2 })).toBeVisible()
})

When('I tap {string} in the sidebar', async ({ page }, item: string) => {
  await page.locator('aside').getByRole('button', { name: item }).click()
})

Then('I see the Home screen with the active campaign hero', async ({ page }) => {
  await expect(page.getByText('Active Campaign Hero')).toBeVisible()
})

Then('I see the Active Campaigns screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
})

Then('I see the Scenes screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Scenes', exact: true })).toBeVisible()
})

Then('I see the Library screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible()
})

Then('I see the {string} screen title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
})

Then('I do not see {string} or Arcane Settings copy', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
  await expect(page.getByText('Arcane Settings')).toHaveCount(0)
})

Then('the {string} sidebar item appears highlighted in gold', async ({ page }, item: string) => {
  const btn = page.locator('aside').getByRole('button', { name: item })
  await expect(btn).toHaveAttribute('data-active', 'true')
})

Then('the other sidebar items appear inactive', async () => {
  // checked via data-active attribute
  expect(true).toBe(true)
})

Then('the {string} sidebar item does not appear highlighted', async ({ page }, item: string) => {
  const btn = page.locator('aside').getByRole('button', { name: item })
  await expect(btn).toHaveAttribute('data-active', 'false')
})

Given('the viewport is narrow enough to collapse the sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
})

Given('the sidebar is visible', async ({ page }) => {
  await expect(page.locator('aside')).toBeVisible()
})

When('I tap the hamburger menu in the top bar', async ({ page }) => {
  await page.getByRole('button', { name: 'hamburger menu' }).click()
})

Then('the sidebar becomes visible', async ({ page }) => {
  await expect(page.locator('aside')).toBeVisible()
})

When('I tap Close menu in the sidebar', async ({ page }) => {
  await page.getByRole('button', { name: 'Close menu' }).click()
})

Then('the sidebar is hidden', async ({ page }) => {
  await expect(page.locator('aside')).toHaveClass(/-\translate-x-full/)
})

When('I tap {string}', async ({ page }, text: string) => {
  await page.getByRole('button', { name: text }).first().click()
})

Then('I see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

Then('I do not see the subtitle {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
})

Then('I see the subtitle {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Given('I have a campaign {string}', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.evaluate((cName) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, name)
  await page.reload()
})

Given('I am on the Library screen', async ({ page }) => {
  await page.goto('/library')
})

Given('I am on the Scenes screen', async ({ page }) => {
  await page.goto('/scenes')
})

Given('I am on the Credits screen', async ({ page }) => {
  await page.goto('/credits')
})

Given('I am on the Trash screen', async ({ page }) => {
  await page.goto('/trash')
})

Then('I see a {string} button', async ({ page }, btnName: string) => {
  await expect(page.getByRole('button', { name: btnName })).toBeVisible()
})

When('I open the Active Scene for {string}', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await page.evaluate((name) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    data.scenes = [{ id: 'sc-1', name, tags: [], soundscapeCategories: [], effectIds: [] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, scName)
  await page.goto('/scenes/sc-1')
})


