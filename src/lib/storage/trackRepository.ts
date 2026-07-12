import { db } from './db'
import { getE2EState } from './e2eState'
import type { Track } from './types'

function createId(): string {
  return crypto.randomUUID()
}

export interface CreateTrackInput {
  name: string
  format?: string
  channel?: string
  duration?: string
  fileName?: string
}

export async function listTracks(): Promise<Track[]> {
  const { tracksLoading } = getE2EState()
  if (tracksLoading) {
    return []
  }
  const tracks = await db.tracks.toArray()
  return tracks.sort((left, right) => right.createdAt - left.createdAt)
}

export async function getTrack(id: string): Promise<Track | undefined> {
  return db.tracks.get(id)
}

export async function createTrack(input: CreateTrackInput): Promise<Track> {
  const now = Date.now()
  const track: Track = {
    id: createId(),
    name: input.name.trim(),
    format: input.format ?? 'MP3',
    channel: input.channel ?? 'Stereo',
    duration: input.duration ?? '0:00',
    fileName: input.fileName,
    createdAt: now,
  }
  await db.tracks.add(track)
  return track
}

export function formatTrackMetadata(track: Track): string {
  return `${track.format} · ${track.channel} · ${track.duration}`
}

export function filterTracksByName(tracks: Track[], query: string): Track[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return tracks
  return tracks.filter((track) => track.name.toLowerCase().includes(normalized))
}

export function parseDurationFromFileName(_fileName: string): string {
  return '0:00'
}
