import type { Page } from '@playwright/test'

export async function clearAllData(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await window.__arcanumClearE2E?.()
    window.__arcanumResetE2E?.()
  })
}

export async function createCampaign(
  page: Page,
  input: {
    name: string
    description?: string
    coverArtUrl?: string
    lastPlayedAt?: number
    sessionCount?: number
  },
): Promise<string> {
  return page.evaluate(async (payload) => {
    return window.__arcanumCreateCampaign?.(payload) ?? ''
  }, input)
}

export async function createSession(
  page: Page,
  input: {
    campaignId: string
    name: string
    number?: number
    date?: string
    description?: string
    coverArtUrl?: string
    sceneCount?: number
    lastOpenedAt?: number
  },
): Promise<string> {
  return page.evaluate(async (payload) => {
    return window.__arcanumCreateSession?.(payload) ?? ''
  }, input)
}

export async function getCampaignIdByName(page: Page, name: string): Promise<string | undefined> {
  return page.evaluate(async (campaignName) => window.__arcanumGetCampaignIdByName?.(campaignName), name)
}

export async function setE2EState(
  page: Page,
  partial: Record<string, boolean>,
): Promise<void> {
  await page.evaluate((state) => {
    window.__arcanumSetE2E?.(state)
  }, partial)
}

export async function openCampaignSessions(page: Page, campaignName: string): Promise<void> {
  const campaignId = await getCampaignIdByName(page, campaignName)
  if (!campaignId) throw new Error(`Campaign not found: ${campaignName}`)
  await page.goto(`/campaigns/${campaignId}/sessions`)
  await page.waitForLoadState('networkidle')
}

export async function swipeRightOnCard(page: Page, cardSelector: string): Promise<void> {
  const card = page.locator(cardSelector).first()
  const box = await card.boundingBox()
  if (!box) throw new Error('Card not found for swipe')
  await card.dispatchEvent('pointerdown', { clientX: box.x + 10, clientY: box.y + box.height / 2 })
  await card.dispatchEvent('pointerup', { clientX: box.x + box.width - 10, clientY: box.y + box.height / 2 })
}
