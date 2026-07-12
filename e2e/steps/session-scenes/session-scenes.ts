import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { getSessionScenesPath } from '../../../src/lib/storage/db'
import {
  clearSeedData,
  createCampaignSeed,
  createSceneSeed,
  createSessionSeed,
  getCampaignIdByName,
  getSceneIdByName,
  getSessionIdByLabel,
  linkSceneToSession,
  setSessionSceneLastPlayed,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

function sceneCard(page: Page, name: string): Locator {
  return page.locator('[data-testid="scene-card"]', {
    has: page.locator(`[data-scene-name="${name}"]`),
  })
}

async function swipeRight(locator: Locator): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Unable to swipe: element has no bounding box')
  const startX = box.x + 20
  const endX = box.x + box.width - 20
  const y = box.y + box.height / 2
  await locator.dispatchEvent('pointerdown', { clientX: startX, clientY: y, pointerId: 1, pointerType: 'touch' })
  await locator.dispatchEvent('pointerup', { clientX: endX, clientY: y, pointerId: 1, pointerType: 'touch' })
}

async function ensureSession(
  page: Page,
  sessionLabel: string,
  campaignName: string,
  sessionName?: string,
): Promise<{ campaignId: string; sessionId: string }> {
  await page.goto('/')
  await clearSeedData(page)
  const campaignId = await createCampaignSeed(page, { name: campaignName })
  const number = Number.parseInt(sessionLabel.replace('Session ', ''), 10)
  const sessionId = await createSessionSeed(page, {
    campaignId,
    name: sessionName ?? sessionLabel,
    number,
  })
  return { campaignId, sessionId }
}

async function openSession(
  page: Page,
  campaignId: string,
  sessionId: string,
): Promise<void> {
  await page.goto(getSessionScenesPath(campaignId, sessionId))
  await page.waitForLoadState('networkidle')
}

// --- Given ---

Given(/^I have session "([^"]+)"$/, async ({ page }, sessionTitle: string) => {
  const match = sessionTitle.match(/^Session (\d+) – (.+)$/)
  const number = match ? Number.parseInt(match[1], 10) : 14
  const name = match ? match[2] : sessionTitle
  await page.goto('/')
  await clearSeedData(page)
  const campaignId = await createCampaignSeed(page, { name: 'Echoes of the Void' })
  await createSessionSeed(page, { campaignId, name, number })
})

Given(
  /^I am viewing Session Scenes for "([^"]+)" in campaign "([^"]+)"$/,
  async ({ page }, sessionLabel: string, campaignName: string) => {
    const { campaignId, sessionId } = await ensureSession(page, sessionLabel, campaignName)
    await openSession(page, campaignId, sessionId)
  },
)

Given(
  /^I am viewing Session Scenes for "([^"]+)"$/,
  async ({ page }, sessionLabel: string) => {
    const { campaignId, sessionId } = await ensureSession(page, sessionLabel, 'Curse of Strahd')
    await openSession(page, campaignId, sessionId)
  },
)

Given(
  /^I opened "([^"]+)" from the sessions list for "([^"]+)"$/,
  async ({ page }, sessionLabel: string, campaignName: string) => {
    const { campaignId } = await ensureSession(page, sessionLabel, campaignName)
    const campaignSessionsPath = `/campaigns/${campaignId}/sessions`
    await page.goto(campaignSessionsPath)
    await page.waitForLoadState('networkidle')
    await page.getByTestId('session-card').first().click()
    await page.waitForLoadState('networkidle')
  },
)

Given(
  /^I have a session "([^"]+)" with no scenes$/,
  async ({ page }, sessionLabel: string) => {
    await ensureSession(page, sessionLabel, 'Curse of Strahd')
  },
)

Given(/^"([^"]+)" is linked to "([^"]+)"$/, async ({ page }, sceneName: string, sessionLabel: string) => {
  const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
  const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
  let sceneId = await page.evaluate(async (name) => window.__arcanumGetSceneIdByName?.(name), sceneName)
  if (!sceneId) {
    sceneId = await createSceneSeed(page, { name: sceneName })
  }
  await linkSceneToSession(page, sessionId, sceneId)
})

Given(
  /^"([^"]+)" has (\d+) soundscape categories and (\d+) effects$/,
  async ({ page }, sceneName: string, sc: string, fx: string) => {
    const sceneId = await getSceneIdByName(page, sceneName)
    await page.evaluate(
      async ({ id, scCount, fxCount }) => {
        const { db } = await import('../../../src/lib/storage/db')
        await db.scenes.update(id, {
          soundscapeCategoryCount: scCount,
          effectCount: fxCount,
        })
      },
      { id: sceneId, scCount: Number.parseInt(sc, 10), fxCount: Number.parseInt(fx, 10) },
    )
  },
)

Given(
  /^"([^"]+)" and "([^"]+)" are linked to "([^"]+)"$/,
  async ({ page }, first: string, second: string, sessionLabel: string) => {
    const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
    const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
    for (const name of [first, second]) {
      const sceneId = await createSceneSeed(page, { name })
      await linkSceneToSession(page, sessionId, sceneId)
    }
  },
)

Given(
  /^"([^"]+)", "([^"]+)", and "([^"]+)" are linked to "([^"]+)"$/,
  async ({ page }, t: string, f: string, d: string, sessionLabel: string) => {
    const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
    const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
    for (const name of [t, f, d]) {
      const sceneId = await createSceneSeed(page, { name })
      await linkSceneToSession(page, sessionId, sceneId)
    }
  },
)

Given(
  /^I most recently played "([^"]+)" in "([^"]+)"$/,
  async ({ page }, sceneName: string, sessionLabel: string) => {
    const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
    const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
    const sceneId = await getSceneIdByName(page, sceneName)
    await setSessionSceneLastPlayed(page, sessionId, sceneId, Date.now())
  },
)

Given(
  /^I previously played "([^"]+)" before "([^"]+)" in "([^"]+)"$/,
  async ({ page }, earlier: string, later: string, sessionLabel: string) => {
    const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
    const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
    const earlierId = await getSceneIdByName(page, earlier)
    const laterId = await getSceneIdByName(page, later)
    await setSessionSceneLastPlayed(page, sessionId, laterId, Date.now())
    await setSessionSceneLastPlayed(page, sessionId, earlierId, Date.now() - 86_400_000)
  },
)

Given(/^I have scenes (.+) in Scenes$/, async ({ page }, scenesText: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const names = scenesText.replace(/"/g, '').split(',').map((s) => s.trim()).filter(Boolean)
  for (const name of names) {
    await createSceneSeed(page, { name })
  }
})

Given(/^I have a scene "([^"]+)" in Scenes that is not linked to "([^"]+)"$/, async ({ page }, sceneName: string, _session: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const campaignId = await createCampaignSeed(page, { name: 'Curse of Strahd' })
  await createSessionSeed(page, { campaignId, name: 'Session 1', number: 1 })
  await createSceneSeed(page, { name: sceneName })
})

Given(/^all global scenes are linked to "([^"]+)"$/, async ({ page }, sessionLabel: string) => {
  const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
  const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
  const sceneId = await createSceneSeed(page, { name: 'Only Scene' })
  await linkSceneToSession(page, sessionId, sceneId)
})

// --- When ---

When(/^I open that session$/, async ({ page }) => {
  const paths = await page.evaluate(async () => {
    const { db, getSessionScenesPath } = await import('../../../src/lib/storage/db')
    const session = await db.sessions.filter((item) => !item.deletedAt).first()
    const campaign = session ? await db.campaigns.get(session.campaignId) : undefined
    return session && campaign
      ? getSessionScenesPath(campaign.id, session.id)
      : null
  })
  if (!paths) throw new Error('No session found')
  await page.goto(paths)
  await page.waitForLoadState('networkidle')
})

When(/^I tap "([^"]+)" in the breadcrumb$/, async ({ page }, segment: string) => {
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('button', { name: segment }).click()
  await page.waitForLoadState('networkidle')
})

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
  await page.waitForLoadState('networkidle')
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
  await page.waitForLoadState('networkidle')
})

When(/^I import (.+) into "([^"]+)"$/, async ({ page }, selectedText: string, sessionLabel: string) => {
  const names = selectedText.replace(/"/g, '').replace(/ and /g, ',').split(',').map((s) => s.trim()).filter(Boolean)
  const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
  const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
  await openSession(page, campaignId, sessionId)
  await page.getByRole('button', { name: 'Import Scene' }).click()
  for (const name of names) {
    await page.locator(`[data-scene-picker-name="${name}"]`).getByRole('checkbox').check()
  }
  await page.getByRole('button', { name: /Import Selected/ }).click()
})

When('I open the Import Scene picker', async ({ page }) => {
  await page.getByRole('button', { name: 'Import Scene' }).click()
})

When(/^I open the Import Scene picker for "([^"]+)"$/, async ({ page }, sessionLabel: string) => {
  const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
  const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
  await openSession(page, campaignId, sessionId)
  await page.getByRole('button', { name: 'Import Scene' }).click()
})

When(/^I search the picker for "([^"]+)"$/, async ({ page }, query: string) => {
  await page.getByLabel('Search scenes in picker').fill(query)
})

When(/^I choose to unlink "([^"]+)" from the session$/, async ({ page }, name: string) => {
  await sceneCard(page, name).getByRole('button', { name: `Unlink ${name}` }).click()
})

When(/^I swipe right on the "([^"]+)" card to unlink it$/, async ({ page }, name: string) => {
  await swipeRight(sceneCard(page, name))
  await page.getByRole('alertdialog').getByRole('button', { name: 'Unlink' }).click()
})

When('I confirm the unlink', async ({ page }) => {
  await page.getByRole('alertdialog').getByRole('button', { name: 'Unlink' }).click()
})

When('I cancel the unlink confirmation', async ({ page }) => {
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click()
})

When(/^I duplicate "([^"]+)" from the session scene list$/, async ({ page }, name: string) => {
  await sceneCard(page, name).getByRole('button', { name: `Duplicate ${name}` }).click()
})

When(/^I edit "([^"]+)" from the session scene list$/, async ({ page }, name: string) => {
  await sceneCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
})

When(/^I change its name to "([^"]+)"$/, async ({ page }, newName: string) => {
  await page.getByLabel('Scene name').fill(newName)
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
})

When(/^I tap the "([^"]+)" scene card in "([^"]+)"$/, async ({ page }, name: string, _session: string) => {
  await sceneCard(page, name).getByRole('heading', { level: 2, name }).click()
  await page.waitForLoadState('networkidle')
})

// --- Then ---

Then(/^I am still viewing Session Scenes for "([^"]+)"$/, async ({ page }, sessionLabel: string) => {
  await expect(page.getByText('Session Scenes')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(sessionLabel.replace('Session ', 'Session '))
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.getByTestId('session-scenes-empty-state')).toBeVisible()
})

Then(/^I see an optional link to create a scene in Scenes$/, async ({ page }) => {
  await expect(page.getByRole('link', { name: /create a scene in Scenes/i })).toBeVisible()
})

Then(/^I see "([^"]+)" below the "([^"]+)" scene row$/, async ({ page }, label: string, sceneName: string) => {
  const card = sceneCard(page, sceneName)
  const importRow = page.getByTestId('new-scene-card')
  const cardBox = await card.boundingBox()
  const importBox = await importRow.boundingBox()
  if (!cardBox || !importBox) throw new Error('Unable to compare row order')
  expect(importBox.y).toBeGreaterThan(cardBox.y)
  await expect(importRow).toContainText(label)
})

Then(/^"([^"]+)" appears above "([^"]+)" in the session scene list$/, async ({ page }, upper: string, lower: string) => {
  const names = await page.getByTestId('scene-card').locator('[data-scene-name]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-scene-name')),
  )
  expect(names.indexOf(upper)).toBeLessThan(names.indexOf(lower))
})

Then(/^the "([^"]+)" card shows a Last Active indicator$/, async ({ page }, name: string) => {
  await expect(sceneCard(page, name).getByTestId('last-active-badge')).toBeVisible()
})

Then(/^the "([^"]+)" card does not show a Last Active indicator$/, async ({ page }, name: string) => {
  await expect(sceneCard(page, name).getByTestId('last-active-badge')).toHaveCount(0)
})

Then('the session scene list appears in order:', async ({ page }, dataTable) => {
  const expected = dataTable.raw().flat().filter(Boolean)
  const names = await page.getByTestId('scene-card').locator('[data-scene-name]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-scene-name')),
  )
  expect(names).toEqual(expected)
})

Then(/^(.+) appear in "(Session \d+)"$/, async ({ page }, expectedText: string, _sessionLabel: string) => {
  const names = expectedText.replace(/"/g, '').replace(/ and /g, ',').split(',').map((s) => s.trim()).filter(Boolean)
  for (const name of names) {
    await expect(sceneCard(page, name)).toBeVisible()
  }
})

Then(/^I see "([^"]+)" in the scene picker$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-scene-picker-name="${name}"]`)).toBeVisible()
})

Then(/^I do not see "([^"]+)" in the scene picker$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-scene-picker-name="${name}"]`)).toHaveCount(0)
})

Then(/^"([^"]+)" still appears in Scenes$/, async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.locator(`[data-scene-name="${name}"]`)).toBeVisible()
})

Then(/^"([^"]+)" does not appear in Trash$/, async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.getByTestId('trash-scenes-tab')).not.toContainText(name)
})

Then(/^"([^"]+)" is still shown in "([^"]+)"$/, async ({ page }, name: string, _session: string) => {
  await expect(sceneCard(page, name)).toBeVisible()
})

Then(/^"([^"]+)" is not linked to "([^"]+)"$/, async ({ page }, sceneName: string, sessionLabel: string) => {
  const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
  const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
  await openSession(page, campaignId, sessionId)
  await expect(page.locator(`[data-scene-name="${sceneName}"]`)).toHaveCount(0)
})

Then('no audio is playing', async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(false)
})

Then(/^I see "([^"]+)" in "(Session \d+)"$/, async ({ page }, name: string, _session: string) => {
  await expect(sceneCard(page, name)).toBeVisible()
})

Then(/^I see "([^"]+)" in Scenes$/, async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.locator(`[data-scene-name="${name}"]`)).toBeVisible()
})
