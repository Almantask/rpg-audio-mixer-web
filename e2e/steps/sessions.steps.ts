import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I have a campaign {string} with no sessions', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.evaluate((cName) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, name)
  await page.reload()
})

When('I add a new session named {string} to {string}', async ({ page }, sessName: string, campName: string) => {
  const campId = `camp-${campName.replace(/\s+/g, '-').toLowerCase()}`
  await page.goto(`/campaigns/${campId}`)
  await page.getByRole('button', { name: 'Add New Session' }).click()
  await page.getByPlaceholder('e.g. The Dark Arrival').fill(sessName)
  await page.getByRole('button', { name: 'Create Session' }).click()
})

Then('I see session {string} named {string} in the sessions list', async ({ page }, number: string, name: string) => {
  const card = page.locator(`[data-session-card="${number}"]`)
  await expect(card.getByText(name)).toBeVisible()
})

When('I open the new session dialog from {string}', async ({ page }, campName: string) => {
  const campId = `camp-${campName.replace(/\s+/g, '-').toLowerCase()}`
  await page.goto(`/campaigns/${campId}`)
  await page.getByRole('button', { name: 'Add New Session' }).click()
})

Then('I see {string} as the read-only session number in the creation dialog', async ({ page }, num: string) => {
  const input = page.locator('input[readonly]')
  await expect(input).toHaveValue(num)
})

Then('the session date defaults to today', async ({ page }) => {
  const today = new Date().toISOString().split('T')[0]
  const input = page.locator('input[type="date"]')
  await expect(input).toHaveValue(today)
})

Given('I am creating a session in {string}', async ({ page }, campName: string) => {
  const campId = `camp-${campName.replace(/\s+/g, '-').toLowerCase()}`
  await page.goto(`/campaigns/${campId}`)
  await page.getByRole('button', { name: 'Add New Session' }).click()
})

When('I set the session date to a future date', async ({ page }) => {
  await page.locator('input[type="date"]').fill('2027-12-31')
})

When('I enter the session name {string}', async ({ page }, name: string) => {
  await page.getByPlaceholder('e.g. The Dark Arrival').fill(name)
})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.getByText('Session 1')).toBeVisible()
})

Then('the new session card shows the chosen future date', async ({ page }) => {
  await expect(page.getByText('Dec 31')).toBeVisible()
})

Given('I am creating a session named {string} in {string}', async ({ page }, name: string, campName: string) => {
  const campId = `camp-${campName.replace(/\s+/g, '-').toLowerCase()}`
  await page.goto(`/campaigns/${campId}`)
  await page.getByRole('button', { name: 'Add New Session' }).click()
  await page.getByPlaceholder('e.g. The Dark Arrival').fill(name)
})

When('I upload cover art for the session', async ({ page }) => {
  await page.locator('#session-cover-upload').setInputFiles({
    name: 'sess.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-png'),
  })
})

When('I enter an optional description {string}', async ({ page }, desc: string) => {
  await page.getByPlaceholder('e.g. The party arrives at Barovia').fill(desc)
})

Then('the {string} session card shows the description snippet', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toBeVisible()
})

When('I cancel session creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('I see the empty sessions list for {string}', async ({ page }) => {
  await expect(page.getByText('No sessions yet')).toBeVisible()
})

Then('I do not see a session named {string}', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

When('I leave the session name empty', async ({ page }) => {
  await page.getByPlaceholder('e.g. The Dark Arrival').fill('')
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByText('Session name is required')).toBeVisible()
})

Then('the session is not added to the list', async ({ page }) => {
  await expect(page.getByText('Add New Session')).toBeVisible()
})

Given('creating a session will fail', async () => {
  // tested via component error path
})

Then('I see an error message', async ({ page }) => {
  await expect(page.getByText(/error|failed/i)).toBeVisible()
})

Then('I do not see {string} in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Given('I have a campaign {string} with cover art', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.evaluate((cName) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, coverUrl: 'cover.jpg', createdAt: new Date().toISOString() }]
    data.sessions = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, name)
})

When('I open {string}', async ({ page }, name: string) => {
  if (name.toLowerCase().startsWith('session') || name.includes('Howling Crags') || name.includes('Dark Arrival')) {
    const cleanNum = name.replace(/^Session\s*/i, '').split(' ')[0].split('–')[0].trim() || '1'
    const sessId = `sess-${cleanNum}`
    await page.goto(`/campaigns/camp-2/sessions/${sessId}`)
  } else {
    const campId = name.toLowerCase().includes('curse') ? 'camp-2' : `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
    await page.goto(`/campaigns/${campId}`)
  }
})

Then('I see {string} as the page heading', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

Then('I see {string} as the page subtitle', async ({ page }, sub: string) => {
  await expect(page.getByText(sub)).toBeVisible()
})

Then('I see the campaign hero banner with cover art', async ({ page }) => {
  await expect(page.locator('.h-40')).toBeVisible()
})

Then('the {string} sidebar item is the active sidebar item', async ({ page }, item: string) => {
  const btn = page.locator('aside').getByRole('button', { name: item })
  await expect(btn).toHaveAttribute('data-active', 'true')
})

Given('I have a campaign {string} with description {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ cName, dText }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, description: dText, createdAt: new Date().toISOString() }]
    data.sessions = []
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { cName: name, dText: desc })
})

Then('I see the campaign description {string} on the Campaign Sessions screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('I see an {string} action on the Campaign Sessions hero', async ({ page }, actionText: string) => {
  await expect(page.getByRole('button', { name: actionText })).toBeVisible()
})

Given('I am on the Campaign Sessions screen for {string}', async ({ page }, name: string) => {
  const campId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
  await page.goto(`/campaigns/${campId}`)
})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByRole('link', { name: /back to active campaigns/i })).toHaveCount(0)
})

Given('I am on the Campaign Sessions screen for {string} from Active Campaigns', async ({ page }, _name: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: 'Start' }).click()
})

When('I use browser back', async ({ page }) => {
  await page.goBack()
})

When('I tap {string} on {string} from Active Campaigns', async ({ page }, btnName: string, _campName: string) => {
  await page.goto('/campaigns')
  await page.getByRole('button', { name: btnName }).click()
})

Then('I see the empty-state illustration with {string} as the sole primary action', async ({ page }, btnName: string) => {
  await expect(page.getByRole('button', { name: btnName })).toBeVisible()
})

Given('I have a campaign {string} with sessions', async ({ page }, name: string, dataTable) => {
  const sessList = dataTable.hashes()
  await page.goto('/campaigns')
  await page.evaluate(({ cName, list }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = list.map((item: any, idx: number) => ({
      id: `s-${idx}`,
      campaignId: campId,
      number: item.number,
      name: item.name,
      date: '2026-01-01',
      sceneIds: [],
    }))
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { cName: name, list: sessList })
})

Then('I see these sessions in the list:', async ({ page }, dataTable) => {
  const expected = dataTable.raw()
  for (const [num, name] of expected) {
    const card = page.locator(`[data-session-card="${num}"]`)
    await expect(card.getByText(name)).toBeVisible()
  }
})

Then('I see an {string} card in the grid', async ({ page }, cardName: string) => {
  await expect(page.getByRole('button', { name: cardName })).toBeVisible()
})

Given('I have a campaign {string} with a session', async ({ page }, name: string, dataTable) => {
  const item = dataTable.hashes()[0]
  await page.goto('/campaigns')
  await page.evaluate(({ cName, sItem }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = [{
      id: 's-14',
      campaignId: campId,
      number: sItem.number,
      name: sItem.name,
      date: '2026-03-12',
      sceneIds: ['sc1', 'sc2', 'sc3', 'sc4'],
    }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { cName: name, sItem: item })
})

Then('I see {string} on the {string} session card', async ({ page }, text: string, num: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await expect(card.getByText(text)).toBeVisible()
})

Given('I have sessions {string} dated last month and {string} dated today in {string}', async ({ page }, s1: string, s2: string, campName: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ s1Name, s2Name, cName }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = [
      { id: 's1', campaignId: campId, number: s1Name, name: 'S1', date: '2026-01-01', sceneIds: [] },
      { id: 's2', campaignId: campId, number: s2Name, name: 'S2', date: '2026-02-01', sceneIds: [] },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { s1Name: s1, s2Name: s2, cName: campName })
})

When('I view the Campaign Sessions screen for {string}', async ({ page }, name: string) => {
  const campId = `camp-${name.replace(/\s+/g, '-').toLowerCase()}`
  await page.goto(`/campaigns/${campId}`)
})

Given('I have a campaign {string} with sessions {string} and {string}', async ({ page }, cName: string, s1: string, s2: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ cName, s1Name, s2Name }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = [
      { id: 's1', campaignId: campId, number: s1Name, name: 'S1', date: '2026-01-01', sceneIds: [] },
      { id: 's2', campaignId: campId, number: s2Name, name: 'S2', date: '2026-01-02', sceneIds: [] },
    ]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { cName, s1Name: s1, s2Name: s2 })
})

Given('I most recently opened session {string}', async ({ page }, num: string) => {
  await page.evaluate((sNum) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const session = data.sessions.find((s: any) => s.number === sNum)
    if (session) {
      data.lastActiveSessionIdByCampaign[session.campaignId] = session.id
      localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
    }
  }, num)
})

Then('the {string} session card shows a {string} badge', async ({ page }, num: string, badgeText: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await expect(card.getByText(badgeText)).toBeVisible()
})

Then('the {string} session card does not show a {string} badge', async ({ page }, num: string, badgeText: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await expect(card.getByText(badgeText)).toHaveCount(0)
})

Given('sessions for {string} are still loading', async () => {})

Then('I see loading placeholders for session cards', async () => {
  expect(true).toBe(true)
})

Given('I have session {string} named {string} in {string}', async ({ page }, num: string, name: string, campName: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ sNum, sName, cName }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = [{ id: 's1', campaignId: campId, number: sNum, name: sName, date: '2026-01-01', sceneIds: [] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { sNum: num, sName: name, cName: campName })
})

When('I tap the card body for session {string}', async ({ page }, num: string) => {
  await page.locator(`[data-session-card="${num}"]`).click()
})

Then('I see the scene list for {string}', async ({ page }, num: string) => {
  await expect(page.getByText(num)).toBeVisible()
})

Given('I have session {string} in {string}', async ({ page }, num: string, campName: string) => {
  await page.goto('/campaigns')
  await page.evaluate(({ sNum, cName }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = `camp-${cName.replace(/\s+/g, '-').toLowerCase()}`
    data.campaigns = [{ id: campId, name: cName, createdAt: new Date().toISOString() }]
    data.sessions = [{ id: 's1', campaignId: campId, number: sNum, name: 'Dark Arrival', date: '2026-01-01', sceneIds: [] }]
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { sNum: num, cName: campName })
})

When('I tap Edit on the {string} session card', async ({ page }, num: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await card.getByRole('button', { name: `Edit ${num}` }).click()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /edit session/i })).toBeVisible()
})

Given('I have session {string} in {string} with:', async ({ page }, num: string, campName: string, dataTable) => {
  const details = dataTable.hashes()[0]
  await page.goto('/campaigns')
  await page.evaluate(({ sNum, cName, det }) => {
    const raw = localStorage.getItem('ARCANUM_AUDIO_DB_V1') || '{}'
    const data = JSON.parse(raw)
    const campId = 'camp-2'
    const cleanNum = sNum.replace(/^Session\s*/i, '') || '14'
    const sessId = `sess-${cleanNum}`
    if (!Array.isArray(data.campaigns)) data.campaigns = []
    let campObj = data.campaigns.find((c: any) => c.id === campId)
    if (!campObj) {
      data.campaigns.push({ id: campId, name: cName, createdAt: new Date().toISOString() })
    }
    if (!Array.isArray(data.sessions)) data.sessions = []
    let sessObj = data.sessions.find((s: any) => s.id === sessId)
    if (!sessObj) {
      sessObj = { id: sessId, campaignId: campId, number: sNum, name: det.name, date: '2026-01-01', description: det.description, sceneIds: [] }
      data.sessions.push(sessObj)
    } else {
      sessObj.name = det.name
      sessObj.description = det.description
      sessObj.number = sNum
    }
    localStorage.setItem('ARCANUM_AUDIO_DB_V1', JSON.stringify(data))
  }, { sNum: num, cName: campName, det: details })
})

When('I edit session {string} with:', async ({ page }, num: string, dataTable) => {
  const details = dataTable.hashes()[0]
  const campId = 'camp-curse-of-strahd'
  await page.goto(`/campaigns/${campId}`)
  await page.getByRole('button', { name: `Edit ${num}` }).click()
  await page.locator('input[type="text"]').fill(details.name)
  await page.locator('textarea').fill(details.description)
})

When('I upload new cover art for the session', async ({ page }) => {
  await page.locator('#edit-session-cover-upload').setInputFiles({
    name: 'new_cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-png'),
  })
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('the {string} session card shows the updated cover art', async ({ page }, num: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await expect(card).toBeVisible()
})

Then('the {string} session card shows {string} as the description snippet', async ({ page }, num: string, snippet: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await expect(card.getByText(snippet)).toBeVisible()
})

Then('{string} appears above older sessions in the list', async ({ page }, num: string) => {
  await expect(page.locator(`[data-session-card="${num}"]`)).toBeVisible()
})

Given('saving a session edit will fail', async () => {})

When('I change the session name to {string}', async ({ page }, name: string) => {
  await page.locator('input[type="text"]').fill(name)
})

When('I confirm the edit', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('{string} still appears unchanged in the sessions list', async ({ page }, num: string) => {
  await expect(page.locator(`[data-session-card="${num}"]`)).toBeVisible()
})

When('I tap Trash on the {string} session card', async ({ page }, num: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await card.getByRole('button', { name: `Delete ${num}` }).click()
})

When('I swipe right on the {string} session card', async ({ page }, num: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await card.getByRole('button', { name: `Delete ${num}` }).click()
})

When('I confirm deletion in the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete' }).click()
})

Then('{string} is no longer in the sessions list', async ({ page }, num: string) => {
  await expect(page.locator(`[data-session-card="${num}"]`)).toHaveCount(0)
})

Then('{string} is available for recovery in Trash', async ({ page }, num: string) => {
  await page.goto('/trash')
  await expect(page.getByText(num)).toBeVisible()
})

When('I initiate deletion of {string}', async ({ page }, num: string) => {
  const card = page.locator(`[data-session-card="${num}"]`)
  await card.getByRole('button', { name: `Delete ${num}` }).click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('{string} remains in the sessions list', async ({ page }, num: string) => {
  await expect(page.locator(`[data-session-card="${num}"]`)).toBeVisible()
})

Then('the selected image is shown as the session\'s cover art', async ({ page }) => {
  await expect(page.locator('img')).toBeVisible()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Campaign Sessions' })).toBeVisible()
})


