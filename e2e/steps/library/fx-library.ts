import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  addSceneEffectSeed,
  clearSeedData,
  createFxTrackSeed,
  getFxTrackIdByName,
  getSceneIdByName,
  setE2EFlags,
} from '../../support/fixtures/seed-data'

const { Given, When, Then } = createBdd()

async function openFxLibrary(page: Page): Promise<void> {
  await page.goto('/library')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Sound Effects' }).click()
}

function fxCard(page: Page, name: string): Locator {
  return page.locator('[data-testid="fx-track-card"]', {
    has: page.locator(`[data-effect-name="${name}"]`),
  })
}

Given('I am on the Sound Effects tab in the Library', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await openFxLibrary(page)
})

Given(/^I have imported "([^"]+)", "([^"]+)", and "([^"]+)"$/, async ({ page }, a: string, b: string, c: string) => {
  await page.goto('/')
  await clearSeedData(page)
  for (const name of [a, b, c]) {
    await createFxTrackSeed(page, { name })
  }
})

Given(/^"([^"]+)" is in the FX library with duration 0:04 and base intensity II$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createFxTrackSeed(page, { name, duration: '0:04', baseIntensity: 2 })
})

Given(/^"([^"]+)" is in the FX library with tags "([^"]+)" and "([^"]+)"$/, async ({ page }, name: string, t1: string, t2: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createFxTrackSeed(page, { name, tags: [t1, t2] })
})

Given('the FX library data has not yet resolved', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
  await setE2EFlags(page, { fxLoading: true })
})

Given('I have not imported any FX tracks', async ({ page }) => {
  await page.goto('/')
  await clearSeedData(page)
})

Given(/^"([^"]+)" is in the FX library$/, async ({ page }, name: string) => {
  await page.goto('/')
  await clearSeedData(page)
  await createFxTrackSeed(page, { name })
})

Given(/^I am editing "([^"]+)" inline on its FX card$/, async ({ page }, name: string) => {
  await openFxLibrary(page)
  await fxCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
})

Given(/^"([^"]+)" is assigned to the "([^"]+)" scene's soundboard$/, async ({ page }, fxName: string, sceneName: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  const trackId = await getFxTrackIdByName(page, fxName)
  await addSceneEffectSeed(page, sceneId, fxName, trackId)
})

Given(/^an audio file "([^"]+)" is available on my computer$/, async () => {})

Given(/^a file "([^"]+)" with invalid audio content is on my computer$/, async () => {})

Given(/^I imported "([^"]+)" and it appears as "([^"]+)" in the library$/, async ({ page }, _file: string, name: string) => {
  await createFxTrackSeed(page, { name, fileName: _file })
})

When('I open the Sound Effects tab in the Library', async ({ page }) => {
  await openFxLibrary(page)
})

When(/^I edit "([^"]+)" from its card$/, async ({ page }, name: string) => {
  await fxCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
})

When(/^I rename "wolf_howl\.mp3" to "([^"]+)" and save inline edit$/, async ({ page }, name: string) => {
  await page.getByLabel('Name').fill(name)
  await page.getByRole('button', { name: 'Save' }).click()
})

When(/^I add the tag "([^"]+)" to "([^"]+)" from the predefined list and save$/, async ({ page }, tag: string) => {
  await page.getByRole('button', { name: tag, exact: true }).click()
  await page.getByRole('button', { name: 'Save' }).click()
})

When(/^I delete "([^"]+)" from inline edit$/, async ({ page }) => {
  await page.getByRole('button', { name: 'Delete' }).click()
})

When(/^I delete "([^"]+)" from the FX library$/, async ({ page }, name: string) => {
  await openFxLibrary(page)
  await fxCard(page, name).getByRole('button', { name: `Edit ${name}` }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
})

When(/^I import "([^"]+)" via Import FX$/, async ({ page }, fileName: string) => {
  await page.getByTestId('fx-import-input').setInputFiles({
    name: fileName,
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('fake-audio'),
  })
})

When('I open the FX import file picker', async ({ page }) => {
  await expect(page.getByTestId('fx-import-input')).toHaveAttribute('accept', 'audio/*')
})

When(/^I attempt to import "([^"]+)"$/, async ({ page }) => {
  await page.getByTestId('fx-import-input').setInputFiles({
    name: 'fake.mp3',
    mimeType: 'application/pdf',
    buffer: Buffer.from('not-audio'),
  })
})

When(/^the original "([^"]+)" file is deleted from my computer$/, async () => {})

When(/^I tap the "([^"]+)" card thumbnail$/, async ({ page }, name: string) => {
  await fxCard(page, name).getByTestId('fx-track-thumbnail').click()
})

When('I tap the pause button in the mini player', async ({ page }) => {
  await page.getByRole('button', { name: 'Pause preview' }).click()
})

When('I tap the play button in the mini player', async ({ page }) => {
  await page.getByRole('button', { name: 'Play preview' }).click()
})

When(/^I tap the "([^"]+)" card body again$/, async ({ page }, name: string) => {
  await fxCard(page, name).getByTestId('fx-track-body').click()
})

When('I navigate to Scenes', async ({ page }) => {
  await page.getByRole('link', { name: 'Scenes', exact: true }).click()
})

When(/^I preview "([^"]+)" from its card while "([^"]+)" is playing$/, async ({ page }, next: string) => {
  await fxCard(page, next).getByTestId('fx-track-body').click()
})

When('I switch to the Soundscapes tab in the Library', async ({ page }) => {
  await page.getByRole('tab', { name: 'Soundscapes' }).click()
})

Given('the mini player is showing and "Thunder Crack" is playing', async ({ page }) => {
  await createFxTrackSeed(page, { name: 'Thunder Crack' })
  await openFxLibrary(page)
  await fxCard(page, 'Thunder Crack').getByTestId('fx-track-body').click()
})

Given('the mini player is showing and "Thunder Crack" is paused', async ({ page }) => {
  await createFxTrackSeed(page, { name: 'Thunder Crack' })
  await openFxLibrary(page)
  await fxCard(page, 'Thunder Crack').getByTestId('fx-track-body').click()
  await page.getByRole('button', { name: 'Pause preview' }).click()
})

Given(/^the "([^"]+)" card is previewing with a playing preview state$/, async ({ page }, name: string) => {
  await fxCard(page, name).getByTestId('fx-track-body').click()
})

Given('the mini player is visible while previewing "Thunder Crack"', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

Given('the mini player is visible while previewing an FX track', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

Given('the mini player is showing "Thunder Crack"', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toContainText('Thunder Crack')
})

Then(/^I see all three tracks as cards in the grid$/, async ({ page }) => {
  await expect(page.getByTestId('fx-track-card')).toHaveCount(3)
})

Then(/^the "([^"]+)" card shows the title "([^"]+)"$/, async ({ page }, _card: string, title: string) => {
  await expect(fxCard(page, title).getByRole('heading', { level: 3, name: title })).toBeVisible()
})

Then(/^the card shows duration "([^"]+)" and base intensity "([^"]+)"$/, async ({ page }, duration: string, intensity: string) => {
  await expect(page.getByText(`${duration} · ${intensity}`)).toBeVisible()
})

Then(/^the "([^"]+)" card shows "([^"]+)" and "([^"]+)" tag chips$/, async ({ page }, name: string, t1: string, t2: string) => {
  const card = fxCard(page, name)
  await expect(card.getByText(t1)).toBeVisible()
  await expect(card.getByText(t2)).toBeVisible()
})

Then(/^I see copy directing me to import or download FX tracks$/, async ({ page }) => {
  await expect(page.getByTestId('fx-empty-state')).toBeVisible()
})

Then(/^the "([^"]+)" card has no checkbox$/, async ({ page }, name: string) => {
  await expect(fxCard(page, name).getByRole('checkbox')).toHaveCount(0)
})

Then(/^I see inline edit on the "([^"]+)" card with fields for Name and Tags$/, async ({ page }) => {
  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByLabel('Tags')).toBeVisible()
})

Then(/^the track appears as "([^"]+)" in the FX library card grid$/, async ({ page }, name: string) => {
  await expect(fxCard(page, name)).toBeVisible()
})

Then(/^"([^"]+)" shows the "([^"]+)" tag chip on its card$/, async ({ page }, name: string, tag: string) => {
  await expect(fxCard(page, name).getByText(tag)).toBeVisible()
})

Then(/^"([^"]+)" is moved to the Trash FX tab$/, async ({ page }, name: string) => {
  await page.goto('/trash')
  await expect(page.getByTestId('trash-fx-tab')).toContainText(name)
})

Then(/^it is no longer visible in the FX library$/, async ({ page }, name: string) => {
  await openFxLibrary(page)
  await expect(fxCard(page, name)).toHaveCount(0)
})

Then(/^"([^"]+)" no longer appears in the "([^"]+)" soundboard$/, async ({ page }, fxName: string, sceneName: string) => {
  const sceneId = await getSceneIdByName(page, sceneName)
  await page.goto(`/scenes/${sceneId}`)
  await page.getByTestId('soundboard-tab').click()
  await expect(page.locator(`[data-effect-name="${fxName}"]`)).toHaveCount(0)
})

Then(/^"([^"]+)" appears in the FX library card grid$/, async ({ page }, name: string) => {
  await expect(fxCard(page, name)).toBeVisible()
})

Then('I see download progress for the demo FX pack', async ({ page }) => {
  await expect(page.getByTestId('fx-download-progress')).toBeVisible()
})

Then('new FX tracks appear in the card grid when the download completes', async ({ page }) => {
  await expect(page.getByTestId('fx-tracks-grid').locator('[data-testid="fx-track-card"]')).not.toHaveCount(0)
})

Then('I see the storefront', async ({ page }) => {
  await expect(page.getByTestId('storefront')).toBeVisible()
})

Then('non-audio files such as images, PDFs, and spreadsheets are not shown', async ({ page }) => {
  await expect(page.getByTestId('fx-import-input')).toHaveAttribute('accept', 'audio/*')
})

Then(/^I see an error explaining the file could not be read as audio$/, async ({ page }) => {
  await expect(page.getByText(/could not be read as audio/i)).toBeVisible()
})

Then('I can dismiss the error and continue using the Library', async ({ page }) => {
  await page.getByRole('button', { name: 'Dismiss' }).click()
})

Then(/^"([^"]+)" still plays correctly from the app's local copy$/, async ({ page }, name: string) => {
  await fxCard(page, name).getByTestId('fx-track-body').click()
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(true)
})

Then('the mini player appears at the bottom of the main content area', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

Then(/^"([^"]+)" begins playing$/, async ({ page }, name: string) => {
  await expect.poll(async () => {
    const effectPlaying = await page.evaluate(
      (effectName) => window.__arcanumIsEffectPlaying?.(effectName) ?? false,
      name,
    )
    if (effectPlaying) return true

    const loopTrackPlaying = await page.evaluate((trackName) => {
      const snapshot = window.__arcanumAudioEngine?.getSnapshot()
      return snapshot?.loops.some((loop) => loop.status === 'playing' && loop.trackName === trackName) ?? false
    }, name)
    if (loopTrackPlaying) return true

    return page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  }).toBe(true)
})

Then(/^the "([^"]+)" card shows a playing preview state$/, async ({ page }, name: string) => {
  await expect(fxCard(page, name)).toContainText('● PLAYING')
})

Then(/^the mini player displays "([^"]+)" as the track name$/, async ({ page }, name: string) => {
  await expect(page.getByTestId('fx-mini-player')).toContainText(name)
})

Then(/^"([^"]+)" stops playing$/, async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(false)
})

Then('the mini player remains visible', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toBeVisible()
})

Then(/^"([^"]+)" begins playing again$/, async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(true)
})

Then('the mini player is no longer visible', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toHaveCount(0)
})

Then(/^"([^"]+)" has stopped playing$/, async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(false)
})

Then(/^"([^"]+)" stops$/, async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(false)
})

Then('the mini player updates to show "Wolf Howl"', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toContainText('Wolf Howl')
})

Then('the mini player disappears', async ({ page }) => {
  await expect(page.getByTestId('fx-mini-player')).toHaveCount(0)
})

Then('audio playback stops', async ({ page }) => {
  const playing = await page.evaluate(() => window.__arcanumIsPlaying?.() ?? false)
  expect(playing).toBe(false)
})
