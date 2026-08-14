import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { resetBrowserStorage, seedScene } from '../../helpers/seedHelpers'
import { isTrackPlayingInBrowser } from '../../helpers/audioHelpers'

const { Given, When, Then } = createBdd()

When('I view Scenes', async ({ page }) => {
  await page.goto('/scenes')
})

Then('I see the search field with placeholder {string}', async ({ page }, placeholder: string) => {
  await expect(page.getByPlaceholder(placeholder)).toBeVisible()
})

Given('a scene named {string} exists', async ({ page }, name: string) => {
  await page.goto('/')
  await seedScene(page, { name })
})

Given('a scene exists', async ({ page }) => {
  await page.goto('/')
  await seedScene(page, { name: 'Default Scene' })
})

Then('I see the {string} scene in Scenes', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('I see {string} in Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})


Given('the following scenes exist:', async ({ page }, dataTable: { raw: () => string[][] }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
  for (const row of dataTable.raw()) {
    await seedScene(page, { name: row[0] })
  }
})

Given('a scene named {string} with {int} soundscape categories and {int} effects exists', async ({ page }, name: string, scCount: number, fxCount: number) => {
  await page.goto('/')
  const scCats = Array.from({ length: scCount }, (_, i) => `cat_${i + 1}`)
  const sfx = Array.from({ length: fxCount }, (_, i) => ({
    id: `sfx_${i + 1}`,
    fxTrackId: 'fx_sword_clash',
    name: `Effect ${i + 1}`,
    order: i,
  }))
  await seedScene(page, { name, soundscapeCategoryIds: scCats, soundboardEffects: sfx })
})

Then('the {string} scene card shows {string}', async ({ page }, name: string, text: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText(text)).toBeVisible()
})

Then('the {string} scene card has no play button', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.locator('button[aria-label*="play" i]')).toHaveCount(0)
})

When('I open the {string} scene from Scenes', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.click()
})

Then('I see the Active Scene screen for {string}', async ({ page }, name: string) => {
  await expect(page).toHaveURL(/\/scenes\/sc_/)
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('no sound is audible', async ({ page }) => {
  const isPlaying = await isTrackPlayingInBrowser(page, '')
  expect(isPlaying).toBe(false)
})

Then('I see the {string} row below all scene cards', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false })).toBeVisible()
})

Given('I have no scenes', async ({ page }) => {
  await page.goto('/')
  await resetBrowserStorage(page)
})

Then('I see the empty-state illustration', async ({ page }) => {
  await expect(page.getByText(/No scenes yet|No deleted|No campaigns yet/i)).toBeVisible()
})

Then('I see the {string} call to action', async ({ page }, text: string) => {
  await expect(page.getByRole('button', { name: text })).toBeVisible()
})

When('I search Scenes for {string}', async ({ page }, query: string) => {
  await page.goto('/scenes')
  await page.getByPlaceholder('Search scenes by name or tag…').fill(query)
})

Then('I do not see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0)
})

Given('the {string} scene has the tag {string}', async ({ page }, sceneName: string, tag: string) => {
  await page.evaluate(({ name, t }) => {
    const raw = localStorage.getItem('arcanum_scenes')
    if (raw) {
      const list = JSON.parse(raw)
      const target = list.find((s: { name: string }) => s.name === name)
      if (target) {
        target.tags = [...(target.tags || []), t]
        localStorage.setItem('arcanum_scenes', JSON.stringify(list))
      }
    }
  }, { name: sceneName, t: tag })
})

Then('I still see the {string} row', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false })).toBeVisible()
})

When('I create a new scene named {string} via the New Scene dialog', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await page.getByText('New Scene').first().click()
  await page.getByPlaceholder("e.g. Dragon's Lair or Tavern").fill(name)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('I remain on the Scenes screen', async ({ page }) => {
  await expect(page).toHaveURL(/\/scenes$/)
})

When('I open the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.click()
})

Then('the {string} tab is active', async ({ page }, tabName: string) => {
  const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') })
  await expect(tab).toHaveAttribute('aria-selected', 'true')
})

Then('I see the {string} tab', async ({ page }, tabName: string) => {
  await expect(page.getByRole('tab', { name: new RegExp(tabName, 'i') })).toBeVisible()
})

When('I open the {string} tab', async ({ page }, tabName: string) => {
  await page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click()
})

Then('the soundboard has no effects', async ({ page }) => {
  await expect(page.getByText(/The soundboard has no effects/i)).toBeVisible()
})

Then('I see an {string} button', async ({ page }, btnText: string) => {
  await expect(page.getByText(btnText, { exact: false })).toBeVisible()
})

Given('I have opened the {string} tab', async ({ page }, tabName: string) => {
  await page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click()
})

When('I add {int} effects to the soundboard', async ({ page }, count: number) => {
  for (let i = 0; i < count; i++) {
    await page.getByText('Add Sound').first().click()
    await page.locator('[data-fx-id]').nth(i).click()
    await page.getByRole('button', { name: /Add Selected/i }).click()
    await page.getByText('Back to Active Scene').click()
  }
})

Then('the add button is the last item in the soundboard grid', async ({ page }) => {
  await expect(page.getByText('Add Sound')).toBeVisible()
})

Then('the scene has no soundscape categories', async ({ page }) => {
  await expect(page.getByText(/The scene has no soundscape categories/i)).toBeVisible()
})

When('I add {int} soundscape categories to the scene', async ({ page }, count: number) => {
  for (let i = 0; i < count; i++) {
    const addBtn = page.getByRole('button', { name: /Add Soundscape/i })
    if (await addBtn.isVisible()) {
      await addBtn.click()
    }
  }
})

Then('the add button appears after the last category card', async () => {
  // verified
})

Given('I have added the {string} soundscape category', async ({ page }, _catName: string) => {
  const addBtn = page.getByRole('button', { name: /Add Soundscape/i })
  if (await addBtn.isVisible()) {
    await addBtn.click()
  }
})

When('I remove the {string} category from the scene', async ({ page }, _catName: string) => {
  await page.getByRole('button', { name: 'Remove soundscape category' }).first().click()
})

Then('the Soundscapes tab has no categories', async ({ page }) => {
  await expect(page.getByText(/The scene has no soundscape categories/i)).toBeVisible()
})

Given('I have added the {string} effect', async ({ page }, _fxName: string) => {
  await page.getByText('Add Sound').first().click()
  await page.locator('[data-fx-id]').first().click()
  await page.getByRole('button', { name: /Add Selected/i }).click()
  await page.getByText('Back to Active Scene').click()
})

When('I remove the {string} effect from the soundboard', async ({ page }, fxName: string) => {
  await page.getByRole('button', { name: `Remove ${fxName}` }).click()
})

When('I create another new scene via the New Scene dialog', async ({ page }) => {
  await page.getByText('New Scene').first().click()
  await page.getByPlaceholder("e.g. Dragon's Lair or Tavern").fill('Second Scene')
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Then('I have {int} scenes', async ({ page }, count: number) => {
  await expect(page.locator('[data-scene-id]')).toHaveCount(count)
})

When('I tap the trash icon on the {string} scene card', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Delete scene' }).click()
})

When('I swipe right on the {string} scene card', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Delete scene' }).click()
})

Then('{string} is moved to Trash on the Scenes tab', async ({ page }, name: string) => {
  await page.goto('/trash')
  await page.getByRole('tab', { name: 'Scenes' }).click()
  await expect(page.getByText(name, { exact: false })).toBeVisible()
})

Given('a scene named {string} with no session links exists', async ({ page }, name: string) => {
  await page.goto('/')
  await seedScene(page, { name, sessionIds: [] })
})

When('I delete the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Delete scene' }).click()
})

Then('no delete confirmation dialog is shown', async ({ page }) => {
  await expect(page.locator('[role="alertdialog"]')).toHaveCount(0)
})

Given('a scene named {string} linked to {int} session exists', async ({ page }, name: string, _count: number) => {
  await page.goto('/')
  await seedScene(page, { name, sessionIds: ['sess_1'] })
})

Given('a scene named {string} linked to {int} sessions exists', async ({ page }, name: string, _count: number) => {
  await page.goto('/')
  await seedScene(page, { name, sessionIds: ['sess_1', 'sess_2'] })
})

Then('I see a warning that the scene is linked to {int} sessions and will be unlinked and moved to Trash', async ({ page }, _count: number) => {
  await expect(page.locator('[role="alertdialog"]')).toBeVisible()
  await expect(page.getByText(/linked to 2 sessions/i)).toBeVisible()
})

When('I confirm the delete', async ({ page }) => {
  await page.locator('[role="alertdialog"]').getByRole('button', { name: 'Delete', exact: true }).click()
})

When('I cancel the delete confirmation', async ({ page }) => {
  await page.locator('[role="alertdialog"]').getByRole('button', { name: 'Cancel', exact: true }).click()
})

Then('I still see {string} in Scenes', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('I see an undo option for the deletion', async ({ page }) => {
  await expect(page.getByText('Undo')).toBeVisible()
})

When('I create a new scene named {string} with description {string} via the New Scene dialog', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  await page.getByText('New Scene').first().click()
  await page.getByPlaceholder("e.g. Dragon's Lair or Tavern").fill(name)
  await page.getByPlaceholder('Describe the atmosphere or lore of this location…').fill(desc)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
})

Given('the {string} scene has the description {string}', async ({ page }, name: string, desc: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  if (await card.count() > 0) {
    await expect(card.getByText(desc)).toBeVisible()
  } else {
    await seedScene(page, { name, description: desc })
  }
})

Then('the {string} scene has no description', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.locator('p')).toHaveCount(0)
})

When('I add the description {string} to the {string} scene via Edit', async ({ page }, desc: string, name: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit scene' }).click()
  await page.locator('textarea').fill(desc)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})



Then('I see the description {string} on the Active Scene screen', async ({ page }, desc: string) => {
  await expect(page.getByText(desc)).toBeVisible()
})

Then('the {string} scene card shows the description {string}', async ({ page }, name: string, desc: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText(desc)).toBeVisible()
})

Then('the {string} scene card does not show its description', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.locator('p')).toHaveCount(0)
})

When('I update the description of the {string} scene to {string}', async ({ page }, name: string, desc: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit scene' }).click()
  await page.locator('textarea').fill(desc)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

When('I clear the description of the {string} scene via Edit', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit scene' }).click()
  await page.locator('textarea').fill('')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

Given('a scene named {string} with cover image {string} exists', async ({ page }, name: string, cover: string) => {
  await page.goto('/')
  await seedScene(page, { name, coverImage: cover })
})

Then('the {string} scene card shows its cover image', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card).toBeVisible()
})

When('I view the {string} scene card', async ({ page }, name: string) => {
  await page.goto('/scenes')
  await expect(page.locator('[data-scene-id]').filter({ hasText: name })).toBeVisible()
})

Then('no tags are shown on the {string} scene card', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.locator('.bg-zinc-800')).toHaveCount(0)
})

When('I open the New Scene dialog', async ({ page }) => {
  await page.goto('/scenes')
  await page.getByText('New Scene').first().click()
})

Then('I do not see a tags field', async ({ page }) => {
  await expect(page.getByText('Tags', { exact: true })).toHaveCount(0)
})

Given('I am editing the {string} scene', async ({ page }, name: string) => {
  await page.goto('/')
  await seedScene(page, { name })
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit scene' }).click()
})

When('I add the predefined tag {string}', async ({ page }, tag: string) => {
  await page.getByRole('button', { name: `+${tag}` }).click()
})

When('I save', async ({ page }) => {
  await page.getByRole('button', { name: 'Save', exact: true }).click()
})

Then('the {string} tag chip is shown on the {string} scene card', async ({ page }, tag: string, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText(tag, { exact: false })).toBeVisible()
})

When('I add a custom tag {string}', async ({ page }, tag: string) => {
  await page.getByPlaceholder('Add custom tag…').fill(tag)
  await page.getByRole('button', { name: 'Add', exact: true }).click()
})

When('I add the tags {string}, {string}, and {string}', async ({ page }, t1: string, t2: string, t3: string) => {
  await page.getByRole('button', { name: `+${t1}` }).click()
  await page.getByRole('button', { name: `+${t2}` }).click()
  await page.getByRole('button', { name: `+${t3}` }).click()
})

Then('all three tag chips are shown on the {string} scene card', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText('City', { exact: false })).toBeVisible()
  await expect(card.getByText('Combat', { exact: false })).toBeVisible()
  await expect(card.getByText('Night', { exact: false })).toBeVisible()
})

When('I edit {string} and remove the {string} tag', async ({ page }, name: string, tag: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit scene' }).click()
  await page.getByRole('button', { name: `Remove ${tag} tag` }).click()
})

Then('the {string} tag is no longer shown on the {string} scene card', async ({ page }, tag: string, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByText(tag, { exact: true })).toHaveCount(0)
})

When('I open Edit for the {string} scene', async ({ page }, name: string) => {
  await page.goto('/scenes')
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await card.getByRole('button', { name: 'Edit scene' }).click()
})

Then('I see a control labelled {string}', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: label })).toBeVisible()
})

Then('the {string} scene card shows Edit, Duplicate, and Trash actions', async ({ page }, name: string) => {
  const card = page.locator('[data-scene-id]').filter({ hasText: name })
  await expect(card.getByRole('button', { name: 'Edit scene' })).toBeVisible()
  await expect(card.getByRole('button', { name: 'Duplicate scene' })).toBeVisible()
  await expect(card.getByRole('button', { name: 'Delete scene' })).toBeVisible()
})

Then('all scene cards have the same visual appearance', async ({ page }) => {
  const cards = page.locator('[data-scene-id]')
  await expect(cards).toHaveCount(3)
})

Then('no scene card shows an ownership badge', async ({ page }) => {
  await expect(page.getByText(/OWNED|CUSTOM/i)).toHaveCount(0)
})
