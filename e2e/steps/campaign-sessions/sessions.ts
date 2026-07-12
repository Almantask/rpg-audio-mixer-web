import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { formatSessionDate, todayIsoDate } from '../../../src/lib/format'
import { getCampaignSessionsPath } from '../../../src/lib/storage/db'
import {
  clearSeedData,
  createCampaignSeed,
  createSessionSeed,
  futureIsoDate,
  getCampaignIdByName,
  getSessionIdByLabel,
  isoDateFromKeyword,
  parseSessionNumber,
  seedCampaignWithNamedSessions,
  seedCampaignWithSessions,
  setE2EFlags,
  setSessionLastOpened,
  TEST_COVER_PNG,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

function sessionCard(page: Page, sessionLabel: string): Locator {
  return page.locator('[data-testid="session-card"]', {
    has: page.locator(`[data-session-label="${sessionLabel}"]`),
  })
}

async function openCampaignSessions(page: Page, campaignName: string): Promise<void> {
  const campaignId = await getCampaignIdByName(page, campaignName)
  await page.goto(getCampaignSessionsPath(campaignId))
  await page.waitForLoadState('networkidle')
}

async function uploadSessionCoverArt(page: Page): Promise<void> {
  await page.getByLabel('Session cover art area').click()
  await page.getByLabel('Upload Session cover art').setInputFiles({
    name: 'test-cover.png',
    mimeType: 'image/png',
    buffer: TEST_COVER_PNG,
  })
}

async function ensureSessionInCampaign(
  page: Page,
  sessionLabel: string,
  campaignName: string,
  details?: { name?: string; date?: string; description?: string; sceneCount?: number },
): Promise<void> {
  await page.goto('/')
  await clearSeedData(page)
  const campaignId = await createCampaignSeed(page, { name: campaignName })
  await createSessionSeed(page, {
    campaignId,
    name: details?.name ?? sessionLabel,
    number: parseSessionNumber(sessionLabel),
    date: details?.date ? isoDateFromKeyword(details.date) : undefined,
    description: details?.description,
    sceneCount: details?.sceneCount,
  })
}

// --- Given ---

Given(
  /^I have session "([^"]+)" in "([^"]+)"$/,
  async ({ page }, sessionLabel: string, campaignName: string) => {
    await ensureSessionInCampaign(page, sessionLabel, campaignName, { name: 'Session 1' })
  },
)

Given(
  /^I have session "([^"]+)" named "([^"]+)" in "([^"]+)"$/,
  async ({ page }, sessionLabel: string, sessionName: string, campaignName: string) => {
    await ensureSessionInCampaign(page, sessionLabel, campaignName, { name: sessionName })
  },
)

Given(
  /^I have session "([^"]+)" in "([^"]+)" with:$/,
  async ({ page }, sessionLabel: string, campaignName: string, dataTable) => {
    const row = dataTable.hashes()[0]
    await ensureSessionInCampaign(page, sessionLabel, campaignName, {
      name: row.name,
      date: row.date,
      description: row.description,
    })
  },
)

Given(/^I am on the Campaign Sessions screen for "([^"]+)"$/, async ({ page }, campaignName: string) => {
  await openCampaignSessions(page, campaignName)
})

Given(
  /^I am on the Campaign Sessions screen for "([^"]+)" from Active Campaigns$/,
  async ({ page }, campaignName: string) => {
    await page.goto('/campaigns')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: `Resume ${campaignName}` }).click()
    await page.waitForLoadState('networkidle')
  },
)

Given(/^I have a campaign "([^"]+)" with sessions$/, async ({ page }, campaignName: string, dataTable) => {
  const rows = dataTable.hashes()
  await seedCampaignWithNamedSessions(page, campaignName, rows)
})

Given(
  /^I have a campaign "([^"]+)" with a session$/,
  async ({ page }, campaignName: string, dataTable) => {
    const row = dataTable.hashes()[0]
    await seedCampaignWithNamedSessions(page, campaignName, [row])
  },
)

Given(
  /^I have sessions "([^"]+)" dated last month and "([^"]+)" dated today in "([^"]+)"$/,
  async ({ page }, firstLabel: string, secondLabel: string, campaignName: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const campaignId = await createCampaignSeed(page, { name: campaignName })
    await createSessionSeed(page, {
      campaignId,
      name: firstLabel,
      number: parseSessionNumber(firstLabel),
      date: isoDateFromKeyword('last month'),
    })
    await createSessionSeed(page, {
      campaignId,
      name: secondLabel,
      number: parseSessionNumber(secondLabel),
      date: isoDateFromKeyword('today'),
    })
  },
)

Given(
  /^I have a campaign "([^"]+)" with sessions "([^"]+)" and "([^"]+)"$/,
  async ({ page }, campaignName: string, first: string, second: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const campaignId = await createCampaignSeed(page, { name: campaignName })
    await createSessionSeed(page, {
      campaignId,
      name: first,
      number: parseSessionNumber(first),
    })
    await createSessionSeed(page, {
      campaignId,
      name: second,
      number: parseSessionNumber(second),
    })
  },
)

Given(/^I most recently opened session "([^"]+)"$/, async ({ page }, sessionLabel: string) => {
  const campaignId = await page.evaluate(async () => {
    const { db } = await import('../../../src/lib/storage/db')
    const campaign = await db.campaigns.filter((item) => !item.deletedAt).first()
    return campaign?.id
  })
  if (!campaignId) throw new Error('No active campaign found for Last Active setup')
  const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
  await setSessionLastOpened(page, sessionId, Date.now())
})

Given(/^sessions for "([^"]+)" are still loading$/, async ({ page }, campaignName: string) => {
  await seedCampaignWithSessions(page, campaignName, 1)
  await setE2EFlags(page, { sessionsLoading: true })
})

Given('saving a session edit will fail', async ({ page }) => {
  await setE2EFlags(page, { sessionSaveFail: true })
})

Given('creating a session will fail', async ({ page }) => {
  await setE2EFlags(page, { sessionCreateFail: true })
})

Given(/^I am creating a session in "([^"]+)"$/, async ({ page }, campaignName: string) => {
  await seedCampaignWithSessions(page, campaignName, 0)
  await openCampaignSessions(page, campaignName)
  await page.getByRole('button', { name: 'Add New Session' }).click()
})

Given(
  /^I am creating a session named "([^"]+)" in "([^"]+)"$/,
  async ({ page }, sessionName: string, campaignName: string) => {
    await seedCampaignWithSessions(page, campaignName, 0)
    await openCampaignSessions(page, campaignName)
    await page.getByRole('button', { name: 'Add New Session' }).click()
    await page.getByLabel('Session name').fill(sessionName)
  },
)

// --- When ---

When(/^I add a new session named "([^"]+)" to "([^"]+)"$/, async ({ page }, name: string, campaignName: string) => {
  await openCampaignSessions(page, campaignName)
  await page.getByRole('button', { name: 'Add New Session' }).click()
  await page.getByLabel('Session name').fill(name)
  await page.getByRole('dialog', { name: 'Add New Session' }).getByRole('button', { name: 'Create' }).click()
})

When(/^I open the new session dialog from "([^"]+)"$/, async ({ page }, campaignName: string) => {
  await openCampaignSessions(page, campaignName)
  await page.getByRole('button', { name: 'Add New Session' }).click()
})

When('I set the session date to a future date', async ({ page }) => {
  await page.getByLabel('Date').fill(futureIsoDate())
})

When(/^I enter the session name "([^"]+)"$/, async ({ page }, name: string) => {
  await page.getByLabel('Session name').fill(name)
})

When('I upload cover art for the session', async ({ page }) => {
  await uploadSessionCoverArt(page)
})

When(/^I enter an optional description "([^"]+)"$/, async ({ page }, description: string) => {
  await page.getByLabel('Description (optional)').fill(description)
})

When('I cancel session creation', async ({ page }) => {
  await page.getByRole('dialog', { name: 'Add New Session' }).getByRole('button', { name: 'Cancel' }).click()
})

When('I leave the session name empty', async ({ page }) => {
  await page.getByLabel('Session name').fill('')
})

When(/^I tap Trash on the "([^"]+)" card$/, async ({ page }, sessionLabel: string) => {
  await sessionCard(page, sessionLabel)
    .getByRole('button', { name: `Trash ${sessionLabel}` })
    .click()
})

When('I confirm deletion in the dialog', async ({ page }) => {
  await page.getByRole('alertdialog', { name: 'Delete session?' }).getByRole('button', { name: 'Delete' }).click()
})

When(/^I initiate deletion of "([^"]+)"$/, async ({ page }, sessionLabel: string) => {
  await sessionCard(page, sessionLabel).getByRole('button', { name: `Trash ${sessionLabel}` }).click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  await page.getByRole('alertdialog', { name: 'Delete session?' }).getByRole('button', { name: 'Cancel' }).click()
})

When(/^I edit session "([^"]+)" with:$/, async ({ page }, sessionLabel: string, dataTable) => {
  const row = dataTable.hashes()[0]
  await sessionCard(page, sessionLabel).getByRole('button', { name: `Edit ${sessionLabel}` }).click()
  await page.getByLabel('Session name').fill(row.name)
  await page.getByLabel('Date').fill(isoDateFromKeyword(row.date))
  await page.getByLabel('Description (optional)').fill(row.description)
})

When('I upload new cover art for the session', async ({ page }) => {
  await uploadSessionCoverArt(page)
  await page.getByRole('dialog', { name: 'Edit Session' }).getByRole('button', { name: 'Save' }).click()
})

When(/^I tap Edit on the "([^"]+)" card$/, async ({ page }, sessionLabel: string) => {
  await sessionCard(page, sessionLabel).getByRole('button', { name: `Edit ${sessionLabel}` }).click()
})

When(/^I change the session name to "([^"]+)"$/, async ({ page }, name: string) => {
  await page.getByLabel('Session name').fill(name)
})

When('I confirm the edit', async ({ page }) => {
  await page.getByRole('dialog', { name: 'Edit Session' }).getByRole('button', { name: 'Save' }).click()
})

When(/^I view the Campaign Sessions screen for "([^"]+)"$/, async ({ page }, campaignName: string) => {
  await openCampaignSessions(page, campaignName)
})

When('I use browser back', async ({ page }) => {
  await page.goBack()
  await page.waitForLoadState('networkidle')
})

When(/^I tap the card body for session "([^"]+)"$/, async ({ page }, sessionLabel: string) => {
  await sessionCard(page, sessionLabel).getByTestId('session-card-body').click()
  await page.waitForLoadState('networkidle')
})

When(/^I tap "Start" on "([^"]+)" from Active Campaigns$/, async ({ page }, campaignName: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: `Start ${campaignName}` }).click()
  await page.waitForLoadState('networkidle')
})

// --- Then ---

Then(/^I see "([^"]+)" as the read-only session number in the creation dialog$/, async ({ page }, label: string) => {
  await expect(page.getByLabel('Session number')).toHaveValue(label)
})

Then('the session date defaults to today', async ({ page }) => {
  await expect(page.getByLabel('Date')).toHaveValue(todayIsoDate())
})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.getByTestId('session-card').first()).toBeVisible()
})

Then('the session card shows the chosen future date', async ({ page }) => {
  await expect(page.getByTestId('session-card').first()).toContainText(formatSessionDate(futureIsoDate()))
})

Then("the selected image is shown as the session's cover art", async ({ page }) => {
  await expect(page.getByTestId('session-card').first().locator('img')).toBeVisible()
})

Then('the session card shows the description snippet', async ({ page }) => {
  await expect(page.getByTestId('session-card').first().locator('p.italic')).toBeVisible()
})

Then(/^I see the empty sessions list for "([^"]+)"$/, async ({ page }, campaignName: string) => {
  await expect(page.getByRole('heading', { level: 1, name: campaignName })).toBeVisible()
  await expect(page.getByTestId('sessions-empty-state')).toBeVisible()
})

Then(/^I do not see a session named "([^"]+)"$/, async ({ page }, name: string) => {
  await expect(page.getByText(name, { exact: true })).toHaveCount(0)
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText(/session name is required/i)
})

Then('the session is not added to the list', async ({ page }) => {
  await expect(page.getByTestId('session-card')).toHaveCount(0)
})

Then('I see an error message', async ({ page }) => {
  await expect(page.getByRole('alert').first()).toBeVisible()
})

Then(
  /^I see session "([^"]+)" named "([^"]+)" in the sessions list$/,
  async ({ page }, sessionLabel: string, sessionName: string) => {
    const card = sessionCard(page, sessionLabel)
    await expect(card).toBeVisible()
    await expect(card.getByRole('heading', { level: 3, name: sessionName })).toBeVisible()
  },
)

Then(/^"([^"]+)" is no longer in the sessions list$/, async ({ page }, sessionLabel: string) => {
  await expect(page.locator(`[data-session-label="${sessionLabel}"]`)).toHaveCount(0)
})

Then(/^"([^"]+)" is available for recovery in Trash$/, async ({ page }, sessionLabel: string) => {
  await page.goto('/trash')
  await expect(page.getByTestId('trash-sessions-tab')).toContainText(sessionLabel)
})

Then(/^"([^"]+)" remains in the sessions list$/, async ({ page }, sessionLabel: string) => {
  await expect(sessionCard(page, sessionLabel)).toBeVisible()
})

Then('the session card shows the updated cover art', async ({ page }) => {
  await expect(page.getByTestId('session-card').first().locator('img')).toBeVisible()
})

Then(/^the session card shows "([^"]+)" as the description snippet$/, async ({ page }, snippet: string) => {
  await expect(page.getByTestId('session-card').first()).toContainText(snippet)
})

Then(/^"([^"]+)" appears above older sessions in the list$/, async ({ page }, sessionLabel: string) => {
  const labels = await page.getByTestId('session-card').locator('[data-session-label]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-session-label')),
  )
  expect(labels[0]).toBe(sessionLabel)
})

Then(/^"([^"]+)" still appears unchanged in the sessions list$/, async ({ page }, sessionLabel: string) => {
  await expect(sessionCard(page, sessionLabel)).toBeVisible()
  await expect(sessionCard(page, sessionLabel).getByRole('heading', { level: 3 })).not.toContainText('Broken Save')
})

Then(
  /^the "([^"]+)" card shows a "([^"]+)" badge$/,
  async ({ page }, sessionLabel: string, badgeText: string) => {
    await expect(sessionCard(page, sessionLabel).getByText(badgeText, { exact: true })).toBeVisible()
  },
)

Then(
  /^the "([^"]+)" card does not show a "([^"]+)" badge$/,
  async ({ page }, sessionLabel: string, badgeText: string) => {
    await expect(sessionCard(page, sessionLabel).getByText(badgeText, { exact: true })).toHaveCount(0)
  },
)

Then('I see loading placeholders for session cards', async ({ page }) => {
  await expect(page.getByRole('status', { name: 'Loading sessions' })).toBeVisible()
})

Then(/^I see the scene list for "([^"]+)"$/, async ({ page }, sessionLabel: string) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText('Session Scenes')).toBeVisible()
  await expect(page.getByText(sessionLabel)).toBeVisible()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Edit Session' })).toBeVisible()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page.getByTestId('sessions-list')).toBeVisible()
  await expect(page.getByText('Campaign Sessions')).toBeVisible()
})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByRole('link', { name: /back to active campaigns/i })).toHaveCount(0)
})

Then(
  /^I see the empty-state illustration with "([^"]+)" as the sole primary action$/,
  async ({ page }, actionLabel: string) => {
    await expect(page.getByLabel('Empty sessions illustration')).toBeVisible()
    const primaryButtons = page.getByRole('button', { name: actionLabel })
    await expect(primaryButtons).toHaveCount(1)
  },
)

Then('I see these sessions in the list:', async ({ page }, dataTable) => {
  const rows = dataTable.raw().slice(1)
  for (const [sessionLabel, sessionName] of rows) {
    const card = sessionCard(page, sessionLabel)
    await expect(card).toBeVisible()
    await expect(card.getByRole('heading', { level: 3, name: sessionName })).toBeVisible()
  }
})

Then(/^I see an "([^"]+)" card in the grid$/, async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
})

Then(/^I see "([^"]+)" on the session card$/, async ({ page }, text: string) => {
  await expect(page.getByTestId('session-card').filter({ hasText: text }).first()).toBeVisible()
})
