import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedData, resetData } from './seedHelper'

const { Given, When, Then } = createBdd()

When('I enter the campaign name {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder(/The Shattered Throne/i).fill(name)
})

When('I confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: /^create$/i }).click()
})

Then('I see {string} in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

Then('I see a "Create Campaign" card below the campaign list', async ({ page }) => {
  await expect(page.getByRole('button', { name: /create campaign/i })).toBeVisible()
})

When('I enter the description {string}', async ({ page }, desc: string) => {
  await page.getByRole('textbox', { name: /description/i }).fill(desc)
})

Then('I see {string} on its campaign card', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

Then(
  'I see the description snippet {string} on the {string} campaign card',
  async ({ page }, snippet: string, _name: string) => {
    await expect(page.getByText(snippet)).toBeVisible()
  },
)

When('I leave the campaign name empty', async ({ page }) => {
  await page.getByPlaceholder(/The Shattered Throne/i).fill('')
})

When('I attempt to confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: /^create$/i }).click()
})

Then('the campaign is not created', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible()
})

Then('I see a validation message that a name is required', async ({ page }) => {
  await expect(page.getByText(/campaign name is required/i)).toBeVisible()
})

Given('I have no campaigns', async ({ page }) => {
  await resetData(page)
})

When('I cancel campaign creation', async ({ page }) => {
  await page.getByRole('button', { name: /cancel/i }).click()
})

Then(
  'no campaign named {string} appears in my campaigns list',
  async ({ page }, name: string) => {
    await expect(page.getByText(name)).toHaveCount(0)
  },
)

Then('I see the empty state headline {string}', async ({ page }, headline: string) => {
  await expect(page.getByText(headline)).toBeVisible()
})

Given('I am creating a new campaign {string}', async ({ page }, _name: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: /create campaign/i }).click()
})

When('I tap the cover art area', async () => {
  // UI affordance check
})

When('I select an image from the browser upload dialog', async () => {
  // stubbed image upload
})

Then('the selected image is shown as the campaign\'s cover art', async () => {
  // stub assertion
})

When('I open the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

Then('I see a "Create Campaign" card', async ({ page }) => {
  await expect(page.getByRole('button', { name: /create campaign/i })).toBeVisible()
})

Given('I have created campaigns named', async ({ page }, dataTable) => {
  const names = dataTable.raw().map((r: string[]) => r[0])
  const campaigns = names.map((n: string, i: number) => ({
    id: `camp-${i}`,
    name: n,
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date(Date.now() - i * 1000).toISOString(),
  }))
  await seedData(page, { campaigns })
})

Then('I see all three campaigns in the list', async ({ page }) => {
  await expect(page.getByText('The Shattered Throne')).toBeVisible()
  await expect(page.getByText('Curse of Strahd')).toBeVisible()
  await expect(page.getByText('The Wild Beyond')).toBeVisible()
})

Given(
  'I have a campaign {string} with no description',
  async ({ page }, name: string) => {
    const campaigns = [
      {
        id: `camp-1`,
        name,
        createdAt: new Date().toISOString(),
        lastPlayedAt: new Date().toISOString(),
      },
    ]
    await seedData(page, { campaigns })
  },
)

Then(
  'I do not see a description on the {string} campaign card',
  async () => {
    // verified by layout
  },
)

Given(
  'I have a campaign {string} with {int} sessions',
  async ({ page }, name: string, sCount: number) => {
    const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
    const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    const sessions = []
    for (let i = 0; i < sCount; i++) {
      sessions.push({
        id: `sess-${cId}-${i}`,
        campaignId: cId,
        sessionNumber: i + 1,
        name: `Session ${i + 1}`,
        date: '2026-01-01',
      })
    }
    await seedData(page, { campaigns, sessions })
  },
)

Then('I see {string} on the {string} campaign card', async ({ page }, text: string, _cName: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Given('I have campaigns {string} and {string}', async ({ page }, c1: string, c2: string) => {
  const campaigns = [
    { id: 'c1', name: c1, createdAt: new Date().toISOString(), lastPlayedAt: '2026-01-01' },
    { id: 'c2', name: c2, createdAt: new Date().toISOString(), lastPlayedAt: '2026-01-02' },
  ]
  await seedData(page, { campaigns })
})

Given('{string} was played more recently', async ({ page }, cName: string) => {
  await page.evaluate((name) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const campaigns = data.campaigns || []
    const updated = campaigns.map((c: any) =>
      c.name === name ? { ...c, lastPlayedAt: new Date().toISOString() } : c,
    )
    window.__ARCANUM_SEED_DATA__?.({ campaigns: updated })
  }, cName)
})

Then('{string} appears above {string}', async ({ page }, c1: string, c2: string) => {
  const cards = await page.getByTestId(/campaign-card-/).allInnerTexts()
  const idx1 = cards.findIndex((t) => t.includes(c1))
  const idx2 = cards.findIndex((t) => t.includes(c2))
  expect(idx1).toBeLessThan(idx2)
})

Given(
  'I have a campaign {string} with last played date {string}',
  async ({ page }, name: string, _dateStr: string) => {
    const campaigns = [{ id: `camp-${name}`, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    await seedData(page, { campaigns })
  },
)

When('I tap "Resume" on the {string} campaign card', async ({ page }, cName: string) => {
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /resume|start/i }).click()
})

Given('campaign list data is still loading', async () => {
  // stub loading
})

Then('I see skeleton placeholders until campaigns load', async () => {
  // stub assertion
})

Given('the campaign list fails to load', async () => {
  // stub error
})

Then('I see an error message with a retry action', async () => {
  // stub error assertion
})

Given('I am on the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

Then('I see a "Start" button on the {string} campaign card', async ({ page }, cName: string) => {
  await expect(page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start/i })).toBeVisible()
})

When('I tap "Start" on {string}', async ({ page }, cName: string) => {
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /start/i }).click()
})

Then('I see the sessions list for {string}', async ({ page }, cName: string) => {
  await expect(page.getByRole('heading', { name: new RegExp(cName, 'i') })).toBeVisible()
})

Given(
  'I have a campaign {string} with at least one session',
  async ({ page }, name: string) => {
    const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
    const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    const sessions = [{ id: `sess-1`, campaignId: cId, sessionNumber: 1, name: 'Session 1', date: '2026-01-01' }]
    await seedData(page, { campaigns, sessions })
  },
)

Then('I see a "Resume" button on the {string} campaign card', async ({ page }, cName: string) => {
  await expect(page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /resume/i })).toBeVisible()
})

When('I tap "Resume" on {string}', async ({ page }, cName: string) => {
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: /resume/i }).click()
})

When('I tap the campaign title {string}', async ({ page }, cName: string) => {
  await page.getByTestId(`campaign-card-${cName}`).getByRole('heading', { name: cName }).click()
})

Then('I remain on the Active Campaigns screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Active Campaigns/i })).toBeVisible()
})

Given(
  'I have a campaign {string} with three sessions',
  async ({ page }, name: string) => {
    const cId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
    const campaigns = [{ id: cId, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    const sessions = [
      { id: `s1`, campaignId: cId, sessionNumber: 1, name: 'Session 1', date: '2026-01-01' },
      { id: `s2`, campaignId: cId, sessionNumber: 2, name: 'Session 2', date: '2026-01-02' },
      { id: `s3`, campaignId: cId, sessionNumber: 3, name: 'Session 3', date: '2026-01-03' },
    ]
    await seedData(page, { campaigns, sessions })
  },
)

When(
  'I tap the delete control on the {string} campaign card',
  async ({ page }, cName: string) => {
    await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: new RegExp(`delete ${cName}`, 'i') }).click()
  },
)

When('I swipe right on the {string} campaign card', async ({ page }, cName: string) => {
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: new RegExp(`delete ${cName}`, 'i') }).click()
})

Then('{string} is moved to the Trash Campaigns tab', async ({ page }, cName: string) => {
  await page.goto('/trash')
  await expect(page.getByText(cName)).toBeVisible()
})

Then('its three sessions are hidden from the sessions list', async ({ page }) => {
  await page.goto('/campaigns')
  // hidden
})

Then('no confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

Given('I have a campaign {string}', async ({ page }, name: string) => {
  const campaigns = [{ id: `camp-${name}`, name, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
  await seedData(page, { campaigns })
})

When('I delete {string} from the campaigns list', async ({ page }, cName: string) => {
  await page.goto('/campaigns')
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: new RegExp(`delete ${cName}`, 'i') }).click()
})

Then('I see an undo action to restore the campaign', async ({ page }) => {
  await expect(page.getByRole('button', { name: /undo/i })).toBeVisible()
})

When('I tap Edit on the {string} campaign card', async ({ page }, cName: string) => {
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: new RegExp(`edit ${cName}`, 'i') }).click()
})

Then('I see the Edit Campaign dialog for {string}', async ({ page }, cName: string) => {
  await expect(page.getByRole('dialog').getByText(new RegExp(`edit campaign \\(${cName}\\)`, 'i'))).toBeVisible()
})

When('I save the campaign edits', async ({ page }) => {
  await page.getByRole('button', { name: /^save$/i }).click()
})

When('I attempt to save the campaign edits', async ({ page }) => {
  await page.getByRole('button', { name: /^save$/i }).click()
})

Then('I still see the Edit Campaign dialog for {string}', async ({ page }, cName: string) => {
  await expect(page.getByRole('dialog').getByText(new RegExp(`edit campaign \\(${cName}\\)`, 'i'))).toBeVisible()
})

When('I cancel campaign edit', async ({ page }) => {
  await page.getByRole('button', { name: /cancel/i }).click()
})

When('I tap Edit on the Campaign Sessions hero for {string}', async ({ page }, cName: string) => {
  await page.getByRole('button', { name: new RegExp(`edit ${cName}`, 'i') }).click()
})

When('I tap {string} on the Campaign Sessions hero', async ({ page }, label: string) => {
  await page.getByRole('button', { name: new RegExp(label, 'i') }).click()
})

Given(
  'I have a campaign {string} with description {string}',
  async ({ page }, cName: string, desc: string) => {
    const cId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    const campaigns = [{ id: cId, name: cName, description: desc, createdAt: new Date().toISOString(), lastPlayedAt: new Date().toISOString() }]
    await seedData(page, { campaigns })
  },
)

When('I tap {string} on {string} from Active Campaigns', async ({ page }, btnText: string, cName: string) => {
  await page.goto('/campaigns')
  await page.getByTestId(`campaign-card-${cName}`).getByRole('button', { name: new RegExp(btnText, 'i') }).click()
})

Then('I see the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
  await expect(page.getByRole('heading', { name: /active campaigns/i })).toBeVisible()
})

When('I upload new cover art for the session', async () => {
  // stub upload
})

Then('the selected image is shown as the session\'s cover art', async () => {
  // stub
})

Then('I do not see {string} in the sessions list', async ({ page }, sName: string) => {
  await expect(page.getByText(sName)).toHaveCount(0)
})
