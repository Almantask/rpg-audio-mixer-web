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

export function SceneAudioProvider({ sceneId, children }: SceneAudioProviderProps) {
  const {
    data,
    updateSoundboardSettings,
    updateSoundscapeSettings,
    updateSoundscapeSlot,
  } = useCampaignData()

  const managerRef = useRef<SceneAudioManager | null>(null)
  const [playback, setPlayback] = useState<ScenePlaybackState>(() => ({
    soundboard: {},
    soundscapes: {},
    soundboardMasterVolume: 85,
    soundscapeMasterVolume: 100,
    soundscapeMuted: false,
  }))

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

  useEffect(() => {
    const manager = new SceneAudioManager()
    managerRef.current = manager
    const unsubscribe = manager.subscribe(setPlayback)
    return () => {
      unsubscribe()
      manager.dispose()
      managerRef.current = null
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
    if (!manager) {
      return
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
  }, [data.soundscapeCategories, data.soundscapeTracks, slots])

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

  const triggerSoundboard = useCallback(async (entry: SceneSoundboardEntry & { track: FxTrack }) => {
    await managerRef.current?.triggerSoundboard(entry.fxTrackId, entry.track.audioUrl, entry.track.name)
  }, [])

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

  const playSoundscape = useCallback(async (slotId: string) => {
    await managerRef.current?.playSoundscape(slotId)
    persistCurrentTrack(slotId)
  }, [persistCurrentTrack])

  const pauseSoundscape = useCallback((slotId: string) => {
    managerRef.current?.pauseSoundscape(slotId)
  }, [])

  const rollSoundscapeRandom = useCallback(async (slotId: string) => {
    await managerRef.current?.rollSoundscapeRandom(slotId)
    persistCurrentTrack(slotId)
  }, [persistCurrentTrack])

  const stopAll = useCallback(() => {
    managerRef.current?.stopAll()
  }, [])

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
    }),
    [
      playback,
      triggerSoundboard,
      stopSoundboardFx,
      playSoundscape,
      pauseSoundscape,
      rollSoundscapeRandom,
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
