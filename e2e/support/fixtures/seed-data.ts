import type { Page } from '@playwright/test'

/** 1×1 red PNG for cover-art upload steps. */
export const TEST_COVER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

export const TEST_COVER_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

export interface CreateCampaignSeedInput {
  name: string
  description?: string
  coverArtUrl?: string
  lastPlayedAt?: number
  sessionCount?: number
}

export interface CreateSessionSeedInput {
  campaignId: string
  name: string
  number?: number
  date?: string
  description?: string
  coverArtUrl?: string
  sceneCount?: number
  lastOpenedAt?: number
}

export async function resetE2EFlags(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__arcanumResetE2E?.()
  })
}

export async function clearSeedData(page: Page): Promise<void> {
  await page.evaluate(async () => {
    window.__arcanumResetE2E?.()
    await window.__arcanumClearE2E?.()
  })
}

export async function createCampaignSeed(
  page: Page,
  input: CreateCampaignSeedInput,
): Promise<string> {
  return page.evaluate(async (data) => {
    if (!window.__arcanumCreateCampaign) {
      throw new Error('__arcanumCreateCampaign is not available')
    }
    return window.__arcanumCreateCampaign(data)
  }, input)
}

export async function createSessionSeed(
  page: Page,
  input: CreateSessionSeedInput,
): Promise<string> {
  return page.evaluate(async (data) => {
    if (!window.__arcanumCreateSession) {
      throw new Error('__arcanumCreateSession is not available')
    }
    return window.__arcanumCreateSession(data)
  }, input)
}

export async function getCampaignIdByName(page: Page, name: string): Promise<string> {
  const id = await page.evaluate(async (campaignName) => {
    if (!window.__arcanumGetCampaignIdByName) {
      throw new Error('__arcanumGetCampaignIdByName is not available')
    }
    return window.__arcanumGetCampaignIdByName(campaignName)
  }, name)

  if (!id) {
    throw new Error(`Campaign not found: ${name}`)
  }
  return id
}

export async function getSessionIdByLabel(
  page: Page,
  campaignId: string,
  sessionLabel: string,
): Promise<string> {
  const id = await page.evaluate(
    async ({ cid, label }) => {
      if (!window.__arcanumGetSessionIdByName) {
        throw new Error('__arcanumGetSessionIdByName is not available')
      }
      return window.__arcanumGetSessionIdByName(cid, label)
    },
    { cid: campaignId, label: sessionLabel },
  )

  if (!id) {
    throw new Error(`Session not found: ${sessionLabel} in campaign ${campaignId}`)
  }
  return id
}

export async function setSessionLastOpened(
  page: Page,
  sessionId: string,
  timestamp: number,
): Promise<void> {
  await page.evaluate(
    async ({ sid, ts }) => {
      await window.__arcanumSetSessionLastOpened?.(sid, ts)
    },
    { sid: sessionId, ts: timestamp },
  )
}

export async function setE2EFlags(
  page: Page,
  partial: {
    campaignsLoading?: boolean
    campaignsLoadFail?: boolean
    sessionsLoading?: boolean
    sessionsLoadFail?: boolean
    sessionCreateFail?: boolean
    sessionSaveFail?: boolean
    scenesLoading?: boolean
    scenesLoadFail?: boolean
    soundscapesLoading?: boolean
    soundscapesLoadFail?: boolean
    tracksLoading?: boolean
    fxLoading?: boolean
    fxLoadFail?: boolean
    homeLoading?: boolean
    homeLoadFail?: boolean
    homeOffline?: boolean
    homeHasCachedData?: boolean
    attributionsLoading?: boolean
    attributionsLoadFail?: boolean
    trashRestoreFailIds?: string[]
    trashPurgeFailIds?: string[]
    playbackFailEffects?: string[]
    playbackFailCategories?: string[]
    composerSaveFail?: boolean
    homeStatLoadFail?: boolean
  },
): Promise<void> {
  await page.evaluate((flags) => {
    window.__arcanumSetE2E?.(flags)
  }, partial)
}

export function parseSessionNumber(label: string): number {
  return Number.parseInt(label.replace('Session ', ''), 10)
}

export function isoDateFromKeyword(keyword: string): string {
  const normalized = keyword.trim().toLowerCase()
  const now = new Date()

  if (normalized === 'today') {
    return formatIsoDate(now)
  }

  if (normalized === 'yesterday') {
    const date = new Date(now)
    date.setDate(date.getDate() - 1)
    return formatIsoDate(date)
  }

  if (normalized === 'last month') {
    const date = new Date(now)
    date.setMonth(date.getMonth() - 1)
    return formatIsoDate(date)
  }

  const monthDay = keyword.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
  if (monthDay) {
    const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(
      monthDay[1].toLowerCase(),
    )
    if (monthIndex >= 0) {
      const date = new Date(now.getFullYear(), monthIndex, Number.parseInt(monthDay[2], 10))
      return formatIsoDate(date)
    }
  }

  throw new Error(`Unsupported date keyword: ${keyword}`)
}

export function lastPlayedTimestamp(keyword: string): number {
  const normalized = keyword.trim().toLowerCase()
  const now = Date.now()

  if (normalized === 'today') {
    return now
  }

  if (normalized === 'yesterday') {
    return now - 86_400_000
  }

  throw new Error(`Unsupported last played date: ${keyword}`)
}

export function futureIsoDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return formatIsoDate(date)
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function seedCampaignWithSessions(
  page: Page,
  campaignName: string,
  sessionCount: number,
): Promise<string> {
  await page.goto('/')
  await clearSeedData(page)
  return createCampaignSeed(page, { name: campaignName, sessionCount })
}

export async function seedCampaignWithNamedSessions(
  page: Page,
  campaignName: string,
  rows: Array<{ number: string; name: string; date?: string; scenes?: string }>,
): Promise<string> {
  await page.goto('/')
  await clearSeedData(page)
  const campaignId = await createCampaignSeed(page, { name: campaignName })

  for (const row of rows) {
    await createSessionSeed(page, {
      campaignId,
      name: row.name,
      number: parseSessionNumber(row.number),
      date: row.date ? isoDateFromKeyword(row.date) : undefined,
      sceneCount: row.scenes ? Number.parseInt(row.scenes, 10) : undefined,
    })
  }

  return campaignId
}

export interface CreateSceneSeedInput {
  name: string
  description?: string
  coverArtUrl?: string
  tags?: string[]
  soundscapeCategoryCount?: number
  effectCount?: number
}

export async function createSceneSeed(page: Page, input: CreateSceneSeedInput): Promise<string> {
  return page.evaluate(async (data) => {
    if (!window.__arcanumCreateScene) {
      throw new Error('__arcanumCreateScene is not available')
    }
    return window.__arcanumCreateScene(data)
  }, input)
}

export async function getSceneIdByName(page: Page, name: string): Promise<string> {
  const id = await page.evaluate(async (sceneName) => {
    if (!window.__arcanumGetSceneIdByName) {
      throw new Error('__arcanumGetSceneIdByName is not available')
    }
    return window.__arcanumGetSceneIdByName(sceneName)
  }, name)

  if (!id) {
    throw new Error(`Scene not found: ${name}`)
  }
  return id
}

export async function linkSceneToSession(
  page: Page,
  sessionId: string,
  sceneId: string,
): Promise<void> {
  await page.evaluate(
    async ({ sid, scid }) => {
      await window.__arcanumLinkSceneToSession?.(sid, scid)
    },
    { sid: sessionId, scid: sceneId },
  )
}

export async function setSessionSceneLastPlayed(
  page: Page,
  sessionId: string,
  sceneId: string,
  timestamp: number,
): Promise<void> {
  await page.evaluate(
    async ({ sid, scid, ts }) => {
      await window.__arcanumSetSessionSceneLastPlayed?.(sid, scid, ts)
    },
    { sid: sessionId, scid: sceneId, ts: timestamp },
  )
}

export async function createSoundscapeCategorySeed(
  page: Page,
  name: string,
): Promise<string> {
  return page.evaluate(async (categoryName) => {
    if (!window.__arcanumCreateSoundscapeCategory) {
      throw new Error('__arcanumCreateSoundscapeCategory is not available')
    }
    return window.__arcanumCreateSoundscapeCategory({ name: categoryName })
  }, name)
}

export async function getCategoryIdByName(page: Page, name: string): Promise<string> {
  const id = await page.evaluate(async (categoryName) => {
    if (!window.__arcanumGetCategoryIdByName) {
      throw new Error('__arcanumGetCategoryIdByName is not available')
    }
    return window.__arcanumGetCategoryIdByName(categoryName)
  }, name)

  if (!id) {
    throw new Error(`Category not found: ${name}`)
  }
  return id
}

export async function createTrackSeed(
  page: Page,
  input: { name: string; format?: string; channel?: string; duration?: string },
): Promise<string> {
  return page.evaluate(async (data) => {
    if (!window.__arcanumCreateTrack) {
      throw new Error('__arcanumCreateTrack is not available')
    }
    return window.__arcanumCreateTrack(data)
  }, input)
}

export async function attachTrackToLevel(
  page: Page,
  categoryId: string,
  level: 1 | 2 | 3,
  trackId: string,
): Promise<void> {
  await page.evaluate(
    async ({ cid, lvl, tid }) => {
      await window.__arcanumAttachTrackToLevel?.(cid, lvl, tid)
    },
    { cid: categoryId, lvl: level, tid: trackId },
  )
}

export async function createFxTrackSeed(
  page: Page,
  input: {
    name: string
    duration?: string
    baseIntensity?: 1 | 2 | 3
    fxType?: string
    tags?: string[]
    fileName?: string
  },
): Promise<string> {
  return page.evaluate(async (data) => {
    if (!window.__arcanumCreateFxTrack) {
      throw new Error('__arcanumCreateFxTrack is not available')
    }
    return window.__arcanumCreateFxTrack(data)
  }, input)
}

export async function getFxTrackIdByName(page: Page, name: string): Promise<string> {
  const id = await page.evaluate(async (trackName) => {
    if (!window.__arcanumGetFxTrackIdByName) {
      throw new Error('__arcanumGetFxTrackIdByName is not available')
    }
    return window.__arcanumGetFxTrackIdByName(trackName)
  }, name)
  if (!id) throw new Error(`FX track not found: ${name}`)
  return id
}

export async function addSceneSoundscapeSeed(
  page: Page,
  sceneId: string,
  categoryName: string,
  volume = 100,
): Promise<void> {
  await page.evaluate(
    async ({ sid, name, vol }) => {
      await window.__arcanumAddSceneSoundscape?.(sid, name, vol)
    },
    { sid: sceneId, name: categoryName, vol: volume },
  )
}

export async function addSceneEffectSeed(
  page: Page,
  sceneId: string,
  name: string,
  fxTrackId?: string,
): Promise<void> {
  await page.evaluate(
    async ({ sid, effectName, tid }) => {
      await window.__arcanumAddSceneEffect?.(sid, effectName, 100, tid)
    },
    { sid: sceneId, effectName: name, tid: fxTrackId },
  )
}

export async function setCategoryTypeSeed(
  page: Page,
  categoryId: string,
  categoryType: string,
): Promise<void> {
  await page.evaluate(
    async ({ cid, type }) => {
      await window.__arcanumSetCategoryType?.(cid, type)
    },
    { cid: categoryId, type: categoryType },
  )
}

export const TEST_COVER_JPG_DATA_URL = TEST_COVER_DATA_URL
