import React, { createContext, useContext, useEffect, useState } from 'react'
import type {
  Campaign,
  Session,
  Scene,
  SessionScene,
  SoundscapeCategory,
  SoundscapeTrack,
  FXTrack,
  SceneSoundscape,
  SoundboardItem,
  TrashItem,
  TrashEntityType,
  IntensityLevel,
} from '../types'
import {
  INITIAL_CAMPAIGNS,
  INITIAL_SESSIONS,
  INITIAL_SCENES,
  INITIAL_SESSION_SCENES,
  INITIAL_CATEGORIES,
  INITIAL_FX_TRACKS,
  INITIAL_SCENE_SOUNDSCAPES,
  INITIAL_SOUNDBOARD_ITEMS,
} from './initialData'

interface AppContextType {
  campaigns: Campaign[]
  sessions: Session[]
  scenes: Scene[]
  sessionScenes: SessionScene[]
  categories: SoundscapeCategory[]
  fxTracks: FXTrack[]
  sceneSoundscapes: SceneSoundscape[]
  soundboardItems: SoundboardItem[]
  trash: TrashItem[]
  activeSessionId: string | null
  activeSceneId: string | null
  sessionLock: boolean
  masterSoundscapeVolume: number
  masterSoundboardVolume: number
  soundscapePlayCounts: Record<string, number>
  fxPlayCounts: Record<string, number>

  // Campaign actions
  createCampaign: (data: { name: string; description?: string; coverArt?: string }) => Campaign
  softDeleteCampaign: (id: string) => void
  setActiveSessionId: (id: string | null) => void
  setActiveSceneId: (id: string | null) => void

  // Session actions
  createSession: (data: {
    campaignId: string
    name: string
    date: string
    description?: string
    coverArt?: string
  }) => Session
  updateSession: (
    id: string,
    data: Partial<Omit<Session, 'id' | 'campaignId' | 'sessionNumber'>>,
  ) => void
  softDeleteSession: (id: string) => void

  // Scene actions
  createScene: (
    data: { name: string; description?: string; backgroundImage?: string },
    sessionId?: string,
  ) => Scene
  duplicateScene: (id: string, sessionId?: string) => Scene
  updateScene: (id: string, data: Partial<Omit<Scene, 'id'>>) => void
  softDeleteScene: (id: string) => void
  unlinkSceneFromSession: (sessionId: string, sceneId: string) => void
  linkSceneToSession: (sessionId: string, sceneId: string) => void

  // Soundscape category & composer actions
  createCategory: (name: string) => SoundscapeCategory
  softDeleteCategory: (id: string) => void
  addTrackToCategoryLevel: (
    categoryId: string,
    level: IntensityLevel,
    track: SoundscapeTrack,
  ) => void
  removeTrackFromCategoryLevel: (
    categoryId: string,
    level: IntensityLevel,
    trackId: string,
  ) => void

  // FX actions
  importFXTrack: (data: {
    name: string
    url: string
    durationSeconds: number
    intensity: IntensityLevel
    tags: string[]
  }) => FXTrack
  updateFXTrack: (id: string, data: Partial<Omit<FXTrack, 'id'>>) => void
  softDeleteFXTrack: (id: string) => void

  // Scene soundscape & soundboard mixer actions
  addSoundscapeToScene: (sceneId: string, categoryId: string) => void
  removeSoundscapeFromScene: (sceneId: string, categoryId: string) => void
  updateSceneSoundscape: (
    sceneId: string,
    categoryId: string,
    data: { volume?: number; intensity?: IntensityLevel; order?: number },
  ) => void
  addFXToSoundboard: (sceneId: string, fxTrackId: string) => void
  removeFXFromSoundboard: (soundboardItemId: string) => void
  reorderSoundboardItems: (newItems: SoundboardItem[]) => void
  setSessionLock: (locked: boolean) => void
  setMasterSoundscapeVolume: (vol: number) => void
  setMasterSoundboardVolume: (vol: number) => void
  incrementSoundscapePlayCount: (categoryId: string) => void
  incrementFXPlayCount: (fxTrackId: string) => void

  // Trash actions
  restoreTrashItem: (id: string) => void
  restoreAllTab: (type: TrashEntityType) => void
  purgeTrashItem: (id: string) => void
  purgeSelectedItems: (ids: string[]) => void
  emptyTrashTab: (type: TrashEntityType) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = 'arcanum_audio_state_v1'

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_campaigns')
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS
  })

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sessions')
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS
  })

  const [scenes, setScenes] = useState<Scene[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_scenes')
    return saved ? JSON.parse(saved) : INITIAL_SCENES
  })

  const [sessionScenes, setSessionScenes] = useState<SessionScene[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_session_scenes')
    return saved ? JSON.parse(saved) : INITIAL_SESSION_SCENES
  })

  const [categories, setCategories] = useState<SoundscapeCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_categories')
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES
  })

  const [fxTracks, setFXTracks] = useState<FXTrack[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_fxtracks')
    return saved ? JSON.parse(saved) : INITIAL_FX_TRACKS
  })

  const [sceneSoundscapes, setSceneSoundscapes] = useState<SceneSoundscape[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_scene_soundscapes')
    return saved ? JSON.parse(saved) : INITIAL_SCENE_SOUNDSCAPES
  })

  const [soundboardItems, setSoundboardItems] = useState<SoundboardItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_soundboard_items')
    return saved ? JSON.parse(saved) : INITIAL_SOUNDBOARD_ITEMS
  })

  const [trash, setTrash] = useState<TrashItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_trash')
    return saved ? JSON.parse(saved) : []
  })

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [sessionLock, setSessionLock] = useState<boolean>(false)
  const [masterSoundscapeVolume, setMasterSoundscapeVolume] = useState<number>(0.8)
  const [masterSoundboardVolume, setMasterSoundboardVolume] = useState<number>(0.85)

  const [soundscapePlayCounts, setSoundscapePlayCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sc_counts')
    return saved ? JSON.parse(saved) : { 'cat-weather': 42 }
  })

  const [fxPlayCounts, setFXPlayCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_fx_counts')
    return saved ? JSON.parse(saved) : { 'fx-dragon-roar': 128 }
  })

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_campaigns', JSON.stringify(campaigns))
  }, [campaigns])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_scenes', JSON.stringify(scenes))
  }, [scenes])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_session_scenes', JSON.stringify(sessionScenes))
  }, [sessionScenes])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_fxtracks', JSON.stringify(fxTracks))
  }, [fxTracks])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_scene_soundscapes', JSON.stringify(sceneSoundscapes))
  }, [sceneSoundscapes])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_soundboard_items', JSON.stringify(soundboardItems))
  }, [soundboardItems])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_trash', JSON.stringify(trash))
  }, [trash])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sc_counts', JSON.stringify(soundscapePlayCounts))
  }, [soundscapePlayCounts])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_fx_counts', JSON.stringify(fxPlayCounts))
  }, [fxPlayCounts])

  // Helper to push soft-deleted payload into Trash
  const pushToTrash = (
    entityId: string,
    entityType: TrashEntityType,
    title: string,
    payload: Record<string, unknown>,
  ) => {
    const newItem: TrashItem = {
      id: `trash-${Date.now()}-${Math.random()}`,
      entityId,
      entityType,
      title,
      deletedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days retention
      payload,
    }
    setTrash((prev) => [newItem, ...prev])
  }

  // Campaign actions
  const createCampaign = (data: { name: string; description?: string; coverArt?: string }) => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: data.name,
      description: data.description,
      coverArt: data.coverArt,
      createdAt: Date.now(),
    }
    setCampaigns((prev) => [newCamp, ...prev])
    return newCamp
  }

  const softDeleteCampaign = (id: string) => {
    const target = campaigns.find((c) => c.id === id)
    if (!target) return

    pushToTrash(id, 'campaign', target.name, { campaign: target })
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  // Session actions
  const createSession = (data: {
    campaignId: string
    name: string
    date: string
    description?: string
    coverArt?: string
  }) => {
    const campaignSessions = sessions.filter((s) => s.campaignId === data.campaignId)
    const maxNum = campaignSessions.reduce((max, s) => Math.max(max, s.sessionNumber), 0)

    const newSess: Session = {
      id: `sess-${Date.now()}`,
      campaignId: data.campaignId,
      name: data.name,
      sessionNumber: maxNum + 1,
      date: data.date,
      description: data.description,
      coverArt: data.coverArt,
      createdAt: Date.now(),
    }
    setSessions((prev) => [newSess, ...prev])
    return newSess
  }

  const updateSession = (
    id: string,
    data: Partial<Omit<Session, 'id' | 'campaignId' | 'sessionNumber'>>,
  ) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
  }

  const softDeleteSession = (id: string) => {
    const target = sessions.find((s) => s.id === id)
    if (!target) return

    pushToTrash(id, 'session', target.name, { session: target })
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  // Scene actions
  const createScene = (
    data: { name: string; description?: string; backgroundImage?: string },
    sessionId?: string,
  ) => {
    const newSc: Scene = {
      id: `scene-${Date.now()}`,
      name: data.name,
      description: data.description,
      backgroundImage: data.backgroundImage,
      tags: [],
      createdAt: Date.now(),
    }
    setScenes((prev) => [newSc, ...prev])

    if (sessionId) {
      setSessionScenes((prev) => [
        {
          sessionId,
          sceneId: newSc.id,
          linkedAt: Date.now(),
        },
        ...prev,
      ])
    }

    return newSc
  }

  const duplicateScene = (id: string, sessionId?: string) => {
    const orig = scenes.find((s) => s.id === id)
    if (!orig) throw new Error('Scene not found')

    const newName = `Copy of ${orig.name}`
    const copySc: Scene = {
      ...orig,
      id: `scene-${Date.now()}`,
      name: newName,
      createdAt: Date.now(),
    }

    setScenes((prev) => [copySc, ...prev])

    // Duplicate linked scene soundscapes
    const origSoundscapes = sceneSoundscapes.filter((ss) => ss.sceneId === id)
    const newSoundscapes = origSoundscapes.map((ss) => ({
      ...ss,
      sceneId: copySc.id,
    }))
    setSceneSoundscapes((prev) => [...prev, ...newSoundscapes])

    // Duplicate soundboard items
    const origSoundboard = soundboardItems.filter((sb) => sb.sceneId === id)
    const newSoundboard = origSoundboard.map((sb) => ({
      ...sb,
      id: `sb-${Date.now()}-${Math.random()}`,
      sceneId: copySc.id,
    }))
    setSoundboardItems((prev) => [...prev, ...newSoundboard])

    if (sessionId) {
      setSessionScenes((prev) => [
        {
          sessionId,
          sceneId: copySc.id,
          linkedAt: Date.now(),
        },
        ...prev,
      ])
    }

    return copySc
  }

  const updateScene = (id: string, data: Partial<Omit<Scene, 'id'>>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
  }

  const softDeleteScene = (id: string) => {
    const target = scenes.find((s) => s.id === id)
    if (!target) return

    pushToTrash(id, 'scene', target.name, { scene: target })
    setScenes((prev) => prev.filter((s) => s.id !== id))
    setSessionScenes((prev) => prev.filter((ss) => ss.sceneId !== id))
  }

  const unlinkSceneFromSession = (sessionId: string, sceneId: string) => {
    setSessionScenes((prev) =>
      prev.filter((ss) => !(ss.sessionId === sessionId && ss.sceneId === sceneId)),
    )
  }

  const linkSceneToSession = (sessionId: string, sceneId: string) => {
    if (!sessionScenes.some((ss) => ss.sessionId === sessionId && ss.sceneId === sceneId)) {
      setSessionScenes((prev) => [{ sessionId, sceneId, linkedAt: Date.now() }, ...prev])
    }
  }

  // Category actions
  const createCategory = (name: string) => {
    const newCat: SoundscapeCategory = {
      id: `cat-${Date.now()}`,
      name,
      createdAt: Date.now(),
      tracksByLevel: { I: [], II: [], III: [] },
    }
    setCategories((prev) => [newCat, ...prev])
    return newCat
  }

  const softDeleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id)
    if (!target) return

    pushToTrash(id, 'soundscape', target.name, { category: target })
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const addTrackToCategoryLevel = (
    categoryId: string,
    level: IntensityLevel,
    track: SoundscapeTrack,
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        const currentTracks = cat.tracksByLevel[level] || []
        if (currentTracks.some((t) => t.id === track.id)) return cat // duplicate check within same level
        return {
          ...cat,
          tracksByLevel: {
            ...cat.tracksByLevel,
            [level]: [...currentTracks, track],
          },
        }
      }),
    )
  }

  const removeTrackFromCategoryLevel = (
    categoryId: string,
    level: IntensityLevel,
    trackId: string,
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          tracksByLevel: {
            ...cat.tracksByLevel,
            [level]: (cat.tracksByLevel[level] || []).filter((t) => t.id !== trackId),
          },
        }
      }),
    )
  }

  // FX actions
  const importFXTrack = (data: {
    name: string
    url: string
    durationSeconds: number
    intensity: IntensityLevel
    tags: string[]
  }) => {
    const newFx: FXTrack = {
      id: `fx-${Date.now()}`,
      name: data.name,
      url: data.url,
      durationSeconds: data.durationSeconds,
      intensity: data.intensity,
      tags: data.tags,
    }
    setFXTracks((prev) => [newFx, ...prev])
    return newFx
  }

  const updateFXTrack = (id: string, data: Partial<Omit<FXTrack, 'id'>>) => {
    setFXTracks((prev) => prev.map((fx) => (fx.id === id ? { ...fx, ...data } : fx)))
  }

  const softDeleteFXTrack = (id: string) => {
    const target = fxTracks.find((fx) => fx.id === id)
    if (!target) return

    pushToTrash(id, 'fx', target.name, { fxTrack: target })
    setFXTracks((prev) => prev.filter((fx) => fx.id !== id))
  }

  // Scene soundscapes & soundboard mixer actions
  const addSoundscapeToScene = (sceneId: string, categoryId: string) => {
    if (sceneSoundscapes.some((ss) => ss.sceneId === sceneId && ss.categoryId === categoryId)) {
      return
    }

    const sceneCategories = sceneSoundscapes.filter((ss) => ss.sceneId === sceneId)
    const nextOrder = sceneCategories.length

    const newSS: SceneSoundscape = {
      sceneId,
      categoryId,
      volume: 1.0,
      intensity: 'I',
      order: nextOrder,
    }
    setSceneSoundscapes((prev) => [...prev, newSS])
  }

  const removeSoundscapeFromScene = (sceneId: string, categoryId: string) => {
    setSceneSoundscapes((prev) =>
      prev.filter((ss) => !(ss.sceneId === sceneId && ss.categoryId === categoryId)),
    )
  }

  const updateSceneSoundscape = (
    sceneId: string,
    categoryId: string,
    data: { volume?: number; intensity?: IntensityLevel; order?: number },
  ) => {
    setSceneSoundscapes((prev) =>
      prev.map((ss) => {
        if (ss.sceneId === sceneId && ss.categoryId === categoryId) {
          return { ...ss, ...data }
        }
        return ss
      }),
    )
  }

  const addFXToSoundboard = (sceneId: string, fxTrackId: string) => {
    const sceneItems = soundboardItems.filter((sb) => sb.sceneId === sceneId)
    if (sceneItems.length >= 24) return // soft cap 24

    const newItem: SoundboardItem = {
      id: `sb-${Date.now()}-${Math.random()}`,
      sceneId,
      fxTrackId,
      order: sceneItems.length,
    }
    setSoundboardItems((prev) => [...prev, newItem])
  }

  const removeFXFromSoundboard = (soundboardItemId: string) => {
    setSoundboardItems((prev) => prev.filter((sb) => sb.id !== soundboardItemId))
  }

  const reorderSoundboardItems = (newItems: SoundboardItem[]) => {
    setSoundboardItems((prev) => {
      const otherSceneItems = prev.filter((sb) => sb.sceneId !== newItems[0]?.sceneId)
      return [...otherSceneItems, ...newItems]
    })
  }

  const incrementSoundscapePlayCount = (categoryId: string) => {
    setSoundscapePlayCounts((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || 0) + 1,
    }))
  }

  const incrementFXPlayCount = (fxTrackId: string) => {
    setFXPlayCounts((prev) => ({
      ...prev,
      [fxTrackId]: (prev[fxTrackId] || 0) + 1,
    }))
  }

  // Trash actions
  const restoreTrashItem = (id: string) => {
    const target = trash.find((item) => item.id === id)
    if (!target) return

    if (target.entityType === 'campaign' && target.payload.campaign) {
      const camp = target.payload.campaign as Campaign
      const existing = campaigns.find((c) => c.name === camp.name)
      const name = existing ? `${camp.name} (restored)` : camp.name
      setCampaigns((prev) => [{ ...camp, name }, ...prev])
    } else if (target.entityType === 'session' && target.payload.session) {
      const sess = target.payload.session as Session
      setSessions((prev) => [sess, ...prev])
    } else if (target.entityType === 'scene' && target.payload.scene) {
      const sc = target.payload.scene as Scene
      setScenes((prev) => [sc, ...prev])
    } else if (target.entityType === 'soundscape' && target.payload.category) {
      const cat = target.payload.category as SoundscapeCategory
      setCategories((prev) => [cat, ...prev])
    } else if (target.entityType === 'fx' && target.payload.fxTrack) {
      const fx = target.payload.fxTrack as FXTrack
      setFXTracks((prev) => [fx, ...prev])
    }

    setTrash((prev) => prev.filter((t) => t.id !== id))
  }

  const restoreAllTab = (type: TrashEntityType) => {
    const tabItems = trash.filter((t) => t.entityType === type)
    tabItems.forEach((t) => restoreTrashItem(t.id))
  }

  const purgeTrashItem = (id: string) => {
    setTrash((prev) => prev.filter((t) => t.id !== id))
  }

  const purgeSelectedItems = (ids: string[]) => {
    setTrash((prev) => prev.filter((t) => !ids.includes(t.id)))
  }

  const emptyTrashTab = (type: TrashEntityType) => {
    setTrash((prev) => prev.filter((t) => t.entityType !== type))
  }

  return (
    <AppContext.Provider
      value={{
        campaigns,
        sessions,
        scenes,
        sessionScenes,
        categories,
        fxTracks,
        sceneSoundscapes,
        soundboardItems,
        trash,
        activeSessionId,
        activeSceneId,
        sessionLock,
        masterSoundscapeVolume,
        masterSoundboardVolume,
        soundscapePlayCounts,
        fxPlayCounts,

        createCampaign,
        softDeleteCampaign,
        setActiveSessionId,
        setActiveSceneId,

        createSession,
        updateSession,
        softDeleteSession,

        createScene,
        duplicateScene,
        updateScene,
        softDeleteScene,
        unlinkSceneFromSession,
        linkSceneToSession,

        createCategory,
        softDeleteCategory,
        addTrackToCategoryLevel,
        removeTrackFromCategoryLevel,

        importFXTrack,
        updateFXTrack,
        softDeleteFXTrack,

        addSoundscapeToScene,
        removeSoundscapeFromScene,
        updateSceneSoundscape,
        addFXToSoundboard,
        removeFXFromSoundboard,
        reorderSoundboardItems,
        setSessionLock,
        setMasterSoundscapeVolume,
        setMasterSoundboardVolume,
        incrementSoundscapePlayCount,
        incrementFXPlayCount,

        restoreTrashItem,
        restoreAllTab,
        purgeTrashItem,
        purgeSelectedItems,
        emptyTrashTab,
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
