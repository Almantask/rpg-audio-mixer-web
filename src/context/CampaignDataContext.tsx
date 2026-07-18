import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from 'react'

import type { AppData, BulkTrashResult, Campaign, E2EControls, Session, TrashTab } from '@/types/campaign'

import { DEFAULT_E2E_CONTROLS, EMPTY_APP_DATA } from '@/types/campaign'

import type { FxTrack, FxType, SoundscapeCategory, SoundscapeTrack } from '@/types/library'

import type {
  Scene,
  SceneSoundboardEntry,
  SceneSoundboardSettings,
  SceneSoundscapeSettings,
  SceneSoundscapeSlot,
} from '@/types/scene'

import {

  createId,

  getActiveCampaigns,

  getActiveSessions,

  getNextSessionNumber,

  loadAppData,

  loadE2EControls,

  resetAppData,

  saveAppData,

  saveE2EControls,

} from '@/lib/campaignStorage'

import { getActiveFxTracks } from '@/lib/libraryStorage'

import { ensureBundledAppSeed } from '@/lib/ensureBundledAppSeed'
import { readAudioDurationSeconds } from '@/lib/readAudioDuration'
import { createBundledFxTracks } from '@/lib/seedBundledFx'
import { createBundledSoundscapeLibrary } from '@/lib/seedBundledSoundscapes'

import {

  dedupeSoundboardEntries,

  getActiveScenes,

  getLinkedSessionCount,

  getSessionSceneLinksForSession,

  sortSessionScenes,

} from '@/lib/sceneStorage'

import { formatTodayIso } from '@/lib/dateFormat'
import { getTopFxTrack, getTopSoundscapeCategory, incrementFxPlayCount, incrementSoundscapePlayCount } from '@/lib/playStats'
import { resolveRestoredName } from '@/lib/trashStorage'



interface CreateCampaignInput {

  name: string

  description?: string

  coverArtUrl?: string

}



interface UpdateCampaignInput {

  name: string

  description?: string

  coverArtUrl?: string

}



interface CreateSessionInput {

  campaignId: string

  name: string

  date: string

  description?: string

  coverArtUrl?: string

}



interface UpdateSessionInput {

  name: string

  date: string

  description?: string

  coverArtUrl?: string

}



interface CreateSceneInput {

  name: string

  description?: string

  coverArtUrl?: string

  tags?: string[]

}



interface UpdateSceneInput {

  name: string

  description?: string

  coverArtUrl?: string

  tags?: string[]

}



interface UpdateFxInput {

  name: string

  tags: string[]

}



interface CampaignDataContextValue {

  data: AppData

  e2e: E2EControls

  activeCampaigns: Campaign[]

  activeScenes: Scene[]

  activeFxTracks: FxTrack[]

  activeSoundscapeTracks: SoundscapeTrack[]

  reload: () => void

  getCampaign: (id: string) => Campaign | undefined

  getCampaignSessions: (campaignId: string) => Session[]

  getSessionCount: (campaignId: string) => number

  createCampaign: (input: CreateCampaignInput) => Campaign

  updateCampaign: (id: string, input: UpdateCampaignInput) => Campaign

  softDeleteCampaign: (id: string) => void

  restoreCampaign: (id: string) => void

  purgeCampaign: (id: string) => void

  markCampaignPlayed: (id: string) => void

  createSession: (input: CreateSessionInput) => Session

  updateSession: (sessionId: string, input: UpdateSessionInput) => Session

  softDeleteSession: (sessionId: string) => void
  restoreSession: (sessionId: string) => void
  purgeSession: (sessionId: string) => void

  markSessionOpened: (campaignId: string, sessionId: string) => void

  getLastActiveSessionId: (campaignId: string) => string | undefined

  getScene: (id: string) => Scene | undefined

  getFxTrack: (id: string) => FxTrack | undefined

  createScene: (input: CreateSceneInput) => Scene

  updateScene: (sceneId: string, input: UpdateSceneInput) => Scene

  duplicateScene: (sceneId: string) => Scene

  softDeleteScene: (sceneId: string) => void

  restoreScene: (sceneId: string) => void

  purgeScene: (sceneId: string) => void

  getLinkedSessionCountForScene: (sceneId: string) => number

  linkScenesToSession: (sessionId: string, sceneIds: string[]) => void

  unlinkSceneFromSession: (sessionId: string, sceneId: string) => void

  getSessionScenes: (sessionId: string) => Scene[]

  role?: string // to prevent interface matching issues if any

  markScenePlayed: (sessionId: string, sceneId: string) => void

  createSoundscapeSlot: (sceneId: string, categoryId: string) => SceneSoundscapeSlot

  addSoundscapesToScene: (sceneId: string, categoryIds: string[]) => SceneSoundscapeSlot[]

  removeSoundscapeSlot: (slotId: string) => void

  addFxToSoundboard: (sceneId: string, fxTrackIds: string[]) => SceneSoundboardEntry[]

  removeSoundboardEntry: (entryId: string) => void

  getSoundboardEntries: (sceneId: string) => SceneSoundboardEntry[]

  updateSoundscapeSlot: (slotId: string, input: Partial<SceneSoundscapeSlot>) => void

  updateSoundscapeSettings: (
    sceneId: string,
    input: Partial<Pick<SceneSoundscapeSettings, 'masterVolume' | 'muted'>>,
  ) => void

  updateSoundboardSettings: (
    sceneId: string,
    input: Partial<Pick<SceneSoundboardSettings, 'masterVolume'>>,
  ) => void

  reorderSoundscapeSlots: (sceneId: string, orderedSlotIds: string[]) => void

  reorderSoundboardEntries: (sceneId: string, orderedEntryIds: string[]) => void

  getSoundscapeSettings: (sceneId: string) => SceneSoundscapeSettings

  importFx: (file: File) => FxTrack

  updateFx: (fxId: string, input: UpdateFxInput) => FxTrack

  softDeleteFx: (fxId: string) => void

  restoreFx: (fxId: string) => void

  purgeFx: (fxId: string) => void

  restoreFxItems: (ids: string[]) => BulkTrashResult

  purgeFxItems: (ids: string[]) => BulkTrashResult

  restoreTrashItems: (tab: TrashTab, ids: string[]) => BulkTrashResult

  purgeTrashItems: (tab: TrashTab, ids: string[]) => BulkTrashResult

  downloadFreeTracks: () => number

  createSoundscapeCategory: (name: string) => SoundscapeCategory

  updateSoundscapeCategory: (id: string, input: Partial<SoundscapeCategory>) => SoundscapeCategory

  softDeleteSoundscapeCategory: (id: string) => void

  restoreSoundscapeCategory: (id: string) => void

  purgeSoundscapeCategory: (id: string) => void

  importSoundscapeTrack: (file: File) => SoundscapeTrack

  downloadFreeCompositions: () => number

  seedData: (partial: Partial<AppData>) => void

  resetAll: () => void

  setE2EControls: (controls: Partial<E2EControls>) => void

  recordSoundscapePlay: (categoryId: string) => void

  recordFxPlay: (fxTrackId: string) => void

  getTopSoundscapeStat: () => ReturnType<typeof getTopSoundscapeCategory>

  getTopFxStat: () => ReturnType<typeof getTopFxTrack>

}




const CampaignDataContext = createContext<CampaignDataContextValue | null>(null)



function persist(next: AppData) {

  saveAppData(next)

}



function syncSessionSceneCounts(sessions: Session[], links: AppData['sessionSceneLinks']): Session[] {

  const counts = new Map<string, number>()

  for (const link of links) {

    counts.set(link.sessionId, (counts.get(link.sessionId) ?? 0) + 1)

  }

  return sessions.map((session) => ({

    ...session,

    sceneCount: counts.get(session.id) ?? 0,

  }))

}



function inferFxType(name: string): FxType {

  const lower = name.toLowerCase()

  if (lower.includes('sword') || lower.includes('combat') || lower.includes('battle')) {

    return 'COMBAT'

  }

  if (lower.includes('dragon') || lower.includes('wolf') || lower.includes('dog')) {

    return 'CREATURE'

  }

  if (lower.includes('thunder') || lower.includes('impact')) {

    return 'IMPACT'

  }

  return 'OTHER'

}



export function CampaignDataProvider({ children }: { children: ReactNode }) {

  const [data, setData] = useState<AppData>(() => {
    const loaded = loadAppData()
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('arcanum-e2e-controls') !== null) {
      return loaded
    }
    if (import.meta.env.MODE === 'test') {
      return loaded
    }
    try {
      const next = ensureBundledAppSeed(loaded)
      if (!next) {
        return loaded
      }
      const synced = {
        ...next,
        sessions: syncSessionSceneCounts(next.sessions, next.sessionSceneLinks),
      }
      persist(synced)
      return synced
    } catch (error) {
      console.error('Failed to seed bundled demo data', error)
      return loaded
    }
  })

  const [e2e, setE2e] = useState<E2EControls>(() => loadE2EControls())



  useEffect(() => {
    const isE2E = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('arcanum-e2e-controls') !== null
    if (isE2E || import.meta.env.MODE === 'test') return

    setData((current) => {
      try {
        const next = ensureBundledAppSeed(current)
        if (!next) {
          return current
        }
        const synced = {
          ...next,
          sessions: syncSessionSceneCounts(next.sessions, next.sessionSceneLinks),
        }
        persist(synced)
        return synced
      } catch (error) {
        console.error('Failed to seed bundled demo data', error)
        return current
      }
    })
  }, [])




  const reload = useCallback(() => {

    setData(loadAppData())

  }, [])



  const updateData = useCallback((updater: (current: AppData) => AppData) => {

    setData((current) => {

      const next = updater(current)

      persist(next)

      return next

    })

  }, [])



  const activeCampaigns = useMemo(() => getActiveCampaigns(data.campaigns), [data.campaigns])

  const activeScenes = useMemo(() => getActiveScenes(data.scenes), [data.scenes])

  const activeFxTracks = useMemo(() => getActiveFxTracks(data.fxTracks), [data.fxTracks])

  const activeSoundscapeTracks = useMemo(
    () => (data.soundscapeTracks ?? []).filter((track) => !track.deletedAt),
    [data.soundscapeTracks],
  )




  const getCampaign = useCallback(

    (id: string) => data.campaigns.find((c) => c.id === id && !c.deletedAt),

    [data.campaigns],

  )



  const getCampaignSessions = useCallback(

    (campaignId: string) => getActiveSessions(campaignId, data.sessions, data.campaigns),

    [data.campaigns, data.sessions],

  )



  const getSessionCountForCampaign = useCallback(

    (campaignId: string) =>

      data.sessions.filter((s) => s.campaignId === campaignId && !s.deletedAt).length,

    [data.sessions],

  )



  const getScene = useCallback(

    (id: string) => data.scenes.find((scene) => scene.id === id && !scene.deletedAt),

    [data.scenes],

  )



  const getFxTrack = useCallback(

    (id: string) => data.fxTracks.find((track) => track.id === id && !track.deletedAt),

    [data.fxTracks],

  )



  const createCampaign = useCallback(

    (input: CreateCampaignInput): Campaign => {

      const now = new Date().toISOString()

      const campaign: Campaign = {

        id: createId('campaign'),

        name: input.name.trim(),

        description: input.description?.trim() || undefined,

        coverArtUrl: input.coverArtUrl,

        createdAt: now,

        lastPlayedAt: now,

      }



      updateData((current) => ({

        ...current,

        campaigns: [...current.campaigns, campaign],

      }))



      return campaign

    },

    [updateData],

  )



  const updateCampaign = useCallback(

    (id: string, input: UpdateCampaignInput): Campaign => {

      let updated!: Campaign

      updateData((current) => ({

        ...current,

        campaigns: current.campaigns.map((campaign) => {

          if (campaign.id !== id) {

            return campaign

          }

          updated = {

            ...campaign,

            name: input.name.trim(),

            description: input.description?.trim() || undefined,

            coverArtUrl: input.coverArtUrl ?? campaign.coverArtUrl,

          }

          return updated

        }),

      }))

      return updated

    },

    [updateData],

  )



  const softDeleteCampaign = useCallback(

    (id: string) => {

      const now = new Date().toISOString()

      updateData((current) => ({

        ...current,

        campaigns: current.campaigns.map((c) =>

          c.id === id ? { ...c, deletedAt: now } : c,

        ),

      }))

    },

    [updateData],

  )



  const restoreCampaign = useCallback(

    (id: string) => {

      updateData((current) => {

        const campaign = current.campaigns.find((c) => c.id === id)

        if (!campaign) {

          return current

        }

        const activeNames = getActiveCampaigns(current.campaigns).map((c) => c.name)

        const resolvedName = resolveRestoredName(campaign.name, activeNames)

        return {

          ...current,

          campaigns: current.campaigns.map((c) =>

            c.id === id ? { ...c, deletedAt: undefined, name: resolvedName } : c,

          ),

          sessions: current.sessions.map((s) =>

            s.campaignId === id && s.deletedAt

              ? { ...s, deletedAt: undefined }

              : s,

          ),

        }

      })

    },

    [updateData],

  )



  const purgeCampaign = useCallback(

    (id: string) => {

      updateData((current) => {

        const nextLastActive = { ...current.lastActiveSessionByCampaign }

        delete nextLastActive[id]

        return {

          ...current,

          campaigns: current.campaigns.filter((c) => c.id !== id),

          lastActiveSessionByCampaign: nextLastActive,

        }

      })

    },

    [updateData],

  )



  const markCampaignPlayed = useCallback(

    (id: string) => {

      const now = new Date().toISOString()

      updateData((current) => ({

        ...current,

        campaigns: current.campaigns.map((c) =>

          c.id === id ? { ...c, lastPlayedAt: now } : c,

        ),

      }))

    },

    [updateData],

  )



  const createSession = useCallback(

    (input: CreateSessionInput): Session => {

      if (e2e.createSessionFails) {

        throw new Error('Session creation failed')

      }



      const number = getNextSessionNumber(input.campaignId, data.sessions)

      const session: Session = {

        id: createId('session'),

        campaignId: input.campaignId,

        name: input.name.trim(),

        number,

        date: input.date,

        description: input.description?.trim() || undefined,

        coverArtUrl: input.coverArtUrl,

        sceneCount: 0,

      }



      updateData((current) => ({

        ...current,

        sessions: [...current.sessions, session],

      }))



      return session

    },

    [data.sessions, e2e.createSessionFails, updateData],

  )



  const updateSession = useCallback(

    (sessionId: string, input: UpdateSessionInput): Session => {

      if (e2e.saveSessionFails) {

        throw new Error('Session save failed')

      }



      let updated!: Session

      updateData((current) => ({

        ...current,

        sessions: current.sessions.map((s) => {

          if (s.id !== sessionId) {

            return s

          }

          updated = {

            ...s,

            name: input.name.trim(),

            date: input.date,

            description: input.description?.trim() || undefined,

            coverArtUrl: input.coverArtUrl ?? s.coverArtUrl,

          }

          return updated

        }),

      }))



      return updated

    },

    [e2e.saveSessionFails, updateData],

  )



  const softDeleteSession = useCallback(
    (sessionId: string) => {
      const now = new Date().toISOString()
      updateData((current) => ({
        ...current,
        sessions: current.sessions.map((s) =>
          s.id === sessionId ? { ...s, deletedAt: now } : s,
        ),
      }))
    },
    [updateData],
  )

  const restoreSession = useCallback(
    (sessionId: string) => {
      updateData((current) => {
        const session = current.sessions.find((s) => s.id === sessionId)
        if (!session) {
          return current
        }
        const activeNames = current.sessions
          .filter((s) => s.campaignId === session.campaignId && !s.deletedAt && s.id !== sessionId)
          .map((s) => s.name)
        const resolvedName = resolveRestoredName(session.name, activeNames)
        return {
          ...current,
          sessions: current.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, deletedAt: undefined, name: resolvedName }
              : s,
          ),
        }
      })
    },
    [updateData],
  )

  const purgeSession = useCallback(
    (sessionId: string) => {
      updateData((current) => {
        const session = current.sessions.find((s) => s.id === sessionId)
        const nextLastActive = { ...current.lastActiveSessionByCampaign }
        if (session) {
          delete nextLastActive[session.campaignId]
        }
        const nextSceneLastActive = { ...current.lastActiveSceneBySession }
        delete nextSceneLastActive[sessionId]
        const nextLinks = current.sessionSceneLinks.filter((link) => link.sessionId !== sessionId)
        const nextSessions = current.sessions.filter((s) => s.id !== sessionId)
        return {
          ...current,
          sessions: syncSessionSceneCounts(nextSessions, nextLinks),
          sessionSceneLinks: nextLinks,
          lastActiveSessionByCampaign: nextLastActive,
          lastActiveSceneBySession: nextSceneLastActive,
        }
      })
    },
    [updateData],
  )



  const markSessionOpened = useCallback(

    (campaignId: string, sessionId: string) => {

      const now = new Date().toISOString()

      updateData((current) => ({

        ...current,

        sessions: current.sessions.map((s) =>

          s.id === sessionId ? { ...s, lastOpenedAt: now } : s,

        ),

        lastActiveSessionByCampaign: {

          ...current.lastActiveSessionByCampaign,

          [campaignId]: sessionId,

        },

      }))

    },

    [updateData],

  )



  const getLastActiveSessionId = useCallback(

    (campaignId: string) => data.lastActiveSessionByCampaign[campaignId],

    [data.lastActiveSessionByCampaign],

  )



  const createScene = useCallback(

    (input: CreateSceneInput): Scene => {

      const now = new Date().toISOString()

      const scene: Scene = {

        id: createId('scene'),

        name: input.name.trim(),

        description: input.description?.trim() || undefined,

        coverArtUrl: input.coverArtUrl,

        tags: input.tags ?? [],

        createdAt: now,

        lastUsedAt: now,

      }



      updateData((current) => ({

        ...current,

        scenes: [...current.scenes, scene],

        sceneSoundboardSettings: [

          ...current.sceneSoundboardSettings,

          { sceneId: scene.id, masterVolume: 85 },

        ],

        sceneSoundscapeSettings: [

          ...current.sceneSoundscapeSettings,

          { sceneId: scene.id, masterVolume: 100, muted: false },

        ],

      }))



      return scene

    },

    [updateData],

  )



  const updateScene = useCallback(

    (sceneId: string, input: UpdateSceneInput): Scene => {

      let updated!: Scene

      updateData((current) => ({

        ...current,

        scenes: current.scenes.map((scene) => {

          if (scene.id !== sceneId) {

            return scene

          }

          updated = {

            ...scene,

            name: input.name.trim(),

            description: input.description?.trim() || undefined,

            coverArtUrl: input.coverArtUrl ?? scene.coverArtUrl,

            tags: input.tags ?? scene.tags,

          }

          return updated

        }),

      }))

      return updated

    },

    [updateData],

  )



  const duplicateScene = useCallback(

    (sceneId: string): Scene => {

      const source = data.scenes.find((scene) => scene.id === sceneId && !scene.deletedAt)

      if (!source) {

        throw new Error('Scene not found')

      }



      const now = new Date().toISOString()

      const duplicate: Scene = {

        ...source,

        id: createId('scene'),

        name: `Copy of ${source.name}`,

        createdAt: now,

        lastUsedAt: now,

        deletedAt: undefined,

      }



      const sourceEntries = data.sceneSoundboardEntries.filter((entry) => entry.sceneId === sceneId)

      const sourceSlots = data.sceneSoundscapeSlots.filter((slot) => slot.sceneId === sceneId)

      const sourceSettings = data.sceneSoundboardSettings.find(

        (settings) => settings.sceneId === sceneId,

      )

      const sourceSoundscapeSettings = data.sceneSoundscapeSettings.find(

        (settings) => settings.sceneId === sceneId,

      )



      updateData((current) => ({

        ...current,

        scenes: [...current.scenes, duplicate],

        sceneSoundboardEntries: [

          ...current.sceneSoundboardEntries,

          ...sourceEntries.map((entry) => ({

            ...entry,

            id: createId('soundboard-entry'),

            sceneId: duplicate.id,

          })),

        ],

        sceneSoundscapeSlots: [

          ...current.sceneSoundscapeSlots,

          ...sourceSlots.map((slot) => ({

            ...slot,

            id: createId('soundscape-slot'),

            sceneId: duplicate.id,

          })),

        ],

        sceneSoundboardSettings: [

          ...current.sceneSoundboardSettings,

          {

            sceneId: duplicate.id,

            masterVolume: sourceSettings?.masterVolume ?? 85,

          },

        ],

        sceneSoundscapeSettings: [

          ...current.sceneSoundscapeSettings,

          {

            sceneId: duplicate.id,

            masterVolume: sourceSoundscapeSettings?.masterVolume ?? 100,

            muted: sourceSoundscapeSettings?.muted ?? false,

          },

        ],

      }))



      return duplicate

    },

    [data.sceneSoundboardEntries, data.sceneSoundboardSettings, data.sceneSoundscapeSettings, data.sceneSoundscapeSlots, data.scenes, updateData],

  )



  const softDeleteScene = useCallback(

    (sceneId: string) => {

      const now = new Date().toISOString()

      updateData((current) => {

        const nextLinks = current.sessionSceneLinks.filter((link) => link.sceneId !== sceneId)

        return {

          ...current,

          scenes: current.scenes.map((scene) =>

            scene.id === sceneId ? { ...scene, deletedAt: now } : scene,

          ),

          sessionSceneLinks: nextLinks,

          sessions: syncSessionSceneCounts(current.sessions, nextLinks),

        }

      })

    },

    [updateData],

  )



  const restoreScene = useCallback(

    (sceneId: string) => {

      updateData((current) => {

        const scene = current.scenes.find((s) => s.id === sceneId)

        if (!scene) {

          return current

        }

        const activeNames = getActiveScenes(current.scenes).map((s) => s.name)

        const resolvedName = resolveRestoredName(scene.name, activeNames)

        return {

          ...current,

          scenes: current.scenes.map((item) =>

            item.id === sceneId ? { ...item, deletedAt: undefined, name: resolvedName } : item,

          ),

        }

      })

    },

    [updateData],

  )



  const purgeScene = useCallback(

    (sceneId: string) => {

      updateData((current) => {

        const nextLinks = current.sessionSceneLinks.filter((link) => link.sceneId !== sceneId)

        const nextLastActive = { ...current.lastActiveSceneBySession }

        for (const [sessionId, activeSceneId] of Object.entries(nextLastActive)) {

          if (activeSceneId === sceneId) {

            delete nextLastActive[sessionId]

          }

        }

        return {

          ...current,

          scenes: current.scenes.filter((scene) => scene.id !== sceneId),

          sessionSceneLinks: nextLinks,

          sessions: syncSessionSceneCounts(current.sessions, nextLinks),

          sceneSoundboardEntries: current.sceneSoundboardEntries.filter(

            (entry) => entry.sceneId !== sceneId,

          ),

          sceneSoundscapeSlots: current.sceneSoundscapeSlots.filter(

            (slot) => slot.sceneId !== sceneId,

          ),

          sceneSoundboardSettings: current.sceneSoundboardSettings.filter(

            (settings) => settings.sceneId !== sceneId,

          ),

          sceneSoundscapeSettings: current.sceneSoundscapeSettings.filter(

            (settings) => settings.sceneId !== sceneId,

          ),

          lastActiveSceneBySession: nextLastActive,

        }

      })

    },

    [updateData],

  )



  const getLinkedSessionCountForScene = useCallback(

    (sceneId: string) => getLinkedSessionCount(sceneId, data.sessionSceneLinks),

    [data.sessionSceneLinks],

  )



  const linkScenesToSession = useCallback(

    (sessionId: string, sceneIds: string[]) => {

      const now = new Date().toISOString()

      updateData((current) => {

        const existing = new Set(

          getSessionSceneLinksForSession(sessionId, current.sessionSceneLinks).map(

            (link) => link.sceneId,

          ),

        )

        const newLinks = sceneIds

          .filter((sceneId) => !existing.has(sceneId))

          .map((sceneId) => ({

            id: createId('session-scene-link'),

            sessionId,

            sceneId,

            linkedAt: now,

          }))

        const nextLinks = [...current.sessionSceneLinks, ...newLinks]

        return {

          ...current,

          sessionSceneLinks: nextLinks,

          sessions: syncSessionSceneCounts(current.sessions, nextLinks),

        }

      })

    },

    [updateData],

  )



  const unlinkSceneFromSession = useCallback(

    (sessionId: string, sceneId: string) => {

      updateData((current) => {

        const nextLinks = current.sessionSceneLinks.filter(

          (link) => !(link.sessionId === sessionId && link.sceneId === sceneId),

        )

        const nextLastActive = { ...current.lastActiveSceneBySession }

        if (nextLastActive[sessionId] === sceneId) {

          delete nextLastActive[sessionId]

        }

        return {

          ...current,

          sessionSceneLinks: nextLinks,

          sessions: syncSessionSceneCounts(current.sessions, nextLinks),

          lastActiveSceneBySession: nextLastActive,

        }

      })

    },

    [updateData],

  )



  const getSessionScenes = useCallback(

    (sessionId: string) => {

      const linkedSceneIds = new Set(

        getSessionSceneLinksForSession(sessionId, data.sessionSceneLinks).map(

          (link) => link.sceneId,

        ),

      )

      const scenes = getActiveScenes(data.scenes).filter((scene) => linkedSceneIds.has(scene.id))

      return sortSessionScenes(

        scenes,

        sessionId,

        data.sessionSceneLinks,

        data.lastActiveSceneBySession[sessionId],

      )

    },

    [data.lastActiveSceneBySession, data.scenes, data.sessionSceneLinks],

  )



  const markScenePlayed = useCallback(

    (sessionId: string, sceneId: string) => {

      const now = new Date().toISOString()

      updateData((current) => ({

        ...current,

        scenes: current.scenes.map((scene) =>

          scene.id === sceneId ? { ...scene, lastUsedAt: now } : scene,

        ),

        sessionSceneLinks: current.sessionSceneLinks.map((link) =>

          link.sessionId === sessionId && link.sceneId === sceneId

            ? { ...link, lastPlayedAt: now }

            : link,

        ),

        lastActiveSceneBySession: {

          ...current.lastActiveSceneBySession,

          [sessionId]: sceneId,

        },

      }))

    },

    [updateData],

  )



  const createSoundscapeSlot = useCallback(

    (sceneId: string, categoryId: string): SceneSoundscapeSlot => {

      const existing = data.sceneSoundscapeSlots.filter((slot) => slot.sceneId === sceneId)

      const slot: SceneSoundscapeSlot = {

        id: createId('soundscape-slot'),

        sceneId,

        categoryId,

        order: existing.length,

        volume: 100,

        intensity: 'II',

      }

      updateData((current) => ({

        ...current,

        sceneSoundscapeSlots: [...current.sceneSoundscapeSlots, slot],

      }))

      return slot

    },

    [data.sceneSoundscapeSlots, updateData],

  )



  const addSoundscapesToScene = useCallback(

    (sceneId: string, categoryIds: string[]): SceneSoundscapeSlot[] => {

      const existing = data.sceneSoundscapeSlots.filter((slot) => slot.sceneId === sceneId)

      let order = existing.length

      const newSlots: SceneSoundscapeSlot[] = categoryIds.map((categoryId) => ({

        id: createId('soundscape-slot'),

        sceneId,

        categoryId,

        order: order++,

        volume: 100,

        intensity: 'II',

      }))

      updateData((current) => ({

        ...current,

        sceneSoundscapeSlots: [...current.sceneSoundscapeSlots, ...newSlots],

      }))

      return newSlots

    },

    [data.sceneSoundscapeSlots, updateData],

  )



  const removeSoundscapeSlot = useCallback(

    (slotId: string) => {

      updateData((current) => ({

        ...current,

        sceneSoundscapeSlots: current.sceneSoundscapeSlots.filter((slot) => slot.id !== slotId),

      }))

    },

    [updateData],

  )



  const getSoundboardEntries = useCallback(

    (sceneId: string) =>

      dedupeSoundboardEntries(data.sceneSoundboardEntries)

        .filter((entry) => entry.sceneId === sceneId)

        .sort((a, b) => a.order - b.order),

    [data.sceneSoundboardEntries],

  )



  const updateSoundscapeSlot = useCallback(

    (slotId: string, input: Partial<SceneSoundscapeSlot>) => {

      updateData((current) => ({

        ...current,

        sceneSoundscapeSlots: current.sceneSoundscapeSlots.map((slot) =>

          slot.id === slotId ? { ...slot, ...input } : slot,

        ),

      }))

    },

    [updateData],

  )



  const updateSoundscapeSettings = useCallback(

    (

      sceneId: string,

      input: Partial<Pick<SceneSoundscapeSettings, 'masterVolume' | 'muted'>>,

    ) => {

      updateData((current) => {

        const existing = current.sceneSoundscapeSettings.find((item) => item.sceneId === sceneId)

        if (existing) {

          return {

            ...current,

            sceneSoundscapeSettings: current.sceneSoundscapeSettings.map((item) =>

              item.sceneId === sceneId ? { ...item, ...input } : item,

            ),

          }

        }

        return {

          ...current,

          sceneSoundscapeSettings: [

            ...current.sceneSoundscapeSettings,

            { sceneId, masterVolume: 100, muted: false, ...input },

          ],

        }

      })

    },

    [updateData],

  )



  const updateSoundboardSettings = useCallback(

    (sceneId: string, input: Partial<Pick<SceneSoundboardSettings, 'masterVolume'>>) => {

      updateData((current) => {

        const existing = current.sceneSoundboardSettings.find((item) => item.sceneId === sceneId)

        if (existing) {

          return {

            ...current,

            sceneSoundboardSettings: current.sceneSoundboardSettings.map((item) =>

              item.sceneId === sceneId ? { ...item, ...input } : item,

            ),

          }

        }

        return {

          ...current,

          sceneSoundboardSettings: [

            ...current.sceneSoundboardSettings,

            { sceneId, masterVolume: 85, ...input },

          ],

        }

      })

    },

    [updateData],

  )



  const reorderSoundscapeSlots = useCallback(

    (sceneId: string, orderedSlotIds: string[]) => {

      updateData((current) => {

        const orderMap = new Map(orderedSlotIds.map((id, index) => [id, index]))

        return {

          ...current,

          sceneSoundscapeSlots: current.sceneSoundscapeSlots.map((slot) => {

            if (slot.sceneId !== sceneId) {

              return slot

            }

            const order = orderMap.get(slot.id)

            return order === undefined ? slot : { ...slot, order }

          }),

        }

      })

    },

    [updateData],

  )



  const reorderSoundboardEntries = useCallback(

    (sceneId: string, orderedEntryIds: string[]) => {

      updateData((current) => {

        const orderMap = new Map(orderedEntryIds.map((id, index) => [id, index]))

        return {

          ...current,

          sceneSoundboardEntries: current.sceneSoundboardEntries.map((entry) => {

            if (entry.sceneId !== sceneId) {

              return entry

            }

            const order = orderMap.get(entry.id)

            return order === undefined ? entry : { ...entry, order }

          }),

        }

      })

    },

    [updateData],

  )



  const getSoundscapeSettings = useCallback(

    (sceneId: string): SceneSoundscapeSettings => {

      return (

        data.sceneSoundscapeSettings.find((item) => item.sceneId === sceneId) ?? {

          sceneId,

          masterVolume: 100,

          muted: false,

        }

      )

    },

    [data.sceneSoundscapeSettings],

  )



  const addFxToSoundboard = useCallback(

    (sceneId: string, fxTrackIds: string[]): SceneSoundboardEntry[] => {

      const existing = getSoundboardEntries(sceneId)

      const existingTrackIds = new Set(existing.map((entry) => entry.fxTrackId))
      const existingTrackNames = new Set(
        existing
          .map((entry) => data.fxTracks.find((track) => track.id === entry.fxTrackId)?.name)
          .filter((name): name is string => Boolean(name)),
      )

      const toAdd = [...new Set(fxTrackIds)].filter((trackId) => {
        if (existingTrackIds.has(trackId)) {
          return false
        }
        const track = data.fxTracks.find((item) => item.id === trackId)
        if (!track) {
          return false
        }
        return !existingTrackNames.has(track.name)
      })

      const newEntries = toAdd.map((fxTrackId, index) => ({

        id: createId('soundboard-entry'),

        sceneId,

        fxTrackId,

        order: existing.length + index,

      }))



      updateData((current) => ({

        ...current,

        sceneSoundboardEntries: [...current.sceneSoundboardEntries, ...newEntries],

      }))



      return newEntries

    },

    [data.fxTracks, getSoundboardEntries, updateData],

  )



  const removeSoundboardEntry = useCallback(

    (entryId: string) => {

      updateData((current) => ({

        ...current,

        sceneSoundboardEntries: current.sceneSoundboardEntries.filter(

          (entry) => entry.id !== entryId,

        ),

      }))

    },

    [updateData],

  )



  const importFx = useCallback(

    (file: File): FxTrack => {

      const now = new Date().toISOString()

      const baseName = file.name.replace(/\.[^.]+$/, '')

      const displayName = baseName

        .replace(/[_-]+/g, ' ')

        .replace(/\b\w/g, (char) => char.toUpperCase())

      const track: FxTrack = {

        id: createId('fx'),

        name: displayName,

        durationSeconds: 1,

        baseIntensity: 'II',

        type: inferFxType(displayName),

        tags: [],

        audioUrl: URL.createObjectURL(file),

        defaultVolume: 80,

        createdAt: now,

      }



      updateData((current) => ({

        ...current,

        fxTracks: [...current.fxTracks, track],

      }))

      void readAudioDurationSeconds(file).then((durationSeconds) => {
        updateData((current) => ({
          ...current,
          fxTracks: current.fxTracks.map((item) =>
            item.id === track.id ? { ...item, durationSeconds } : item,
          ),
        }))
      })

      return track

    },

    [updateData],

  )



  const updateFx = useCallback(

    (fxId: string, input: UpdateFxInput): FxTrack => {

      let updated!: FxTrack

      updateData((current) => ({

        ...current,

        fxTracks: current.fxTracks.map((track) => {

          if (track.id !== fxId) {

            return track

          }

          updated = {

            ...track,

            name: input.name.trim(),

            tags: input.tags,

          }

          return updated

        }),

      }))

      return updated

    },

    [updateData],

  )



  const softDeleteFx = useCallback(

    (fxId: string) => {

      const now = new Date().toISOString()

      updateData((current) => ({

        ...current,

        fxTracks: current.fxTracks.map((track) =>

          track.id === fxId ? { ...track, deletedAt: now } : track,

        ),

        sceneSoundboardEntries: current.sceneSoundboardEntries.filter(

          (entry) => entry.fxTrackId !== fxId,

        ),

      }))

    },

    [updateData],

  )



  const restoreFx = useCallback(

    (fxId: string) => {

      updateData((current) => {

        const track = current.fxTracks.find((item) => item.id === fxId)

        if (!track) {

          return current

        }

        const activeNames = getActiveFxTracks(current.fxTracks).map((item) => item.name)

        const resolvedName = resolveRestoredName(track.name, activeNames)

        return {

          ...current,

          fxTracks: current.fxTracks.map((item) =>

            item.id === fxId ? { ...item, deletedAt: undefined, name: resolvedName } : item,

          ),

        }

      })

    },

    [updateData],

  )



  const purgeFx = useCallback(

    (fxId: string) => {

      updateData((current) => {

        const nextFxStats = { ...current.playStats.fxTracks }

        delete nextFxStats[fxId]

        return {

          ...current,

          fxTracks: current.fxTracks.filter((track) => track.id !== fxId),

          sceneSoundboardEntries: current.sceneSoundboardEntries.filter(

            (entry) => entry.fxTrackId !== fxId,

          ),

          playStats: {

            ...current.playStats,

            fxTracks: nextFxStats,

          },

        }

      })

    },

    [updateData],

  )



  const downloadFreeTracks = useCallback((): number => {

    const bundled = createBundledFxTracks()

    let added = 0

    updateData((current) => {

      const existingNames = new Set(

        getActiveFxTracks(current.fxTracks).map((track) => track.name.toLowerCase()),

      )

      const existingIds = new Set(current.fxTracks.map((track) => track.id))

      const toAdd = bundled.filter((track) => !existingNames.has(track.name.toLowerCase()))

      added = toAdd.length

      if (toAdd.length === 0) {

        return current

      }

      return {

        ...current,

        fxTracks: [
          ...current.fxTracks,
          ...toAdd.map((track) =>
            existingIds.has(track.id) ? { ...track, id: createId('fx') } : track,
          ),
        ],

      }

    })

    return added

  }, [updateData])



  const createSoundscapeCategory = useCallback(
    (name: string): SoundscapeCategory => {
      const category: SoundscapeCategory = {
        id: createId('category'),
        name,
        trackCount: 0,
        createdAt: new Date().toISOString(),
        levels: { I: [], II: [], III: [] }
      }
      updateData((current) => ({
        ...current,
        soundscapeCategories: [...current.soundscapeCategories, category],
      }))
      return category
    },
    [updateData]
  )

  const updateSoundscapeCategory = useCallback(
    (id: string, input: Partial<SoundscapeCategory>): SoundscapeCategory => {
      let updated: SoundscapeCategory | undefined
      updateData((current) => ({
        ...current,
        soundscapeCategories: current.soundscapeCategories.map((category) => {
          if (category.id === id) {
            const levels = input.levels ?? category.levels ?? { I: [], II: [], III: [] }
            const uniqueTrackIds = new Set([...levels.I, ...levels.II, ...levels.III])
            updated = {
              ...category,
              ...input,
              trackCount: uniqueTrackIds.size,
              levels,
            }
            return updated
          }
          return category
        }),
      }))
      if (!updated) {
        throw new Error(`Category ${id} not found`)
      }
      return updated
    },
    [updateData]
  )

  const softDeleteSoundscapeCategory = useCallback(
    (id: string) => {
      updateData((current) => ({
        ...current,
        soundscapeCategories: current.soundscapeCategories.map((category) =>
          category.id === id ? { ...category, deletedAt: new Date().toISOString() } : category,
        ),
      }))
    },
    [updateData]
  )

  const restoreSoundscapeCategory = useCallback(
    (id: string) => {
      updateData((current) => {
        const category = current.soundscapeCategories.find((item) => item.id === id)
        if (!category) {
          return current
        }
        const activeNames = current.soundscapeCategories
          .filter((item) => !item.deletedAt && item.id !== id)
          .map((item) => item.name)
        const resolvedName = resolveRestoredName(category.name, activeNames)
        return {
          ...current,
          soundscapeCategories: current.soundscapeCategories.map((item) =>
            item.id === id ? { ...item, deletedAt: undefined, name: resolvedName } : item,
          ),
        }
      })
    },
    [updateData],
  )

  const purgeSoundscapeCategory = useCallback(
    (id: string) => {
      updateData((current) => {
        const nextStats = { ...current.playStats.soundscapeCategories }
        delete nextStats[id]
        return {
          ...current,
          soundscapeCategories: current.soundscapeCategories.filter((category) => category.id !== id),
          sceneSoundscapeSlots: current.sceneSoundscapeSlots.filter((slot) => slot.categoryId !== id),
          playStats: {
            ...current.playStats,
            soundscapeCategories: nextStats,
          },
        }
      })
    },
    [updateData],
  )

  const importSoundscapeTrack = useCallback(
    (file: File): SoundscapeTrack => {
      const now = new Date().toISOString()
      const ext = file.name.split('.').pop()?.toUpperCase() ?? 'MP3'
      const track: SoundscapeTrack = {
        id: createId('track'),
        name: file.name,
        durationSeconds: 222,
        format: ext,
        channels: 'Stereo',
        audioUrl: URL.createObjectURL(file),
        createdAt: now,
      }
      updateData((current) => ({
        ...current,
        soundscapeTracks: [...(current.soundscapeTracks ?? []), track],
      }))
      return track
    },
    [updateData]
  )

  const downloadFreeCompositions = useCallback((): number => {
    let added = 0
    updateData((current) => {
      const bundled = createBundledSoundscapeLibrary()
      const existingNames = new Set(
        current.soundscapeCategories.filter((c) => !c.deletedAt).map((c) => c.name.toLowerCase()),
      )
      const existingTrackIds = new Set((current.soundscapeTracks ?? []).map((track) => track.id))
      const categoriesToAdd = bundled.categories.filter(
        (category) => !existingNames.has(category.name.toLowerCase()),
      )
      const tracksToAdd = bundled.tracks.filter((track) => !existingTrackIds.has(track.id))
      added = categoriesToAdd.length
      if (categoriesToAdd.length === 0 && tracksToAdd.length === 0) {
        return current
      }
      return {
        ...current,
        soundscapeCategories: [...current.soundscapeCategories, ...categoriesToAdd],
        soundscapeTracks: [...(current.soundscapeTracks ?? []), ...tracksToAdd],
      }
    })
    return added
  }, [updateData])

  const restoreFxItems = useCallback(
    (ids: string[]): BulkTrashResult => {
      const result: BulkTrashResult = { succeeded: [], failed: [] }
      const blocked = new Set(loadE2EControls().restoreBlockedFxIds ?? [])
      updateData((current) => {
        const activeNames = getActiveFxTracks(current.fxTracks).map((track) => track.name)
        const idsToRestore = new Set<string>()

        for (const id of ids) {
          if (blocked.has(id)) {
            result.failed.push({ id, reason: 'Audio blob is missing' })
            continue
          }
          const track = current.fxTracks.find((item) => item.id === id && item.deletedAt)
          if (!track) {
            result.failed.push({ id, reason: 'Item not found' })
            continue
          }
          result.succeeded.push(id)
          idsToRestore.add(id)
        }

        if (idsToRestore.size === 0) {
          return current
        }

        const fxTracks = current.fxTracks.map((track) => {
          if (!idsToRestore.has(track.id)) {
            return track
          }
          const resolvedName = resolveRestoredName(track.name, activeNames)
          activeNames.push(resolvedName)
          return { ...track, deletedAt: undefined, name: resolvedName }
        })

        return { ...current, fxTracks }
      })
      return result
    },
    [updateData],
  )

  const purgeFxItems = useCallback(
    (ids: string[]): BulkTrashResult => {
      const result: BulkTrashResult = { succeeded: [], failed: [] }
      const blocked = new Set(loadE2EControls().purgeBlockedFxIds ?? [])
      updateData((current) => {
        const idsToPurge = new Set<string>()

        for (const id of ids) {
          if (blocked.has(id)) {
            result.failed.push({ id, reason: 'Storage record is locked' })
            continue
          }
          const track = current.fxTracks.find((item) => item.id === id && item.deletedAt)
          if (!track) {
            result.failed.push({ id, reason: 'Item not found' })
            continue
          }
          result.succeeded.push(id)
          idsToPurge.add(id)
        }

        if (idsToPurge.size === 0) {
          return current
        }

        const nextFxStats = { ...current.playStats.fxTracks }
        for (const id of idsToPurge) {
          delete nextFxStats[id]
        }

        return {
          ...current,
          fxTracks: current.fxTracks.filter((track) => !idsToPurge.has(track.id)),
          sceneSoundboardEntries: current.sceneSoundboardEntries.filter(
            (entry) => !idsToPurge.has(entry.fxTrackId),
          ),
          playStats: {
            ...current.playStats,
            fxTracks: nextFxStats,
          },
        }
      })
      return result
    },
    [updateData],
  )

  const restoreTrashItems = useCallback(
    (tab: TrashTab, ids: string[]): BulkTrashResult => {
      if (tab === 'fx') {
        return restoreFxItems(ids)
      }

      const result: BulkTrashResult = { succeeded: [], failed: [] }
      updateData((current) => {
        let next = current

        for (const id of ids) {
          switch (tab) {
            case 'campaigns': {
              const campaign = next.campaigns.find((item) => item.id === id && item.deletedAt)
              if (!campaign) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const activeNames = getActiveCampaigns(next.campaigns).map((item) => item.name)
              const resolvedName = resolveRestoredName(campaign.name, activeNames)
              next = {
                ...next,
                campaigns: next.campaigns.map((item) =>
                  item.id === id ? { ...item, deletedAt: undefined, name: resolvedName } : item,
                ),
                sessions: next.sessions.map((session) =>
                  session.campaignId === id && session.deletedAt
                    ? { ...session, deletedAt: undefined }
                    : session,
                ),
              }
              result.succeeded.push(id)
              break
            }
            case 'sessions': {
              const session = next.sessions.find((item) => item.id === id && item.deletedAt)
              if (!session) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const activeNames = next.sessions
                .filter(
                  (item) =>
                    item.campaignId === session.campaignId && !item.deletedAt && item.id !== id,
                )
                .map((item) => item.name)
              const resolvedName = resolveRestoredName(session.name, activeNames)
              next = {
                ...next,
                sessions: next.sessions.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        deletedAt: undefined,
                        name: resolvedName,
                      }
                    : item,
                ),
              }
              result.succeeded.push(id)
              break
            }
            case 'scenes': {
              const scene = next.scenes.find((item) => item.id === id && item.deletedAt)
              if (!scene) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const activeNames = getActiveScenes(next.scenes).map((item) => item.name)
              const resolvedName = resolveRestoredName(scene.name, activeNames)
              next = {
                ...next,
                scenes: next.scenes.map((item) =>
                  item.id === id ? { ...item, deletedAt: undefined, name: resolvedName } : item,
                ),
              }
              result.succeeded.push(id)
              break
            }
            case 'soundscapes': {
              const category = next.soundscapeCategories.find(
                (item) => item.id === id && item.deletedAt,
              )
              if (!category) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const activeNames = next.soundscapeCategories
                .filter((item) => !item.deletedAt && item.id !== id)
                .map((item) => item.name)
              const resolvedName = resolveRestoredName(category.name, activeNames)
              next = {
                ...next,
                soundscapeCategories: next.soundscapeCategories.map((item) =>
                  item.id === id ? { ...item, deletedAt: undefined, name: resolvedName } : item,
                ),
              }
              result.succeeded.push(id)
              break
            }
            default:
              result.failed.push({ id, reason: 'Item not found' })
          }
        }

        return next
      })
      return result
    },
    [restoreFxItems, updateData],
  )

  const purgeTrashItems = useCallback(
    (tab: TrashTab, ids: string[]): BulkTrashResult => {
      if (tab === 'fx') {
        return purgeFxItems(ids)
      }

      const result: BulkTrashResult = { succeeded: [], failed: [] }
      updateData((current) => {
        let next = current

        for (const id of ids) {
          switch (tab) {
            case 'campaigns': {
              const campaign = next.campaigns.find((item) => item.id === id && item.deletedAt)
              if (!campaign) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const nextLastActive = { ...next.lastActiveSessionByCampaign }
              delete nextLastActive[id]
              next = {
                ...next,
                campaigns: next.campaigns.filter((item) => item.id !== id),
                lastActiveSessionByCampaign: nextLastActive,
              }
              result.succeeded.push(id)
              break
            }
            case 'sessions': {
              const session = next.sessions.find((item) => item.id === id && item.deletedAt)
              if (!session) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const nextLastActive = { ...next.lastActiveSessionByCampaign }
              delete nextLastActive[session.campaignId]
              const nextSceneLastActive = { ...next.lastActiveSceneBySession }
              delete nextSceneLastActive[id]
              const nextLinks = next.sessionSceneLinks.filter((link) => link.sessionId !== id)
              const nextSessions = next.sessions.filter((item) => item.id !== id)
              next = {
                ...next,
                sessions: syncSessionSceneCounts(nextSessions, nextLinks),
                sessionSceneLinks: nextLinks,
                lastActiveSessionByCampaign: nextLastActive,
                lastActiveSceneBySession: nextSceneLastActive,
              }
              result.succeeded.push(id)
              break
            }
            case 'scenes': {
              const scene = next.scenes.find((item) => item.id === id && item.deletedAt)
              if (!scene) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const nextLinks = next.sessionSceneLinks.filter((link) => link.sceneId !== id)
              const nextLastActive = { ...next.lastActiveSceneBySession }
              for (const [sessionId, activeSceneId] of Object.entries(nextLastActive)) {
                if (activeSceneId === id) {
                  delete nextLastActive[sessionId]
                }
              }
              next = {
                ...next,
                scenes: next.scenes.filter((item) => item.id !== id),
                sessionSceneLinks: nextLinks,
                sessions: syncSessionSceneCounts(next.sessions, nextLinks),
                sceneSoundboardEntries: next.sceneSoundboardEntries.filter(
                  (entry) => entry.sceneId !== id,
                ),
                sceneSoundscapeSlots: next.sceneSoundscapeSlots.filter(
                  (slot) => slot.sceneId !== id,
                ),
                sceneSoundboardSettings: next.sceneSoundboardSettings.filter(
                  (settings) => settings.sceneId !== id,
                ),
                sceneSoundscapeSettings: next.sceneSoundscapeSettings.filter(
                  (settings) => settings.sceneId !== id,
                ),
                lastActiveSceneBySession: nextLastActive,
              }
              result.succeeded.push(id)
              break
            }
            case 'soundscapes': {
              const category = next.soundscapeCategories.find(
                (item) => item.id === id && item.deletedAt,
              )
              if (!category) {
                result.failed.push({ id, reason: 'Item not found' })
                break
              }
              const nextStats = { ...next.playStats.soundscapeCategories }
              delete nextStats[id]
              next = {
                ...next,
                soundscapeCategories: next.soundscapeCategories.filter((item) => item.id !== id),
                sceneSoundscapeSlots: next.sceneSoundscapeSlots.filter(
                  (slot) => slot.categoryId !== id,
                ),
                playStats: {
                  ...next.playStats,
                  soundscapeCategories: nextStats,
                },
              }
              result.succeeded.push(id)
              break
            }
            default:
              result.failed.push({ id, reason: 'Item not found' })
          }
        }

        return next
      })
      return result
    },
    [purgeFxItems, updateData],
  )




  const seedData = useCallback((partial: Partial<AppData>) => {

    setData((current) => {

      const next: AppData = {

        campaigns: partial.campaigns ?? current.campaigns,

        sessions: partial.sessions ?? current.sessions,

        lastActiveSessionByCampaign:

          partial.lastActiveSessionByCampaign ?? current.lastActiveSessionByCampaign,

        scenes: partial.scenes ?? current.scenes,

        sessionSceneLinks: partial.sessionSceneLinks ?? current.sessionSceneLinks,

        sceneSoundboardEntries:

          partial.sceneSoundboardEntries ?? current.sceneSoundboardEntries,

        sceneSoundscapeSlots: partial.sceneSoundscapeSlots ?? current.sceneSoundscapeSlots,

        sceneSoundboardSettings:

          partial.sceneSoundboardSettings ?? current.sceneSoundboardSettings,

        sceneSoundscapeSettings:

          partial.sceneSoundscapeSettings ?? current.sceneSoundscapeSettings,

        fxTracks: partial.fxTracks ?? current.fxTracks,

        soundscapeCategories: partial.soundscapeCategories ?? current.soundscapeCategories,

        soundscapeTracks: partial.soundscapeTracks ?? current.soundscapeTracks,

        lastActiveSceneBySession:

          partial.lastActiveSceneBySession ?? current.lastActiveSceneBySession,

        playStats: partial.playStats ?? current.playStats,

      }

      next.sessions = syncSessionSceneCounts(next.sessions, next.sessionSceneLinks)

      persist(next)

      return next

    })

  }, [])



  const resetAll = useCallback(() => {

    resetAppData()

    setData({ ...EMPTY_APP_DATA })

    setE2e(DEFAULT_E2E_CONTROLS)

    saveE2EControls(DEFAULT_E2E_CONTROLS)

  }, [])



  const setE2EControls = useCallback((controls: Partial<E2EControls>) => {

    setE2e((current) => {

      const next = { ...current, ...controls }

      saveE2EControls(next)

      return next

    })

  }, [])



  const recordSoundscapePlay = useCallback(

    (categoryId: string) => {

      updateData((current) => ({

        ...current,

        playStats: incrementSoundscapePlayCount(current.playStats, categoryId),

      }))

    },

    [updateData],

  )



  const recordFxPlay = useCallback(

    (fxTrackId: string) => {

      updateData((current) => ({

        ...current,

        playStats: incrementFxPlayCount(current.playStats, fxTrackId),

      }))

    },

    [updateData],

  )



  const getTopSoundscapeStat = useCallback(

    () => getTopSoundscapeCategory(data.playStats, data.soundscapeCategories),

    [data.playStats, data.soundscapeCategories],

  )



  const getTopFxStat = useCallback(

    () => getTopFxTrack(data.playStats, data.fxTracks),

    [data.playStats, data.fxTracks],

  )



  useEffect(() => {

    if (import.meta.env.DEV) {

      window.__ARCANUM_E2E__ = {

        reset: resetAll,

        seed: seedData,

        setE2EControls,

        formatTodayIso,

      }

    }

  }, [resetAll, seedData, setE2EControls])



  const value = useMemo(

    () => ({

      data,

      e2e,

      activeCampaigns,

      activeScenes,

      activeFxTracks,

      activeSoundscapeTracks,

      reload,

      getCampaign,

      getCampaignSessions,

      getSessionCount: getSessionCountForCampaign,

      createCampaign,

      updateCampaign,

      softDeleteCampaign,

      restoreCampaign,

      purgeCampaign,

      markCampaignPlayed,

      createSession,

      updateSession,

      softDeleteSession,

      restoreSession,

      purgeSession,

      markSessionOpened,

      getLastActiveSessionId,

      getScene,

      getFxTrack,

      createScene,

      updateScene,

      duplicateScene,

      softDeleteScene,

      restoreScene,

      purgeScene,

      getLinkedSessionCountForScene,

      linkScenesToSession,

      unlinkSceneFromSession,

      getSessionScenes,

      markScenePlayed,

      createSoundscapeSlot,

      addSoundscapesToScene,

      removeSoundscapeSlot,

      addFxToSoundboard,

      removeSoundboardEntry,

      getSoundboardEntries,

      updateSoundscapeSlot,

      updateSoundscapeSettings,

      updateSoundboardSettings,

      reorderSoundscapeSlots,

      reorderSoundboardEntries,

      getSoundscapeSettings,

      importFx,

      updateFx,

      softDeleteFx,

      restoreFx,

      purgeFx,

      restoreFxItems,

      purgeFxItems,

      restoreTrashItems,

      purgeTrashItems,

      downloadFreeTracks,

      createSoundscapeCategory,

      updateSoundscapeCategory,

      softDeleteSoundscapeCategory,

      restoreSoundscapeCategory,

      purgeSoundscapeCategory,

      importSoundscapeTrack,

      downloadFreeCompositions,

      seedData,

      resetAll,

      setE2EControls,

      recordSoundscapePlay,

      recordFxPlay,

      getTopSoundscapeStat,

      getTopFxStat,

    }),

    [

      data,

      e2e,

      activeCampaigns,

      activeScenes,

      activeFxTracks,

      reload,

      getCampaign,

      getCampaignSessions,

      getSessionCountForCampaign,

      createCampaign,

      updateCampaign,

      softDeleteCampaign,

      restoreCampaign,

      purgeCampaign,

      markCampaignPlayed,

      createSession,

      updateSession,

      softDeleteSession,

      restoreSession,

      purgeSession,

      markSessionOpened,

      getLastActiveSessionId,

      getScene,

      getFxTrack,

      createScene,

      updateScene,

      duplicateScene,

      softDeleteScene,

      restoreScene,

      purgeScene,

      getLinkedSessionCountForScene,

      linkScenesToSession,

      unlinkSceneFromSession,

      getSessionScenes,

      markScenePlayed,

      createSoundscapeSlot,

      addSoundscapesToScene,

      removeSoundscapeSlot,

      addFxToSoundboard,

      removeSoundboardEntry,

      getSoundboardEntries,

      updateSoundscapeSlot,

      updateSoundscapeSettings,

      updateSoundboardSettings,

      reorderSoundscapeSlots,

      reorderSoundboardEntries,

      getSoundscapeSettings,

      importFx,

      updateFx,

      softDeleteFx,

      restoreFx,

      purgeFx,

      restoreFxItems,

      purgeFxItems,

      restoreTrashItems,

      purgeTrashItems,

      downloadFreeTracks,

      createSoundscapeCategory,

      updateSoundscapeCategory,

      softDeleteSoundscapeCategory,

      restoreSoundscapeCategory,

      purgeSoundscapeCategory,

      importSoundscapeTrack,

      downloadFreeCompositions,

      seedData,

      resetAll,

      setE2EControls,

      recordSoundscapePlay,

      recordFxPlay,

      getTopSoundscapeStat,

      getTopFxStat,

    ],

  )



  return (

    <CampaignDataContext.Provider value={value}>{children}</CampaignDataContext.Provider>

  )

}



export function useCampaignData() {

  const ctx = useContext(CampaignDataContext)

  if (!ctx) {

    throw new Error('useCampaignData must be used within CampaignDataProvider')

  }

  return ctx

}



declare global {

  interface Window {

    __ARCANUM_E2E__?: {

      reset: () => void

      seed: (partial: Partial<AppData>) => void

      setE2EControls: (controls: Partial<E2EControls>) => void

      formatTodayIso: () => string

    }

  }

}


