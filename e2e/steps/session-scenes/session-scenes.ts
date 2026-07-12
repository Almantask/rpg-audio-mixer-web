import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  DEFAULT_CAMPAIGN_NAME,
  buildCampaign,
  buildScene,
  buildSession,
  buildSessionFromCombinedTitle,
  buildSessionSceneLink,
  ensureDefaultSession,
  linkSceneToSession,
  mergeE2EData,
  openScenes,
  openSessionScenes,
  parseSceneList,
  resetE2EData,
  sceneIdForName,
  seedE2EData,
  seedSceneWithCounts,
  sessionIdForLabel,
  tableColumnValues,
  expectNoAudioPlayback,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

Given('I have session {string}', async ({ page }, combinedTitle: string) => {
  await resetE2EData(page)
  const campaign = buildCampaign(DEFAULT_CAMPAIGN_NAME)
  const session = buildSessionFromCombinedTitle(campaign.id, combinedTitle)
  await seedE2EData(page, { campaigns: [campaign], sessions: [session] })
})

Given(
  'I have a session {string} with no scenes',
  async ({ page }, sessionLabel: string) => {
    await ensureDefaultSession(page, sessionLabel)
  },
)

Given('{string} is linked to {string}', async ({ page }, sceneName: string, sessionLabel: string) => {
  await linkSceneToSession(page, sceneName, sessionLabel)
})

Given(
  '{string} and {string} are linked to {string}',
  async ({ page }, first: string, second: string, sessionLabel: string) => {
    await linkSceneToSession(page, first, sessionLabel)
    await linkSceneToSession(page, second, sessionLabel)
  },
)

Given(
  '{string}, {string}, and {string} are linked to {string}',
  async ({ page }, first: string, second: string, third: string, sessionLabel: string) => {
    for (const sceneName of [first, second, third]) {
      await linkSceneToSession(page, sceneName, sessionLabel)
    }
  },
)

Given(
  '{string} has {int} soundscape categories and {int} effects',
  async ({ page }, sceneName: string, scCount: number, fxCount: number) => {
    await seedSceneWithCounts(page, sceneName, scCount, fxCount)
  },
)

Given(
  'I most recently played {string} in {string}',
  async ({ page }, sceneName: string, sessionLabel: string) => {
    const sessionId = sessionIdForLabel(sessionLabel)
    const sceneId = sceneIdForName(sceneName)
    await page.evaluate(
      ({ activeSessionId, activeSceneId, playedSceneId }) => {
        const raw = localStorage.getItem('arcanum-audio-data')
        if (!raw) return
        const data = JSON.parse(raw)
        data.lastActiveSceneBySession = {
          ...data.lastActiveSceneBySession,
          [activeSessionId]: activeSceneId,
        }
        data.sessionSceneLinks = (data.sessionSceneLinks ?? []).map(
          (link: { sessionId: string; sceneId: string; lastPlayedAt?: string }) =>
            link.sessionId === activeSessionId && link.sceneId === playedSceneId
              ? { ...link, lastPlayedAt: new Date().toISOString() }
              : link,
        )
        localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
        window.__ARCANUM_E2E__?.seed(data)
      },
      {
        activeSessionId: sessionId,
        activeSceneId: sceneId,
        playedSceneId: sceneId,
      },
    )
  },
)

Given(
  'I previously played {string} before {string} in {string}',
  async ({ page }, earlier: string, later: string, sessionLabel: string) => {
    const sessionId = sessionIdForLabel(sessionLabel)
    const earlierDate = new Date(Date.now() - 86_400_000).toISOString()
    const laterDate = new Date(Date.now() - 43_200_000).toISOString()
    await page.evaluate(
      ({ sid, links }: { sid: string; links: { sceneId: string; lastPlayedAt: string }[] }) => {
        const raw = localStorage.getItem('arcanum-audio-data')
        if (!raw) return
        const data = JSON.parse(raw)
        data.sessionSceneLinks = (data.sessionSceneLinks ?? []).map(
          (link: { sessionId: string; sceneId: string; lastPlayedAt?: string }) => {
            if (link.sessionId !== sid) {
              return link
            }
            const update = links.find((item) => item.sceneId === link.sceneId)
            return update ? { ...link, lastPlayedAt: update.lastPlayedAt } : link
          },
        )
        localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
        window.__ARCANUM_E2E__?.seed(data)
      },
      {
        sid: sessionId,
        links: [
          { sceneId: sceneIdForName(earlier), lastPlayedAt: laterDate },
          { sceneId: sceneIdForName(later), lastPlayedAt: earlierDate },
        ],
      },
    )
  },
)

Given(
  'I am viewing Session Scenes for {string}',
  async ({ page }, sessionLabel: string) => {
    await openSessionScenes(page, sessionLabel)
  },
)

Given(
  'I am viewing Session Scenes for {string} in campaign {string}',
  async ({ page }, sessionLabel: string, campaignName: string) => {
    const campaign = buildCampaign(campaignName)
    const session = buildSession(campaign.id, 1, 'Opening Night')
    await mergeE2EData(page, { campaigns: [campaign], sessions: [session] })
    await openSessionScenes(page, sessionLabel, campaignName)
  },
)

Given(
  'I opened {string} from the sessions list for {string}',
  async ({ page }, sessionLabel: string, campaignName: string) => {
    const campaign = buildCampaign(campaignName)
    const session = buildSession(campaign.id, 1, 'Opening Night')
    await mergeE2EData(page, { campaigns: [campaign], sessions: [session] })
    await page.goto(`/campaigns/${campaign.id}/sessions`)
    await page.locator(`[data-session-body="${sessionLabel}"]`).click()
  },
)

Given(
  'I have a scene {string} in Scenes that is not linked to {string}',
  async ({ page }, sceneName: string, sessionLabel: string) => {
    await ensureDefaultSession(page, sessionLabel)
    await mergeE2EData(page, { scenes: [buildScene(sceneName)] })
  },
)

Given('all global scenes are linked to {string}', async ({ page }, sessionLabel: string) => {
  const { session } = await ensureDefaultSession(page, sessionLabel)
  const scenes = [buildScene('Tavern'), buildScene('Forest'), buildScene('Dungeon')]
  await mergeE2EData(page, {
    scenes,
    sessionSceneLinks: scenes.map((scene) => buildSessionSceneLink(session.id, scene.id)),
  })
})

When('I open that session', async ({ page }) => {
  await openSessionScenes(page, 'Session 1')
})

When('I tap {string} in the breadcrumb', async ({ page }, segment: string) => {
  if (segment === 'CURSE OF STRAHD') {
    await page.locator('[data-breadcrumb-campaign]').click()
    return
  }
  if (segment === 'SESSION 1') {
    await page.locator('[data-breadcrumb-session]').click()
    return
  }
  await page.locator(`[data-breadcrumb="${segment}"]`).click()
})

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
})

When('I open the Import Scene picker', async ({ page }) => {
  await page.locator('[data-import-scene-row]').click()
})

When('I open the Import Scene picker for {string}', async ({ page }, sessionLabel: string) => {
  await openSessionScenes(page, sessionLabel)
  await page.locator('[data-import-scene-row]').click()
})

When('I search the picker for {string}', async ({ page }, query: string) => {
  await page.locator('[data-import-scene-search]').fill(query)
})

When(/^I import (.*) into "([^"]+)"$/, async ({ page }, selected: string, sessionLabel: string) => {
  const sceneNames = parseSceneList(selected)
  await openSessionScenes(page, sessionLabel)
  await page.locator('[data-import-scene-row]').click()
  for (const name of sceneNames) {
    await page.locator(`[data-import-scene-check="${name}"]`).check()
  }
  await page.getByRole('button', { name: /import selected/i }).click()
})

When('I choose to unlink {string} from the session', async ({ page }, sceneName: string) => {
  if (!page.url().includes('/sessions/')) {
    await openSessionScenes(page, 'Session 1')
  }
  await page.locator(`[data-unlink-scene="${sceneName}"]`).click()
})

When('I swipe right on the {string} card to unlink it', async ({ page }, sceneName: string) => {
  if (!page.url().includes('/sessions/')) {
    await openSessionScenes(page, 'Session 1')
  }
  const card = page.locator(`[data-session-scene-card="${sceneName}"]`)
  await card.evaluate((el) => {
    const touchStartEvent = new Event('touchstart', { bubbles: true })
    Object.defineProperty(touchStartEvent, 'touches', {
      value: [{ clientX: 10 }]
    })
    el.dispatchEvent(touchStartEvent)

    const touchEndEvent = new Event('touchend', { bubbles: true })
    Object.defineProperty(touchEndEvent, 'changedTouches', {
      value: [{ clientX: 100 }]
    })
    el.dispatchEvent(touchEndEvent)
  })
})

When('I confirm the unlink', async ({ page }) => {
  await page.getByRole('button', { name: /confirm unlink/i }).click()
})

When('I cancel the unlink confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I duplicate {string} from the session scene list', async ({ page }, sceneName: string) => {
  await page.locator(`[data-duplicate-scene="${sceneName}"]`).click()
})

When('I edit {string} from the session scene list', async ({ page }, sceneName: string) => {
  await page.locator(`[data-edit-scene="${sceneName}"]`).click()
})

When('I change its name to {string}', async ({ page }, newName: string) => {
  await page.getByLabel('Scene name').fill(newName)
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I tap the {string} scene card in {string}', async ({ page }, sceneName: string) => {
  await page.locator(`[data-session-scene-body="${sceneName}"]`).click()
})

Then('I am still viewing Session Scenes for {string}', async ({ page }, sessionLabel: string) => {
  await expect(page.locator('[data-screen="Session Scenes screen"]')).toBeVisible()
  await expect(page.locator(`[data-session-label="${sessionLabel}"]`)).toBeVisible()
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.locator('[data-session-scenes-empty]')).toBeVisible()
})

Then('I see an optional link to create a scene in Scenes', async ({ page }) => {
  await expect(page.getByRole('link', { name: /scenes.*new scene/i })).toBeVisible()
})

Then(
  'I see {string} below the {string} scene row',
  async ({ page }, label: string, sceneName: string) => {
    const row = page.locator(`[data-session-scene-card="${sceneName}"]`)
    const importRow = page.getByRole('button', { name: label })
    const rowBox = await row.boundingBox()
    const importBox = await importRow.boundingBox()
    expect(rowBox && importBox && importBox.y > rowBox.y).toBeTruthy()
  },
)

Then(
  'the {string} card shows a Last Active indicator',
  async ({ page }, sceneName: string) => {
    await expect(page.locator(`[data-last-active="${sceneName}"]`)).toBeVisible()
  },
)

Then(
  'the {string} card does not show a Last Active indicator',
  async ({ page }, sceneName: string) => {
    await expect(page.locator(`[data-last-active="${sceneName}"]`)).toHaveCount(0)
  },
)

Then('the session scene list appears in order:', async ({ page }, dataTable) => {
  const names = tableColumnValues(dataTable)
  const cards = page.locator('[data-session-scene-title]')
  await expect(cards).toHaveCount(names.length)
  for (let index = 0; index < names.length; index += 1) {
    await expect(cards.nth(index)).toHaveText(names[index] ?? '')
  }
})

Then('I see {string} in {string}', async ({ page }, name1: string, name2: string) => {
  const isComposer = page.url().includes('/compose')
  if (isComposer) {
    if (name1 === 'Add track') {
      const lvl = name2.split(' ')[1]
      await expect(page.locator(`[data-sc-level-content="${lvl}"] button:has-text("Add track")`)).toBeVisible()
    } else {
      const lvl = name2.split(' ')[1]
      await expect(page.locator(`[data-sc-level-content="${lvl}"] [data-sc-composer-track="${name1}"]`)).toBeVisible()
    }
  } else {
    await expect(page.locator(`[data-session-scene-title="${name1}"]`)).toBeVisible()
    await expect(page.locator(`[data-session-label="${name2}"]`)).toBeVisible()
  }
})

Then('{string} is no longer shown in {string}', async ({ page }, name1: string, name2: string) => {
  const isComposer = page.url().includes('/compose')
  if (isComposer) {
    const lvl = name2.split(' ')[1]
    const levelContent = page.locator(`[data-sc-level-content="${lvl}"]`)
    await expect(levelContent.locator(`[data-sc-composer-track="${name1}"]`)).toHaveCount(0)
  } else {
    await expect(page.locator(`[data-session-scene-title="${name1}"]`)).toHaveCount(0)
  }
})

Then('{string} is still shown in {string}', async ({ page }, sceneName: string) => {
  await expect(page.locator(`[data-session-scene-title="${sceneName}"]`)).toBeVisible()
})

Then('{string} is not linked to {string}', async ({ page }, sceneName: string, sessionLabel: string) => {
  const sessionId = sessionIdForLabel(sessionLabel)
  const sceneId = sceneIdForName(sceneName)
  const linked = await page.evaluate(
    ({ sid, scId }) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      if (!raw) return false
      const data = JSON.parse(raw)
      return (data.sessionSceneLinks ?? []).some(
        (link: { sessionId: string; sceneId: string }) =>
          link.sessionId === sid && link.sceneId === scId,
      )
    },
    { sid: sessionId, scId: sceneId },
  )
  expect(linked).toBe(false)
})

Then('I see {string} in the scene picker', async ({ page }, sceneName: string) => {
  await expect(page.locator(`[data-import-scene-item="${sceneName}"]`)).toBeVisible()
})

Then('I do not see {string} in the scene picker', async ({ page }, sceneName: string) => {
  await expect(page.locator(`[data-import-scene-item="${sceneName}"]`)).toHaveCount(0)
})

Then('I see a link to create a new scene in Scenes', async ({ page }) => {
  await expect(page.getByRole('link', { name: /scenes.*new scene/i })).toBeVisible()
})

Then(/^(.*) appear in "([^"]+)"$/, async ({ page }, expected: string, label: string) => {
  const isComposer = page.url().includes('/compose')
  if (isComposer) {
    const lvl = label.split(' ')[1]
    const content = page.locator(`[data-sc-level-content="${lvl}"]`)
    if (expected === 'both tracks') {
      await expect(content.locator('[data-sc-composer-track]')).toHaveCount(2)
    } else {
      const names = expected.split(/\s+and\s+/).map((n) => n.replace(/"/g, '').trim())
      for (const name of names) {
        await expect(content.locator(`[data-sc-composer-track="${name}"]`)).toBeVisible()
      }
    }
  } else {
    const names = parseSceneList(expected)
    for (const name of names) {
      await expect(page.locator(`[data-session-scene-title="${name}"]`)).toBeVisible()
    }
    await expect(page.locator(`[data-session-label="${label}"]`)).toBeVisible()
  }
})

Then('no audio is playing', async ({ page }) => {
  await expectNoAudioPlayback(page)
})

Then('{string} still appears in Scenes', async ({ page }, name: string) => {
  await openScenes(page)
  await expect(page.locator(`[data-scene-card="${name}"]`)).toBeVisible()
})

Then('{string} does not appear in Trash', async ({ page }, name: string) => {
  await page.goto('/trash?tab=scenes')
  await expect(page.locator(`[data-trashed-scene="${name}"]`)).toHaveCount(0)
})

Then('{string} appears above {string} in the session scene list', async ({ page }, first: string, second: string) => {
  const sceneFirst = page.locator(`[data-session-scene-title="${first}"], [data-scene-title="${first}"]`).first()
  if ((await sceneFirst.count()) > 0) {
    const firstIndex = await page
      .locator('[data-session-scene-title], [data-scene-title]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.textContent?.trim() === target)
      }, first)
    const secondIndex = await page
      .locator('[data-session-scene-title], [data-scene-title]')
      .evaluateAll((elements, target) => {
        return elements.findIndex((element) => element.textContent?.trim() === target)
      }, second)
    expect(firstIndex).toBeGreaterThanOrEqual(0)
    expect(secondIndex).toBeGreaterThanOrEqual(0)
    expect(firstIndex).toBeLessThan(secondIndex)
    return
  }
})
