import { expect, type Page } from '@playwright/test'

export async function assertSidebarItemHighlighted(page: Page, item: string): Promise<void> {
  const link = page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: item, exact: true })

  await expect(link).toHaveAttribute('data-sidebar-active', 'true')
  await expect(link).toHaveAttribute('aria-current', 'page')
}

export async function assertSidebarItemNotHighlighted(page: Page, item: string): Promise<void> {
  const link = page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: item, exact: true })

  await expect(link).toHaveAttribute('data-sidebar-active', 'false')
}

export async function assertOtherSidebarItemsInactive(
  page: Page,
  activeItem: string,
): Promise<void> {
  const items = ['Home', 'Campaign', 'Scenes', 'Library', 'Credits', 'Trash']
  for (const item of items) {
    if (item === activeItem) continue
    await assertSidebarItemNotHighlighted(page, item)
  }
}

export async function assertNoSettingsGearIcon(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /settings/i })).toHaveCount(0)
  await expect(page.locator('[aria-label*="settings" i]')).toHaveCount(0)
  await expect(page.locator('[data-lucide="settings"], [data-lucide="cog"]')).toHaveCount(0)
}

export async function assertSidebarVisible(page: Page): Promise<void> {
  const sidebar = page.locator('#primary-navigation')
  await expect(sidebar).toBeVisible()
  await expect(sidebar).toHaveAttribute('data-sidebar-open', 'true')
  await expect(
    page.getByRole('navigation', { name: 'Primary navigation' }),
  ).toBeVisible()
}

export async function assertSidebarHidden(page: Page): Promise<void> {
  const sidebar = page.locator('#primary-navigation')
  await expect(sidebar).toHaveAttribute('data-sidebar-open', 'false')
}

export async function assertNoPrimarySidebarDivider(page: Page): Promise<void> {
  const nav = page.getByRole('navigation', { name: 'Primary navigation' })
  await expect(nav.locator('[role="separator"]')).toHaveCount(0)

  const creditsLink = nav.getByRole('link', { name: 'Credits', exact: true })
  const trashLink = nav.getByRole('link', { name: 'Trash', exact: true })
  await expect(creditsLink).toBeVisible()
  await expect(trashLink).toBeVisible()
}
