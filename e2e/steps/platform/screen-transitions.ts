import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { buildFxTrack, mergeFxTrack, openActiveScene, openLibraryFxTab } from '../shared/test-data'

const { Given, When, Then } = createBdd()

Given('I am on the Active Scene screen for {string}', async ({ page }, sceneName: string) => {
  await openActiveScene(page, sceneName, 'Soundscapes')
})

Given('no mini player is visible', async ({ page }) => {
  await expect(page.locator('[data-mini-player]')).toHaveCount(0)
})

When('I tap preview on an FX track', async ({ page }) => {
  await mergeFxTrack(page, buildFxTrack('Thunder Crack'), { openLibrary: false })
  await openLibraryFxTab(page)
  await page.locator('[data-fx-card-body="Thunder Crack"]').click()
})

When('I tap the close button', async ({ page }) => {
  await page.locator('[data-mini-player-close]').click()
})

When('I navigate away from the current screen', async ({ page }) => {
  const pathname = new URL(page.url()).pathname
  const target = pathname === '/scenes' ? 'Library' : 'Scenes'
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await navigation.getByRole('link', { name: target, exact: true }).click()
})

Then('the Home screen content is no longer visible', async ({ page }) => {
  await expect(page.locator('[data-screen="Home screen"]')).toHaveCount(0)
})

Then('I see the Add Soundscape modal', async ({ page }) => {
  await expect(page.locator('[data-soundscape-picker-modal]')).toBeVisible()
})

Then('I can interact with the Scenes screen immediately after the transition completes', async ({ page }) => {
  const search = page.locator('[data-scenes-search]')
  await expect(search).toBeVisible()
  await search.fill('t')
  await expect(search).toHaveValue('t')
})

Then('the transition completes without blocking interaction', async ({ page }) => {
  const soundscapeSearch = page.locator('[data-sc-picker-search]')
  if (await soundscapeSearch.count()) {
    await soundscapeSearch.fill('fo')
    await expect(soundscapeSearch).toHaveValue('fo')
    return
  }

  const miniPlayerPause = page.locator('[data-mini-player-pause]')
  if (await miniPlayerPause.count()) {
    await miniPlayerPause.click()
    return
  }

  await page.locator('main').click({ trial: true })
})

