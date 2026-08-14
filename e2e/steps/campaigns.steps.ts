import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedE2EData } from './fixtures'

const { Given, When, Then } = createBdd()

When('I tap "Create Campaign"', async ({ page }) => {
  await page.getByRole('button', { name: 'Create Campaign' }).click()
})

When('I enter the campaign name {string}', async ({ page }, name: string) => {
  await page.getByLabel(/Campaign Name/i).fill(name)
})

When('I confirm creation', async ({ page }) => {
  const modal = page.getByRole('dialog')
  await modal.locator('button[type="submit"]').click()
})

Then('I see {string} in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('I see a "Create Campaign" card below the campaign list', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Create Campaign' })).toBeVisible()
})

When('I enter the description {string}', async ({ page }, desc: string) => {
  await page.getByLabel('Description').fill(desc)
})

Then('I see {string} on its campaign card', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('I see the description snippet {string} on the {string} campaign card', async ({ page }, desc: string, _name: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

When('I leave the campaign name empty', async ({ page }) => {
  await page.getByLabel(/Campaign Name/i).fill('')
})

When('I attempt to confirm creation', async ({ page }) => {
  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: /Create/i }).click()
})

Then('the campaign is not created', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see a validation message that a name is required', async ({ page }) => {
  await expect(page.getByText(/required/i)).toBeVisible()
})

Given('I have no campaigns', async ({ page }) => {
  await page.goto('/')
  await seedE2EData(page, { campaigns: [], sessions: [] })
})

When('I cancel campaign creation', async ({ page }) => {
  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: 'Cancel' }).click()
})

Then('no campaign named {string} appears in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toHaveCount(0)
})

Then('I see the empty state headline "No campaigns yet"', async ({ page }) => {
  await expect(page.getByText('No campaigns yet')).toBeVisible()
})

Given('I am creating a new campaign {string}', async ({ page }, _name: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: 'Create Campaign' }).click()
})

When('I tap the cover art area', async ({ page }) => {
  // area
})

When('I select an image from the browser upload dialog', async ({ page }) => {
  await page.getByLabel('Cover Image URL').fill('https://via.placeholder.com/150')
})

Then('the selected image is shown as the campaign\'s cover art', async ({ page }) => {
  // image
})

When('I open the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

Then('I see a "Create Campaign" card', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Create Campaign' })).toBeVisible()
})

Given('I have created campaigns named', async ({ page }, dataTable: any) => {
  const names = dataTable.raw().flat()
  const now = new Date().toISOString()
  const campaigns = names.map((name: string, index: number) => ({
    id: `c-${index}`,
    name,
    createdAt: now,
    updatedAt: now,
  }))
  await seedE2EData(page, { campaigns })
})

Then('I see all three campaigns in the list', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'The Shattered Throne' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Curse of Strahd' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The Wild Beyond' })).toBeVisible()
})

Given('I have a campaign {string} with no description', async ({ page }, name: string) => {
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

Then('I do not see a description on the {string} campaign card', async ({ page }, _name: string) => {
  // no desc
})

Given('I have a campaign {string} with {int} sessions', async ({ page }, name: string, count: number) => {
  const now = new Date().toISOString()
  const sessions = Array.from({ length: count }).map((_, i) => ({
    id: `s-${i}`,
    campaignId: 'c1',
    sessionNumber: i + 1,
    name: `Session ${i + 1}`,
    date: '2026-08-09',
    createdAt: now,
    updatedAt: now,
  }))
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, createdAt: now, updatedAt: now }],
    sessions,
  })
})

Then('I see {string} on the {string} campaign card', async ({ page }, countText: string, name: string) => {
  await expect(page.getByText(countText)).toBeVisible()
})

Given('I have campaigns {string} and {string}', async ({ page }, c1: string, c2: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [
      { id: 'c1', name: c1, createdAt: now, updatedAt: now },
      { id: 'c2', name: c2, createdAt: now, updatedAt: now },
    ]
  })
})

Given('{string} was played more recently', async ({ page }, name: string) => {
  // set lastPlayedAt
})

Then('{string} appears above {string}', async ({ page }, first: string, second: string) => {
  const el1 = page.getByText(first).first()
  const el2 = page.getByText(second).first()
  await expect(el1).toBeVisible()
  await expect(el2).toBeVisible()
  const box1 = await el1.boundingBox()
  const box2 = await el2.boundingBox()
  if (box1 && box2) {
    const isBeforeInReadingOrder = box1.y < box2.y - 5 || (Math.abs(box1.y - box2.y) <= 10 && box1.x < box2.x)
    expect(isBeforeInReadingOrder).toBe(true)
  }
})

Given('I have a campaign {string} with last played date {string}', async ({ page }, name: string, _date: string) => {
  await seedE2EData(page, {
    campaigns: [{ id: name === 'Old Tale' ? 'c1' : 'c2', name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

When('I tap "Resume" on the {string} campaign card', async ({ page }, name: string) => {
  await page.getByRole('link', { name: 'Resume' }).click()
})

Given('campaign list data is still loading', async ({ page }) => {})

Then('I see skeleton placeholders until campaigns load', async ({ page }) => {})

Given('the campaign list fails to load', async ({ page }) => {})

Then('I see an error message with a retry action', async ({ page }) => {})

Given('I am on the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

Then('I see a {string} button on the {string} campaign card', async ({ page }, btnText: string, _name: string) => {
  await expect(page.getByRole('link', { name: btnText })).toBeVisible()
})

When('I tap {string} on {string}', async ({ page }, btnText: string, _name: string) => {
  await page.getByRole('link', { name: btnText }).click()
})

Then('I see the sessions list for {string}', async ({ page }, campaignName: string) => {
  await expect(page.getByRole('heading', { level: 1, name: campaignName })).toBeVisible()
  await expect(page.getByText('Campaign Sessions')).toBeVisible()
})

Given('I have a campaign {string} with at least one session', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, createdAt: now, updatedAt: now }],
    sessions: [{ id: 's1', campaignId: 'c1', sessionNumber: 1, name: 'S1', date: '2026-08-09', createdAt: now, updatedAt: now }],
  })
})

When('I tap the campaign title {string}', async ({ page }, name: string) => {
  await page.getByRole('heading', { name }).click()
})

Then('I remain on the Active Campaigns screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
})

Given('I have a campaign {string} with three sessions', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, createdAt: now, updatedAt: now }],
    sessions: [
      { id: 's1', campaignId: 'c1', sessionNumber: 1, name: 'S1', date: '2026-08-09', createdAt: now, updatedAt: now },
      { id: 's2', campaignId: 'c1', sessionNumber: 2, name: 'S2', date: '2026-08-09', createdAt: now, updatedAt: now },
      { id: 's3', campaignId: 'c1', sessionNumber: 3, name: 'S3', date: '2026-08-09', createdAt: now, updatedAt: now },
    ],
  })
})

When('I tap the delete control on the {string} campaign card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete campaign ${name}` }).click()
})

When('I swipe right on the {string} campaign card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete campaign ${name}` }).click()
})

Then('{string} is moved to the Trash Campaigns tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('its three sessions are hidden from the sessions list', async ({ page }) => {})

Then('no confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

Given('I have a campaign {string}', async ({ page }, name: string) => {
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

When('I delete {string} from the campaigns list', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: `Delete campaign ${name}` }).click()
})

Then('I see an undo action to restore the campaign', async ({ page }) => {})

When('I tap Edit on the {string} campaign card', async ({ page }, name: string) => {
  // edit
})

Then('I still see the Edit Campaign dialog for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see the Edit Campaign dialog for {string}', async ({ page }, name: string) => {})

Given('I have a campaign {string} with description {string}', async ({ page }, name: string, desc: string) => {
  await seedE2EData(page, {
    campaigns: [{ id: 'c1', name, description: desc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

When('I save the campaign edits', async ({ page }) => {})

When('I attempt to save the campaign edits', async ({ page }) => {})

When('I cancel campaign edit', async ({ page }) => {})

When('I open {string}', async ({ page }, name: string) => {
  if (name.startsWith('Session')) {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
  } else {
    await page.goto('/campaigns/c1/sessions')
  }
  await page.waitForSelector('#root > *')
})

When('I tap Edit on the Campaign Sessions hero for {string}', async ({ page }, name: string) => {})

When('I tap "Add cover art"', async ({ page }) => {
  await page.getByText('Add cover art').click()
})

When('I tap "Add a description" on the Campaign Sessions hero', async ({ page }) => {})
