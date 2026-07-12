import { expect, type Page } from '@playwright/test'

const SCREEN_ASSERTIONS: Record<string, RegExp | string> = {
  'Home screen with the active campaign hero': /Active Campaigns|Create your first campaign/i,
  'Active Campaigns screen': 'Active Campaigns',
  'Scenes screen': 'Scenes',
  'Library screen': 'Library',
  '"Trash" screen title': 'Trash',
  '"Credits" screen title': 'Credits',
}

export async function assertScreenVisible(page: Page, screenDescription: string): Promise<void> {
  const assertion = SCREEN_ASSERTIONS[screenDescription]
  if (!assertion) {
    throw new Error(`Unknown screen description: ${screenDescription}`)
  }

  if (assertion instanceof RegExp) {
    await expect(page.getByText(assertion)).toBeVisible()
    return
  }

  if (screenDescription === 'Home screen with the active campaign hero') {
    await expect(page.getByTestId('home-campaign-hero')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Active Campaigns', level: 2 })).toBeVisible()
    return
  }

  await expect(page.getByRole('heading', { level: 1, name: assertion })).toBeVisible()
}
