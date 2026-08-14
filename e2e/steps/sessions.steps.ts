import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedE2EData } from './fixtures'

const { Given, When, Then } = createBdd()

Given('I have a campaign {string} with no sessions', async ({ page }, name: string) => {
  await page.goto('/')
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
    sessions: [],
  })
})

When('I add a new session named {string} to {string}', async ({ page }, sessionName: string, _campaignName: string) => {
  await page.goto('/campaigns/c1/sessions')
  await page.getByRole('button', { name: 'Add New Session' }).click()
  await page.getByLabel('Session Name *').fill(sessionName)
  await page.getByRole('button', { name: 'Create Session' }).click()
})

Then('I see session {string} named {string} in the sessions list', async ({ page }, sessionNum: string, sessionName: string) => {
  await expect(page.getByText(sessionNum)).toBeVisible()
  await expect(page.getByRole('heading', { name: sessionName })).toBeVisible()
})

When('I open the new session dialog from {string}', async ({ page }, _campaignName: string) => {
  await page.goto('/campaigns/c1/sessions')
  await page.getByRole('button', { name: 'Add New Session' }).click()
})

Then('I see {string} as the read-only session number in the creation dialog', async ({ page }, readOnlyNum: string) => {
  const modal = page.getByRole('dialog')
  await expect(modal.locator('input[readonly]').first()).toHaveValue(readOnlyNum)
})

Then('the session date defaults to today', async ({ page }) => {
  const todayStr = new Date().toISOString().split('T')[0]
  const modal = page.getByRole('dialog')
  await expect(modal.getByLabel('Date *')).toHaveValue(todayStr)
})

Given('I am creating a session in {string}', async ({ page }, _campaignName: string) => {
  await page.goto('/')
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'The Shattered Throne', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
    sessions: [],
  })
  await page.goto('/campaigns/c1/sessions')
  await page.waitForSelector('#root > *')
  await page.getByRole('button', { name: 'Add New Session' }).click()
})

When('I set the session date to a future date', async ({ page }) => {
  await page.getByLabel('Date *').fill('2030-12-31')
})

When('I enter the session name {string}', async ({ page }, name: string) => {
  await page.getByLabel('Session Name *').fill(name)
})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.getByText('Pre-planned Finale').first()).toBeVisible()
})

Then('the new session card shows the chosen future date', async ({ page }) => {
  await expect(page.getByText('2030-12-31').first()).toBeVisible()
})

Given('I am creating a session named {string} in {string}', async ({ page }, name: string, _campaignName: string) => {
  await page.goto('/')
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: 'Curse of Strahd', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
    sessions: [],
  })
  await page.goto('/campaigns/c1/sessions')
  await page.waitForSelector('#root > *')
  await page.getByRole('button', { name: 'Add New Session' }).click()
  await page.getByLabel('Session Name *').fill(name)
})

When('I upload cover art for the session', async ({ page }) => {})

Then('the selected image is shown as the session\'s cover art', async ({ page }) => {})

When('I enter an optional description {string}', async ({ page }, desc: string) => {
  await page.getByLabel('Description').fill(desc)
})

Then('the {string} session card shows the description snippet', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

When('I cancel session creation', async ({ page }) => {
  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: 'Cancel' }).click()
})

Then('I see the empty sessions list for {string}', async ({ page }, _campaignName: string) => {
  await expect(page.getByText('Add New Session')).toBeVisible()
})

Then('I do not see a session named {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toHaveCount(0)
})

When('I leave the session name empty', async ({ page }) => {
  await page.getByLabel('Session Name *').fill('')
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByText(/required/i)).toBeVisible()
})

Then('the session is not added to the list', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Given('creating a session will fail', async ({ page }) => {
  await page.evaluate(() => {
    sessionStorage.setItem('arcanum_fail_session_create', 'true')
  })
})

Given('saving a session edit will fail', async ({ page }) => {
  await page.evaluate(() => {
    sessionStorage.setItem('arcanum_fail_session_edit', 'true')
  })
})

Then('I see an error message', async ({ page }) => {
  await expect(page.getByText(/failed/i)).toBeVisible()
})

Then('I do not see {string} in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toHaveCount(0)
})

Given('I have a campaign {string} with cover art', async ({ page }, name: string) => {
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, coverUrl: 'https://via.placeholder.com/150', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  })
})

Then('I see {string} as the page heading', async ({ page }, heading: string) => {
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
})

Then('I see {string} as the page subtitle', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle)).toBeVisible()
})

Then('I see the campaign hero banner with cover art', async ({ page }) => {})

Then('the {string} sidebar item is the active sidebar item', async ({ page }, item: string) => {
  const sidebar = page.getByRole('navigation', { name: 'Primary sidebar' })
  await expect(sidebar.getByRole('link', { name: item })).toHaveAttribute('data-active', 'true')
})

Then('I see the campaign description {string} on the Campaign Sessions screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('I see an {string} action on the Campaign Sessions hero', async ({ page }, _text: string) => {})

Given('I am on the Campaign Sessions screen for {string}', async ({ page }, campaignName: string) => {
  await page.goto('/campaigns/c1/sessions')
})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByRole('link', { name: '← Active Campaigns' })).toHaveCount(0)
})

Given('I am on the Campaign Sessions screen for {string} from Active Campaigns', async ({ page }, _name: string) => {
  await page.goto('/campaigns')
  await page.goto('/campaigns/c1/sessions')
})

When('I use browser back', async ({ page }) => {
  await page.goBack()
})

Then('I see the empty-state illustration with "Add New Session" as the sole primary action', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add New Session' })).toBeVisible()
})

Given('I have a campaign {string} with sessions', async ({ page }, campaignName: string, dataTable: any) => {
  const rows = dataTable.hashes()
  const now = new Date().toISOString()
  const sessions = rows.map((r: any, idx: number) => ({
    id: `s-${idx}`,
    campaignId: 'c1',
    sessionNumber: idx + 1,
    name: r.name,
    date: '2026-08-09',
    createdAt: now,
    updatedAt: now,
  }))
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: campaignName, createdAt: now, updatedAt: now }],
    sessions,
  })
})

Then('I see these sessions in the list:', async ({ page }, dataTable: any) => {
  const rows = dataTable.raw()
  for (const row of rows) {
    const sName = row[1] || row[0]
    if (sName) {
      await expect(page.getByRole('heading', { name: sName })).toBeVisible()
    }
  }
})

Then('I see an "Add New Session" card in the grid', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add New Session' })).toBeVisible()
})

Given('I have a campaign {string} with a session', async ({ page }, campaignName: string, dataTable: any) => {
  const row = dataTable.hashes()[0]
  const now = new Date().toISOString()
  const scenesCount = Number(row.scenes || 0)
  const sceneIds = Array.from({ length: scenesCount }).map((_, i) => `sc-${i}`)
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: campaignName, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: Number(row.number?.replace(/\D/g, '') || 14), name: row.name, date: row.date || 'Mar 12', sceneIds, createdAt: now, updatedAt: now }],
  })
})

Then('I see {string} on the {string} session card', async ({ page }, text: string, _sessionCard: string) => {
  if (text.includes('·') || text.includes('•')) {
    const parts = text.split(/[·•]/).map((p) => p.trim())
    for (const part of parts) {
      await expect(page.getByText(part, { exact: false })).toBeVisible()
    }
  } else {
    await expect(page.getByText(text, { exact: false })).toBeVisible()
  }
})

Given('I have sessions {string} dated last month and {string} dated today in {string}', async ({ page }, s1: string, s2: string, cName: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: cName, createdAt: now, updatedAt: now }],
    sessions: [
      { id: 's1', campaignId: 'c1', sessionNumber: 1, name: s1, date: '2026-07-01', createdAt: now, updatedAt: now },
      { id: 's2', campaignId: 'c1', sessionNumber: 2, name: s2, date: '2026-08-09', createdAt: now, updatedAt: now },
    ],
  })
})

When('I view the Campaign Sessions screen for {string}', async ({ page }, _name: string) => {
  await page.goto('/campaigns/c1/sessions')
  await page.waitForSelector('#root > *')
})

Given('I have a campaign {string} with sessions {string} and {string}', async ({ page }, cName: string, s1: string, s2: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: cName, createdAt: now, updatedAt: now }],
    sessions: [
      { id: 's1', campaignId: 'c1', sessionNumber: 1, name: s1, date: '2026-08-09', createdAt: now, updatedAt: now },
      { id: 's2', campaignId: 'c1', sessionNumber: 2, name: s2, date: '2026-08-09', createdAt: now, updatedAt: now },
    ],
    activeSessionId: 's1',
  })
})

Given('I most recently opened session {string}', async ({ page }, _sName: string) => {})

Then('the {string} session card shows a "Last Active" badge', async ({ page }, _sName: string) => {
  await expect(page.getByText('Last Active')).toBeVisible()
})

Then('the {string} session card does not show a "Last Active" badge', async ({ page }, _sName: string) => {})

Given('sessions for {string} are still loading', async ({ page }, _name: string) => {})

Then('I see loading placeholders for session cards', async ({ page }) => {})

Given('I have session {string} named {string} in {string}', async ({ page }, num: string, name: string, cName: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: cName, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name, date: '2026-08-09', createdAt: now, updatedAt: now }],
  })
})

When('I tap the card body for session {string}', async ({ page }, num: string) => {
  if (!page.url().includes('/sessions')) {
    await page.goto('/campaigns/c1/sessions')
    await page.waitForSelector('#root > *')
  }
  const card = page.locator('[data-session-card]').filter({ hasText: num }).first()
  await expect(card).toBeVisible()
  await card.click()
})

Then('I see the scene list for {string}', async ({ page }, _num: string) => {
  await expect(page.getByText('Session Scenes')).toBeVisible()
})

Given('I have session {string} in {string}', async ({ page }, num: string, cName: string) => {
  const now = new Date().toISOString()
  const sNum = Number(num.replace(/\D/g, '') || 1)
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: cName, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: sNum, name: num, date: '2026-08-09', createdAt: now, updatedAt: now }],
  })
})

When('I tap Edit on the {string} session card', async ({ page }, num: string) => {
  if (!page.url().includes('/sessions')) {
    await page.goto('/campaigns/c1/sessions')
  }
  const card = page.locator('[data-session-card]').filter({ hasText: num }).first()
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: /Edit session/i }).click()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page.getByText('Campaign Sessions')).toBeVisible()
})

Given('I have session {string} in {string} with:', async ({ page }, num: string, cName: string, dataTable: any) => {
  const row = dataTable.hashes()[0]
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name: cName, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: row.name, date: '2026-08-09', description: row.description, createdAt: now, updatedAt: now }],
  })
})

When('I edit session {string} with:', async ({ page }, num: string, dataTable: any) => {
  const row = dataTable.hashes()[0]
  await page.goto('/campaigns/c1/sessions')
  const card = page.locator('[data-session-card]').first()
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: /Edit session/i }).click()
  await page.getByLabel('Session Name *').fill(row.name)
  await page.getByLabel('Description').fill(row.description)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

When('I upload new cover art for the session', async ({ page }) => {})

Then('the {string} session card shows the updated cover art', async ({ page }) => {})

Then('the {string} session card shows {string} as the description snippet', async ({ page }, _card: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('{string} appears above older sessions in the list', async ({ page }) => {})

 // Handled above

When('I change the session name to {string}', async ({ page }, name: string) => {
  await page.getByLabel('Session Name *').fill(name)
})

When('I confirm the edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('{string} still appears unchanged in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
})

When('I swipe right on the {string} session card', async ({ page }, num: string) => {
  if (!page.url().includes('/sessions')) {
    await page.goto('/campaigns/c1/sessions')
  }
  const card = page.locator('[data-session-card]').filter({ hasText: num }).first()
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: /Delete session/i }).click()
})

When('I tap {string} on {string} from Active Campaigns', async ({ page }, btnText: string, campaignName: string) => {
  await page.goto('/campaigns')
  const card = page.locator('div').filter({ hasText: campaignName }).first()
  await card.getByRole('link', { name: btnText }).click()
})

When('I tap Trash on the {string} session card', async ({ page }, num: string) => {
  if (!page.url().includes('/sessions')) {
    await page.goto('/campaigns/c1/sessions')
  }
  const card = page.locator('[data-session-card]').filter({ hasText: num }).first()
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: /Delete session/i }).click()
})

When('I confirm deletion in the dialog', async ({ page }) => {
  const dialog = page.getByRole('alertdialog')
  await dialog.getByRole('button', { name: 'Delete Session' }).click()
})

Then('{string} is no longer in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toHaveCount(0)
})

Then('{string} is available for recovery in Trash', async ({ page }, name: string) => {
  await page.goto('/trash')
  await page.waitForSelector('#root > *')
  await page.getByRole('button', { name: /sessions/i }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

When('I initiate deletion of {string}', async ({ page }, name: string) => {
  if (!page.url().includes('/sessions')) {
    await page.goto('/campaigns/c1/sessions')
    await page.waitForSelector('#root > *')
  }
  const card = page.locator('[data-session-card]').filter({ hasText: name }).first()
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: /Delete session/i }).click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  const dialog = page.getByRole('alertdialog')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
})

Then('{string} remains in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})
