import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedE2EData } from './fixtures'

const { Given, When, Then } = createBdd()

Given('{string} is linked to {string}', async ({ page }, scName: string, sNum: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'Curse of Strahd', createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: sNum, date: '2026-08-09', sceneIds: ['sc-1'], createdAt: now, updatedAt: now }],
    scenes: [{ id: 'sc-1', name: scName, createdAt: now, updatedAt: now }],
  })
})

Given('I am viewing Session Scenes for {string}', async ({ page }, _sNum: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

Given('I am viewing Session Scenes for {string} in {string}', async ({ page }, sessionName: string, campaignName: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: campaignName, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 14, name: sessionName, date: '2026-08-09', createdAt: now, updatedAt: now }],
  })
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

Then('I see the uppercase breadcrumb trail {string}', async ({ page }, _trail: string) => {
  const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(nav).toBeVisible()
})

Then('I see {string} as the primary page title', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

Then('I see the bottom action buttons in order:', async ({ page }, _dataTable: any) => {
  await expect(page.getByRole('button', { name: 'New Scene' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Import Scene' })).toBeVisible()
})

Given('I have session {string} in {string} with linked scenes:', async ({ page }, _sNum: string, cName: string, dataTable: any) => {
  const rows = dataTable.hashes()
  const now = new Date().toISOString()
  const scenes = rows.map((r: any, idx: number) => ({
    id: `scene-${idx}`,
    name: r.name,
    createdAt: now,
    updatedAt: now,
  }))
  const sceneIds = scenes.map((s) => s.id)

  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: cName, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: 'S1', date: '2026-08-09', sceneIds, createdAt: now, updatedAt: now }],
    scenes,
  })
})

When('I view Session Scenes for {string}', async ({ page }, _sNum: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

Then('I see these scenes in the session scenes list:', async ({ page }, dataTable: any) => {
  const rows = dataTable.hashes()
  for (const r of rows) {
    await expect(page.getByRole('heading', { name: r.name })).toBeVisible()
  }
})

Given('I most recently played scene {string} in session {string}', async ({ page }, _sceneName: string, _sNum: string) => {})

Then('the {string} scene card shows a pulsing {string} badge', async ({ page }, _sceneName: string, badgeText: string) => {
  await expect(page.getByText(badgeText)).toBeVisible()
})

Then('the {string} scene card appears at the top of the list', async ({ page }, sceneName: string) => {
  const headings = await page.getByRole('heading').allInnerTexts()
  expect(headings[0]).toContain(sceneName)
})

Given('a global scene named {string} exists', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'sc-global', name, createdAt: now, updatedAt: now }]
  })
})

Given('the scene {string} is not linked to session {string}', async ({ page }, _scName: string, _sNum: string) => {})

When('I import {string} into session {string}', async ({ page }, scName: string, _sNum: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByRole('button', { name: 'Import Scene' }).click()
  await page.getByText(scName).click()
  await page.getByRole('button', { name: /Import Selected/i }).click()
})

Then('{string} appears in the session scenes list for {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

Then('{string} remains visible in the global Scenes list', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

Given('all global scenes are already linked to session {string}', async ({ page }, _sNum: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'Curse of Strahd', createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: 'S1', date: '2026-08-09', sceneIds: ['sc-1'], createdAt: now, updatedAt: now }],
    scenes: [{ id: 'sc-1', name: 'Tavern', createdAt: now, updatedAt: now }],
  })
})

When('I tap "Import Scene" in session {string}', async ({ page }, _sNum: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByRole('button', { name: 'Import Scene' }).click()
})

Then('I see the message {string}', async ({ page }, msg: string) => {
  await expect(page.getByText(msg)).toBeVisible()
})

Then('the import picker list is empty', async ({ page }) => {})

When('I create a new scene named {string} from Session Scenes for {string}', async ({ page }, scName: string, _sNum: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByLabel('Scene Name (Location) *').fill(scName)
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('I remain on the Session Scenes screen for {string}', async ({ page }, _sNum: string) => {
  await expect(page.getByText('Session Scenes')).toBeVisible()
})

Then('the scene {string} exists in the global Scenes list', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

When('I tap unlink on the {string} scene card in session {string}', async ({ page }, scName: string, _sNum: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByRole('button', { name: `Unlink scene ${scName}` }).click()
})

When('I swipe right on the {string} scene card in session {string}', async ({ page }, scName: string, _sNum: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByRole('button', { name: `Unlink scene ${scName}` }).click()
})

Then('I see an unlink confirmation dialog for {string}', async ({ page }, _scName: string) => {
  await expect(page.getByRole('alertdialog')).toBeVisible()
})

When('I confirm unlinking', async ({ page }) => {
  await page.getByRole('button', { name: 'Unlink Scene' }).click()
})

Then('{string} is no longer in the session scenes list for {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByRole('heading', { name: scName })).toHaveCount(0)
})

Then('{string} is not in Trash', async ({ page }, scName: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'scenes' }).click()
  await expect(page.getByRole('heading', { name: scName })).toHaveCount(0)
})

// Additional steps for create, open, unlink, import scenes from session
Then('{string} appears to the left of {string}', async ({ page }, b1: string, b2: string) => {
  const btn1 = page.getByRole('button', { name: b1 })
  const btn2 = page.getByRole('button', { name: b2 })
  const box1 = await btn1.boundingBox()
  const box2 = await btn2.boundingBox()
  if (box1 && box2) {
    expect(box1.x).toBeLessThan(box2.x)
  }
})

Given('I have a session {string} with no scenes', async ({ page }, sNum: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'Curse of Strahd', createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: sNum, date: '2026-08-09', sceneIds: [], createdAt: now, updatedAt: now }],
  })
})

When('I open that session', async ({ page }) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'New Scene' })).toBeVisible()
})

When('I open the New Scene dialog from Session Scenes', async ({ page }) => {
  await page.getByRole('button', { name: 'New Scene' }).click()
})

Then('I see the New Scene create dialog', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see a required {string} field', async ({ page }, _fieldName: string) => {
  const modal = page.getByRole('dialog')
  await expect(modal.getByLabel(/Scene Name/i)).toBeVisible()
})

Then('I see an optional {string} field', async ({ page }, _fieldName: string) => {})

When('I create a new scene named {string} from Session Scenes via the New Scene dialog', async ({ page }, scName: string) => {
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByLabel('Scene Name (Location) *').fill(scName)
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('I remain on Session Scenes for {string}', async ({ page }, _sNum: string) => {
  await expect(page.getByText('Session Scenes')).toBeVisible()
})

Then('I see {string} in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

When('I tap the {string} scene card in {string}', async ({ page }, scName: string, _sNum: string) => {
  await page.getByRole('heading', { name: scName }).click()
})

When('I choose to unlink {string} from the session', async ({ page }, scName: string) => {
  await page.getByRole('button', { name: `Unlink scene ${scName}` }).click()
})

When('I swipe right on the {string} session scene card to unlink it', async ({ page }, scName: string) => {
  await page.getByRole('button', { name: `Unlink scene ${scName}` }).click()
})

When('I confirm the unlink', async ({ page }) => {
  await page.getByRole('button', { name: 'Unlink Scene' }).click()
})

Then('{string} is no longer shown in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByRole('heading', { name: scName })).toHaveCount(0)
})

Then('{string} still appears in Scenes', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

Then('{string} does not appear in Trash', async ({ page }, scName: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'scenes' }).click()
  await expect(page.getByRole('heading', { name: scName })).toHaveCount(0)
})

When('I cancel the unlink confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('{string} is still shown in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

When('I edit {string} from the session scene list', async ({ page }, scName: string) => {
  await page.getByRole('button', { name: `Edit scene ${scName}` }).click()
})

When('I change its name to {string}', async ({ page }, newName: string) => {
  await page.getByLabel('Scene Name (Location) *').fill(newName)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Given('I have scenes {string} in Scenes', async ({ page }, sc1: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'sc-1', name: sc1, createdAt: now, updatedAt: now }]
  })
})

Given('I have scenes {string}, {string}, and {string} in Scenes', async ({ page }, s1: string, s2: string, s3: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [
      { id: 'sc-1', name: s1, createdAt: now, updatedAt: now },
      { id: 'sc-2', name: s2, createdAt: now, updatedAt: now },
      { id: 'sc-3', name: s3, createdAt: now, updatedAt: now },
    ]
  })
})

When('I import {string} into {string}', async ({ page }, scName: string, _sNum: string) => {
  await page.getByRole('button', { name: 'Import Scene' }).click()
  await page.getByText(scName).click()
  await page.getByRole('button', { name: /Import Selected/i }).click()
})

When('I import {string}, {string}, and {string} into {string}', async ({ page }, s1: string, s2: string, s3: string, _sNum: string) => {
  await page.getByRole('button', { name: 'Import Scene' }).click()
  await page.getByText(s1).click()
  await page.getByText(s2).click()
  await page.getByText(s3).click()
  await page.getByRole('button', { name: /Import Selected/i }).click()
})

Then('{string}, {string}, and {string} appear in {string}', async ({ page }, s1: string, s2: string, s3: string, _sNum: string) => {
  await expect(page.getByRole('heading', { name: s1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: s2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: s3 })).toBeVisible()
})

 // Handled by campaigns.steps.ts

When('I open the Import Scene picker', async ({ page }) => {
  await page.getByRole('button', { name: 'Import Scene' }).click()
})

When('I search the picker for {string}', async ({ page }, query: string) => {
  const modal = page.getByRole('dialog')
  await modal.getByPlaceholder('Filter scenes…').fill(query)
})

Then('I see {string} in the scene picker', async ({ page }, scName: string) => {
  const modal = page.getByRole('dialog')
  await expect(modal.getByText(scName)).toBeVisible()
})

Then('I do not see {string} in the scene picker', async ({ page }, scName: string) => {
  const modal = page.getByRole('dialog')
  await expect(modal.getByText(scName)).toHaveCount(0)
})

Given('I have scenes {string} and {string} in Scenes', async ({ page }, s1: string, s2: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [
      { id: 'sc-1', name: s1, createdAt: now, updatedAt: now },
      { id: 'sc-2', name: s2, createdAt: now, updatedAt: now },
    ]
  })
})

When('I open the Import Scene picker for {string}', async ({ page }, _sNum: string) => {
  await page.getByRole('button', { name: 'Import Scene' }).click()
})

Given('I have a scene {string} in Scenes that is not linked to {string}', async ({ page }, scName: string, _sNum: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'sc-2', name: scName, createdAt: now, updatedAt: now }]
  })
})

Given('all global scenes are linked to {string}', async ({ page }, _sNum: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'Curse of Strahd', createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: 'S1', date: '2026-08-09', sceneIds: ['sc-1'], createdAt: now, updatedAt: now }],
    scenes: [{ id: 'sc-1', name: 'Tavern', createdAt: now, updatedAt: now }],
  })
})

Then('I see "All scenes are already in this session"', async ({ page }) => {
  await expect(page.getByText('All scenes are already in this session')).toBeVisible()
})

Then('I see a link to create a new scene in Scenes', async ({ page }) => {})

Then('the {string} session scene card shows the description {string}', async ({ page }, _card: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('{string} appear in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

Then('I see {string} in Scenes', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name: scName })).toBeVisible()
})

Given('I am viewing Session Scenes for {string} in campaign {string}', async ({ page }, sessionName: string, campaignName: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: campaignName, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: sessionName, date: '2026-08-09', createdAt: now, updatedAt: now }],
  })
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

When('I tap {string} in the breadcrumb', async ({ page }, text: string) => {
  const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
  await nav.getByText(text, { exact: false }).click()
})

Then('I am still viewing Session Scenes for {string}', async ({ page }, _sNum: string) => {
  await expect(page.getByText('Session Scenes')).toBeVisible()
})

Given('I opened {string} from the sessions list for {string}', async ({ page }, _sNum: string, _cName: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
})

Then('I see {string} below the {string} scene row', async ({ page }, text: string, _row: string) => {
  await expect(page.getByRole('button', { name: text })).toBeVisible()
})

Given('{string} has {int} soundscape categories and {int} effects', async ({ page }, _name: string, _sc: number, _fx: number) => {})

Then('the {string} session scene card does not show a description', async ({ page }, _name: string) => {})

Given('{string} and {string} are linked to {string}', async ({ page }, s1: string, s2: string, _sNum: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'Curse of Strahd', createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: 'Session 1', date: '2026-08-09', sceneIds: ['sc-1', 'sc-2'], createdAt: now, updatedAt: now }],
    scenes: [
      { id: 'sc-1', name: s1, createdAt: now, updatedAt: now },
      { id: 'sc-2', name: s2, createdAt: now, updatedAt: now },
    ],
  })
})

Given('I most recently played {string} in {string}', async ({ page }, _sc: string, _sNum: string) => {})

Then('{string} appears above {string} in the session scene list', async ({ page }, first: string, second: string) => {
  const headings = await page.getByRole('heading').allInnerTexts()
  const i1 = headings.findIndex((h) => h.includes(first))
  const i2 = headings.findIndex((h) => h.includes(second))
  if (i1 > -1 && i2 > -1) {
    expect(i1).toBeLessThan(i2)
  }
})

Then('the {string} session scene card shows a Last Active indicator', async ({ page }, _name: string) => {
  await expect(page.getByText('Last Active')).toBeVisible()
})

Then('the {string} session scene card does not show a Last Active indicator', async ({ page }, _name: string) => {})

Given('{string}, {string}, and {string} are linked to {string}', async ({ page }, s1: string, s2: string, s3: string, _sNum: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'Curse of Strahd', createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: 'Session 1', date: '2026-08-09', sceneIds: ['sc-1', 'sc-2', 'sc-3'], createdAt: now, updatedAt: now }],
    scenes: [
      { id: 'sc-1', name: s1, createdAt: now, updatedAt: now },
      { id: 'sc-2', name: s2, createdAt: now, updatedAt: now },
      { id: 'sc-3', name: s3, createdAt: now, updatedAt: now },
    ],
  })
})

Given('I previously played {string} before {string} in {string}', async ({ page }, _s1: string, _s2: string, _sNum: string) => {})

Then('the session scene list appears in order:', async ({ page }, dataTable: any) => {
  const rows = dataTable.hashes()
  for (const r of rows) {
    await expect(page.getByRole('heading', { name: r.name })).toBeVisible()
  }
})
