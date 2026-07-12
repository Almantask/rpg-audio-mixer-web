import type { FxIntensity, FxTrack, FxType } from '@/types/library'

const AUDIO_BASE = '/assets/audio/soundboard'

const BUNDLED_FX_FILES = [
  'arrow.ogg',
  'arrow2.ogg',
  'arrow3.ogg',
  'dog_bark.ogg',
  'dragon_roar2.ogg',
  'dragon_roar3.ogg',
  'dragon-studio-dragon-roar-364478.ogg',
  'musicholder-sword-sound-260274.ogg',
  'owl_hooting.ogg',
  'sword.ogg',
  'sword4.ogg',
  'sword5.ogg',
  'sword6.ogg',
  'sword7.ogg',
  'whip.ogg',
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

function inferFxTags(type: FxType): string[] {
  switch (type) {
    case 'COMBAT':
      return ['Combat']
    case 'CREATURE':
      return ['Creature']
    case 'IMPACT':
      return ['Impact']
    default:
      return ['Other']
  }
}

export function createBundledFxTracks(now = new Date().toISOString()): FxTrack[] {
  return BUNDLED_FX_FILES.map((file, index) => {
    const name = displayNameFromFile(file)
    const type = inferFxType(name)
    return {
      id: `fx-bundled-${index}`,
      name,
      durationSeconds: 3,
      baseIntensity: inferFxIntensity(name),
      type,
      tags: inferFxTags(type),
      audioUrl: `${AUDIO_BASE}/${file}`,
      defaultVolume: 80,
      createdAt: now,
    }
  })
}
