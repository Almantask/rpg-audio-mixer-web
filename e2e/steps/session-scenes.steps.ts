import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I am viewing Session Scenes for {string} in campaign {string}', async ({ page }, sNum: string, cName: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ num, camp }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    const cleanNum = num.replace(/^Session\s*/i, '') || '1'
    if (!Array.isArray(data.campaigns)) data.campaigns = []
    let campObj = data.campaigns.find((c: any) => c.id === campId)
    if (!campObj) {
      campObj = { id: campId, name: camp, createdAt: new Date().toISOString() }
      data.campaigns.push(campObj)
    } else {
      campObj.name = camp
    }

    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === 'sess-1')
    if (!sessObj) {
      sessObj = { id: 'sess-1', campaignId: campId, number: cleanNum, name: 'The Dark Arrival', date: '2026-01-01', sceneIds: [] }
      data.sessions.push(sessObj)
    } else {
      sessObj.number = cleanNum
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { num: sNum, camp: cName })
  await page.goto('/campaigns/camp-2/sessions/sess-1')
})

When('I tap {string} in the breadcrumb', async ({ page }, breadcrumbText: string) => {
  await page.locator('nav').getByText(new RegExp(breadcrumbText, 'i')).click()
})

Then('I am still viewing Session Scenes for {string}', async ({ page }, sNum: string) => {
  await expect(page.getByRole('heading', { name: new RegExp(sNum, 'i') })).toBeVisible()
})

Given('I opened {string} from the sessions list for {string}', async ({ page }, sNum: string, cName: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ num, camp }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    const cleanNum = num.replace(/^Session\s*/i, '') || '1'
    if (!Array.isArray(data.campaigns)) data.campaigns = []
    let campObj = data.campaigns.find((c: any) => c.id === campId)
    if (!campObj) {
      campObj = { id: campId, name: camp, createdAt: new Date().toISOString() }
      data.campaigns.push(campObj)
    } else {
      campObj.name = camp
    }

    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === 'sess-1')
    if (!sessObj) {
      sessObj = { id: 'sess-1', campaignId: campId, number: cleanNum, name: 'The Dark Arrival', date: '2026-01-01', sceneIds: [] }
      data.sessions.push(sessObj)
    } else {
      sessObj.number = cleanNum
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { num: sNum, camp: cName })
  await page.goto('/campaigns/camp-2/sessions/sess-1')
})

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
})

Given('I have a session {string} with no scenes', async ({ page }, sTitle?: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ title }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    if (!Array.isArray(data.campaigns)) data.campaigns = []
    if (!data.campaigns.some((c: any) => c.id === campId)) {
      data.campaigns.push({ id: campId, name: 'Curse of Strahd', createdAt: new Date().toISOString() })
    }
    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === 'sess-1')
    if (!sessObj) {
      sessObj = { id: 'sess-1', campaignId: campId, number: '1', name: title || 'The Dark Arrival', date: '2026-01-01', sceneIds: [] }
      data.sessions.push(sessObj)
    } else {
      sessObj.sceneIds = []
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { title: sTitle || 'Session 1' })
  await page.reload()
})

When('I open that session', async ({ page }) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.getByText('No scenes in this session')).toBeVisible()
})

Given('{string} is linked to {string}', async ({ page }, scName: string, sNum: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.evaluate(({ scene, num }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    const cleanNum = num.replace(/^Session\s*/i, '') || '1'
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    const scId = map[scene.toLowerCase()] || `scene-${scene.toLowerCase().replace(/\s+/g, '-')}`

    if (!Array.isArray(data.campaigns) || data.campaigns.length === 0) {
      data.campaigns = [{ id: campId, name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    }
    if (!Array.isArray(data.scenes)) data.scenes = []
    let scObj = data.scenes.find((s: any) => s.name.toLowerCase() === scene.toLowerCase() || s.id === scId)
    if (!scObj) {
      scObj = { id: scId, name: scene, tags: [], soundscapeCategories: [], effectIds: [] }
      data.scenes.push(scObj)
    } else {
      scObj.id = scId
    }

    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === 'sess-1')
    if (!sessObj) {
      sessObj = { id: 'sess-1', campaignId: campId, number: cleanNum, name: 'Dark Arrival', date: '2026-01-01', sceneIds: [scObj.id] }
      data.sessions.push(sessObj)
    } else {
      if (!sessObj.sceneIds.includes(scObj.id)) sessObj.sceneIds.push(scObj.id)
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scene: scName, num: sNum })
  await page.reload()
})

Given('I am viewing Session Scenes for {string}', async ({ page }, _sNum: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
})

Then('I see {string} below the {string} scene row', async ({ page }, btnName: string, _scName: string) => {
  await expect(page.getByRole('button', { name: btnName })).toBeVisible()
})

Then('{string} appears to the left of {string}', async ({ page }, leftBtn: string, rightBtn: string) => {
  await expect(page.getByRole('button', { name: leftBtn })).toBeVisible()
  await expect(page.getByRole('button', { name: rightBtn })).toBeVisible()
})

Given('{string} has {int} soundscape categories and {int} effects', async ({ page }, scName: string, scC: number, fxC: number) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.evaluate(({ scene, sc, fx }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    const scId = map[scene.toLowerCase()] || `scene-${scene.toLowerCase().replace(/\s+/g, '-')}`
    if (!Array.isArray(data.scenes)) data.scenes = []
    let scObj = data.scenes.find((s: any) => s.name.toLowerCase() === scene.toLowerCase() || s.id === scId)
    if (!scObj) {
      scObj = { id: scId, name: scene, tags: [], soundscapeCategories: [], effectIds: [] }
      data.scenes.push(scObj)
    }
    scObj.soundscapeCategories = Array(sc).fill('Cat')
    scObj.effectIds = Array(fx).fill('fx1')
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scene: scName, sc: scC, fx: fxC })
  await page.reload()
})

Then('the {string} session scene card shows the description {string}', async ({ page }, scName: string, desc: string) => {
  const card = page.locator(`[data-session-scene-card="${scName}"]`)
  await expect(card.getByText(desc)).toBeVisible()
})

Then('the {string} session scene card does not show a description', async ({ page }, scName: string) => {
  const card = page.locator(`[data-session-scene-card="${scName}"]`)
  await expect(card.locator('p')).toHaveCount(0)
})

Given('{string} and {string} are linked to {string}', async ({ page }, sc1: string, sc2: string, sNum: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.evaluate(({ s1, s2, num }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    const cleanNum = num.replace(/^Session\s*/i, '') || '1'
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    const sc1Id = map[s1.toLowerCase()] || `scene-${s1.toLowerCase().replace(/\s+/g, '-')}`
    const sc2Id = map[s2.toLowerCase()] || `scene-${s2.toLowerCase().replace(/\s+/g, '-')}`

    if (!Array.isArray(data.campaigns) || data.campaigns.length === 0) {
      data.campaigns = [{ id: campId, name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    }
    if (!Array.isArray(data.scenes)) data.scenes = []
    
    let sc1Obj = data.scenes.find((s: any) => s.name.toLowerCase() === s1.toLowerCase() || s.id === sc1Id)
    if (!sc1Obj) {
      sc1Obj = { id: sc1Id, name: s1, tags: [], soundscapeCategories: [], effectIds: [] }
      data.scenes.push(sc1Obj)
    } else {
      sc1Obj.id = sc1Id
    }

    let sc2Obj = data.scenes.find((s: any) => s.name.toLowerCase() === s2.toLowerCase() || s.id === sc2Id)
    if (!sc2Obj) {
      sc2Obj = { id: sc2Id, name: s2, tags: [], soundscapeCategories: [], effectIds: [] }
      data.scenes.push(sc2Obj)
    } else {
      sc2Obj.id = sc2Id
    }

    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === 'sess-1')
    if (!sessObj) {
      sessObj = { id: 'sess-1', campaignId: campId, number: cleanNum, name: 'Dark Arrival', date: '2026-01-01', sceneIds: [sc1Obj.id, sc2Obj.id] }
      data.sessions.push(sessObj)
    } else {
      if (!sessObj.sceneIds.includes(sc1Obj.id)) sessObj.sceneIds.push(sc1Obj.id)
      if (!sessObj.sceneIds.includes(sc2Obj.id)) sessObj.sceneIds.push(sc2Obj.id)
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { s1: sc1, s2: sc2, num: sNum })
  await page.reload()
})

Given('I most recently played {string} in {string}', async ({ page }, scName: string, _sNum: string) => {
  await page.evaluate(({ scene }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    const scId = map[scene.toLowerCase()] || `scene-${scene.toLowerCase().replace(/\s+/g, '-')}`
    if (!Array.isArray(data.scenes)) data.scenes = []
    const sc = data.scenes.find((s: any) => s.name.toLowerCase() === scene.toLowerCase() || s.id === scId)
    if (sc) {
      if (!data.lastActiveSceneIdBySession) data.lastActiveSceneIdBySession = {}
      data.lastActiveSceneIdBySession['sess-1'] = sc.id
      sc.lastPlayedAt = new Date().toISOString()
      localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
    }
  }, { scene: scName })
  await page.reload()
})

Then('{string} appears above {string} in the session scene list', async ({ page }, first: string, _second: string) => {
  const cards = page.locator('[data-session-scene-card]')
  const firstText = await cards.nth(0).textContent()
  expect(firstText).toContain(first)
})

Then('the {string} session scene card shows a Last Active indicator', async ({ page }, scName: string) => {
  const card = page.locator(`[data-session-scene-card="${scName}"]`)
  await expect(card.getByText('Last Active')).toBeVisible()
})

Then('the {string} session scene card does not show a Last Active indicator', async ({ page }, scName: string) => {
  const card = page.locator(`[data-session-scene-card="${scName}"]`)
  await expect(card.getByText('Last Active')).toHaveCount(0)
})

Given('{string}, {string}, and {string} are linked to {string}', async ({ page }, sc1: string, sc2: string, sc3: string, sNum: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ s1, s2, s3, num }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    const cleanNum = num.replace(/^Session\s*/i, '') || '1'
    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }
    if (!Array.isArray(data.campaigns) || data.campaigns.length === 0) {
      data.campaigns = [{ id: campId, name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    }
    if (!Array.isArray(data.scenes)) data.scenes = []
    
    const getOrAdd = (name: string) => {
      const targetId = map[name.toLowerCase()] || `scene-${name.toLowerCase().replace(/\s+/g, '-')}`
      let obj = data.scenes.find((s: any) => s.name.toLowerCase() === name.toLowerCase() || s.id === targetId)
      if (!obj) {
        obj = { id: targetId, name, tags: [], soundscapeCategories: [], effectIds: [] }
        data.scenes.push(obj)
      } else {
        obj.id = targetId
      }
      return obj
    }

    const sc1Obj = getOrAdd(s1)
    const sc2Obj = getOrAdd(s2)
    const sc3Obj = getOrAdd(s3)

    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === 'sess-1')
    if (!sessObj) {
      sessObj = { id: 'sess-1', campaignId: campId, number: cleanNum, name: 'Dark Arrival', date: '2026-01-01', sceneIds: [sc1Obj.id, sc2Obj.id, sc3Obj.id] }
      data.sessions.push(sessObj)
    } else {
      if (!sessObj.sceneIds.includes(sc1Obj.id)) sessObj.sceneIds.push(sc1Obj.id)
      if (!sessObj.sceneIds.includes(sc2Obj.id)) sessObj.sceneIds.push(sc2Obj.id)
      if (!sessObj.sceneIds.includes(sc3Obj.id)) sessObj.sceneIds.push(sc3Obj.id)
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { s1: sc1, s2: sc2, s3: sc3, num: sNum })
})

Given('I previously played {string} before {string} in {string}', async ({ page }, sc1: string, sc2: string, _sNum: string) => {
  await page.evaluate(({ s1Name, s2Name }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const sc1Obj = data.scenes.find((s: any) => s.name === s1Name)
    const sc2Obj = data.scenes.find((s: any) => s.name === s2Name)
    if (sc1Obj) sc1Obj.lastPlayedAt = new Date(Date.now() - 10000).toISOString()
    if (sc2Obj) sc2Obj.lastPlayedAt = new Date(Date.now() - 20000).toISOString()
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { s1Name: sc1, s2Name: sc2 })
})

Then('the session scene list appears in order:', async ({ page }, dataTable) => {
  const expectedNames = dataTable.raw().map((r: string[]) => r[0])
  for (let i = 0; i < expectedNames.length; i++) {
    const card = page.locator('[data-session-scene-card]').nth(i)
    await expect(card).toContainText(expectedNames[i])
  }
})

When('I tap the {string} scene card in {string}', async ({ page }, scName: string) => {
  await page.locator(`[data-session-scene-card="${scName}"]`).click()
})





When('I import {string} into {string}', async ({ page }, selected: string, sNum: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  const names = selected.split(/,\s*|\s+and\s+/i).map(s => s.replace(/"/g, '').trim()).filter(Boolean)
  await page.evaluate(({ scNames, sNumStr }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    if (!Array.isArray(data.campaigns)) data.campaigns = [{ id: campId, name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    if (!Array.isArray(data.scenes)) data.scenes = []
    if (!Array.isArray(data.sessions)) data.sessions = []
    
    let session = data.sessions.find((s: any) => s.id === 'sess-1' || s.name === sNumStr || s.number === sNumStr)
    if (!session) {
      session = { id: 'sess-1', campaignId: campId, number: '1', name: sNumStr, date: '2026-01-01', sceneIds: [] }
      data.sessions.push(session)
    }
    if (!Array.isArray(session.sceneIds)) session.sceneIds = []

    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }

    for (const name of scNames) {
      let sc = data.scenes.find((s: any) => s.name.toLowerCase() === name.toLowerCase())
      if (!sc) {
        const canonicalId = map[name.toLowerCase()] || `scene-${name.toLowerCase().replace(/\s+/g, '-')}`
        sc = { id: canonicalId, name, tags: [], soundscapeCategories: [], effectIds: [] }
        data.scenes.push(sc)
      }
      if (!session.sceneIds.includes(sc.id)) {
        session.sceneIds.push(sc.id)
      }
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scNames: names, sNumStr: sNum })
  await page.reload()
})

Then('{string} appear in {string}', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

When('I open the Import Scene picker', async ({ page }) => {
  await page.getByRole('button', { name: 'Import Scene' }).click()
})

When('I search the picker for {string}', async ({ page }, query: string) => {
  await page.getByPlaceholder('Search scenes to import...').fill(query)
})

Then('I see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-import-scene-item="${name}"]`)).toBeVisible()
})

Then('I do not see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.locator(`[data-import-scene-item="${name}"]`)).toHaveCount(0)
})

When('I open the Import Scene picker for {string}', async ({ page }, _sNum: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.getByRole('button', { name: 'Import Scene' }).click()
})

Given('I have a scene {string} in Scenes that is not linked to {string}', async ({ page }, scName: string) => {
  await page.evaluate((name) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    if (!Array.isArray(data.scenes)) data.scenes = []
    data.scenes.push({ id: `sc-${name.toLowerCase()}`, name, tags: [], soundscapeCategories: [], effectIds: [] })
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, scName)
  await page.reload()
})

Given('all global scenes are linked to {string}', async ({ page }, _sNum: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.evaluate(() => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    if (!Array.isArray(data.campaigns)) data.campaigns = [{ id: campId, name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
      data.scenes = [
        { id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategories: [], effectIds: [] },
        { id: 'scene-2', name: 'Forest', tags: [], soundscapeCategories: [], effectIds: [] },
      ]
    }
    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === 'sess-1')
    if (!sessObj) {
      sessObj = { id: 'sess-1', campaignId: campId, number: '1', name: 'Dark Arrival', date: '2026-01-01', sceneIds: [] }
      data.sessions.push(sessObj)
    }
    sessObj.sceneIds = data.scenes.map((s: any) => s.id)
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  })
  await page.reload()
})

Then('I see {string} in {string}', async ({ page }, text: string, _sNum: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Then('I see a link to create a new scene in Scenes', async ({ page }) => {
  await expect(page.getByRole('link', { name: /create a new scene/i })).toBeVisible()
})

When('I open the New Scene dialog from Session Scenes', async ({ page }) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.getByRole('button', { name: 'New Scene' }).click()
})

Then('I see the New Scene create dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Create New Scene' })).toBeVisible()
})

Then('I see a required {string} field', async ({ page }, fieldName: string) => {
  await expect(page.getByText(fieldName)).toBeVisible()
})

Then('I see an optional {string} field', async ({ page }, fieldName: string) => {
  await expect(page.getByText(fieldName)).toBeVisible()
})

When('I create a new scene named {string} from Session Scenes via the New Scene dialog', async ({ page }, scName: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByPlaceholder('e.g. Tavern').fill(scName)
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('I remain on Session Scenes for {string}', async ({ page }, _sNum: string) => {
  await expect(page.getByRole('heading', { name: new RegExp(_sNum, 'i') })).toBeVisible()
})

When('I choose to unlink {string} from the session', async ({ page }, scName: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  const card = page.locator(`[data-session-scene-card="${scName}"]`)
  await card.getByRole('button', { name: /Unlink/i }).first().click()
})

When('I swipe right on the {string} session scene card to unlink it', async ({ page }, scName: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  const card = page.locator(`[data-session-scene-card="${scName}"]`)
  await card.getByRole('button', { name: /Unlink/i }).first().click()
})

When('I confirm the unlink', async ({ page }) => {
  const modal = page.locator('div').filter({ hasText: 'Unlink Scene?' })
  await modal.getByRole('button', { name: 'Unlink', exact: true }).click()
})

Then('{string} is no longer shown in {string}', async ({ page }, scName: string) => {
  await expect(page.locator(`[data-session-scene-card="${scName}"]`)).toHaveCount(0)
})

Then('{string} still appears in Scenes', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.locator(`[data-scene-card="${scName}"]`).first()).toBeVisible()
})

Then('{string} does not appear in Trash', async ({ page }, scName: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'Scenes' }).click()
  await expect(page.locator(`[data-trash-item="${scName}"]`)).toHaveCount(0)
})

When('I cancel the unlink confirmation', async ({ page }) => {
  const modal = page.locator('div').filter({ hasText: 'Unlink Scene?' })
  await modal.getByRole('button', { name: 'Cancel' }).click()
})

Then('{string} is still shown in {string}', async ({ page }, scName: string) => {
  await expect(page.locator(`[data-session-scene-card="${scName}"]`)).toBeVisible()
})

When('I edit {string} from the session scene list', async ({ page }, scName: string) => {
  const card = page.locator(`[data-session-scene-card="${scName}"]`)
  await card.getByRole('button', { name: /Edit/i }).first().click()
})

When('I change its name to {string}', async ({ page }, newName: string) => {
  const modal = page.locator('div').filter({ hasText: 'Edit Scene Details' })
  await modal.locator('input[type="text"]').first().fill(newName)
  await modal.getByRole('button', { name: 'Save' }).click()
})

When('I import {string}, {string}, and {string} into {string}', async ({ page }, s1: string, s2: string, s3: string, sNum: string) => {
  await page.goto('/campaigns/camp-2/sessions/sess-1')
  await page.evaluate(({ scNames, sNumStr }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    if (!Array.isArray(data.campaigns)) data.campaigns = [{ id: campId, name: 'Curse of Strahd', createdAt: new Date().toISOString() }]
    if (!Array.isArray(data.scenes)) data.scenes = []
    if (!Array.isArray(data.sessions)) data.sessions = []
    
    let session = data.sessions.find((s: any) => s.id === 'sess-1' || s.name === sNumStr || s.number === sNumStr)
    if (!session) {
      session = { id: 'sess-1', campaignId: campId, number: '1', name: sNumStr, date: '2026-01-01', sceneIds: [] }
      data.sessions.push(session)
    }
    if (!Array.isArray(session.sceneIds)) session.sceneIds = []

    const map: Record<string, string> = {
      'tavern': 'scene-1',
      'forest': 'scene-2',
      'dungeon': 'scene-3',
      "dragon's lair": 'scene-4',
      'the rusty tankard': 'scene-5',
    }

    for (const name of scNames) {
      let sc = data.scenes.find((s: any) => s.name.toLowerCase() === name.toLowerCase())
      if (!sc) {
        const canonicalId = map[name.toLowerCase()] || `scene-${name.toLowerCase().replace(/\s+/g, '-')}`
        sc = { id: canonicalId, name, tags: [], soundscapeCategories: [], effectIds: [] }
        data.scenes.push(sc)
      }
      if (!session.sceneIds.includes(sc.id)) {
        session.sceneIds.push(sc.id)
      }
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { scNames: [s1, s2, s3], sNumStr: sNum })
  await page.reload()
})

Then('{string}, {string}, and {string} appear in {string}', async ({ page }, s1: string, s2: string, s3: string, _sNum: string) => {
  await expect(page.locator(`[data-session-scene-card="${s1}"]`)).toBeVisible()
  await expect(page.locator(`[data-session-scene-card="${s2}"]`)).toBeVisible()
  await expect(page.locator(`[data-session-scene-card="${s3}"]`)).toBeVisible()
})

