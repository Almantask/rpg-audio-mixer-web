import type { Page } from '@playwright/test'

export async function seedData(page: Page, data: unknown) {
  if (page.url() === 'about:blank') {
    await page.goto('/')
  }
  await page.evaluate((d) => {
    window.__ARCANUM_SEED_DATA__?.(d)
  }, data)
}

export async function resetData(page: Page) {
  if (page.url() === 'about:blank') {
    await page.goto('/')
  }
  await page.evaluate(() => {
    window.__ARCANUM_RESET_DATA__?.()
  })
}
