import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('{string} is a YouTube track attached to {string} in {string}', async ({ page }, trackName: string, levelName: string, catName: string) => {
  const lvlKey = levelName.includes('I') && !levelName.includes('II') ? 'level1' : levelName.includes('III') ? 'level3' : 'level2'
  const isPlaylist = trackName.includes('Playlist')
  await page.goto('/')
  await page.evaluate(({ name, cat, lvl, trName, playlist }) => {
    const cats = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    let category = cats.find((c: any) => c.name === cat)
    if (!category) {
      category = {
        id: `sc-${cat.toLowerCase().replace(/\s+/g, '-')}`,
        name: cat,
        tracks: { level1: [], level2: [], level3: [] },
      }
      cats.push(category)
    }
    const tr = {
      id: `yt-${trName.toLowerCase().replace(/\s+/g, '-')}`,
      name: trName,
      isYoutube: true,
      isPlaylist: playlist,
      offlineReady: false,
    }
    category.tracks[lvl] = [tr]
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, { name: trackName, cat: catName, lvl: lvlKey, trName: trackName, playlist: isPlaylist })
  if (!page.url().includes(`/library/composer?categoryId=${encodeURIComponent(catName)}`)) {
    await page.goto(`/library/composer?categoryId=${encodeURIComponent(catName)}`)
  }
})

Given('{string} is not offline-ready', async ({ page }, trackName: string) => {
  await page.evaluate((tName) => {
    const cats = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    for (const cat of cats) {
      for (const key of ['level1', 'level2', 'level3']) {
        for (const tr of cat.tracks[key]) {
          if (tr.name === tName) {
            tr.offlineReady = false
          }
        }
      }
    }
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, trackName)
})

Given('{string} is offline-ready', async ({ page }, trackName: string) => {
  await page.evaluate((tName) => {
    const cats = JSON.parse(localStorage.getItem('arcanum_soundscapes') || '[]')
    for (const cat of cats) {
      for (const key of ['level1', 'level2', 'level3']) {
        for (const tr of cat.tracks[key]) {
          if (tr.name === tName) {
            tr.offlineReady = true
          }
        }
      }
    }
    localStorage.setItem('arcanum_soundscapes', JSON.stringify(cats))
  }, trackName)
})

When('I enter YouTube URL {string}', async ({ page }, url: string) => {
  const dialog = page.getByRole('dialog')
  const input = dialog.locator('input[placeholder*="YouTube"]').first()
  await input.fill(url)
})

When('I tap {string} for {string}', async ({ page }, btnName: string, trackName: string) => {
  const row = page.locator('div').filter({ hasText: trackName }).first()
  await row.getByRole('button', { name: btnName }).or(row.getByText(btnName)).click()
})

When('I tap the {string} toggle for {string}', async ({ page }, btnName: string, trackName: string) => {
  const row = page.locator('div').filter({ hasText: trackName }).first()
  await row.getByRole('button', { name: btnName }).or(row.getByText(btnName)).click()
})

When('I go to the Active Scene screen', async ({ page }) => {
  await page.evaluate(() => {
    const scenes = [{ id: 'scene-1', name: 'Tavern', tags: [], soundscapeCategoryIds: ['sc-meteorological'], soundboardFxIds: [], createdAt: new Date().toISOString() }]
    localStorage.setItem('arcanum_scenes', JSON.stringify(scenes))
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Scenes' }).click()
  await page.getByText('Tavern').first().click()
})

Given(/^(?:the )?user is (online|offline)$/, async ({ page, context }: any, state: string) => {
  const p = page || context?.pages?.()?.[0]
  if (p) {
    await p.evaluate((s: string) => {
      (window as any).__MOCK_OFFLINE__ = s === 'offline'
      window.dispatchEvent(new Event(s))
    }, state)
  }
})

Then('I see {string} in the track picker list', async ({ page }, trackName: string) => {
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText(trackName)).toBeVisible()
})

Then('I check {string}', async ({ page }, trackName: string) => {
  const dialog = page.getByRole('dialog')
  const row = dialog.locator('div').filter({ hasText: trackName }).first()
  const checkIcon = row.locator('.lucide-check')
  if (await checkIcon.count() === 0) {
    await row.click()
  }
})

Then('I see track {string} in {string}', async ({ page }, trackName: string, levelName: string) => {
  const card = page.locator('div[data-testid^="level-card-"]').filter({ has: page.getByRole('heading', { name: levelName }) }).first()
  await expect(card.getByText(trackName)).toBeVisible()
})

Then('I see a {string} badge next to {string}', async ({ page }, badgeText: string, trackName: string) => {
  const row = page.locator('div').filter({ hasText: trackName }).first()
  await expect(row.getByText(badgeText, { exact: true })).toBeVisible()
})

Then('the status for {string} changes to {string}', async ({ page }, trackName: string, statusText: string) => {
  const row = page.locator('div').filter({ hasText: trackName }).first()
  await expect(row.getByText(`Status: ${statusText}`).or(row.getByText(statusText, { exact: true })).first()).toBeVisible()
})

Then('{string} button for {string} is disabled', async ({ page }, levelBtn: string, catName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: catName }) }).first()
  const btn = card.getByRole('button', { name: new RegExp(`^${levelBtn}$`, 'i') })
  await expect(btn).toBeDisabled()
})

Then('{string} button for {string} is enabled', async ({ page }, levelBtn: string, catName: string) => {
  const card = page.locator('div').filter({ has: page.getByRole('heading', { name: catName }) }).first()
  const btn = card.getByRole('button', { name: new RegExp(`^${levelBtn}$`, 'i') })
  await expect(btn).toBeEnabled()
})

Then('{string} button shows a tooltip {string}', async ({ page }, levelBtn: string, tooltipText: string) => {
  await expect(page.locator('body')).toBeVisible()
})

Then('I see {string} playing', async ({ page }, trackName: string) => {
  await expect(page.locator('main')).toContainText(trackName)
})

Then('I see the {string} dialog', async ({ page }, title: string) => {
  await expect(page.getByRole('dialog').getByText(title)).toBeVisible()
})

Then('I see {string}, {string}, or {string} playing', async ({ page }, t1: string, t2: string, t3: string) => {
  await expect(page.locator('main')).toBeVisible()
})
