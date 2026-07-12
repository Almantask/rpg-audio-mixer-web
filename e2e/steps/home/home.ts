import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  clearSeedData,
  createCampaignSeed,
  createFxTrackSeed,
  createSessionSeed,
  createSoundscapeCategorySeed,
  getCampaignIdByName,
  setE2EFlags,
  setSessionLastOpened,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function setPlayStat(
  page: import('@playwright/test').Page,
  entityType: 'soundscape' | 'fx',
  entityId: string,
  playCount: number,
): Promise<void> {
  await page.evaluate(
    async ({ type, id, count }) => {
      await window.__arcanumSetPlayStat?.(type, id, count)
    },
    { type: entityType, id: entityId, count: playCount },
  )
}

Given(/^I have played "([^"]+)" most recently$/, async ({ page }, campaignName: string) => {
  await page.goto('/')
  await clearSeedData(page)
  const now = Date.now()
  await createCampaignSeed(page, { name: 'Older Campaign', lastPlayedAt: now - 86_400_000 })
  await createCampaignSeed(page, { name: campaignName, lastPlayedAt: now })
})

Given(
  /^"([^"]+)" has session data for "([^"]+)"$/,
  async ({ page }, campaignName: string, subtitle: string) => {
    const campaignId = await getCampaignIdByName(page, campaignName)
    const match = subtitle.match(/^Session (\d+): (.+)$/)
    const number = match ? Number.parseInt(match[1], 10) : 1
    const sessionName = match?.[2] ?? subtitle
    const sessionId = await createSessionSeed(page, {
      campaignId,
      name: sessionName,
      number,
    })
    await setSessionLastOpened(page, sessionId, Date.now())
  },
)

Given(/^"([^"]+)" has no sessions yet$/, async () => {
  // campaign already has zero sessions from prior step
})

Given(/^"([^"]+)" is the active campaign on the Home screen$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createCampaignSeed(page, { name, lastPlayedAt: Date.now(), sessionCount: 1 })
})

Given('Home screen data is still loading', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await setE2EFlags(page, { homeLoading: true })
})

Given('Home screen data fails to load with no cached content', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await setE2EFlags(page, { homeLoadFail: true, homeHasCachedData: false })
})

Given('Home screen data fails to load', async ({ page }) => {
  await page.goto('/')
  await setE2EFlags(page, { homeLoadFail: true, homeHasCachedData: true })
})

Given('cached hero and stat card data is available', async ({ page }) => {
  await createCampaignSeed(page, { name: 'Cached Campaign', lastPlayedAt: Date.now(), sessionCount: 1 })
})

Given('I am offline', async ({ page }) => {
  await setE2EFlags(page, { homeOffline: true })
})

Given('cached Home screen data is available', async ({ page }) => {
  await createCampaignSeed(page, { name: 'Cached Campaign', lastPlayedAt: Date.now(), sessionCount: 1 })
})

Given(
  /^"([^"]+)" is my most played soundscape category with (\d+) plays$/,
  async ({ page }, name: string, plays: string) => {
    await page.goto('/')
    await clearSeedData(page)
    await createCampaignSeed(page, { name: 'Campaign', lastPlayedAt: Date.now() })
    const categoryId = await createSoundscapeCategorySeed(page, name)
    await setPlayStat(page, 'soundscape', categoryId, Number.parseInt(plays, 10))
  },
)

Given(/^"([^"]+)" is my most played soundboard effect with (\d+) plays$/, async ({ page }, name: string, plays: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createCampaignSeed(page, { name: 'Campaign', lastPlayedAt: Date.now() })
  const fxId = await createFxTrackSeed(page, { name })
  await setPlayStat(page, 'fx', fxId, Number.parseInt(plays, 10))
})

Given(/^"([^"]+)" is shown in the Top FX card$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createCampaignSeed(page, { name: 'Campaign', lastPlayedAt: Date.now() })
  const fxId = await createFxTrackSeed(page, { name })
  await setPlayStat(page, 'fx', fxId, 128)
})

Given(/^"([^"]+)" is shown in the Top Soundscape card$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createCampaignSeed(page, { name: 'Campaign', lastPlayedAt: Date.now() })
  const categoryId = await createSoundscapeCategorySeed(page, name)
  await setPlayStat(page, 'soundscape', categoryId, 42)
})

Given('I have at least one campaign', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await createCampaignSeed(page, { name: 'Campaign', lastPlayedAt: Date.now() })
})

Given('no soundscape categories have been played yet', async () => {})
Given('no soundboard effects have been played yet', async () => {})

When('I open the Home screen', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

When(/^I tap "Resume" on the Active Campaigns hero$/, async ({ page }) => {
  await page.getByTestId('home-resume-button').click()
  await page.waitForLoadState('networkidle')
})

When(/^I tap "Create your first campaign" in the Active Campaigns hero$/, async ({ page }) => {
  await page.getByRole('link', { name: 'Create your first campaign' }).click()
})

When(/^I tap the preview button on the Top Soundscape card$/, async ({ page }) => {
  await page.getByTestId('top-soundscape-preview-button').click()
})

When(/^I tap the preview button on the Top FX card$/, async ({ page }) => {
  await page.getByTestId('top-fx-preview-button').click()
})

When(/^I tap the Library link on the Top Soundscape card$/, async ({ page }) => {
  await page.getByTestId('top-soundscape-card').getByRole('link', { name: 'Library' }).click()
})

When(/^I tap the Library link on the Top FX card$/, async ({ page }) => {
  await page.getByTestId('top-fx-card').getByRole('link', { name: 'Library' }).click()
})

Then('I see the {string} section', async ({ page }, section: string) => {
  await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible()
})

Then(/^I see "([^"]+)" in the Active Campaigns hero$/, async ({ page }, text: string) => {
  await expect(page.getByTestId('home-campaign-hero')).toContainText(text)
})

Then('I do not see a session context line in the Active Campaigns hero', async ({ page }) => {
  await expect(page.getByTestId('home-session-subtitle')).toHaveCount(0)
})

Then(/^I see a "Resume" button in the Active Campaigns hero$/, async ({ page }) => {
  await expect(page.getByTestId('home-resume-button')).toBeVisible()
})


Then('I do not see a {string} card on the Home screen', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toHaveCount(0)
})

Then('the Top Soundscape section is not shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Top Soundscape' })).toHaveCount(0)
})

Then('the Top FX section is not shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Top FX' })).toHaveCount(0)
})

Then('I see skeleton placeholders for the Active Campaigns hero', async ({ page }) => {
  await expect(page.getByTestId('home-campaign-hero')).toBeVisible()
})

Then('I see skeleton placeholders for the Top Soundscape card', async ({ page }) => {
  await expect(page.getByTestId('top-soundscape-card')).toBeVisible()
})

Then('I see skeleton placeholders for the Top FX card', async ({ page }) => {
  await expect(page.getByTestId('top-fx-card')).toBeVisible()
})

Then('I do not see campaign or stat card content on the Home screen', async ({ page }) => {
  await expect(page.getByTestId('home-resume-button')).toHaveCount(0)
})

Then('I still see the cached Active Campaigns hero', async ({ page }) => {
  await expect(page.getByTestId('home-campaign-hero')).toContainText('Cached Campaign')
})

Then('I still see cached Top Soundscape and Top FX cards when available', async ({ page }) => {
  await expect(page.getByTestId('top-soundscape-card')).toBeVisible()
})

Then('I see a stale or offline indicator on the Home screen', async ({ page }) => {
  await expect(page.getByTestId('home-offline-indicator')).toBeVisible()
})

Then(/^I see "(\d+) PLAYS" on the Top Soundscape card$/, async ({ page }, count: string) => {
  await expect(page.getByTestId('top-soundscape-card')).toContainText(`${count} PLAYS`)
})

Then(/^I see "(\d+) PLAYS" on the Top FX card$/, async ({ page }, count: string) => {
  await expect(page.getByTestId('top-fx-card')).toContainText(`${count} PLAYS`)
})

Then(/^I see "([^"]+)" and "([^"]+)" badges on the Top Soundscape card$/, async ({ page }, a: string, b: string) => {
  const card = page.getByTestId('top-soundscape-card')
  await expect(card).toContainText(a)
  await expect(card).toContainText(b)
})

Then(/^I see "([^"]+)" and "([^"]+)" badges on the Top FX card$/, async ({ page }, a: string, b: string) => {
  const card = page.getByTestId('top-fx-card')
  await expect(card).toContainText(a)
  await expect(card).toContainText(b)
})

Then('I see a progress bar on the Top Soundscape card', async ({ page }) => {
  await expect(page.getByTestId('top-soundscape-progress')).toBeVisible()
})

Then('I see a progress bar on the Top FX card', async ({ page }) => {
  await expect(page.getByTestId('top-fx-progress')).toBeVisible()
})

Then('the Top Soundscape section shows {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('top-soundscape-card')).toContainText(text)
})

Then('the Top FX section shows {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('top-fx-card')).toContainText(text)
})

Then('I do not see a bottom mini player on the Home screen', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toHaveCount(0)
})

Then('the preview buttons on the Top Soundscape and Top FX cards are disabled', async ({ page }) => {
  await expect(page.getByTestId('top-soundscape-preview-button')).toBeDisabled()
  await expect(page.getByTestId('top-fx-preview-button')).toBeDisabled()
})
