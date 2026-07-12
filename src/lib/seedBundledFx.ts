import type { FxTrack } from '@/types/library'

const AUDIO_BASE = '/assets/audio/soundboard'

interface BundledFxSeed {
  file: string
  name: string
  durationSeconds: number
  baseIntensity: FxTrack['baseIntensity']
  type: FxTrack['type']
  tags: string[]
}

const BUNDLED_FX: BundledFxSeed[] = [
  {
    file: 'owl_hooting.ogg',
    name: 'Wolf Howl',
    durationSeconds: 3,
    baseIntensity: 'II',
    type: 'CREATURE',
    tags: ['Creature', 'Combat'],
  },
  {
    file: 'whip.ogg',
    name: 'Thunder Crack',
    durationSeconds: 4,
    baseIntensity: 'II',
    type: 'IMPACT',
    tags: ['Impact', 'Combat'],
  },
  {
    file: 'u_fe12rqkbth-sword-clash-241729.ogg',
    name: 'Sword Clash',
    durationSeconds: 2,
    baseIntensity: 'I',
    type: 'COMBAT',
    tags: ['Combat'],
  },
  {
    file: 'djartmusic-arrow-twang_01-306041.ogg',
    name: 'Battle Horn',
    durationSeconds: 2,
    baseIntensity: 'II',
    type: 'COMBAT',
    tags: ['Combat'],
  },
  {
    file: 'dragon-studio-sword-clattering-to-the-ground-393838.ogg',
    name: 'Door Creak',
    durationSeconds: 3,
    baseIntensity: 'I',
    type: 'AMBIENT',
    tags: ['Ambient'],
  },
  {
    file: 'djartmusic-arrow-swish_03-306040.ogg',
    name: 'Soft Tap',
    durationSeconds: 1,
    baseIntensity: 'I',
    type: 'UI',
    tags: ['UI'],
  },
  {
    file: 'dog_bark.ogg',
    name: 'Dog Bark',
    durationSeconds: 2,
    baseIntensity: 'I',
    type: 'CREATURE',
    tags: ['Creature'],
  },
  {
    file: 'dragon-studio-violent-sword-slice-393839.ogg',
    name: 'Violent Sword Slice',
    durationSeconds: 2,
    baseIntensity: 'III',
    type: 'COMBAT',
    tags: ['Combat'],
  },
  {
    file: 'musicholder-sword-sound-260274.ogg',
    name: 'Sword Ring',
    durationSeconds: 2,
    baseIntensity: 'II',
    type: 'COMBAT',
    tags: ['Combat'],
  },
  {
    file: 'daviddumaisaudio-sword-slash-with-metallic-impact-185435.ogg',
    name: 'Sword Slash',
    durationSeconds: 2,
    baseIntensity: 'II',
    type: 'COMBAT',
    tags: ['Combat', 'Impact'],
  },
  {
    file: 'freesound_community-sword-schwing-40520.ogg',
    name: 'Sword Schwing',
    durationSeconds: 1,
    baseIntensity: 'I',
    type: 'COMBAT',
    tags: ['Combat'],
  },
  {
    file: 'dennish18-arrow-body-impact-146419.ogg',
    name: 'Arrow Impact',
    durationSeconds: 2,
    baseIntensity: 'II',
    type: 'IMPACT',
    tags: ['Impact', 'Combat'],
  },
  {
    file: 'dragon-studio-epic-dragon-roar-364481.ogg',
    name: 'Dragon Roar',
    durationSeconds: 4,
    baseIntensity: 'III',
    type: 'CREATURE',
    tags: ['Creature'],
  },
  {
    file: 'dragon-studio-dragon-breathing-fire-epic-sound-364482.ogg',
    name: 'Dragon Fire',
    durationSeconds: 5,
    baseIntensity: 'III',
    type: 'CREATURE',
    tags: ['Creature', 'Impact'],
  },
  {
    file: 'dragon-studio-dragon-roar-364478.ogg',
    name: 'Dragon Growl',
    durationSeconds: 3,
    baseIntensity: 'II',
    type: 'CREATURE',
    tags: ['Creature'],
  },
]

export function createBundledFxTracks(now = new Date().toISOString()): FxTrack[] {
  return BUNDLED_FX.map((seed, index) => ({
    id: `fx-bundled-${index}`,
    name: seed.name,
    durationSeconds: seed.durationSeconds,
    baseIntensity: seed.baseIntensity,
    type: seed.type,
    tags: seed.tags,
    audioUrl: `${AUDIO_BASE}/${seed.file}`,
    defaultVolume: 80,
    createdAt: now,
  }))
}
