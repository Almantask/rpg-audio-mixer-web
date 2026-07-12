import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

import {
  buildCampaign,
  buildFxTrack,
  buildScene,
  buildSession,
  buildSessionSceneLink,
  buildSoundscapeCategory,
  buildSoundscapeTracksForCategory,
  campaignIdForName,
  DEFAULT_CAMPAIGN_NAME,
  ensureDefaultSession,
  fxIdForName,
  mergeE2EData,
  openCampaignSessions,
  openLibraryFxTab,
  openScenes,
  parseSceneList,
  setE2EControls,
} from '../shared/test-data'

const { Given, When, Then } = createBdd()

type TrashTabLabel = 'Campaigns' | 'Sessions' | 'Scenes' | 'Soundscapes' | 'FX'

const TRASH_TAB_IDS: Record<TrashTabLabel, string> = {
  Campaigns: 'campaigns',
  Sessions: 'sessions',
  Scenes: 'scenes',
  Soundscapes: 'soundscapes',
  FX: 'fx',
}

const TRASH_SECTION: Record<TrashTabLabel, string> = {
  Campaigns: '[data-trash-campaigns]',
  Sessions: '[data-trash-sessions]',
  Scenes: '[data-trash-scenes]',
  Soundscapes: '[data-trash-soundscapes]',
  FX: '[data-trash-fx]',
}

const TRASHED_ITEM: Record<TrashTabLabel, string> = {
  Campaigns: 'data-trashed-campaign',
  Sessions: 'data-trashed-session',
  Scenes: 'data-trashed-scene',
  Soundscapes: 'data-trashed-soundscape',
  FX: 'data-trashed-fx',
}

const TRASH_EMPTY_LABEL: Record<TrashTabLabel, string> = {
  Campaigns: 'No deleted campaigns',
  Sessions: 'No deleted sessions',
  Scenes: 'No deleted scenes',
  Soundscapes: 'No deleted soundscapes',
  FX: 'No deleted FX',
}

function softDeletedAt(): string {
  return new Date().toISOString()
}

function trashTabSection(page: Page, tab: TrashTabLabel) {
  return page.locator(TRASH_SECTION[tab])
}

async function openTrashTab(page: Page, tab: TrashTabLabel) {
  await page.goto(`/trash?tab=${TRASH_TAB_IDS[tab]}`)
  await page.waitForLoadState('networkidle')
}

async function activateTrashTab(page: Page, tab: TrashTabLabel) {
  if (!page.url().includes('/trash')) {
    await openTrashTab(page, tab)
    return
  }
  await page.locator(`[data-trash-tab="${TRASH_TAB_IDS[tab]}"]`).click()
  await expect(trashTabSection(page, tab)).toBeVisible()
}

function trashedItemLocator(page: Page, tab: TrashTabLabel, name: string) {
  const attr = TRASHED_ITEM[tab]
  const displayName = tab === 'Sessions' && !name.startsWith('Session ') ? `Session ${name}` : name
  return trashTabSection(page, tab).locator(`[${attr}="${displayName}"]`)
}

async function seedTrashedFx(page: Page, names: string[]) {
  const deletedAt = softDeletedAt()
  await mergeE2EData(
    page,
    {
      fxTracks: names.map((name) =>
        buildFxTrack(name, {
          id: `${fxIdForName(name)}-trashed`,
          deletedAt,
        }),
      ),
    },
    { navigateHome: false },
  )
}

async function seedTrashedScenes(page: Page, names: string[]) {
  const deletedAt = softDeletedAt()
  await mergeE2EData(
    page,
    { scenes: names.map((name) => buildScene(name, { deletedAt })) },
    { navigateHome: false },
  )
}

async function seedTrashedSoundscape(page: Page, name: string) {
  const deletedAt = softDeletedAt()
  const category = buildSoundscapeCategory(name, { deletedAt })
  const tracks = buildSoundscapeTracksForCategory(name)
  await mergeE2EData(
    page,
    { soundscapeCategories: [category], soundscapeTracks: tracks },
    { navigateHome: false },
  )
}

async function seedTrashedSession(page: Page, sessionLabel: string) {
  const deletedAt = softDeletedAt()
  const { session: defaultSession } = await ensureDefaultSession(page)
  const match = sessionLabel.match(/^Session\s+(\d+)$/)
  const number = match ? Number.parseInt(match[1], 10) : Number.parseInt(sessionLabel, 10)
  const session = buildSession(defaultSession.campaignId, number, `Night ${number}`, { deletedAt })
  await mergeE2EData(page, { sessions: [session] }, { navigateHome: false })
}

async function seedTrashedCampaign(page: Page, name: string) {
  const deletedAt = softDeletedAt()
  await mergeE2EData(page, { campaigns: [buildCampaign(name, { deletedAt })] }, { navigateHome: false })
}

async function seedTrashedScene(page: Page, name: string) {
  const deletedAt = softDeletedAt()
  if (name === 'Cursed Catacombs') {
    const { session } = await ensureDefaultSession(page)
    const scene = buildScene(name, { deletedAt })
    const link = buildSessionSceneLink(session.id, scene.id)
    await mergeE2EData(page, { scenes: [scene], sessionSceneLinks: [link] }, { navigateHome: false })
    return
  }
  await seedTrashedScenes(page, [name])
}

async function seedTrashedItem(page: Page, name: string, type: string) {
  switch (type) {
    case 'FX':
      await seedTrashedFx(page, [name])
      break
    case 'Scene':
      await seedTrashedScene(page, name)
      break
    case 'Soundscape':
      await seedTrashedSoundscape(page, name)
      break
    case 'Session':
      await seedTrashedSession(page, name)
      break
    case 'Campaign':
      await seedTrashedCampaign(page, name)
      break
    default:
      throw new Error(`Unknown trash entity type: ${type}`)
  }
}

async function selectTrashItems(page: Page, tab: TrashTabLabel, names: string[]) {
  await activateTrashTab(page, tab)
  for (const name of names) {
    const card = trashedItemLocator(page, tab, name)
    await card.locator('[data-trash-checkbox]').click()
  }
}

async function confirmDestructiveAction(page: Page) {
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /confirm|purge|delete|permanently/i }).click()
  await expect(dialog).toHaveCount(0)
}

async function confirmRestoreAction(page: Page) {
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /confirm|restore/i }).click()
  await expect(dialog).toHaveCount(0)
}

async function expectPermanentlyDeletedFx(page: Page, name: string) {
  await openTrashTab(page, 'FX')
  await expect(page.locator(`[data-trashed-fx="${name}"]`)).toHaveCount(0)
  const exists = await page.evaluate((trackName) => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return false
    const data = JSON.parse(raw)
    return (data.fxTracks ?? []).some((track: { name: string }) => track.name === trackName)
  }, name)
  expect(exists).toBe(false)
}

Given('{string} is in Trash', async ({ page }, name: string) => {
  await seedTrashedFx(page, [name])
  await openTrashTab(page, 'FX')
})

Given(/^"(.*)" \((.*)\) is in Trash$/, async ({ page }, name: string, type: string) => {
  await seedTrashedItem(page, name, type)
  const tabByType: Record<string, TrashTabLabel> = {
    FX: 'FX',
    Scene: 'Scenes',
    Soundscape: 'Soundscapes',
    Session: 'Sessions',
    Campaign: 'Campaigns',
  }
  await openTrashTab(page, tabByType[type])
})

async function seedTrashTabItems(page: Page, tab: TrashTabLabel, names: string[]) {
  const deletedAt = softDeletedAt()

  switch (tab) {
    case 'FX':
      await mergeE2EData(
        page,
        {
          fxTracks: names.map((name) =>
            buildFxTrack(name, {
              id: `${fxIdForName(name)}-trashed`,
              deletedAt,
            }),
          ),
        },
        { navigateHome: false },
      )
      break
    case 'Scenes':
      await mergeE2EData(
        page,
        { scenes: names.map((name) => buildScene(name, { deletedAt })) },
        { navigateHome: false },
      )
      break
    case 'Campaigns':
      await mergeE2EData(
        page,
        { campaigns: names.map((name) => buildCampaign(name, { deletedAt })) },
        { navigateHome: false },
      )
      break
    case 'Soundscapes':
      await mergeE2EData(
        page,
        {
          soundscapeCategories: names.map((name) => buildSoundscapeCategory(name, { deletedAt })),
        },
        { navigateHome: false },
      )
      break
    case 'Sessions':
      await ensureDefaultSession(page)
      await mergeE2EData(
        page,
        {
          sessions: names.map((label) => {
            const match = label.match(/^Session\s+(\d+)$/)
            const number = match ? Number.parseInt(match[1], 10) : Number.parseInt(label, 10)
            return buildSession(campaignIdForName(DEFAULT_CAMPAIGN_NAME), number, `Night ${number}`, {
              deletedAt,
            })
          }),
        },
        { navigateHome: false },
      )
      break
    default:
      throw new Error(`Unknown trash tab: ${tab}`)
  }

  await openTrashTab(page, tab)
}

Given(
  'the {string} tab contains {string}, {string}, and {string}',
  async ({ page }, tabLabel: string, first: string, second: string, third: string) => {
    await seedTrashTabItems(page, tabLabel as TrashTabLabel, [first, second, third])
  },
)

Given(
  'the {string} tab contains {string} and {string}',
  async ({ page }, tabLabel: string, first: string, second: string) => {
    await seedTrashTabItems(page, tabLabel as TrashTabLabel, [first, second])
  },
)

Given('the {string} tab contains {string}', async ({ page }, tabLabel: string, name: string) => {
  await seedTrashTabItems(page, tabLabel as TrashTabLabel, [name])
})

Given('the {string} tab contains {int} deleted scenes', async ({ page }, tabLabel: string, count: number) => {
  const tab = tabLabel as TrashTabLabel
  const names = Array.from({ length: count }, (_, index) => `Deleted Scene ${index + 1}`)
  const deletedAt = softDeletedAt()
  await mergeE2EData(
    page,
    { scenes: names.map((name) => buildScene(name, { deletedAt })) },
    { navigateHome: false },
  )
  await openTrashTab(page, tab)
})

Given('I have a campaign {string} in Trash', async ({ page }, name: string) => {
  await seedTrashedCampaign(page, name)
  await openTrashTab(page, 'Campaigns')
})

Given(/^its sessions are orphaned \(hidden from active UI\)$/, async ({ page }) => {
  const campaignId = campaignIdForName('Curse of Strahd')
  const sessions = [1, 2, 3].map((number) =>
    buildSession(campaignId, number, `Night ${number}`),
  )
  await mergeE2EData(page, { sessions }, { navigateHome: false })
})

Given('a live FX track named {string} already exists', async ({ page }, name: string) => {
  await mergeE2EData(page, { fxTracks: [buildFxTrack(name)] }, { navigateHome: false })
})

Given(
  /^I have selected (.*)$/,
  async ({ page }, selectionText: string) => {
    if (selectionText === 'all items on the "FX" tab') {
      await activateTrashTab(page, 'FX')
      await trashTabSection(page, 'FX').locator('[data-trash-select-all]').click()
      return
    }

    const names = parseSceneList(selectionText)
    await selectTrashItems(page, 'FX', names)
  },
)

Given(
  '{string} cannot be purged because its storage record is locked',
  async ({ page }, name: string) => {
    await setE2EControls(page, { purgeBlockedFxIds: [`${fxIdForName(name)}-trashed`] })
  },
)

Given(
  '{string} cannot be restored because its audio blob is missing',
  async ({ page }, name: string) => {
    await setE2EControls(page, { restoreBlockedFxIds: [`${fxIdForName(name)}-trashed`] })
  },
)

When(
  /^I select (.*) on the "(.*)" tab$/,
  async ({ page }, selectionText: string, tabLabel: string) => {
    const tab = tabLabel as TrashTabLabel
    const names = parseSceneList(selectionText)
    await selectTrashItems(page, tab, names)
  },
)

When(
  /^I tap "Select all \((\d+)\)" on the "(.*)" tab$/,
  async ({ page }, _count: string, tabLabel: string) => {
    const tab = tabLabel as TrashTabLabel
    await activateTrashTab(page, tab)
    await trashTabSection(page, tab).locator('[data-trash-select-all]').click()
  },
)

When(
  /^I tap "Purge" on the "(.*)" trashed FX card and confirm the destructive action$/,
  async ({ page }, name: string) => {
    await openTrashTab(page, 'FX')
    const card = trashedItemLocator(page, 'FX', name)
    await card.locator('[data-trash-purge]').click()
    await confirmDestructiveAction(page)
  },
)

When('I tap "Purge Selected" and confirm the destructive action', async ({ page }) => {
  await page.locator('[data-trash-purge-selected]').click()
  await confirmDestructiveAction(page)
})

When('I tap "Empty Trash" and confirm the destructive action', async ({ page }) => {
  await page.locator('[data-trash-empty-trash]').click()
  await confirmDestructiveAction(page)
})

When(/^I open the "(.*)" tab on the Trash screen$/, async ({ page }, tabLabel: string) => {
  await activateTrashTab(page, tabLabel as TrashTabLabel)
})

When(
  /^I tap "Restore" on the "(.*)" trashed item card$/,
  async ({ page }, name: string) => {
    const tabs: TrashTabLabel[] = ['Campaigns', 'Sessions', 'Scenes', 'Soundscapes', 'FX']
    for (const tab of tabs) {
      await openTrashTab(page, tab)
      const card = trashedItemLocator(page, tab, name)
      if ((await card.count()) > 0) {
        await card.locator('[data-trash-restore]').click()
        return
      }
    }
    throw new Error(`Trashed item card not found for: ${name}`)
  },
)

When(/^I tap "Restore" on "(.*)"$/, async ({ page }, name: string) => {
  await openTrashTab(page, 'Campaigns')
  const card = page.locator(`[data-trashed-campaign="${name}"]`)
  await card.locator('[data-trash-restore]').click()
})

When(
  /^I tap "Restore" on the "(.*)" trashed FX card$/,
  async ({ page }, name: string) => {
    await openTrashTab(page, 'FX')
    const card = trashedItemLocator(page, 'FX', name)
    await card.locator('[data-trash-restore]').click()
  },
)

When('I tap "Restore All" and confirm the restore action', async ({ page }) => {
  await page.locator('[data-trash-restore-all]').click()
  await confirmRestoreAction(page)
})

Then(/^I see a selection bar showing "(.*)"$/, async ({ page }, countText: string) => {
  await expect(page.locator('[data-trash-selection-bar]')).toBeVisible()
  await expect(page.locator('[data-trash-selection-count]')).toHaveText(countText)
})

Then('all {int} trashed scene cards are selected', async ({ page }, count: number) => {
  const selected = trashTabSection(page, 'Scenes').locator('[data-trashed-scene][data-trash-selected="true"]')
  await expect(selected).toHaveCount(count)
})

Then(/^the selection bar shows "(.*)"$/, async ({ page }, countText: string) => {
  await expect(page.locator('[data-trash-selection-count]')).toHaveText(countText)
})

Then('{string} is permanently deleted', async ({ page }, name: string) => {
  await expectPermanentlyDeletedFx(page, name)
})

Then('it can no longer be restored', async ({ page }) => {
  await expect(page.locator('[data-trash-fx] [data-trashed-fx]')).toHaveCount(0)
})

Then(
  /^"(.*)" and "(.*)" are permanently deleted$/,
  async ({ page }, first: string, second: string) => {
    await expectPermanentlyDeletedFx(page, first)
    await expectPermanentlyDeletedFx(page, second)
  },
)

Then(
  /^the "(.*)" tab shows the "(.*)" empty state$/,
  async ({ page }, tabLabel: string, emptyLabel: string) => {
    const tab = tabLabel as TrashTabLabel
    await activateTrashTab(page, tab)
    const section = trashTabSection(page, tab)
    await expect(section.locator('[data-trash-empty]')).toBeVisible()
    await expect(section).toContainText(emptyLabel)
    expect(TRASH_EMPTY_LABEL[tab]).toBe(emptyLabel)
  },
)

Then(/^I do not see "(.*)" on the "(.*)" tab$/, async ({ page }, name: string, tabLabel: string) => {
  const tab = tabLabel as TrashTabLabel
  await activateTrashTab(page, tab)
  await expect(trashedItemLocator(page, tab, name)).toHaveCount(0)
})

Then(/^"(.*)" remains on the "(.*)" tab$/, async ({ page }, name: string, tabLabel: string) => {
  const tab = tabLabel as TrashTabLabel
  await activateTrashTab(page, tab)
  await expect(trashedItemLocator(page, tab, name)).toBeVisible()
})

Then(/^I see a summary toast "(.*)"$/, async ({ page }, message: string) => {
  await expect(page.locator('[data-toast-summary]')).toHaveText(message)
})

Then(
  /^"(.*)" remains in Trash and stays selected with error detail$/,
  async ({ page }, name: string) => {
    if (!page.url().includes('/trash')) {
      await openTrashTab(page, 'FX')
    }
    const card = trashedItemLocator(page, 'FX', name)
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute('data-trash-selected', 'true')
    await expect(card.locator('[data-trash-item-error]')).toBeVisible()
  },
)

Then('{string} is removed from Trash', async ({ page }, name: string) => {
  const tabs: TrashTabLabel[] = ['Campaigns', 'Sessions', 'Scenes', 'Soundscapes', 'FX']
  for (const tab of tabs) {
    const card = trashedItemLocator(page, tab, name)
    if ((await card.count()) > 0) {
      await expect(card).toHaveCount(0)
      return
    }
  }
})

Then('it reappears in the Scenes list with all prior session links intact', async ({ page }) => {
  await openScenes(page)
  await expect(page.locator('[data-scene-card="Cursed Catacombs"]')).toBeVisible()
  const linkCount = await page.evaluate(() => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return 0
    const data = JSON.parse(raw)
    return (data.sessionSceneLinks ?? []).filter(
      (link: { sceneId: string }) => link.sceneId === 'scene-cursed-catacombs',
    ).length
  })
  expect(linkCount).toBeGreaterThan(0)
})

Then('it reappears in the Audio Library soundscapes list', async ({ page }) => {
  await page.goto('/library?tab=soundscapes')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-sc-card="Winter\'s Breath"]')).toBeVisible()
})

Then('it reappears in the Audio Library FX list', async ({ page }) => {
  await openLibraryFxTab(page)
  await expect(page.locator('[data-fx-card="Dragon Roar"]')).toBeVisible()
})

Then("it reappears in its parent campaign's sessions list", async ({ page }) => {
  await openCampaignSessions(page, DEFAULT_CAMPAIGN_NAME)
  await expect(page.locator('[data-session-number="Session 12"]')).toBeVisible()
})

Then('{string} reappears in my campaigns list', async ({ page }, name: string) => {
  await page.goto('/campaigns')
  await page.waitForLoadState('networkidle')
  await expect(page.locator(`[data-campaign-card="${name}"]`)).toBeVisible()
})

Then('its sessions are no longer hidden', async ({ page }) => {
  await openCampaignSessions(page, 'Curse of Strahd')
  await expect(page.locator('[data-session-card]')).toHaveCount(3)
})

Then(
  'the restored item appears as {string} in the Audio Library FX list',
  async ({ page }, displayName: string) => {
    await openLibraryFxTab(page)
    await expect(page.locator(`[data-fx-card="${displayName}"]`)).toBeVisible()
  },
)

Then(
  /^"(.*)" and "(.*)" are removed from Trash$/,
  async ({ page }, first: string, second: string) => {
    await openTrashTab(page, 'FX')
    await expect(page.locator(`[data-trashed-fx="${first}"]`)).toHaveCount(0)
    await expect(page.locator(`[data-trashed-fx="${second}"]`)).toHaveCount(0)
  },
)

Then('they reappear in the Audio Library FX list', async ({ page }) => {
  await openLibraryFxTab(page)
  await expect(page.locator('[data-fx-card="Dragon Roar"]')).toBeVisible()
  await expect(page.locator('[data-fx-card="Wolf Howl"]')).toBeVisible()
})

Then(
  /^"(.*)" and "(.*)" reappear in the Audio Library FX list$/,
  async ({ page }, first: string, second: string) => {
    await openLibraryFxTab(page)
    await expect(page.locator(`[data-fx-card="${first}"]`)).toBeVisible()
    await expect(page.locator(`[data-fx-card="${second}"]`)).toBeVisible()
  },
)

Then('the restored FX track plays successfully in the Audio Library FX list', async ({ page }) => {
  await openLibraryFxTab(page)
  await page.locator('[data-fx-card-body="Dragon Roar"]').click()
  await expect(page.locator('[data-fx-card-preview-state="Dragon Roar"]')).toHaveAttribute('data-state', 'playing')
})
