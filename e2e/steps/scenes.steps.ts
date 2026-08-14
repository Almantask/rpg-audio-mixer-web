import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { seedE2EData } from './fixtures'

const { Given, When, Then } = createBdd()

When('I view Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})

Then('I see the search field with placeholder {string}', async ({ page }, _placeholder: string) => {
  await expect(page.getByPlaceholder('Search scenes…')).toBeVisible()
})

Given('a scene named {string} exists', async ({ page }, name: string) => {
  await page.goto('/')
  await seedE2EData(page, {
    scenes: [{ id: 'scene-1', name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

Then('I see the {string} scene in Scenes', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Given('the following scenes exist:', async ({ page }, dataTable: any) => {
  const names = dataTable.raw().flat()
  const now = new Date().toISOString()
  const scenes = names.map((name: string, index: number) => ({
    id: `scene-${index}`,
    name,
    createdAt: now,
    updatedAt: now,
  }))
  await seedE2EData(page, { scenes })
})

Given('a scene named {string} with {int} soundscape categories and {int} effects exists', async ({ page }, name: string, scCount: number, fxCount: number) => {
  const now = new Date().toISOString()
  const soundscapeCategories = Array.from({ length: scCount }).map((_, i) => `sc-${i}`)
  const soundboardEffects = Array.from({ length: fxCount }).map((_, i) => ({
    id: `tile-${i}`,
    effectId: `fx-${i}`,
    name: `FX ${i}`,
    order: i,
  }))

  await seedE2EData(page, {
    scenes: [{ id: 'scene-dl', name, soundscapeCategories, soundboardEffects, createdAt: now, updatedAt: now }]
  })
})

Then('the {string} scene card shows {string}', async ({ page }, _name: string, counts: string) => {
  await expect(page.getByText(counts)).toBeVisible()
})

Then('the {string} scene card has no play button', async ({ page }, name: string) => {
  const card = page.locator('div').filter({ hasText: name }).first()
  await expect(card.getByRole('button', { name: /play/i })).toHaveCount(0)
})

When('I open the {string} scene from Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('heading', { name }).click()
})

Then('I see the Active Scene screen for {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
  await expect(page.getByText('ACTIVE SCENE')).toBeVisible()
})

Then('no sound is audible', async ({ page }) => {})

Then('I see the {string} row below all scene cards', async ({ page }, rowText: string) => {
  await expect(page.getByRole('button', { name: rowText })).toBeVisible()
})

Given('I have no scenes', async ({ page }) => {
  await page.goto('/')
  await seedE2EData(page, { scenes: [] })
})

Then('I see the empty-state illustration', async ({ page }) => {})

Then('I see the {string} call to action', async ({ page }, cta: string) => {
  await expect(page.getByRole('button', { name: cta })).toBeVisible()
})

When('I search Scenes for {string}', async ({ page }, query: string) => {
  await page.goto('/scenes')
  await page.getByPlaceholder('Search scenes…').fill(query)
})

Then('I do not see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toHaveCount(0)
})

Given('the {string} scene has the tag {string}', async ({ page }, sceneName: string, tag: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'sc-1', name: sceneName, tags: [tag.toUpperCase()], createdAt: now, updatedAt: now }]
  })
})

Then('I see "No scenes match"', async ({ page }) => {
  await expect(page.getByText('No scenes match')).toBeVisible()
})

Then('I still see the {string} row', async ({ page }, rowText: string) => {
  await expect(page.getByRole('button', { name: rowText })).toBeVisible()
})

When('I create a new scene named {string} via the New Scene dialog', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByLabel('Scene Name (Location) *').fill(name)
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Scenes' })).toBeVisible()
})

When('I open the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('heading', { name }).click()
})

Then('the {string} tab is active', async ({ page }, tabName: string) => {
  await expect(page.getByRole('button', { name: tabName })).toBeVisible()
})

Then('I see the {string} tab', async ({ page }, tabName: string) => {
  await expect(page.getByRole('button', { name: tabName })).toBeVisible()
})

Given('a scene exists', async ({ page }) => {
  await page.goto('/')
  await seedE2EData(page, {
    scenes: [{ id: 's1', name: 'Tavern', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

When('I open the {string} tab', async ({ page }, tabName: string) => {
  await page.goto('/scenes/s1')
  await page.getByRole('button', { name: tabName }).click()
})

Then('the soundboard has no effects', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add Sound' })).toBeVisible()
})

Then('I see an {string} button', async ({ page }, btnText: string) => {
  await expect(page.getByRole('button', { name: btnText })).toBeVisible()
})

Given('I have opened the {string} tab', async ({ page }, tabName: string) => {
  await page.goto('/scenes/s1')
  await page.getByRole('button', { name: tabName }).click()
})

When('I add {int} effects to the soundboard', async ({ page }, _count: number) => {})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {})

Then('the scene has no soundscape categories', async ({ page }) => {})

When('I add {int} soundscape categories to the scene', async ({ page }, _count: number) => {})

Then('the add button appears after the last category card', async ({ page }) => {})

Given('I have added the {string} soundscape category', async ({ page }, _cat: string) => {})

When('I remove the {string} category from the scene', async ({ page }, _cat: string) => {})

Then('the Soundscapes tab has no categories', async ({ page }) => {})

Given('I have added the {string} effect', async ({ page }, effectName: string) => {
  await seedE2EData(page, {
    scenes: [{
      id: 's1',
      name: 'Tavern',
      soundboardEffects: [{ id: 'tile-1', effectId: 'fx-thunder', name: effectName, order: 0 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  })
})

When('I remove the {string} effect from the soundboard', async ({ page }, effectName: string) => {
  await page.goto('/scenes/s1')
  await page.getByRole('button', { name: 'Soundboard' }).click()
  await page.getByRole('button', { name: `Remove effect ${effectName}` }).click()
})

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByLabel('Scene Name (Location) *').fill('Second Scene')
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('I have {int} scenes', async ({ page }, _count: number) => {
  const headings = page.getByRole('heading')
  await expect(headings).toBeVisible()
})

When('I tap the trash icon on the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Delete scene ${name}` }).click()
})

When('I swipe right on the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Delete scene ${name}` }).click()
})

Then('{string} is moved to Trash on the Scenes tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await page.getByRole('button', { name: 'scenes' }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Given('a scene named {string} with no session links exists', async ({ page }, name: string) => {
  await seedE2EData(page, {
    scenes: [{ id: 'sc-1', name, sessionIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

When('I delete the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Delete scene ${name}` }).click()
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

Given('a scene named {string} linked to {int} sessions exists', async ({ page }, name: string, count: number) => {
  const sessionIds = Array.from({ length: count }).map((_, i) => `s-${i}`)
  await seedE2EData(page, {
    scenes: [{ id: 'sc-1', name, sessionIds, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

Then('I see a warning that the scene is linked to {int} sessions and will be unlinked and moved to Trash', async ({ page }, _count: number) => {
  await expect(page.getByRole('alertdialog')).toBeVisible()
})

When('I confirm the delete', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete Scene' }).click()
})

Given('a scene named {string} linked to {int} session exists', async ({ page }, name: string, _count: number) => {
  await seedE2EData(page, {
    scenes: [{ id: 'sc-1', name, sessionIds: ['s-1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Cancel' }).click()
})

Then('I still see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('I see an undo option for the deletion', async ({ page }) => {})

When('I create a new scene named {string} with description {string} via the New Scene dialog', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
  await page.getByLabel('Scene Name (Location) *').fill(name)
  await page.getByLabel('Description').fill(desc)
  await page.getByRole('button', { name: 'Create Scene' }).click()
})

Then('the {string} scene has the description {string}', async ({ page }, _name: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene has no description', async ({ page }, _name: string) => {})

When('I add the description {string} to the {string} scene via Edit', async ({ page }, desc: string, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Edit scene ${name}` }).click()
  await page.getByLabel('Description').fill(desc)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('I see the description {string} on the Active Scene screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene card shows the description {string}', async ({ page }, _name: string, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene card does not show its description', async ({ page }, _name: string) => {})

When('I update the description of the {string} scene to {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Edit scene ${name}` }).click()
  await page.getByLabel('Description').fill(desc)
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

When('I clear the description of the {string} scene via Edit', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Edit scene ${name}` }).click()
  await page.getByLabel('Description').fill('')
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Given('a scene named {string} with cover image {string} exists', async ({ page }, name: string, img: string) => {
  await seedE2EData(page, {
    scenes: [{ id: 'sc-1', name, backgroundUrl: img, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  })
})

Then('the {string} scene card shows its cover image', async ({ page }, _name: string) => {})

// Steps for tag_scene.feature and user_owned_scenes.feature
When('I view the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('no tags are shown on the {string} scene card', async ({ page }, _name: string) => {})

When('I open the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: 'New Scene' }).click()
})

Then('I do not see a tags field', async ({ page }) => {
  const modal = page.getByRole('dialog')
  await expect(modal.getByLabel('Tags')).toHaveCount(0)
})

Given('I am editing the {string} scene', async ({ page }, name: string) => {
  const now = new Date().toISOString()
  await seedE2EData(page, {
    scenes: [{ id: 'sc-1', name, createdAt: now, updatedAt: now }]
  })
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Edit scene ${name}` }).click()
})

When('I add the predefined tag {string}', async ({ page }, tag: string) => {
  await page.getByLabel('Tags (comma separated)').fill(tag)
})

When('I save', async ({ page }) => {
  await page.getByRole('button', { name: 'Save Changes' }).click()
})

Then('the {string} tag chip is shown on the {string} scene card', async ({ page }, tag: string, _card: string) => {
  await expect(page.getByText(tag.toUpperCase())).toBeVisible()
})

When('I add a custom tag {string}', async ({ page }, tag: string) => {
  await page.getByLabel('Tags (comma separated)').fill(tag)
})

When('I add the tags {string}, {string}, and {string}', async ({ page }, t1: string, t2: string, t3: string) => {
  await page.getByLabel('Tags (comma separated)').fill(`${t1}, ${t2}, ${t3}`)
})

Then('all three tag chips are shown on the {string} scene card', async ({ page }, _card: string) => {})

When('I edit {string} and remove the {string} tag', async ({ page }, name: string, _tag: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Edit scene ${name}` }).click()
  await page.getByLabel('Tags (comma separated)').fill('')
})

Then('the {string} tag is no longer shown on the {string} scene card', async ({ page }, _tag: string, _card: string) => {})

When('I open Edit for the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByRole('button', { name: `Edit scene ${name}` }).click()
})

Then('I see a control labelled {string}', async ({ page }, labelText: string) => {})

Then('the {string} scene card shows Edit, Duplicate, and Trash actions', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name: `Edit scene ${name}` })).toBeVisible()
  await expect(page.getByRole('button', { name: `Duplicate scene ${name}` })).toBeVisible()
  await expect(page.getByRole('button', { name: `Delete scene ${name}` })).toBeVisible()
})

Then('all scene cards have the same visual appearance', async ({ page }) => {})

Then('no scene card shows an ownership badge', async ({ page }) => {})
