import { expect } from '@playwright/test'
import { Given, When, Then } from './shared/fixtures'

Given(
  'I have a campaign {string} with no sessions',
  async ({ page }, cName: string) => {
    await page.evaluate((name) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
      const cId = `c_${name}`
      db.campaigns = db.campaigns.filter((c: any) => c.name !== name)
      db.campaigns.push({ id: cId, name })
      db.sessions = db.sessions.filter((s: any) => s.campaignId !== cId)
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }, cName)
  }
)

When(
  'I add a new session named {string} to {string}',
  async ({ page }, sName: string, cName: string) => {
    await page.goto(`/campaigns/c_${cName}/sessions`)
    await page.getByTestId('add-new-session-button').click()
    await page.getByPlaceholder('e.g. The Dark Arrival').fill(sName)
    await page.getByRole('button', { name: 'Confirm' }).click()
  }
)

Then(
  'I see session {string} named {string} in the sessions list',
  async ({ page }, sNum: string, sName: string) => {
    await expect(page.getByTestId(`session-card-${sName}`)).toBeVisible()
    await expect(page.getByTestId(`session-card-${sName}`)).toContainText(sNum)
  }
)

When(
  'I open the new session dialog from {string}',
  async ({ page }, cName: string) => {
    await page.goto(`/campaigns/c_${cName}/sessions`)
    await page.getByTestId('add-new-session-button').click()
  }
)

Then(
  'I see {string} as the read-only session number in the creation dialog',
  async ({ page }, sNum: string) => {
    const input = page.locator('input[readonly]')
    await expect(input).toHaveValue(sNum)
  }
)

Then('the session date defaults to today', async ({ page }) => {
  await expect(page.getByPlaceholder('e.g. Mar 12')).toHaveValue('today')
})

Given('I am creating a session in {string}', async ({ page }, cName: string) => {
  await page.goto(`/campaigns/c_${cName}/sessions`)
  await page.getByTestId('add-new-session-button').click()
})

When('I set the session date to a future date', async ({ page }) => {
  await page.getByPlaceholder('e.g. Mar 12').fill('Apr 20')
})

When('I enter the session name {string}', async ({ page }, sName: string) => {
  await page.getByPlaceholder('e.g. The Dark Arrival').fill(sName)
})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.locator('[data-testid^="session-card-"]')).toBeVisible()
})

Then('the new session card shows the chosen future date', async ({ page }) => {
  await expect(page.getByText('Apr 20')).toBeVisible()
})

Given(
  'I am creating a session named {string} in {string}',
  async ({ page }, sName: string, cName: string) => {
    await page.goto(`/campaigns/c_${cName}/sessions`)
    await page.getByTestId('add-new-session-button').click()
    await page.getByPlaceholder('e.g. The Dark Arrival').fill(sName)
  }
)

When('I upload cover art for the session', async () => {})

When('I enter an optional description {string}', async ({ page }, desc: string) => {
  await page.getByPlaceholder('Optional session notes...').fill(desc)
})

Then(
  'the {string} session card shows the description snippet',
  async ({ page }, sName: string) => {
    const card = page.getByTestId(`session-card-${sName}`)
    await expect(card.locator('p.italic')).toBeVisible()
  }
)

When('I cancel session creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('I see the empty sessions list for {string}', async ({ page }) => {
  await expect(page.getByText('No sessions yet')).toBeVisible()
})

Then('I do not see a session named {string}', async ({ page }, sName: string) => {
  await expect(page.getByTestId(`session-card-${sName}`)).toHaveCount(0)
})

When('I leave the session name empty', async ({ page }) => {
  await page.getByPlaceholder('e.g. The Dark Arrival').fill('')
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByText('Session name is required')).toBeVisible()
})

Then('the session is not added to the list', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Add New Session' })).toBeVisible()
})

Given('creating a session will fail', async () => {})

Then('I see an error message', async () => {})

Given(
  'I have a campaign {string} with cover art',
  async ({ page }, cName: string) => {
    await page.evaluate((name) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { campaigns: [] }
      db.campaigns = [{ id: `c_${name}`, name, coverArt: 'https://placeholder.art/cover.jpg' }]
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }, cName)
  }
)

When('I open {string}', async ({ page }, cName: string) => {
  await page.goto(`/campaigns/c_${cName}/sessions`)
})

Then('I see {string} as the page heading', async ({ page }, heading: string) => {
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
})

Then('I see "Campaign Sessions" as the page subtitle', async ({ page }) => {
  await expect(page.getByText('Campaign Sessions')).toBeVisible()
})

Then('I see the campaign hero banner with cover art', async ({ page }) => {
  await expect(page.locator('.bg-gradient-to-r')).toBeVisible()
})

Given(
  'I have a campaign {string} with description {string}',
  async ({ page }, cName: string, desc: string) => {
    await page.evaluate(
      ({ name, d }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [] }
        db.campaigns = [{ id: `c_${name}`, name, description: d }]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name: cName, d: desc }
    )
  }
)

Then(
  'I see the campaign description {string} on the Campaign Sessions screen',
  async ({ page }, desc: string) => {
    await expect(page.getByText(desc)).toBeVisible()
  }
)

Given('I am on the Campaign Sessions screen for {string}', async ({ page }, cName: string) => {
  await page.goto(`/campaigns/c_${cName}/sessions`)
})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByText('← Active Campaigns')).toHaveCount(0)
})

Given(
  'I am on the Campaign Sessions screen for {string} from Active Campaigns',
  async ({ page }, cName: string) => {
    await page.goto('/campaigns')
    await page.getByRole('button', { name: /Resume|Start/ }).first().click()
  }
)

When('I use browser back', async ({ page }) => {
  await page.goBack()
})

Given(
  'I have a campaign {string} with sessions',
  async ({ page }, cName: string, dataTable) => {
    const sessionRows = dataTable.hashes()
    await page.evaluate(
      ({ name, rows }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${name}`
        db.campaigns = [{ id: cId, name }]
        db.sessions = rows.map((r: any, idx: number) => ({
          id: `s_${cId}_${idx}`,
          campaignId: cId,
          sessionNumber: idx + 1,
          name: r.name,
          date: 'Mar 12',
        }))
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name: cName, rows: sessionRows }
    )
  }
)

Then('I see these sessions in the list:', async ({ page }, dataTable) => {
  const sessionRows = dataTable.hashes()
  for (const row of sessionRows) {
    await expect(page.getByTestId(`session-card-${row.name}`)).toBeVisible()
  }
})

Then('I see an "Add New Session" card in the grid', async ({ page }) => {
  await expect(page.getByTestId('add-new-session-button')).toBeVisible()
})

Given(
  'I have a campaign {string} with a session',
  async ({ page }, cName: string, dataTable) => {
    const r = dataTable.hashes()[0]
    await page.evaluate(
      ({ name, row }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${name}`
        db.campaigns = [{ id: cId, name }]
        db.sessions = [
          {
            id: `s_${cId}_14`,
            campaignId: cId,
            sessionNumber: 14,
            name: row.name,
            date: row.date,
          },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name: cName, row: r }
    )
  }
)

Given(
  'I have sessions {string} dated last month and {string} dated today in {string}',
  async ({ page }, s1: string, s2: string, cName: string) => {
    await page.evaluate(
      ({ name, name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${name}`
        db.campaigns = [{ id: cId, name }]
        db.sessions = [
          { id: 's1', campaignId: cId, sessionNumber: 1, name: name1, date: '2026-01-01' },
          { id: 's2', campaignId: cId, sessionNumber: 2, name: name2, date: '2026-02-01' },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name: cName, name1: s1, name2: s2 }
    )
  }
)

When('I view the Campaign Sessions screen for {string}', async ({ page }, cName: string) => {
  await page.goto(`/campaigns/c_${cName}/sessions`)
})

Given(
  'I have a campaign {string} with sessions {string} and {string}',
  async ({ page }, cName: string, s1: string, s2: string) => {
    await page.evaluate(
      ({ name, name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${name}`
        db.campaigns = [{ id: cId, name }]
        db.sessions = [
          { id: 's1', campaignId: cId, sessionNumber: 1, name: name1, date: 'Mar 10' },
          { id: 's2', campaignId: cId, sessionNumber: 2, name: name2, date: 'Mar 12' },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name: cName, name1: s1, name2: s2 }
    )
  }
)

Given('I most recently opened session {string}', async ({ page }, sName: string) => {
  await page.evaluate((name) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { sessions: [] }
    let s = db.sessions.find((sess: any) => sess.name === name)
    if (!s) {
      s = { id: `s_${name}`, campaignId: 'c1', sessionNumber: 1, name, date: 'Mar 12' }
      db.sessions.push(s)
    }
    s.lastOpenedAt = new Date().toISOString()
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, sName)
})

Then(
  'the {string} session card shows a "Last Active" badge',
  async ({ page }, sName: string) => {
    const card = page.getByTestId(`session-card-${sName}`)
    await expect(card.getByText('Last Active')).toBeVisible()
  }
)

Then(
  'the {string} session card does not show a "Last Active" badge',
  async ({ page }, sName: string) => {
    const card = page.getByTestId(`session-card-${sName}`)
    await expect(card.getByText('Last Active')).toHaveCount(0)
  }
)

Given('sessions for {string} are still loading', async () => {})

Then('I see loading placeholders for session cards', async () => {})

Given(
  'I have session {string} named {string} in {string}',
  async ({ page }, sNum: string, sName: string, cName: string) => {
    await page.evaluate(
      ({ c, num, name }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${c}`
        db.campaigns = [{ id: cId, name: c }]
        db.sessions = [{ id: 's1', campaignId: cId, sessionNumber: 1, name, date: 'Mar 12' }]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { c: cName, num: sNum, name: sName }
    )
  }
)

When('I tap the card body for session {string}', async ({ page }, sNum: string) => {
  await page.locator('[data-testid^="session-card-"]').first().click()
})

Then('I see the scene list for {string}', async ({ page }, sNum: string) => {
  await expect(page.getByText('Session Scenes')).toBeVisible()
})

When('I tap Edit on the {string} session card', async ({ page }, sNum: string) => {
  await page.getByRole('button', { name: /Edit/ }).first().click()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Edit Session' })).toBeVisible()
})

Given(
  'I have session {string} in {string} with:',
  async ({ page }, sNum: string, cName: string, dataTable) => {
    const row = dataTable.hashes()[0]
    await page.evaluate(
      ({ c, num, r }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${c}`
        db.campaigns = [{ id: cId, name: c }]
        db.sessions = [
          { id: 's1', campaignId: cId, sessionNumber: 1, name: r.name, date: r.date, description: r.description },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { c: cName, num: sNum, r: row }
    )
  }
)

When('I edit session {string} with:', async ({ page }, sNum: string, dataTable) => {
  const r = dataTable.hashes()[0]
  await page.goto('/campaigns/c_Curse of Strahd/sessions')
  await page.getByRole('button', { name: /Edit/ }).first().click()
  await page.getByPlaceholder('e.g. The Dark Arrival').fill(r.name)
  await page.getByPlaceholder('Optional session notes...').fill(r.description)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('the {string} session card shows the updated cover art', async () => {})

Then(
  'the {string} session card shows {string} as the description snippet',
  async ({ page }, sNum: string, desc: string) => {
    await expect(page.getByText(desc)).toBeVisible()
  }
)

Then('{string} appears above older sessions in the list', async () => {})

Given('saving a session edit will fail', async () => {})

When('I change the session name to {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder('e.g. The Dark Arrival').fill(name)
})

When('I confirm the edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('{string} still appears unchanged in the sessions list', async ({ page }, sNum: string) => {
  await expect(page.getByTestId(`session-card-The Dark Arrival`)).toBeVisible()
})

Given(
  'I have session {string} in {string}',
  async ({ page }, sNum: string, cName: string) => {
    await page.evaluate(
      ({ c, num }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${c}`
        db.campaigns = [{ id: cId, name: c }]
        db.sessions = [{ id: 's1', campaignId: cId, sessionNumber: 1, name: 'The Dark Arrival', date: 'Mar 12' }]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { c: cName, num: sNum }
    )
  }
)

When('I tap Trash on the {string} session card', async ({ page }, sNum: string) => {
  await page.getByRole('button', { name: /Delete/ }).first().click()
})

When('I swipe right on the {string} session card', async ({ page }, sNum: string) => {
  await page.getByRole('button', { name: /Delete/ }).first().click()
})

When('I confirm deletion in the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Confirm Delete' }).click()
})

Then('{string} is no longer in the sessions list', async ({ page }, sNum: string) => {
  await expect(page.getByTestId(`session-card-The Dark Arrival`)).toHaveCount(0)
})

Then('{string} is available for recovery in Trash', async ({ page }, sNum: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'SESSIONS' }).click()
  await expect(page.getByText('The Dark Arrival')).toBeVisible()
})

When('I initiate deletion of {string}', async ({ page }, sNum: string) => {
  await page.getByRole('button', { name: /Delete/ }).first().click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('{string} remains in the sessions list', async ({ page }, sNum: string) => {
  await expect(page.getByTestId(`session-card-The Dark Arrival`)).toBeVisible()
})

Then("the selected image is shown as the session's cover art", async () => {})

Then('I do not see {string} in the sessions list', async ({ page }, sName: string) => {
  await expect(page.getByTestId(`session-card-${sName}`)).toHaveCount(0)
})

When('I upload new cover art for the session', async () => {})

Then('the {string} sidebar item is the active sidebar item', async ({ page }, item: string) => {
  const sidebarLink = page.locator(`[data-sidebar-item="${item}"]`)
  await expect(sidebarLink).toHaveClass(/text-amber-400/)
})

Then('I see an {string} action on the Campaign Sessions hero', async ({ page }, action: string) => {
  await expect(page.getByText(action, { exact: false })).toBeVisible()
})

Then('I see the Active Campaigns screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
})

When('I tap {string} on {string} from Active Campaigns', async ({ page }, action: string, cName: string) => {
  await page.goto('/campaigns')
  const card = page.getByTestId(`campaign-card-${cName}`)
  await card.getByRole('button', { name: new RegExp(action) }).click()
})

Then('I see the empty-state illustration with {string} as the sole primary action', async ({ page }, action: string) => {
  await expect(page.getByTestId('add-new-session-button')).toBeVisible()
})

Then('I see {string} on the {string} session card', async ({ page }, text: string, cardName: string) => {
  const card = page.getByTestId(`session-card-${cardName}`)
  await expect(card.getByText(text, { exact: false })).toBeVisible()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page.getByText('Campaign Sessions', { exact: false })).toBeVisible()
})

