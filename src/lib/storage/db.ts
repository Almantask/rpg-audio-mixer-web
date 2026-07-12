import Dexie, { type EntityTable } from 'dexie'
import type {
  Campaign,
  FxTrack,
  IntensityLevel,
  PlayStat,
  Scene,
  SceneEffect,
  SceneSoundscape,
  Session,
  SessionSceneLink,
  SoundscapeCategory,
  Track,
} from './types'
import './e2eState'

export type CampaignRecord = Campaign
export type SessionRecord = Session
export type SceneRecord = Scene

export const E2E_CAMPAIGN_ID = 'e2e-curse-of-strahd'
export const E2E_SESSION_ID = 'e2e-session-1'
export const E2E_SCENE_TAVERN_ID = 'e2e-scene-tavern'

class ArcanumDatabase extends Dexie {
  campaigns!: EntityTable<CampaignRecord, 'id'>
  sessions!: EntityTable<SessionRecord, 'id'>
  scenes!: EntityTable<SceneRecord, 'id'>
  sessionSceneLinks!: EntityTable<SessionSceneLink, 'id'>
  soundscapeCategories!: EntityTable<SoundscapeCategory, 'id'>
  intensityLevels!: EntityTable<IntensityLevel, 'id'>
  tracks!: EntityTable<Track, 'id'>
  fxTracks!: EntityTable<FxTrack, 'id'>
  sceneSoundscapes!: EntityTable<SceneSoundscape, 'id'>
  sceneEffects!: EntityTable<SceneEffect, 'id'>
  playStats!: EntityTable<PlayStat, 'id'>

  constructor() {
    super('arcanum-audio')
    this.version(1).stores({
      campaigns: 'id, name',
      sessions: 'id, campaignId, name',
      scenes: 'id, name',
    })
    this.version(2)
      .stores({
        campaigns: 'id, name, lastPlayedAt, deletedAt',
        sessions: 'id, campaignId, name, number, date, deletedAt, lastOpenedAt',
        scenes: 'id, name',
      })
      .upgrade(async (transaction) => {
        const now = Date.now()
        await transaction
          .table<CampaignRecord>('campaigns')
          .toCollection()
          .modify((campaign) => {
            campaign.lastPlayedAt ??= now
            campaign.createdAt ??= now
          })
        await transaction
          .table<SessionRecord>('sessions')
          .toCollection()
          .modify((session, ref) => {
            const index = ref.value?.number ?? 1
            session.number ??= index
            session.date ??= new Date().toISOString().slice(0, 10)
            session.sceneCount ??= 0
            session.createdAt ??= now
          })
      })
    this.version(3)
      .stores({
        campaigns: 'id, name, lastPlayedAt, deletedAt',
        sessions: 'id, campaignId, name, number, date, deletedAt, lastOpenedAt',
        scenes: 'id, name, deletedAt, createdAt',
        sessionSceneLinks: 'id, sessionId, sceneId, lastPlayedAt',
        soundscapeCategories: 'id, name, deletedAt, createdAt',
        intensityLevels: 'id, categoryId, level',
        tracks: 'id, name, createdAt',
        sceneSoundscapes: 'id, sceneId, categoryId',
        sceneEffects: 'id, sceneId, fxTrackId',
      })
      .upgrade(async (transaction) => {
        await transaction.table<SceneRecord>('scenes').toCollection().modify((scene) => {
          scene.tags ??= []
          scene.soundscapeCategoryCount ??= 0
          scene.effectCount ??= 0
          scene.createdAt ??= Date.now()
        })
      })
    this.version(4)
      .stores({
        campaigns: 'id, name, lastPlayedAt, deletedAt',
        sessions: 'id, campaignId, name, number, date, deletedAt, lastOpenedAt',
        scenes: 'id, name, deletedAt, createdAt',
        sessionSceneLinks: 'id, sessionId, sceneId, lastPlayedAt',
        soundscapeCategories: 'id, name, deletedAt, createdAt',
        intensityLevels: 'id, categoryId, level',
        tracks: 'id, name, createdAt',
        fxTracks: 'id, name, fxType, deletedAt, createdAt',
        sceneSoundscapes: 'id, sceneId, categoryId',
        sceneEffects: 'id, sceneId, fxTrackId',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<SceneSoundscape>('sceneSoundscapes')
          .toCollection()
          .modify((item) => {
            item.intensity ??= 2
          })
      })
    this.version(5)
      .stores({
        campaigns: 'id, name, lastPlayedAt, deletedAt',
        sessions: 'id, campaignId, name, number, date, deletedAt, lastOpenedAt',
        scenes: 'id, name, deletedAt, createdAt',
        sessionSceneLinks: 'id, sessionId, sceneId, lastPlayedAt',
        soundscapeCategories: 'id, name, deletedAt, createdAt',
        intensityLevels: 'id, categoryId, level',
        tracks: 'id, name, createdAt',
        fxTracks: 'id, name, fxType, deletedAt, createdAt',
        sceneSoundscapes: 'id, sceneId, categoryId',
        sceneEffects: 'id, sceneId, fxTrackId',
      })
      .upgrade(async (transaction) => {
        await transaction.table<SceneRecord>('scenes').toCollection().modify((scene) => {
          scene.masterVolume ??= 100
          scene.masterMuted ??= false
          scene.soundboardMaster ??= 100
          scene.sessionLocked ??= false
        })
      })
    this.version(6).stores({
      campaigns: 'id, name, lastPlayedAt, deletedAt',
      sessions: 'id, campaignId, name, number, date, deletedAt, lastOpenedAt',
      scenes: 'id, name, deletedAt, createdAt',
      sessionSceneLinks: 'id, sessionId, sceneId, lastPlayedAt',
      soundscapeCategories: 'id, name, deletedAt, createdAt',
      intensityLevels: 'id, categoryId, level',
      tracks: 'id, name, createdAt',
      fxTracks: 'id, name, fxType, deletedAt, createdAt',
      sceneSoundscapes: 'id, sceneId, categoryId',
      sceneEffects: 'id, sceneId, fxTrackId',
      playStats: 'id, entityType, entityId, playCount',
    })
    this.version(7).stores({
      campaigns: 'id, name, lastPlayedAt, deletedAt',
      sessions: 'id, campaignId, name, number, date, deletedAt, lastOpenedAt',
      scenes: 'id, name, deletedAt, createdAt',
      sessionSceneLinks: 'id, sessionId, sceneId, lastPlayedAt',
      soundscapeCategories: 'id, name, deletedAt, createdAt',
      intensityLevels: 'id, categoryId, level',
      tracks: 'id, name, createdAt',
      fxTracks: 'id, name, fxType, deletedAt, createdAt',
      sceneSoundscapes: 'id, sceneId, categoryId',
      sceneEffects: 'id, sceneId, fxTrackId',
      playStats: 'id, entityType, entityId, playCount',
    })
  }
}

export const db = new ArcanumDatabase()

export async function seedE2EFixtures(): Promise<void> {
  const now = Date.now()
  await db.campaigns.put({
    id: E2E_CAMPAIGN_ID,
    name: 'Curse of Strahd',
    lastPlayedAt: now,
    createdAt: now,
  })
  await db.sessions.put({
    id: E2E_SESSION_ID,
    campaignId: E2E_CAMPAIGN_ID,
    name: 'Session 1',
    number: 1,
    date: new Date().toISOString().slice(0, 10),
    sceneCount: 0,
    createdAt: now,
  })
  await db.scenes.put({
    id: E2E_SCENE_TAVERN_ID,
    name: 'Tavern',
    tags: [],
    soundscapeCategoryCount: 0,
    effectCount: 0,
    createdAt: now,
  })
}

export async function clearE2EFixtures(): Promise<void> {
  await db.campaigns.clear()
  await db.sessions.clear()
  await db.scenes.clear()
  await db.sessionSceneLinks.clear()
  await db.soundscapeCategories.clear()
  await db.intensityLevels.clear()
  await db.tracks.clear()
  await db.fxTracks.clear()
  await db.sceneSoundscapes.clear()
  await db.sceneEffects.clear()
  await db.playStats.clear()
}

export function getCampaignSessionsPath(campaignId: string): string {
  return `/campaigns/${campaignId}/sessions`
}

export function getSessionScenesPath(campaignId: string, sessionId: string): string {
  return `/campaigns/${campaignId}/sessions/${sessionId}/scenes`
}

export function getActiveScenePath(sceneId: string): string {
  return `/scenes/${sceneId}`
}

export function getCategoryComposerPath(categoryId: string): string {
  return `/library/soundscapes/${categoryId}/compose`
}

declare global {
  interface Window {
    __arcanumSeedE2E?: () => Promise<void>
    __arcanumClearE2E?: () => Promise<void>
    __arcanumIsPlaying?: () => boolean
    __arcanumCreateCampaign?: (input: {
      name: string
      description?: string
      coverArtUrl?: string
      lastPlayedAt?: number
      sessionCount?: number
    }) => Promise<string>
    __arcanumCreateSession?: (input: {
      campaignId: string
      name: string
      number?: number
      date?: string
      description?: string
      coverArtUrl?: string
      sceneCount?: number
      lastOpenedAt?: number
    }) => Promise<string>
    __arcanumGetCampaignIdByName?: (name: string) => Promise<string | undefined>
    __arcanumGetSessionIdByName?: (
      campaignId: string,
      sessionLabel: string,
    ) => Promise<string | undefined>
    __arcanumSetSessionLastOpened?: (sessionId: string, timestamp: number) => Promise<void>
    __arcanumCreateScene?: (input: {
      name: string
      description?: string
      coverArtUrl?: string
      tags?: string[]
      soundscapeCategoryCount?: number
      effectCount?: number
    }) => Promise<string>
    __arcanumGetSceneIdByName?: (name: string) => Promise<string | undefined>
    __arcanumGetSceneDescription?: (sceneId: string) => Promise<string | undefined>
    __arcanumLinkSceneToSession?: (sessionId: string, sceneId: string) => Promise<void>
    __arcanumSetSessionSceneLastPlayed?: (
      sessionId: string,
      sceneId: string,
      timestamp: number,
    ) => Promise<void>
    __arcanumCountSessionLinks?: (sceneId: string) => Promise<number>
    __arcanumCreateSoundscapeCategory?: (input: {
      name: string
      levelICount?: number
      levelIICount?: number
      levelIIICount?: number
    }) => Promise<string>
    __arcanumGetCategoryIdByName?: (name: string) => Promise<string | undefined>
    __arcanumCreateTrack?: (input: {
      name: string
      format?: string
      channel?: string
      duration?: string
      fileName?: string
    }) => Promise<string>
    __arcanumAttachTrackToLevel?: (
      categoryId: string,
      level: 1 | 2 | 3,
      trackId: string,
    ) => Promise<void>
    __arcanumAddSceneSoundscape?: (
      sceneId: string,
      categoryName: string,
      volume?: number,
    ) => Promise<void>
    __arcanumAddSceneEffect?: (sceneId: string, name: string, volume?: number, fxTrackId?: string) => Promise<void>
    __arcanumCreateFxTrack?: (input: {
      name: string
      duration?: string
      baseIntensity?: 1 | 2 | 3
      fxType?: string
      tags?: string[]
      fileName?: string
    }) => Promise<string>
    __arcanumGetFxTrackIdByName?: (name: string) => Promise<string | undefined>
    __arcanumSetCategoryType?: (categoryId: string, categoryType: string) => Promise<void>
    __arcanumCountScenes?: () => Promise<number>
    __arcanumSetPlayStat?: (
      entityType: 'soundscape' | 'fx',
      entityId: string,
      playCount: number,
    ) => Promise<void>
    __arcanumSetDefaultTrack?: (categoryId: string, trackId: string) => Promise<void>
    __arcanumSoftDeleteScene?: (sceneId: string) => Promise<void>
    __arcanumSoftDeleteFx?: (fxTrackId: string) => Promise<void>
    __arcanumSoftDeleteCategory?: (categoryId: string) => Promise<void>
    __arcanumSoftDeleteCampaignByName?: (name: string) => Promise<void>
    __arcanumSoftDeleteSessionByLabel?: (campaignId: string, label: string) => Promise<void>
    __arcanumSetSceneLoadedTrack?: (
      sceneId: string,
      categoryName: string,
      trackName: string,
    ) => Promise<void>
    __arcanumInvokeMediaSessionNext?: () => void
    __arcanumMediaSessionNextHandler?: () => void
  }
}

if (typeof window !== 'undefined') {
  window.__arcanumSeedE2E = seedE2EFixtures
  window.__arcanumClearE2E = clearE2EFixtures
  window.__arcanumIsPlaying = () => false

  window.__arcanumCreateCampaign = async (input) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.campaigns.put({
      id,
      name: input.name,
      description: input.description,
      coverArtUrl: input.coverArtUrl,
      lastPlayedAt: input.lastPlayedAt ?? now,
      createdAt: now,
    })
    const sessionCount = input.sessionCount ?? 0
    for (let index = 0; index < sessionCount; index += 1) {
      await db.sessions.put({
        id: crypto.randomUUID(),
        campaignId: id,
        name: `Session ${index + 1}`,
        number: index + 1,
        date: new Date(now - index * 86_400_000).toISOString().slice(0, 10),
        sceneCount: 0,
        createdAt: now,
      })
    }
    return id
  }

  window.__arcanumCreateSession = async (input) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.sessions.put({
      id,
      campaignId: input.campaignId,
      name: input.name,
      number: input.number ?? 1,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      description: input.description,
      coverArtUrl: input.coverArtUrl,
      sceneCount: input.sceneCount ?? 0,
      lastOpenedAt: input.lastOpenedAt,
      createdAt: now,
    })
    return id
  }

  window.__arcanumGetCampaignIdByName = async (name) => {
    const campaign = await db.campaigns.filter((item) => item.name === name && !item.deletedAt).first()
    return campaign?.id
  }

  window.__arcanumGetSessionIdByName = async (campaignId, sessionLabel) => {
    const number = Number.parseInt(sessionLabel.replace('Session ', ''), 10)
    const session = await db.sessions
      .where('campaignId')
      .equals(campaignId)
      .filter((item) => item.number === number && !item.deletedAt)
      .first()
    return session?.id
  }

  window.__arcanumSetSessionLastOpened = async (sessionId, timestamp) => {
    await db.sessions.update(sessionId, { lastOpenedAt: timestamp })
  }

  window.__arcanumCreateScene = async (input) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.scenes.put({
      id,
      name: input.name,
      description: input.description,
      coverArtUrl: input.coverArtUrl,
      tags: input.tags ?? [],
      soundscapeCategoryCount: input.soundscapeCategoryCount ?? 0,
      effectCount: input.effectCount ?? 0,
      createdAt: now,
    })
    return id
  }

  window.__arcanumGetSceneIdByName = async (name) => {
    const scene = await db.scenes.filter((item) => item.name === name && !item.deletedAt).first()
    return scene?.id
  }

  window.__arcanumGetSceneDescription = async (sceneId) => {
    const scene = await db.scenes.get(sceneId)
    return scene?.description
  }

  window.__arcanumLinkSceneToSession = async (sessionId, sceneId) => {
    const now = Date.now()
    await db.sessionSceneLinks.put({
      id: crypto.randomUUID(),
      sessionId,
      sceneId,
      createdAt: now,
    })
    const count = await db.sessionSceneLinks.where('sessionId').equals(sessionId).count()
    await db.sessions.update(sessionId, { sceneCount: count })
  }

  window.__arcanumSetSessionSceneLastPlayed = async (sessionId, sceneId, timestamp) => {
    const link = await db.sessionSceneLinks
      .where('sessionId')
      .equals(sessionId)
      .filter((item) => item.sceneId === sceneId)
      .first()
    if (link) {
      await db.sessionSceneLinks.update(link.id, { lastPlayedAt: timestamp })
    }
  }

  window.__arcanumCountSessionLinks = async (sceneId) => {
    return db.sessionSceneLinks.where('sceneId').equals(sceneId).count()
  }

  window.__arcanumCreateSoundscapeCategory = async (input) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.soundscapeCategories.put({ id, name: input.name, createdAt: now })
    const levels: IntensityLevel[] = [1, 2, 3].map((level) => ({
      id: crypto.randomUUID(),
      categoryId: id,
      level: level as 1 | 2 | 3,
      trackIds: [],
    }))
    await db.intensityLevels.bulkAdd(levels)
    return id
  }

  window.__arcanumGetCategoryIdByName = async (name) => {
    const category = await db.soundscapeCategories
      .filter((item) => item.name === name && !item.deletedAt)
      .first()
    return category?.id
  }

  window.__arcanumCreateTrack = async (input) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.tracks.put({
      id,
      name: input.name,
      format: input.format ?? 'MP3',
      channel: input.channel ?? 'Stereo',
      duration: input.duration ?? '0:00',
      fileName: input.fileName,
      createdAt: now,
    })
    return id
  }

  window.__arcanumAttachTrackToLevel = async (categoryId, level, trackId) => {
    const intensityLevel = await db.intensityLevels
      .where('categoryId')
      .equals(categoryId)
      .filter((item) => item.level === level)
      .first()
    if (!intensityLevel) return
    if (!intensityLevel.trackIds.includes(trackId)) {
      await db.intensityLevels.update(intensityLevel.id, {
        trackIds: [...intensityLevel.trackIds, trackId],
      })
    }
  }

  window.__arcanumAddSceneSoundscape = async (sceneId, categoryName, volume = 100) => {
    const category = await db.soundscapeCategories
      .filter((item) => item.name === categoryName && !item.deletedAt)
      .first()
    const categoryId = category?.id ?? crypto.randomUUID()
    if (!category) {
      await db.soundscapeCategories.put({
        id: categoryId,
        name: categoryName,
        createdAt: Date.now(),
      })
    }
    const count = await db.sceneSoundscapes.where('sceneId').equals(sceneId).count()
    await db.sceneSoundscapes.put({
      id: crypto.randomUUID(),
      sceneId,
      categoryId,
      categoryName,
      volume,
      intensity: 2,
      sortOrder: count,
    })
    await db.scenes.update(sceneId, { soundscapeCategoryCount: count + 1 })
  }

  window.__arcanumAddSceneEffect = async (sceneId, name, volume = 100, fxTrackId) => {
    const count = await db.sceneEffects.where('sceneId').equals(sceneId).count()
    await db.sceneEffects.put({
      id: crypto.randomUUID(),
      sceneId,
      fxTrackId,
      name,
      volume,
      sortOrder: count,
    })
    await db.scenes.update(sceneId, { effectCount: count + 1 })
  }

  window.__arcanumCreateFxTrack = async (input) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.fxTracks.put({
      id,
      name: input.name,
      duration: input.duration ?? '0:00',
      baseIntensity: input.baseIntensity ?? 2,
      fxType: (input.fxType ?? 'IMPACT') as import('./types').FxType,
      tags: input.tags ?? [],
      defaultVolume: 100,
      fileName: input.fileName,
      createdAt: now,
    })
    return id
  }

  window.__arcanumGetFxTrackIdByName = async (name) => {
    const track = await db.fxTracks.filter((item) => item.name === name && !item.deletedAt).first()
    return track?.id
  }

  window.__arcanumSetCategoryType = async (categoryId, categoryType) => {
    await db.soundscapeCategories.update(categoryId, { categoryType })
  }

  window.__arcanumCountScenes = async () => {
    return db.scenes.filter((scene) => !scene.deletedAt).count()
  }

  window.__arcanumSetPlayStat = async (entityType, entityId, playCount) => {
    const id = `${entityType}:${entityId}`
    await db.playStats.put({ id, entityType, entityId, playCount })
  }

  window.__arcanumSetDefaultTrack = async (categoryId, trackId) => {
    await db.soundscapeCategories.update(categoryId, { defaultTrackId: trackId })
  }

  window.__arcanumSoftDeleteScene = async (sceneId) => {
    await db.scenes.update(sceneId, { deletedAt: Date.now() })
  }

  window.__arcanumSoftDeleteFx = async (fxTrackId) => {
    await db.fxTracks.update(fxTrackId, { deletedAt: Date.now() })
  }

  window.__arcanumSoftDeleteCategory = async (categoryId) => {
    await db.soundscapeCategories.update(categoryId, { deletedAt: Date.now() })
  }

  window.__arcanumSoftDeleteCampaignByName = async (name) => {
    const campaign = await db.campaigns.filter((item) => item.name === name && !item.deletedAt).first()
    if (!campaign) return
    const deletedAt = Date.now()
    await db.campaigns.update(campaign.id, { deletedAt })
    await db.sessions.where('campaignId').equals(campaign.id).modify({ deletedAt })
  }

  window.__arcanumSoftDeleteSessionByLabel = async (campaignId, label) => {
    const number = Number.parseInt(label.replace('Session ', ''), 10)
    const session = await db.sessions
      .where('campaignId')
      .equals(campaignId)
      .filter((item) => item.number === number)
      .first()
    if (session) {
      await db.sessions.update(session.id, { deletedAt: Date.now() })
    }
  }

  window.__arcanumSetSceneLoadedTrack = async (sceneId, categoryName, trackName) => {
    const link = await db.sceneSoundscapes
      .where('sceneId')
      .equals(sceneId)
      .filter((item) => item.categoryName === categoryName)
      .first()
    const track = await db.tracks.filter((item) => item.name === trackName).first()
    if (link && track) {
      await db.sceneSoundscapes.update(link.id, {
        loadedTrackId: track.id,
        loadedTrackName: track.name,
      })
    }
  }

  window.__arcanumInvokeMediaSessionNext = () => {
    window.__arcanumMediaSessionNextHandler?.()
  }
}
