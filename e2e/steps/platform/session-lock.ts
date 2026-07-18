import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { buildScene, ensureDefaultSession, mergeE2EData } from '../shared/test-data'

const { Given, When, Then } = createBdd()

async function ensureSoundboardTab(page: Page) {
  const tab = page.locator('[data-active-scene-tab="Soundboard"]')
  if (await tab.count() > 0) {
    const isSelected = await tab.evaluate((el) => el.getAttribute('aria-selected') === 'true')
    if (!isSelected) {
      await tab.click()
    }
  }
}

Given('I have a scene {string}', async ({ page }, name: string) => {
  await mergeE2EData(page, { scenes: [buildScene(name)] })
})

When('I tap the "Lock" icon', async ({ page }) => {
  await page.locator('[data-session-lock]').click()
})

When('I tap the "Lock" icon to unlock', async ({ page }) => {
  await page.locator('[data-session-lock]').click()
})


Then('the session is unlocked', async ({ page }) => {
  await expect(page.locator('[data-session-lock]')).toHaveAttribute('aria-pressed', 'false')
})

Then('dragging category cards by their handle to reorder is disabled', async ({ page }) => {
  const handles = page.locator('[data-soundscape-category] [data-drag-handle]')
  const count = await handles.count()
  for (let i = 0; i < count; i++) {
    await expect(handles.nth(i)).toHaveAttribute('draggable', 'false')
  }
})

Then('dragging category cards by their handle to reorder is enabled', async ({ page }) => {
  const handles = page.locator('[data-soundscape-category] [data-drag-handle]')
  const count = await handles.count()
  for (let i = 0; i < count; i++) {
    await expect(handles.nth(i)).toHaveAttribute('draggable', 'true')
  }
})

Then('the delete button on a soundscape category tile is disabled', async ({ page }) => {
  const deleteButtons = page.locator('[data-soundscape-delete]')
  const count = await deleteButtons.count()
  for (let i = 0; i < count; i++) {
    await expect(deleteButtons.nth(i)).toBeDisabled()
  }
})

Then('the delete button on a soundscape category tile is enabled', async ({ page }) => {
  const deleteButtons = page.locator('[data-soundscape-delete]')
  const count = await deleteButtons.count()
  for (let i = 0; i < count; i++) {
    await expect(deleteButtons.nth(i)).toBeEnabled()
  }
})


Then('the "Add Soundscape" button is visible and enabled', async ({ page }) => {
  const btn = page.locator('[data-soundscape-add]')
  await expect(btn).toBeVisible()
  await expect(btn).toBeEnabled()
})

Then('dragging soundboard effects to reorder is disabled', async ({ page }) => {
  await ensureSoundboardTab(page)
  const handles = page.locator('[data-soundboard-tile] [data-drag-handle]')
  const count = await handles.count()
  for (let i = 0; i < count; i++) {
    await expect(handles.nth(i)).toHaveAttribute('draggable', 'false')
  }
})

Then('the delete button on a soundboard effect tile is disabled', async ({ page }) => {
  await ensureSoundboardTab(page)
  const deleteButtons = page.locator('[data-soundboard-delete]')
  const count = await deleteButtons.count()
  for (let i = 0; i < count; i++) {
    await expect(deleteButtons.nth(i)).toBeDisabled()
  }
})

Then('the delete button on a soundboard effect tile is enabled', async ({ page }) => {
  await ensureSoundboardTab(page)
  const deleteButtons = page.locator('[data-soundboard-delete]')
  const count = await deleteButtons.count()
  for (let i = 0; i < count; i++) {
    await expect(deleteButtons.nth(i)).toBeEnabled()
  }
})


Then('the "Add Sound" button is visible and enabled', async ({ page }) => {
  await ensureSoundboardTab(page)
  const btn = page.locator('[data-soundboard-add="true"]')
  await expect(btn).toBeVisible()
  await expect(btn).toBeEnabled()
})

When('I attempt to navigate to a different scene', async ({ page }) => {
  await page.locator('[data-sidebar-item="Scenes"]').click({ noWaitAfter: true })
})

Then('navigation to a different scene is blocked', async ({ page }) => {
  const url = page.url()
  expect(url).toContain('/active')
})

Then('navigating to a different scene is allowed', async ({ page }) => {
  await page.locator('[data-sidebar-item="Scenes"]').click()
  await page.waitForLoadState('networkidle')
  const url = page.url()
  expect(url).not.toContain('/active')
  expect(url).toContain('/scenes')
})

Then('I can tap the play\\/pause and d20 buttons', async ({ page }) => {
  const playBtn = page.locator('[data-soundscape-play]').first()
  if (await playBtn.count() > 0) {
    await expect(playBtn).toBeEnabled()
  }
  const d20Btn = page.locator('[data-soundscape-d20]').first()
  if (await d20Btn.count() > 0) {
    await expect(d20Btn).toBeEnabled()
  }
})

Then('I can tap "Stop All"', async ({ page }) => {
  await page.locator('[data-active-scene-tab="Soundboard"]').click()
  await expect(page.locator('[data-stop-all]')).toBeEnabled()
})

Then('I can still trigger soundboard effects', async ({ page }) => {
  await page.locator('[data-active-scene-tab="Soundboard"]').click()
  const playBtn = page.locator('[data-soundboard-tile] button').first()
  if (await playBtn.count() > 0) {
    await expect(playBtn).toBeEnabled()
  }
})

Then('I can drag the Master Volume slider', async ({ page }) => {
  await expect(page.locator('[data-soundscape-master-slider]')).toBeEnabled()
})

Then('I can drag the Volume sliders', async ({ page }) => {
  const sliders = page.locator('[data-soundscape-category] input[type="range"]')
  const count = await sliders.count()
  for (let i = 0; i < count; i++) {
    await expect(sliders.nth(i)).toBeEnabled()
  }
})

Then('I can drag the Soundboard Master slider', async ({ page }) => {
  const tab = page.locator('[data-active-scene-tab="Soundboard"]')
  if (await tab.count() > 0) {
    await tab.click()
  }
  await expect(page.locator('[data-soundboard-master-slider]')).toBeEnabled()
})

Then('I can switch between the "Soundscapes" and "Soundboard" tabs', async ({ page }) => {
  await page.locator('[data-active-scene-tab="Soundboard"]').click()
  await page.locator('[data-active-scene-tab="Soundscapes"]').click()
})

When('I reload the Active Scene screen', async ({ page }) => {
  await page.reload()
  await page.waitForLoadState('networkidle')
})

Given('I am on the Session Scenes list for {string}', async ({ page }) => {
  const { campaign, session } = await ensureDefaultSession(page)
  await page.goto(`/campaigns/${campaign.id}/sessions/${session.id}/scenes`)
  await page.waitForLoadState('networkidle')
})

Then('I do not see a Session Lock control', async ({ page }) => {
  await expect(page.locator('[data-session-lock]')).toHaveCount(0)
})

Then('I can open a different scene from the list', async ({ page }) => {
  const sceneBody = page.locator('[data-session-scene-body]').first()
  if (await sceneBody.count() > 0) {
    await sceneBody.click()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/active')
  }
})
