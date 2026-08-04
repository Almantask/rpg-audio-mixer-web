import { useState, useEffect, useRef } from 'react'
import { AppShell } from './components/layout/AppShell'
import { Home } from './pages/Home'
import { Campaigns } from './pages/Campaigns'
import { Sessions } from './pages/Sessions'
import { SessionScenes } from './pages/SessionScenes'
import { Scenes } from './pages/Scenes'
import { ActiveScene } from './pages/ActiveScene'
import { Library } from './pages/Library'
import { CategoryComposer } from './pages/CategoryComposer'
import { Credits } from './pages/Credits'
import { Trash } from './pages/Trash'
import { storage } from './lib/storage'
import type { Campaign, Session, Scene, SessionScene, FxTrack, SoundscapeCategory, SoundscapeTrack } from './types'

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname)

  // State loaded from storage
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => storage.getCampaigns())
  const [sessions, setSessions] = useState<Session[]>(() => storage.getSessions())
  const [scenes, setScenes] = useState<Scene[]>(() => storage.getScenes())
  const [sessionScenes, setSessionScenes] = useState<SessionScene[]>(() => storage.getSessionScenes())
  const [fxTracks, setFxTracks] = useState<FxTrack[]>(() => storage.getFxLibrary())
  const [soundscapeCategories, setSoundscapeCategories] = useState<SoundscapeCategory[]>(() => storage.getSoundscapes())

  // Navigation route state
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)
  const [editingCampaignIdFromSessions, setEditingCampaignIdFromSessions] = useState<string | null>(null)
  const [activeComposerCategoryId, setActiveComposerCategoryId] = useState<string | null>(null)

  // Sync state changes to storage
  useEffect(() => storage.saveCampaigns(campaigns), [campaigns])
  useEffect(() => storage.saveSessions(sessions), [sessions])
  useEffect(() => storage.saveScenes(scenes), [scenes])
  useEffect(() => storage.saveSessionScenes(sessionScenes), [sessionScenes])
  useEffect(() => storage.saveFxLibrary(fxTracks), [fxTracks])
  useEffect(() => storage.saveSoundscapes(soundscapeCategories), [soundscapeCategories])

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  // Active Highlight determination
  const getActiveHighlight = () => {
    if (currentPath === '/') return 'Home'
    if (currentPath.startsWith('/campaigns') || currentPath.startsWith('/sessions') || (currentPath === '/active-scene' && activeSessionId)) return 'Campaigns'
    if (currentPath.startsWith('/scenes') || (currentPath === '/active-scene' && !activeSessionId)) return 'Scenes'
    if (currentPath.startsWith('/library')) return 'Library'
    if (currentPath.startsWith('/credits')) return 'Credits'
    if (currentPath.startsWith('/trash')) return 'Trash'
    return undefined
  }

  // Handlers for Campaigns
  const handleCreateCampaign = (name: string, description: string) => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
    }
    setCampaigns((prev) => [...prev, newCamp])
  }

  const handleEditCampaign = (id: string, name: string, description: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description } : c))
    )
  }

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c))
    )
  }

  // Handlers for Sessions
  const handleCreateSession = (name: string, description: string) => {
    if (!activeCampaignId) return
    const newSess: Session = {
      id: `sess-${Date.now()}`,
      campaignId: activeCampaignId,
      name,
      description,
      createdAt: new Date().toISOString(),
    }
    setSessions((prev) => [...prev, newSess])
  }

  const handleEditSession = (id: string, name: string, description: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, description } : s))
    )
  }

  const handleDeleteSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s))
    )
  }

  // Handlers for Scenes
  const handleCreateScene = (name: string, description: string, tags: string[]) => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name,
      description,
      tags,
      soundscapeCategoryIds: [],
      soundboardFxIds: [],
      isUserOwned: true,
      createdAt: new Date().toISOString(),
    }
    setScenes((prev) => [...prev, newScene])
    return newScene
  }

  const handleUpdateScene = (id: string, updates: Partial<Scene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const handleDeleteScene = (id: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s))
    )
  }

  const handleLinkSceneToSession = (sceneId: string) => {
    if (!activeSessionId) return
    setSessionScenes((prev) => [
      ...prev.filter((ss) => !(ss.sessionId === activeSessionId && ss.sceneId === sceneId)),
      { sessionId: activeSessionId, sceneId, linkedAt: new Date().toISOString() },
    ])
  }

  const handleUnlinkSceneFromSession = (sceneId: string) => {
    if (!activeSessionId) return
    setSessionScenes((prev) =>
      prev.filter((ss) => !(ss.sessionId === activeSessionId && ss.sceneId === sceneId))
    )
  }

  const handleCreateAndLinkScene = (name: string, description: string) => {
    const newScene = handleCreateScene(name, description, [])
    if (activeSessionId) {
      handleLinkSceneToSession(newScene.id)
    }
  }

  // Active Scene soundscape/FX mutations
  const handleAddSoundscapeToActiveScene = (categoryId: string) => {
    if (!activeSceneId) return
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              soundscapeCategoryIds: Array.from(
                new Set([...s.soundscapeCategoryIds, categoryId])
              ),
            }
          : s
      )
    )
  }

  const handleAddFxToActiveBoard = (fxId: string) => {
    if (!activeSceneId) return
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              soundboardFxIds: Array.from(new Set([...s.soundboardFxIds, fxId])),
            }
          : s
      )
    )
  }

  const handleRemoveSoundscapeFromActiveScene = (categoryId: string) => {
    if (!activeSceneId) return
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              soundscapeCategoryIds: s.soundscapeCategoryIds.filter(
                (id) => id !== categoryId
              ),
            }
          : s
      )
    )
  }

  const handleRemoveFxFromActiveBoard = (fxId: string) => {
    if (!activeSceneId) return
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              soundboardFxIds: s.soundboardFxIds.filter((id) => id !== fxId),
            }
          : s
      )
    )
  }

  // Library Handlers
  const handleCreateSoundscapeCategory = (name: string, description: string, tags: string[]) => {
    const newCat: SoundscapeCategory = {
      id: `sc-${Date.now()}`,
      name,
      description,
      tags,
      tracks: { level1: [], level2: [], level3: [] },
    }
    setSoundscapeCategories((prev) => [...prev, newCat])
  }

  const handleDeleteSoundscapeCategory = (id: string) => {
    setSoundscapeCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c))
    )
  }

  const handleEditFx = (id: string, name: string, category: string) => {
    setFxTracks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name, category } : f))
    )
  }

  // Composer Track Management
  const handleAddTrackToLevel = (
    level: 'level1' | 'level2' | 'level3',
    track: SoundscapeTrack
  ) => {
    if (!activeComposerCategoryId) return
    setSoundscapeCategories((prev) =>
      prev.map((c) =>
        c.id === activeComposerCategoryId
          ? {
              ...c,
              tracks: {
                ...c.tracks,
                [level]: [...c.tracks[level], track],
              },
            }
          : c
      )
    )
  }

  const handleRemoveTrackFromLevel = (
    level: 'level1' | 'level2' | 'level3',
    trackId: string
  ) => {
    if (!activeComposerCategoryId) return
    setSoundscapeCategories((prev) =>
      prev.map((c) =>
        c.id === activeComposerCategoryId
          ? {
              ...c,
              tracks: {
                ...c.tracks,
                [level]: c.tracks[level].filter((t) => t.id !== trackId),
              },
            }
          : c
      )
    )
  }

  // Trash Restore / Purge
  const handleRestoreCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, deletedAt: null } : c)))
  }

  const handleRestoreSession = (id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, deletedAt: null } : s)))
  }

  const handleRestoreScene = (id: string) => {
    setScenes((prev) => prev.map((sc) => (sc.id === id ? { ...sc, deletedAt: null } : sc)))
  }

  const handleRestoreSoundscape = (id: string) => {
    setSoundscapeCategories((prev) => prev.map((sc) => (sc.id === id ? { ...sc, deletedAt: null } : sc)))
  }

  const handleRestoreFx = (id: string) => {
    setFxTracks((prev) => prev.map((f) => (f.id === id ? { ...f, deletedAt: null } : f)))
  }

  const handleEmptyTrash = (tab: string) => {
    if (tab === 'Campaigns') setCampaigns((prev) => prev.filter((c) => !c.deletedAt))
    if (tab === 'Sessions') setSessions((prev) => prev.filter((s) => !s.deletedAt))
    if (tab === 'Scenes') setScenes((prev) => prev.filter((s) => !s.deletedAt))
    if (tab === 'Soundscapes') setSoundscapeCategories((prev) => prev.filter((s) => !s.deletedAt))
    if (tab === 'FX') setFxTracks((prev) => prev.filter((f) => !f.deletedAt))
  }

  // Screen Router
  const renderScreen = () => {
    if (currentPath === '/') {
      return (
        <Home
          campaigns={campaigns}
          sessions={sessions}
          onOpenCampaign={(campId) => {
            setActiveCampaignId(campId)
            navigateTo('/campaigns/sessions')
          }}
          onOpenSession={(sessId) => {
            const sess = sessions.find((s) => s.id === sessId)
            if (sess) {
              setActiveCampaignId(sess.campaignId)
              setActiveSessionId(sess.id)
              navigateTo('/sessions/scenes')
            }
          }}
        />
      )
    }

    if (currentPath === '/campaigns') {
      return (
        <Campaigns
          campaigns={campaigns}
          sessions={sessions}
          initialEditingCampaignId={editingCampaignIdFromSessions}
          onCreateCampaign={handleCreateCampaign}
          onEditCampaign={(id, n, d) => {
            handleEditCampaign(id, n, d)
            setEditingCampaignIdFromSessions(null)
          }}
          onDeleteCampaign={handleDeleteCampaign}
          onOpenCampaign={(id) => {
            setActiveCampaignId(id)
            setCampaigns((prev) => {
              const target = prev.find((c) => c.id === id)
              if (!target) return prev
              return [target, ...prev.filter((c) => c.id !== id)]
            })
            navigateTo('/campaigns/sessions')
          }}
        />
      )
    }

    if (currentPath === '/campaigns/sessions') {
      const camp = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0]
      if (!camp) return <div className="text-gray-400">Campaign not found.</div>
      return (
        <Sessions
          campaign={camp}
          sessions={sessions}
          onCreateSession={handleCreateSession}
          onEditSession={handleEditSession}
          onDeleteSession={handleDeleteSession}
          onOpenSession={(id) => {
            setActiveSessionId(id)
            navigateTo('/sessions/scenes')
          }}
          onOpenEditCampaign={() => {
            setEditingCampaignIdFromSessions(camp.id)
            navigateTo('/campaigns')
          }}
        />
      )
    }

    if (currentPath === '/sessions/scenes') {
      const camp = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0]
      const sess = sessions.find((s) => s.id === activeSessionId) || sessions[0]
      if (!camp || !sess) return <div className="text-gray-400">Session not found.</div>
      return (
        <SessionScenes
          campaign={camp}
          session={sess}
          scenes={scenes}
          sessionScenes={sessionScenes}
          onLinkScene={handleLinkSceneToSession}
          onUnlinkScene={handleUnlinkSceneFromSession}
          onCreateAndLinkScene={handleCreateAndLinkScene}
          onOpenScene={(sceneId) => {
            setActiveSceneId(sceneId)
            // Update lastActiveAt timestamp for this session scene link
            setSessionScenes((prev) =>
              prev.map((ss) =>
                ss.sessionId === sess.id && ss.sceneId === sceneId
                  ? { ...ss, lastActiveAt: new Date().toISOString() }
                  : ss
              )
            )
            navigateTo('/active-scene')
          }}
          onNavigateToCampaign={() => navigateTo('/campaigns')}
          onNavigateToSession={() => navigateTo('/campaigns/sessions')}
        />
      )
    }

    if (currentPath === '/scenes') {
      return (
        <Scenes
          scenes={scenes}
          sessionScenes={sessionScenes}
          onCreateScene={handleCreateScene}
          onUpdateScene={handleUpdateScene}
          onDeleteScene={handleDeleteScene}
          onOpenScene={(sceneId) => {
            setActiveSceneId(sceneId)
            setActiveSessionId(null) // Global scene context
            navigateTo('/active-scene')
          }}
        />
      )
    }

    if (currentPath === '/active-scene') {
      const scene = scenes.find((s) => s.id === activeSceneId) || scenes[0]
      const camp = campaigns.find((c) => c.id === activeCampaignId)
      const sess = sessions.find((s) => s.id === activeSessionId)
      if (!scene) return <div className="text-gray-400">No scene selected.</div>
      return (
        <ActiveScene
          scene={scene}
          soundscapeCategories={soundscapeCategories}
          fxTracks={fxTracks}
          campaign={camp}
          session={sess}
          onAddSoundscapeToScene={handleAddSoundscapeToActiveScene}
          onAddFxToBoard={handleAddFxToActiveBoard}
          onRemoveSoundscapeFromScene={handleRemoveSoundscapeFromActiveScene}
          onRemoveFxFromBoard={handleRemoveFxFromActiveBoard}
        />
      )
    }

    if (currentPath === '/library') {
      return (
        <Library
          soundscapeCategories={soundscapeCategories}
          fxTracks={fxTracks}
          onCreateCategory={handleCreateSoundscapeCategory}
          onDeleteCategory={handleDeleteSoundscapeCategory}
          onEditFx={handleEditFx}
          onOpenComposer={(categoryId) => {
            setActiveComposerCategoryId(categoryId)
            navigateTo('/library/composer')
          }}
        />
      )
    }

    if (currentPath === '/library/composer') {
      const cat = soundscapeCategories.find((c) => c.id === activeComposerCategoryId) || soundscapeCategories[0]
      if (!cat) return <div className="text-gray-400">Category not found.</div>
      return (
        <CategoryComposer
          category={cat}
          onBackToLibrary={() => navigateTo('/library')}
          onAddTrackToLevel={handleAddTrackToLevel}
          onRemoveTrackFromLevel={handleRemoveTrackFromLevel}
        />
      )
    }

    if (currentPath === '/credits') {
      return <Credits />
    }

    if (currentPath === '/trash') {
      return (
        <Trash
          campaigns={campaigns}
          sessions={sessions}
          scenes={scenes}
          soundscapes={soundscapeCategories}
          fxTracks={fxTracks}
          onRestoreCampaign={handleRestoreCampaign}
          onRestoreSession={handleRestoreSession}
          onRestoreScene={handleRestoreScene}
          onRestoreSoundscape={handleRestoreSoundscape}
          onRestoreFx={handleRestoreFx}
          onEmptyTrash={handleEmptyTrash}
        />
      )
    }

    return <div className="text-gray-400">Page not found</div>
  }

  return (
    <AppShell
      currentPath={currentPath}
      onNavigate={navigateTo}
      activeHighlight={getActiveHighlight()}
    >
      {renderScreen()}
    </AppShell>
  )
}
