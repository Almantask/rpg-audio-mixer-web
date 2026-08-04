import React, { createContext, useContext, useState, useEffect } from 'react'
import type {
  Campaign,
  Session,
  Scene,
  SoundscapeCategory,
  SoundscapeTrack,
  FXTrack,
  TrashItem,
  ActiveSceneMixerState,
} from '../types'
import { StorageService } from '../services/storage'
import { audioEngine } from '../services/audioEngine'

interface AppContextType {
  // Campaigns
  campaigns: Campaign[]
  createCampaign: (name: string, description?: string, coverUrl?: string) => Campaign
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  softDeleteCampaign: (id: string) => void

  // Sessions
  sessions: Session[]
  createSession: (
    campaignId: string,
    name: string,
    date: string,
    description?: string,
    coverUrl?: string
  ) => Session
  updateSession: (id: string, updates: Partial<Session>) => void
  softDeleteSession: (id: string) => void

  // Scenes
  scenes: Scene[]
  createScene: (
    name: string,
    description?: string,
    coverUrl?: string,
    tags?: string[],
    autoLinkSessionId?: string
  ) => Scene
  updateScene: (id: string, updates: Partial<Scene>) => void
  duplicateScene: (sceneId: string, autoLinkSessionId?: string) => Scene
  softDeleteScene: (id: string) => void
  unlinkSceneFromSession: (sceneId: string, sessionId: string) => void
  importScenesToSession: (sessionId: string, sceneIds: string[]) => void

  // Soundscape Categories & Tracks
  soundscapeCategories: SoundscapeCategory[]
  soundscapeTracks: SoundscapeTrack[]
  createSoundscapeCategory: (name: string, description?: string) => SoundscapeCategory
  updateSoundscapeCategory: (id: string, updates: Partial<SoundscapeCategory>) => void
  softDeleteSoundscapeCategory: (id: string) => void
  addTrackToCategoryLevel: (
    categoryId: string,
    intensity: 'I' | 'II' | 'III',
    trackId: string
  ) => void
  removeTrackFromCategoryLevel: (
    categoryId: string,
    intensity: 'I' | 'II' | 'III',
    trackId: string
  ) => void
  importSoundscapeTrack: (
    title: string,
    audioUrl: string,
    format?: string,
    durationSeconds?: number
  ) => SoundscapeTrack

  // FX Tracks
  fxTracks: FXTrack[]
  importFXTrack: (
    title: string,
    audioUrl: string,
    tags?: string[],
    durationSeconds?: number
  ) => FXTrack
  updateFXTrack: (id: string, updates: Partial<FXTrack>) => void
  softDeleteFXTrack: (id: string) => void

  // Active Scene Audio State
  activeSceneId: string | null
  setActiveSceneId: (sceneId: string | null) => void
  mixerState: ActiveSceneMixerState
  setMasterVolume: (val: number) => void
  setSoundboardMasterVolume: (val: number) => void
  toggleMute: () => void
  toggleSessionLock: () => void
  playCategoryTrack: (sceneId: string, categoryId: string) => void
  pauseCategoryTrack: (categoryId: string) => void
  rerollCategoryTrack: (sceneId: string, categoryId: string) => void
  setCategoryIntensity: (
    sceneId: string,
    categoryId: string,
    intensity: 'I' | 'II' | 'III' | 'IV' | 'V'
  ) => void
  setCategoryVolume: (sceneId: string, categoryId: string, volume: number) => void
  addCategoriesToScene: (sceneId: string, categoryIds: string[]) => void
  removeCategoryFromScene: (sceneId: string, categoryId: string) => void
  reorderSceneCategories: (sceneId: string, newCategories: Scene['soundscapeCategories']) => void

  // Soundboard Actions
  triggerFXTile: (fxTrackId: string) => void
  stopFXTile: (fxTrackId: string) => void
  addFXToScene: (sceneId: string, fxTrackIds: string[]) => void
  removeFXFromScene: (sceneId: string, tileId: string) => void
  reorderSoundboardTiles: (sceneId: string, newTiles: Scene['soundboardTiles']) => void
  playSceneAudio: (sceneId: string) => void
  stopAllAudio: () => void

  // Trash
  trashItems: TrashItem[]
  restoreTrashItem: (id: string) => void
  purgeTrashItem: (id: string) => void
  restoreAllTrashTab: (tab: 'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx') => void
  emptyTrashTab: (tab: 'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx') => void
  bulkRestoreTrashItems: (ids: string[]) => void
  bulkPurgeTrashItems: (ids: string[]) => void

  // Toast Feedback
  toastMessage: string | null
  showToast: (msg: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(StorageService.getCampaigns)
  const [sessions, setSessions] = useState<Session[]>(StorageService.getSessions)
  const [scenes, setScenes] = useState<Scene[]>(StorageService.getScenes)
  const [soundscapeCategories, setSoundscapeCategories] = useState<SoundscapeCategory[]>(
    StorageService.getSoundscapeCategories
  )
  const [soundscapeTracks, setSoundscapeTracks] = useState<SoundscapeTrack[]>(
    StorageService.getSoundscapeTracks
  )
  const [fxTracks, setFXTracks] = useState<FXTrack[]>(StorageService.getFXTracks)
  const [trashItems, setTrashItems] = useState<TrashItem[]>(StorageService.getTrash)

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)

  const [mixerState, setMixerState] = useState<ActiveSceneMixerState>({
    sceneId: null,
    masterVolume: 0.8,
    isMuted: false,
    soundboardMasterVolume: 0.85,
    isSessionLocked: false,
    playingCategories: {},
    playingFX: {},
  })

  // Synchronize storage
  useEffect(() => StorageService.saveCampaigns(campaigns), [campaigns])
  useEffect(() => StorageService.saveSessions(sessions), [sessions])
  useEffect(() => StorageService.saveScenes(scenes), [scenes])
  useEffect(() => StorageService.saveSoundscapeCategories(soundscapeCategories), [soundscapeCategories])
  useEffect(() => StorageService.saveSoundscapeTracks(soundscapeTracks), [soundscapeTracks])
  useEffect(() => StorageService.saveFXTracks(fxTracks), [fxTracks])
  useEffect(() => StorageService.saveTrash(trashItems), [trashItems])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Campaign Handlers ---
  const createCampaign = (name: string, description?: string, coverUrl?: string): Campaign => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      description,
      coverUrl,
      lastPlayedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCampaigns((prev) => [newCamp, ...prev])
    showToast(`Campaign "${name}" created.`)
    return newCamp
  }

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    )
  }

  const softDeleteCampaign = (id: string) => {
    const target = campaigns.find((c) => c.id === id)
    if (!target) return
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
    setTrashItems((prev) => [
      {
        id: `trash-${Date.now()}`,
        entityType: 'campaign',
        deletedAt: new Date().toISOString(),
        originalData: target,
      },
      ...prev,
    ])
    showToast(`Campaign "${target.name}" moved to Trash.`)
  }

  // --- Session Handlers ---
  const createSession = (
    campaignId: string,
    name: string,
    date: string,
    description?: string,
    coverUrl?: string
  ): Session => {
    const campSessions = sessions.filter((s) => s.campaignId === campaignId)
    const nextNum = campSessions.length > 0 ? Math.max(...campSessions.map((s) => s.sessionNumber)) + 1 : 1

    const newSess: Session = {
      id: `sess-${Date.now()}`,
      campaignId,
      name,
      sessionNumber: nextNum,
      date,
      description,
      coverUrl,
      sceneIds: [],
      lastPlayedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSessions((prev) => [newSess, ...prev])
    showToast(`Session ${nextNum} "${name}" created.`)
    return newSess
  }

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    )
  }

  const softDeleteSession = (id: string) => {
    const target = sessions.find((s) => s.id === id)
    if (!target) return
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setTrashItems((prev) => [
      {
        id: `trash-${Date.now()}`,
        entityType: 'session',
        deletedAt: new Date().toISOString(),
        originalData: target,
        parentCampaignId: target.campaignId,
      },
      ...prev,
    ])
    showToast(`Session "${target.name}" moved to Trash.`)
  }

  // --- Scene Handlers ---
  const createScene = (
    name: string,
    description?: string,
    coverUrl?: string,
    tags?: string[],
    autoLinkSessionId?: string
  ): Scene => {
    const newSc: Scene = {
      id: `scene-${Date.now()}`,
      name,
      description,
      coverUrl,
      tags: tags ?? [],
      soundscapeCategories: [],
      soundboardTiles: [],
      isUserOwned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setScenes((prev) => [newSc, ...prev])

    if (autoLinkSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === autoLinkSessionId ? { ...s, sceneIds: [...s.sceneIds, newSc.id] } : s
        )
      )
    }

    showToast(`Scene "${name}" created.`)
    return newSc
  }

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes((prev) =>
      prev.map((sc) => (sc.id === id ? { ...sc, ...updates, updatedAt: new Date().toISOString() } : sc))
    )
  }

  const duplicateScene = (sceneId: string, autoLinkSessionId?: string): Scene => {
    const target = scenes.find((s) => s.id === sceneId)
    if (!target) throw new Error('Scene not found')

    const clone: Scene = {
      ...target,
      id: `scene-${Date.now()}`,
      name: `Copy of ${target.name}`,
      soundscapeCategories: [...target.soundscapeCategories],
      soundboardTiles: [...target.soundboardTiles],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setScenes((prev) => [clone, ...prev])

    if (autoLinkSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === autoLinkSessionId ? { ...s, sceneIds: [...s.sceneIds, clone.id] } : s
        )
      )
    }

    showToast(`Cloned "${clone.name}".`)
    return clone
  }

  const softDeleteScene = (id: string) => {
    const target = scenes.find((sc) => sc.id === id)
    if (!target) return

    // Unlink from all active sessions
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        sceneIds: s.sceneIds.filter((scId) => scId !== id),
      }))
    )

    setScenes((prev) => prev.filter((sc) => sc.id !== id))
    setTrashItems((prev) => [
      {
        id: `trash-${Date.now()}`,
        entityType: 'scene',
        deletedAt: new Date().toISOString(),
        originalData: target,
      },
      ...prev,
    ])

    showToast(`Scene "${target.name}" moved to Trash.`)
  }

  const unlinkSceneFromSession = (sceneId: string, sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, sceneIds: s.sceneIds.filter((id) => id !== sceneId) } : s))
    )
    showToast('Scene unlinked from session.')
  }

  const importScenesToSession = (sessionId: string, sceneIds: string[]) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, sceneIds: Array.from(new Set([...s.sceneIds, ...sceneIds])) }
          : s
      )
    )
    showToast(`${sceneIds.length} scene(s) imported to session.`)
  }

  // --- Soundscape Category Handlers ---
  const createSoundscapeCategory = (name: string, description?: string): SoundscapeCategory => {
    const newCat: SoundscapeCategory = {
      id: `cat-${Date.now()}`,
      name,
      description,
      levels: { I: [], II: [], III: [] },
      isUserOwned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSoundscapeCategories((prev) => [...prev, newCat])
    showToast(`Category "${name}" created.`)
    return newCat
  }

  const updateSoundscapeCategory = (id: string, updates: Partial<SoundscapeCategory>) => {
    setSoundscapeCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat))
    )
  }

  const softDeleteSoundscapeCategory = (id: string) => {
    const target = soundscapeCategories.find((cat) => cat.id === id)
    if (!target) return
    setSoundscapeCategories((prev) => prev.filter((cat) => cat.id !== id))
    setTrashItems((prev) => [
      {
        id: `trash-${Date.now()}`,
        entityType: 'soundscape',
        deletedAt: new Date().toISOString(),
        originalData: target,
      },
      ...prev,
    ])
    showToast(`Soundscape category "${target.name}" moved to Trash.`)
  }

  const addTrackToCategoryLevel = (
    categoryId: string,
    intensity: 'I' | 'II' | 'III',
    trackId: string
  ) => {
    setSoundscapeCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        const currentLevel = cat.levels[intensity] || []
        if (currentLevel.includes(trackId)) return cat
        return {
          ...cat,
          levels: {
            ...cat.levels,
            [intensity]: [...currentLevel, trackId],
          },
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }

  const removeTrackFromCategoryLevel = (
    categoryId: string,
    intensity: 'I' | 'II' | 'III',
    trackId: string
  ) => {
    setSoundscapeCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          levels: {
            ...cat.levels,
            [intensity]: (cat.levels[intensity] || []).filter((id) => id !== trackId),
          },
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }

  const importSoundscapeTrack = (
    title: string,
    audioUrl: string,
    format = 'MP3',
    durationSeconds = 180
  ): SoundscapeTrack => {
    const newTrack: SoundscapeTrack = {
      id: `track-${Date.now()}`,
      title,
      audioUrl,
      format,
      channels: 'Stereo',
      durationSeconds,
      createdAt: new Date().toISOString(),
    }
    setSoundscapeTracks((prev) => [newTrack, ...prev])
    showToast(`Track "${title}" imported.`)
    return newTrack
  }

  // --- FX Track Handlers ---
  const importFXTrack = (
    title: string,
    audioUrl: string,
    tags: string[] = ['CUSTOM'],
    durationSeconds = 3
  ): FXTrack => {
    const newFX: FXTrack = {
      id: `fx-${Date.now()}`,
      title,
      audioUrl,
      durationSeconds,
      defaultIntensity: 'I',
      tags,
      defaultVolume: 0.8,
      isUserOwned: true,
      createdAt: new Date().toISOString(),
    }
    setFXTracks((prev) => [newFX, ...prev])
    showToast(`FX track "${title}" imported.`)
    return newFX
  }

  const updateFXTrack = (id: string, updates: Partial<FXTrack>) => {
    setFXTracks((prev) => prev.map((fx) => (fx.id === id ? { ...fx, ...updates } : fx)))
  }

  const softDeleteFXTrack = (id: string) => {
    const target = fxTracks.find((fx) => fx.id === id)
    if (!target) return
    setFXTracks((prev) => prev.filter((fx) => fx.id !== id))
    setTrashItems((prev) => [
      {
        id: `trash-${Date.now()}`,
        entityType: 'fx',
        deletedAt: new Date().toISOString(),
        originalData: target,
      },
      ...prev,
    ])
    showToast(`FX "${target.title}" moved to Trash.`)
  }

  // --- Active Scene Audio Handlers ---
  const setMasterVolume = (val: number) => {
    setMixerState((prev) => ({ ...prev, masterVolume: val }))
    audioEngine.setSoundscapeMasterVolume(val)
  }

  const setSoundboardMasterVolume = (val: number) => {
    setMixerState((prev) => ({ ...prev, soundboardMasterVolume: val }))
    audioEngine.setSoundboardMasterVolume(val)
  }

  const toggleMute = () => {
    setMixerState((prev) => {
      const nextMuted = !prev.isMuted
      audioEngine.setMuted(nextMuted)
      return { ...prev, isMuted: nextMuted }
    })
  }

  const toggleSessionLock = () => {
    setMixerState((prev) => ({ ...prev, isSessionLocked: !prev.isSessionLocked }))
  }

  const playCategoryTrack = (sceneId: string, categoryId: string) => {
    const category = soundscapeCategories.find((c) => c.id === categoryId)
    const scene = scenes.find((s) => s.id === sceneId)
    if (!category || !scene) return

    const scConfig = scene.soundscapeCategories.find((c) => c.categoryId === categoryId)
    const intensity = scConfig?.intensity ?? 'I'
    const vol = scConfig?.volume ?? 1.0

    const pool = category.levels[intensity as 'I' | 'II' | 'III'] ?? []
    if (pool.length === 0) return

    const randomTrackId = pool[Math.floor(Math.random() * pool.length)]
    const track = soundscapeTracks.find((t) => t.id === randomTrackId)
    if (!track) return

    const handleEnded = () => {
      // Auto-chain another random track from same level
      playCategoryTrack(sceneId, categoryId)
    }

    audioEngine.playSoundscapeCategory(
      categoryId,
      track.id,
      track.audioUrl,
      intensity,
      vol,
      handleEnded
    )

    setMixerState((prev) => ({
      ...prev,
      playingCategories: {
        ...prev.playingCategories,
        [categoryId]: { trackId: track.id, intensity, volume: vol },
      },
    }))
  }

  const pauseCategoryTrack = (categoryId: string) => {
    audioEngine.stopSoundscapeCategory(categoryId)
    setMixerState((prev) => {
      const nextPlaying = { ...prev.playingCategories }
      delete nextPlaying[categoryId]
      return { ...prev, playingCategories: nextPlaying }
    })
  }

  const rerollCategoryTrack = (sceneId: string, categoryId: string) => {
    pauseCategoryTrack(categoryId)
    playCategoryTrack(sceneId, categoryId)
  }

  const setCategoryIntensity = (
    sceneId: string,
    categoryId: string,
    intensity: 'I' | 'II' | 'III' | 'IV' | 'V'
  ) => {
    // Update scene record
    setScenes((prev) =>
      prev.map((sc) => {
        if (sc.id !== sceneId) return sc
        return {
          ...sc,
          soundscapeCategories: sc.soundscapeCategories.map((c) =>
            c.categoryId === categoryId ? { ...c, intensity } : c
          ),
        }
      })
    )

    // Crossfade if playing
    if (audioEngine.isCategoryPlaying(categoryId)) {
      playCategoryTrack(sceneId, categoryId)
    }
  }

  const setCategoryVolume = (sceneId: string, categoryId: string, volume: number) => {
    setScenes((prev) =>
      prev.map((sc) => {
        if (sc.id !== sceneId) return sc
        return {
          ...sc,
          soundscapeCategories: sc.soundscapeCategories.map((c) =>
            c.categoryId === categoryId ? { ...c, volume } : c
          ),
        }
      })
    )
    audioEngine.setSoundscapeCategoryVolume(categoryId, volume)
  }

  const addCategoriesToScene = (sceneId: string, categoryIds: string[]) => {
    setScenes((prev) =>
      prev.map((sc) => {
        if (sc.id !== sceneId) return sc
        const existingIds = sc.soundscapeCategories.map((c) => c.categoryId)
        const newAdditions = categoryIds
          .filter((id) => !existingIds.includes(id))
          .map((id) => ({
            categoryId: id,
            volume: 1.0,
            intensity: 'I' as const,
          }))
        return {
          ...sc,
          soundscapeCategories: [...sc.soundscapeCategories, ...newAdditions],
        }
      })
    )
    showToast(`${categoryIds.length} category/categories added.`)
  }

  const removeCategoryFromScene = (sceneId: string, categoryId: string) => {
    pauseCategoryTrack(categoryId)
    setScenes((prev) =>
      prev.map((sc) => {
        if (sc.id !== sceneId) return sc
        return {
          ...sc,
          soundscapeCategories: sc.soundscapeCategories.filter((c) => c.categoryId !== categoryId),
        }
      })
    )
  }

  const reorderSceneCategories = (
    sceneId: string,
    newCategories: Scene['soundscapeCategories']
  ) => {
    setScenes((prev) =>
      prev.map((sc) => (sc.id === sceneId ? { ...sc, soundscapeCategories: newCategories } : sc))
    )
  }

  const triggerFXTile = (fxTrackId: string) => {
    const fx = fxTracks.find((f) => f.id === fxTrackId)
    if (!fx) return
    audioEngine.playFX(fxTrackId, fx.audioUrl, fx.defaultVolume ?? 0.8)
  }

  const stopFXTile = (fxTrackId: string) => {
    audioEngine.stopFX(fxTrackId)
  }

  const addFXToScene = (sceneId: string, fxTrackIds: string[]) => {
    setScenes((prev) =>
      prev.map((sc) => {
        if (sc.id !== sceneId) return sc
        const currentCount = sc.soundboardTiles.length
        if (currentCount >= 24) {
          showToast('Board full — remove an effect to add more.')
          return sc
        }

        const remainingSlots = 24 - currentCount
        const idsToAdd = fxTrackIds.slice(0, remainingSlots)

        const newTiles = idsToAdd.map((fxId, idx) => ({
          id: `tile-${Date.now()}-${idx}`,
          fxTrackId: fxId,
          hotkey: currentCount + idx + 1 <= 9 ? currentCount + idx + 1 : undefined,
          position: currentCount + idx + 1,
        }))

        return {
          ...sc,
          soundboardTiles: [...sc.soundboardTiles, ...newTiles],
        }
      })
    )
    showToast(`${fxTrackIds.length} effect(s) added to soundboard.`)
  }

  const removeFXFromScene = (sceneId: string, tileId: string) => {
    setScenes((prev) =>
      prev.map((sc) => {
        if (sc.id !== sceneId) return sc
        return {
          ...sc,
          soundboardTiles: sc.soundboardTiles.filter((t) => t.id !== tileId),
        }
      })
    )
  }

  const reorderSoundboardTiles = (sceneId: string, newTiles: Scene['soundboardTiles']) => {
    setScenes((prev) =>
      prev.map((sc) => (sc.id === sceneId ? { ...sc, soundboardTiles: newTiles } : sc))
    )
  }

  const playSceneAudio = (sceneId: string) => {
    const sc = scenes.find((s) => s.id === sceneId)
    if (!sc) return

    for (const catConfig of sc.soundscapeCategories) {
      if (!audioEngine.isCategoryPlaying(catConfig.categoryId)) {
        playCategoryTrack(sceneId, catConfig.categoryId)
      }
    }
  }

  const stopAllAudio = () => {
    audioEngine.stopAll()
    setMixerState((prev) => ({ ...prev, playingCategories: {}, playingFX: {} }))
    showToast('All audio stopped.')
  }

  // --- Trash Handlers ---
  const restoreTrashItem = (id: string) => {
    const item = trashItems.find((t) => t.id === id)
    if (!item) return

    const originalName = (item.originalData as { name?: string; title?: string }).name ||
      (item.originalData as { title?: string }).title || 'Item'

    if (item.entityType === 'campaign') {
      const camp = item.originalData as Campaign
      const nameExists = campaigns.some((c) => c.name === camp.name)
      const restoredName = nameExists ? `${camp.name} (restored)` : camp.name
      setCampaigns((prev) => [{ ...camp, name: restoredName }, ...prev])
    } else if (item.entityType === 'session') {
      const sess = item.originalData as Session
      const nameExists = sessions.some((s) => s.name === sess.name)
      const restoredName = nameExists ? `${sess.name} (restored)` : sess.name
      setSessions((prev) => [{ ...sess, name: restoredName }, ...prev])
    } else if (item.entityType === 'scene') {
      const sc = item.originalData as Scene
      const nameExists = scenes.some((s) => s.name === sc.name)
      const restoredName = nameExists ? `${sc.name} (restored)` : sc.name
      setScenes((prev) => [{ ...sc, name: restoredName }, ...prev])
    } else if (item.entityType === 'soundscape') {
      const cat = item.originalData as SoundscapeCategory
      const nameExists = soundscapeCategories.some((c) => c.name === cat.name)
      const restoredName = nameExists ? `${cat.name} (restored)` : cat.name
      setSoundscapeCategories((prev) => [{ ...cat, name: restoredName }, ...prev])
    } else if (item.entityType === 'fx') {
      const fx = item.originalData as FXTrack
      const titleExists = fxTracks.some((f) => f.title === fx.title)
      const restoredTitle = titleExists ? `${fx.title} (restored)` : fx.title
      setFXTracks((prev) => [{ ...fx, title: restoredTitle }, ...prev])
    }

    setTrashItems((prev) => prev.filter((t) => t.id !== id))
    showToast(`Restored "${originalName}".`)
  }

  const purgeTrashItem = (id: string) => {
    setTrashItems((prev) => prev.filter((t) => t.id !== id))
    showToast('Item permanently deleted.')
  }

  const restoreAllTrashTab = (tab: 'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx') => {
    const typeMap = {
      campaigns: 'campaign',
      sessions: 'session',
      scenes: 'scene',
      soundscapes: 'soundscape',
      fx: 'fx',
    }
    const targetType = typeMap[tab]
    const itemsToRestore = trashItems.filter((t) => t.entityType === targetType)
    itemsToRestore.forEach((item) => restoreTrashItem(item.id))
  }

  const emptyTrashTab = (tab: 'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx') => {
    const typeMap = {
      campaigns: 'campaign',
      sessions: 'session',
      scenes: 'scene',
      soundscapes: 'soundscape',
      fx: 'fx',
    }
    const targetType = typeMap[tab]
    setTrashItems((prev) => prev.filter((t) => t.entityType !== targetType))
    showToast(`Emptied trash for ${tab}.`)
  }

  const bulkRestoreTrashItems = (ids: string[]) => {
    ids.forEach((id) => restoreTrashItem(id))
  }

  const bulkPurgeTrashItems = (ids: string[]) => {
    setTrashItems((prev) => prev.filter((t) => !ids.includes(t.id)))
    showToast(`${ids.length} items permanently deleted.`)
  }

  return (
    <AppContext.Provider
      value={{
        campaigns,
        createCampaign,
        updateCampaign,
        softDeleteCampaign,
        sessions,
        createSession,
        updateSession,
        softDeleteSession,
        scenes,
        createScene,
        updateScene,
        duplicateScene,
        softDeleteScene,
        unlinkSceneFromSession,
        importScenesToSession,
        soundscapeCategories,
        soundscapeTracks,
        createSoundscapeCategory,
        updateSoundscapeCategory,
        softDeleteSoundscapeCategory,
        addTrackToCategoryLevel,
        removeTrackFromCategoryLevel,
        importSoundscapeTrack,
        fxTracks,
        importFXTrack,
        updateFXTrack,
        softDeleteFXTrack,
        activeSceneId,
        setActiveSceneId,
        mixerState,
        setMasterVolume,
        setSoundboardMasterVolume,
        toggleMute,
        toggleSessionLock,
        playCategoryTrack,
        pauseCategoryTrack,
        rerollCategoryTrack,
        setCategoryIntensity,
        setCategoryVolume,
        addCategoriesToScene,
        removeCategoryFromScene,
        reorderSceneCategories,
        triggerFXTile,
        stopFXTile,
        addFXToScene,
        removeFXFromScene,
        reorderSoundboardTiles,
        playSceneAudio,
        stopAllAudio,
        trashItems,
        restoreTrashItem,
        purgeTrashItem,
        restoreAllTrashTab,
        emptyTrashTab,
        bulkRestoreTrashItems,
        bulkPurgeTrashItems,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
