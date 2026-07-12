import { createBdd } from 'playwright-bdd'
import { getCampaignSessionsPath } from '../../../src/lib/storage/db'
import {
  getCampaignIdByName,
  getSessionIdByLabel,
} from '../../support/fixtures/seed-data'

const { When } = createBdd()

async function openSessionScenes(
  page: import('@playwright/test').Page,
  campaignId: string,
  sessionId: string,
): Promise<void> {
  await page.goto(`/campaigns/${campaignId}/sessions/${sessionId}/scenes`)
  await page.waitForLoadState('networkidle')
}

When(/^I open "([^"]+)"$/, async ({ page }, name: string) => {
  const sessionMatch = name.match(/^Session (\d+)/)
  if (sessionMatch) {
    const sessionLabel = `Session ${sessionMatch[1]}`
    const campaignId = await getCampaignIdByName(page, 'Curse of Strahd')
    const sessionId = await getSessionIdByLabel(page, campaignId, sessionLabel)
    await openSessionScenes(page, campaignId, sessionId)
    return
  }

  const campaignId = await getCampaignIdByName(page, name)
  await page.goto(getCampaignSessionsPath(campaignId))
  await page.waitForLoadState('networkidle')
})
