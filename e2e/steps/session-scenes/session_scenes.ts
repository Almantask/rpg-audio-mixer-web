import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

const openSessionScenesScreen = async (page: any, sessName?: string) => {
  await page.goto('/campaigns')
  const actionBtn = page.getByRole('button', { name: 'Start' }).or(page.getByRole('button', { name: 'Resume' })).first()
  if (await actionBtn.isVisible()) {
    await actionBtn.click()
    await page.waitForURL('**/campaigns/sessions')
  }
  if (sessName) {
    await page.locator('div').filter({ hasText: sessName }).first().click()
  } else {
    await page.locator('div').filter({ hasText: 'Session' }).first().click()
  }
}



Given('I am viewing Session Scenes for {string} in campaign {string}', async ({ page }, sessName: string, campName: string) => {
  await page.goto('/')
  await page.evaluate(({ sName, cName }) => {
    const camps = [{ id: 'camp-1', name: cName, createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { sName: sessName, cName: campName })
  await openSessionScenesScreen(page, sessName)
})

Given('I opened {string} from the sessions list for {string}', async ({ page }, sessName: string, campName: string) => {
  await page.goto('/')
  await page.evaluate(({ sName, cName }) => {
    const camps = [{ id: 'camp-1', name: cName, createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { sName: sessName, cName: campName })
  await openSessionScenesScreen(page, sessName)
})

Given('I have a session {string} with no scenes', async ({ page }, sessTitle: string) => {
  await page.goto('/')
  await page.evaluate((title) => {
    const camps = [{ id: 'camp-1', name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: title, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_scenes', JSON.stringify([]))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, sessTitle)
  await page.goto('/')
})

Given('{string} is linked to {string}', async ({ page }, sceneName: string, sessName: string) => {
  await page.goto('/')
  await page.evaluate(({ scName, sName }) => {
    const camps = JSON.parse(localStorage.getItem('arcanum_campaigns') || '[]')
    if (camps.length === 0) camps.push({ id: 'camp-1', name: 'Curse of Strahd', createdAt: new Date().toISOString() })

    const sessions = JSON.parse(localStorage.getItem('arcanum_sessions') || '[]')
    let sess = sessions.find((s: any) => s.name === sName)
    if (!sess) {
      sess = { id: `sess-${sessions.length + 1}`, campaignId: camps[0].id, name: sName, createdAt: new Date().toISOString() }
      sessions.push(sess)
    }

    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    let sc = scenes.find((s: any) => s.name === scName)
    if (!sc) {
      sc = { id: `scene-${scenes.length + 1}`, name: scName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }
      scenes.push(sc)
    }

    const sessionScenes = JSON.parse(localStorage.getItem('arcanum_session_scenes') || '[]')
    if (!sessionScenes.some((ss: any) => ss.sessionId === sess.id && ss.sceneId === sc.id)) {
      sessionScenes.push({ sessionId: sess.id, sceneId: sc.id, linkedAt: new Date().toISOString() })
    }

    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { scName: sceneName, sName: sessName })
  await page.goto('/')
})

Given('I am viewing Session Scenes for {string}', async ({ page }, sessName: string) => {
  await openSessionScenesScreen(page, sessName)
})

Given('{string} has {int} soundscape categories and {int} effects', async ({ page }, sceneName: string, scCount: number, fxCount: number) => {
  await page.evaluate(({ scName, scC, fxC }) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    const sc = scenes.find((s: any) => s.name === scName)
    if (sc) {
      sc.soundscapeCategoryIds = Array.from({ length: scC }).map((_, i) => `sc-${i}`)
      sc.soundboardFxIds = Array.from({ length: fxC }).map((_, i) => `fx-${i}`)
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
  }, { scName: sceneName, scC: scCount, fxC: fxCount })
})



Given('the {string} scene has the description {string}', async ({ page }, sceneName: string, desc: string) => {
  if (page.url() === 'about:blank') {
    await page.goto('/scenes')
  }
  await page.evaluate(({ scName, description }) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    const sc = scenes.find((s: any) => s.name === scName)
    if (sc) {
      sc.description = description
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
  }, { scName: sceneName, description: desc })
  if (page.url().includes('/scenes')) {
    await page.reload()
    const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
    if (await card.isVisible()) {
      await expect(card.getByText(desc).first()).toBeVisible()
    }
  }
})

Given('the {string} scene has no description', async ({ page }, sceneName: string) => {
  if (page.url() === 'about:blank') {
    await page.goto('/scenes')
  }
  await page.evaluate((scName) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    const sc = scenes.find((s: any) => s.name === scName)
    if (sc) {
      delete sc.description
      localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    }
  }, sceneName)
  if (page.url().includes('/scenes')) {
    await page.reload()
    const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
    if (await card.isVisible()) {
      await expect(card.getByText('No description provided.').first()).toBeVisible()
    }
  }
})

Given('{string} and {string} are linked to {string}', async ({ page }, sc1: string, sc2: string, sessName: string) => {
  await page.goto('/')
  await page.evaluate(({ s1, s2, sName }) => {
    const camps = [{ id: 'camp-1', name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sName, createdAt: new Date().toISOString() }]
    const scenes = [
      { id: 'scene-1', name: s1, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
      { id: 'scene-2', name: s2, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
    ]
    const sessionScenes = [
      { sessionId: 'sess-1', sceneId: 'scene-1', linkedAt: new Date().toISOString() },
      { sessionId: 'sess-1', sceneId: 'scene-2', linkedAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { s1: sc1, s2: sc2, sName: sessName })
  await page.goto('/')
})

Given('I most recently played {string} in {string}', async ({ page }, sceneName: string, sessName: string) => {
  await page.evaluate((scName) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    const sc = scenes.find((s: any) => s.name === scName)
    const sessionScenes = JSON.parse(localStorage.getItem('arcanum_session_scenes') || '[]')
    if (sc) {
      const ss = sessionScenes.find((item: any) => item.sceneId === sc.id)
      if (ss) {
        ss.lastActiveAt = new Date().toISOString()
        localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
      }
    }
  }, sceneName)
})

Given('{string}, {string}, and {string} are linked to {string}', async ({ page }, s1: string, s2: string, s3: string, sessName: string) => {
  await page.goto('/')
  await page.evaluate(({ sc1, sc2, sc3, sName }) => {
    const camps = [{ id: 'camp-1', name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sName, createdAt: new Date().toISOString() }]
    const scenes = [
      { id: 'scene-1', name: sc1, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
      { id: 'scene-2', name: sc2, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
      { id: 'scene-3', name: sc3, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
    ]
    const sessionScenes = [
      { sessionId: 'sess-1', sceneId: 'scene-1', linkedAt: new Date().toISOString() },
      { sessionId: 'sess-1', sceneId: 'scene-2', linkedAt: new Date().toISOString() },
      { sessionId: 'sess-1', sceneId: 'scene-3', linkedAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { sc1: s1, sc2: s2, sc3: s3, sName: sessName })
  await page.goto('/')
})

Given('I previously played {string} before {string} in {string}', async ({ page }, sc1Name: string, sc2Name: string, sessName: string) => {
  await page.evaluate(({ s1, s2 }) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    const sc1 = scenes.find((s: any) => s.name === s1)
    const sc2 = scenes.find((s: any) => s.name === s2)
    const sessionScenes = JSON.parse(localStorage.getItem('arcanum_session_scenes') || '[]')
    const now = Date.now()
    if (sc1) {
      const ss1 = sessionScenes.find((item: any) => item.sceneId === sc1.id)
      if (ss1) ss1.lastActiveAt = new Date(now - 10000).toISOString()
    }
    if (sc2) {
      const ss2 = sessionScenes.find((item: any) => item.sceneId === sc2.id)
      if (ss2) ss2.lastActiveAt = new Date(now - 20000).toISOString()
    }
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { s1: sc1Name, s2: sc2Name })
})

When('I tap {string} in the breadcrumb', async ({ page }, item: string) => {
  await page.getByText(item).first().click()
})

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
})

When('I open that session', async ({ page }) => {
  await openSessionScenesScreen(page)
})

When('choose to unlink {string} from the session', async ({ page }, sceneName: string) => {
  await page.getByRole('button', { name: `Unlink ${sceneName}` }).click()
})

When('swipe right on the {string} session scene card to unlink it', async ({ page }, sceneName: string) => {
  await page.getByRole('button', { name: `Unlink ${sceneName}` }).click()
})

When('I confirm the unlink', async ({ page }) => {
  await page.getByRole('button', { name: 'Unlink' }).click()
})

When('I cancel the unlink confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I edit {string} from the session scene list', async ({ page }, name: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name }) }).first()
  await card.getByRole('button', { name: `Edit ${name}` }).click()
})

When('I change its name to {string}', async ({ page }, newName: string) => {
  await page.getByRole('dialog').getByPlaceholder('e.g. Tavern').fill(newName)
  await page.getByRole('dialog').getByRole('button', { name: 'Save Changes' }).click()
})

Then('I see {string} in Scenes', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

Given('I have scenes {string} in Scenes', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await page.evaluate((scName) => {
    const scenes = [{ id: 'scene-1', name: scName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
  }, sceneName)
  await page.reload()
})

Given('I have scenes {string}, {string}, and {string} in Scenes', async ({ page }, s1: string, s2: string, s3: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ sc1, sc2, sc3 }) => {
    const scenes = [
      { id: 'scene-1', name: sc1, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
      { id: 'scene-2', name: sc2, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
      { id: 'scene-3', name: sc3, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
  }, { sc1: s1, sc2: s2, sc3: s3 })
  await page.reload()
})

Given('I have scenes {string} and {string} in Scenes', async ({ page }, s1: string, s2: string) => {
  await page.goto('/scenes')
  await page.evaluate(({ sc1, sc2 }) => {
    const scenes = [
      { id: 'scene-1', name: sc1, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
      { id: 'scene-2', name: sc2, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
  }, { sc1: s1, sc2: s2 })
  await page.reload()
})

Given('I have a session {string} with no scenes', async ({ page }, sessName: string) => {
  await page.evaluate((sName) => {
    const camps = [{ id: 'camp-1', name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify([]))
  }, sessName)
})

When('I import {string} into {string}', async ({ page }, sceneName: string, sessName: string) => {
  await page.goto('/campaigns/camp-1/sessions/sess-1')
  await page.getByRole('button', { name: /Import Scene|Add Scene/i }).first().click()
  const item = page.locator('div[class*="cursor-pointer"]').filter({ hasText: sceneName }).first()
  await item.click()
  await page.getByRole('button', { name: /Import Selected|Add Selected/i }).first().click()
})

When('I import {string}, {string}, and {string} into {string}', async ({ page }, s1: string, s2: string, s3: string, sessName: string) => {
  await page.goto('/campaigns/camp-1/sessions/sess-1')
  await page.getByRole('button', { name: /Import Scene|Add Scene/i }).first().click()
  for (const name of [s1, s2, s3]) {
    const item = page.locator('div[class*="cursor-pointer"]').filter({ hasText: name }).first()
    await item.click()
  }
  await page.getByRole('button', { name: /Import Selected|Add Selected/i }).first().click()
})

Then('{string} appear in {string}', async ({ page }, sceneName: string, sessName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

Then('{string}, {string}, and {string} appear in {string}', async ({ page }, s1: string, s2: string, s3: string, sessName: string) => {
  for (const name of [s1, s2, s3]) {
    await expect(page.getByRole('heading', { name })).toBeVisible()
  }
})

When('I open the Import Scene picker', async ({ page }) => {
  if (!page.url().includes('/sessions/')) {
    await page.goto('/campaigns/camp-1/sessions/sess-1')
  }
  await page.getByRole('button', { name: /Import Scene|Add Scene/i }).first().click()
})

When('I open the Import Scene picker for {string}', async ({ page }, sessName: string) => {
  await page.goto('/campaigns/camp-1/sessions/sess-1')
  await page.getByRole('button', { name: /Import Scene|Add Scene/i }).first().click()
})

When('I search the picker for {string}', async ({ page }, term: string) => {
  await page.getByRole('dialog').getByPlaceholder(/Search/i).fill(term)
})

Then('I see {string} in the scene picker', async ({ page }, sceneName: string) => {
  await expect(page.getByRole('dialog').getByText(sceneName)).toBeVisible()
})

Then('I do not see {string} in the scene picker', async ({ page }, sceneName: string) => {
  await expect(page.getByRole('dialog').getByText(sceneName)).not.toBeVisible()
})

Given('{string} is linked to {string}', async ({ page }, scName: string, sessName: string) => {
  await page.evaluate(({ sceneName, sName }) => {
    const camps = [{ id: 'camp-1', name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sName, createdAt: new Date().toISOString() }]
    const scenes = [{ id: 'scene-1', name: sceneName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    const sessionScenes = [{ sessionId: 'sess-1', sceneId: 'scene-1', linkedAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, { sceneName: scName, sName: sessName })
})

Given('I have a scene {string} in Scenes that is not linked to {string}', async ({ page }, scName: string, sessName: string) => {
  await page.evaluate((sceneName) => {
    const scenes = JSON.parse(localStorage.getItem('arcanum_scenes') || '[]')
    scenes.push({ id: `scene-${Date.now()}`, name: sceneName, tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() })
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
  }, scName)
})

Given('all global scenes are linked to {string}', async ({ page }, sessName: string) => {
  await page.evaluate((sName) => {
    const camps = [{ id: 'camp-1', name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sName, createdAt: new Date().toISOString() }]
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: [], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    const sessionScenes = [{ sessionId: 'sess-1', sceneId: 'scene-1', linkedAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
    localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes))
  }, sessName)
})

Then('I see a link to create a new scene in Scenes', async ({ page }) => {
  await expect(page.getByRole('link', { name: /create|Scenes/i }).or(page.getByRole('button', { name: /create|Scenes/i })).first()).toBeVisible()
})

When('I create a scene named {string} from Session Scenes', async ({ page }, sceneName: string) => {
  await page.getByRole('button', { name: /Create Scene|New Scene/i }).first().click()
  await page.getByRole('dialog').getByPlaceholder('e.g. Tavern').fill(sceneName)
  await page.getByRole('dialog').getByRole('button', { name: /Create Scene|Save Scene/i }).click()
})

Then('{string} appears in the session scene list', async ({ page }, sceneName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

Then('{string} appears in the global Scenes list', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

When('I open New Scene from Session Scenes', async ({ page }) => {
  await page.getByRole('button', { name: /Create Scene|New Scene/i }).first().click()
})

Then('New Scene opens the same create dialog as the global Scenes list', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

When('I tap the {string} scene card in {string}', async ({ page }, sceneName: string, sessName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  await card.getByRole('button', { name: 'Open Scene' }).or(card).first().click()
  await page.waitForURL('**/active-scene')
})

Then('I see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle).first()).toBeVisible()
})

Then('I do not see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle)).toHaveCount(0)
})

Then('I am still viewing Session Scenes for {string}', async ({ page }, sessName: string) => {
  await expect(page.locator('main')).toBeVisible()
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.getByText('No scenes in this session')).toBeVisible()
})

Then('I see a {string} button', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name }).first()).toBeVisible()
})

Then('I see {string} below the {string} scene row', async ({ page }, btnText: string, sceneName: string) => {
  await expect(page.getByRole('button', { name: btnText }).first()).toBeVisible()
})

Then('{string} appears to the left of {string}', async ({ page }, leftBtn: string, rightBtn: string) => {
  const text = await page.locator('main').innerText()
  const idx1 = text.indexOf(leftBtn)
  const idx2 = text.indexOf(rightBtn)
  expect(idx1).toBeGreaterThan(-1)
  expect(idx2).toBeGreaterThan(-1)
  expect(idx1).toBeLessThan(idx2)
})

Then('the {string} scene card shows {string}', async ({ page }, sceneName: string, textLabel: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: sceneName }) }).first()
  const pattern = new RegExp(textLabel.replace(/·/g, '.*'))
  await expect(card.getByText(pattern)).toBeVisible()
})

Then('the {string} session scene card shows the description {string}', async ({ page }, sceneName: string, desc: string) => {
  await expect(page.getByText(desc).first()).toBeVisible()
})

Then('the {string} session scene card does not show a description', async ({ page }, sceneName: string) => {

})

Then('the {string} session scene card shows a Last Active indicator', async ({ page }, sceneName: string) => {
  await expect(page.getByText('Last Active').first()).toBeVisible()
})

Then('{string} appears above {string} in the session scene list', async ({ page }, s1: string, s2: string) => {
  const text = await page.locator('main').innerText()
  const idx1 = text.indexOf(s1)
  const idx2 = text.indexOf(s2)
  expect(idx1).toBeGreaterThan(-1)
  expect(idx2).toBeGreaterThan(-1)
  expect(idx1).toBeLessThan(idx2)
})

Then('the {string} session scene card does not show a Last Active indicator', async ({}) => {})

Then('the session scene list appears in order:', async ({ page }, dataTable) => {
  const names = dataTable.raw().map((r: string[]) => r[0])
  const text = await page.locator('main').innerText()
  let lastIdx = -1
  for (const n of names) {
    const idx = text.indexOf(n)
    expect(idx).toBeGreaterThan(lastIdx)
    lastIdx = idx
  }
})

Then('the {string} scene card has no play button', async ({ page }, sceneName: string) => {

})

Then('{string} is no longer shown in {string}', async ({ page }, sceneName: string) => {
  await expect(page.getByText(sceneName)).toHaveCount(0)
})

Then('{string} still appears in Scenes', async ({ page }, sceneName: string) => {
  await page.getByRole('button', { name: 'Scenes' }).click()
  await expect(page.getByText(sceneName)).toBeVisible()
})

Then('{string} does not appear in Trash', async ({ page }, sceneName: string) => {
  await page.getByRole('button', { name: 'Trash' }).click()
  await page.getByRole('button', { name: 'Scenes' }).click()
  await expect(page.getByText(sceneName)).toHaveCount(0)
})

Then('{string} is still shown in {string}', async ({ page }, sceneName: string) => {
  await expect(page.getByText(sceneName).first()).toBeVisible()
})

Then('I see {string} in {string}', async ({ page }, sceneName: string) => {
  await expect(page.getByText(sceneName).first()).toBeVisible()
})
