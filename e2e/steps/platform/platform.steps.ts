import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { resetBrowserStorage, seedCampaign, seedSession, seedScene } from '../../helpers/seedHelpers'

const { Given, When, Then } = createBdd()

When('I open the app', async ({ page }) => {
  await page.goto('/')
})

Given('I am on the Library screen', async ({ page }) => {
  await page.goto('/library')
})


Then('the app opens without any errors', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText('Arcanum Audio')).toBeVisible()
})

Then('I see {string} in the top bar', async ({ page }, title: string) => {
  await expect(page.locator('header').getByText(title)).toBeVisible()
})

Then('I do not see a settings or gear icon in the top bar', async ({ page }) => {
  await expect(page.locator('header [aria-label*="settings" i], header [aria-label*="gear" i]')).toHaveCount(0)
})

Then('I see the sidebar with items:', async ({ page }, dataTable: { raw: () => string[][] }) => {
  const items = dataTable.raw().map((row) => row[0])
  for (const item of items) {
    await expect(page.locator('aside nav').getByRole('button', { name: new RegExp(`^${item}$`, 'i') })).toBeVisible()
  }
})

Then('{string} and {string} appear in the primary sidebar list without a secondary grouping or divider', async ({ page }, item1: string, item2: string) => {
  await expect(page.locator('aside nav').getByRole('button', { name: new RegExp(`^${item1}$`, 'i') })).toBeVisible()
  await expect(page.locator('aside nav').getByRole('button', { name: new RegExp(`^${item2}$`, 'i') })).toBeVisible()
  await expect(page.locator('aside nav hr, aside nav .divider')).toHaveCount(0)
})

Given('I am on the {string}', async ({ page }, screenName: string) => {
  if (screenName.includes('Library')) {
    await page.goto('/library')
  } else if (screenName.includes('Campaign')) {
    await page.goto('/campaigns')
  } else if (screenName.includes('Scene')) {
    await page.goto('/scenes')
  } else if (screenName.includes('Trash')) {
    await page.goto('/trash')
  } else if (screenName.includes('Credit')) {
    await page.goto('/credits')
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

Given('I am on the Credits screen', async ({ page }) => {
  await page.goto('/credits')
})

Given('I am on the Trash screen', async ({ page }) => {
  await page.goto('/trash')
})

When('I tap {string} in the sidebar', async ({ page }, item: string) => {
  await page.locator('aside nav').getByRole('button', { name: new RegExp(`^${item}$`, 'i') }).click()
})

Then('I see the {string}', async ({ page }, screenName: string) => {
  if (screenName.includes('Home')) {
    await expect(page).toHaveURL(/\/$/)
  } else if (screenName.includes('Active Campaigns') || screenName.includes('Campaigns')) {
    await expect(page).toHaveURL(/\/campaigns$/)
    await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
  } else if (screenName.includes('Scenes')) {
    await expect(page).toHaveURL(/\/scenes$/)
    await expect(page.getByRole('heading', { name: 'Scenes' })).toBeVisible()
  } else if (screenName.includes('Library')) {
    await expect(page).toHaveURL(/\/library$/)
    await expect(page.getByRole('heading', { name: 'Audio Library' })).toBeVisible()
  } else if (screenName.includes('Trash')) {
    await expect(page).toHaveURL(/\/trash$/)
    await expect(page.getByRole('heading', { name: 'Trash' })).toBeVisible()
  } else if (screenName.includes('Credit')) {
    await expect(page).toHaveURL(/\/credits$/)
    await expect(page.getByRole('heading', { name: 'Credits' })).toBeVisible()
  }
})

Then('I see the Home screen with the active campaign hero', async ({ page }) => {
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
})

Then('I see the Active Campaigns screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/campaigns$/)
  await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
})

Then('I see the Scenes screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/scenes$/)
  await expect(page.getByRole('heading', { name: 'Scenes', exact: true })).toBeVisible()
})

Then('I see the Library screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/library$/)
  await expect(page.getByRole('heading', { name: 'Audio Library', exact: true })).toBeVisible()
})

Then('I see the {string} screen title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
})


Then('I do not see {string} or Arcane Settings copy', async ({ page }, forbidden: string) => {
  await expect(page.getByText(forbidden)).toHaveCount(0)
  await expect(page.getByText(/Arcane Settings/i)).toHaveCount(0)
})

Then('the {string} sidebar item appears highlighted in gold', async ({ page }, item: string) => {
  const btn = page.locator('aside nav').getByRole('button', { name: new RegExp(`^${item}$`, 'i') })
  await expect(btn).toHaveClass(/text-amber-400/)
})

Then('the other sidebar items appear inactive', async ({ page }) => {
  const inactiveButtons = page.locator('aside nav button:not(.text-amber-400)')
  await expect(inactiveButtons).toHaveCount(5)
})

Given('I have session {string} in {string}', async ({ page }, sessionName: string, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
  await seedScene(page, { name: 'Tavern' })
})

Given('I am viewing Session Scenes for {string}', async ({ page }, _sessionName: string) => {
  const data = await page.evaluate(() => {
    const rawC = localStorage.getItem('arcanum_campaigns')
    const rawS = localStorage.getItem('arcanum_sessions')
    const c = rawC ? JSON.parse(rawC)[0] : null
    const s = rawS ? JSON.parse(rawS)[0] : null
    return { cId: c?.id, sId: s?.id }
  })
  await page.goto(`/campaigns/${data.cId}/sessions/${data.sId}/scenes`)
})

Then('the {string} sidebar item does not appear highlighted', async ({ page }, item: string) => {
  const btn = page.locator('aside nav').getByRole('button', { name: new RegExp(`^${item}$`, 'i') })
  await expect(btn).not.toHaveClass(/text-amber-400/)
})

When('I open the Active Scene for {string}', async ({ page }, sceneName: string) => {
  let sc = await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_scenes')
    const list = raw ? JSON.parse(raw) : []
    return list.find((s: { name: string }) => s.name === name)
  }, sceneName)
  if (!sc) {
    const rawS = await page.evaluate(() => localStorage.getItem('arcanum_sessions'))
    const s = rawS ? JSON.parse(rawS)[0] : null
    sc = await seedScene(page, { name: sceneName, sessionId: s?.id })
    await page.reload()
  }
  const isFromSession = page.url().includes('/sessions/')
  const card = page.locator('[data-scene-id]').filter({ hasText: sceneName })
  if (await card.isVisible()) {
    await card.click()
  } else {
    await page.goto(`/scenes/${sc.id}${isFromSession ? '?from=session' : ''}`)
  }
})

Given('the viewport is narrow enough to collapse the sidebar', async ({ page }) => {
  if (page.url() === 'about:blank' || !page.url().includes('localhost')) {
    await page.goto('/')
  }
  await page.setViewportSize({ width: 375, height: 667 })
})

When('I tap the hamburger menu in the top bar', async ({ page }) => {
  await page.getByRole('button', { name: /Open menu/i }).click()
})

Then('the sidebar becomes visible', async ({ page }) => {
  const sidebar = page.locator('aside')
  await expect(sidebar).toHaveClass(/translate-x-0/)
})

Given('the sidebar is visible', async ({ page }) => {
  if (page.url() === 'about:blank' || !page.url().includes('localhost')) {
    await page.goto('/')
  }
  await page.getByRole('button', { name: /Open menu/i }).click()
  const sidebar = page.locator('aside')
  await expect(sidebar).toHaveClass(/translate-x-0/)
})

When('I tap Close menu in the sidebar', async ({ page }) => {
  await page.getByRole('button', { name: /Close menu/i }).click()
})

Then('the sidebar is hidden', async ({ page }) => {
  const sidebar = page.locator('aside')
  await expect(sidebar).toHaveClass(/-translate-x-full/)
})

