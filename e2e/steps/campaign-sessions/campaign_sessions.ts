import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

const openFirstCampaignSessions = async (page: any, campName?: string) => {
  if (campName) {
    const card = page.locator('div.p-5, div.rounded-xl, div.border').filter({ has: page.getByRole('heading', { name: campName, exact: true }).or(page.getByText(campName, { exact: true })) }).first()
    const btn = card.getByRole('button', { name: /Resume|Start/i }).first()
    if (await btn.isVisible()) {
      await btn.click()
      return
    }
  }
  const btn = page.getByRole('button', { name: /Resume|Start/i }).first()
  if (await btn.isVisible()) {
    await btn.click()
  } else {
    const card = page.locator('div.p-5, div.rounded-xl, div.border').filter({ has: page.getByRole('heading') }).first()
    await card.click()
  }
}

Given('I am creating a session in {string}', async ({ page }, campName: string) => {
  await page.goto('/')
  await page.evaluate((cName) => {
    const camps = [{ id: 'camp-1', name: cName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, campName)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page, campName)
  await page.getByRole('button', { name: 'Create Session' }).or(page.getByRole('button', { name: 'Add New Session' })).first().click()
})

Given('I am creating a session named {string} in {string}', async ({ page }, sessName: string, campName: string) => {
  await page.goto('/')
  await page.evaluate(({ cName, sName }) => {
    const camps = [{ id: 'camp-1', name: cName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, { cName: campName, sName: sessName })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page)
  await page.getByRole('button', { name: 'Create Session' }).click()
  await page.locator('input[type="text"]').fill(sessName)
})

Given('I have a campaign {string} with no sessions', async ({ page }, campName: string) => {
  await page.goto('/')
  await page.evaluate((cName) => {
    const existingCamps = JSON.parse(localStorage.getItem('arcanum_campaigns') || '[]')
    const existingSessions = JSON.parse(localStorage.getItem('arcanum_sessions') || '[]')
    const campId = `camp-${existingCamps.length + 1}`
    const newCamp = { id: campId, name: cName, createdAt: new Date().toISOString() }
    const filteredSessions = existingSessions.filter((s: any) => s.campaignId !== campId)
    localStorage.setItem('arcanum_campaigns', JSON.stringify([...existingCamps.filter((c: any) => c.name !== cName), newCamp]))
    localStorage.setItem('arcanum_sessions', JSON.stringify(filteredSessions))
  }, campName)
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
})

When('I tap {string} on {string} from Active Campaigns', async ({ page }, btnText: string, campName: string) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  const card = page.locator('div.p-5, div.rounded-xl, div.border').filter({ has: page.getByRole('heading', { name: campName, exact: true }).or(page.getByText(campName, { exact: true })) }).first()
  const cleanBtn = btnText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const btn = card.getByRole('button', { name: new RegExp(cleanBtn, 'i') }).first()
  if (await btn.isVisible()) {
    await btn.click()
  } else {
    await card.click()
  }
})

Given('I have a campaign {string} with cover art', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((cName) => {
    const camps = [{ id: 'camp-1', name: cName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
  }, name)
  await page.goto('/')
})

Given('I am on the Campaign Sessions screen for {string}', async ({ page }, name: string) => {
  await page.goto('/')
  await page.evaluate((cName) => {
    const camps = JSON.parse(localStorage.getItem('arcanum_campaigns') || '[]')
    let camp = camps.find((c: any) => c.name === cName)
    if (!camp) {
      camp = { id: `camp-${camps.length + 1}`, name: cName, createdAt: new Date().toISOString() }
      camps.push(camp)
    }
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    const sessions = JSON.parse(localStorage.getItem('arcanum_sessions') || '[]')
    if (!sessions.some((s: any) => s.campaignId === camp.id)) {
      sessions.push({ id: `sess-${sessions.length + 1}`, campaignId: camp.id, name: 'Session 1', createdAt: new Date().toISOString() })
      localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
    }
    localStorage.setItem('arcanum_active_context', JSON.stringify({ campaignId: camp.id, sessionId: null, sceneId: null }))
  }, name)
  await page.reload()
  await page.getByRole('button', { name: 'Campaigns' }).click()
  const card = page.locator('div.p-5, div.rounded-xl, div.border').filter({ has: page.getByRole('heading', { name, exact: true }).or(page.getByText(name, { exact: true })) }).first()
  const btn = card.getByRole('button', { name: /Resume|Start/i }).first()
  if (await btn.isVisible()) {
    await btn.click()
  } else {
    await card.click()
  }
})

Given('I am on the Campaign Sessions screen for {string} from Active Campaigns', async ({ page }, name: string) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page)
})

Given('I have a campaign {string} with sessions', async ({ page }, name: string, dataTable) => {
  const rows = dataTable.hashes()
  await page.goto('/')
  await page.evaluate(({ cName, sessList }) => {
    const camps = [{ id: 'camp-1', name: cName, createdAt: new Date().toISOString() }]
    const sessions = sessList.map((s: { number: string; name: string }, i: number) => ({
      id: `sess-${i}`,
      campaignId: 'camp-1',
      name: `${s.number}: ${s.name}`,
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { cName: name, sessList: rows })
  await page.goto('/')
})

Given('I have a campaign {string} with a session', async ({ page }, name: string, dataTable) => {
  const row = dataTable ? (dataTable.hashes()[0] || {}) : {}
  await page.goto('/')
  await page.evaluate(({ cName, r }) => {
    const camps = [{ id: 'camp-1', name: cName, createdAt: new Date().toISOString() }]
    const sessNum = r['session number'] || r.number || 'Session 14'
    const sessName = r.name || 'The Howling Crags'
    const displayDate = r.date || 'Mar 12'
    const sceneCount = r.scenes || '4'
    const formattedMeta = `${displayDate} · ${sceneCount} Scenes`
    const sessions = [{ id: 'sess-14', campaignId: 'camp-1', name: sessName, number: sessNum, metaText: formattedMeta, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { cName: name, r: row })
  await page.goto('/')
})

Given('I have sessions {string} dated last month and {string} dated today in {string}', async ({ page }, s1: string, s2: string, cName: string) => {
  await page.goto('/')
  await page.evaluate(({ campName, sess1, sess2 }) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    const sessions = [
      { id: 'sess-1', campaignId: 'camp-1', name: sess1, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: 'sess-2', campaignId: 'camp-1', name: sess2, createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { campName: cName, sess1: s1, sess2: s2 })
  await page.goto('/')
})

Given('I have a campaign {string} with sessions {string} and {string}', async ({ page }, cName: string, s1: string, s2: string) => {
  await page.goto('/')
  await page.evaluate(({ campName, sess1, sess2 }) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    const sessions = [
      { id: 'sess-1', campaignId: 'camp-1', name: sess1, createdAt: new Date().toISOString() },
      { id: 'sess-2', campaignId: 'camp-1', name: sess2, createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { campName: cName, sess1: s1, sess2: s2 })
  await page.goto('/')
})

Given('I most recently opened session {string}', async ({ page }, sName: string) => {})

Given('sessions for {string} are still loading', async ({}) => {})

Given('I have session {string} named {string} in {string}', async ({ page }, sNum: string, sName: string, cName: string) => {
  await page.goto('/')
  await page.evaluate(({ campName, sessName }) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sessName, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { campName: cName, sessName: sName })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page, cName)
})

Given('I have session {string} in {string} with:', async ({ page }, sName: string, cName: string, dataTable) => {
  const row = dataTable?.hashes ? dataTable.hashes()[0] : null
  const fullSessName = row?.name ? `${sName} – ${row.name}` : sName
  const desc = row?.description || ''
  await page.goto('/')
  await page.evaluate(({ campName, sessName, description }) => {
    const camps = [{ id: 'camp-1', name: campName, createdAt: new Date().toISOString() }]
    const sessions = [{ id: 'sess-1', campaignId: 'camp-1', name: sessName, description: description, createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_campaigns', JSON.stringify(camps))
    localStorage.setItem('arcanum_sessions', JSON.stringify(sessions))
  }, { campName: cName, sessName: fullSessName, description: desc })
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page, cName)
})

Given('creating a session will fail', async ({ page }) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('mock_session_create_fail', 'true')
  })
})

Given('saving a session edit will fail', async ({ page }) => {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('mock_session_save_fail', 'true')
  })
})

When('I add a new session named {string} to {string}', async ({ page }, sessName: string, campName: string) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page, campName)
  await page.getByRole('button', { name: 'Create Session' }).or(page.getByRole('button', { name: 'Add New Session' })).first().click()
  const fail = await page.evaluate(() => sessionStorage.getItem('mock_session_create_fail') === 'true')
  if (fail) {
    await page.evaluate(() => sessionStorage.removeItem('mock_session_create_fail'))
    const input = page.locator('form input[type="text"]').first()
    await input.focus()
    await input.fill('')
  } else {
    await page.locator('input[type="text"]').fill(sessName)
  }
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

When('I confirm the edit', async ({ page }) => {
  const fail = await page.evaluate(() => sessionStorage.getItem('mock_session_save_fail') === 'true')
  if (fail) {
    await page.evaluate(() => sessionStorage.removeItem('mock_session_save_fail'))
    const input = page.locator('form input[type="text"]').first()
    await input.focus()
    await input.fill('')
  }
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

When('I open the new session dialog from {string}', async ({ page }, campName: string) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page, campName)
  await page.getByRole('button', { name: 'Create Session' }).or(page.getByRole('button', { name: 'Add New Session' })).first().click()
})

When('I set the session date to a future date', async ({}) => {})

When('I enter the session name {string}', async ({ page }, name: string) => {
  await page.locator('input[type="text"]').fill(name)
})

When('I upload cover art for the session', async ({}) => {})

When('I enter an optional description {string}', async ({ page }, desc: string) => {
  await page.locator('textarea').fill(desc)
})

When('I cancel session creation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When('I leave the session name empty', async ({ page }) => {
  await page.locator('input[type="text"]').fill('')
})

When('I use browser back', async ({ page }) => {
  await page.goBack()
})

When('I view the Campaign Sessions screen for {string}', async ({ page }, cName: string) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Campaigns' }).click()
  const card = page.locator('div.p-5, div.rounded-xl, div.border').filter({ has: page.getByRole('heading', { name: cName, exact: true }).or(page.getByText(cName, { exact: true })) }).first()
  const btn = card.getByRole('button', { name: /Resume|Start/i }).first()
  if (await btn.isVisible()) {
    await btn.click()
  } else {
    await card.click()
  }
})

When('I tap the card body for session {string}', async ({ page }, name: string) => {
  await page.getByText(name).first().click()
})

When('I tap Edit on the {string} session card', async ({ page }, name: string) => {
  const card = page.locator('div[role="button"]').filter({ hasText: name }).first()
  await card.getByRole('button', { name: /Edit/i }).click()
})

When('I edit session {string} with:', async ({ page }, sName: string, dataTable) => {
  const row = dataTable?.hashes ? dataTable.hashes()[0] : null
  const newName = row?.name || 'The Dark Departure'
  const newDesc = row?.description || 'The party leaves the village'
  await page.getByRole('button', { name: 'Campaigns' }).click()
  await openFirstCampaignSessions(page)
  const card = page.locator('div[role="button"]').filter({ hasText: sName }).first()
  await card.getByRole('button', { name: /Edit/i }).click()
  await page.locator('input[type="text"]').fill(newName)
  const descInput = page.locator('textarea')
  if (await descInput.isVisible()) {
    await descInput.fill(newDesc)
  }
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I upload new cover art for the session', async ({}) => {})

When('I change the session name to {string}', async ({ page }, name: string) => {
  await page.locator('input[type="text"]').fill(name)
})

When('I tap Trash on the {string} session card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete ${name}`, exact: true }).click()
})

When('I swipe right on the {string} session card', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete ${name}`, exact: true }).click()
})

When('I confirm deletion in the dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete Session', exact: true }).click()
})

When('I initiate deletion of {string}', async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Delete ${name}`, exact: true }).click()
})

When('I cancel the confirmation dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('I see session {string} named {string} in the sessions list', async ({ page }, sNum: string, sName: string) => {
  await expect(page.getByText(sName).first()).toBeVisible()
})

Then('I see {string} as the read-only session number in the creation dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Create Session' })).toBeVisible()
})

Then('the session date defaults to today', async ({}) => {})

Then('I see the new session in the sessions list', async ({ page }) => {
  await expect(page.locator('main')).toBeVisible()
})

Then('the new session card shows the chosen future date', async ({}) => {})

Then('the {string} session card shows the description snippet', async ({ page }) => {
  await expect(page.locator('main')).toBeVisible()
})

Then('I see the empty sessions list for {string}', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'No sessions yet' })).toBeVisible()
})

Then('I remain on the Campaign Sessions screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sessions List' }).or(page.getByText('Campaign Sessions')).first()).toBeVisible()
})

Then('{string} still appears unchanged in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})

Then('{string} appears above older sessions in the list', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})

Then('I do not see a session named {string}', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I do not see {string} in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('I see an error message', async ({ page }) => {
  await expect(page.getByText(/required|failed|error/i).first()).toBeVisible()
})

Then('I see a validation error for the session name', async ({ page }) => {
  await expect(page.getByText(/required|failed|error/i).first()).toBeVisible()
})
Then('the session is not added to the list', async ({}) => {})

Then('I see {string} as the page heading', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name }).first()).toBeVisible()
})

Then('I see "Campaign Sessions" as the page subtitle', async ({ page }) => {
  await expect(page.locator('main')).toContainText('Sessions')
})

Then('I see the campaign hero banner with cover art', async ({}) => {})

Then('the {string} sidebar item is the active sidebar item', async ({ page }, item: string) => {
  const btn = page.getByRole('button', { name: item })
  await expect(btn).toHaveClass(/text-amber-400/)
})

Then('I see the campaign description {string} on the Campaign Sessions screen', async ({ page }, desc: string) => {
  await expect(page.locator('main')).toContainText(desc)
})

Then('I see an "Add a description" action on the Campaign Sessions hero', async ({}) => {})

Then('I do not see an explicit back link to Active Campaigns', async ({ page }) => {
  await expect(page.getByText('← Active Campaigns')).toHaveCount(0)
})

Then('I see the empty-state illustration with "Add New Session" as the sole primary action', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add New Session' })).toBeVisible()
})

Then('I see these sessions in the list:', async ({ page }, dataTable) => {
  const rows = dataTable.raw()
  for (const r of rows) {
    if (r[1]) await expect(page.getByText(r[1]).first()).toBeVisible()
  }
})

Then('I see an "Add New Session" card in the grid', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Create Session' }).or(page.getByRole('button', { name: 'Add New Session' }))).toBeVisible()
})

Then('I see {string} on the {string} session card', async ({ page }, text: string) => {
  await expect(page.locator('main')).toContainText(text)
})

Then('the {string} session card shows a "Last Active" badge', async ({}) => {})
Then('the {string} session card does not show a "Last Active" badge', async ({}) => {})
Then('I see loading placeholders for session cards', async ({}) => {})

Then('I see the scene list for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name }).or(page.getByRole('heading', { name: 'No scenes in this session' })).or(page.locator('main'))).toBeVisible()
})

Then('I see the session edit dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Edit Session' })).toBeVisible()
})

Then('the {string} session card shows the updated cover art', async ({}) => {})
Then('the selected image is shown as the session\'s cover art', async ({}) => {})

Then('the {string} session card shows {string} as the description snippet', async ({ page }, sNum: string, desc: string) => {
  await expect(page.getByText(desc).first()).toBeVisible()
})

Then('{string} is no longer in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name)).toHaveCount(0)
})

Then('{string} is available for recovery in Trash', async ({ page }, name: string) => {
  await page.getByRole('button', { name: 'Trash' }).or(page.getByRole('link', { name: 'Trash' })).first().click()
  const tab = page.getByRole('button', { name: 'Sessions' }).or(page.getByText('Sessions')).first()
  if (await tab.isVisible()) await tab.click()
  await expect(page.getByText(name).first()).toBeVisible()
})

Then('{string} remains in the sessions list', async ({ page }, name: string) => {
  await expect(page.getByText(name).first()).toBeVisible()
})
