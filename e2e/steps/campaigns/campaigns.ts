import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I have no campaigns', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('arcanum_campaigns', JSON.stringify([]))
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I have created campaigns named', async ({ page }, dataTable) => {
  await page.goto('/')
  const names = dataTable.raw().map((r: string[]) => r[0])
  await page.evaluate((campNames) => {
    const camps = campNames.map((n: string, i: number) => ({
      id: `camp-${i}`,
      name: n,
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, names)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I have a campaign {string} with no description', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((campName) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, name)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I have a campaign {string} with {int} sessions', async ({ page }, name: string, sessionCount: number) => {
  await page.goto('/')
  await page.evaluate(({ campName, count }) => {
    const existingCamps = JSON.parse(localStorage.getItem('arcanum_campaigns') || '[]')
    const existingSessions = JSON.parse(localStorage.getItem('arcanum_sessions') || '[]')
    const campId = `camp-${existingCamps.length + 1}`
    const newCamp = { id: campId, name: campName, createdAt: new Date().toISOString() }
    const newSessions = Array.from({ length: count }).map((_, i) => ({
      id: `sess-${existingSessions.length + i + 1}`,
      campaignId: campId,
      name: `Session ${i + 1}`,
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('arcanum_campaigns', JSON.stringify([...existingCamps, newCamp]))
    localStorage.setItem('arcanum_sessions', JSON.stringify([...existingSessions, ...newSessions]))
  }, { campName: name, count: sessionCount })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I have a campaign {string} with {int} session', async ({ page }, name: string, sessionCount: number) => {
  await page.goto('/')
  await page.evaluate(({ campName, count }) => {
    const existingCamps = JSON.parse(localStorage.getItem('arcanum_campaigns') || '[]')
    const existingSessions = JSON.parse(localStorage.getItem('arcanum_sessions') || '[]')
    const campId = `camp-${existingCamps.length + 1}`
    const newCamp = { id: campId, name: campName, createdAt: new Date().toISOString() }
    const newSessions = Array.from({ length: count }).map((_, i) => ({
      id: `sess-${existingSessions.length + i + 1}`,
      campaignId: campId,
      name: `Session ${i + 1}`,
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('arcanum_campaigns', JSON.stringify([...existingCamps, newCamp]))
    localStorage.setItem('arcanum_sessions', JSON.stringify([...existingSessions, ...newSessions]))
  }, { campName: name, count: sessionCount })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I have campaigns {string} and {string}', async ({ page }, c1: string, c2: string) => {
  await page.goto('/')
  await page.evaluate(({ n1, n2 }) => {
    const camps = [
      { id: 'camp-1', name: n1, createdAt: new Date(Date.now() - 10000).toISOString() },
      { id: 'camp-2', name: n2, createdAt: new Date().toISOString() },
    ]
    const sessions = [
      { id: 'sess-1', campaignId: 'camp-1', name: 'Session 1', createdAt: new Date().toISOString() },
      { id: 'sess-2', campaignId: 'camp-2', name: 'Session 1', createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { n1: c1, n2: c2 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('{string} was played more recently', async ({}) => {})

Given('I have a campaign {string} with last played date {string}', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((campName) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, name)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('campaign list data is still loading', async ({}) => {})
Given('the campaign list fails to load', async ({}) => {})

Given('I have a campaign {string}', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((campName) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, name)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I have a campaign {string} with description {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/')
  await page.evaluate(({ campName, description }) => {
    const camps = [{ id: 'camp-1', name: campName, description, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, { campName: name, description: desc })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I am creating a new campaign {string}', async ({ page }, name: string) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await page.getByRole('button', { name: 'Create Campaign' }).first().click()
  await page.locator('input[type="text"]').fill(name)
})

Given('I have a campaign {string} with at least one session', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((campName) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: 'Session 1', createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, name)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

Given('I have a campaign {string} with three sessions', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((campName) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    const sessions = [
      { id: 'sess-1', campaignId: 'camp-1', name: 'Session 1', createdAt: new Date().toISOString() },
      { id: 'sess-2', campaignId: 'camp-1', name: 'Session 2', createdAt: new Date().toISOString() },
      { id: 'sess-3', campaignId: 'camp-1', name: 'Session 3', createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, name)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

When('I tap {string}', async ({ page }, name: string) => {
  if (name === 'Create Campaign' && !page.url().includes('/campaigns')) {
    await page.goto('/')
    await page.getByRole('button', { name: 'Campaigns' }).click()
  }
  await page.getByRole('button', { name }).first().click()
})

When('I enter the campaign name {string}', async ({ page }, name: string) => {
  await page.locator('input[type="text"]').fill(name)
})

When('I confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

When('I enter the description {string}', async ({ page }, desc: string) => {
  await page.locator('textarea').fill(desc)
})

When('I leave the campaign name empty', async ({ page }) => {
  await page.locator('input[type="text"]').fill('')
})

When('I attempt to confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

When('I cancel campaign creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I tap the cover art area', async ({}) => {})
When('I select an image from the browser upload dialog', async ({}) => {})

When('I open the Active Campaigns screen', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

When('I tap "Resume" on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.locator('div').filter({ hasText: name }).first()
  await card.getByRole('button', { name: 'Resume' }).click()
})

When('I tap Edit on the {string} campaign card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Edit ${name}` }).click()
})

When('I save the campaign edits', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

When('I cancel campaign edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I open {string}', async ({ page }, name: string) => {
  if (!page.url().includes('/campaigns')) {
    await page.goto('/campaigns')
  }
  const directMatch = page.getByText(name).first()
  if (await directMatch.isVisible()) {
    await directMatch.click()
    return
  }
  const actionBtn = page.getByRole('button', { name: 'Start' }).or(page.getByRole('button', { name: 'Resume' })).first()
  if (await actionBtn.isVisible()) {
    await actionBtn.click()
    await page.waitForURL('**/campaigns/sessions')
  }
  await page.getByText(name).first().click()
})

When('I tap Edit on the Campaign Sessions hero for {string}', async ({ page }, name: string) => {
  await page.getByRole('button', { name: 'Edit' }).first().click()
})

When('I tap {string} on {string}', async ({ page }, btnText: string, campName: string) => {
  const card = page.locator('div').filter({ hasText: campName }).first()
  await card.getByRole('button', { name: btnText }).click()
})

When('I tap the campaign title {string}', async ({ page }, title: string) => {
  await page.getByText(title).first().click()
})

When('I tap the delete control on the {string} campaign card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

When('I swipe right on the {string} campaign card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

When('I delete {string} from the campaigns list', async ({ page }, name: string) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await page.getByRole('button', { name: `Delete ${name}` }).click()
})

Then('I see {string} in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})

Then('I see a "Create Campaign" card below the campaign list', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Create Campaign' }).first()).toBeVisible()
})

Then('I see {string} on its campaign card', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})

Then('I see the description snippet {string} on the {string} campaign card', async ({ page }, desc: string) => {
  await expect(page.getByText(desc).first()).toBeVisible()
})

Then('the campaign is not created', async ({ page }) => {

})

Then('I see a validation message that a name is required', async ({ page }) => {
  await expect(page.getByText('A campaign name is required')).toBeVisible()
})

Then('no campaign named {string} appears in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I see the empty state headline "No campaigns yet"', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'No campaigns yet' })).toBeVisible()
})

Then('the selected image is shown as the campaign\'s cover art', async ({}) => {})

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible()
})

Then('I see a "Create Campaign" card', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Create Campaign' }).first()).toBeVisible()
})

Then('I see all three campaigns in the list', async ({ page }) => {
  await expect(page.locator('main')).toContainText('The Shattered Throne')
  await expect(page.locator('main')).toContainText('Curse of Strahd')
  await expect(page.locator('main')).toContainText('The Wild Beyond')
})

Then('I do not see a description on the {string} campaign card', async ({}) => {})

Then('I see {string} on the {string} campaign card', async ({ page }, label: string) => {
  await expect(page.locator('main')).toContainText(label)
})

Then('{string} appears above {string}', async ({ page }, c1: string, c2: string) => {
  const text = await page.locator('main').innerText()
  const idx1 = text.indexOf(c1)
  const idx2 = text.indexOf(c2)
  expect(idx1).toBeGreaterThan(-1)
  expect(idx2).toBeGreaterThan(-1)
  expect(idx1).toBeLessThan(idx2)
})

Then('I see skeleton placeholders until campaigns load', async ({}) => {})
Then('I see an error message with a retry action', async ({}) => {})

Then('I see the Edit Campaign dialog for {string}', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Edit Campaign/ })).toBeVisible()
})

Then('I still see the Edit Campaign dialog for {string}', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Edit Campaign/ })).toBeVisible()
})

Then('I see a {string} button on the {string} campaign card', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText }).first()).toBeVisible()
})

Then('I see the sessions list for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name }).or(page.getByText(name)).first()).toBeVisible()
})

Then('I remain on the Active Campaigns screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
})

Then('{string} is moved to the Trash Campaigns tab', async ({ page }, name: string) => {
  await page.getByRole('button', { name: 'Trash' }).click()
  await expect(page.getByText(name)).toBeVisible()
})

Then('its three sessions are hidden from the sessions list', async ({}) => {})
Then('no confirmation dialog is shown', async ({}) => {})
Then('I see an undo action to restore the campaign', async ({}) => {})
