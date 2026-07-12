import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { audioEngine } from '@/lib/audio'
import '@/lib/audio/testHooks'
import { showError } from '@/lib/errors/errorStore'
import { db } from '@/lib/storage/db'
import { incrementPlayStat } from '@/lib/storage/playStatsRepository'
import {
  getCategoryTrackCounts,
  getTrackPool,
  listSceneEffects,
  listSceneSoundscapes,
  reorderSceneEffects,
  reorderSceneSoundscapes,
  updateCategoryIntensity,
  updateCategoryLoadedTrack,
  updateCategoryVolume,
  updateSceneMasterMuted,
  updateSceneMasterVolume,
  updateSceneSessionLocked,
  updateSceneSoundboardMaster,
} from '@/lib/storage/sceneContentRepository'
import type { IntensityLevelNumber, SceneEffect, SceneSoundscape } from '@/lib/storage/types'

export function useSceneMixer(sceneId: string | undefined) {
  const [, setTick] = useState(0)

  const scene = useLiveQuery(() => (sceneId ? db.scenes.get(sceneId) : undefined), [sceneId])
  const soundscapes = useLiveQuery(
    () => (sceneId ? listSceneSoundscapes(sceneId) : []),
    [sceneId],
  )
  const effects = useLiveQuery(() => (sceneId ? listSceneEffects(sceneId) : []), [sceneId])

  useEffect(() => {
    return audioEngine.subscribe(() => setTick((value) => value + 1))
  }, [])

  useEffect(() => {
    audioEngine.setTrackResolver((categoryId, level) => getTrackPool(categoryId, level))
  }, [])

  useEffect(() => {
    if (!scene) return
    audioEngine.setMasterVolume(scene.masterVolume ?? 100)
    audioEngine.setMasterMuted(scene.masterMuted ?? false)
    audioEngine.setSoundboardMaster(scene.soundboardMaster ?? 100)
  }, [scene?.masterVolume, scene?.masterMuted, scene?.soundboardMaster, scene])

  const syncLoadedTracks = useCallback(async (items: SceneSoundscape[]) => {
    for (const item of items) {
      if (item.loadedTrackId && item.loadedTrackName) {
        await audioEngine.loadCategoryTrack({
          sceneSoundscapeId: item.id,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          trackId: item.loadedTrackId,
          trackName: item.loadedTrackName,
          intensityLevel: item.intensity,
          categoryVolumePercent: item.volume,
        })
      }
    }
  }, [])

  useEffect(() => {
    if (!soundscapes) return
    void syncLoadedTracks(soundscapes)
  }, [soundscapes, syncLoadedTracks])

  const resolveTracks = useCallback(async (categoryId: string, intensity: IntensityLevelNumber) => {
    return getTrackPool(categoryId, intensity)
  }, [])

  const rollCategory = useCallback(
    async (item: SceneSoundscape) => {
      const tracks = await resolveTracks(item.categoryId, item.intensity)
      if (tracks.length === 0) return undefined
      const track = await audioEngine.rollRandomTrack({
        sceneSoundscapeId: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        intensityLevel: item.intensity,
        categoryVolumePercent: item.volume,
        tracks,
      })
      if (track) {
        await updateCategoryLoadedTrack(item.id, track)
      }
      return track
    },
    [resolveTracks],
  )

  const playCategory = useCallback(
    async (item: SceneSoundscape) => {
      try {
        await audioEngine.ensureContext()
        if (!item.loadedTrackId) {
          const track = await rollCategory(item)
          if (!track) return
        } else {
          await audioEngine.loadCategoryTrack({
            sceneSoundscapeId: item.id,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            trackId: item.loadedTrackId,
            trackName: item.loadedTrackName ?? 'Track',
            intensityLevel: item.intensity,
            categoryVolumePercent: item.volume,
          })
        }
        const priorStatus = audioEngine.getLoopStatus(item.id)
        await audioEngine.playCategory(item.id)
        if (priorStatus === 'idle') {
          await incrementPlayStat('soundscape', item.categoryId)
        }
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Failed to play soundscape category')
      }
    },
    [rollCategory],
  )

  const pauseCategory = useCallback((item: SceneSoundscape) => {
    audioEngine.pauseCategory(item.id)
  }, [])

  const toggleCategoryPlayback = useCallback(
    async (item: SceneSoundscape) => {
      const status = audioEngine.getLoopStatus(item.id)
      if (status === 'playing') {
        pauseCategory(item)
        return
      }
      await playCategory(item)
    },
    [pauseCategory, playCategory],
  )

  const setCategoryIntensity = useCallback(
    async (item: SceneSoundscape, intensity: IntensityLevelNumber) => {
      const tracks = await resolveTracks(item.categoryId, intensity)
      if (tracks.length === 0) return
      await updateCategoryIntensity(item.id, intensity)
      const status = audioEngine.getLoopStatus(item.id)
      if (status === 'playing') {
        const track = tracks[Math.floor(Math.random() * tracks.length)]
        await audioEngine.crossfadeToTrack(item.id, track, intensity)
        await updateCategoryLoadedTrack(item.id, track)
      }
    },
    [resolveTracks],
  )

  const setCategoryVolume = useCallback(async (item: SceneSoundscape, volume: number) => {
    await updateCategoryVolume(item.id, volume)
    audioEngine.updateCategoryVolumeByName(item.categoryName, volume)
  }, [])

  const setMasterVolume = useCallback(
    async (value: number) => {
      if (!sceneId) return
      await updateSceneMasterVolume(sceneId, value)
      audioEngine.setMasterVolume(value)
      for (const item of soundscapes ?? []) {
        audioEngine.updateCategoryVolumeByName(item.categoryName, item.volume)
      }
    },
    [sceneId, soundscapes],
  )

  const toggleMasterMute = useCallback(async () => {
    if (!sceneId || !scene) return
    const next = !(scene.masterMuted ?? false)
    await updateSceneMasterMuted(sceneId, next)
    audioEngine.setMasterMuted(next)
  }, [scene, sceneId])

  const setSoundboardMaster = useCallback(
    async (value: number) => {
      if (!sceneId) return
      await updateSceneSoundboardMaster(sceneId, value)
      audioEngine.setSoundboardMaster(value)
    },
    [sceneId],
  )

  const toggleSessionLock = useCallback(async () => {
    if (!sceneId || !scene) return
    await updateSceneSessionLocked(sceneId, !(scene.sessionLocked ?? false))
  }, [scene, sceneId])

  const triggerEffect = useCallback(async (effect: SceneEffect) => {
    try {
      await audioEngine.ensureContext()
      await audioEngine.triggerEffect(effect.name)
      if (effect.fxTrackId) {
        await incrementPlayStat('fx', effect.fxTrackId)
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : `Failed to load "${effect.name}"`)
    }
  }, [])

  const stopEffect = useCallback((effectName: string) => {
    audioEngine.stopEffectInstances(effectName)
  }, [])

  const stopAll = useCallback(() => {
    audioEngine.stopAll()
  }, [])

  const reorderSoundscapes = useCallback(
    async (orderedIds: string[]) => {
      if (!sceneId) return
      await reorderSceneSoundscapes(sceneId, orderedIds)
    },
    [sceneId],
  )

  const reorderEffects = useCallback(
    async (orderedIds: string[]) => {
      if (!sceneId) return
      await reorderSceneEffects(sceneId, orderedIds)
    },
    [sceneId],
  )

  const getCategoryState = useCallback(
    (categoryName: string) => audioEngine.getCategoryState(categoryName),
    [],
  )

  const playScene = useCallback(async () => {
    for (const item of soundscapes ?? []) {
      const status = audioEngine.getLoopStatus(item.id)
      if (status === 'playing') continue
      const tracks = await resolveTracks(item.categoryId, item.intensity)
      if (tracks.length === 0) continue
      await playCategory(item)
    }
  }, [playCategory, resolveTracks, soundscapes])

  const rollCategoryForMediaSession = useCallback(
    async (categoryName: string) => {
      const item = (soundscapes ?? []).find((entry) => entry.categoryName === categoryName)
      if (!item) return
      await rollCategory(item)
      const status = audioEngine.getLoopStatus(item.id)
      if (status === 'playing' || status === 'paused') {
        await audioEngine.playCategory(item.id)
      }
    },
    [rollCategory, soundscapes],
  )

  const snapshot = useMemo(() => audioEngine.getSnapshot(), [scene, soundscapes, effects])

  return {
    scene,
    soundscapes: soundscapes ?? [],
    effects: effects ?? [],
    snapshot,
    playCategory,
    playScene,
    pauseCategory,
    toggleCategoryPlayback,
    rollCategory,
    setCategoryIntensity,
    setCategoryVolume,
    setMasterVolume,
    toggleMasterMute,
    setSoundboardMaster,
    toggleSessionLock,
    triggerEffect,
    stopEffect,
    stopAll,
    reorderSoundscapes,
    reorderEffects,
    getCategoryState,
    resolveTracks,
    getCategoryTrackCounts,
    rollCategoryForMediaSession,
  }
}
