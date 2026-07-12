import type { Locator, Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When } = createBdd()

async function swipeRight(locator: Locator): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Unable to swipe: element has no bounding box')
  const startX = box.x + 20
  const endX = box.x + box.width - 20
  const y = box.y + box.height / 2
  await locator.dispatchEvent('pointerdown', {
    clientX: startX,
    clientY: y,
    pointerId: 1,
    pointerType: 'touch',
  })
  await locator.dispatchEvent('pointerup', {
    clientX: endX,
    clientY: y,
    pointerId: 1,
    pointerType: 'touch',
  })
}

function cardByName(page: Page, name: string): Locator {
  const candidates = [
    page.locator('[data-testid="session-card"]', {
      has: page.locator(`[data-session-label="${name}"]`),
    }),
    page.locator('[data-testid="campaign-card"]', { has: page.getByRole('heading', { name, level: 2 }) }),
    page.locator('[data-testid="scene-card"]', { has: page.getByRole('heading', { name, level: 2 }) }),
    page.locator('[data-testid="soundscape-category-card"]', {
      has: page.getByRole('heading', { name, level: 3 }),
    }),
    page.locator('[data-testid="session-scene-card"]', {
      has: page.getByRole('heading', { name, level: 2 }),
    }),
  ]

  return page.locator('body').filter({ has: page.getByText(name, { exact: true }) }).locator(
    '[data-testid*="card"]',
  ).filter({ hasText: name }).first().or(candidates[0]).or(candidates[1]).or(candidates[2]).or(candidates[3]).or(candidates[4])
}

When(/^I swipe right on the "([^"]+)" card$/, async ({ page }, name: string) => {
  const sessionCard = page.locator('[data-testid="session-card"]', {
    has: page.locator(`[data-session-label="${name}"]`),
  })
  if (await sessionCard.count()) {
    await swipeRight(sessionCard.first())
    return
  }

  const campaignCard = page.locator('[data-testid="campaign-card"]', {
    has: page.getByRole('heading', { name, level: 2 }),
  })
  if (await campaignCard.count()) {
    await swipeRight(campaignCard.first())
    return
  }

  const sceneCard = page.locator('[data-testid="scene-card"]', {
    has: page.getByRole('heading', { name, level: 2 }),
  })
  if (await sceneCard.count()) {
    await swipeRight(sceneCard.first())
    return
  }

  const categoryCard = page.locator('[data-testid="soundscape-category-card"]', {
    has: page.getByRole('heading', { name, level: 3 }),
  })
  if (await categoryCard.count()) {
    await swipeRight(categoryCard.first())
    return
  }

  const sessionSceneCard = page.locator('[data-testid="session-scene-card"]', {
    has: page.getByRole('heading', { name, level: 2 }),
  })
  if (await sessionSceneCard.count()) {
    await swipeRight(sessionSceneCard.first())
    return
  }

  throw new Error(`No card found to swipe: ${name}`)
})

export { swipeRight, cardByName }
