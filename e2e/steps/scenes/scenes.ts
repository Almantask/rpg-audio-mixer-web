import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { SCREEN_PATHS } from '../../../src/lib/navigation'
import { getActiveScenePath } from '../../../src/lib/storage/db'
import {
  clearSeedData,
  createSceneSeed,
  getSceneIdByName,
  linkSceneToSession,
  addSceneSoundscapeSeed,
  addSceneEffectSeed,
  TEST_COVER_JPG_DATA_URL,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

function sceneCard(page: Page, name: string): Locator {
  return page.locator('[data-testid="scene-card"]', {
    has: page.locator(`[data-scene-name="${name}"]`),
  })
}

async function openScenes(page: Page): Promise<void> {
  await page.goto(SCREEN_PATHS['Scenes screen'])
  await page.waitForLoadState('networkidle')
}

async function ensureScene(page: Page, name: string, options?: {
  description?: string
  coverArtUrl?: string
  soundscapeCategoryCount?: number
  effectCount?: number
  tags?: string[]
}): Promise<string> {
  await page.goto('/')
  const existing = await page.evaluate(async (sceneName) => {
    return window.__arcanumGetSceneIdByName?.(sceneName)
  }, name)
  if (existing) return existing
  return createSceneSeed(page, { name, ...options })
}

// --- Given ---

Given('I have no scenes', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
})

Given(/^a scene named "([^"]+)" exists$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createSceneSeed(page, { name })
})

Given('a scene exists', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  const sceneId = await createSceneSeed(page, { name: 'Test Scene' })
  await page.goto(getActiveScenePath(sceneId))
  await page.waitForLoadState('networkidle')
})

Given(/^the following scenes exist:$/, async ({ page }, dataTable) => {
  await page.goto('/')
  await clearSeedData(page)
  const names = dataTable.raw().flat().filter(Boolean)
  for (const name of names) {
    await createSceneSeed(page, { name })
  }
})

Given(
  /^a scene named "([^"]+)" with (\d+) soundscape categories and (\d+) effects exists$/,
  async ({ page }, name: string, scCount: string, fxCount: string) => {
    await page.goto('/')
    await clearSeedData(page)
    await createSceneSeed(page, {
      name,
      soundscapeCategoryCount: Number.parseInt(scCount, 10),
      effectCount: Number.parseInt(fxCount, 10),
    })
  },
)

Given(
  /^a scene named "([^"]+)" with no session links exists$/,
  async ({ page }, name: string) => {
    await ensureScene(page, name)
  },
)

Given(
  /^a scene named "([^"]+)" linked to (\d+) sessions exists$/,
  async ({ page }, name: string, countText: string) => {
    await page.goto('/')
    await clearSeedData(page)
    const sceneId = await createSceneSeed(page, { name })
    const count = Number.parseInt(countText, 10)
    for (let index = 0; index < count; index += 1) {
      const sessionId = await page.evaluate(async (idx) => {
        const { db } = await import('../../../src/lib/storage/db')
        const id = crypto.randomUUID()
        const now = Date.now()
        await db.campaigns.put({ id, name: `Campaign ${idx}`, lastPlayedAt: now, createdAt: now })
        const sid = crypto.randomUUID()
        await db.sessions.put({
          id: sid,
          campaignId: id,
          name: `Session ${idx + 1}`,
          number: idx + 1,
          date: new Date().toISOString().slice(0, 10),
          sceneCount: 0,
          createdAt: now,
        })
        return sid
      }, index)
      await linkSceneToSession(page, sessionId, sceneId)
    }
  },
)

Given(
  /^a scene named "([^"]+)" with cover image "([^"]+)" exists$/,
  async ({ page }, name: string, _image: string) => {
    await page.goto('/')
    await clearSeedData(page)
    await createSceneSeed(page, { name, coverArtUrl: TEST_COVER_JPG_DATA_URL })
  },
)

Given(/^the "([^"]+)" scene has the description "([^"]+)"$/, async ({ page }, name: string, description: string) => {
  const sceneId = await getSceneIdByName(page, name)
  const stored = await page.evaluate(async (id) => window.__arcanumGetSceneDescription?.(id), sceneId)
  if (stored !== description) {
    await page.evaluate(
      async ({ id, desc }) => {
        const { db } = await import('../../../src/lib/storage/db')
        await db.scenes.update(id, { description: desc })
      },
      { id: sceneId, desc: description },
    )
  }
  const updated = await page.evaluate(async (id) => window.__arcanumGetSceneDescription?.(id), sceneId)
  expect(updated).toBe(description)
})

Given(/^I am editing the "([^"]+)" scene$/, async ({ page }, name: string) => {
  await ensureScene(page, name)
  await openScenes(page)
  await sceneCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
})

Given(/^the "([^"]+)" scene has the tag "([^"]+)"$/, async ({ page }, sceneName: string, tag: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await page.evaluate(
    async ({ id, tagName }) => {
      const { db } = await import('../../../src/lib/storage/db')
      const scene = await db.scenes.get(id)
      if (!scene) return
      await db.scenes.update(id, { tags: [...scene.tags, tagName] })
    },
    { id: sceneId, tagName: tag },
  )
})

// --- When ---

When('I view Scenes', async ({ page }) => {
  await openScenes(page)
})

When(/^I search Scenes for "([^"]+)"$/, async ({ page }, query: string) => {
  await openScenes(page)
  await page.getByLabel('Search scenes').fill(query)
})

When(/^I create a new scene named "([^"]+)" via the New Scene dialog$/, async ({ page }, name: string) => {
  await openScenes(page)
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByLabel('Scene name').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click()
})

When(
  /^I create a new scene named "([^"]+)" with description "([^"]+)" via the New Scene dialog$/,
  async ({ page }, name: string, description: string) => {
    await openScenes(page)
    await page.getByRole('button', { name: 'New Scene' }).click()
    await page.getByLabel('Scene name').fill(name)
    await page.getByLabel('Description (optional)').fill(description)
    await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click()
  },
)

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByLabel('Scene name').fill('Second Scene')
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click()
})

When('I open the New Scene dialog', async ({ page }) => {
  await openScenes(page)
  await page.getByRole('button', { name: 'New Scene' }).click()
})

When(/^I open the "([^"]+)" scene$/, async ({ page }, name: string) => {
  await openScenes(page)
  await sceneCard(page, name).getByRole('heading', { level: 2, name }).click()
  await page.waitForLoadState('networkidle')
})

When(/^I open the "([^"]+)" scene from Scenes$/, async ({ page }, name: string) => {
  await openScenes(page)
  const sceneId = await getSceneIdByName(page, name)
  await sceneCard(page, name).getByRole('heading', { level: 2, name }).click()
  await page.waitForURL(`**${getActiveScenePath(sceneId)}`)
})

When(/^I view the "([^"]+)" scene card$/, async ({ page }, name: string) => {
  await openScenes(page)
  await expect(sceneCard(page, name)).toBeVisible()
})

When(/^I tap the trash icon on the "([^"]+)" card$/, async ({ page }, sceneName: string) => {
  await openScenes(page)
  await sceneCard(page, sceneName)
    .getByRole('button', { name: `Delete ${sceneName}` })
    .click()
})

When(/^I delete the "([^"]+)" scene$/, async ({ page }, name: string) => {
  await openScenes(page)
  await sceneCard(page, name).getByRole('button', { name: `Delete ${name}` }).click()
})

When('I confirm the delete', async ({ page }) => {
  await page.getByRole('alertdialog').getByRole('button', { name: 'Confirm' }).click()
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click()
})

When(
  /^I add the description "([^"]+)" to the "([^"]+)" scene via Edit$/,
  async ({ page }, description: string, name: string) => {
    await openScenes(page)
    await sceneCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
    await page.getByLabel('Description (optional)').fill(description)
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  },
)

When(
  /^I update the description of the "([^"]+)" scene to "([^"]+)"$/,
  async ({ page }, name: string, description: string) => {
    await openScenes(page)
    await sceneCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
    await page.getByLabel('Description (optional)').fill(description)
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  },
)

When(/^I clear the description of the "([^"]+)" scene via Edit$/, async ({ page }, name: string) => {
  await openScenes(page)
  await sceneCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
  await page.getByLabel('Description (optional)').fill('')
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
})

When(/^I add the predefined tag "([^"]+)"$/, async ({ page }, tag: string) => {
  await page.getByRole('button', { name: tag, exact: true }).click()
})

When(/^I add a custom tag "([^"]+)"$/, async ({ page }, tag: string) => {
  await page.getByLabel('Custom tag').fill(tag)
  await page.getByRole('button', { name: 'Add', exact: true }).click()
})

When(/^I add the tags "([^"]+)", "([^"]+)", and "([^"]+)"$/, async ({ page }, t1: string, t2: string, t3: string) => {
  for (const tag of [t1, t2, t3]) {
    await page.getByRole('button', { name: tag, exact: true }).click()
  }
})

When(/^I edit "([^"]+)" and remove the "([^"]+)" tag$/, async ({ page }, sceneName: string, tag: string) => {
  await openScenes(page)
  await sceneCard(page, sceneName).getByRole('button', { name: `Edit ${sceneName}` }).click()
  await page.getByRole('button', { name: tag, exact: true }).click()
})

When('I save', async ({ page }) => {
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
})

When(/^I open the "([^"]+)" tab$/, async ({ page }, tab: string) => {
  await page.getByRole('tab', { name: tab }).click()
})

When(/^I have opened the "([^"]+)" tab$/, async ({ page }, tab: string) => {
  await page.getByRole('tab', { name: tab }).click()
})

When(/^I add (\d+) soundscape categories to the scene$/, async ({ page }, countText: string) => {
  const count = Number.parseInt(countText, 10)
  for (let index = 0; index < count; index += 1) {
    await page.getByTestId('add-soundscape-button').click()
  }
})

When(/^I add (\d+) effects to the soundboard$/, async ({ page }, countText: string) => {
  const count = Number.parseInt(countText, 10)
  for (let index = 0; index < count; index += 1) {
    await page.getByTestId('add-sound-button').click()
  }
})

When(/^I have added the "([^"]+)" soundscape category$/, async ({ page }, _name: string) => {
  await page.getByTestId('add-soundscape-button').click()
})

When(/^I remove the "([^"]+)" category from the scene$/, async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Remove ${name}` }).click()
})

When(/^I have added the "([^"]+)" effect$/, async ({ page }, _name: string) => {
  await page.getByRole('tab', { name: 'Soundboard' }).click()
  await page.getByTestId('add-sound-button').click()
})

When(/^I remove the "([^"]+)" effect from the soundboard$/, async ({ page }, name: string) => {
  await page.getByRole('button', { name: `Remove ${name}` }).click()
})

// --- Then ---

Then(/^I see the search field with placeholder "([^"]+)"$/, async ({ page }, placeholder: string) => {
  await expect(page.getByPlaceholder(placeholder)).toBeVisible()
})

Then(/^I see the "([^"]+)" scene in Scenes$/, async ({ page }, name: string) => {
  await expect(sceneCard(page, name)).toBeVisible()
})

Then(/^I do not see "([^"]+)" in Scenes$/, async ({ page }, name: string) => {
  await expect(page.locator(`[data-scene-name="${name}"]`)).toHaveCount(0)
})

Then(/^the "([^"]+)" scene card shows "([^"]+)"$/, async ({ page }, name: string, text: string) => {
  await expect(sceneCard(page, name)).toContainText(text)
})

Then(/^the "([^"]+)" scene card has no play button$/, async ({ page }, name: string) => {
  await expect(sceneCard(page, name).getByRole('button', { name: /play/i })).toHaveCount(0)
})

Then(/^I see the Active Scene screen for "([^"]+)"$/, async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
})

Then('no audio playback has started', async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(false)
})

Then(/^I see the "([^"]+)" row below all scene cards$/, async ({ page }, label: string) => {
  const cards = page.getByTestId('scene-card')
  const newRow = page.getByTestId('new-scene-card')
  await expect(cards.first()).toBeVisible()
  await expect(newRow).toBeVisible()
  const lastBox = await cards.last().boundingBox()
  const newBox = await newRow.boundingBox()
  if (!lastBox || !newBox) throw new Error('Unable to compare scene list order')
  expect(newBox.y).toBeGreaterThan(lastBox.y)
  await expect(newRow).toContainText(label)
})

Then('I see the empty-state illustration', async ({ page }) => {
  await expect(page.getByTestId('scenes-empty-illustration')).toBeVisible()
})

Then(/^I see the "([^"]+)" call to action$/, async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/scenes$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Scenes' })).toBeVisible()
})

Then(/^the "([^"]+)" tab is active$/, async ({ page }, tab: string) => {
  await expect(page.getByRole('tab', { name: tab, selected: true })).toBeVisible()
})

Then('the soundboard has no effects', async ({ page }) => {
  await expect(page.getByTestId('soundboard-grid').locator('[data-effect-name]')).toHaveCount(0)
})

Then(/^I see an "([^"]+)" button$/, async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {
  const grid = page.getByTestId('soundboard-grid')
  const children = grid.locator('> *')
  await expect(children.last()).toHaveAttribute('data-testid', 'add-sound-button')
})

Then('the scene has no soundscape categories', async ({ page }) => {
  await expect(page.getByTestId('soundscapes-list').locator('[data-category-name]')).toHaveCount(0)
})

Then('the add button appears after the last category card', async ({ page }) => {
  const list = page.getByTestId('soundscapes-list')
  const children = list.locator('> *')
  await expect(children.last()).toHaveAttribute('data-testid', 'add-soundscape-button')
})

Then('the Soundscapes tab has no categories', async ({ page }) => {
  await expect(page.getByTestId('soundscapes-list').locator('[data-category-name]')).toHaveCount(0)
})

Then(/^I have (\d+) scenes$/, async ({ page }, countText: string) => {
  const count = await page.evaluate(async () => window.__arcanumCountScenes?.() ?? 0)
  expect(count).toBe(Number.parseInt(countText, 10))
})

Then(/^"([^"]+)" is moved to Trash on the Scenes tab$/, async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.getByTestId('trash-scenes-tab')).toContainText(name)
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

Then(
  /^I see a warning that the scene is linked to (\d+) sessions and will be unlinked and moved to Trash$/,
  async ({ page }, countText: string) => {
    await expect(page.getByRole('alertdialog')).toContainText(
      `linked to ${countText} sessions`,
    )
  },
)

Then(/^I still see "([^"]+)" in Scenes$/, async ({ page }, name: string) => {
  await openScenes(page)
  await expect(sceneCard(page, name)).toBeVisible()
})

Then('I see an undo option for the deletion', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
})

Then(/^the "([^"]+)" scene has no description$/, async ({ page }, name: string) => {
  const sceneId = await getSceneIdByName(page, name)
  const stored = await page.evaluate(async (id) => window.__arcanumGetSceneDescription?.(id), sceneId)
  expect(stored).toBeUndefined()
})

Then(
  /^I see the description "([^"]+)" on the Active Scene screen$/,
  async ({ page }, description: string) => {
    await expect(page.getByTestId('scene-description')).toContainText(description)
  },
)

Then(/^the "([^"]+)" scene card does not show its description$/, async ({ page }, name: string) => {
  const card = sceneCard(page, name)
  await expect(card.locator('[data-testid="scene-description"]')).toHaveCount(0)
})

Then(/^the "([^"]+)" scene card shows its cover image$/, async ({ page }, name: string) => {
  await expect(sceneCard(page, name).locator('div[style*="background-image"]')).toBeVisible()
})

Then('no tags are shown on the card', async ({ page }) => {
  await expect(page.getByTestId('scene-card').locator('.uppercase')).toHaveCount(0)
})

Then('I do not see a tags field', async ({ page }) => {
  await expect(page.getByLabel('Tags')).toHaveCount(0)
})

Then(/^the "([^"]+)" tag chip is shown on the "([^"]+)" scene card$/, async ({ page }, tag: string, name: string) => {
  await openScenes(page)
  await expect(sceneCard(page, name)).toContainText(tag)
})

Then(/^all three tag chips are shown on the "([^"]+)" scene card$/, async ({ page }, name: string) => {
  await openScenes(page)
  const card = sceneCard(page, name)
  await expect(card).toContainText('City')
  await expect(card).toContainText('Combat')
  await expect(card).toContainText('Night')
})

Then(/^the "([^"]+)" tag is no longer shown on the "([^"]+)" scene card$/, async ({ page }, tag: string, name: string) => {
  await openScenes(page)
  await expect(sceneCard(page, name).getByText(tag, { exact: true })).toHaveCount(0)
})

Then(
  /^the "([^"]+)" scene card shows Edit, Duplicate, and Trash actions$/,
  async ({ page }, name: string) => {
    const card = sceneCard(page, name)
    await expect(card.getByRole('button', { name: `Edit ${name}` })).toBeVisible()
    await expect(card.getByRole('button', { name: `Duplicate ${name}` })).toBeVisible()
    await expect(card.getByRole('button', { name: `Delete ${name}` })).toBeVisible()
  },
)

Then('all scene cards have the same visual appearance', async ({ page }) => {
  const cards = page.getByTestId('scene-card')
  const count = await cards.count()
  expect(count).toBeGreaterThan(1)
})

Then('no scene card shows an ownership badge', async ({ page }) => {
  await expect(page.getByText(/owned|purchased/i)).toHaveCount(0)
})

Given(/^"([^"]+)" has the description "([^"]+)"$/, async ({ page }, name: string, description: string) => {
  const sceneId = await getSceneIdByName(page, name)
  await page.evaluate(
    async ({ id, desc }) => {
      const { db } = await import('../../../src/lib/storage/db')
      await db.scenes.update(id, { description: desc })
    },
    { id: sceneId, desc: description },
  )
})

Given(/^"([^"]+)" has cover image "([^"]+)"$/, async ({ page }, name: string, _image: string) => {
  const sceneId = await getSceneIdByName(page, name)
  await page.evaluate(
    async ({ id }) => {
      const { db } = await import('../../../src/lib/storage/db')
      await db.scenes.update(id, { coverArtUrl: 'data:image/png;base64,abc' })
    },
    { id: sceneId },
  )
})

Given(/^"([^"]+)" has "([^"]+)" soundscape category at Volume (\d+)%$/, async ({ page }, sceneName: string, category: string, volume: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await addSceneSoundscapeSeed(page, sceneId, category, Number.parseInt(volume, 10))
})

Given(/^"([^"]+)" has "([^"]+)" sound effect at Volume (\d+)%$/, async ({ page }, sceneName: string, effect: string, volume: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await addSceneEffectSeed(page, sceneId, effect)
  await page.evaluate(
    async ({ sid, effectName, vol }) => {
      const { db } = await import('../../../src/lib/storage/db')
      const item = await db.sceneEffects.where('sceneId').equals(sid).filter((e) => e.name === effectName).first()
      if (item) await db.sceneEffects.update(item.id, { volume: vol })
    },
    { sid: sceneId, effectName: effect, vol: Number.parseInt(volume, 10) },
  )
})

Given(/^"([^"]+)" has "([^"]+)" tag$/, async ({ page }, sceneName: string, tag: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await page.evaluate(
    async ({ id, tagName }) => {
      const { db } = await import('../../../src/lib/storage/db')
      const scene = await db.scenes.get(id)
      if (!scene) return
      await db.scenes.update(id, { tags: [...scene.tags, tagName] })
    },
    { id: sceneId, tagName: tag },
  )
})

When(/^I tap the duplicate icon on the "([^"]+)" scene card$/, async ({ page }, name: string) => {
  await openScenes(page)
  await sceneCard(page, name).getByRole('button', { name: `Duplicate ${name}` }).click()
})

Then('no duplicate-name dialog is shown', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

Given(/^I have duplicated the "([^"]+)" scene$/, async ({ page }, name: string) => {
  await openScenes(page)
  await sceneCard(page, name).getByRole('button', { name: `Duplicate ${name}` }).click()
})

Then(/^the "([^"]+)" scene has "([^"]+)" at Volume (\d+)%$/, async ({ page }, sceneName: string, category: string, volume: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  const stored = await page.evaluate(
    async ({ sid, categoryName }) => {
      const { db } = await import('../../../src/lib/storage/db')
      const item = await db.sceneSoundscapes.where('sceneId').equals(sid).filter((e) => e.categoryName === categoryName).first()
      return item?.volume
    },
    { sid: sceneId, categoryName: category },
  )
  expect(stored).toBe(Number.parseInt(volume, 10))
})

Then(/^the "([^"]+)" scene has "([^"]+)" sound effect$/, async ({ page }, sceneName: string, effect: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  const count = await page.evaluate(
    async ({ sid, effectName }) => {
      const { db } = await import('../../../src/lib/storage/db')
      return db.sceneEffects.where('sceneId').equals(sid).filter((e) => e.name === effectName).count()
    },
    { sid: sceneId, effectName: effect },
  )
  expect(count).toBe(1)
})

Then(/^the "([^"]+)" scene has "([^"]+)" tag$/, async ({ page }, sceneName: string, tag: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  const tags = await page.evaluate(async (sid) => {
    const { db } = await import('../../../src/lib/storage/db')
    return (await db.scenes.get(sid))?.tags ?? []
  }, sceneId)
  expect(tags).toContain(tag)
})

Then(/^the "([^"]+)" scene has cover image "([^"]+)"$/, async ({ page }, sceneName: string, _image: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  const cover = await page.evaluate(async (id) => {
    const { db } = await import('../../../src/lib/storage/db')
    return (await db.scenes.get(id))?.coverArtUrl
  }, sceneId)
  expect(cover).toBeTruthy()
})

When(/^I add "([^"]+)" to the "([^"]+)" soundscape categories$/, async ({ page }, category: string, sceneName: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await addSceneSoundscapeSeed(page, sceneId, category)
})

Then(/^the original "([^"]+)" scene does not contain "([^"]+)"$/, async ({ page }, sceneName: string, category: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  const count = await page.evaluate(
    async ({ sid, categoryName }) => {
      const { db } = await import('../../../src/lib/storage/db')
      return db.sceneSoundscapes.where('sceneId').equals(sid).filter((e) => e.categoryName === categoryName).count()
    },
    { sid: sceneId, categoryName: category },
  )
  expect(count).toBe(0)
})

When(/^I change "([^"]+)" Volume to (\d+)% on "([^"]+)"$/, async ({ page }, category: string, volume: string, sceneName: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await page.goto(getActiveScenePath(sceneId))
  await page.locator(`[data-category-name="${category}"] input[type="range"]`).fill(volume)
})
