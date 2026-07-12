import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { assertSidebarItemHighlighted } from '../common/assertions'
import { SCREEN_PATHS } from '../../../src/lib/navigation'
import {
  clearSeedData,
  createCampaignSeed,
  getCampaignIdByName,
  lastPlayedTimestamp,
  seedCampaignWithSessions,
  setE2EFlags,
  TEST_COVER_DATA_URL,
  TEST_COVER_PNG,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

function campaignCard(page: Page, name: string): Locator {
  return page.locator('[data-testid="campaign-card"]', { has: page.locator(`[data-campaign-name="${name}"]`) })
}

async function openActiveCampaigns(page: Page): Promise<void> {
  await page.goto(SCREEN_PATHS['Active Campaigns screen'])
  await page.waitForLoadState('networkidle')
}

async function uploadCoverArt(page: Page, label: 'Campaign' | 'Session'): Promise<void> {
  await page.getByLabel(`${label} cover art area`).click()
  await page.getByLabel(`Upload ${label} cover art`).setInputFiles({
    name: 'test-cover.png',
    mimeType: 'image/png',
    buffer: TEST_COVER_PNG,
  })
}

// --- Given ---

Given('I have created campaigns named', async ({ page }, dataTable) => {
  await page.goto('/')
  await clearSeedData(page)
  const names = dataTable.raw().flat().filter(Boolean)
  for (const name of names) {
    await createCampaignSeed(page, { name })
  }
})

Given('I have a campaign {string} with no description', async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createCampaignSeed(page, { name })
})

Given(
  /^I have a campaign "([^"]+)" with (\d+) sessions?$/,
  async ({ page }, name: string, countText: string) => {
    await seedCampaignWithSessions(page, name, Number.parseInt(countText, 10))
  },
)

Given(/^I have a campaign "([^"]+)" with three sessions$/, async ({ page }, name: string) => {
  await seedCampaignWithSessions(page, name, 3)
})

Given(/^I have a campaign "([^"]+)" with no sessions$/, async ({ page }, name: string) => {
  await seedCampaignWithSessions(page, name, 0)
})

Given(
  /^I have campaigns "([^"]+)" and "([^"]+)"$/,
  async ({ page }, first: string, second: string) => {
    await page.goto('/')
    await clearSeedData(page)
    await createCampaignSeed(page, { name: first, lastPlayedAt: Date.now() - 86_400_000 })
    await createCampaignSeed(page, { name: second, lastPlayedAt: Date.now() })
  },
)

Given('{string} was played more recently', async ({ page }, name: string) => {
  const campaignId = await getCampaignIdByName(page, name)
  await page.evaluate(
    async ({ id, ts }) => {
      const { db } = await import('../../../src/lib/storage/db')
      await db.campaigns.update(id, { lastPlayedAt: ts })
    },
    { id: campaignId, ts: Date.now() },
  )
})

Given(
  /^I have a campaign "([^"]+)" with last played date "([^"]+)"$/,
  async ({ page }, name: string, playedDate: string) => {
    await page.goto('/')
    await clearSeedData(page)
    await createCampaignSeed(page, { name, lastPlayedAt: lastPlayedTimestamp(playedDate) })
  },
)

Given('campaign list data is still loading', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await setE2EFlags(page, { campaignsLoading: true })
})

Given('the campaign list fails to load', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await setE2EFlags(page, { campaignsLoadFail: true })
})

Given(/^I have a campaign "([^"]+)" with at least one session$/, async ({ page }, name: string) => {
  await seedCampaignWithSessions(page, name, 1)
})

Given(/^I am creating a new campaign "([^"]+)"$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await openActiveCampaigns(page)
  await page.getByRole('button', { name: 'Create Campaign' }).click()
  await page.getByLabel('Campaign name').fill(name)
})

Given(/^I have a campaign "([^"]+)" with cover art$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createCampaignSeed(page, { name, coverArtUrl: TEST_COVER_DATA_URL })
})

// --- When ---

When('I open the Active Campaigns screen', async ({ page }) => {
  await openActiveCampaigns(page)
})

When(/^I enter the campaign name "([^"]+)"$/, async ({ page }, name: string) => {
  await page.getByLabel('Campaign name').fill(name)
})

When('I confirm creation', async ({ page }) => {
  const campaignDialog = page.getByRole('dialog', { name: 'Create Campaign' })
  const sessionDialog = page.getByRole('dialog', { name: 'Add New Session' })

  if (await campaignDialog.isVisible()) {
    await campaignDialog.getByRole('button', { name: 'Create' }).click()
    return
  }

  if (await sessionDialog.isVisible()) {
    await sessionDialog.getByRole('button', { name: 'Create' }).click()
    return
  }

  throw new Error('No create dialog is open')
})

When(/^I enter the description "([^"]+)"$/, async ({ page }, description: string) => {
  await page.getByLabel('Description (optional)').fill(description)
})

When('I leave the campaign name empty', async ({ page }) => {
  await page.getByLabel('Campaign name').fill('')
})

When('I attempt to confirm creation', async ({ page }) => {
  const campaignDialog = page.getByRole('dialog', { name: 'Create Campaign' })
  const sessionDialog = page.getByRole('dialog', { name: 'Add New Session' })

  if (await campaignDialog.isVisible()) {
    await campaignDialog.getByRole('button', { name: 'Create' }).click()
    return
  }

  if (await sessionDialog.isVisible()) {
    await sessionDialog.getByRole('button', { name: 'Create' }).click()
  }
})

When('I cancel campaign creation', async ({ page }) => {
  await page.getByRole('dialog', { name: 'Create Campaign' }).getByRole('button', { name: 'Cancel' }).click()
})

When('I tap the cover art area', async ({ page }) => {
  const campaignPicker = page.getByLabel('Campaign cover art area')
  const sessionPicker = page.getByLabel('Session cover art area')

  if (await campaignPicker.isVisible()) {
    await campaignPicker.click()
    return
  }

  await sessionPicker.click()
})

When('I select an image from the browser upload dialog', async ({ page }) => {
  await uploadCoverArt(page, 'Campaign')
})

When(/^I tap the delete control on the "([^"]+)" card$/, async ({ page }, campaignName: string) => {
  await openActiveCampaigns(page)
  await campaignCard(page, campaignName)
    .getByRole('button', { name: `Delete ${campaignName}` })
    .click()
})

When(/^I delete "([^"]+)" from the campaigns list$/, async ({ page }, name: string) => {
  await openActiveCampaigns(page)
  await campaignCard(page, name).getByRole('button', { name: `Delete ${name}` }).click()
})

When(/^I tap "(Start|Resume)" on "([^"]+)"$/, async ({ page }, action: string, campaignName: string) => {
  await campaignCard(page, campaignName).getByRole('button', { name: `${action} ${campaignName}` }).click()
  await page.waitForLoadState('networkidle')
})

When(/^I tap the campaign title "([^"]+)"$/, async ({ page }, name: string) => {
  await campaignCard(page, name).getByRole('heading', { level: 2, name }).click()
})

// --- Then ---

Then(/^I see the page title "([^"]+)"$/, async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
})

Then(/^I see the empty state headline "([^"]+)"$/, async ({ page }, headline: string) => {
  await expect(page.getByTestId('campaigns-empty-state').getByText(headline)).toBeVisible()
})

Then(/^I see a "([^"]+)" card$/, async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
})

Then('I see all three campaigns in the list', async ({ page }) => {
  await expect(page.getByTestId('campaign-card')).toHaveCount(3)
})

Then(/^I see a "([^"]+)" card below the campaign list$/, async ({ page }, label: string) => {
  const cards = page.getByTestId('campaign-card')
  const createCard = page.getByTestId('create-campaign-card')
  await expect(cards.first()).toBeVisible()
  await expect(createCard).toBeVisible()

  const lastCampaignBox = await cards.last().boundingBox()
  const createBox = await createCard.boundingBox()
  if (!lastCampaignBox || !createBox) {
    throw new Error('Unable to compare campaign list order')
  }
  expect(createBox.y).toBeGreaterThan(lastCampaignBox.y)
  await expect(createCard).toContainText(label)
})

Then(/^I see "([^"]+)" on its campaign card$/, async ({ page }, name: string) => {
  await expect(campaignCard(page, name)).toBeVisible()
})

Then(/^I do not see a description on the "([^"]+)" card$/, async ({ page }, name: string) => {
  const card = campaignCard(page, name)
  await expect(card.locator('p.text-zinc-400')).toHaveCount(0)
})

Then(
  /^I see "([^"]+)" on the "([^"]+)" card$/,
  async ({ page }, text: string, campaignName: string) => {
    await expect(campaignCard(page, campaignName)).toContainText(text)
  },
)

Then(/^"([^"]+)" appears above "([^"]+)"$/, async ({ page }, upper: string, lower: string) => {
  const cards = page.getByTestId('campaign-card')
  const names = await cards.locator('[data-campaign-name]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-campaign-name')),
  )
  expect(names.indexOf(upper)).toBeLessThan(names.indexOf(lower))
})

Then('I see skeleton placeholders until campaigns load', async ({ page }) => {
  await expect(page.getByRole('status', { name: 'Loading campaigns' })).toBeVisible()
})

Then('I see an error message with a retry action', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText(/unable to load campaigns/i)
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

Then(
  /^I see a "([^"]+)" button on the "([^"]+)" card$/,
  async ({ page }, buttonLabel: string, campaignName: string) => {
    await expect(
      campaignCard(page, campaignName).getByRole('button', { name: `${buttonLabel} ${campaignName}` }),
    ).toBeVisible()
  },
)


Then('I remain on the Active Campaigns screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/campaigns$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Active Campaigns' })).toBeVisible()
})

Then(/^I see "([^"]+)" in my campaigns list$/, async ({ page }, name: string) => {
  await expect(campaignCard(page, name)).toBeVisible()
})

Then('the campaign is not created', async ({ page }) => {
  await expect(page.getByTestId('campaign-card')).toHaveCount(0)
})

Then('I see a validation message that a name is required', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText(/campaign name is required/i)
})

Then(/^no campaign named "([^"]+)" appears in my campaigns list$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-campaign-name="${name}"]`)).toHaveCount(0)
})

Then("the selected image is shown as the campaign's cover art", async ({ page }) => {
  const picker = page.getByTestId('cover-art-picker')
  await expect(picker.locator('img')).toBeVisible()
})

Then(/^I see the description snippet "([^"]+)" on the card$/, async ({ page }, snippet: string) => {
  await expect(page.getByText(snippet)).toBeVisible()
})

Then(/^"([^"]+)" is moved to the Trash Campaigns tab$/, async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.getByTestId('trash-campaigns-tab')).toContainText(name)
})

Then(/^its (\d+) sessions are hidden from the sessions list$/, async ({ page }) => {
  const sessionsPath = await page.evaluate(async () => {
    const { db, getCampaignSessionsPath } = await import('../../../src/lib/storage/db')
    const campaign = await db.campaigns.filter((item) => Boolean(item.deletedAt)).first()
    return campaign ? getCampaignSessionsPath(campaign.id) : null
  })
  if (!sessionsPath) {
    throw new Error('No deleted campaign found for session visibility check')
  }
  await page.goto(sessionsPath)
  await expect(page).toHaveURL(/\/campaigns\/?$/)
})

Then('no confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

Then('I see an undo action to restore the campaign', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
})

Then(/^I see "([^"]+)" as the page heading$/, async ({ page }, heading: string) => {
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
})

Then(/^I see "([^"]+)" as the page subtitle$/, async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle, { exact: true })).toBeVisible()
})

Then('I see the campaign hero banner with cover art', async ({ page }) => {
  const banner = page.getByTestId('campaign-hero-banner')
  await expect(banner).toBeVisible()
  await expect(banner.locator('img')).toBeVisible()
})

Then(/^the "([^"]+)" sidebar item is the active sidebar item$/, async ({ page }, item: string) => {
  await assertSidebarItemHighlighted(page, item)
})
