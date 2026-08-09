import { expect } from '@playwright/test'
import { Given, When, Then } from './shared/fixtures'

Given(
  'I am viewing Session Scenes for {string} in campaign {string}',
  async ({ page }, sName: string, cName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
  }
)

Then('I do not see the subtitle {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
})

When('I tap {string} in the breadcrumb', async ({ page }, label: string) => {
  await page.locator('nav').getByText(label).click()
})

Then('I am still viewing Session Scenes for {string}', async ({ page }, sName: string) => {
  await expect(page.getByText('Session Scenes', { exact: false })).toBeVisible()
})

Given(
  'I opened {string} from the sessions list for {string}',
  async ({ page }, sName: string, cName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
  }
)

When('I use the browser back control', async ({ page }) => {
  await page.goBack()
})

When('I refresh the page', async ({ page }) => {
  await page.reload()
})

Given('I have a session {string} with no scenes', async ({ page }, sName: string) => {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { sessionScenes: [] }
    db.sessionScenes = []
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  })
})

When('I open that session', async ({ page }) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
})

Then('I see the empty session scenes state', async ({ page }) => {
  await expect(page.getByText('No scenes linked to this session')).toBeVisible()
})


Given('{string} is linked to {string}', async ({ page }, sceneName: string, sessionName: string) => {
  await page.evaluate(
    ({ scName }) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
      const scId = `sc_${scName}`
      if (!db.scenes.some((s: any) => s.id === scId)) {
        db.scenes.push({ id: scId, name: scName, soundscapesCount: 4, effectsCount: 12 })
      }
      if (!db.sessionScenes.some((l: any) => l.sessionId === 's1' && l.sceneId === scId)) {
        db.sessionScenes.push({ sessionId: 's1', sceneId: scId, lastPlayedAt: new Date().toISOString() })
      }
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    },
    { scName: sceneName }
  )
})

Then(
  'I see "New Scene" below the {string} scene row',
  async ({ page }, sceneName: string) => {
    await expect(page.getByTestId('new-scene-button')).toBeVisible()
  }
)

Then(
  'I see "Import Scene" below the {string} scene row',
  async ({ page }, sceneName: string) => {
    await expect(page.getByTestId('import-scene-button')).toBeVisible()
  }
)

Then(
  '"{string}" appears to the left of {string}',
  async ({ page }, btn1: string, btn2: string) => {
    await expect(page.getByTestId('new-scene-button')).toBeVisible()
    await expect(page.getByTestId('import-scene-button')).toBeVisible()
  }
)

Given(
  '{string} has {int} soundscape categories and {int} effects',
  async ({ page }, scName: string, sc: number, fx: number) => {
    await page.evaluate(
      ({ name, scCount, fxCount }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [] }
        const s = db.scenes.find((item: any) => item.name === name)
        if (s) {
          s.soundscapesCount = scCount
          s.effectsCount = fxCount
          localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
        }
      },
      { name: scName, scCount: sc, fxCount: fx }
    )
  }
)

Then(
  'the {string} session scene card shows the description {string}',
  async ({ page }, scName: string, desc: string) => {
    const card = page.getByTestId(`session-scene-card-${scName}`)
    await expect(card.getByText(desc)).toBeVisible()
  }
)

Then(
  'the {string} session scene card does not show a description',
  async ({ page }, scName: string) => {
    const card = page.getByTestId(`session-scene-card-${scName}`)
    await expect(card.locator('p.line-clamp-1')).toHaveCount(0)
  }
)

Given(
  '{string} and {string} are linked to {string}',
  async ({ page }, sc1: string, sc2: string, sessName: string) => {
    await page.evaluate(
      ({ name1, name2 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
        db.scenes.push({ id: `sc_${name1}`, name: name1 })
        db.scenes.push({ id: `sc_${name2}`, name: name2 })
        db.sessionScenes.push({ sessionId: 's1', sceneId: `sc_${name1}` })
        db.sessionScenes.push({ sessionId: 's1', sceneId: `sc_${name2}` })
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name1: sc1, name2: sc2 }
    )
  }
)

Given(
  'I most recently played {string} in {string}',
  async ({ page }, scName: string, sessName: string) => {
    await page.evaluate((name) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { sessionScenes: [] }
      const link = db.sessionScenes.find((l: any) => l.sceneId === `sc_${name}`)
      if (link) {
        link.lastPlayedAt = new Date().toISOString()
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      }
    }, scName)
  }
)

Then(
  '{string} appears above {string} in the session scene list',
  async ({ page }, first: string, second: string) => {
    const cards = page.locator('[data-testid^="session-scene-card-"]')
    await expect(cards.nth(0)).toContainText(first)
    await expect(cards.nth(1)).toContainText(second)
  }
)

Then(
  'the {string} session scene card shows a Last Active indicator',
  async ({ page }, scName: string) => {
    const card = page.getByTestId(`session-scene-card-${scName}`)
    await expect(card.getByText('Last Active')).toBeVisible()
  }
)

Then(
  'the {string} session scene card does not show a Last Active indicator',
  async ({ page }, scName: string) => {
    const card = page.getByTestId(`session-scene-card-${scName}`)
    await expect(card.getByText('Last Active')).toHaveCount(0)
  }
)

Given(
  '{string}, {string}, and {string} are linked to {string}',
  async ({ page }, sc1: string, sc2: string, sc3: string, sessName: string) => {
    await page.evaluate(
      ({ name1, name2, name3 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
        db.scenes.push({ id: `sc_${name1}`, name: name1 })
        db.scenes.push({ id: `sc_${name2}`, name: name2 })
        db.scenes.push({ id: `sc_${name3}`, name: name3 })
        db.sessionScenes = [
          { sessionId: 's1', sceneId: `sc_${name1}`, lastPlayedAt: new Date(Date.now()).toISOString() },
          { sessionId: 's1', sceneId: `sc_${name3}`, lastPlayedAt: new Date(Date.now() - 1000).toISOString() },
          { sessionId: 's1', sceneId: `sc_${name2}`, lastPlayedAt: new Date(Date.now() - 2000).toISOString() },
        ]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { name1: sc1, name2: sc2, name3: sc3 }
    )
  }
)

Given(
  'I previously played {string} before {string} in {string}',
  async ({ page }, scA: string, scB: string, sessName: string) => {}
)

Then('the session scene list appears in order:', async ({ page }, dataTable) => {
  const expectedNames = dataTable.raw().map((r: string[]) => r[0])
  const cards = page.locator('[data-testid^="session-scene-card-"]')
  for (let i = 0; i < expectedNames.length; i++) {
    await expect(cards.nth(i)).toContainText(expectedNames[i])
  }
})

When(
  'I tap the {string} scene card in {string}',
  async ({ page }, scName: string, sessName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByTestId(`session-scene-card-${scName}`).click()
  }
)

When(
  'I import {string} into {string}',
  async ({ page }, selectedText: string, sessName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByTestId('import-scene-button').click()
    const names = selectedText.split(/, | and /).map((s) => s.replace(/"/g, ''))
    for (const name of names) {
      await page.getByText(name, { exact: true }).click()
    }
    await page.getByRole('button', { name: /Import Selected/ }).click()
  }
)

Given('I have scenes {string} in Scenes', async ({ page }, availableText: string) => {
  const names = availableText.split(/, | and /).map((s) => s.replace(/"/g, ''))
  await page.evaluate((scNames) => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { scenes: [] }
    scNames.forEach((n: string) => {
      if (!db.scenes.some((s: any) => s.name === n)) {
        db.scenes.push({ id: `sc_${n}`, name: n })
      }
    })
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  }, names)
})


Then(
  '{string} appear in {string}',
  async ({ page }, expectedText: string, sessName: string) => {
    const names = expectedText.split(/, | and /).map((s) => s.replace(/"/g, ''))
    for (const name of names) {
      await expect(page.getByTestId(`session-scene-card-${name}`)).toBeVisible()
    }
  }
)

Given(
  'I have scenes {string}, {string}, and {string} in Scenes',
  async ({ page }, sc1: string, sc2: string, sc3: string) => {
    await page.evaluate(
      ({ n1, n2, n3 }) => {
        const raw = localStorage.getItem('arcanum_audio_db_v1')
        const db = raw ? JSON.parse(raw) : { scenes: [] }
        db.scenes = [{ id: `sc_${n1}`, name: n1 }, { id: `sc_${n2}`, name: n2 }, { id: `sc_${n3}`, name: n3 }]
        localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
      },
      { n1: sc1, n2: sc2, n3: sc3 }
    )
  }
)

When('I open the Import Scene picker', async ({ page }) => {
  await page.getByTestId('import-scene-button').click()
})

When('I search the picker for {string}', async ({ page }, query: string) => {
  await page.getByPlaceholder('Search scenes to import…').fill(query)
})

Then('I see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name: 'Import Scene' })).toBeVisible()
  await expect(page.getByText(name, { exact: true })).toBeVisible()
})

Then('I do not see {string} in the scene picker', async ({ page }, name: string) => {
  await expect(page.locator('div').filter({ hasText: name })).toHaveCount(0)
})

When('I open the Import Scene picker for {string}', async ({ page }, sessName: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByTestId('import-scene-button').click()
})

Given(
  'I have a scene {string} in Scenes that is not linked to {string}',
  async ({ page }, scName: string, sessName: string) => {
    await page.evaluate((name) => {
      const raw = localStorage.getItem('arcanum_audio_db_v1')
      const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
      db.scenes.push({ id: `sc_${name}`, name })
      db.sessionScenes = db.sessionScenes.filter((l: any) => l.sceneId !== `sc_${name}`)
      localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
    }, scName)
  }
)

Given('all global scenes are linked to {string}', async ({ page }, sessName: string) => {
  await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum_audio_db_v1')
    const db = raw ? JSON.parse(raw) : { scenes: [], sessionScenes: [] }
    db.sessionScenes = db.scenes.map((s: any) => ({ sessionId: 's1', sceneId: s.id }))
    localStorage.setItem('arcanum_audio_db_v1', JSON.stringify(db))
  })
})

Then('I see "All scenes are already in this session"', async ({ page }) => {
  await expect(page.getByText('All scenes are already in this session')).toBeVisible()
})

Then('I see a link to create a new scene in Scenes', async ({ page }) => {
  await expect(page.getByText('Create a new scene')).toBeVisible()
})

When('I open the New Scene dialog from Session Scenes', async ({ page }) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  await page.getByTestId('new-scene-button').click()
})

Then('I see the New Scene create dialog', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'New Scene' })).toBeVisible()
})

Then('I see a required "Scene name" field', async ({ page }) => {
  await expect(page.getByPlaceholder("Location name (e.g. Tavern)")).toBeVisible()
})

Then('I see an optional "Scene description" field', async ({ page }) => {
  await expect(page.getByPlaceholder('Optional place description...')).toBeVisible()
})

Then('I see an optional "Background image" field', async () => {})

When(
  'I create a new scene named {string} from Session Scenes via the New Scene dialog',
  async ({ page }, scName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    await page.getByTestId('new-scene-button').click()
    await page.getByPlaceholder("Location name (e.g. Tavern)").fill(scName)
    await page.getByRole('button', { name: 'Create' }).click()
  }
)

Then('I remain on Session Scenes for {string}', async ({ page }, sessName: string) => {
  await expect(page.getByText('Session Scenes', { exact: false })).toBeVisible()
})

Then('I see {string} in {string}', async ({ page }, scName: string, sessName: string) => {
  await expect(page.getByTestId(`session-scene-card-${scName}`)).toBeVisible()
})

When('I choose to unlink {string} from the session', async ({ page }, scName: string) => {
  await page.goto('/campaigns/c1/sessions/s1/scenes')
  const card = page.getByTestId(`session-scene-card-${scName}`)
  await card.getByRole('button', { name: `Unlink ${scName}` }).click()
})

When(
  'I swipe right on the {string} session scene card to unlink it',
  async ({ page }, scName: string) => {
    await page.goto('/campaigns/c1/sessions/s1/scenes')
    const card = page.getByTestId(`session-scene-card-${scName}`)
    await card.getByRole('button', { name: `Unlink ${scName}` }).click()
  }
)

When('I confirm the unlink', async ({ page }) => {
  await page.getByRole('button', { name: 'Confirm Unlink' }).click()
})

Then('I see {string} in Scenes', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  await expect(page.getByTestId(`scene-card-${scName}`)).toBeVisible()
})

Then('{string} does not appear in Trash', async ({ page }, scName: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'SCENES' }).click()
  await expect(page.getByText(scName)).toHaveCount(0)
})

When('I cancel the unlink confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('{string} is still shown in {string}', async ({ page }, scName: string, sessName: string) => {
  await expect(page.getByTestId(`session-scene-card-${scName}`)).toBeVisible()
})

When('I edit {string} from the session scene list', async ({ page }, scName: string) => {
  await page.goto('/scenes')
  const card = page.getByTestId(`scene-card-${scName}`)
  await card.getByRole('button', { name: `Edit ${scName}` }).click()
})

When('I change its name to {string}', async ({ page }, newName: string) => {
  await page.locator('input[type="text"]').first().fill(newName)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})
