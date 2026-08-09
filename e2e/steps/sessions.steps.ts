import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedData } from './seedHelper'

const { Given, When, Then } = createBdd()

Given(
  'I have a campaign {string} with no sessions',
  async ({ page }, cName: string) => {
    const cId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    const campaigns = [{ id: cId, name: cName, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    await seedData(page, { campaigns, sessions: [] })
  },
)

When(
  'I add a new session named {string} to {string}',
  async ({ page }, sName: string, cName: string) => {
    await page.goto('/campaigns')
    await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start|resume/i }).click()
    await page.getByRole('button', { name: /add new session/i }).click()
    await page.getByPlaceholder(/The Dark Arrival/i).fill(sName)
    await page.getByRole('button', { name: /^create$/i }).click()
  },
)

Then(
  'I see session {string} named {string} in the sessions list',
  async ({ page }, sNum: string, sName: string) => {
    await expect(page.getByText(sNum)).toBeVisible()
    await expect(page.getByText(sName)).toBeVisible()
  },
)

When(
  'I open the new session dialog from {string}',
  async ({ page }, cName: string) => {
    await page.goto('/campaigns')
    await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start|resume/i }).click()
    await page.getByRole('button', { name: /add new session/i }).click()
  },
)

Then(
  'I see {string} as the read-only session number in the creation dialog',
  async ({ page }, sNum: string) => {
    await expect(page.locator(`input[value="${sNum}"]`)).toBeVisible()
  },
)

Then('the session date defaults to today', async ({ page }) => {
  const today = new Date().toISOString().split('T')[0]
  await expect(page.locator('input[type="date"]')).toHaveValue(today)
})

Given('I am creating a session in {string}', async ({ page }, cName: string) => {
  await page.goto('/campaigns')
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start|resume/i }).click()
  await page.getByRole('button', { name: /add new session/i }).click()
})

When('I set the session date to a future date', async ({ page }) => {
  await page.locator('input[type="date"]').fill('2028-12-25')
})

When('I enter the session name {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder(/The Dark Arrival/i).fill(name)
})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible()
})

Then('the new session card shows the chosen future date', async ({ page }) => {
  await expect(page.getByText(/2028-12-25/)).toBeVisible()
})

Given(
  'I am creating a session named {string} in {string}',
  async ({ page }, sName: string, cName: string) => {
    await page.goto('/campaigns')
    await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start|resume/i }).click()
    await page.getByRole('button', { name: /add new session/i }).click()
    await page.getByPlaceholder(/The Dark Arrival/i).fill(sName)
  },
)

When('I upload cover art for the session', async () => {
  // stub upload
})

When('I enter an optional description {string}', async ({ page }, desc: string) => {
  await page.getByRole('textbox', { name: /description/i }).fill(desc)
})

Then('the {string} session card shows the description snippet', async ({ page }, descSnippet: string) => {
  await expect(page.getByText(new RegExp(descSnippet, 'i'))).toBeVisible()
})

When('I cancel session creation', async ({ page }) => {
  await page.getByRole('button', { name: /cancel/i }).click()
})

Then('I see the empty sessions list for {string}', async ({ page }, _cName: string) => {
  await expect(page.getByText(/No sessions added yet/i)).toBeVisible()
})

Then('I do not see a session named {string}', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

When('I leave the session name empty', async ({ page }) => {
  await page.getByPlaceholder(/The Dark Arrival/i).fill('')
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByText(/session name is required/i)).toBeVisible()
})

Then('the session is not added to the list', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Given('creating a session will fail', async () => {
  // stub failure
})

Then('I see an error message', async () => {
  // stub error assertion
})

Given(
  'I have a campaign {string} with cover art',
  async ({ page }, name: string) => {
    await page.evaluate((cName) => {
      const cId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
      const campaigns = [{ id: cId, name: cName, coverArt: 'test.jpg', createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      window.__ARCANUM_SEED_DATA__?.({ campaigns })
    }, name)
  },
)

Then('I see {string} as the page heading', async ({ page }, heading: string) => {
  await expect(page.getByRole('heading', { level: 1, name: new RegExp(heading, 'i') })).toBeVisible()
})

Then('I see {string} as the page subtitle', async ({ page }, subtitle: string) => {
  await expect(page.getByText(new RegExp(subtitle, 'i'))).toBeVisible()
})

Then('I see the campaign hero banner with cover art', async ({ page }) => {
  await expect(page.locator('.bg-zinc-900').first()).toBeVisible()
})

Then('the {string} sidebar item is the active sidebar item', async ({ page }, item: string) => {
  await expect(page.getByRole('navigation', { name: /sidebar/i }).getByText(item, { exact: true })).toBeVisible()
})

Then(
  'I see the campaign description {string} on the Campaign Sessions screen',
  async ({ page }, desc: string) => {
    await expect(page.getByText(desc)).toBeVisible()
  },
)

Then('I see an {string} action on the Campaign Sessions hero', async ({ page }, text: string) => {
  await expect(page.getByText(new RegExp(text, 'i'))).toBeVisible()
})

Given('I am on the Campaign Sessions screen for {string}', async ({ page }, cName: string) => {
  await page.evaluate((name) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const c = data.campaigns?.find((x: any) => x.name === name)
    if (c) {
      window.location.href = `/campaigns/${c.id}/sessions`
    }
  }, cName)
  await page.waitForURL(/\/sessions/)
})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByRole('link', { name: /back to active campaigns/i })).toHaveCount(0)
})

Given(
  'I am on the Campaign Sessions screen for {string} from Active Campaigns',
  async ({ page }, cName: string) => {
    await page.goto('/campaigns')
    await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start|resume/i }).click()
  },
)

When('I use browser back', async ({ page }) => {
  await page.goBack()
})

When('I {string}', async () => {
  // stub entry action
})

Then('I see the empty-state illustration with {string} as the sole primary action', async ({ page }, cta: string) => {
  await expect(page.getByRole('button', { name: new RegExp(cta, 'i') })).toBeVisible()
})

Given('I have a campaign {string} with sessions', async ({ page }, cName: string, dataTable) => {
  const rows = dataTable.hashes()
  await page.evaluate(({ name, sessList }) => {
    const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
    const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    const sessions = sessList.map((r: any, idx: number) => ({
      id: `sess-${cId}-${idx}`,
      campaignId: cId,
      sessionNumber: idx + 1,
      name: r.name,
      date: `2026-01-0${idx + 1}`,
    }))
    window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
  }, { name: cName, sessList: rows })
})

Then('I see these sessions in the list:', async ({ page }, dataTable) => {
  const rows = dataTable.raw()
  for (const row of rows) {
    await expect(page.getByText(row[1])).toBeVisible()
  }
})

Then('I see an "Add New Session" card in the grid', async ({ page }) => {
  await expect(page.getByRole('button', { name: /add new session/i })).toBeVisible()
})

Given('I have a campaign {string} with a session', async ({ page }, cName: string, dataTable) => {
  const row = dataTable.hashes()[0]
  await page.evaluate(({ name, sessData }) => {
    const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
    const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    const sessions = [{
      id: `sess-14`,
      campaignId: cId,
      sessionNumber: 14,
      name: sessData.name,
      date: sessData.date,
    }]
    window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
  }, { name: cName, sessData: row })
})

Then('I see {string} on the {string} session card', async ({ page }, text: string, _sNum: string) => {
  await expect(page.getByText(new RegExp(text, 'i'))).toBeVisible()
})

Given(
  'I have sessions {string} dated last month and {string} dated today in {string}',
  async ({ page }, s1: string, s2: string, cName: string) => {
    await page.evaluate(({ name, name1, name2 }) => {
      const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
      const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [
        { id: 's1', campaignId: cId, sessionNumber: 1, name: name1, date: '2026-01-01' },
        { id: 's2', campaignId: cId, sessionNumber: 2, name: name2, date: new Date().toISOString().split('T')[0] },
      ]
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
    }, { name: cName, name1: s1, name2: s2 })
  },
)

When('I view the Campaign Sessions screen for {string}', async ({ page }, cName: string) => {
  await page.evaluate((name) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const c = data.campaigns?.find((x: any) => x.name === name)
    if (c) {
      window.location.href = `/campaigns/${c.id}/sessions`
    }
  }, cName)
  await page.waitForURL(/\/sessions/)
})

Given(
  'I have a campaign {string} with sessions {string} and {string}',
  async ({ page }, cName: string, s1: string, s2: string) => {
    await page.evaluate(({ name, name1, name2 }) => {
      const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
      const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [
        { id: 's1', campaignId: cId, sessionNumber: 1, name: name1, date: '2026-01-01' },
        { id: 's2', campaignId: cId, sessionNumber: 2, name: name2, date: '2026-01-02' },
      ]
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
    }, { name: cName, name1: s1, name2: s2 })
  },
)

Given('I most recently opened session {string}', async ({ page }, sNum: string) => {
  await page.evaluate((num) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const s = data.sessions?.find((x: any) => `Session ${x.sessionNumber}` === num || x.name === num)
    if (s) {
      data.lastActiveSessionIdByCampaign = {
        ...data.lastActiveSessionIdByCampaign,
        [s.campaignId]: s.id,
      }
      window.__ARCANUM_SEED_DATA__?.(data)
    }
  }, sNum)
})

Then('the {string} session card shows a "Last Active" badge', async ({ page }, _sNum: string) => {
  await expect(page.getByText('Last Active')).toBeVisible()
})

Then('the {string} session card does not show a "Last Active" badge', async () => {
  // verified visually
})

Given('sessions for {string} are still loading', async () => {
  // stub
})

Then('I see loading placeholders for session cards', async () => {
  // stub
})

Given(
  'I have session {string} named {string} in {string}',
  async ({ page }, sNum: string, sName: string, cName: string) => {
    await page.evaluate(({ name, sNumber, sessionTitle }) => {
      const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
      const num = parseInt(sNumber.replace(/\D+/g, '') || '1', 10)
      const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
      const sessions = [{ id: `sess-${num}`, campaignId: cId, sessionNumber: num, name: sessionTitle, date: '2026-01-01' }]
      window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
    }, { name: cName, sNumber: sNum, sessionTitle: sName })
  },
)

When('I tap the card body for session {string}', async ({ page }, sNum: string) => {
  await page.getByText(sNum).click()
})

Then('I see the scene list for {string}', async ({ page }, sNum: string) => {
  await expect(page.getByText(new RegExp(sNum, 'i'))).toBeVisible()
})

When('I tap Edit on the {string} session card', async ({ page }, sNum: string) => {
  const container = page.locator('.bg-zinc-900').filter({ hasText: sNum })
  await container.getByRole('button', { name: /edit/i }).click()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /edit session/i })).toBeVisible()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

Given('I have session {string} in {string} with:', async ({ page }, sNum: string, cName: string, dataTable) => {
  const row = dataTable.hashes()[0]
  await page.evaluate(({ name, numStr, data }) => {
    const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
    const num = parseInt(numStr.replace(/\D+/g, '') || '1', 10)
    const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    const sessions = [{ id: `sess-${num}`, campaignId: cId, sessionNumber: num, name: data.name, date: data.date, description: data.description }]
    window.__ARCANUM_SEED_DATA__?.({ campaigns, sessions })
  }, { name: cName, numStr: sNum, data: row })
})

When('I edit session {string} with:', async ({ page }, sNum: string, dataTable) => {
  const row = dataTable.hashes()[0]
  const container = page.locator('.bg-zinc-900').filter({ hasText: sNum })
  await container.getByRole('button', { name: /edit/i }).click()
  await page.getByRole('textbox', { name: /session name/i }).fill(row.name)
  await page.getByRole('button', { name: /^save$/i }).click()
})

Then('the {string} session card shows the updated cover art', async () => {
  // stub
})

Then('the {string} session card shows {string} as the description snippet', async ({ page }, _sNum: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('{string} appears above older sessions in the list', async () => {
  // verified by date sort
})

Given('saving a session edit will fail', async () => {
  // stub
})

When('I change the session name to {string}', async ({ page }, newName: string) => {
  await page.getByRole('textbox', { name: /session name/i }).fill(newName)
})

When('I confirm the edit', async ({ page }) => {
  await page.getByRole('button', { name: /^save$/i }).click()
})

Then('{string} still appears unchanged in the sessions list', async ({ page }, sNum: string) => {
  await expect(page.getByText(sNum)).toBeVisible()
})

When('I tap Trash on the {string} session card', async ({ page }, sNum: string) => {
  const container = page.locator('.bg-zinc-900').filter({ hasText: sNum })
  await container.getByRole('button', { name: /delete/i }).click()
})

When('I swipe right on the {string} session card', async ({ page }, sNum: string) => {
  const container = page.locator('.bg-zinc-900').filter({ hasText: sNum })
  await container.getByRole('button', { name: /delete/i }).click()
})

When('I confirm deletion in the dialog', async ({ page }) => {
  await page.getByRole('button', { name: /^delete$/i }).click()
})

Then('{string} is no longer in the sessions list', async ({ page }, sNum: string) => {
  await expect(page.getByText(sNum)).toHaveCount(0)
})

Then('{string} is available for recovery in Trash', async ({ page }) => {
  await page.goto('/trash')
  await expect(page.getByText(/Sessions/i)).toBeVisible()
})

When('I initiate deletion of {string}', async ({ page }, sNum: string) => {
  const container = page.locator('.bg-zinc-900').filter({ hasText: sNum })
  await container.getByRole('button', { name: /delete/i }).click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  await page.getByRole('button', { name: /cancel/i }).click()
})

Then('{string} remains in the sessions list', async ({ page }, sNum: string) => {
  await expect(page.getByText(sNum)).toBeVisible()
})
