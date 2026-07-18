import type { FxIntensity, FxTrack, FxType } from '@/types/library'

const AUDIO_BASE = '/assets/audio/soundboard'

/** Measured from bundled OGG assets (rounded seconds, minimum 1). */
const BUNDLED_FX_FILES = [
  { file: 'arrow.ogg', durationSeconds: 1 },
  { file: 'arrow2.ogg', durationSeconds: 1 },
  { file: 'arrow3.ogg', durationSeconds: 1 },
  { file: 'dog_bark.ogg', durationSeconds: 1 },
  { file: 'dragon_roar2.ogg', durationSeconds: 8 },
  { file: 'dragon_roar3.ogg', durationSeconds: 3 },
  { file: 'dragon-studio-dragon-roar-364478.ogg', durationSeconds: 8 },
  { file: 'musicholder-sword-sound-260274.ogg', durationSeconds: 1 },
  { file: 'owl_hooting.ogg', durationSeconds: 4 },
  { file: 'sword.ogg', durationSeconds: 2 },
  { file: 'sword4.ogg', durationSeconds: 2 },
  { file: 'sword5.ogg', durationSeconds: 2 },
  { file: 'sword6.ogg', durationSeconds: 2 },
  { file: 'sword7.ogg', durationSeconds: 2 },
  { file: 'whip.ogg', durationSeconds: 2 },
] as const

function displayNameFromFile(file: string): string {
  const baseName = file.replace(/\.[^.]+$/, '')
  return baseName.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function inferFxType(name: string): FxType {
  const lower = name.toLowerCase()
  if (lower.includes('sword') || lower.includes('arrow') || lower.includes('whip')) {
    return 'COMBAT'
  }
  if (lower.includes('dragon') || lower.includes('dog') || lower.includes('owl')) {
    return 'CREATURE'
  }
  return 'OTHER'
}

function inferFxIntensity(name: string): FxIntensity {
  const lower = name.toLowerCase()
  if (lower.includes('dragon') || lower.includes('sword7') || lower.includes('sword6')) {
    return 'III'
  }
  if (
    lower.includes('sword4') ||
    lower.includes('sword5') ||
    lower.includes('whip') ||
    lower.includes('musicholder')
  ) {
    return 'II'
  }
  return 'I'
}

function inferFxTags(name: string, type: FxType): string[] {
  const lower = name.toLowerCase()
  const tags = new Set<string>()

  if (type === 'COMBAT' || type === 'CREATURE' || type === 'IMPACT' || type === 'MAGIC') {
    tags.add(type.charAt(0) + type.slice(1).toLowerCase())
  } else if (type === 'UI') {
    tags.add('UI')
  } else if (type === 'AMBIENT') {
    tags.add('Ambient')
  } else {
    tags.add('Other')
  }

  if (lower.includes('arrow') || lower.includes('sword') || lower.includes('whip')) {
    tags.add('Weapon')
    tags.add('Impact')
  }
  if (lower.includes('dragon')) {
    tags.add('Boss')
    tags.add('Impact')
  }
  if (lower.includes('dog') || lower.includes('owl')) {
    tags.add('Ambient')
  }
  if (lower.includes('owl')) {
    tags.add('Night')
  }

  return Array.from(tags)
}

export function createBundledFxTracks(now = new Date().toISOString()): FxTrack[] {
  return BUNDLED_FX_FILES.map((entry, index) => {
    const name = displayNameFromFile(entry.file)
    const type = inferFxType(name)
    return {
      id: `fx-bundled-${index}`,
      name,
      durationSeconds: entry.durationSeconds,
      baseIntensity: inferFxIntensity(name),
      type,
      tags: inferFxTags(name, type),
      audioUrl: `${AUDIO_BASE}/${entry.file}`,
      defaultVolume: 80,
      createdAt: now,
    }
  })
}
