import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { When, Then } = createBdd()

When('I open {string}', async ({ page }, targetName: string) => {
  await page.evaluate((name) => {
    const data = (window.__ARCANUM_STORE__ as any) || {}
    const c = data.campaigns?.find((x: any) => x.name === name)
    if (c) {
      window.location.href = `/campaigns/${c.id}/sessions`
      return
    }
    const s = data.sessions?.find(
      (x: any) => `Session ${x.sessionNumber} – ${x.name}` === name || x.name === name || `Session ${x.sessionNumber}` === name,
    )
    if (s) {
      window.location.href = `/campaigns/${s.campaignId}/sessions/${s.id}/scenes`
      return
    }
    const sc = data.scenes?.find((x: any) => x.name === name)
    if (sc) {
      window.location.href = `/scenes/${sc.id}`
      return
    }
  }, targetName)
  await page.waitForURL(/\/(sessions|scenes)/)
})

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 1, name: new RegExp(title, 'i') })).toBeVisible()
})

Then('I see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(new RegExp(subtitle, 'i'))).toBeVisible()
})

Then('I do not see the subtitle {string}', async ({ page }, subtitle: string) => {
  await expect(page.getByText(subtitle)).toHaveCount(0)
})

Then('I see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(new RegExp(text, 'i'))).toBeVisible()
})

Then('I see {string} in {string}', async ({ page }, scName: string, _sNum: string) => {
  await expect(page.getByText(scName)).toBeVisible()
})

Then('I do not see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0)
})

Then('I see a {string} button', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
})

Then('I see an {string} button', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
})

Then('no audio playback has started', async ({ page }) => {
  const isPlaying = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__?.isPlaying ?? false)
  expect(isPlaying).toBe(false)
})

Then('no audio is playing', async ({ page }) => {
  const isPlaying = await page.evaluate(() => window.__ARCANUM_AUDIO_STATE__?.isPlaying ?? false)
  expect(isPlaying).toBe(false)
})

Then('the {string} button is enabled', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeEnabled()
})

Then('the {string} button is disabled', async ({ page }, label: string) => {
  await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeDisabled()
})

When('I tap {string}', async ({ page }, label: string) => {
  await page.getByRole('button', { name: new RegExp(label, 'i') }).click()
})
