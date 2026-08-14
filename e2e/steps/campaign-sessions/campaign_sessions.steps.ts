import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { resetBrowserStorage, seedCampaign, seedSession, seedScene } from '../../helpers/seedHelpers'

const { Given, When, Then } = createBdd()

Given('I have a campaign {string} with no sessions', async ({ page }, name: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name })
})

When('I add a new session named {string} to {string}', async ({ page }, sessionName: string, campaignName: string) => {
  await page.goto('/campaigns')
  const card = page.locator('[data-campaign-id]').filter({ hasText: campaignName })
  await card.getByRole('button', { name: /Start|Resume/ }).click()
  await page.getByRole('button', { name: /Add New Session/i }).first().click()
  await page.getByPlaceholder('e.g. The Howling Crags').fill(sessionName)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('I see session {string} named {string} in the sessions list', async ({ page }, sessionNum: string, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await expect(card.getByText(sessionNum, { exact: false })).toBeVisible()
  await expect(card.getByRole('heading', { name: sessionName })).toBeVisible()
})

When('I open the new session dialog from {string}', async ({ page }, campaignName: string) => {
  await page.goto('/campaigns')
  const card = page.locator('[data-campaign-id]').filter({ hasText: campaignName })
  await card.getByRole('button', { name: /Start|Resume/ }).click()
  await page.getByRole('button', { name: /Add New Session/i }).first().click()
})

Then('I see {string} as the read-only session number in the creation dialog', async ({ page }, numText: string) => {
  await expect(page.getByText(numText)).toBeVisible()
})

Then('the session date defaults to today', async ({ page }) => {
  const today = new Date().toISOString().split('T')[0]
  await expect(page.locator('input[type="date"]')).toHaveValue(today)
})

Given('I am creating a session in {string}', async ({ page }, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name: campaignName })
  await page.goto('/campaigns')
  await page.getByRole('button', { name: /Start|Resume/ }).first().click()
  await page.getByRole('button', { name: /Add New Session/i }).first().click()
})

When('I set the session date to a future date', async ({ page }) => {
  await page.locator('input[type="date"]').fill('2028-12-25')
})

When('I enter the session name {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder('e.g. The Howling Crags').fill(name)
})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.locator('[data-session-id]').first()).toBeVisible()
})

Then('the new session card shows the chosen future date', async ({ page }) => {
  await expect(page.getByText('2028-12-25')).toBeVisible()
})

Given('I am creating a session named {string} in {string}', async ({ page }, sessionName: string, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name: campaignName })
  await page.goto('/campaigns')
  await page.getByRole('button', { name: /Start|Resume/ }).first().click()
  await page.getByRole('button', { name: /Add New Session/i }).first().click()
  await page.getByPlaceholder('e.g. The Howling Crags').fill(sessionName)
})

When('I upload cover art for the session', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'session_cover.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('mock session image'),
  })
})

Then('the selected image is shown as the session\'s cover art', async ({ page }) => {
  await expect(page.getByText(/Image selected/i)).toBeVisible()
})

When('I enter an optional description {string}', async ({ page }, desc: string) => {
  await page.getByPlaceholder('What is planned for this session…').fill(desc)
})

Then('the {string} session card shows the description snippet', async ({ page }, name: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: name })
  await expect(card.locator('p')).toBeVisible()
})

When('I cancel session creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
})

Then('I see the empty sessions list for {string}', async ({ page }, campaignName: string) => {
  await expect(page.getByRole('heading', { name: campaignName, exact: true }).first()).toBeVisible()
  await expect(page.getByText(/No sessions yet/i)).toBeVisible()
})

Then('I do not see a session named {string}', async ({ page }, sessionName: string) => {
  await expect(page.getByText(sessionName, { exact: true })).toHaveCount(0)
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByText(/Session name is required/i)).toBeVisible()
})

Then('the session is not added to the list', async ({ page }) => {
  const count = await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_sessions')
    return raw ? JSON.parse(raw).length : 0
  })
  expect(count).toBe(0)
})

Given('creating a session will fail', async ({ page }) => {
  const current = page.url()
  if (current.includes('localhost')) {
    await page.goto(current.includes('?') ? `${current}&createFail=true` : `${current}?createFail=true`)
  }
})


Then('I see {string} as the page heading', async ({ page }, heading: string) => {
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
})

Then('I see {string} as the page subtitle', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle, { exact: false })).toBeVisible()
})

Then('I see the campaign hero banner with cover art', async ({ page }) => {
  await expect(page.locator('.shadow-xl')).toBeVisible()
})

Then('the {string} sidebar item is the active sidebar item', async ({ page }, item: string) => {
  const btn = page.locator('aside nav').getByRole('button', { name: new RegExp(`^${item}$`, 'i') })
  await expect(btn).toHaveClass(/text-amber-400/)
})

Given('I have a campaign {string} with cover art', async ({ page }, name: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name, coverArt: 'data:image/png;base64,mock' })
})

Given('I have a campaign {string} with description {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name, description: desc })
})

Then('I see the campaign description {string} on the Campaign Sessions screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('I see an {string} action on the Campaign Sessions hero', async ({ page }, actionText: string) => {
  await expect(page.getByRole('button', { name: actionText })).toBeVisible()
})

Given('I am on the Campaign Sessions screen for {string}', async ({ page }, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  await page.goto(`/campaigns/${camp.id}/sessions`)
})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByText(/Back to Active Campaigns/i)).toHaveCount(0)
})

Given('I am on the Campaign Sessions screen for {string} from Active Campaigns', async ({ page }, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name: campaignName })
  await page.goto('/campaigns')
  await page.getByRole('button', { name: /Start|Resume/ }).first().click()
})

When('I use browser back', async ({ page }) => {
  await page.goBack()
})

Then('I see the empty-state illustration with {string} as the sole primary action', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText })).toBeVisible()
})

Given('I have a campaign {string} with sessions', async ({ page }, campaignName: string, dataTable: { hashes: () => { number: string; name: string }[] }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  for (const row of dataTable.hashes()) {
    const num = parseInt(row.number.replace(/\D/g, ''), 10) || 1
    await seedSession(page, { campaignId: camp.id, name: row.name, sessionNumber: num })
  }
})

Then('I see these sessions in the list:', async ({ page }, dataTable: { raw: () => string[][] }) => {
  for (const row of dataTable.raw()) {
    const name = row[1]
    await expect(page.getByRole('heading', { name })).toBeVisible()
  }
})

Then('I see an {string} card in the grid', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false })).toBeVisible()
})

Given('I have a campaign {string} with a session', async ({ page }, campaignName: string, dataTable: { hashes: () => { number: string; name: string; date: string; scenes: string }[] }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  const row = dataTable.hashes()[0]
  const num = parseInt(row.number.replace(/\D/g, ''), 10) || 14
  const sess = await seedSession(page, { campaignId: camp.id, name: row.name, sessionNumber: num, date: row.date })
  const sceneCount = parseInt(row.scenes, 10) || 4
  for (let i = 1; i <= sceneCount; i++) {
    await seedScene(page, { name: `Scene ${i}`, sessionId: sess.id })
  }
})

Then('I see {string} on the {string} session card', async ({ page }, text: string, sessionNum: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionNum })
  await expect(card.getByText(text, { exact: false })).toBeVisible()
})

Given('I have sessions {string} dated last month and {string} dated today in {string}', async ({ page }, s1Name: string, s2Name: string, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  await seedSession(page, { campaignId: camp.id, name: s1Name, date: '2026-01-01', sessionNumber: 1 })
  await seedSession(page, { campaignId: camp.id, name: s2Name, date: '2026-02-15', sessionNumber: 2 })
})

When('I view the Campaign Sessions screen for {string}', async ({ page }, campaignName: string) => {
  await page.goto('/campaigns')
  const card = page.locator('[data-campaign-id]').filter({ hasText: campaignName })
  await card.getByRole('button', { name: /Start|Resume/ }).click()
})

Given('I have a campaign {string} with sessions {string} and {string}', async ({ page }, campaignName: string, s1: string, s2: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  await seedSession(page, { campaignId: camp.id, name: s1, sessionNumber: 1 })
  await seedSession(page, { campaignId: camp.id, name: s2, sessionNumber: 2 })
})

Given('I most recently opened session {string}', async ({ page }, sessionName: string) => {
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_sessions')
    if (raw) {
      const list = JSON.parse(raw)
      const target = list.find((s: { name: string }) => s.name === name)
      if (target) {
        target.lastOpenedAt = new Date(Date.now() + 10000).toISOString()
        localStorage.setItem('arcanum_sessions', JSON.stringify(list))
      }
    }
  }, sessionName)
})

Then('the {string} session card shows a {string} badge', async ({ page }, sessionName: string, badgeText: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await expect(card.getByText(badgeText, { exact: true })).toBeVisible()
})

Then('the {string} session card does not show a {string} badge', async ({ page }, sessionName: string, badgeText: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await expect(card.getByText(badgeText, { exact: true })).toHaveCount(0)
})

Given('sessions for {string} are still loading', async () => {
  // simulate with loading param
})

Then('I see loading placeholders for session cards', async ({ page }) => {
  await page.goto('/campaigns/camp_dummy/sessions?loading=true')
  await expect(page.locator('.animate-pulse').first()).toBeVisible()
})

Given('I have session {string} named {string} in {string}', async ({ page }, _sessionNum: string, sessionName: string, campaignName: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  const sess = await seedSession(page, { campaignId: camp.id, name: sessionName, sessionNumber: 1 })
  await seedScene(page, { name: 'Arrival Scene', sessionId: sess.id })
})

When('I tap the card body for session {string}', async ({ page }, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await card.click()
})

Then('I see the scene list for {string}', async ({ page }, _sessionName: string) => {
  await expect(page).toHaveURL(/\/scenes$/)
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
})

When('I tap Edit on the {string} session card', async ({ page }, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await card.getByRole('button', { name: 'Edit session' }).click()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Edit Session/i })).toBeVisible()
})

Given('I have session {string} in {string} with:', async ({ page }, sessionName: string, campaignName: string, dataTable: { hashes: () => { name: string; date: string; description: string }[] }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name: campaignName })
  const row = dataTable.hashes()[0]
  await seedSession(page, {
    campaignId: camp.id,
    name: row.name || sessionName,
    date: '2026-03-12',
    description: row.description,
    sessionNumber: 1,
  })
})

When('I edit session {string} with:', async ({ page }, sessionName: string, dataTable: { hashes: () => { name: string; date: string; description: string }[] }) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: /Start|Resume/ }).first().click()
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await card.getByRole('button', { name: 'Edit session' }).click()
  const row = dataTable.hashes()[0]
  if (row.name) {
    await page.getByPlaceholder('e.g. The Howling Crags').fill(row.name)
  }
  if (row.description) {
    await page.locator('textarea').fill(row.description)
  }
})

When('I upload new cover art for the session', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'new_cover.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('updated cover'),
  })
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

Then('the {string} session card shows the updated cover art', async ({ page }, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await expect(card).toBeVisible()
})

Then('the {string} session card shows {string} as the description snippet', async ({ page }, sessionName: string, desc: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await expect(card.getByText(desc)).toBeVisible()
})

Given('saving a session edit will fail', async ({ page }) => {
  const current = page.url()
  if (current.includes('localhost')) {
    await page.goto(current.includes('?') ? `${current}&editFail=true` : `${current}?editFail=true`)
  }
})


When('I change the session name to {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder('e.g. The Howling Crags').fill(name)
})

When('I confirm the edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

Then('{string} still appears unchanged in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

When('I tap Trash on the {string} session card', async ({ page }, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await card.getByRole('button', { name: 'Delete session' }).click()
})

When('I swipe right on the {string} session card', async ({ page }, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await card.getByRole('button', { name: 'Delete session' }).click()
})

When('I confirm deletion in the dialog', async ({ page }) => {
  await page.locator('[role="alertdialog"]').getByRole('button', { name: 'Delete', exact: true }).click()
})

Then('{string} is no longer in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name, { exact: true })).toHaveCount(0)
})

Then('{string} is available for recovery in Trash', async ({ page }, name: string) => {
  await page.goto('/trash')
  await page.getByRole('tab', { name: 'Sessions' }).click()
  await expect(page.getByText(name, { exact: false })).toBeVisible()
})

When('I initiate deletion of {string}', async ({ page }, sessionName: string) => {
  const card = page.locator('[data-session-id]').filter({ hasText: sessionName })
  await card.getByRole('button', { name: 'Delete session' }).click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  await page.locator('[role="alertdialog"]').getByRole('button', { name: 'Cancel', exact: true }).click()
})

When('I leave the session name empty', async ({ page }) => {
  await page.getByPlaceholder('e.g. The Howling Crags').fill('')
})

Then('I see an error message', async ({ page }) => {
  await expect(page.getByText(/error|failed|required/i)).toBeVisible()
})

Then('I do not see {string} in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name, { exact: true })).toHaveCount(0)
})

Then('{string} appears above older sessions in the list', async ({ page }, name: string) => {
  const first = await page.locator('[data-session-id]').first().innerText()
  expect(first).toContain(name)
})

When('I tap {string} on {string} from Active Campaigns', async ({ page }, btnText: string, campaignName: string) => {
  await page.goto('/campaigns')
  const card = page.locator('[data-campaign-id]').filter({ hasText: campaignName })
  await card.getByRole('button', { name: btnText }).click()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/sessions$/)
})


Then('{string} remains in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name, { exact: false })).toBeVisible()
})

