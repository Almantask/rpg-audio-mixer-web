import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  buildCampaign,
  buildSession,
  campaignIdForName,
  ensureCampaignsScreen,
  mergeCampaign,
  openSessionScenes,
  parseRelativeDate,
  resetE2EData,
  seedE2EData,
  setE2EControls,
  tableColumnValues,
} from '../shared/test-data'
import { swipeRight } from '../shared/gestures'

const { Given, When, Then } = createBdd()

Given('I have no campaigns', async ({ page }) => {
  await resetE2EData(page)
})

Given('I have created campaigns named', async ({ page }, dataTable) => {
  const names = tableColumnValues(dataTable)
  const campaigns = names.map((name) => buildCampaign(name))
  await page.goto('/')
  await page.evaluate((data) => {
    localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
    window.__ARCANUM_E2E__?.seed(data)
  }, { campaigns, sessions: [], lastActiveSessionByCampaign: {} })
})

Given('I have a campaign {string} with no description', async ({ page }, name: string) => {
  await resetE2EData(page)
  await seedE2EData(page, { campaigns: [buildCampaign(name)] })
})

Given(
  'I have a campaign {string} with {int} sessions',
  async ({ page }, name: string, count: number) => {
    await resetE2EData(page)
    const campaign = buildCampaign(name)
    const sessions = Array.from({ length: count }, (_, index) =>
      buildSession(campaign.id, index + 1, `Session Night ${index + 1}`),
    )
    await seedE2EData(page, { campaigns: [campaign], sessions })
  },
)

Given(
  'I have a campaign {string} with at least one session',
  async ({ page }, name: string) => {
    await resetE2EData(page)
    const campaign = buildCampaign(name)
    await seedE2EData(page, {
      campaigns: [campaign],
      sessions: [buildSession(campaign.id, 1, 'Opening Night')],
    })
  },
)

Given(
  'I have a campaign {string} with three sessions',
  async ({ page }, name: string) => {
    await resetE2EData(page)
    const campaign = buildCampaign(name)
    await seedE2EData(page, {
      campaigns: [campaign],
      sessions: [
        buildSession(campaign.id, 1, 'Night One'),
        buildSession(campaign.id, 2, 'Night Two'),
        buildSession(campaign.id, 3, 'Night Three'),
      ],
    })
  },
)

Given('I have a campaign {string} with no sessions', async ({ page }, name: string) => {
  await resetE2EData(page)
  await seedE2EData(page, { campaigns: [buildCampaign(name)] })
})

Given('I have a campaign {string}', async ({ page }, name: string) => {
  await resetE2EData(page)
  await seedE2EData(page, { campaigns: [buildCampaign(name)] })
})

Given('I have a campaign {string} with cover art', async ({ page }, name: string) => {
  await resetE2EData(page)
  await seedE2EData(page, {
    campaigns: [
      buildCampaign(name, {
        coverArtUrl:
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23d4af37" width="80" height="80"/></svg>',
      }),
    ],
  })
})

Given(
  'I have campaigns {string} and {string}',
  async ({ page }, first: string, second: string) => {
    await resetE2EData(page)
    await seedE2EData(page, {
      campaigns: [buildCampaign(first), buildCampaign(second)],
    })
  },
)

Given('{string} was played more recently', async ({ page }, name: string) => {
  const campaignId = campaignIdForName(name)
  await page.evaluate((id) => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return
    const data = JSON.parse(raw)
    data.campaigns = data.campaigns.map((campaign: { id: string; lastPlayedAt?: string }) =>
      campaign.id === id
        ? { ...campaign, lastPlayedAt: new Date().toISOString() }
        : campaign,
    )
    localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
  }, campaignId)
})

Given(
  'I have a campaign {string} with last played date {string}',
  async ({ page }, name: string, relativeDate: string) => {
    const campaign = buildCampaign(name, {
      lastPlayedAt: new Date(parseRelativeDate(relativeDate)).toISOString(),
    })
    await mergeCampaign(page, campaign)
  },
)

Given('campaign list data is still loading', async ({ page }) => {
  await resetE2EData(page)
  await setE2EControls(page, { campaignListState: 'loading' })
})

Given('the campaign list fails to load', async ({ page }) => {
  await resetE2EData(page)
  await setE2EControls(page, { campaignListState: 'error' })
})

Given('I am on the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
  await expect(page.locator('[data-screen="Active Campaigns screen"]')).toBeVisible()
})

When('I open the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
  await page.waitForLoadState('networkidle')
})

When('I tap {string}', async ({ page }, label: string) => {
  if (label === 'Restore Selected') {
    await page.locator('[data-trash-restore-selected]').click()
    return
  }
  if (label === 'Create Campaign') {
    await ensureCampaignsScreen(page)
    await page.getByRole('button', { name: 'Create Campaign' }).click()
    return
  }
  if (label === 'Add Sound') {
    await page.locator('[data-soundboard-add]').click()
    return
  }
  if (/^Add Selected \(\d+\)$/.test(label)) {
    const soundscapeCommit = page.locator('[data-picker-commit]')
    if (await soundscapeCommit.count() > 0) {
      await soundscapeCommit.click()
    } else {
      await page.locator('[data-fx-picker-add-selected]').click()
    }
    return
  }
  if (label === 'Stop All') {
    await page.locator('[data-stop-all]').click()
    return
  }
  if (label === 'Play Scene') {
    await page.locator('[data-play-scene]').click()
    return
  }
  await page.getByRole('button', { name: label, exact: true }).click()
})

When('I enter the campaign name {string}', async ({ page }, name: string) => {
  await page.getByLabel('Campaign name').fill(name)
})

When('I enter the description {string}', async ({ page }, description: string) => {
  await page.getByLabel('Campaign description').fill(description)
})

When('I confirm creation', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: 'Create', exact: true }).click()
})

When('I leave the campaign name empty', async ({ page }) => {
  await page.getByLabel('Campaign name').fill('')
})

When('I attempt to confirm creation', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: 'Create', exact: true }).click()
})

When('I cancel campaign creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I am creating a new campaign {string}', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: 'Create Campaign' }).click()
  await page.getByLabel('Campaign name').fill(name)
})

When('I tap the cover art area', async ({ page }) => {
  await page.getByTestId('cover-art-area').click()
})

When('I select an image from the browser upload dialog', async ({ page }) => {
  await page.getByLabel(/cover art upload/i).setInputFiles({
    name: 'cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    ),
  })
})

When('I tap "Resume" on the {string} campaign card', async ({ page }, campaignName: string) => {
  await ensureCampaignsScreen(page)
  await page.locator(`[data-campaign-cta="${campaignName}"]`).click()
})

When('I tap "Resume" on {string}', async ({ page }, campaignName: string) => {
  await page.locator(`[data-campaign-cta="${campaignName}"]`).click()
})

When('I tap the campaign title {string}', async ({ page }, title: string) => {
  await page.locator(`[data-campaign-title="${title}"]`).click()
})

When(
  /^I (tap the delete control|swipe right) on the "([^"]+)" campaign card$/,
  async ({ page }, action: string, campaignName: string) => {
    if (action === 'tap the delete control') {
      await page.locator(`[data-delete-campaign="${campaignName}"]`).click()
      return
    }
    if (action === 'swipe right') {
      const card = page.locator(`[data-campaign-card="${campaignName}"]`)
      const swipeTarget = page.locator('[data-swipe-delete]').filter({ has: card })
      await swipeRight(swipeTarget)
      return
    }
    throw new Error(`Unknown delete action: ${action}`)
  },
)

When('I delete {string} from the campaigns list', async ({ page }, name: string) => {
  await ensureCampaignsScreen(page)
  await page.locator(`[data-delete-campaign="${name}"]`).click()
})

When('I open {string}', async ({ page }, name: string) => {
  if (name.startsWith('Session ')) {
    await openSessionScenes(page, name)
    return
  }
  await page.goto(`/campaigns/${campaignIdForName(name)}/sessions`)
})

When('I use browser back', async ({ page }) => {
  await page.goBack()
})

Then('I see {string} in my campaigns list', async ({ page }, name: string) => {
  await expect(page.locator(`[data-campaign-title="${name}"]`)).toBeVisible()
})

Then('I see a {string} card below the campaign list', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('I see {string} on its campaign card', async ({ page }, name: string) => {
  await expect(page.locator(`[data-campaign-title="${name}"]`)).toBeVisible()
})

Then(
  'I see the description snippet {string} on the {string} campaign card',
  async ({ page }, snippet: string, campaignName: string) => {
    const card = page.locator(`[data-campaign-card="${campaignName}"]`)
    await expect(card.getByText(snippet)).toBeVisible()
  },
)

Then('the campaign is not created', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see a validation message that a name is required', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('Campaign name is required')
})

Then('no campaign named {string} appears in my campaigns list', async ({ page }, name: string) => {
  await expect(page.locator(`[data-campaign-title="${name}"]`)).toHaveCount(0)
})

Then('I see the empty state headline {string}', async ({ page }, headline: string) => {
  await expect(page.getByText(headline)).toBeVisible()
})

Then(
  'the selected image is shown as the campaign\'s cover art',
  async ({ page }) => {
    await expect(page.locator('[data-testid="cover-art-area"] img')).toBeVisible()
  },
)

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible()
})



Then('I see a {string} card', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('I see all three campaigns in the list', async ({ page }) => {
  for (const name of ['The Shattered Throne', 'Curse of Strahd', 'The Wild Beyond']) {
    await expect(page.getByRole('heading', { level: 3, name })).toBeVisible()
  }
})

Then(
  'I do not see a description on the {string} campaign card',
  async ({ page }, campaignName: string) => {
    await expect(page.locator(`[data-campaign-description="${campaignName}"]`)).toHaveCount(0)
  },
)

Then(
  'I see {string} on the {string} campaign card',
  async ({ page }, text: string, campaignName: string) => {
    const card = page.locator(`[data-campaign-card="${campaignName}"]`)
    await expect(card.getByText(text)).toBeVisible()
  },
)

Then('I see skeleton placeholders until campaigns load', async ({ page }) => {
  await expect(page.getByTestId('campaigns-loading')).toBeVisible()
})

Then('I see an error message with a retry action', async ({ page }) => {
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

Then(
  'I see a {string} button on the {string} campaign card',
  async ({ page }, label: string, campaignName: string) => {
    const card = page.locator(`[data-campaign-card="${campaignName}"]`)
    await expect(card.getByRole('button', { name: label })).toBeVisible()
  },
)

Then('I see the sessions list for {string}', async ({ page }, campaignName: string) => {
  await expect(page.locator('[data-screen="Campaign Sessions screen"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: campaignName })).toBeVisible()
})

Then('I remain on the Active Campaigns screen', async ({ page }) => {
  await expect(page.locator('[data-screen="Active Campaigns screen"]')).toBeVisible()
})

Then('{string} is moved to the Trash Campaigns tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.locator(`[data-trashed-campaign="${name}"]`)).toBeVisible()
})

Then('its three sessions are hidden from the sessions list', async ({ page }) => {
  await expect(page.locator('[data-session-card]')).toHaveCount(0)
})

Then('no confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

Then('I see an undo action to restore the campaign', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
})
