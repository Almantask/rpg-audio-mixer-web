import type {
  Campaign,
  Session,
  Scene,
  SessionScene,
  SoundscapeCategory,
  FXTrack,
  SceneSoundscape,
  SoundboardItem,
} from '../types'

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Shadows of the Underdark',
    description: 'A long-running descent into the dark realm beneath the surface.',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'camp-2',
    name: 'Echoes of the Void',
    description: 'Whispers from a shattered astral keep.',
    lastPlayedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'camp-3',
    name: 'New Adventure',
    description: '',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
]

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-14',
    campaignId: 'camp-1',
    name: 'The Howling Crags',
    sessionNumber: 14,
    date: '2026-03-12',
    description: 'Traversing the windy peaks of the Crags.',
    lastOpenedAt: Date.now() - 1000 * 60 * 30,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'sess-13',
    campaignId: 'camp-1',
    name: 'Sunken Temple',
    sessionNumber: 13,
    date: '2026-02-28',
    description: 'Exploring subterranean ruins.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'sess-5',
    campaignId: 'camp-2',
    name: 'Astral Rift',
    sessionNumber: 5,
    date: '2026-03-01',
    description: 'Facing entity in deep space.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
]

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'scene-dragon-lair',
    name: "Dragon's Lair",
    description: 'A cavern echoing with deep breathing and molten gold.',
    tags: ['COMBAT', 'DUNGEON'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    lastPlayedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'scene-rusty-tankard',
    name: 'The Rusty Tankard',
    description: 'A bustling tavern with clinking tankards and warm fire.',
    tags: ['TAVERN', 'SOCIAL'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'scene-whispering-woods',
    name: 'Whispering Woods',
    description: 'Eerie winds rustle through ancient blackened trees.',
    tags: ['FOREST', 'EXPLORATION'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
]

export const INITIAL_SESSION_SCENES: SessionScene[] = [
  {
    sessionId: 'sess-14',
    sceneId: 'scene-dragon-lair',
    linkedAt: Date.now() - 1000 * 60 * 60,
    lastPlayedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    sessionId: 'sess-14',
    sceneId: 'scene-whispering-woods',
    linkedAt: Date.now() - 1000 * 60 * 120,
  },
]

export const INITIAL_CATEGORIES: SoundscapeCategory[] = [
  {
    id: 'cat-weather',
    name: 'Weather',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    tracksByLevel: {
      I: [
        {
          id: 'tr-light-rain',
          title: 'Gentle Rain',
          url: '/assets/audio/rain.ogg',
          format: 'OGG',
          channel: 'Stereo',
          durationSeconds: 120,
        },
      ],
      II: [
        {
          id: 'tr-thunderstorm',
          title: 'Thunderous Downpour',
          url: '/assets/audio/thunder.ogg',
          format: 'OGG',
          channel: 'Wide Stereo',
          durationSeconds: 222,
        },
        {
          id: 'tr-rolling-thunder',
          title: 'Distant Rolling Thunder',
          url: '/assets/audio/thunder2.ogg',
          format: 'OGG',
          channel: 'Stereo',
          durationSeconds: 135,
        },
      ],
      III: [
        {
          id: 'tr-tempest',
          title: 'Howling Hurricane Tempest',
          url: '/assets/audio/tempest.ogg',
          format: 'OGG',
          channel: 'Surround 5.1',
          durationSeconds: 180,
        },
      ],
    },
  },
  {
    id: 'cat-tavern',
    name: 'Tavern Ambience',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    tracksByLevel: {
      I: [
        {
          id: 'tr-quiet-inn',
          title: 'Cozy Hearthside Chatter',
          url: '/assets/audio/tavern.ogg',
          format: 'OGG',
          channel: 'Stereo',
          durationSeconds: 150,
        },
      ],
      II: [
        {
          id: 'tr-lively-pub',
          title: 'Rowdy Feast & Lute Song',
          url: '/assets/audio/lute.ogg',
          format: 'OGG',
          channel: 'Stereo',
          durationSeconds: 190,
        },
      ],
      III: [],
    },
  },
  {
    id: 'cat-ethereal',
    name: 'Ethereal Void',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    tracksByLevel: {
      I: [
        {
          id: 'tr-drone',
          title: 'Astral Resonance Drone',
          url: '/assets/audio/ethereal.ogg',
          format: 'OGG',
          channel: 'Stereo',
          durationSeconds: 240,
        },
      ],
      II: [],
      III: [],
    },
  },
]

export const INITIAL_FX_TRACKS: FXTrack[] = [
  {
    id: 'fx-fireball',
    name: 'Fireball Impact',
    url: '/assets/audio/fireball.ogg',
    durationSeconds: 4,
    intensity: 'III',
    tags: ['MAGIC', 'IMPACT', 'COMBAT'],
  },
  {
    id: 'fx-steel-clash',
    name: 'Sword Clash',
    url: '/assets/audio/sword.ogg',
    durationSeconds: 2,
    intensity: 'II',
    tags: ['WEAPON', 'COMBAT'],
  },
  {
    id: 'fx-dragon-roar',
    name: 'Dragon Roar',
    url: '/assets/audio/roar.ogg',
    durationSeconds: 5,
    intensity: 'III',
    tags: ['MONSTER', 'SUDDEN'],
  },
  {
    id: 'fx-acid-splash',
    name: 'Acid Splash',
    url: '/assets/audio/acid.ogg',
    durationSeconds: 3,
    intensity: 'I',
    tags: ['MAGIC', 'POISON'],
  },
]

export const INITIAL_SCENE_SOUNDSCAPES: SceneSoundscape[] = [
  {
    sceneId: 'scene-dragon-lair',
    categoryId: 'cat-weather',
    volume: 0.8,
    intensity: 'II',
    order: 0,
  },
  {
    sceneId: 'scene-dragon-lair',
    categoryId: 'cat-ethereal',
    volume: 0.5,
    intensity: 'I',
    order: 1,
  },
]

export const INITIAL_SOUNDBOARD_ITEMS: SoundboardItem[] = [
  {
    id: 'sb-1',
    sceneId: 'scene-dragon-lair',
    fxTrackId: 'fx-fireball',
    order: 0,
  },
  {
    id: 'sb-2',
    sceneId: 'scene-dragon-lair',
    fxTrackId: 'fx-steel-clash',
    order: 1,
  },
  {
    id: 'sb-3',
    sceneId: 'scene-dragon-lair',
    fxTrackId: 'fx-dragon-roar',
    order: 2,
  },
]
