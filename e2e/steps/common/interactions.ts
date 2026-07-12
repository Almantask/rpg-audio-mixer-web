import type { Page } from '@playwright/test'

export async function seedE2EData(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await window.__arcanumClearE2E?.()
    await window.__arcanumSeedE2E?.()
  })
}

export async function tapSidebarItem(page: Page, item: string): Promise<void> {
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', {
    name: item,
    exact: true,
  }).click()
}

export async function tapHamburgerMenu(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Toggle navigation menu' }).click()
}

export async function setNarrowViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 })
}

export async function openApp(page: Page): Promise<void> {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}
