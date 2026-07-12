import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { E2E_TAVERN_SCENE_ID } from '../../../src/lib/constants'

const { Given, When, Then } = createBdd()

const SCREEN_ROUTES: Record<string, string> = {
  'Home screen': '/',
  'Library screen': '/library',
  'Scenes screen': '/scenes',
  'Credits screen': '/credits',
  'Trash screen': '/trash',
  'Active Campaigns screen': '/campaigns',
}

async function goToScreen(page: Page, screenLabel: string) {
  const route = SCREEN_ROUTES[screenLabel]
  if (!route) {
    throw new Error(`Unknown screen: ${screenLabel}`)
  }
  await page.goto(route)
  await page.waitForLoadState('networkidle')
}

Given('I am on the Home screen', async ({ page }) => {
  await goToScreen(page, 'Home screen')
})

Given('I am on the Library screen', async ({ page }) => {
  await goToScreen(page, 'Library screen')
})

Given('I am on the Scenes screen', async ({ page }) => {
  await goToScreen(page, 'Scenes screen')
})

Given('I am on the Credits screen', async ({ page }) => {
  await goToScreen(page, 'Credits screen')
})

Given('I am on the Trash screen', async ({ page }) => {
  await goToScreen(page, 'Trash screen')
})

When('I tap {string} in the sidebar', async ({ page }, item: string) => {
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await navigation.getByRole('link', { name: item, exact: true }).click()
})

When('I open the Active Scene for {string}', async ({ page }, sceneName: string) => {
  if (sceneName === 'Tavern') {
    await page.goto(`/scenes/${E2E_TAVERN_SCENE_ID}/active`)
    return
  }

  await page.getByRole('link', { name: sceneName }).click()
})

Then('I see {string} in the top bar', async ({ page }, text: string) => {
  await expect(page.getByRole('heading', { name: text })).toBeVisible()
})

Then('I do not see a settings or gear icon in the top bar', async ({ page }) => {
  await expect(page.getByRole('button', { name: /settings|gear/i })).toHaveCount(0)
})

Then('I see the sidebar with items:', async ({ page }, dataTable) => {
  const items = dataTable.rows().map((row: string[]) => row[0]?.trim()).filter(Boolean)

  for (const item of items) {
    await expect(page.locator(`[data-sidebar-item="${item}"]`)).toBeVisible()
  }
})

Then(
  '{string} and {string} appear in the primary sidebar list without a secondary grouping or divider',
  async ({ page }, first: string, second: string) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(nav.getByText(first, { exact: true })).toBeVisible()
    await expect(nav.getByText(second, { exact: true })).toBeVisible()
    await expect(page.locator('[data-sidebar-divider]')).toHaveCount(0)
  },
)

Then('I see a static avatar placeholder in the sidebar footer', async ({ page }) => {
  await expect(page.getByLabel('Profile avatar placeholder')).toBeVisible()
})

Then('tapping the avatar placeholder does not navigate anywhere', async ({ page }) => {
  const currentUrl = page.url()
  await page.getByLabel('Profile avatar placeholder').click()
  expect(page.url()).toBe(currentUrl)
})

Then('I see the {string} screen title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible()
})

Then('I do not see {string} or Arcane Settings copy', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
  await expect(page.getByText(/arcane settings/i)).toHaveCount(0)
})

Then(
  'the {string} sidebar item appears highlighted in gold',
  async ({ page }, item: string) => {
    const navigation = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(navigation.getByRole('link', { name: item, exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
)

Then('the other sidebar items appear inactive', async ({ page }) => {
  const inactiveItems = page.locator('[data-sidebar-item][data-active="false"]')
  await expect(inactiveItems).toHaveCount(5)
})

Then('the {string} sidebar item does not appear highlighted', async ({ page }, item: string) => {
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(navigation.getByRole('link', { name: item, exact: true })).not.toHaveAttribute(
    'aria-current',
    'page',
  )
})

Given('the viewport is narrow enough to collapse the sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
})

Given('the sidebar is visible', async ({ page }) => {
  const sidebar = page.getByTestId('sidebar')
  if ((await sidebar.getAttribute('data-sidebar-open')) !== 'true') {
    await page.getByRole('button', { name: 'Open menu' }).click()
  }
  await expect(sidebar).toHaveAttribute('data-sidebar-open', 'true')
})

When('I tap the hamburger menu in the top bar', async ({ page }) => {
  await page.getByRole('button', { name: 'Open menu' }).click()
})

Then('the sidebar becomes visible', async ({ page }) => {
  await expect(page.getByTestId('sidebar')).toHaveAttribute('data-sidebar-open', 'true')
})

Then('the sidebar is hidden', async ({ page }) => {
  await expect(page.getByTestId('sidebar')).toHaveAttribute('data-sidebar-open', 'false')
})
