import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import type {
  Campaign,
  Session,
  Scene,
  SessionSceneLink,
  FxTrack,
  SoundscapeTrack,
  SoundscapeCategory,
  ActiveSceneSoundboardItem,
  ActiveSceneSoundscapeItem,
  TrashItem,
  EntityType,
} from '../types'
import {
  initialCampaigns,
  initialSessions,
  initialScenes,
  initialSessionSceneLinks,
  initialFxTracks,
  initialSoundscapeTracks,
  initialSoundscapeCategories,
  initialActiveSceneSoundboardItems,
  initialActiveSceneSoundscapeItems,
} from '../storage/seedData'

interface AppContextType {
  // Campaigns
  campaigns: Campaign[]
  createCampaign: (name: string, system?: string, description?: string) => Campaign
  updateCampaign: (id: string, name: string, system?: string, description?: string) => void
  deleteCampaign: (id: string) => void

  // Sessions
  sessions: Session[]
  createSession: (campaignId: string, title: string, notes?: string) => Session
  updateSession: (id: string, title: string, notes?: string) => void
  deleteSession: (id: string) => void

  // Scenes
  scenes: Scene[]
  createScene: (name: string, description?: string, tags?: string[]) => Scene
  updateScene: (id: string, name: string, description?: string, tags?: string[]) => void
  deleteScene: (id: string) => void

  // Session-Scene links
  links: SessionSceneLink[]
  linkSceneToSession: (sessionId: string, sceneId: string) => void
  unlinkSceneFromSession: (sessionId: string, sceneId: string) => void
  recordScenePlayed: (sessionId: string, sceneId: string) => void

  // FX Tracks
  fxTracks: FxTrack[]
  createFxTrack: (name: string, category: string, tags: string[], durationSeconds: number, audioUrl: string) => FxTrack
  updateFxTrack: (id: string, name: string, category: string, tags: string[], durationSeconds?: number) => void
  deleteFxTrack: (id: string) => void

  // Soundscape Tracks & Categories
  soundscapeTracks: SoundscapeTrack[]
  createSoundscapeTrack: (name: string, tags: string[], audioUrl: string, durationSeconds?: number) => SoundscapeTrack
  soundscapeCategories: SoundscapeCategory[]
  createSoundscapeCategory: (name: string, description?: string, tags?: string[]) => SoundscapeCategory
  updateSoundscapeCategory: (id: string, category: Partial<SoundscapeCategory>) => void
  deleteSoundscapeCategory: (id: string) => void

  // Active Scene audio items
  soundboardItems: ActiveSceneSoundboardItem[]
  addFxToSoundboard: (sceneId: string, fxTrackId: string) => void
  removeFxFromSoundboard: (id: string) => void
  reorderSoundboard: (sceneId: string, newItems: ActiveSceneSoundboardItem[]) => void

  soundscapeItems: ActiveSceneSoundscapeItem[]
  addSoundscapeToScene: (sceneId: string, categoryId: string) => void
  removeSoundscapeFromScene: (sceneId: string, categoryId: string) => void
  updateSoundscapeItem: (sceneId: string, categoryId: string, updates: Partial<ActiveSceneSoundscapeItem>) => void
  reorderSoundscapes: (sceneId: string, newItems: ActiveSceneSoundscapeItem[]) => void

  // Session Lock
  sessionLock: boolean
  toggleSessionLock: () => void

  // Trash Manager
  trashItems: TrashItem[]
  restoreTrashItem: (id: string) => void
  restoreAllTrashItems: (entityType?: EntityType) => void
  purgeTrashItem: (id: string) => void
  emptyTrash: (entityType?: EntityType) => void

  // Master Volume & Audio Control
  masterVolume: number
  setMasterVolume: (vol: number) => void
  playingCategoryIds: string[]
  toggleCategoryPlay: (categoryId: string) => void
  activeFxIds: string[]
  triggerFx: (fxId: string) => void
  stopFx: (fxId: string) => void
  stopAllAudio: () => void
  isDucked: boolean

  // Toast feedback
  toastMessage: string | null
  showToast: (msg: string) => void
  clearToast: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadStorage('arcanum_campaigns', initialCampaigns))
  const [sessions, setSessions] = useState<Session[]>(() => loadStorage('arcanum_sessions', initialSessions))
  const [scenes, setScenes] = useState<Scene[]>(() => loadStorage('arcanum_scenes', initialScenes))
  const [links, setLinks] = useState<SessionSceneLink[]>(() => loadStorage('arcanum_links', initialSessionSceneLinks))
  const [fxTracks, setFxTracks] = useState<FxTrack[]>(() => loadStorage('arcanum_fx', initialFxTracks))
  const [soundscapeTracks, setSoundscapeTracks] = useState<SoundscapeTrack[]>(() => loadStorage('arcanum_s_tracks', initialSoundscapeTracks))
  const [soundscapeCategories, setSoundscapeCategories] = useState<SoundscapeCategory[]>(() => loadStorage('arcanum_s_cats', initialSoundscapeCategories))
  const [soundboardItems, setSoundboardItems] = useState<ActiveSceneSoundboardItem[]>(() => loadStorage('arcanum_sb_items', initialActiveSceneSoundboardItems))
  const [soundscapeItems, setSoundscapeItems] = useState<ActiveSceneSoundscapeItem[]>(() => loadStorage('arcanum_sc_items', initialActiveSceneSoundscapeItems))
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => loadStorage('arcanum_trash', []))
  
  const [sessionLock, setSessionLock] = useState<boolean>(false)
  const [masterVolume, setMasterVolume] = useState<number>(80)
  
  // Audio state
  const [playingCategoryIds, setPlayingCategoryIds] = useState<string[]>([])
  const [activeFxIds, setActiveFxIds] = useState<string[]>([])
  const [isDucked, setIsDucked] = useState<boolean>(false)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const clearToast = () => setToastMessage(null)

  // Save changes
  useEffect(() => saveStorage('arcanum_campaigns', campaigns), [campaigns])
  useEffect(() => saveStorage('arcanum_sessions', sessions), [sessions])
  useEffect(() => saveStorage('arcanum_scenes', scenes), [scenes])
  useEffect(() => saveStorage('arcanum_links', links), [links])
  useEffect(() => saveStorage('arcanum_fx', fxTracks), [fxTracks])
  useEffect(() => saveStorage('arcanum_s_tracks', soundscapeTracks), [soundscapeTracks])
  useEffect(() => saveStorage('arcanum_s_cats', soundscapeCategories), [soundscapeCategories])
  useEffect(() => saveStorage('arcanum_sb_items', soundboardItems), [soundboardItems])
  useEffect(() => saveStorage('arcanum_sc_items', soundscapeItems), [soundscapeItems])
  useEffect(() => saveStorage('arcanum_trash', trashItems), [trashItems])

  // Helper to soft-delete
  const moveItemToTrash = (entityType: EntityType, entityId: string, name: string, payload: any) => {
    const deletedAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const newItem: TrashItem = {
      id: 'trash-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      entityType,
      entityId,
      name,
      deletedAt,
      expiresAt,
      payload,
    }
    setTrashItems((prev) => [newItem, ...prev])
  }

  // Campaigns CRUD
  const createCampaign = (name: string, system?: string, description?: string): Campaign => {
    const newCamp: Campaign = {
      id: 'camp-' + Date.now(),
      name,
      system: system || '',
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCampaigns((prev) => [newCamp, ...prev])
    showToast(`Campaign "${name}" created`)
    return newCamp
  }

  const updateCampaign = (id: string, name: string, system?: string, description?: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, system, description, updatedAt: new Date().toISOString() } : c))
    )
    showToast(`Campaign updated`)
  }

  const deleteCampaign = (id: string) => {
    const target = campaigns.find((c) => c.id === id)
    if (!target) return
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
    moveItemToTrash('campaign', id, target.name, target)

    // Soft delete associated sessions as well
    const campSessions = sessions.filter((s) => s.campaignId === id)
    campSessions.forEach((s) => {
      moveItemToTrash('session', s.id, s.title, s)
    })
    setSessions((prev) => prev.filter((s) => s.campaignId !== id))
    showToast(`Campaign "${target.name}" moved to Trash`)
  }

  // Sessions CRUD
  const createSession = (campaignId: string, title: string, notes?: string): Session => {
    const newSess: Session = {
      id: 'sess-' + Date.now(),
      campaignId,
      title,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSessions((prev) => [newSess, ...prev])
    showToast(`Session "${title}" created`)
    return newSess
  }

  const updateSession = (id: string, title: string, notes?: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title, notes, updatedAt: new Date().toISOString() } : s))
    )
    showToast(`Session updated`)
  }

  const deleteSession = (id: string) => {
    const target = sessions.find((s) => s.id === id)
    if (!target) return
    setSessions((prev) => prev.filter((s) => s.id !== id))
    moveItemToTrash('session', id, target.title, target)
    showToast(`Session "${target.title}" moved to Trash`)
  }

  // Scenes CRUD
  const createScene = (name: string, description?: string, tags: string[] = []): Scene => {
    const newSc: Scene = {
      id: 'scene-' + Date.now(),
      name,
      description: description || '',
      tags,
      isUserOwned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setScenes((prev) => [newSc, ...prev])
    showToast(`Scene "${name}" created`)
    return newSc
  }

  const updateScene = (id: string, name: string, description?: string, tags: string[] = []) => {
    setScenes((prev) =>
      prev.map((sc) => (sc.id === id ? { ...sc, name, description, tags, updatedAt: new Date().toISOString() } : sc))
    )
    showToast(`Scene updated`)
  }

  const deleteScene = (id: string) => {
    const target = scenes.find((sc) => sc.id === id)
    if (!target) return
    setScenes((prev) => prev.filter((sc) => sc.id !== id))
    // Remove links
    setLinks((prev) => prev.filter((l) => l.sceneId !== id))
    moveItemToTrash('scene', id, target.name, target)
    showToast(`Scene "${target.name}" moved to Trash`)
  }

  // Session-Scene links
  const linkSceneToSession = (sessionId: string, sceneId: string) => {
    if (links.some((l) => l.sessionId === sessionId && l.sceneId === sceneId)) return
    const newLink: SessionSceneLink = {
      id: 'link-' + Date.now(),
      sessionId,
      sceneId,
      linkedAt: new Date().toISOString(),
    }
    setLinks((prev) => [...prev, newLink])
    showToast(`Scene added to session`)
  }

  const unlinkSceneFromSession = (sessionId: string, sceneId: string) => {
    setLinks((prev) => prev.filter((l) => !(l.sessionId === sessionId && l.sceneId === sceneId)))
    showToast(`Scene unlinked from session`)
  }

  const recordScenePlayed = (sessionId: string, sceneId: string) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.sessionId === sessionId && l.sceneId === sceneId ? { ...l, lastPlayedAt: new Date().toISOString() } : l
      )
    )
  }

  // FX Tracks
  const createFxTrack = (
    name: string,
    category: string,
    tags: string[],
    durationSeconds: number,
    audioUrl: string
  ): FxTrack => {
    const newFx: FxTrack = {
      id: 'fx-' + Date.now(),
      name,
      category,
      tags,
      durationSeconds,
      audioUrl: audioUrl || '/assets/audio/fx/sword_clash.ogg',
      isUserOwned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setFxTracks((prev) => [newFx, ...prev])
    showToast(`FX "${name}" added to library`)
    return newFx
  }

  const updateFxTrack = (id: string, name: string, category: string, tags: string[], durationSeconds?: number) => {
    setFxTracks((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              name,
              category,
              tags,
              durationSeconds: durationSeconds || f.durationSeconds,
              updatedAt: new Date().toISOString(),
            }
          : f
      )
    )
    showToast(`FX track updated`)
  }

  const deleteFxTrack = (id: string) => {
    const target = fxTracks.find((f) => f.id === id)
    if (!target) return
    setFxTracks((prev) => prev.filter((f) => f.id !== id))
    setSoundboardItems((prev) => prev.filter((sb) => sb.fxTrackId !== id))
    moveItemToTrash('fx', id, target.name, target)
    showToast(`FX "${target.name}" moved to Trash`)
  }

  // Soundscape Tracks & Categories
  const createSoundscapeTrack = (
    name: string,
    tags: string[],
    audioUrl: string,
    durationSeconds = 120
  ): SoundscapeTrack => {
    const newTr: SoundscapeTrack = {
      id: 'tr-' + Date.now(),
      name,
      tags,
      audioUrl: audioUrl || '/assets/audio/soundscapes/gentle_rain.ogg',
      durationSeconds,
    }
    setSoundscapeTracks((prev) => [...prev, newTr])
    return newTr
  }

  const createSoundscapeCategory = (name: string, description?: string, tags: string[] = []): SoundscapeCategory => {
    const newCat: SoundscapeCategory = {
      id: 'cat-' + Date.now(),
      name,
      description: description || '',
      tags,
      level1TrackIds: [],
      level2TrackIds: [],
      level3TrackIds: [],
      isUserOwned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSoundscapeCategories((prev) => [newCat, ...prev])
    showToast(`Soundscape Category "${name}" created`)
    return newCat
  }

  const updateSoundscapeCategory = (id: string, updates: Partial<SoundscapeCategory>) => {
    setSoundscapeCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    )
  }

  const deleteSoundscapeCategory = (id: string) => {
    const target = soundscapeCategories.find((c) => c.id === id)
    if (!target) return
    setSoundscapeCategories((prev) => prev.filter((c) => c.id !== id))
    setSoundscapeItems((prev) => prev.filter((sc) => sc.categoryId !== id))
    moveItemToTrash('soundscape', id, target.name, target)
    showToast(`Category "${target.name}" moved to Trash`)
  }

  // Active Scene soundboard items
  const addFxToSoundboard = (sceneId: string, fxTrackId: string) => {
    if (soundboardItems.some((sb) => sb.sceneId === sceneId && sb.fxTrackId === fxTrackId)) return
    const newItem: ActiveSceneSoundboardItem = {
      id: 'sb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sceneId,
      fxTrackId,
      order: soundboardItems.filter((sb) => sb.sceneId === sceneId).length,
    }
    setSoundboardItems((prev) => [...prev, newItem])
  }

  const removeFxFromSoundboard = (id: string) => {
    setSoundboardItems((prev) => prev.filter((sb) => sb.id !== id))
  }

  const reorderSoundboard = (sceneId: string, newItems: ActiveSceneSoundboardItem[]) => {
    setSoundboardItems((prev) => [
      ...prev.filter((sb) => sb.sceneId !== sceneId),
      ...newItems.map((item, idx) => ({ ...item, order: idx })),
    ])
  }

  // Active Scene soundscape items
  const addSoundscapeToScene = (sceneId: string, categoryId: string) => {
    if (soundscapeItems.some((sc) => sc.sceneId === sceneId && sc.categoryId === categoryId)) return
    const newItem: ActiveSceneSoundscapeItem = {
      id: 'sc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sceneId,
      categoryId,
      volume: 75,
      intensityLevel: 1,
      isMuted: false,
      isSolo: false,
      order: soundscapeItems.filter((sc) => sc.sceneId === sceneId).length,
    }
    setSoundscapeItems((prev) => [...prev, newItem])
  }

  const removeSoundscapeFromScene = (sceneId: string, categoryId: string) => {
    setSoundscapeItems((prev) => prev.filter((sc) => !(sc.sceneId === sceneId && sc.categoryId === categoryId)))
  }

  const updateSoundscapeItem = (sceneId: string, categoryId: string, updates: Partial<ActiveSceneSoundscapeItem>) => {
    setSoundscapeItems((prev) =>
      prev.map((sc) => (sc.sceneId === sceneId && sc.categoryId === categoryId ? { ...sc, ...updates } : sc))
    )
  }

  const reorderSoundscapes = (sceneId: string, newItems: ActiveSceneSoundscapeItem[]) => {
    setSoundscapeItems((prev) => [
      ...prev.filter((sc) => sc.sceneId !== sceneId),
      ...newItems.map((item, idx) => ({ ...item, order: idx })),
    ])
  }

  // Session lock
  const toggleSessionLock = () => setSessionLock((prev) => !prev)

  // Trash restore & purge
  const restoreTrashItem = (id: string) => {
    const item = trashItems.find((t) => t.id === id)
    if (!item) return
    setTrashItems((prev) => prev.filter((t) => t.id !== id))

    let name = item.name
    // Check collision for name
    if (item.entityType === 'campaign' && campaigns.some((c) => c.name === name)) {
      name = `${name} (restored)`
    } else if (item.entityType === 'scene' && scenes.some((s) => s.name === name)) {
      name = `${name} (restored)`
    } else if (item.entityType === 'soundscape' && soundscapeCategories.some((sc) => sc.name === name)) {
      name = `${name} (restored)`
    } else if (item.entityType === 'fx' && fxTracks.some((f) => f.name === name)) {
      name = `${name} (restored)`
    }

    if (item.entityType === 'campaign') {
      const payload = { ...(item.payload as Campaign), name, deletedAt: undefined }
      setCampaigns((prev) => [payload, ...prev])
      // Auto restore campaign sessions
      const orphanedSessions = trashItems.filter(
        (t) => t.entityType === 'session' && (t.payload as Session).campaignId === item.entityId
      )
      orphanedSessions.forEach((sTrash) => {
        setSessions((prev) => [{ ...(sTrash.payload as Session), deletedAt: undefined }, ...prev])
      })
      setTrashItems((prev) =>
        prev.filter(
          (t) => !(t.entityType === 'session' && (t.payload as Session).campaignId === item.entityId)
        )
      )
    } else if (item.entityType === 'session') {
      setSessions((prev) => [{ ...(item.payload as Session), title: name, deletedAt: undefined }, ...prev])
    } else if (item.entityType === 'scene') {
      setScenes((prev) => [{ ...(item.payload as Scene), name, deletedAt: undefined }, ...prev])
    } else if (item.entityType === 'soundscape') {
      setSoundscapeCategories((prev) => [{ ...(item.payload as SoundscapeCategory), name, deletedAt: undefined }, ...prev])
    } else if (item.entityType === 'fx') {
      setFxTracks((prev) => [{ ...(item.payload as FxTrack), name, deletedAt: undefined }, ...prev])
    }

    showToast(`Restored "${name}"`)
  }

  const restoreAllTrashItems = (entityType?: EntityType) => {
    const targets = entityType ? trashItems.filter((t) => t.entityType === entityType) : [...trashItems]
    targets.forEach((t) => restoreTrashItem(t.id))
  }

  const purgeTrashItem = (id: string) => {
    setTrashItems((prev) => prev.filter((t) => t.id !== id))
    showToast(`Permanently deleted item`)
  }

  const emptyTrash = (entityType?: EntityType) => {
    if (entityType) {
      setTrashItems((prev) => prev.filter((t) => t.entityType !== entityType))
    } else {
      setTrashItems([])
    }
    showToast(`Trash emptied`)
  }

  // Audio Playback simulation / triggers
  const toggleCategoryPlay = (categoryId: string) => {
    setPlayingCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        // Enforce max 10 concurrent category playback (silent oldest stop)
        const updated = [...prev, categoryId]
        if (updated.length > 10) {
          return updated.slice(updated.length - 10)
        }
        return updated
      }
    })
  }

  const triggerFx = (fxId: string) => {
    setActiveFxIds((prev) => {
      // Overlap max 5 concurrent total & max 5 per effect
      const currentCount = prev.filter((id) => id === fxId).length
      if (currentCount >= 5 || prev.length >= 5) {
        const sliced = prev.slice(1)
        return [...sliced, fxId]
      }
      return [...prev, fxId]
    })
    setIsDucked(true)
    setTimeout(() => {
      setActiveFxIds((prev) => {
        const idx = prev.indexOf(fxId)
        if (idx === -1) return prev
        const copy = [...prev]
        copy.splice(idx, 1)
        if (copy.length === 0) setIsDucked(false)
        return copy
      })
    }, 2500)
  }

  const stopFx = (fxId: string) => {
    setActiveFxIds((prev) => {
      const remaining = prev.filter((id) => id !== fxId)
      if (remaining.length === 0) setIsDucked(false)
      return remaining
    })
  }

  const stopAllAudio = () => {
    setPlayingCategoryIds([])
    setActiveFxIds([])
    setIsDucked(false)
    showToast('All audio stopped')
  }

  return (
    <AppContext.Provider
      value={{
        campaigns,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        sessions,
        createSession,
        updateSession,
        deleteSession,
        scenes,
        createScene,
        updateScene,
        deleteScene,
        links,
        linkSceneToSession,
        unlinkSceneFromSession,
        recordScenePlayed,
        fxTracks,
        createFxTrack,
        updateFxTrack,
        deleteFxTrack,
        soundscapeTracks,
        createSoundscapeTrack,
        soundscapeCategories,
        createSoundscapeCategory,
        updateSoundscapeCategory,
        deleteSoundscapeCategory,
        soundboardItems,
        addFxToSoundboard,
        removeFxFromSoundboard,
        reorderSoundboard,
        soundscapeItems,
        addSoundscapeToScene,
        removeSoundscapeFromScene,
        updateSoundscapeItem,
        reorderSoundscapes,
        sessionLock,
        toggleSessionLock,
        trashItems,
        restoreTrashItem,
        restoreAllTrashItems,
        purgeTrashItem,
        emptyTrash,
        masterVolume,
        setMasterVolume,
        playingCategoryIds,
        toggleCategoryPlay,
        activeFxIds,
        triggerFx,
        stopFx,
        stopAllAudio,
        isDucked,
        toastMessage,
        showToast,
        clearToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
