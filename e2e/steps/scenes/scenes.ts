import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  DEFAULT_SCENE_NAME,
  buildScene,
  buildSoundboardEntry,
  buildSceneSoundscapeSlot,
  buildSoundscapeCategory,
  buildFxTrack,
  buildSession,
  buildSessionSceneLink,
  ensureDefaultSession,
  mergeE2EData,
  mergeScene,
  openActiveScene,
  openScenes,
  parseSceneList,
  resetE2EData,
  sceneIdForName,
  seedSceneWithCounts,
  expectNoAudioPlayback,
  tableColumnValues,
} from '../shared/test-data'

const { Given, When, Then, Step } = createBdd()

Given('I have no scenes', async ({ page }) => {
  await resetE2EData(page)
})

Given('a scene exists', async ({ page }) => {
  await resetE2EData(page)
  await mergeE2EData(page, { scenes: [buildScene(DEFAULT_SCENE_NAME)] })
  await openActiveScene(page, DEFAULT_SCENE_NAME)
})

Given('a scene named {string} exists', async ({ page }, name: string) => {
  await mergeScene(page, buildScene(name))
})

Given(
  'a scene named {string} with {int} soundscape categories and {int} effects exists',
  async ({ page }, name: string, scCount: number, fxCount: number) => {
    await seedSceneWithCounts(page, name, scCount, fxCount)
  },
)

Given('a scene named {string} with no session links exists', async ({ page }, name: string) => {
  await mergeScene(page, buildScene(name))
})

async function seedLinkedScene(page: import('@playwright/test').Page, name: string, count: number) {
  const scene = buildScene(name)
  const { campaign, session } = await ensureDefaultSession(page)
  const sessions = [session]
  const links = [
    buildSessionSceneLink(session.id, scene.id),
  ]

  for (let index = 2; index <= count; index += 1) {
    const extraSession = buildSession(campaign.id, index, `Night ${index}`)
    sessions.push(extraSession)
    links.push(buildSessionSceneLink(extraSession.id, scene.id))
  }

  await mergeE2EData(page, { scenes: [scene], sessionSceneLinks: links, sessions })
}

Given(
  'a scene named {string} linked to {int} sessions exists',
  async ({ page }, name: string, count: number) => {
    await seedLinkedScene(page, name, count)
  },
)

Given(
  'a scene named {string} linked to {int} session exists',
  async ({ page }, name: string, count: number) => {
    await seedLinkedScene(page, name, count)
  },
)

Given('the following scenes exist:', async ({ page }, dataTable) => {
  const names = tableColumnValues(dataTable)
  await mergeE2EData(page, { scenes: names.map((name) => buildScene(name)) })
})

Given(
  'a scene named {string} with cover image {string} exists',
  async ({ page }, name: string, imageFile: string) => {
    void imageFile
    await mergeScene(
      page,
      buildScene(name, {
        coverArtUrl:
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23d4af37" width="80" height="80"/></svg>',
      }),
    )
  },
)

Step('the {string} scene has the description {string}', async ({ page, $bddContext }, name, description) => {
  const keywordType = $bddContext.bddTestData.steps[$bddContext.stepIndex]?.keywordType
  if (keywordType === 'Outcome') {
    const stored = await page.evaluate((sceneName) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      if (!raw) return null
      const data = JSON.parse(raw)
      return data.scenes?.find((scene: { name: string }) => scene.name === sceneName)?.description
    }, name)
    expect(stored).toBe(description)
    return
  }
  await mergeScene(page, buildScene(name, { description }))
})

Step('the {string} scene has no description', async ({ page, $bddContext }, name: string) => {
  const keywordType = $bddContext.bddTestData.steps[$bddContext.stepIndex]?.keywordType
  if (keywordType === 'Outcome') {
    const stored = await page.evaluate((sceneName) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      if (!raw) return undefined
      const data = JSON.parse(raw)
      return data.scenes?.find((scene: { name: string }) => scene.name === sceneName)?.description
    }, name)
    expect(stored ?? '').toBe('')
    return
  }
  await mergeScene(page, buildScene(name, { description: undefined }))
})

Given('the {string} scene has the tag {string}', async ({ page }, name, tag) => {
  await mergeScene(page, buildScene(name, { tags: [tag] }))
})

Given('I am editing the {string} scene', async ({ page }, name: string) => {
  await mergeScene(page, buildScene(name))
  await openScenes(page)
  await page.locator(`[data-edit-scene="${name}"]`).click()
})

When('I view Scenes', async ({ page }) => {
  await openScenes(page)
})

When('I view the {string} scene card', async ({ page }, name: string) => {
  await openScenes(page)
  await expect(page.locator(`[data-scene-card="${name}"]`)).toBeVisible()
})

When('I search Scenes for {string}', async ({ page }, query: string) => {
  await openScenes(page)
  await page.locator('[data-scenes-search]').fill(query)
})

When('I open the New Scene dialog', async ({ page }) => {
  await openScenes(page)
  await page.locator('[data-new-scene-row]').click()
})

When('I create a new scene named {string} via the New Scene dialog', async ({ page }, name) => {
  await openScenes(page)
  await page.locator('[data-new-scene-row]').click()
  await page.getByLabel('Scene name').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: 'Create', exact: true }).click()
})

When(
  'I create a new scene named {string} with description {string} via the New Scene dialog',
  async ({ page }, name, description) => {
    await openScenes(page)
    await page.locator('[data-new-scene-row]').click()
    await page.getByLabel('Scene name').fill(name)
    await page.getByLabel('Scene description').fill(description)
    await page.getByRole('dialog').getByRole('button', { name: 'Create', exact: true }).click()
  },
)

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await openScenes(page)
  await page.locator('[data-new-scene-row]').click()
  await page.getByLabel('Scene name').fill('Second Scene')
  await page.getByRole('dialog').getByRole('button', { name: 'Create', exact: true }).click()
})

When('I open the {string} scene from Scenes', async ({ page }, name: string) => {
  await openScenes(page)
  await page.locator(`[data-scene-body="${name}"]`).click()
})

When('I open the {string} scene', async ({ page }, name: string) => {
  await openActiveScene(page, name)
})

When(
  'I add the description {string} to the {string} scene via Edit',
  async ({ page }, description, name) => {
    await openScenes(page)
    await page.locator(`[data-edit-scene="${name}"]`).click()
    await page.getByLabel('Scene description').fill(description)
    await page.getByRole('button', { name: 'Save' }).click()
  },
)

When(
  'I update the description of the {string} scene to {string}',
  async ({ page }, name, description) => {
    await openScenes(page)
    await page.locator(`[data-edit-scene="${name}"]`).click()
    await page.getByLabel('Scene description').fill(description)
    await page.getByRole('button', { name: 'Save' }).click()
  },
)

When('I clear the description of the {string} scene via Edit', async ({ page }, name) => {
  await openScenes(page)
  await page.locator(`[data-edit-scene="${name}"]`).click()
  await page.getByLabel('Scene description').fill('')
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I add the predefined tag {string}', async ({ page }, tag: string) => {
  await page.locator('[data-scene-tag-input]').fill(tag)
  await page.getByRole('option', { name: tag, exact: true }).click()
})

When('I add a custom tag {string}', async ({ page }, tag: string) => {
  await page.locator('[data-scene-tag-input]').fill(tag)
  await page.getByRole('button', { name: 'Add tag' }).click()
})

When('I add the tags {string}, {string}, and {string}', async ({ page }, t1, t2, t3) => {
  for (const tag of [t1, t2, t3]) {
    await page.locator('[data-scene-tag-input]').fill(tag)
    await page.getByRole('button', { name: 'Add tag' }).click()
  }
})

When('I edit {string} and remove the {string} tag', async ({ page }, name, tag) => {
  await openScenes(page)
  await page.locator(`[data-edit-scene="${name}"]`).click()
  await page.locator(`[data-scene-edit-tag="${tag}"]`).getByRole('button', { name: 'Remove' }).click()
})

When('I save', async ({ page }) => {
  await page.getByRole('button', { name: 'Save' }).click()
})

When('I delete the {string} scene', async ({ page }, name: string) => {
  await openScenes(page)
  await page.locator(`[data-delete-scene="${name}"]`).click()
})

When('I confirm the delete', async ({ page }) => {
  await page.getByRole('button', { name: /confirm delete/i }).click()
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

When(
  'I {string} on the {string} card',
  async ({ page }, action: string, cardName: string) => {
    if (action === 'tap the trash icon') {
      await page.locator(`[data-delete-scene="${cardName}"]`).click()
      return
    }
    if (action === 'swipe right') {
      const card = page.locator(`[data-scene-card="${cardName}"]`)
      const box = await card.boundingBox()
      if (!box) throw new Error(`Scene card not found: ${cardName}`)
      await page.touchscreen.tap(box.x + 10, box.y + box.height / 2)
      await page.touchscreen.tap(box.x + box.width - 10, box.y + box.height / 2)
      return
    }
    throw new Error(`Unknown scene card action: ${action}`)
  },
)

When('I open the {string} tab', async ({ page }, tab: string) => {
  await page.locator(`[data-active-scene-tab="${tab}"]`).click()
})

When('I have opened the {string} tab', async ({ page }, tab: string) => {
  await page.locator(`[data-active-scene-tab="${tab}"]`).click()
})

When('I add {int} effects to the soundboard', async ({ page }, count: number) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const entries = Array.from({ length: count }, (_, index) => {
    const fx = buildFxTrack(`Effect ${index + 1}`)
    return {
      fx,
      entry: buildSoundboardEntry(sceneId, fx.id, index + 1),
    }
  })
  await mergeE2EData(page, {
    fxTracks: entries.map((item) => item.fx),
    sceneSoundboardEntries: entries.map((item) => item.entry),
    scenes: [buildScene(DEFAULT_SCENE_NAME)],
  })
  await page.goto(`/scenes/${sceneId}/active?tab=soundboard`)
  await page.waitForLoadState('networkidle')
})

When('I add {int} soundscape categories to the scene', async ({ page }, count: number) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const categories = Array.from({ length: count }, (_, index) =>
    buildSoundscapeCategory(`Category ${index + 1}`),
  )
  const slots = categories.map((category, index) =>
    buildSceneSoundscapeSlot(sceneId, category.id, index),
  )
  await mergeE2EData(page, {
    soundscapeCategories: categories,
    sceneSoundscapeSlots: slots,
    scenes: [buildScene(DEFAULT_SCENE_NAME)],
  })
  await page.goto(`/scenes/${sceneId}/active?tab=soundscapes`)
  await page.waitForLoadState('networkidle')
})

When('I have added the {string} soundscape category', async ({ page }, categoryName: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const category = buildSoundscapeCategory(categoryName)
  await mergeE2EData(page, {
    soundscapeCategories: [category],
    sceneSoundscapeSlots: [buildSceneSoundscapeSlot(sceneId, category.id, 0)],
    scenes: [buildScene(DEFAULT_SCENE_NAME)],
  })
  await page.goto(`/scenes/${sceneId}/active?tab=soundscapes`)
  await page.waitForLoadState('networkidle')
})

When('I have added the {string} effect', async ({ page }, effectName: string) => {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const fx = buildFxTrack(effectName)
  await mergeE2EData(page, {
    fxTracks: [fx],
    sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, 1)],
    scenes: [buildScene(DEFAULT_SCENE_NAME)],
  })
  await page.goto(`/scenes/${sceneId}/active?tab=soundboard`)
  await page.waitForLoadState('networkidle')
})

When('I remove the {string} category from the scene', async ({ page }, categoryName: string) => {
  await page.locator(`[data-soundscape-delete="${categoryName}"]`).click()
})

When('I remove the {string} effect from the soundboard', async ({ page }, effectName: string) => {
  await page.locator(`[data-soundboard-delete="${effectName}"]`).click()
})

Then('I see the {string} scene in Scenes', async ({ page }, name: string) => {
  if (!page.url().includes('/scenes')) {
    await openScenes(page)
  }
  await expect(page.locator(`[data-scene-card="${name}"]`)).toBeVisible()
})

Then('I do not see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.locator(`[data-scene-card="${name}"]`)).toHaveCount(0)
})

Then('I still see {string} in Scenes', async ({ page }, name: string) => {
  await openScenes(page)
  await expect(page.locator(`[data-scene-card="${name}"]`)).toBeVisible()
})

Then('I see the search field with placeholder {string}', async ({ page }, placeholder: string) => {
  await expect(page.locator('[data-scenes-search]')).toHaveAttribute('placeholder', placeholder)
})

Then(
  'the {string} scene card shows {string}',
  async ({ page }, name: string, stats: string) => {
    await expect(page.locator(`[data-scene-stats="${name}"]`)).toHaveText(stats)
  },
)

Then('the {string} scene card has no play button', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.locator('[data-scene-play]')).toHaveCount(0)
})

Then('I see the Active Scene screen for {string}', async ({ page }, name: string) => {
  await expect(page.locator('[data-screen="Active Scene screen"]')).toBeVisible()
  await expect(page.locator(`[data-scene-name="${name}"]`)).toBeVisible()
})

Then('no audio playback has started', async ({ page }) => {
  await expectNoAudioPlayback(page)
})

Then('I see the {string} row below all scene cards', async ({ page }, label: string) => {
  const cards = page.locator('[data-scene-card]')
  const row = page.getByRole('button', { name: label })
  const cardCount = await cards.count()
  if (cardCount > 0) {
    const lastCard = cards.nth(cardCount - 1)
    const lastBox = await lastCard.boundingBox()
    const rowBox = await row.boundingBox()
    expect(lastBox && rowBox && rowBox.y > lastBox.y).toBeTruthy()
  }
  await expect(row).toBeVisible()
})

Then('I see the empty-state illustration', async ({ page }) => {
  await expect(page.locator('[data-scenes-empty]')).toBeVisible()
})

Then('I see the {string} call to action', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('I see {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message, { exact: false })).toBeVisible()
})

Then('I still see the {string} row', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page.locator('[data-screen="Scenes screen"]')).toBeVisible()
})

Then(
  'I see the description {string} on the Active Scene screen',
  async ({ page }, description: string) => {
    await expect(page.locator('[data-scene-description]')).toHaveText(description)
  },
)

Then('the {string} scene card does not show its description', async ({ page }, name: string) => {
  const card = page.locator(`[data-scene-card="${name}"]`)
  await expect(card.locator('[data-scene-description]')).toHaveCount(0)
})

Then('the {string} scene card shows its cover image', async ({ page }, name: string) => {
  await expect(page.locator(`[data-scene-cover="${name}"] img`)).toBeVisible()
})

Then('no tags are shown on the card', async ({ page }) => {
  await expect(page.locator('[data-scene-tag]')).toHaveCount(0)
})

Then('I do not see a tags field', async ({ page }) => {
  await expect(page.locator('[data-scene-tags-field]')).toHaveCount(0)
})

Then(
  'the {string} tag chip is shown on the {string} scene card',
  async ({ page }, tag: string, sceneName: string) => {
    const card = page.locator(`[data-scene-card="${sceneName}"]`)
    await expect(card.locator(`[data-scene-tag="${tag}"]`)).toBeVisible()
  },
)

Then(
  'all three tag chips are shown on the {string} scene card',
  async ({ page }, sceneName: string) => {
    const card = page.locator(`[data-scene-card="${sceneName}"]`)
    await expect(card.locator('[data-scene-tag]')).toHaveCount(3)
  },
)

Then(
  'the {string} tag is no longer shown on the {string} scene card',
  async ({ page }, tag: string, sceneName: string) => {
    const card = page.locator(`[data-scene-card="${sceneName}"]`)
    await expect(card.locator(`[data-scene-tag="${tag}"]`)).toHaveCount(0)
  },
)

Then(
  'the {string} scene card shows Edit, Duplicate, and Trash actions',
  async ({ page }, name: string) => {
    const card = page.locator(`[data-scene-card="${name}"]`)
    await expect(card.locator(`[data-edit-scene="${name}"]`)).toBeVisible()
    await expect(card.locator(`[data-duplicate-scene="${name}"]`)).toBeVisible()
    await expect(card.locator(`[data-delete-scene="${name}"]`)).toBeVisible()
  },
)

Then('all scene cards have the same visual appearance', async ({ page }) => {
  const cards = page.locator('[data-scene-card]')
  const count = await cards.count()
  expect(count).toBeGreaterThan(1)
  for (let index = 0; index < count; index += 1) {
    await expect(cards.nth(index)).toHaveAttribute('data-scene-variant', 'default')
  }
})

Then('no scene card shows an ownership badge', async ({ page }) => {
  await expect(page.locator('[data-scene-ownership-badge]')).toHaveCount(0)
})

Then('{string} is moved to Trash on the Scenes tab', async ({ page }, name: string) => {
  await page.goto('/trash?tab=scenes')
  await expect(page.locator(`[data-trashed-scene="${name}"]`)).toBeVisible()
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

Then(
  'I see a warning that the scene is linked to {int} sessions and will be unlinked and moved to Trash',
  async ({ page }, count: number) => {
    await expect(page.getByRole('alertdialog')).toContainText(
      `linked to ${count} session`,
    )
  },
)

Then('I see an undo option for the deletion', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible()
})

Then('I have {int} scenes', async ({ page }, count: number) => {
  await expect(page.locator('[data-scene-card]')).toHaveCount(count)
})

Then('the {string} tab is active', async ({ page }, tab: string) => {
  await expect(page.locator(`[data-active-scene-tab="${tab}"]`)).toHaveAttribute('data-active', 'true')
})

Then('I see the {string} tab', async ({ page }, tab: string) => {
  await expect(page.locator(`[data-active-scene-tab="${tab}"]`)).toBeVisible()
})

Then('the soundboard has no effects', async ({ page }) => {
  await expect(page.locator('[data-soundboard-tile]')).toHaveCount(0)
  await expect(page.locator('[data-soundboard-empty]')).toBeVisible()
})

Then('I see an {string} button', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {
  const tiles = page.locator('[data-soundboard-tile], [data-soundboard-add]')
  const count = await tiles.count()
  await expect(tiles.nth(count - 1)).toHaveAttribute('data-soundboard-add', 'true')
})

Then('the scene has no soundscape categories', async ({ page }) => {
  await expect(page.locator('[data-soundscape-category]')).toHaveCount(0)
  await expect(page.locator('[data-soundscape-empty]')).toBeVisible()
})

Then('the add button appears after the last category card', async ({ page }) => {
  const categories = page.locator('[data-soundscape-category]')
  const addButton = page.locator('[data-soundscape-add]')
  const count = await categories.count()
  const lastCategory = categories.nth(count - 1)
  const lastBox = await lastCategory.boundingBox()
  const addBox = await addButton.boundingBox()
  expect(lastBox && addBox && addBox.y >= lastBox.y).toBeTruthy()
})

Then('the Soundscapes tab has no categories', async ({ page }) => {
  await expect(page.locator('[data-soundscape-category]')).toHaveCount(0)
})

Given('I have scenes {string} in Scenes', async ({ page }, available: string) => {
  const names = parseSceneList(available)
  await mergeE2EData(page, { scenes: names.map((name) => buildScene(name)) })
})
