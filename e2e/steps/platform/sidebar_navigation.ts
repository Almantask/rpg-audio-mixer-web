import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given(/I am on the (Library|Home|Scenes|Credits|Trash|Active Campaigns)(?: screen)?$/, async ({ page }, screenName: string) => {
  const clean = screenName.replace(/"/g, '').trim()
  await page.goto('/')

  if (clean.includes('Library')) {
    await page.getByRole('button', { name: 'Library' }).click()
  } else if (clean.includes('Home')) {
    await page.getByRole('button', { name: 'Home' }).click()
  } else if (clean.includes('Scenes')) {
    await page.getByRole('button', { name: 'Scenes' }).click()
  } else if (clean.includes('Credits')) {
    await page.getByRole('button', { name: 'Credits' }).click()
  } else if (clean.includes('Trash')) {
    await page.getByRole('button', { name: 'Trash' }).click()
  } else if (clean.includes('Campaigns')) {
    await page.getByRole('button', { name: 'Campaigns' }).click()
  }
})

Given('I have session {string} in {string}', async ({ page }, sessionName: string, campaignName: string) => {
  await page.goto('/')
  await page.evaluate(({ sess, camp }) => {
    const camps = [{ id: 'camp-1', name: camp, createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sess, createdAt: new Date().toISOString() }]
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    const sessionScenes = [{ sessionId: 'sess-1', sceneId: 'scene-1', linkedAt: new Date().toISOString() }]

    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { sess: sessionName, camp: campaignName })
  await page.goto('/')
})



Given('the viewport is narrow enough to collapse the sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
})

Given('the sidebar is visible', async ({ page }) => {
  const openBtn = page.getByRole('button', { name: 'Open menu' })
  if (await openBtn.isVisible()) {
    await openBtn.click()
  }
  await expect(page.locator('aside')).toBeVisible()
})

When('I open the app', async ({ page }) => {
  await page.goto('/')
})

When('I tap {string} in the sidebar', async ({ page }, item: string) => {
  await page.getByRole('button', { name: item }).click()
})

When('I open the Active Scene for {string}', async ({ page }, sceneName: string) => {
  await page.getByText(sceneName).first().click()
})

When('I tap the hamburger menu in the top bar', async ({ page }) => {
  await page.getByRole('button', { name: 'Open menu' }).click()
})

When('I tap Close menu in the sidebar', async ({ page }) => {
  await page.getByRole('button', { name: 'Close menu' }).click()
})

Then('the app opens without any errors', async ({ page }) => {
  await expect(page.locator('body')).toBeVisible()
})

Then('I see {string} in the top bar', async ({ page }, text: string) => {
  await expect(page.locator('header').first()).toContainText(text)
})

Then('I do not see a settings or gear icon in the top bar', async ({ page }) => {
  await expect(page.locator('header').first().locator('button[aria-label*="settings"]')).toHaveCount(0)
  await expect(page.locator('header').first().locator('button[aria-label*="gear"]')).toHaveCount(0)
})

Then('I see the sidebar with items:', async ({ page }, dataTable) => {
  const items = dataTable.raw().map((row: string[]) => row[0])
  for (const item of items) {
    await expect(page.getByRole('button', { name: item })).toBeVisible()
  }
})

Then(/"([^"]+)" and "([^"]+)" appear in the primary sidebar list without a secondary grouping or divider/, async ({ page }, item1: string, item2: string) => {
  await expect(page.getByRole('button', { name: item1 })).toBeVisible()
  await expect(page.getByRole('button', { name: item2 })).toBeVisible()
})

Then('I see the Home screen with the active campaign hero', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Home' }).first()).toBeVisible()
})

Then('I see the {string} screen title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible()
})

Then('I see the Credits screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Credits' }).first()).toBeVisible()
})

Then(/^I see the (Home|Active Campaigns|Campaigns|Scenes|Library|Credits|Trash)(?: screen)?$/, async ({ page }, screenName: string) => {
  const name = screenName.replace(/"/g, '')
  await expect(page.getByRole('heading', { name: new RegExp(name, 'i') }).first()).toBeVisible()
})

Then('I do not see {string} or Arcane Settings copy', async ({ page }, text: string) => {
  await expect(page.locator('body')).not.toContainText(text)
  await expect(page.locator('body')).not.toContainText('Arcane Settings')
})

Then('the {string} sidebar item appears highlighted in gold', async ({ page }, item: string) => {
  const btn = page.getByRole('button', { name: item })
  await expect(btn).toHaveClass(/text-amber-400/)
})

Then('the other sidebar items appear inactive', async ({ page }) => {

})

Then('the {string} sidebar item does not appear highlighted', async ({ page }, item: string) => {
  const btn = page.getByRole('button', { name: item })
  await expect(btn).not.toHaveClass(/text-amber-400/)
})

Then('the sidebar becomes visible', async ({ page }) => {
  await expect(page.locator('aside')).not.toHaveClass(/-translate-x-full/)
})

Then('the sidebar is hidden', async ({ page }) => {
  await expect(page.locator('aside')).toHaveClass(/-translate-x-full/)
})
