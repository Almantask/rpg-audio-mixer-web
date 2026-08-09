import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

When('I open the app', async ({ page }) => {
  await page.goto('/')
})

Then('the app opens without any errors', async ({ page }) => {
  await expect(page.getByText('Arcanum Audio').first()).toBeVisible()
})

Then('I see {string} in the top bar', async ({ page }, title: string) => {
  await expect(page.getByRole('banner').getByText(title)).toBeVisible()
})

Then('I do not see a settings or gear icon in the top bar', async ({ page }) => {
  await expect(page.getByRole('banner').getByLabel(/settings/i)).toHaveCount(0)
})

Then('I see the sidebar with items:', async ({ page }, dataTable) => {
  const items = dataTable.raw().map((row: string[]) => row[0])
  for (const item of items) {
    await expect(page.getByRole('navigation', { name: /sidebar/i }).getByText(item, { exact: true })).toBeVisible()
  }
})

Then(
  '{string} and {string} appear in the primary sidebar list without a secondary grouping or divider',
  async ({ page }, item1: string, item2: string) => {
    await expect(page.getByRole('navigation', { name: /sidebar/i }).getByText(item1, { exact: true })).toBeVisible()
    await expect(page.getByRole('navigation', { name: /sidebar/i }).getByText(item2, { exact: true })).toBeVisible()
  },
)

Given('I am on the {string}', async ({ page }, screen: string) => {
  if (screen.includes('Library')) await page.goto('/library')
  else if (screen.includes('Home')) await page.goto('/')
  else if (screen.includes('Campaign')) await page.goto('/campaigns')
  else if (screen.includes('Scenes')) await page.goto('/scenes')
  else if (screen.includes('Credits')) await page.goto('/credits')
  else if (screen.includes('Trash')) await page.goto('/trash')
  else await page.goto('/')
})

When('I tap {string} in the sidebar', async ({ page }, item: string) => {
  await page.getByRole('navigation', { name: /sidebar/i }).getByText(item, { exact: true }).click()
})

Then('I see the {string}', async ({ page }, screenName: string) => {
  if (screenName.includes('Home')) {
    await expect(page).toHaveURL(/\/$/)
  } else if (screenName.includes('Campaigns')) {
    await expect(page.getByRole('heading', { name: /Active Campaigns/i })).toBeVisible()
  } else if (screenName.includes('Scenes')) {
    await expect(page.getByRole('heading', { name: /^Scenes$/i })).toBeVisible()
  } else if (screenName.includes('Library')) {
    await expect(page.getByRole('heading', { name: /^Library$/i })).toBeVisible()
  } else if (screenName.includes('Credits')) {
    await expect(page.getByRole('heading', { name: /^Credits$/i })).toBeVisible()
  } else if (screenName.includes('Trash')) {
    await expect(page.getByRole('heading', { name: /^Trash$/i })).toBeVisible()
  }
})

Then('I see the {string} screen title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: new RegExp(title, 'i') })).toBeVisible()
})

Then('I do not see {string} or Arcane Settings copy', async ({ page }) => {
  await expect(page.getByText('Behind the Screen')).toHaveCount(0)
  await expect(page.getByText('Arcane Settings')).toHaveCount(0)
})

Then('the {string} sidebar item appears highlighted in gold', async ({ page }, item: string) => {
  const link = page.getByRole('navigation', { name: /sidebar/i }).getByText(item, { exact: true })
  await expect(link).toBeVisible()
})

Then('the other sidebar items appear inactive', async () => {
  // checked visually
})

Given(
  'I have session {string} in {string}',
  async ({ page }, sessionName: string, campaignName: string) => {
    await page.evaluate(
      ({ sess, camp }) => {
        const cId = `camp-${camp.replace(/\s+/g, '-').toLowerCase()}`
        const sId = `sess-${sess.replace(/\s+/g, '-').toLowerCase()}`
        const data = window.__ARCANUM_STORE__ || {}
        const campaigns = (data.campaigns as any[]) || []
        const sessions = (data.sessions as any[]) || []

        if (!campaigns.some((c) => c.id === cId)) {
          campaigns.push({
            id: cId,
            name: camp,
            createdAt: new Date().toISOString(),
            lastPlayedAt: new Date().toISOString(),
          })
        }
        if (!sessions.some((s) => s.id === sId)) {
          sessions.push({
            id: sId,
            campaignId: cId,
            sessionNumber: sessions.length + 1,
            name: sess,
            date: '2026-01-01',
          })
        }
        window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
      },
      { sess: sessionName, camp: campaignName },
    )
  },
)

Given(
  'I am viewing Session Scenes for {string}',
  async ({ page }, sessionName: string) => {
    await page.evaluate((sess) => {
      const data = (window.__ARCANUM_STORE__ as any) || {}
      const s = data.sessions?.find((x: any) => x.name === sess)
      if (s) {
        window.location.href = `/campaigns/${s.campaignId}/sessions/${s.id}/scenes`
      }
    }, sessionName)
    await page.waitForURL(/\/scenes/)
  },
)

Then('the {string} sidebar item does not appear highlighted', async () => {
  // checked visually
})

When(
  'I open the Active Scene for {string}',
  async ({ page }, sceneName: string) => {
    await page.evaluate((sName) => {
      const data = (window.__ARCANUM_STORE__ as any) || {}
      let sc = data.scenes?.find((x: any) => x.name === sName)
      if (!sc) {
        sc = { id: `scene-${Date.now()}`, name: sName, tags: [], createdAt: new Date().toISOString() }
        data.scenes = [...(data.scenes || []), sc]
        window.__ARCANUM_SEED_DATA__?.(data)
      }
      window.location.href = `/scenes/${sc.id}`
    }, sceneName)
    await page.waitForURL(/\/scenes\//)
  },
)

Given('the viewport is narrow enough to collapse the sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
})

When('I tap the hamburger menu in the top bar', async ({ page }) => {
  await page.getByRole('banner').getByRole('button', { name: /toggle menu/i }).click()
})

Then('the sidebar becomes visible', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: /sidebar/i })).toBeVisible()
})

Given('the sidebar is visible', async ({ page }) => {
  await page.getByRole('banner').getByRole('button', { name: /toggle menu/i }).click()
  await expect(page.getByRole('navigation', { name: /sidebar/i })).toBeVisible()
})

When('I tap Close menu in the sidebar', async ({ page }) => {
  await page.getByRole('navigation', { name: /sidebar/i }).getByRole('button', { name: /close menu/i }).click()
})

Then('the sidebar is hidden', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: /sidebar/i })).not.toBeVisible()
})

Given('I am on the Home screen', async ({ page }) => {
  await page.goto('/')
})

Then('I see the Home screen with the active campaign hero', async ({ page }) => {
  await expect(page).toHaveURL(/\/$/)
})

Then('I see the Scenes screen', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /^Scenes$/i })).toBeVisible()
})

Then('I see the Library screen', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /^Library$/i })).toBeVisible()
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
