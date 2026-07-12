import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  assertNoPrimarySidebarDivider,
  assertNoSettingsGearIcon,
  assertOtherSidebarItemsInactive,
  assertSidebarHidden,
  assertSidebarItemHighlighted,
  assertSidebarItemNotHighlighted,
  assertSidebarVisible,
} from '../common/assertions'
import {
  openApp,
  seedE2EData,
  setNarrowViewport,
  tapHamburgerMenu,
  tapSidebarItem,
} from '../common/interactions'
import { SCREEN_PATHS } from '../../../src/lib/navigation'
import {
  E2E_CAMPAIGN_ID,
  E2E_SCENE_TAVERN_ID,
  E2E_SESSION_ID,
  getActiveScenePath,
  getSessionScenesPath,
} from '../../../src/lib/storage/db'
import { assertScreenVisible } from './screens'

const { Given, When, Then } = createBdd()

Then('I see {string} in the top bar', async ({ page }, text: string) => {
  await expect(page.getByRole('heading', { name: text })).toBeVisible()
})

Then('I do not see a settings or gear icon in the top bar', async ({ page }) => {
  await assertNoSettingsGearIcon(page)
})

Then('I see the sidebar with items:', async ({ page }, dataTable) => {
  const items = dataTable.raw().flat()
  const nav = page.getByRole('navigation', { name: 'Primary navigation' })

  for (const item of items) {
    await expect(nav.getByRole('link', { name: item, exact: true })).toBeVisible()
  }
})

Then(
  '{string} and {string} appear in the primary sidebar list without a secondary grouping or divider',
  async ({ page }) => {
    await assertNoPrimarySidebarDivider(page)
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

for (const [screenName, path] of Object.entries(SCREEN_PATHS)) {
  Given(`I am on the ${screenName}`, async ({ page }) => {
    if (screenName === 'Scenes screen') {
      await seedE2EData(page)
    }
    await page.goto(path)
    await page.waitForLoadState('networkidle')
  })
}

When('I tap {string} in the sidebar', async ({ page }, item: string) => {
  await tapSidebarItem(page, item)
})

for (const [screenDescription] of Object.entries({
  'Home screen with the active campaign hero': true,
  'Active Campaigns screen': true,
  'Scenes screen': true,
  'Library screen': true,
})) {
  Then(`I see the ${screenDescription}`, async ({ page }) => {
    await assertScreenVisible(page, screenDescription)
  })
}

Then('I see the {string} screen title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
})

Then('I do not see {string} or Arcane Settings copy', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false })).toHaveCount(0)
  await expect(page.getByText(/arcane settings/i)).toHaveCount(0)
})

Then(
  'the {string} sidebar item appears highlighted in gold',
  async ({ page }, item: string) => {
    await assertSidebarItemHighlighted(page, item)
  },
)

Then('the other sidebar items appear inactive', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' })
  const activeItem = await nav.locator('[data-sidebar-active="true"]').getAttribute('data-sidebar-item')
  if (!activeItem) {
    throw new Error('No active sidebar item found')
  }
  await assertOtherSidebarItemsInactive(page, activeItem)
})

Then(
  'the {string} sidebar item does not appear highlighted',
  async ({ page }, item: string) => {
    await assertSidebarItemNotHighlighted(page, item)
  },
)

Given(
  'I am viewing the Session Scenes list for {string}',
  async ({ page }, campaignName: string) => {
    await seedE2EData(page)
    await page.goto(getSessionScenesPath(E2E_CAMPAIGN_ID, E2E_SESSION_ID))
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(campaignName)).toBeVisible()
  },
)

When('I open the Active Scene for {string}', async ({ page }, sceneName: string) => {
  await seedE2EData(page)
  await page.goto('/scenes')
  await page.waitForLoadState('networkidle')
  await page.getByRole('link', { name: sceneName, exact: true }).click()
  await page.waitForURL(`**${getActiveScenePath(E2E_SCENE_TAVERN_ID)}`)
})

Given('the viewport is narrow enough to collapse the sidebar', async ({ page }) => {
  await setNarrowViewport(page)
  await openApp(page)
})

Given('the sidebar is visible', async ({ page }) => {
  await tapHamburgerMenu(page)
  await assertSidebarVisible(page)
})

When('I tap the hamburger menu in the top bar', async ({ page }) => {
  await tapHamburgerMenu(page)
})

Then('the sidebar becomes visible', async ({ page }) => {
  await assertSidebarVisible(page)
})

Then('the sidebar is hidden', async ({ page }) => {
  await assertSidebarHidden(page)
})
