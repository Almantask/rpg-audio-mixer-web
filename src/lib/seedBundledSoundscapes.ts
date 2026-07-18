import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'

const AUDIO_BASE = '/assets/audio/soundscapes'

type IntensityLevel = 'I' | 'II' | 'III'

interface BundledSoundscapeCategorySeed {
  name: string
  type: string
  levels: Record<IntensityLevel, string[]>
}

const BUNDLED_SOUNDSCAPE_CATEGORIES: BundledSoundscapeCategorySeed[] = [
  {
    name: 'Forest',
    type: 'AMBIENCE',
    levels: {
      I: [
        'Moonroots of the Feywood.ogg',
        'Silver Birch Enchantment.ogg',
        'Steps in the forest.ogg',
      ],
      II: [
        'Dancing feys in Oak Forest.ogg',
        'ForestHarp.ogg',
        'Whispers of the Amber Fey.ogg',
      ],
      III: [],
    },
  },
  {
    name: 'Boss',
    type: 'COMBAT',
    levels: {
      I: ['Storm Ritual Procession.ogg', 'Thunder Grid Ritual.ogg'],
      II: ['Arcane Chime Engine.ogg', 'Dark Authority.ogg', 'Thunder Grid Ritual _.ogg'],
      III: ['Faultline Cathedral.ogg', 'Storm Ritual.ogg'],
    },
  },
  {
    name: 'Combat',
    type: 'COMBAT',
    levels: {
      I: [],
      II: ['Forged In The Drumfire.ogg', 'Storm Crowned at Zenith.ogg'],
      III: ['Steel Cathedral.ogg', 'Storm Crown.ogg'],
    },
  },
  {
    name: 'Mystery',
    type: 'AMBIENCE',
    levels: {
      I: ['Echoes of the Old Gate.ogg'],
      II: ['Glitter Runes Over A Minor Sky.ogg', 'Shimmering Ladders.ogg'],
      III: ['Suspended Lanterns.ogg'],
    },
  },
  {
    name: 'Bonfire',
    type: 'AMBIENCE',
    levels: {
      I: ['Bonfire_#1.mp3', 'Bonfire_#2.mp3', 'Bonfire_#3.mp3', 'Bonfire_#4.mp3'],
      II: [],
      III: [],
    },
  },
  {
    name: 'Rain',
    type: 'AMBIENCE',
    levels: {
      I: ['Relaxing_light_rain_#1.mp3', 'Relaxing_light_rain#2.mp3'],
      II: ['Medium_rain_#1.mp3', 'Medium_rain_#2.mp3'],
      III: ['Heavy_rain_1.mp3', 'Heavy_rain_#2.mp3'],
    },
  },
]

export const BUNDLED_SOUNDSCAPE_CATEGORY_NAMES = BUNDLED_SOUNDSCAPE_CATEGORIES.map(
  (category) => category.name,
)

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function displayNameFromFile(file: string): string {
  const baseName = file.replace(/\.[^.]+$/, '')
  return baseName.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatFromFile(file: string): string {
  const ext = file.split('.').pop()?.toUpperCase()
  if (ext === 'MP3') return 'MP3'
  if (ext === 'OGG') return 'OGG'
  if (ext === 'WAV') return 'WAV'
  return ext ?? 'OGG'
}

function trackId(categoryName: string, file: string): string {
  return `track-${slugify(categoryName)}-${slugify(displayNameFromFile(file))}`
}

function encodeAssetPathSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/%20/g, ' ')
}

function buildTrack(
  categoryName: string,
  level: IntensityLevel,
  file: string,
  now: string,
): SoundscapeTrack {
  return {
    id: trackId(categoryName, file),
    name: displayNameFromFile(file),
    durationSeconds: 180,
    format: formatFromFile(file),
    channels: 'Stereo',
    // Encode `#` etc. so browsers do not treat them as URL fragments.
    audioUrl: `${AUDIO_BASE}/${encodeAssetPathSegment(categoryName)}/${level}/${encodeAssetPathSegment(file)}`,
    createdAt: now,
  }
}

export interface BundledSoundscapeLibrary {
  categories: SoundscapeCategory[]
  tracks: SoundscapeTrack[]
}

export function createBundledSoundscapeLibrary(now = new Date().toISOString()): BundledSoundscapeLibrary {
  const tracks: SoundscapeTrack[] = []
  const trackIdsByKey = new Map<string, string>()

  for (const categorySeed of BUNDLED_SOUNDSCAPE_CATEGORIES) {
    for (const level of ['I', 'II', 'III'] as const) {
      for (const file of categorySeed.levels[level]) {
        const track = buildTrack(categorySeed.name, level, file, now)
        tracks.push(track)
        trackIdsByKey.set(`${categorySeed.name}:${level}:${file}`, track.id)
      }
    }
  }

  const categories: SoundscapeCategory[] = BUNDLED_SOUNDSCAPE_CATEGORIES.map((categorySeed) => {
    const levels: NonNullable<SoundscapeCategory['levels']> = { I: [], II: [], III: [] }
    for (const level of ['I', 'II', 'III'] as const) {
      levels[level] = categorySeed.levels[level].map(
        (file) => trackIdsByKey.get(`${categorySeed.name}:${level}:${file}`)!,
      )
    }
    const uniqueTrackIds = new Set([...levels.I, ...levels.II, ...levels.III])
    return {
      id: `category-${slugify(categorySeed.name)}`,
      name: categorySeed.name,
      trackCount: uniqueTrackIds.size,
      type: categorySeed.type,
      levels,
    }
  })

  return { categories, tracks }
}
