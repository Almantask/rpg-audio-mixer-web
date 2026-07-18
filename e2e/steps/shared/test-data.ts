import { expect, type Page } from '@playwright/test'
import type { AppData, Campaign, E2EControls, Session } from '../../../src/types/campaign'
import type { FxTrack } from '../../../src/types/library'
import type {
  Scene,
  SceneSoundboardSettings,
  SceneSoundscapeSettings,
  SceneSoundscapeSlot,
  SessionSceneLink,
  SoundscapeIntensity,
} from '../../../src/types/scene'
import {
  computeSoundboardGain,
  computeSoundscapeGain,
} from '../../../src/lib/audio/sceneAudioManager'

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

export interface PlayingTrackSnapshot {
  id: string
  name: string
  source: 'soundboard' | 'soundscape' | 'library' | 'picker' | 'home'
  slotId?: string
  categoryName?: string
}

export interface ArcanumAudioVolumes {
  soundboardMaster?: number
  soundscapeMaster?: number
  soundscapes?: Record<string, number>
}

export interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  previewVolume?: number
  playingTracks?: PlayingTrackSnapshot[]
  volumes?: ArcanumAudioVolumes
}

export interface ExtendedE2EControls extends E2EControls {
  importFxFails?: boolean
  invalidAudioImport?: boolean
  storefrontOpen?: boolean
  restoreBlockedFxIds?: string[]
  purgeBlockedFxIds?: string[]
  attributionsState?: 'ready' | 'loading' | 'error'
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
  sceneSoundscapeSettings: [],
  soundscapeCategories: [],
  soundscapeTracks: [],
  lastActiveSceneBySession: {},
  playStats: { soundscapeCategories: {}, fxTracks: {} },
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

export const LONG_FX_AUDIO_URL =
  '/assets/audio/soundscapes/Forest/II/Dancing feys in Oak Forest.ogg'

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
    durationSeconds: 120,
  },
  'Thunder Crack': {
    audioUrl: '/assets/audio/soundboard/whip.ogg',
    type: 'IMPACT',
    tags: ['Impact', 'Combat'],
    baseIntensity: 'II',
    durationSeconds: 120,
  },
  'Sword Clash': {
    audioUrl: '/assets/audio/soundboard/sword.ogg',
    type: 'COMBAT',
    tags: ['Combat'],
    baseIntensity: 'I',
    durationSeconds: 2,
  },
  'Battle Horn': {
    audioUrl: '/assets/audio/soundboard/arrow2.ogg',
    type: 'COMBAT',
    tags: ['Combat'],
    baseIntensity: 'II',
    durationSeconds: 2,
  },
  'Soft Tap': {
    audioUrl: '/assets/audio/soundboard/arrow3.ogg',
    type: 'UI',
    tags: ['UI'],
    baseIntensity: 'I',
    durationSeconds: 1,
  },
  Whip: {
    audioUrl: '/assets/audio/soundboard/whip.ogg',
    type: 'IMPACT',
    tags: ['Impact'],
    baseIntensity: 'II',
    durationSeconds: 2,
  },
  'Owl Hooting': {
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    type: 'CREATURE',
    tags: ['Creature'],
    baseIntensity: 'I',
    durationSeconds: 3,
  },
  'Dog Bark': {
    audioUrl: '/assets/audio/soundboard/whip.ogg',
    type: 'CREATURE',
    tags: ['Creature'],
    baseIntensity: 'II',
    durationSeconds: 2,
  },
  'Door Creak': {
    audioUrl: '/assets/audio/soundboard/sword4.ogg',
    type: 'OTHER',
    tags: ['Other'],
    baseIntensity: 'I',
    durationSeconds: 2,
  },
  'Dragon Roar': {
    audioUrl: '/assets/audio/soundboard/dragon_roar2.ogg',
    type: 'CREATURE',
    tags: ['Creature'],
    baseIntensity: 'III',
    durationSeconds: 3,
  },
}

const BUNDLED_SOUNDSCAPE_BY_NAME: Record<string, Partial<import('../../../src/types/library').SoundscapeTrack>> = {
  'Light Rain': { id: 'track-light-rain', durationSeconds: 2 },
  Drizzle: { id: 'track-drizzle' },
  Storm: { id: 'track-storm' },
  'Forest Loop': { id: 'track-forest-loop' },
  'Light Rain Alt': { id: 'track-light-rain-alt' },
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

export function categoryIdForName(name: string): string {
  return `category-${slugify(name)}`
}

export function buildSoundscapeCategory(
  name: string,
  overrides: Partial<SoundscapeCategory> = {},
): SoundscapeCategory {
  const trackCount = overrides.trackCount ?? 5
  const baseId = `track-${slugify(name)}`
  return {
    id: categoryIdForName(name),
    name,
    trackCount,
    createdAt: new Date().toISOString(),
    levels: {
      I: [`${baseId}-i-1`],
      II: [`${baseId}-ii-1`, `${baseId}-ii-2`],
      III: [`${baseId}-iii-1`],
    },
    ...overrides,
  }
}

export function buildSoundscapeTracksForCategory(name: string) {
  const category = buildSoundscapeCategory(name)
  const trackIds = [
    ...(category.levels?.I ?? []),
    ...(category.levels?.II ?? []),
    ...(category.levels?.III ?? []),
  ]
  return trackIds.map((id, index) =>
    buildSoundscapeTrack(`${name} Track ${index + 1}`, { id }),
  )
}

export function buildSoundscapeCategoryWithLayers(
  name: string,
  trackCount: number,
  layerCount: number,
): SoundscapeCategory {
  const levels: SoundscapeCategory['levels'] = { I: [], II: [], III: [] }
  const levelKeys = (['I', 'II', 'III'] as const).slice(0, layerCount)
  const tracksPerLevel = Math.max(1, Math.floor(trackCount / layerCount))
  for (const level of levelKeys) {
    const ids = Array.from({ length: tracksPerLevel }, (_, index) => {
      return `track-${slugify(name)}-${level.toLowerCase()}-${index + 1}`
    })
    levels[level] = ids
  }
  return {
    id: categoryIdForName(name),
    name,
    trackCount,
    levels,
  }
}

export function buildEmptySoundscapeCategory(name: string): SoundscapeCategory {
  return {
    id: categoryIdForName(name),
    name,
    trackCount: 0,
    levels: { I: [], II: [], III: [] },
  }
}

export function soundscapeTrackIdForName(name: string): string {
  return BUNDLED_SOUNDSCAPE_BY_NAME[name]?.id ?? `track-${slugify(name)}`
}

export function buildSoundscapeTrack(name: string, overrides: Partial<import('../../../src/types/library').SoundscapeTrack> = {}) {
  const bundled = BUNDLED_SOUNDSCAPE_BY_NAME[name] ?? {}
  return {
    id: soundscapeTrackIdForName(name),
    name,
    durationSeconds: 180,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
    createdAt: new Date().toISOString(),
    ...bundled,
    ...overrides,
  }
}

export function intensityLabelToLevel(label: string): SoundscapeIntensity {
  const match = label.match(/Level\s+(I{1,3})/i) ?? label.match(/^(I{1,3})$/)
  if (!match) {
    throw new Error(`Invalid intensity label: ${label}`)
  }
  return match[1] as SoundscapeIntensity
}

export function buildWeatherCategoryWithTracks() {
  const lightRain = buildSoundscapeTrack('Light Rain')
  const drizzle = buildSoundscapeTrack('Drizzle')
  const lightRainAlt = buildSoundscapeTrack('Light Rain Alt')
  const storm = buildSoundscapeTrack('Thunderstorm')
  const category = buildSoundscapeCategory('Weather', {
    trackCount: 4,
    levels: {
      I: [lightRain.id, drizzle.id, lightRainAlt.id],
      II: [storm.id],
      III: [],
    },
  })
  return {
    category,
    tracks: [lightRain, drizzle, lightRainAlt, storm],
  }
}

export function buildSoundscapeCategoryWithNamedTracks(
  name: string,
  tracksByLevel: Partial<Record<SoundscapeIntensity, string[]>>,
) {
  const tracks = Object.values(tracksByLevel)
    .flat()
    .filter(Boolean)
    .map((trackName) => buildSoundscapeTrack(trackName as string))
  const levels: SoundscapeCategory['levels'] = { I: [], II: [], III: [] }
  for (const level of ['I', 'II', 'III'] as const) {
    const names = tracksByLevel[level] ?? []
    levels[level] = names.map((trackName) => soundscapeTrackIdForName(trackName as string))
  }
  const category = buildSoundscapeCategory(name, {
    trackCount: tracks.length,
    levels,
  })
  return { category, tracks }
}

export function buildDungeonCategoryPartialLevels() {
  const dungeonTrack = buildSoundscapeTrack('Dungeon Ambience')
  const category = buildSoundscapeCategory('Dungeon', {
    trackCount: 1,
    levels: {
      I: [dungeonTrack.id],
      II: [],
      III: [],
    },
  })
  return { category, tracks: [dungeonTrack] }
}

export function buildForestCategoryWithLoop() {
  const forestLoop = buildSoundscapeTrack('Forest Loop')
  const category = buildSoundscapeCategory('Forest', {
    trackCount: 1,
    levels: {
      I: [],
      II: [forestLoop.id],
      III: [],
    },
  })
  return { category, tracks: [forestLoop] }
}

export function seedSoundboardEffects(sceneId: string, effectNames: string[], options?: { longAudio?: boolean }) {
  const fxTracks = effectNames.map((name) =>
    buildFxTrack(
      name,
      options?.longAudio
        ? { audioUrl: LONG_FX_AUDIO_URL, durationSeconds: 120 }
        : { durationSeconds: 120 },
    ),
  )
  const sceneSoundboardEntries = fxTracks.map((fx, index) =>
    buildSoundboardEntry(sceneId, fx.id, index + 1),
  )
  return { fxTracks, sceneSoundboardEntries }
}

export async function replaceSceneSoundboard(
  page: Page,
  sceneId: string,
  effectNames: string[],
) {
  const { fxTracks, sceneSoundboardEntries } = seedSoundboardEffects(sceneId, effectNames)
  await page.evaluate(
    ({ targetSceneId, tracks, entries }) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      const data = raw ? JSON.parse(raw) : {}
      const mergeById = <T extends { id: string }>(existing: T[] = [], incoming: T[]): T[] => {
        const map = new Map(existing.map((item) => [item.id, item]))
        for (const item of incoming) {
          map.set(item.id, item)
        }
        return Array.from(map.values())
      }
      data.sceneSoundboardEntries = [
        ...(data.sceneSoundboardEntries ?? []).filter(
          (entry: { sceneId: string }) => entry.sceneId !== targetSceneId,
        ),
        ...entries,
      ]
      data.fxTracks = mergeById(data.fxTracks ?? [], tracks)
      localStorage.setItem('arcanum-audio-data', JSON.stringify(data))
      window.__ARCANUM_E2E__?.seed(data)
    },
    { targetSceneId: sceneId, tracks: fxTracks, entries: sceneSoundboardEntries },
  )
}

export async function ensureSoundboardEffectOnBoard(page: Page, effectName: string) {
  const sceneId = sceneIdForName(DEFAULT_SCENE_NAME)
  const fxId = fxIdForName(effectName)
  const alreadyOnBoard = await page.evaluate(
    ({ targetSceneId, targetFxId }) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      if (!raw) {
        return false
      }
      const data = JSON.parse(raw)
      return (data.sceneSoundboardEntries ?? []).some(
        (entry: { sceneId: string; fxTrackId: string }) =>
          entry.sceneId === targetSceneId && entry.fxTrackId === targetFxId,
      )
    },
    { targetSceneId: sceneId, targetFxId: fxId },
  )
  if (alreadyOnBoard) {
    return
  }
  const nextOrder = await page.evaluate((targetSceneId) => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) {
      return 1
    }
    const data = JSON.parse(raw)
    const orders = (data.sceneSoundboardEntries ?? [])
      .filter((entry: { sceneId: string }) => entry.sceneId === targetSceneId)
      .map((entry: { order: number }) => entry.order)
    return orders.length > 0 ? Math.max(...orders) + 1 : 1
  }, sceneId)
  const fx = buildFxTrack(effectName)
  await mergeE2EData(
    page,
    {
      fxTracks: [fx],
      sceneSoundboardEntries: [buildSoundboardEntry(sceneId, fx.id, nextOrder)],
    },
    { navigateHome: false },
  )
}

export async function tapCategoryPlay(page: Page, categoryName: string) {
  const playButton = page.locator(`[data-soundscape-play="${categoryName}"]`)
  if (await playButton.isDisabled()) {
    await page.locator(`[data-soundscape-d20="${categoryName}"]`).click()
    await expect(playButton).toBeEnabled({ timeout: 5_000 })
  }
  await playButton.click()
  await expect(page.locator(`[data-soundscape-playback-state="${categoryName}"]`)).toHaveAttribute(
    'data-state',
    'playing',
    { timeout: 5_000 },
  )
}

export function buildSceneSoundscapeSettings(
  sceneId: string,
  overrides: Partial<SceneSoundscapeSettings> = {},
): SceneSoundscapeSettings {
  return {
    sceneId,
    masterVolume: 100,
    muted: false,
    ...overrides,
  }
}

export function buildSceneSoundboardSettings(
  sceneId: string,
  overrides: Partial<SceneSoundboardSettings> = {},
): SceneSoundboardSettings {
  return {
    sceneId,
    masterVolume: 85,
    ...overrides,
  }
}

export function buildSceneSoundscapeSlotWithOptions(
  sceneId: string,
  categoryId: string,
  order: number,
  overrides: Partial<SceneSoundscapeSlot> = {},
): SceneSoundscapeSlot {
  return {
    ...buildSceneSoundscapeSlot(sceneId, categoryId, order),
    ...overrides,
  }
}

export async function setSessionLocked(page: Page, locked = true) {
  await setE2EControls(page, { sessionLocked: locked })
}

export async function simulateNativeDragDrop(
  page: Page,
  sourceSelector: string,
  targetSelector: string,
) {
  await page.evaluate(
    ({ dragSourceSelector, dragTargetSelector }) => {
      const source = document.querySelector(dragSourceSelector)
      const target = document.querySelector(dragTargetSelector)
      if (!source || !target) {
        throw new Error(`Drag source or target not found: ${dragSourceSelector} -> ${dragTargetSelector}`)
      }
      const dataTransfer = new DataTransfer()
      source.dispatchEvent(
        new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }),
      )
      target.dispatchEvent(
        new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }),
      )
      target.dispatchEvent(
        new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }),
      )
      target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }))
      source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer }))
    },
    { dragSourceSelector: sourceSelector, dragTargetSelector: targetSelector },
  )
}

export async function leaveAndReopenActiveScene(
  page: Page,
  sceneName = DEFAULT_SCENE_NAME,
  tab: 'Soundscapes' | 'Soundboard' = 'Soundscapes',
) {
  await page.goto('/scenes')
  await page.waitForLoadState('networkidle')
  await openActiveScene(page, sceneName, tab)
}

export function expectedSoundboardMappedGain(masterPercent: number): number {
  return computeSoundboardGain(masterPercent)
}

export function expectedSoundscapeMappedGain(
  masterPercent: number,
  volumePercent: number,
  duckMultiplier = 1,
  muted = false,
): number {
  return computeSoundscapeGain(masterPercent, volumePercent, muted, duckMultiplier)
}

export async function getPlayingTracks(page: Page): Promise<PlayingTrackSnapshot[]> {
  const state = await getAudioState(page)
  return state.playingTracks ?? []
}

export async function isTrackPlaying(page: Page, trackName: string): Promise<boolean> {
  const tracks = await getPlayingTracks(page)
  return tracks.some((track) => track.name === trackName)
}

export async function isCategoryLooping(page: Page, categoryName: string): Promise<boolean> {
  const onPage = await page.locator(`[data-soundscape-playback-state="${categoryName}"]`).count()
  if (onPage > 0) {
    const state = await page.locator(`[data-soundscape-playback-state="${categoryName}"]`).getAttribute('data-state')
    return state === 'playing'
  }
  const tracks = await getPlayingTracks(page)
  return tracks.some((track) => track.source === 'soundscape' && track.categoryName === categoryName)
}

export async function countPlayingInstances(page: Page, trackName: string): Promise<number> {
  const tracks = await getPlayingTracks(page)
  return tracks.filter((track) => track.name === trackName).length
}

export async function readPersistedSlotIntensity(
  page: Page,
  sceneId: string,
  categoryName: string,
): Promise<SoundscapeIntensity | undefined> {
  const categoryId = categoryIdForName(categoryName)
  return page.evaluate(
    ({ targetSceneId, targetCategoryId }) => {
      const raw = localStorage.getItem('arcanum-audio-data')
      if (!raw) {
        return undefined
      }
      const data = JSON.parse(raw)
      const slot = (data.sceneSoundscapeSlots ?? []).find(
        (item: { sceneId: string; categoryId: string }) =>
          item.sceneId === targetSceneId && item.categoryId === targetCategoryId,
      )
      return slot?.intensity
    },
    { targetSceneId: sceneId, targetCategoryId: categoryId },
  )
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
  const url = page.url()
  const isBlank = url === 'about:blank' || !url.startsWith('http')
  if (isBlank || options?.navigateHome !== false) {
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
      sceneSoundscapeSettings: [],
      soundscapeCategories: [],
      soundscapeTracks: [],
      lastActiveSceneBySession: {},
      playStats: { soundscapeCategories: {}, fxTracks: {} },
    }

    const raw = localStorage.getItem('arcanum-audio-data')
    const current = raw ? JSON.parse(raw) : { ...empty }

    function mergeById<T extends { id: string }>(existing: T[] = [], incoming?: T[]): T[] {
      if (!incoming?.length) {
        return existing
      }
      const map = new Map(existing.map((item) => [item.id, item]))
      for (const item of incoming) {
        const prev = map.get(item.id)
        map.set(item.id, prev ? { ...prev, ...item } : item)
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
      soundscapeTracks: mergeById(current.soundscapeTracks, next.soundscapeTracks),
      lastActiveSessionByCampaign: {
        ...current.lastActiveSessionByCampaign,
        ...next.lastActiveSessionByCampaign,
      },
      lastActiveSceneBySession: {
        ...current.lastActiveSceneBySession,
        ...next.lastActiveSceneBySession,
      },
      playStats: {
        soundscapeCategories: {
          ...(current.playStats?.soundscapeCategories ?? {}),
          ...(next.playStats?.soundscapeCategories ?? {}),
        },
        fxTracks: {
          ...(current.playStats?.fxTracks ?? {}),
          ...(next.playStats?.fxTracks ?? {}),
        },
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
  await page.goto('/library?tab=fx')
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
  await ensureDefaultSession(page, sessionLabel, campaignName)
  const sessionId = sessionIdForLabel(sessionLabel, campaignName)
  const sceneId = sceneIdForName(sceneName)
  const link = buildSessionSceneLink(sessionId, sceneId)
  const sceneExists = await page.evaluate((id) => {
    const raw = localStorage.getItem('arcanum-audio-data')
    if (!raw) return false
    return (JSON.parse(raw).scenes ?? []).some((scene: { id: string }) => scene.id === id)
  }, sceneId)
  await mergeE2EData(page, {
    sessionSceneLinks: [link],
    // Only seed a blank scene when missing — avoid wiping tags/description/cover.
    ...(sceneExists ? {} : { scenes: [buildScene(sceneName)] }),
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

type BddTableRow = string[] | { cells?: Array<{ value?: string } | string> }

export function tableRows(dataTable: unknown): string[][] {
  if (!dataTable) {
    return []
  }

  if (typeof dataTable === 'object' && 'raw' in dataTable && typeof (dataTable as { raw: () => string[][] }).raw === 'function') {
    return (dataTable as { raw: () => string[][] }).raw()
  }

  if (typeof dataTable !== 'object') {
    return []
  }

  let table = dataTable as {
    rows?: (() => BddTableRow[]) | BddTableRow[]
    dataTable?: { rows?: BddTableRow[] }
  }

  if (table.dataTable) {
    table = table.dataTable
  }

  let rows: BddTableRow[] = []
  if (typeof table.rows === 'function') {
    rows = table.rows()
  } else if (Array.isArray(table.rows)) {
    rows = table.rows
  }

  return rows.map((row) => {
    if (Array.isArray(row)) {
      return row.map((cell) => String(cell ?? '').trim())
    }
    if (row && typeof row === 'object' && 'cells' in row) {
      return (row.cells ?? []).map((cell) => {
        if (typeof cell === 'string') {
          return cell.trim()
        }
        return String(cell?.value ?? '').trim()
      })
    }
    return []
  })
}

export function buildOminousChantCategory(defaultTrackId?: string) {
  const track = buildSoundscapeTrack('Ominous Chant Loop')
  const category = buildSoundscapeCategory('Ominous Chant', {
    trackCount: 1,
    defaultTrackId: defaultTrackId ?? track.id,
    levels: { I: [], II: [track.id], III: [] },
  })
  return { category, tracks: [track] }
}

export async function openHomeScreen(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const errorOverlay = page.locator('[data-home-error-overlay]')
  if ((await errorOverlay.count()) > 0) {
    await expect(errorOverlay).toBeVisible()
    return
  }
  await expect(page.locator('[data-screen="Home screen"]')).toBeVisible()
}

export async function seedHomeTopStats(page: Page) {
  const campaign = buildCampaign('Shadows of the Underdark')
  const { category, tracks } = buildOminousChantCategory()
  const dragonRoar = buildFxTrack('Dragon Roar')
  await mergeE2EData(page, {
    campaigns: [campaign],
    soundscapeCategories: [category],
    soundscapeTracks: tracks,
    fxTracks: [dragonRoar],
    playStats: {
      soundscapeCategories: { [category.id]: 42 },
      fxTracks: { [dragonRoar.id]: 128 },
    },
  })
}

export { parseRelativeDate } from '../../../src/lib/dateFormat'
