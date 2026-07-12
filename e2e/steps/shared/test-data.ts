import { expect, type Page } from '@playwright/test'
import type { AppData, Campaign, E2EControls, Session } from '../../../src/types/campaign'
import type { FxTrack } from '../../../src/types/library'
import type { Scene, SessionSceneLink } from '../../../src/types/scene'

export interface SoundboardEntry {
  id: string
  sceneId: string
  fxTrackId: string
  order: number
  hotkey?: string
}

import type { SoundscapeCategory } from '../../../src/types/library'

export interface E2EAppData extends AppData {
  /** @deprecated use sceneSoundboardEntries */
  soundboardEntries?: SoundboardEntry[]
}

export interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard'
  previewVolume?: number
}

export interface ExtendedE2EControls extends E2EControls {
  importFxFails?: boolean
  invalidAudioImport?: boolean
  storefrontOpen?: boolean
}

export const EMPTY_E2E_APP_DATA: E2EAppData = {
  campaigns: [],
  sessions: [],
  lastActiveSessionByCampaign: {},
  scenes: [],
  fxTracks: [],
  sessionSceneLinks: [],
  sceneSoundboardEntries: [],
  sceneSoundscapeSlots: [],
  sceneSoundboardSettings: [],
  soundscapeCategories: [],
  lastActiveSceneBySession: {},
}

export const DEFAULT_SCENE_NAME = 'Untitled Scene'
export const DEFAULT_CAMPAIGN_NAME = 'Curse of Strahd'

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function sceneIdForName(name: string): string {
  return `scene-${slugify(name)}`
}

export function fxIdForName(name: string): string {
  return `fx-${slugify(name)}`
}

export function campaignIdForName(name: string): string {
  return `campaign-${slugify(name)}`
}

export function sessionIdForLabel(label: string, campaignName = DEFAULT_CAMPAIGN_NAME): string {
  const combined = label.match(/^Session\s+(\d+)\s*[–-]\s*(.+)$/)
  const number = combined
    ? Number.parseInt(combined[1], 10)
    : Number.parseInt(label.replace('Session ', ''), 10)
  return `session-${campaignIdForName(campaignName)}-${number}`
}

export function parseSceneList(text: string): string[] {
  const quoted = text.match(/"([^"]+)"/g)
  if (quoted?.length) {
    return quoted.map((part) => part.slice(1, -1))
  }
  return text
    .split(/,|\band\b/)
    .map((part) => part.trim().replace(/^"|"$/g, ''))
    .filter(Boolean)
}

export function buildScene(name: string, overrides: Partial<Scene> = {}): Scene {
  const now = new Date().toISOString()
  return {
    id: sceneIdForName(name),
    name,
    tags: [],
    createdAt: now,
    lastUsedAt: now,
    ...overrides,
  }
}

export function buildFxTrack(name: string, overrides: Partial<FxTrack> = {}): FxTrack {
  const now = new Date().toISOString()
  const bundled = BUNDLED_FX_BY_NAME[name] ?? {}
  return {
    id: fxIdForName(name),
    name,
    durationSeconds: 3,
    baseIntensity: 'II',
    type: 'OTHER',
    tags: [],
    audioUrl: `/assets/audio/soundboard/${name.toLowerCase().replace(/\s+/g, '-')}.ogg`,
    defaultVolume: 80,
    createdAt: now,
    ...bundled,
    ...overrides,
  }
}

const BUNDLED_FX_BY_NAME: Record<string, Partial<FxTrack>> = {
  'Wolf Howl': {
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    type: 'CREATURE',
    tags: ['Creature'],
    baseIntensity: 'II',
    durationSeconds: 3,
  },
  'Thunder Crack': {
    audioUrl: '/assets/audio/soundboard/whip.ogg',
    type: 'IMPACT',
    tags: ['Impact', 'Combat'],
    baseIntensity: 'II',
    durationSeconds: 4,
  },
  'Sword Clash': {
    audioUrl: '/assets/audio/soundboard/u_fe12rqkbth-sword-clash-241729.ogg',
    type: 'COMBAT',
    tags: ['Combat'],
    baseIntensity: 'I',
    durationSeconds: 2,
  },
  'Battle Horn': {
    audioUrl: '/assets/audio/soundboard/djartmusic-arrow-twang_01-306041.ogg',
    type: 'COMBAT',
    tags: ['Combat'],
    baseIntensity: 'II',
    durationSeconds: 2,
  },
  'Soft Tap': {
    audioUrl: '/assets/audio/soundboard/djartmusic-arrow-swish_03-306040.ogg',
    type: 'UI',
    tags: ['UI'],
    baseIntensity: 'I',
    durationSeconds: 1,
  },
}

export function buildDefaultPickerFxTracks(): FxTrack[] {
  return ['Wolf Howl', 'Thunder Crack', 'Sword Clash', 'Battle Horn'].map((name) => buildFxTrack(name))
}

export function importDisplayName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '')
  return baseName.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function buildSessionSceneLink(
  sessionId: string,
  sceneId: string,
  overrides: Partial<SessionSceneLink> = {},
): SessionSceneLink {
  return {
    id: `link-${sessionId}-${sceneId}`,
    sessionId,
    sceneId,
    linkedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function buildSoundboardEntry(
  sceneId: string,
  fxTrackId: string,
  order: number,
  overrides: Partial<SoundboardEntry> = {},
): SoundboardEntry {
  return {
    id: `soundboard-${sceneId}-${fxTrackId}-${order}`,
    sceneId,
    fxTrackId,
    order,
    hotkey: order <= 9 ? `Num ${order}` : undefined,
    ...overrides,
  }
}

export function parseDurationSeconds(duration: string): number {
  const [minutes, seconds] = duration.split(':').map((part) => Number.parseInt(part, 10))
  return (minutes ?? 0) * 60 + (seconds ?? 0)
}

export function buildSoundscapeCategory(name: string, trackCount = 5): SoundscapeCategory {
  return {
    id: `category-${slugify(name)}`,
    name,
    trackCount,
  }
}

export function buildSceneSoundscapeSlot(
  sceneId: string,
  categoryId: string,
  order: number,
): import('../../../src/types/scene').SceneSoundscapeSlot {
  return {
    id: `soundscape-slot-${sceneId}-${order}`,
    sceneId,
    categoryId,
    order,
  }
}

export function buildCampaign(name: string, overrides: Partial<Campaign> = {}): Campaign {
  const now = new Date().toISOString()
  return {
    id: campaignIdForName(name),
    name,
    createdAt: now,
    lastPlayedAt: now,
    ...overrides,
  }
}

export function buildSession(
  campaignId: string,
  number: number,
  name: string,
  overrides: Partial<Session> = {},
): Session {
  return {
    id: `session-${campaignId}-${number}`,
    campaignId,
    name,
    number,
    date: new Date().toISOString().slice(0, 10),
    sceneCount: 0,
    ...overrides,
  }
}

export function buildSessionFromCombinedTitle(
  campaignId: string,
  combinedTitle: string,
  overrides: Partial<Session> = {},
): Session {
  const match = combinedTitle.match(/^Session\s+(\d+)\s*[–-]\s*(.+)$/)
  if (!match) {
    throw new Error(`Invalid combined session title: ${combinedTitle}`)
  }
  return buildSession(campaignId, Number.parseInt(match[1], 10), match[2].trim(), overrides)
}

export async function resetE2EData(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => {
    window.__ARCANUM_E2E__?.reset()
    window.__ARCANUM_AUDIO_STATE__ = { isPlaying: false }
  })
}

export async function ensureCampaignsScreen(page: Page) {
  if (!page.url().includes('/campaigns')) {
    await page.goto('/campaigns')
    await page.waitForLoadState('networkidle')
  }
}

export async function seedE2EData(page: Page, partial: Partial<E2EAppData>) {
  await page.evaluate((data) => {
    window.__ARCANUM_E2E__?.seed(data)
  }, partial)
}

export async function mergeE2EData(page: Page, partial: Partial<E2EAppData>, options?: { navigateHome?: boolean }) {
  if (options?.navigateHome !== false) {
    await page.goto('/')
  }
  await page.evaluate((next) => {
    const empty = {
      campaigns: [],
      sessions: [],
      lastActiveSessionByCampaign: {},
      scenes: [],
      fxTracks: [],
      sessionSceneLinks: [],
      sceneSoundboardEntries: [],
      sceneSoundscapeSlots: [],
      sceneSoundboardSettings: [],
      soundscapeCategories: [],
      lastActiveSceneBySession: {},
    }

    const raw = localStorage.getItem('arcanum-audio-data')
    const current = raw ? JSON.parse(raw) : { ...empty }

    function mergeById<T extends { id: string }>(existing: T[] = [], incoming?: T[]): T[] {
      if (!incoming?.length) {
        return existing
      }
      const map = new Map(existing.map((item) => [item.id, item]))
      for (const item of incoming) {
        map.set(item.id, item)
      }
      return Array.from(map.values())
    }

    const merged = {
      ...empty,
      ...current,
      ...next,
      campaigns: mergeById(current.campaigns, next.campaigns),
      sessions: mergeById(current.sessions, next.sessions),
      scenes: mergeById(current.scenes, next.scenes),
      fxTracks: mergeById(current.fxTracks, next.fxTracks),
      sessionSceneLinks: mergeById(current.sessionSceneLinks, next.sessionSceneLinks),
      sceneSoundboardEntries: mergeById(
        current.sceneSoundboardEntries,
        next.sceneSoundboardEntries ?? next.soundboardEntries,
      ),
      sceneSoundscapeSlots: mergeById(current.sceneSoundscapeSlots, next.sceneSoundscapeSlots),
      sceneSoundboardSettings: next.sceneSoundboardSettings ?? current.sceneSoundboardSettings,
      soundscapeCategories: mergeById(current.soundscapeCategories, next.soundscapeCategories),
      lastActiveSessionByCampaign: {
        ...current.lastActiveSessionByCampaign,
        ...next.lastActiveSessionByCampaign,
      },
      lastActiveSceneBySession: {
        ...current.lastActiveSceneBySession,
        ...next.lastActiveSceneBySession,
      },
    }

    localStorage.setItem('arcanum-audio-data', JSON.stringify(merged))
    window.__ARCANUM_E2E__?.seed(merged)
  }, partial)
}

export async function setE2EControls(page: Page, controls: Partial<ExtendedE2EControls>) {
  await page.evaluate((next) => {
    window.__ARCANUM_E2E__?.setE2EControls(next)
  }, controls)
}

export async function mergeCampaign(page: Page, campaign: Campaign) {
  await mergeE2EData(page, { campaigns: [campaign] })
}

export async function mergeSession(page: Page, session: Session) {
  await mergeE2EData(page, { sessions: [session] })
}

export async function mergeScene(page: Page, scene: Scene) {
  await mergeE2EData(page, { scenes: [scene] })
}

export async function mergeFxTrack(
  page: Page,
  track: FxTrack,
  options?: { openLibrary?: boolean },
) {
  const onLibrary = page.url().includes('/library')
  await mergeE2EData(page, { fxTracks: [track] }, { navigateHome: false })
  if (options?.openLibrary !== false && !onLibrary) {
    await openLibraryFxTab(page)
  }
}

export async function openCampaignSessions(page: Page, campaignName: string) {
  await page.goto(`/campaigns/${campaignIdForName(campaignName)}/sessions`)
  await page.waitForLoadState('networkidle')
}

export async function openScenes(page: Page) {
  await page.goto('/scenes')
  await page.waitForLoadState('networkidle')
}

export async function openSessionScenes(
  page: Page,
  sessionLabel: string,
  campaignName = DEFAULT_CAMPAIGN_NAME,
) {
  const campaignId = campaignIdForName(campaignName)
  const sessionId = sessionIdForLabel(sessionLabel, campaignName)
  await page.goto(`/campaigns/${campaignId}/sessions/${sessionId}/scenes`)
  await page.waitForLoadState('networkidle')
}

export async function openActiveScene(
  page: Page,
  sceneName: string,
  tab: 'Soundscapes' | 'Soundboard' = 'Soundscapes',
) {
  await page.goto(`/scenes/${sceneIdForName(sceneName)}/active?tab=${tab.toLowerCase()}`)
  await page.waitForLoadState('networkidle')
}

export async function openLibraryFxTab(page: Page) {
  await page.goto('/library?tab=sound-effects')
  await page.waitForLoadState('networkidle')
}

export async function ensureDefaultSession(
  page: Page,
  sessionLabel = 'Session 1',
  campaignName = DEFAULT_CAMPAIGN_NAME,
) {
  const campaign = buildCampaign(campaignName)
  const number = Number.parseInt(sessionLabel.replace('Session ', ''), 10)
  const session = buildSession(campaign.id, number, `Night ${number}`)
  await mergeE2EData(page, { campaigns: [campaign], sessions: [session] })
  return { campaign, session }
}

export async function linkSceneToSession(
  page: Page,
  sceneName: string,
  sessionLabel: string,
  campaignName = DEFAULT_CAMPAIGN_NAME,
) {
  const sessionId = sessionIdForLabel(sessionLabel, campaignName)
  const sceneId = sceneIdForName(sceneName)
  const link = buildSessionSceneLink(sessionId, sceneId)
  await mergeE2EData(page, {
    sessionSceneLinks: [link],
    scenes: [buildScene(sceneName)],
  })
}

export async function seedSceneWithCounts(
  page: Page,
  name: string,
  soundscapeCategoryCount: number,
  effectCount: number,
) {
  const scene = buildScene(name)
  const soundscapeSlots = Array.from({ length: soundscapeCategoryCount }, (_, index) => ({
    id: `slot-${scene.id}-${index}`,
    sceneId: scene.id,
    categoryId: `category-${index}`,
    order: index,
  }))
  const soundboardEntries = Array.from({ length: effectCount }, (_, index) => ({
    id: `entry-${scene.id}-${index}`,
    sceneId: scene.id,
    fxTrackId: `fx-${index}`,
    order: index,
  }))
  await mergeE2EData(page, { scenes: [scene], sceneSoundscapeSlots: soundscapeSlots, sceneSoundboardEntries: soundboardEntries })
  return scene
}

export async function getAudioState(page: Page) {
  return page.evaluate(() => window.__ARCANUM_AUDIO_STATE__ ?? { isPlaying: false })
}

export async function expectNoAudioPlayback(page: Page) {
  await expect
    .poll(async () => (await getAudioState(page)).isPlaying, { timeout: 5_000 })
    .toBe(false)
}

export async function expectAudioPlaying(page: Page, trackName: string) {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return state.isPlaying && state.trackName === trackName
    }, { timeout: 5_000 })
    .toBe(true)
}

export async function expectAudioStopped(page: Page, trackName: string) {
  await expect
    .poll(async () => {
      const state = await getAudioState(page)
      return !state.isPlaying || state.trackName !== trackName
    }, { timeout: 5_000 })
    .toBe(true)
}

export function tableColumnValues(dataTable: { raw: () => string[][] }): string[] {
  return dataTable
    .raw()
    .map((row) => row[0]?.trim())
    .filter(Boolean) as string[]
}

export function tableCellValues(dataTable: { rows: () => string[][] }): string[] {
  return dataTable
    .rows()
    .map((row) => row[0]?.trim())
    .filter(Boolean) as string[]
}

export function tableRows(dataTable: { rows: () => string[][] }): string[][] {
  return dataTable.rows().map((row) => row.map((cell) => cell?.trim() ?? ''))
}

export { parseRelativeDate } from '../../../src/lib/dateFormat'
