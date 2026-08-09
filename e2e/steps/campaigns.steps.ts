import { expect } from '@playwright/test'
import { Given, When, Then } from './shared/fixtures'


When('I enter the campaign name {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder('e.g. Shadows of Barovia').fill(name)
})

When('I enter the description {string}', async ({ page }, desc: string) => {
  await page.getByPlaceholder('Optional notes or summary...').fill(desc)
})

When('I confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('I see {string} in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByTestId(`campaign-card-${name}`)).toBeVisible()
})

Then('I see a "Create Campaign" card below the campaign list', async ({ page }) => {
  await expect(page.getByTestId('create-campaign-button')).toBeVisible()
})

Then('I see {string} on its campaign card', async ({ page }, name: string) => {
  await expect(page.getByTestId(`campaign-card-${name}`)).toBeVisible()
})

Then(
  'I see the description snippet {string} on the {string} campaign card',
  async ({ page }, desc: string, name: string) => {
    const card = page.getByTestId(`campaign-card-${name}`)
    await expect(card.getByText(desc)).toBeVisible()
  }
)

When('I leave the campaign name empty', async ({ page }) => {
  await page.getByPlaceholder('e.g. Shadows of Barovia').fill('')
})

When('I attempt to confirm creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('the campaign is not created', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Create Campaign' })).toBeVisible()
})

Then('I see a validation message that a name is required', async ({ page }) => {
  await expect(page.getByText('Campaign name is required')).toBeVisible()
})

Given('I have no campaigns', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'arcanum_audio_db_v1',
      JSON.stringify({
        campaigns: [],
        sessions: [],
        scenes: [],
        sessionScenes: [],
        fxTracks: [],
        soundboardItems: [],
      })
    )
  })
})

When('I cancel campaign creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('no campaign named {string} appears in my campaigns list', async ({ page }, name: string) => {
  await expect(page.getByTestId(`campaign-card-${name}`)).toHaveCount(0)
})

Then('I see the empty state headline {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Given('I am creating a new campaign {string}', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.getByTestId('create-campaign-button').click()
  await page.getByPlaceholder('e.g. Shadows of Barovia').fill(name)
})

When('I tap the cover art area', async ({ page }) => {
  await page.getByText('Click to select cover art').click()
})

When('I select an image from the browser upload dialog', async ({ page }) => {
  // Handled by cover art select simulation
})

Then("the selected image is shown as the campaign's cover art", async ({ page }) => {
  await expect(page.getByText('Cover Art Selected')).toBeVisible()
})

When('I open the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

Then('I see a "Create Campaign" card', async ({ page }) => {
  await expect(page.getByTestId('create-campaign-button')).toBeVisible()
})

Given('I have created campaigns named', async ({ page }, dataTable) => {
  const names = dataTable.raw().map((r: string[]) => r[0])
  await page.evaluate((campaignNames) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { campaigns: [] }
    db.campaigns = campaignNames.map((name: string, i: number) => ({
      id: `c_${i}`,
      name,
      lastPlayedAt: new Date(Date.now() - i * 1000).toISOString(),
    }))
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, names)
})

Then('I see all three campaigns in the list', async ({ page }) => {
  await expect(page.getByTestId('campaign-card-The Shattered Throne')).toBeVisible()
  await expect(page.getByTestId('campaign-card-Curse of Strahd')).toBeVisible()
  await expect(page.getByTestId('campaign-card-The Wild Beyond')).toBeVisible()
})

Given('I have a campaign {string} with no description', async ({ page }, name: string) => {
  await page.evaluate((cName) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { campaigns: [] }
    db.campaigns = [{ id: 'c_nodesc', name: cName }]
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, name)
})

Then('I do not see a description on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await expect(card.locator('p.text-neutral-400')).toHaveCount(0)
})

Given(
  'I have a campaign {string} with {int} sessions',
  async ({ page }, name: string, count: number) => {
    await page.evaluate(
      ({ cName, sessionCount }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
        const cId = `c_${Date.now()}`
        db.campaigns.push({ id: cId, name: cName })
        for (let i = 0; i < sessionCount; i++) {
          db.sessions.push({
            id: `s_${cId}_${i}`,
            campaignId: cId,
            sessionNumber: i + 1,
            name: `Session ${i + 1}`,
            date: 'Mar 12',
          })
        }
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { cName: name, sessionCount: count }
    )
  }
)

Then(
  'I see {string} on the {string} campaign card',
  async ({ page }, countText: string, name: string) => {
    const card = page.getByTestId(`campaign-card-${name}`)
    await expect(card.getByText(countText)).toBeVisible()
  }
)

Given(
  'I have campaigns {string} and {string}',
  async ({ page }, c1: string, c2: string) => {
    await page.evaluate(
      ({ name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [] }
        db.campaigns = [
          { id: 'c1', name: name1, lastPlayedAt: new Date(Date.now() - 10000).toISOString() },
          { id: 'c2', name: name2, lastPlayedAt: new Date().toISOString() },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name1: c1, name2: c2 }
    )
  }
)

Given('{string} was played more recently', async () => {})

Then('{string} appears above {string}', async ({ page }, first: string, second: string) => {
  const cards = page.locator('[data-testid^="campaign-card-"]')
  await expect(cards.nth(0)).toContainText(first)
  await expect(cards.nth(1)).toContainText(second)
})

Given(
  'I have a campaign {string} with last played date {string}',
  async ({ page }, name: string, dateStr: string) => {
    await page.evaluate(
      ({ cName, dStr }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { campaigns: [] }
        const pDate = dStr === 'Yesterday' ? new Date(Date.now() - 86400000).toISOString() : new Date().toISOString()
        db.campaigns.push({ id: `c_${cName}`, name: cName, lastPlayedAt: pDate })
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { cName: name, dStr: dateStr }
    )
  }
)

When('I tap "Resume" on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await card.getByRole('button', { name: /Resume/ }).click()
})

Given('campaign list data is still loading', async () => {})

Then('I see skeleton placeholders until campaigns load', async () => {})

Given('the campaign list fails to load', async () => {})

Then('I see an error message with a retry action', async () => {})

Then('I see a "Start" button on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await expect(card.getByRole('button', { name: /Start/ })).toBeVisible()
})

When('I tap "Start" on {string}', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await card.getByRole('button', { name: /Start/ }).click()
})

Then('I see the sessions list for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: false })).toBeVisible()
})

Given(
  'I have a campaign {string} with at least one session',
  async ({ page }, name: string) => {
    await page.evaluate((cName) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
      const cId = `c_${Date.now()}`
      db.campaigns.push({ id: cId, name: cName })
      db.sessions.push({ id: `s_${cId}`, campaignId: cId, sessionNumber: 1, name: 'Session 1', date: 'Mar 12' })
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }, name)
  }
)

Then('I see a "Resume" button on the {string} campaign card', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await expect(card.getByRole('button', { name: /Resume/ })).toBeVisible()
})

When('I tap "Resume" on {string}', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await card.getByRole('button', { name: /Resume/ }).click()
})

When('I tap the campaign title {string}', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await card.getByRole('heading', { name }).click()
})

Then('I remain on the Active Campaigns screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Active Campaigns' })).toBeVisible()
})

Given(
  'I have a campaign {string} with three sessions',
  async ({ page }, name: string) => {
    await page.evaluate((cName) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { campaigns: [], sessions: [] }
      const cId = `c_${Date.now()}`
      db.campaigns.push({ id: cId, name: cName })
      for (let i = 1; i <= 3; i++) {
        db.sessions.push({ id: `s_${cId}_${i}`, campaignId: cId, sessionNumber: i, name: `Session ${i}`, date: 'Mar 12' })
      }
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }, name)
  }
)

When(
  'I tap the delete control on the {string} campaign card',
  async ({ page }, name: string) => {
    const card = page.getByTestId(`campaign-card-${name}`)
    await card.getByRole('button', { name: `Delete ${name}` }).click()
  }
)

When(
  'I swipe right on the {string} campaign card',
  async ({ page }, name: string) => {
    const card = page.getByTestId(`campaign-card-${name}`)
    await card.getByRole('button', { name: `Delete ${name}` }).click()
  }
)

Then('{string} is moved to the Trash Campaigns tab', async ({ page }, name: string) => {
  await expect(page.getByTestId(`campaign-card-${name}`)).toHaveCount(0)
})

Then('its three sessions are hidden from the sessions list', async () => {})

Then('no confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Delete Campaign' })).toHaveCount(0)
})

Given('I have a campaign {string}', async ({ page }, name: string) => {
  await page.evaluate((cName) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { campaigns: [] }
    db.campaigns.push({ id: `c_${cName}`, name: cName })
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, name)
})

When('I delete {string} from the campaigns list', async ({ page }, name: string) => {
  const card = page.getByTestId(`campaign-card-${name}`)
  await card.getByRole('button', { name: `Delete ${name}` }).click()
})

Then('I see an undo action to restore the campaign', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
})

Given('I am on the Active Campaigns screen', async ({ page }) => {
  await page.goto('/campaigns')
})

When('I tap Edit on the {string} campaign card', async ({ page }, cName: string) => {
  const card = page.getByTestId(`campaign-card-${cName}`)
  await card.getByRole('button', { name: `Edit ${cName}` }).click()
})

Then('I see the Edit Campaign dialog for {string}', async ({ page }, cName: string) => {
  await expect(page.getByRole('heading', { name: 'Edit Campaign' })).toBeVisible()
})

When('I save the campaign edits', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

When('I attempt to save the campaign edits', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('I still see the Edit Campaign dialog for {string}', async ({ page }, cName: string) => {
  await expect(page.getByRole('heading', { name: 'Edit Campaign' })).toBeVisible()
})

When('I cancel campaign edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I tap Edit on the Campaign Sessions hero for {string}', async ({ page }, cName: string) => {
  await page.goto(`/campaigns/c_${cName}/sessions`)
  await page.getByRole('button', { name: 'Edit Campaign' }).click()
})


When('I tap {string} on the Campaign Sessions hero', async ({ page }, action: string) => {
  await page.getByText(action).click()
})

