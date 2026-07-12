import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildCampaign,
  buildScene,
  buildSession,
  buildSessionSceneLink,
  campaignIdForName,
  mergeCampaign,
  openCampaignSessions,
  resetE2EData,
  seedE2EData,
  setE2EControls,
  tableRows,
} from '../shared/test-data'
import { swipeRight } from '../shared/gestures'

const { Given, When, Then } = createBdd()

Given(
  'I have a campaign {string} with sessions',
  async ({ page }, campaignName: string, dataTable) => {
    await resetE2EData(page)
    const campaign = buildCampaign(campaignName)
    const rows = tableRows(dataTable)
    const sessions = rows.map((row) =>
      buildSession(campaign.id, Number.parseInt(row[0]?.replace('Session ', '') ?? '1', 10), row[1] ?? ''),
    )
    await seedE2EData(page, { campaigns: [campaign], sessions })
  },
)

Given(
  'I have a campaign {string} with a session',
  async ({ page }, campaignName: string, dataTable) => {
    await resetE2EData(page)
    const campaign = buildCampaign(campaignName)
    const row = tableRows(dataTable)[0] ?? []
    const sceneCount = Number.parseInt(row[3] ?? '0', 10)
    const session = buildSession(
      campaign.id,
      Number.parseInt(row[0]?.replace('Session ', '') ?? '1', 10),
      row[1] ?? 'Untitled',
      {
        date: row[2] === 'Mar 12' ? '2026-03-12' : new Date().toISOString().slice(0, 10),
      },
    )
    const scenes = Array.from({ length: sceneCount }, (_, index) =>
      buildScene(`${session.name} Scene ${index + 1}`),
    )
    const sessionSceneLinks = scenes.map((scene) =>
      buildSessionSceneLink(session.id, scene.id),
    )
    await seedE2EData(page, {
      campaigns: [campaign],
      sessions: [session],
      scenes,
      sessionSceneLinks,
    })
  },
)

Given(
  'I have sessions {string} dated last month and {string} dated today in {string}',
  async ({ page }, sessionOne: string, sessionTwo: string, campaignName: string) => {
    await resetE2EData(page)
    const campaign = buildCampaign(campaignName)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    await seedE2EData(page, {
      campaigns: [campaign],
      sessions: [
        buildSession(campaign.id, 1, sessionOne, { date: lastMonth.toISOString().slice(0, 10) }),
        buildSession(campaign.id, 2, sessionTwo, { date: new Date().toISOString().slice(0, 10) }),
      ],
    })
  },
)

Given(
  'I have a campaign {string} with sessions {string} and {string}',
  async ({ page }, campaignName: string, first: string, second: string) => {
    await resetE2EData(page)
    const campaign = buildCampaign(campaignName)
    await seedE2EData(page, {
      campaigns: [campaign],
      sessions: [
        buildSession(campaign.id, 1, first),
        buildSession(campaign.id, 2, second),
      ],
    })
  },
)

Given(
  'I most recently opened session {string}',
  async ({ page }, sessionLabel: string) => {
    const number = Number.parseInt(sessionLabel.replace('Session ', ''), 10)
    await page.evaluate((sessionNumber) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      if (!raw) return
      const data = JSON.parse(raw)
      const session = data.sessions.find((s: { number: number }) => s.number === sessionNumber)
      if (!session) return
      data.lastActiveSessionByCampaign = {
        ...data.lastActiveSessionByCampaign,
        [session.campaignId]: session.id,
      }
      localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
    }, number)
  },
)

Given('sessions for {string} are still loading', async ({ page }, campaignName: string) => {
  const campaignId = campaignIdForName(campaignName)
  await resetE2EData(page)
  await seedE2EData(page, { campaigns: [buildCampaign(campaignName)] })
  await setE2EControls(page, { sessionsListState: { [campaignId]: 'loading' } })
})

Given('I have session {string} named {string} in {string}', async ({ page }, sessionLabel, sessionName, campaignName) => {
  await resetE2EData(page)
  const campaign = buildCampaign(campaignName)
  const number = Number.parseInt(sessionLabel.replace('Session ', ''), 10)
  await seedE2EData(page, {
    campaigns: [campaign],
    sessions: [buildSession(campaign.id, number, sessionName)],
  })
})

Given('I have session {string} in {string}', async ({ page }, sessionLabel, campaignName) => {
  await resetE2EData(page)
  const campaign = buildCampaign(campaignName)
  const number = Number.parseInt(sessionLabel.replace('Session ', ''), 10)
  await seedE2EData(page, {
    campaigns: [campaign],
    sessions: [buildSession(campaign.id, number, `Night ${number}`)],
  })
})

Given(
  'I have session {string} in {string} with:',
  async ({ page }, sessionLabel, campaignName, dataTable) => {
    await resetE2EData(page)
    const campaign = buildCampaign(campaignName)
    const number = Number.parseInt(sessionLabel.replace('Session ', ''), 10)
    const row = dataTable.rowsHash()
    await seedE2EData(page, {
      campaigns: [campaign],
      sessions: [
        buildSession(campaign.id, number, row.name, {
          date: row.date === 'today' ? new Date().toISOString().slice(0, 10) : row.date,
          description: row.description,
        }),
      ],
    })
  },
)

Given('I am on the Campaign Sessions screen for {string}', async ({ page }, campaignName: string) => {
  await page.goto(`/campaigns/${campaignIdForName(campaignName)}/sessions`)
})

Given(
  'I am on the Campaign Sessions screen for {string} from Active Campaigns',
  async ({ page }, campaignName: string) => {
    await resetE2EData(page)
    await seedE2EData(page, { campaigns: [buildCampaign(campaignName)] })
    await page.goto('/campaigns')
    await page.locator(`[data-campaign-cta="${campaignName}"]`).click()
  },
)

Given('creating a session will fail', async ({ page }) => {
  await page.goto('/')
  await setE2EControls(page, { createSessionFails: true })
})

Given('saving a session edit will fail', async ({ page }) => {
  await page.goto('/')
  await setE2EControls(page, { saveSessionFails: true })
})

Given('I am creating a session in {string}', async ({ page }, campaignName: string) => {
  await mergeCampaign(page, buildCampaign(campaignName))
  await openCampaignSessions(page, campaignName)
  await page.getByRole('button', { name: 'Add New Session' }).click()
})

Given(
  'I am creating a session named {string} in {string}',
  async ({ page }, sessionName: string, campaignName: string) => {
    await mergeCampaign(page, buildCampaign(campaignName))
    await openCampaignSessions(page, campaignName)
    await page.getByRole('button', { name: 'Add New Session' }).click()
    await page.getByLabel('Session name').fill(sessionName)
  },
)

When('I add a new session named {string} to {string}', async ({ page }, sessionName, campaignName) => {
  await page.goto(`/campaigns/${campaignIdForName(campaignName)}/sessions`)
  await page.getByRole('button', { name: 'Add New Session' }).click()
  await page.getByLabel('Session name').fill(sessionName)
  await page.getByRole('button', { name: 'Create' }).click()
})

When('I open the new session dialog from {string}', async ({ page }, campaignName: string) => {
  await page.goto(`/campaigns/${campaignIdForName(campaignName)}/sessions`)
  await expect(page.locator('[data-screen="Campaign Sessions screen"]')).toBeVisible()
  await page.getByTestId('add-new-session-card').click()
})

When('I set the session date to a future date', async ({ page }) => {
  const future = new Date()
  future.setDate(future.getDate() + 7)
  await page.getByLabel('Session date').fill(future.toISOString().slice(0, 10))
})

When('I enter the session name {string}', async ({ page }, name: string) => {
  await page.getByLabel('Session name').fill(name)
})

When('I upload cover art for the session', async ({ page }) => {
  await page.getByLabel(/cover art upload/i).setInputFiles({
    name: 'session-cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    ),
  })
})

When('I enter an optional description {string}', async ({ page }, description: string) => {
  await page.getByLabel('Session description').fill(description)
})

When('I cancel session creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I leave the session name empty', async ({ page }) => {
  await page.getByLabel('Session name').fill('')
})

When('I view the Campaign Sessions screen for {string}', async ({ page }, campaignName: string) => {
  await page.goto(`/campaigns/${campaignIdForName(campaignName)}/sessions`)
})

When('I tap the card body for session {string}', async ({ page }, sessionLabel: string) => {
  await page.locator(`[data-session-body="${sessionLabel}"]`).click()
})

When('I tap Edit on the {string} session card', async ({ page }, sessionLabel: string) => {
  await page.locator(`[data-edit-session="${sessionLabel}"]`).click()
})

When(
  'I edit session {string} with:',
  async ({ page }, sessionLabel: string, dataTable) => {
    await page.locator(`[data-edit-session="${sessionLabel}"]`).click()
    const row = dataTable.rowsHash()
    await page.getByLabel('Session name').fill(row.name)
    if (row.date === 'yesterday') {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      await page.getByLabel('Session date').fill(yesterday.toISOString().slice(0, 10))
    }
    if (row.description) {
      await page.getByLabel('Session description').fill(row.description)
    }
    await page.getByRole('button', { name: 'Save' }).click()
  },
)

When('I upload new cover art for the session', async ({ page }) => {
  await page.getByLabel(/cover art upload/i).setInputFiles({
    name: 'updated-cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    ),
  })
})

When('I change the session name to {string}', async ({ page }, name: string) => {
  await page.getByLabel('Session name').fill(name)
})

When('I confirm the edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Save' }).click()
})

When(
  /^I (tap Trash|swipe right) on the "([^"]+)" session card$/,
  async ({ page }, gesture: string, sessionLabel: string) => {
    if (gesture === 'tap Trash') {
      await page.locator(`[data-delete-session="${sessionLabel}"]`).click()
      return
    }
    if (gesture === 'swipe right') {
      const card = page.locator(`[data-session-card="${sessionLabel}"]`)
      const swipeTarget = page.locator('[data-swipe-delete]').filter({ has: card })
      await swipeRight(swipeTarget)
    }
  },
)

When('I confirm deletion in the dialog', async ({ page }) => {
  await page.getByRole('button', { name: /confirm delete/i }).click()
})

When('I initiate deletion of {string}', async ({ page }, sessionLabel: string) => {
  await page.locator(`[data-delete-session="${sessionLabel}"]`).click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When(
  'I tap "Start" on {string} from Active Campaigns',
  async ({ page }, campaignName: string) => {
    await page.goto('/campaigns')
    await page.locator(`[data-campaign-cta="${campaignName}"]`).click()
  },
)

When('I tap "Start" on {string}', async ({ page }, campaignName: string) => {
  await page.locator(`[data-campaign-cta="${campaignName}"]`).click()
})

Then('I see {string} as the page heading', async ({ page }, heading: string) => {
  await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible()
})

Then('I see {string} as the page subtitle', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle)).toBeVisible()
})

Then('I see the campaign hero banner with cover art', async ({ page }) => {
  await expect(page.getByTestId('campaign-hero-banner').locator('img')).toBeVisible()
})

Then('the {string} sidebar item is the active sidebar item', async ({ page }, item: string) => {
  await expect(page.locator(`[data-sidebar-item="${item}"]`)).toHaveAttribute('data-active', 'true')
})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByRole('link', { name: /back to active campaigns/i })).toHaveCount(0)
})

Then(
  'I see the empty-state illustration with {string} as the sole primary action',
  async ({ page }, label: string) => {
    await expect(page.getByRole('button', { name: label })).toBeVisible()
  },
)

Then('I see these sessions in the list:', async ({ page }, dataTable) => {
  const rows = tableRows(dataTable)
  for (const row of rows) {
    await expect(page.locator(`[data-session-number="${row[0]}"]`)).toBeVisible()
    await expect(page.locator(`[data-session-name="${row[0]}"]`)).toHaveText(row[1] ?? '')
  }
})

Then('I see an {string} card in the grid', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('I see {string} on the {string} session card', async ({ page }, text: string, sessionLabel: string) => {
  const card = page.locator(`[data-session-card="${sessionLabel}"]`)
  await expect(card.getByText(text, { exact: false })).toBeVisible()
})

Then(
  'the {string} session card shows a {string} badge',
  async ({ page }, sessionLabel: string, badge: string) => {
    const card = page.locator(`[data-session-card="${sessionLabel}"]`)
    await expect(card.getByText(badge)).toBeVisible()
  },
)

Then(
  'the {string} session card does not show a {string} badge',
  async ({ page }, sessionLabel: string, badge: string) => {
    const card = page.locator(`[data-session-card="${sessionLabel}"]`)
    await expect(card.getByText(badge)).toHaveCount(0)
  },
)

Then('I see loading placeholders for session cards', async ({ page }) => {
  await expect(page.getByTestId('sessions-loading')).toBeVisible()
})

Then('I see the scene list for {string}', async ({ page }, sessionLabel: string) => {
  const screen = page.getByRole('region', { name: 'Session Scenes screen' })
  await expect(screen).toBeVisible()
  await expect(screen.getByRole('heading', { level: 2 })).toContainText(sessionLabel)
  await expect(screen.getByText('Session Scenes', { exact: true })).toBeVisible()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Edit Session' })).toBeVisible()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page.locator('[data-screen="Campaign Sessions screen"]')).toBeVisible()
})

Then(
  'I see session {string} named {string} in the sessions list',
  async ({ page }, sessionLabel: string, sessionName: string) => {
    await expect(page.locator(`[data-session-number="${sessionLabel}"]`)).toBeVisible()
    await expect(page.locator(`[data-session-name="${sessionLabel}"]`)).toHaveText(sessionName)
  },
)

Then('I see {string} as the read-only session number in the creation dialog', async ({ page }, label: string) => {
  await expect(page.getByLabel('Session number')).toHaveValue(label)
})

Then('the session date defaults to today', async ({ page }) => {
  const today = await page.evaluate(() => window.__ARCANUM_E2E__?.formatTodayIso())
  await expect(page.getByLabel('Session date')).toHaveValue(today ?? '')
})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.locator('[data-session-card]').first()).toBeVisible()
})

Then('the new session card shows the chosen future date', async ({ page }) => {
  await expect(page.locator('[data-session-metadata]').first()).toBeVisible()
})

Then('the selected image is shown as the session\'s cover art', async ({ page }) => {
  await expect(page.locator('[data-testid="cover-art-area"] img')).toBeVisible()
})

Then('the {string} session card shows the description snippet', async ({ page }, sessionLabel: string) => {
  const card = page.locator(`[data-session-card="${sessionLabel}"]`)
  await expect(card.locator('.italic')).toBeVisible()
})

Then('I see the empty sessions list for {string}', async ({ page }, campaignName: string) => {
  await expect(page.getByRole('heading', { level: 2, name: campaignName })).toBeVisible()
  await expect(page.locator('[data-session-card]')).toHaveCount(0)
})

Then('I do not see a session named {string}', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('Session name is required')
})

Then('the session is not added to the list', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see an error message', async ({ page }) => {
  await expect(page.getByRole('alert').first()).toBeVisible()
})

Then('I do not see {string} in the sessions list', async ({ page }, name: string) => {
  await expect(page.locator(`[data-session-name]`).filter({ hasText: name })).toHaveCount(0)
})

Then('the {string} session card shows the updated cover art', async ({ page }, sessionLabel: string) => {
  const card = page.locator(`[data-session-card="${sessionLabel}"]`)
  await expect(card.locator('img').first()).toBeVisible()
})

Then(
  'the {string} session card shows {string} as the description snippet',
  async ({ page }, sessionLabel: string, snippet: string) => {
    const card = page.locator(`[data-session-card="${sessionLabel}"]`)
    await expect(card.getByText(snippet)).toBeVisible()
  },
)

Then('{string} still appears unchanged in the sessions list', async ({ page }, sessionLabel: string) => {
  await expect(page.locator(`[data-session-number="${sessionLabel}"]`)).toBeVisible()
})

Then('{string} is no longer in the sessions list', async ({ page }, sessionLabel: string) => {
  await expect(page.locator(`[data-session-number="${sessionLabel}"]`)).toHaveCount(0)
})

Then('{string} appears above older sessions in the list', async ({ page }, sessionLabel: string) => {
  const firstCard = page.locator('[data-session-card]').first()
  await expect(firstCard.locator(`[data-session-number="${sessionLabel}"]`)).toBeVisible()
})

Then('{string} is available for recovery in Trash', async ({ page }, sessionLabel: string) => {
  await page.goto('/trash?tab=sessions')
  const sessionsTab = page.getByRole('region', { name: 'Trash Sessions tab' })
  await expect(sessionsTab.getByText(new RegExp(`^${sessionLabel}:`))).toBeVisible()
})

Then('{string} remains in the sessions list', async ({ page }, sessionLabel: string) => {
  await expect(page.locator(`[data-session-number="${sessionLabel}"]`)).toBeVisible()
})
