import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { FxTrack, SoundscapeCategory, SoundscapeTrack } from '@/types/library'
import type {
  SceneSoundboardEntry,
  SceneSoundboardSettings,
  SceneSoundscapeSettings,
  SceneSoundscapeSlot,
  SoundscapeIntensity,
} from '@/types/scene'
import { useCampaignData } from '@/context/CampaignDataContext'
import {
  SceneAudioManager,
  buildSoundscapeTrackPool,
  getSharedSceneAudioManager,
  type ScenePlaybackState,
  type SoundscapeTrackRef,
} from '@/lib/audio/sceneAudioManager'

interface SceneAudioContextValue {
  playback: ScenePlaybackState
  triggerSoundboard: (entry: SceneSoundboardEntry & { track: FxTrack }) => Promise<void>
  stopSoundboardFx: (fxTrackId: string) => void
  playSoundscape: (slotId: string) => Promise<void>
  pauseSoundscape: (slotId: string) => void
  rollSoundscapeRandom: (slotId: string) => Promise<void>
  playScene: () => Promise<void>
  stopAll: () => void
  setSoundboardMasterVolume: (volume: number) => void
  setSoundscapeMasterVolume: (volume: number) => void
  setSoundscapeMuted: (muted: boolean) => void
  updateSlotVolume: (slotId: string, volume: number) => void
  updateSlotIntensity: (slotId: string, intensity: SoundscapeIntensity) => void
  canPlaySoundscape: (slotId: string) => boolean
  hasLoadedSoundscapeTrack: (slotId: string) => boolean
  isSoundboardPlaying: (fxTrackId: string) => boolean
  getSoundscapeTileState: (slotId: string) => ScenePlaybackState['soundscapes'][string] | undefined
  setFocusedSoundscapeSlot: (slotId: string) => void
}

const SceneAudioContext = createContext<SceneAudioContextValue | null>(null)

interface SceneAudioProviderProps {
  sceneId: string
  children: ReactNode
}

function tracksForCategory(
  category: SoundscapeCategory | undefined,
  tracks: SoundscapeTrack[],
): Record<string, SoundscapeTrackRef> {
  if (!category?.levels) {
    return {}
  }
  const ids = new Set([...category.levels.I, ...category.levels.II, ...category.levels.III])
  const map: Record<string, SoundscapeTrackRef> = {}
  for (const track of tracks) {
    if (ids.has(track.id)) {
      map[track.id] = {
        id: track.id,
        name: track.name,
        audioUrl: track.audioUrl,
        durationSeconds: track.durationSeconds,
      }
    }
  }
  return map
}

let previousActiveSceneId: string | null = null

export function SceneAudioProvider({ sceneId, children }: SceneAudioProviderProps) {
  const {
    data,
    updateSoundboardSettings,
    updateSoundscapeSettings,
    updateSoundscapeSlot,
    recordSoundscapePlay,
    recordFxPlay,
  } = useCampaignData()

  const managerRef = useRef<SceneAudioManager>(getSharedSceneAudioManager())
  const focusedSlotIdRef = useRef<string | null>(null)
  const [playback, setPlayback] = useState<ScenePlaybackState>(() => managerRef.current.getState())

  const soundboardSettings = useMemo(
    () => data.sceneSoundboardSettings.find((item) => item.sceneId === sceneId),
    [data.sceneSoundboardSettings, sceneId],
  )

  const soundscapeSettings = useMemo(
    () =>
      data.sceneSoundscapeSettings.find((item) => item.sceneId === sceneId) ?? {
        sceneId,
        masterVolume: 100,
        muted: false,
      },
    [data.sceneSoundscapeSettings, sceneId],
  )

  const slots = useMemo(
    () =>
      data.sceneSoundscapeSlots
        .filter((slot) => slot.sceneId === sceneId)
        .sort((a, b) => a.order - b.order),
    [data.sceneSoundscapeSlots, sceneId],
  )

  const slotCategoryMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const slot of slots) {
      map.set(slot.id, slot.categoryId)
    }
    return map
  }, [slots])

  useEffect(() => {
    const manager = managerRef.current
    let rafId: number | undefined
    let pendingState: ScenePlaybackState | null = null
    const flushPlayback = () => {
      rafId = undefined
      if (pendingState) {
        setPlayback(pendingState)
        pendingState = null
      }
    }
    const unsubscribe = manager.subscribe((state) => {
      pendingState = state
      if (rafId === undefined) {
        rafId = requestAnimationFrame(flushPlayback)
      }
    })

    return () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId)
      }
      unsubscribe()
    }
  }, [sceneId])

  useEffect(() => {
    managerRef.current?.setSoundboardMasterVolume(soundboardSettings?.masterVolume ?? 85)
  }, [soundboardSettings?.masterVolume])

  useEffect(() => {
    managerRef.current?.setSoundscapeMasterVolume(soundscapeSettings.masterVolume)
    managerRef.current?.setSoundscapeMuted(soundscapeSettings.muted)
  }, [soundscapeSettings.masterVolume, soundscapeSettings.muted])

  useEffect(() => {
    const manager = managerRef.current
    let cancelled = false

    void (async () => {
      const fromSceneId = previousActiveSceneId
      const switchingScene = fromSceneId !== null && fromSceneId !== sceneId
      if (switchingScene) {
        await manager.switchScene(sceneId)
        if (cancelled) {
          return
        }
      }

      const slotIds = new Set(slots.map((slot) => slot.id))
      for (const slot of slots) {
        const category = data.soundscapeCategories.find((item) => item.id === slot.categoryId)
        const intensity = slot.intensity ?? 'II'
        const trackIds = buildSoundscapeTrackPool(category?.levels, intensity)
        manager.configureSoundscapeSlot({
          slotId: slot.id,
          categoryId: slot.categoryId,
          categoryName: category?.name ?? slot.categoryId,
          intensity,
          volume: slot.volume ?? 100,
          currentTrackId: slot.currentTrackId,
          trackIds,
          tracksById: tracksForCategory(category, data.soundscapeTracks ?? []),
        })
      }

      const configuredIds = Object.keys(manager.getState().soundscapes)
      for (const configuredId of configuredIds) {
        if (!slotIds.has(configuredId)) {
          manager.removeSoundscapeSlot(configuredId)
        }
      }

      previousActiveSceneId = sceneId
    })()

    return () => {
      cancelled = true
    }
  }, [sceneId, data.soundscapeCategories, data.soundscapeTracks, slots])

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return
    }

    const scene = data.scenes.find((s) => s.id === sceneId)
    const sceneName = scene?.name ?? sceneId

    const activeSoundscapes = Object.values(playback.soundscapes).filter((tile) => tile.playing)
    const playingTrackNames = activeSoundscapes
      .map((tile) => tile.trackName)
      .filter(Boolean)
      .join(', ')

    if (activeSoundscapes.length > 0) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: playingTrackNames || 'Ambience Loop',
        artist: 'Arcanum Audio',
        album: sceneName,
      })
      navigator.mediaSession.playbackState = 'playing'
    } else {
      navigator.mediaSession.playbackState = 'paused'
    }
  }, [playback, sceneId, data.scenes])

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return
    }

    const handleNextTrack = () => {
      const manager = managerRef.current
      const state = manager.getState()
      const focusedSlotId = focusedSlotIdRef.current
      const focusedPlaying =
        focusedSlotId && state.soundscapes[focusedSlotId]?.playing
          ? focusedSlotId
          : undefined
      const firstPlaying = Object.values(state.soundscapes).find((tile) => tile.playing)?.slotId
      const slotId = focusedPlaying ?? firstPlaying
      if (slotId) {
        void manager.rollSoundscapeRandom(slotId)
      }
    }

    navigator.mediaSession.setActionHandler('nexttrack', handleNextTrack)
    if (typeof window !== 'undefined') {
      window.__ARCANUM_MEDIA_NEXT__ = handleNextTrack
    }
    return () => {
      navigator.mediaSession.setActionHandler('nexttrack', null)
      if (typeof window !== 'undefined') {
        delete window.__ARCANUM_MEDIA_NEXT__
      }
    }
  }, [])



  const setFocusedSoundscapeSlot = useCallback((slotId: string) => {
    focusedSlotIdRef.current = slotId
  }, [])

  const setSoundboardMasterVolume = useCallback(
    (volume: number) => {
      managerRef.current?.setSoundboardMasterVolume(volume)
      updateSoundboardSettings(sceneId, { masterVolume: volume })
    },
    [sceneId, updateSoundboardSettings],
  )

  const setSoundscapeMasterVolume = useCallback(
    (volume: number) => {
      managerRef.current?.setSoundscapeMasterVolume(volume)
      updateSoundscapeSettings(sceneId, { masterVolume: volume })
    },
    [sceneId, updateSoundscapeSettings],
  )

  const setSoundscapeMuted = useCallback(
    (muted: boolean) => {
      managerRef.current?.setSoundscapeMuted(muted)
      updateSoundscapeSettings(sceneId, { muted })
    },
    [sceneId, updateSoundscapeSettings],
  )

  const updateSlotVolume = useCallback(
    (slotId: string, volume: number) => {
      managerRef.current?.updateSoundscapeSlotVolume(slotId, volume)
      updateSoundscapeSlot(slotId, { volume })
    },
    [updateSoundscapeSlot],
  )

  const updateSlotIntensity = useCallback(
    (slotId: string, intensity: SoundscapeIntensity) => {
      const slot = slots.find((item) => item.id === slotId)
      const category = data.soundscapeCategories.find((item) => item.id === slot?.categoryId)
      const trackIds = buildSoundscapeTrackPool(category?.levels, intensity)
      managerRef.current?.updateSoundscapeSlotIntensity(slotId, intensity, trackIds)
      updateSoundscapeSlot(slotId, { intensity })
    },
    [data.soundscapeCategories, slots, updateSoundscapeSlot],
  )

  const triggerSoundboard = useCallback(
    async (entry: SceneSoundboardEntry & { track: FxTrack }) => {
      await managerRef.current?.triggerSoundboard(
        entry.fxTrackId,
        entry.track.audioUrl,
        entry.track.name,
      )
      recordFxPlay(entry.fxTrackId)
    },
    [recordFxPlay],
  )

  const stopSoundboardFx = useCallback((fxTrackId: string) => {
    managerRef.current?.stopSoundboardFx(fxTrackId)
  }, [])

  const persistCurrentTrack = useCallback(
    (slotId: string) => {
      const trackId = managerRef.current?.getState().soundscapes[slotId]?.currentTrackId
      if (trackId) {
        updateSoundscapeSlot(slotId, { currentTrackId: trackId })
      }
    },
    [updateSoundscapeSlot],
  )

  const maybeRecordSoundscapePlay = useCallback(
    (slotId: string, wasPlaying: boolean) => {
      const nowPlaying = managerRef.current?.getState().soundscapes[slotId]?.playing ?? false
      if (!wasPlaying && nowPlaying) {
        const categoryId = slotCategoryMap.get(slotId)
        if (categoryId) {
          recordSoundscapePlay(categoryId)
        }
      }
    },
    [recordSoundscapePlay, slotCategoryMap],
  )

  const playSoundscape = useCallback(
    async (slotId: string) => {
      const wasPlaying = managerRef.current?.getState().soundscapes[slotId]?.playing ?? false
      await managerRef.current?.playSoundscape(slotId)
      persistCurrentTrack(slotId)
      maybeRecordSoundscapePlay(slotId, wasPlaying)
    },
    [maybeRecordSoundscapePlay, persistCurrentTrack],
  )

  const pauseSoundscape = useCallback((slotId: string) => {
    managerRef.current?.pauseSoundscape(slotId)
  }, [])

  const rollSoundscapeRandom = useCallback(
    async (slotId: string) => {
      setFocusedSoundscapeSlot(slotId)
      const wasPlaying = managerRef.current?.getState().soundscapes[slotId]?.playing ?? false
      await managerRef.current?.rollSoundscapeRandom(slotId)
      persistCurrentTrack(slotId)
      maybeRecordSoundscapePlay(slotId, wasPlaying)
    },
    [maybeRecordSoundscapePlay, persistCurrentTrack, setFocusedSoundscapeSlot],
  )

  const playScene = useCallback(async () => {
    const manager = managerRef.current
    const prior = new Map(
      slots.map((slot) => [slot.id, manager.getState().soundscapes[slot.id]?.playing ?? false]),
    )
    await manager.playScene()
    for (const slot of slots) {
      persistCurrentTrack(slot.id)
      maybeRecordSoundscapePlay(slot.id, prior.get(slot.id) ?? false)
    }
  }, [maybeRecordSoundscapePlay, persistCurrentTrack, slots])

  const stopAll = useCallback(() => {
    managerRef.current?.stopAll()
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return
    }

    const handlePause = () => {
      stopAll()
    }

    navigator.mediaSession.setActionHandler('pause', handlePause)
    if (typeof window !== 'undefined') {
      window.__ARCANUM_MEDIA_PAUSE__ = handlePause
    }

    return () => {
      navigator.mediaSession.setActionHandler('pause', null)
      if (typeof window !== 'undefined') {
        delete window.__ARCANUM_MEDIA_PAUSE__
      }
    }
  }, [stopAll])

  const canPlaySoundscape = useCallback((slotId: string) => {
    return managerRef.current?.canPlaySoundscape(slotId) ?? false
  }, [])

  const hasLoadedSoundscapeTrack = useCallback((slotId: string) => {
    return managerRef.current?.hasLoadedSoundscapeTrack(slotId) ?? false
  }, [])

  const isSoundboardPlaying = useCallback(
    (fxTrackId: string) => playback.soundboard[fxTrackId]?.playing ?? false,
    [playback.soundboard],
  )

  const getSoundscapeTileState = useCallback(
    (slotId: string) => playback.soundscapes[slotId],
    [playback.soundscapes],
  )

  const value = useMemo(
    () => ({
      playback,
      triggerSoundboard,
      stopSoundboardFx,
      playSoundscape,
      pauseSoundscape,
      rollSoundscapeRandom,
      playScene,
      stopAll,
      setSoundboardMasterVolume,
      setSoundscapeMasterVolume,
      setSoundscapeMuted,
      updateSlotVolume,
      updateSlotIntensity,
      canPlaySoundscape,
      hasLoadedSoundscapeTrack,
      isSoundboardPlaying,
      getSoundscapeTileState,
      setFocusedSoundscapeSlot,
    }),
    [
      playback,
      triggerSoundboard,
      stopSoundboardFx,
      playSoundscape,
      pauseSoundscape,
      rollSoundscapeRandom,
      playScene,
      stopAll,
      setSoundboardMasterVolume,
      setSoundscapeMasterVolume,
      setSoundscapeMuted,
      updateSlotVolume,
      updateSlotIntensity,
      canPlaySoundscape,
      hasLoadedSoundscapeTrack,
      isSoundboardPlaying,
      getSoundscapeTileState,
      setFocusedSoundscapeSlot,
    ],
  )

  return <SceneAudioContext.Provider value={value}>{children}</SceneAudioContext.Provider>
}

export function useSceneAudio() {
  const ctx = useContext(SceneAudioContext)
  if (!ctx) {
    throw new Error('useSceneAudio must be used within SceneAudioProvider')
  }
  return ctx
}

export type { SceneSoundboardSettings, SceneSoundscapeSettings, SceneSoundscapeSlot }

declare global {
  interface Window {
    __ARCANUM_MEDIA_NEXT__?: () => void
  }
}
