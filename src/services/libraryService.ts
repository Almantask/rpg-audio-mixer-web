import type { FXTrack, SoundscapeCategory } from '../types/library'
import { getFXTracks, saveFXTracks, getSoundscapeCategories } from './storageService'

export function getActiveFXTracks(): FXTrack[] {
  return getFXTracks().filter((f) => !f.deletedAt)
}

export function getFXTrackById(id: string): FXTrack | undefined {
  return getFXTracks().find((f) => f.id === id)
}

export function searchFXTracks(query?: string, intensity?: string): FXTrack[] {
  let tracks = getActiveFXTracks()
  if (intensity) {
    tracks = tracks.filter((t) => t.intensity === intensity)
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim()
    tracks = tracks.filter(
      (t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }
  return tracks
}

export function createFXTrack(data: {
  name: string
  audioUrl?: string
  durationSeconds?: number
  intensity?: 'I' | 'II' | 'III'
  tags?: string[]
}): FXTrack {
  const tracks = getFXTracks()
  const now = new Date().toISOString()
  const newTrack: FXTrack = {
    id: `fx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    audioUrl: data.audioUrl || '/assets/audio/soundboard/thunder.ogg',
    durationSeconds: data.durationSeconds || 3,
    intensity: data.intensity || 'I',
    tags: data.tags || ['CUSTOM'],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  tracks.unshift(newTrack)
  saveFXTracks(tracks)
  return newTrack
}

export function updateFXTrack(id: string, updates: Partial<FXTrack>): FXTrack | undefined {
  const tracks = getFXTracks()
  const idx = tracks.findIndex((f) => f.id === id)
  if (idx === -1) return undefined

  tracks[idx] = {
    ...tracks[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveFXTracks(tracks)
  return tracks[idx]
}

export function softDeleteFXTrack(id: string): void {
  const tracks = getFXTracks()
  const idx = tracks.findIndex((f) => f.id === id)
  if (idx !== -1) {
    tracks[idx].deletedAt = new Date().toISOString()
    saveFXTracks(tracks)
  }
}

export function getTrashFXTracks(): FXTrack[] {
  return getFXTracks().filter((f) => f.deletedAt)
}

export function restoreFXTrack(id: string): FXTrack | undefined {
  const tracks = getFXTracks()
  const target = tracks.find((f) => f.id === id)
  if (!target) return undefined

  let newName = target.name
  const activeNames = tracks.filter((f) => !f.deletedAt && f.id !== id).map((f) => f.name)
  if (activeNames.includes(newName)) {
    newName = `${newName} (restored)`
  }

  target.name = newName
  target.deletedAt = null
  target.updatedAt = new Date().toISOString()
  saveFXTracks(tracks)
  return target
}

export function purgeFXTrack(id: string): void {
  const tracks = getFXTracks().filter((f) => f.id !== id)
  saveFXTracks(tracks)
}

export function purgeAllTrashFX(): void {
  const tracks = getFXTracks().filter((f) => !f.deletedAt)
  saveFXTracks(tracks)
}

export function getActiveSoundscapeCategories(): SoundscapeCategory[] {
  return getSoundscapeCategories().filter((c) => !c.deletedAt)
}

export function getTrashSoundscapeCategories(): SoundscapeCategory[] {
  return getSoundscapeCategories().filter((c) => c.deletedAt)
}
