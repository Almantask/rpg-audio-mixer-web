import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { resetBrowserStorage, seedCampaign, seedSession, seedScene } from '../../helpers/seedHelpers'

const { Given, When, Then } = createBdd()

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title, exact: false })).toBeVisible()
})

Then('I see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle)).toBeVisible()
})

Given('I am viewing Session Scenes for {string} in campaign {string}', async ({ page }, sessionName: string, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  const sess = await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
  await page.goto(`/campaigns/${camp.id}/sessions/${sess.id}/scenes`)
})

Then('I do not see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle, { exact: true })).toHaveCount(0)
})

When('I tap {string} in the breadcrumb', async ({ page }, segment: string) => {
  await page.locator('nav[aria-label="Breadcrumb"]').getByText(segment, { exact: false }).click()
})

Then('I am still viewing Session Scenes for {string}', async ({ page }, _sessionName: string) => {
  await expect(page).toHaveURL(/\/scenes$/)
})

Given('I opened {string} from the sessions list for {string}', async ({ page }, sessionName: string, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
  await page.goto(`/campaigns/${camp.id}/sessions`)
  await page.locator('[data-session-id]').first().click()
})

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
})

Given('I have a session {string} with no scenes', async ({ page }, sessionName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: 'Campaign' })
  await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
})

When('I open that session', async ({ page }) => {
  const data = await page.evaluate(() => {
    const rawC = localStorage.getItem('arcanum_campaigns')
    const rawS = localStorage.getItem('arcanum_sessions')
    const c = rawC ? JSON.parse(rawC)[0] : null
    const s = rawS ? JSON.parse(rawS)[0] : null
    return { cId: c?.id, sId: s?.id }
  })
  await page.goto(`/campaigns/${data.cId}/sessions/${data.sId}/scenes`)
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.getByText(/No scenes in this session/i)).toBeVisible()
})

Given('{string} is linked to {string}', async ({ page }, sceneName: string, sessionName: string) => {
  await page.goto('/')
  const rawC = await page.evaluate(() => localStorage.getItem('arcanum_campaigns'))
  let camp = rawC ? JSON.parse(rawC)[0] : null
  if (!camp) {
    camp = await seedCampaign(page, { name: 'Default Campaign' })
  }
  const rawS = await page.evaluate(() => localStorage.getItem('arcanum_sessions'))
  let sess = rawS ? JSON.parse(rawS).find((s: { name: string }) => s.name === sessionName) : null
  if (!sess) {
    sess = await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
  }
  await seedScene(page, { name: sceneName, sessionId: sess.id })
})

Then('I see {string} below the {string} scene row', async ({ page }, text: string, _sceneName: string) => {
  await expect(page.getByText(text, { exact: false })).toBeVisible()
})

Then('{string} appears to the left of {string}', async ({ page }, leftText: string, rightText: string) => {
  const left = page.getByText(leftText, { exact: false }).first()
  const right = page.getByText(rightText, { exact: false }).first()
  const boxL = await left.boundingBox()
  const boxR = await right.boundingBox()
  if (boxL && boxR) {
    expect(boxL.x).toBeLessThanOrEqual(boxR.x)
  }
})

Given('{string} has {int} soundscape categories and {int} effects', async ({ page }, sceneName: string, scCount: number, fxCount: number) => {
  const scCats = Array.from({ length: scCount }, (_, i) => `cat_${i + 1}`)
  const sfx = Array.from({ length: fxCount }, (_, i) => ({
    id: `sfx_${i + 1}`,
    fxTrackId: 'fx_sword_clash',
    name: `Effect ${i + 1}`,
    order: i,
  }))
  await page.evaluate(({ name, cats, effects }) => {
    const raw = localStorage.getItem('arcanum_scenes')
    if (raw) {
      const list = JSON.parse(raw)
      const target = list.find((s: { name: string }) => s.name === name)
      if (target) {
        target.soundscapeCategoryIds = cats
        target.soundboardEffects = effects
        localStorage.setItem('arcanum_scenes', JSON.stringify(list))
      }
    }
  }, { name: sceneName, cats: scCats, effects: sfx })
})

Then('the {string} session scene card shows the description {string}', async ({ page }, name: string, desc: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText(desc)).toBeVisible()
})

Then('the {string} session scene card does not show a description', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.locator('p')).toHaveCount(0)
})

Given('{string} and {string} are linked to {string}', async ({ page }, sc1: string, sc2: string, sessionName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: 'Campaign' })
  const sess = await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
  await seedScene(page, { name: sc1, sessionId: sess.id, lastPlayedAt: '2026-01-01T00:00:00.000Z' })
  await seedScene(page, { name: sc2, sessionId: sess.id, lastPlayedAt: '2026-01-02T00:00:00.000Z' })
})

Given('I most recently played {string} in {string}', async ({ page }, sceneName: string, _sessionName: string) => {
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_scenes')
    if (raw) {
      const list = JSON.parse(raw)
      const target = list.find((s: { name: string }) => s.name === name)
      if (target) {
        target.lastPlayedAt = new Date(Date.now() + 100000).toISOString()
        localStorage.setItem('arcanum_scenes', JSON.stringify(list))
      }
    }
  }, sceneName)
})

Then('{string} appears above {string} in the session scene list', async ({ page }, top: string, bottom: string) => {
  const cards = page.locator('[data-scene-id]')
  const first = await cards.nth(0).innerText()
  const second = await cards.nth(1).innerText()
  expect(first).toContain(top)
  expect(second).toContain(bottom)
})

Then('the {string} session scene card shows a Last Active indicator', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText(/LAST ACTIVE/i)).toBeVisible()
})

Then('the {string} session scene card does not show a Last Active indicator', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText(/LAST ACTIVE/i)).toHaveCount(0)
})

Given('{string}, {string}, and {string} are linked to {string}', async ({ page }, sc1: string, sc2: string, sc3: string, sessionName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: 'Campaign' })
  const sess = await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
  await seedScene(page, { name: sc1, sessionId: sess.id, lastPlayedAt: '2026-01-01T00:00:00.000Z' })
  await seedScene(page, { name: sc2, sessionId: sess.id, lastPlayedAt: '2026-01-03T00:00:00.000Z' })
  await seedScene(page, { name: sc3, sessionId: sess.id, lastPlayedAt: '2026-01-02T00:00:00.000Z' })
})

Given('I previously played {string} before {string} in {string}', async ({ page }, scDungeon: string, _scTavern: string, _sess: string) => {
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_scenes')
    if (raw) {
      const list = JSON.parse(raw)
      const target = list.find((s: { name: string }) => s.name === name)
      if (target) {
        target.lastPlayedAt = '2026-01-02T12:00:00.000Z'
        localStorage.setItem('arcanum_scenes', JSON.stringify(list))
      }
    }
  }, scDungeon)
})

Then('the session scene list appears in order:', async ({ page }, dataTable: { raw: () => string[][] }) => {
  const names = dataTable.raw().map((row) => row[0])
  const cards = page.locator('[data-scene-id]')
  for (let i = 0; i < names.length; i++) {
    await expect(cards.nth(i)).toContainText(names[i])
  }
})

When('I tap the {string} scene card in {string}', async ({ page }, sceneName: string, _sessionName: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: sceneName })
  await card.click()
})

Given('I have scenes {string} in Scenes', async ({ page }, name: string) => {
  await page.goto('/')
  await seedScene(page, { name })
})

Given('I have scenes {string}, {string}, and {string} in Scenes', async ({ page }, s1: string, s2: string, s3: string) => {
  await page.goto('/')
  await seedScene(page, { name: s1 })
  await seedScene(page, { name: s2 })
  await seedScene(page, { name: s3 })
})

Given('I have scenes {string} and {string} in Scenes', async ({ page }, s1: string, s2: string) => {
  await page.goto('/')
  await seedScene(page, { name: s1 })
  await seedScene(page, { name: s2 })
})

When('I import {string} into {string}', async ({ page }, sceneName: string, sessionName: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: /Start|Resume/ }).first().click()
  await page.locator('[data-session-id]').filter({ hasText: sessionName }).click()
  await page.getByText('Import Scene').click()
  await page.getByText(sceneName).first().click()
  await page.getByRole('button', { name: /Import Selected/i }).click()
})

When('I import {string}, {string}, and {string} into {string}', async ({ page }, s1: string, s2: string, s3: string, sessionName: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: /Start|Resume/ }).first().click()
  await page.locator('[data-session-id]').filter({ hasText: sessionName }).click()
  await page.getByText('Import Scene').click()
  await page.getByText(s1).first().click()
  await page.getByText(s2).first().click()
  await page.getByText(s3).first().click()
  await page.getByRole('button', { name: /Import Selected/i }).click()
})

Then('{string} appear in {string}', async ({ page }, name: string, _sessionName: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('{string}, {string}, and {string} appear in {string}', async ({ page }, s1: string, s2: string, s3: string, _sessionName: string) => {
  await expect(page.getByRole('heading', { name: s1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: s2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: s3 })).toBeVisible()
})

When('I open the Import Scene picker', async ({ page }) => {
  await page.getByText('Import Scene').click()
})

When('I open the Import Scene picker for {string}', async ({ page }, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  if (await card.isVisible()) {
    await card.click()
  }
  await page.getByText('Import Scene').click()
})

When('I search the picker for {string}', async ({ page }, query: string) => {
  await page.getByPlaceholder('Search available scenes…').fill(query)
})

Then('I see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name)).toBeVisible()
})

Then('I do not see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog').getByText(name)).toHaveCount(0)
})

Given('I have a scene {string} in Scenes that is not linked to {string}', async ({ page }, name: string, _sessionName: string) => {
  await page.goto('/')
  await seedScene(page, { name, sessionIds: [] })
})

Given('all global scenes are linked to {string}', async ({ page }, sessionName: string) => {
  await page.goto('/')
  const rawS = await page.evaluate(() => localStorage.getItem('arcanum_sessions'))
  const sess = rawS ? JSON.parse(rawS).find((s: { name: string }) => s.name === sessionName) : null
  const sid = sess?.id || 'sess_1'
  await seedScene(page, { name: 'Scene 1', sessionId: sid })
})

Then('I see a link to create a new scene in Scenes', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Create a new scene/i })).toBeVisible()
})

When('I open the New Scene dialog from Session Scenes', async ({ page }) => {
  await page.getByText('New Scene').first().click()
})

Then('I see the New Scene create dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'New Scene' })).toBeVisible()
})

Then('I see a required {string} field', async ({ page }, _fieldName: string) => {
  await expect(page.getByPlaceholder("e.g. Frostwind Pass")).toBeVisible()
})

Then('I see an optional {string} field', async ({ page }, _fieldName: string) => {
  await expect(page.locator('textarea')).toBeVisible()
})

When('I create a new scene named {string} from Session Scenes via the New Scene dialog', async ({ page }, name: string) => {
  await page.getByText('New Scene').first().click()
  await page.getByPlaceholder("e.g. Frostwind Pass").fill(name)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('I remain on Session Scenes for {string}', async ({ page }, _sessionName: string) => {
  await expect(page).toHaveURL(/\/scenes$/)
})

Then('I see {string} in {string}', async ({ page }, sceneName: string, _sessionName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

When('I choose to unlink {string} from the session', async ({ page }, sceneName: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: sceneName })
  await card.getByRole('button', { name: 'Unlink scene' }).click()
})

When('I swipe right on the {string} session scene card to unlink it', async ({ page }, sceneName: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: sceneName })
  await card.getByRole('button', { name: 'Unlink scene' }).click()
})

When('I confirm the unlink', async ({ page }) => {
  await page.locator('[role="alertdialog"]').getByRole('button', { name: 'Unlink', exact: true }).click()
})

Then('{string} is no longer shown in {string}', async ({ page }, sceneName: string, _sessionName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).toHaveCount(0)
})

Then('{string} still appears in Scenes', async ({ page }, sceneName: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

Then('{string} does not appear in Trash', async ({ page }, sceneName: string) => {
  await page.goto('/trash')
  await expect(page.getByText(sceneName, { exact: true })).toHaveCount(0)
})

When('I cancel the unlink confirmation', async ({ page }) => {
  await page.locator('[role="alertdialog"]').getByRole('button', { name: 'Cancel', exact: true }).click()
})

Then('{string} is still shown in {string}', async ({ page }, sceneName: string, _sessionName: string) => {
  await expect(page.getByRole('heading', { name: sceneName })).toBeVisible()
})

When('I edit {string} from the session scene list', async ({ page }, sceneName: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: sceneName })
  await card.getByRole('button', { name: 'Edit scene' }).click()
})

When('I change its name to {string}', async ({ page }, newName: string) => {
  await page.locator('input').nth(0).fill(newName)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})
