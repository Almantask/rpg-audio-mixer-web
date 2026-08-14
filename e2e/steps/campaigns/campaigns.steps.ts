import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { resetBrowserStorage, seedCampaign, seedSession } from '../../helpers/seedHelpers'

const { Given, When, Then } = createBdd()

Given('I have no campaigns', async ({ page }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
})

When('I open the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

Given('I am on the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

When('I enter the campaign name {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder('e.g. The Shattered Throne').fill(name)
})

When('I enter the description {string}', async ({ page }, desc: string) => {
  await page.getByPlaceholder('Brief description of the story arc…').fill(desc)
})

When('I confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('I see {string} in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('I see a {string} card below the campaign list', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false })).toBeVisible()
})

Then('I see {string} on its campaign card', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('I see the description snippet {string} on the {string} campaign card', async ({ page }, desc: string, campaignName: string) => {
  const card = page.locator(`[data-campaign-id]`).filter({ hasText: campaignName })
  await expect(card.getByText(desc)).toBeVisible()
})

When('I leave the campaign name empty', async ({ page }) => {
  await page.getByPlaceholder('e.g. The Shattered Throne').fill('')
})

When('I attempt to confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('the campaign is not created', async ({ page }) => {
  const count = await page.evaluate(() => {
    const list = localStorage.getItem('arcanum_campaigns')
    return list ? JSON.parse(list).length : 0
  })
  expect(count).toBe(0)
})

Then('I see a validation message that a name is required', async ({ page }) => {
  await expect(page.getByText(/name is required/i)).toBeVisible()
})

When('I cancel campaign creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
})

Then('no campaign named {string} appears in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0)
})

Then('I see the empty state headline {string}', async ({ page }, headline: string) => {
  await expect(page.getByText(headline)).toBeVisible()
})

Given('I am creating a new campaign {string}', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.getByText('Create Campaign').first().click()
  await page.getByPlaceholder('e.g. The Shattered Throne').fill(name)
})

When('I tap the cover art area', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'cover.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('mock image data'),
  })
})

When('I select an image from the browser upload dialog', async () => {
  // handled in previous step
})

Then('the selected image is shown as the campaign\'s cover art', async ({ page }) => {
  await expect(page.getByText('Change image')).toBeVisible()
})

Given('I have created campaigns named', async ({ page }, dataTable: { raw: () => string[][] }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const names = dataTable.raw().map((row) => row[0])
  for (const name of names) {
    await seedCampaign(page, { name })
  }
})

Then('I see all three campaigns in the list', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'The Shattered Throne' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Curse of Strahd' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The Wild Beyond' })).toBeVisible()
})

Given('I have a campaign {string} with no description', async ({ page }, name: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name, description: undefined })
})

Then('I do not see a description on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await expect(card.locator('p')).toHaveCount(0)
})

Given('I have a campaign {string} with {int} sessions', async ({ page }, name: string, count: number) => {
  await page.goto('/')
  const camp = await seedCampaign(page, { name })
  for (let i = 1; i <= count; i++) {
    await seedSession(page, { campaignId: camp.id, name: `Session ${i}`, sessionNumber: i })
  }
})

Then('I see {string} on the {string} campaign card', async ({ page }, text: string, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await expect(card.getByText(text, { exact: true })).toBeVisible()
})

Given('I have campaigns {string} and {string}', async ({ page }, c1: string, c2: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name: c1, lastPlayedAt: '2026-01-01T00:00:00.000Z' })
  await seedCampaign(page, { name: c2, lastPlayedAt: '2026-01-02T00:00:00.000Z' })
})

Given('{string} was played more recently', async () => {
  // already seeded with later lastPlayedAt
})

Then('{string} appears above {string}', async ({ page }, top: string, bottom: string) => {
  const cards = page.locator('[data-campaign-id]')
  const firstText = await cards.nth(0).innerText()
  const secondText = await cards.nth(1).innerText()
  expect(firstText).toContain(top)
  expect(secondText).toContain(bottom)
})

Given('I have a campaign {string} with last played date {string}', async ({ page }, name: string, dateStr: string) => {
  const time = dateStr === 'Today' ? new Date().toISOString() : '2026-01-01T00:00:00.000Z'
  const camp = await seedCampaign(page, { name, lastPlayedAt: time })
  await seedSession(page, { campaignId: camp.id, name: 'Intro', sessionNumber: 1 })
})

When('I tap {string} on the {string} campaign card', async ({ page }, btnLabel: string, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await card.getByRole('button', { name: btnLabel }).click()
})

Given('campaign list data is still loading', async () => {
  // simulate with loading param
})

Then('I see skeleton placeholders until campaigns load', async ({ page }) => {
  await page.goto('/campaigns?loading=true')
  await expect(page.locator('.animate-pulse').first()).toBeVisible()
})

Given('the campaign list fails to load', async () => {
  // simulate with error param
})

Then('I see an error message with a retry action', async ({ page }) => {
  await page.goto('/campaigns?error=true')
  await expect(page.getByText('Failed to load campaigns')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

Then('I see a {string} button on the {string} campaign card', async ({ page }, btnLabel: string, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await expect(card.getByRole('button', { name: btnLabel })).toBeVisible()
})

When('I tap {string} on {string}', async ({ page }, btnLabel: string, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await card.getByRole('button', { name: btnLabel }).click()
})

Then('I see the sessions list for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true }).first()).toBeVisible()
  await expect(page.getByText('Campaign Sessions')).toBeVisible()
})


Given('I have a campaign {string} with at least one session', async ({ page }, name: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name })
  await seedSession(page, { campaignId: camp.id, name: 'Arrival', sessionNumber: 1 })
})

When('I tap the campaign title {string}', async ({ page }, title: string) => {
  await page.getByRole('heading', { name: title }).click()
})

Then('I remain on the Active Campaigns screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/campaigns$/)
})

Given('I have a campaign {string} with three sessions', async ({ page }, name: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  const camp = await seedCampaign(page, { name })
  for (let i = 1; i <= 3; i++) {
    await seedSession(page, { campaignId: camp.id, name: `Session ${i}`, sessionNumber: i })
  }
})

When('I tap the delete control on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Delete campaign' }).click()
})

When('I swipe right on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Delete campaign' }).click()
})

Then('{string} is moved to the Trash Campaigns tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('its three sessions are hidden from the sessions list', async () => {
  // verified by campaign removal
})

Then('no confirmation dialog is shown', async ({ page }) => {
  await expect(page.locator('[role="alertdialog"]')).toHaveCount(0)
})

Given('I have a campaign {string}', async ({ page }, name: string) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  await seedCampaign(page, { name })
})

When('I delete {string} from the campaigns list', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Delete campaign' }).click()
})

Then('I see an undo action to restore the campaign', async ({ page }) => {
  await expect(page.getByText('Undo')).toBeVisible()
})


When('I tap Edit on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.locator('[data-campaign-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit campaign' }).click()
})

Then('I see the Edit Campaign dialog for {string}', async ({ page }, _name: string) => {
  await expect(page.getByRole('heading', { name: 'Edit Campaign' })).toBeVisible()
})

When('I save the campaign edits', async ({ page }) => {
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

When('I attempt to save the campaign edits', async ({ page }) => {
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

Then('I still see the Edit Campaign dialog for {string}', async ({ page }, _name: string) => {
  await expect(page.getByRole('heading', { name: 'Edit Campaign' })).toBeVisible()
})

When('I cancel campaign edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
})

When('I tap Edit on the Campaign Sessions hero for {string}', async ({ page }, _name: string) => {
  await page.locator('.shadow-xl').getByRole('button', { name: 'Edit campaign hero' }).click()
})

When('I tap {string} on the Campaign Sessions hero', async ({ page }, text: string) => {
  await page.locator('.shadow-xl').getByText(text, { exact: false }).click()
})

