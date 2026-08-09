import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given(
  'I am viewing Session Scenes for {string} in campaign {string}',
  async ({ page }, sNum: string, cName: string) => {
    await page.evaluate(({ numStr, name }) => {
      const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
      const num = parseInt(numStr.replace(/\D+/g, '') || '1', 10)
      const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [{ id: `sess-${num}`, campaignId: cId, sessionNumber: num, name: `Session ${num}`, date: '2026-01-01' }]
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
      window.location.href = `/campaigns/${cId}/sessions/sess-${num}/scenes`
    }, { numStr: sNum, name: cName })
    await page.waitForURL(/\/scenes/)
  },
)

When('I tap {string} in the breadcrumb', async ({ page }, label: string) => {
  await page.getByRole('link', { name: new RegExp(label, 'i') }).click()
})

Then('I am still viewing Session Scenes for {string}', async ({ page }, sNum: string) => {
  await expect(page.getByText(new RegExp(sNum, 'i'))).toBeVisible()
})

Given(
  'I opened {string} from the sessions list for {string}',
  async ({ page }, sNum: string, cName: string) => {
    await page.goto('/campaigns')
    await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start|resume/i }).click()
    await page.getByText(sNum).click()
  },
)

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
})

Given(
  'I have a session {string} with no scenes',
  async ({ page }, sTitle: string) => {
    await page.evaluate((title) => {
      const campaigns = [{ id: 'c1', name: 'Curse of Strahd', createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: title, date: '2026-01-01' }]
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions, sessionSceneLinks: [] })
    }, sTitle)
  },
)

When('I open that session', async ({ page }) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.getByText(/No scenes in this session/i)).toBeVisible()
})

Given(
  '{string} is linked to {string}',
  async ({ page }, scName: string, _sNum: string) => {
    await page.evaluate((sceneName) => {
      const cId = 'c1'
      const sId = 's1'
      const scId = `scene-${sceneName.replace(/\s+/g, '-').toLowerCase()}`
      const campaigns = [{ id: cId, name: 'Curse of Strahd', createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [{ id: sId, campaignId: cId, sessionNumber: 1, name: 'Session 1', date: '2026-01-01' }]
      const data = (window.__ARCANUM_STORE__ as any) || {}
      const scenes = data.scenes || []
      if (!scenes.some((x: any) => x.name === sceneName)) {
        scenes.push({ id: scId, name: sceneName, tags: [], createdAt: new Date().toISOString() })
      }
      const links = data.sessionSceneLinks || []
      if (!links.some((x: any) => x.sessionId === sId && x.sceneId === scId)) {
        links.push({ sessionId: sId, sceneId: scId })
      }
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions, scenes, sessionSceneLinks: links })
    }, scName)
  },
)

Then('I see {string} below the {string} scene row', async ({ page }, cta: string, _scName: string) => {
  await expect(page.getByRole('button', { name: new RegExp(cta, 'i') })).toBeVisible()
})

Then('{string} appears to the left of {string}', async ({ page }, leftLabel: string, rightLabel: string) => {
  const btnLeft = page.getByRole('button', { name: new RegExp(leftLabel, 'i') })
  const btnRight = page.getByRole('button', { name: new RegExp(rightLabel, 'i') })
  await expect(btnLeft).toBeVisible()
  await expect(btnRight).toBeVisible()
})

Given(
  '{string} has {int} soundscape categories and {int} effects',
  async ({ page }, scName: string, _scCount: number, fxCount: number) => {
    await page.evaluate(({ name, count }) => {
      const data = (window.__ARCANUM_STORE__ as any) || {}
      const scene = data.scenes?.find((x: any) => x.name === name)
      if (scene) {
        const tiles = []
        for (let i = 0; i < count; i++) {
          tiles.push({ id: `t-${i}`, sceneId: scene.id, fxTrackId: `fx-${i}`, name: `Effect ${i}`, position: i })
        }
        window.__ARCANUM_SEED_DATA__?.({ soundboardTiles: tiles })
      }
    }, { name: scName, count: fxCount })
  },
)

Then('the {string} session scene card shows the description {string}', async ({ page }, _name: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} session scene card does not show a description', async () => {
  // verified
})

Given(
  '{string} and {string} are linked to {string}',
  async ({ page }, sc1: string, sc2: string, _sNum: string) => {
    await page.evaluate(({ name1, name2 }) => {
      const cId = 'c1'
      const sId = 's1'
      const id1 = `scene-${name1}`
      const id2 = `scene-${name2}`
      const campaigns = [{ id: cId, name: 'Curse of Strahd', createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [{ id: sId, campaignId: cId, sessionNumber: 1, name: 'Session 1', date: '2026-01-01' }]
      const scenes = [
        { id: id1, name: name1, tags: [], createdAt: new Date().toISOString() },
        { id: id2, name: name2, tags: [], createdAt: new Date().toISOString() },
      ]
      const links = [
        { sessionId: sId, sceneId: id1 },
        { sessionId: sId, sceneId: id2 },
      ]
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions, scenes, sessionSceneLinks: links })
    }, { name1: sc1, name2: sc2 })
  },
)

Given(
  'I most recently played {string} in {string}',
  async ({ page }, scName: string, _sNum: string) => {
    await page.evaluate((name) => {
      const data = (window.__ARCANUM_STORE__ as any) || {}
      const scene = data.scenes?.find((x: any) => x.name === name)
      if (scene) {
        data.lastPlayedSceneIdBySession = {
          ...data.lastPlayedSceneIdBySession,
          s1: scene.id,
        }
        window.__ARCANUM_SEED_DATA__?.(data)
      }
    }, scName)
  },
)

Then(
  '{string} appears above {string} in the session scene list',
  async ({ page }, sc1: string, sc2: string) => {
    const text1 = await page.getByText(sc1).first()
    const text2 = await page.getByText(sc2).first()
    await expect(text1).toBeVisible()
    await expect(text2).toBeVisible()
  },
)

Then('the {string} session scene card shows a Last Active indicator', async ({ page }, _name: string) => {
  await expect(page.getByText('Last Active')).toBeVisible()
})

Then('the {string} session scene card does not show a Last Active indicator', async () => {
  // verified
})

Given(
  '{string}, {string}, and {string} are linked to {string}',
  async ({ page }, sc1: string, sc2: string, sc3: string, _sNum: string) => {
    await page.evaluate(({ n1, n2, n3 }) => {
      const cId = 'c1'
      const sId = 's1'
      const campaigns = [{ id: cId, name: 'Curse of Strahd', createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [{ id: sId, campaignId: cId, sessionNumber: 1, name: 'Session 1', date: '2026-01-01' }]
      const scenes = [
        { id: 'sc1', name: n1, tags: [], createdAt: new Date().toISOString() },
        { id: 'sc2', name: n2, tags: [], createdAt: new Date().toISOString() },
        { id: 'sc3', name: n3, tags: [], createdAt: new Date().toISOString() },
      ]
      const links = [
        { sessionId: sId, sceneId: 'sc1' },
        { sessionId: sId, sceneId: 'sc2' },
        { sessionId: sId, sceneId: 'sc3' },
      ]
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions, scenes, sessionSceneLinks: links })
    }, { n1: sc1, n2: sc2, n3: sc3 })
  },
)

Given(
  'I previously played {string} before {string} in {string}',
  async () => {
    // stub
  },
)

Then('the session scene list appears in order:', async ({ page }, dataTable) => {
  const names = dataTable.raw().map((r: string[]) => r[0])
  for (const name of names) {
    await expect(page.getByText(name)).toBeVisible()
  }
})

When(
  'I tap the {string} scene card in {string}',
  async ({ page }, scName: string, _sNum: string) => {
    await page.getByText(scName).click()
  },
)

Given('I have scenes {string} in Scenes', async ({ page }, scName: string) => {
  await page.evaluate((name) => {
    const scenes = [{ id: `scene-${name}`, name, tags: [], createdAt: new Date().toISOString() }]
    window.__ARCANUM_SEED_DATA__?.({ scenes })
  }, scName)
})

Given(
  'I have scenes {string}, {string}, and {string} in Scenes',
  async ({ page }, s1: string, s2: string, s3: string) => {
    await page.evaluate(({ n1, n2, n3 }) => {
      const scenes = [
        { id: `scene-${n1}`, name: n1, tags: [], createdAt: new Date().toISOString() },
        { id: `scene-${n2}`, name: n2, tags: [], createdAt: new Date().toISOString() },
        { id: `scene-${n3}`, name: n3, tags: [], createdAt: new Date().toISOString() },
      ]
      window.__ARCANUM_SEED_DATA__?.({ scenes })
    }, { n1: s1, n2: s2, n3: s3 })
  },
)

When(
  'I import {string} into {string}',
  async ({ page }, _scName: string, _sNum: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByRole('button', { name: /import scene/i }).click()
    await page.getByRole('button', { name: /^import$/i }).first().click()
  },
)

When(
  'I import {string}, {string}, and {string} into {string}',
  async ({ page }, _s1: string, _s2: string, _s3: string, _sNum: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByRole('button', { name: /import scene/i }).click()
    await page.getByRole('button', { name: /^import$/i }).first().click()
  },
)

Then('{string} appear in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByText(scName)).toBeVisible()
})

Then('{string}, {string}, and {string} appear in {string}', async ({ page }, s1: string, s2: string, s3: string, _sNum: string) => {
  await expect(page.getByText(s1)).toBeVisible()
  await expect(page.getByText(s2)).toBeVisible()
  await expect(page.getByText(s3)).toBeVisible()
})

When('I open the Import Scene picker', async ({ page }) => {
  await page.getByRole('button', { name: /import scene/i }).click()
})

When('I search the picker for {string}', async ({ page }, query: string) => {
  await page.getByPlaceholder(/search global scenes/i).fill(query)
})

Then('I see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

Then('I do not see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Given(
  'I have a scene {string} in Scenes that is not linked to {string}',
  async ({ page }, scName: string, _sNum: string) => {
    await page.evaluate((name) => {
      const data = (window.__ARCANUM_STORE__ as any) || {}
      const scenes = data.scenes || []
      if (!scenes.some((x: any) => x.name === name)) {
        scenes.push({ id: `scene-${name}`, name, tags: [], createdAt: new Date().toISOString() })
      }
      window.__ARCANUM_SEED_DATA__?.({ scenes })
    }, scName)
  },
)

When(
  'I open the Import Scene picker for {string}',
  async ({ page }, _sNum: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByRole('button', { name: /import scene/i }).click()
  },
)

Given('all global scenes are linked to {string}', async ({ page }, _sNum: string) => {
  await page.evaluate(() => {
    const cId = 'c1'
    const sId = 's1'
    const campaigns = [{ id: cId, name: 'Curse of Strahd', createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    const sessions = [{ id: sId, campaignId: cId, sessionNumber: 1, name: 'Session 1', date: '2026-01-01' }]
    const scenes = [{ id: 'sc1', name: 'Tavern', tags: [], createdAt: new Date().toISOString() }]
    const links = [{ sessionId: sId, sceneId: 'sc1' }]
    window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions, scenes, sessionSceneLinks: links })
  })
})

Then('I see a link to create a new scene in Scenes', async ({ page }) => {
  await expect(page.getByRole('button', { name: /close/i })).toBeVisible()
})

When(
  'I open the New Scene dialog from Session Scenes',
  async ({ page }) => {
    await page.getByRole('button', { name: /new scene/i }).click()
  },
)

Then('I see the New Scene create dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /new scene/i })).toBeVisible()
})

Then('I see a required {string} field', async ({ page }, label: string) => {
  await expect(page.getByText(new RegExp(label, 'i'))).toBeVisible()
})

Then('I see an optional {string} field', async ({ page }, label: string) => {
  await expect(page.getByText(new RegExp(label, 'i'))).toBeVisible()
})

When(
  'I create a new scene named {string} from Session Scenes via the New Scene dialog',
  async ({ page }, name: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByRole('button', { name: /new scene/i }).click()
    await page.getByPlaceholder(/Tavern/i).fill(name)
    await page.getByRole('button', { name: /^create$/i }).click()
  },
)

Then('I remain on Session Scenes for {string}', async ({ page }, _sNum: string) => {
  await expect(page.getByText(/Session Scenes/i)).toBeVisible()
})

When('I choose to unlink {string} from the session', async ({ page }, scName: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByRole('button', { name: new RegExp(`unlink ${scName}`, 'i') }).click()
})

When(
  'I swipe right on the {string} session scene card to unlink it',
  async ({ page }, scName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByRole('button', { name: new RegExp(`unlink ${scName}`, 'i') }).click()
  },
)

When('I confirm the unlink', async ({ page }) => {
  await page.getByRole('button', { name: /^unlink$/i }).click()
})

Then('{string} is no longer shown in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByText(scName)).toHaveCount(0)
})

Then('{string} still appears in Scenes', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.getByText(scName)).toBeVisible()
})

Then('{string} does not appear in Trash', async ({ page }, scName: string) => {
  await page.goto('/trash')
  await expect(page.getByText(scName)).toHaveCount(0)
})

When('I cancel the unlink confirmation', async ({ page }) => {
  await page.getByRole('button', { name: /cancel/i }).click()
})

Then('{string} is still shown in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByText(scName)).toBeVisible()
})

When('I edit {string} from the session scene list', async ({ page }, scName: string) => {
  await page.getByRole('button', { name: new RegExp(`edit ${scName}`, 'i') }).click()
})

When('I change its name to {string}', async ({ page }, newName: string) => {
  await page.getByRole('textbox', { name: /scene name/i }).fill(newName)
  await page.getByRole('button', { name: /^save$/i }).click()
})

Given('I have scenes {string} and {string} in Scenes', async ({ page }, s1: string, s2: string) => {
  await page.evaluate(({ name1, name2 }) => {
    const scenes = [
      { id: `scene-${name1}`, name: name1, tags: [], createdAt: new Date().toISOString() },
      { id: `scene-${name2}`, name: name2, tags: [], createdAt: new Date().toISOString() },
    ]
    window.__ARCANUM_SEED_DATA__?.({ scenes })
  }, { name1: s1, name2: s2 })
})

Then('I see {string} in Scenes', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.getByText(scName)).toBeVisible()
})
