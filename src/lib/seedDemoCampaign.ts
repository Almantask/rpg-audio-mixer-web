import type { AppData, Campaign, Session } from '@/types/campaign'
import type { FxTrack, SoundscapeCategory, SoundscapeTrack } from '@/types/library'
import type {
  Scene,
  SceneSoundboardEntry,
  SceneSoundscapeSlot,
  SessionSceneLink,
  SoundscapeIntensity,
} from '@/types/scene'
import { createBundledFxTracks } from '@/lib/seedBundledFx'
import { createBundledSoundscapeLibrary } from '@/lib/seedBundledSoundscapes'
import { dedupeSoundboardEntries } from '@/lib/sceneStorage'

export const DEMO_CAMPAIGN_ID = 'campaign-demo-adventure'
export const DEMO_CAMPAIGN_NAME = 'Demo Adventure'
export const DEMO_SESSION_ID = 'session-campaign-demo-adventure-1'
export const DEMO_SESSION_NAME = 'The Ancient Gate'
export const DEMO_SCENE_ID = 'scene-the-ancient-gate'
export const DEMO_SCENE_NAME = 'The Ancient Gate'
export const DEMO_SCENE_DESCRIPTION =
  "Don't play all ambiences at once — try different ones separately."
export const DEMO_SCENE_BONFIRE_ID = 'scene-bonfire-talk'
export const DEMO_SCENE_BONFIRE_NAME = 'Bonfire talk'
export const DEMO_SCENE_BONFIRE_DESCRIPTION =
  'A mix of ambiences intended to be played all at once to create a relaxing mood.'

export const DEMO_SCENE_SOUNDSCAPE_CATEGORY_NAMES = [
  'Forest',
  'Boss',
  'Combat',
  'Mystery',
] as const

export const DEMO_SCENE_BONFIRE_SOUNDSCAPE_CATEGORY_NAMES = [
  'Forest',
  'Bonfire',
  'Rain',
] as const

const DEMO_SCENE_IDS = [DEMO_SCENE_ID, DEMO_SCENE_BONFIRE_ID] as const

function defaultIntensity(category: SoundscapeCategory): SoundscapeIntensity {
  if ((category.levels?.I?.length ?? 0) > 0) return 'I'
  if ((category.levels?.II?.length ?? 0) > 0) return 'II'
  return 'III'
}

function firstTrackAtLevel(
  category: SoundscapeCategory,
  level: SoundscapeIntensity,
): string | undefined {
  return category.levels?.[level]?.[0]
}

function resolveSoundscapeCategory(
  categoryName: string,
  categories: SoundscapeCategory[],
  bundledCategories: SoundscapeCategory[],
): SoundscapeCategory | undefined {
  return (
    categories.find(
      (entry) => !entry.deletedAt && entry.name.toLowerCase() === categoryName.toLowerCase(),
    ) ??
    bundledCategories.find((entry) => entry.name.toLowerCase() === categoryName.toLowerCase())
  )
}

function orderedBundledFxTracks(fxTracks: FxTrack[], now: string): FxTrack[] {
  const seen = new Set<string>()
  const tracks: FxTrack[] = []
  for (const seed of createBundledFxTracks(now)) {
    const track =
      fxTracks.find((item) => item.name.toLowerCase() === seed.name.toLowerCase()) ?? seed
    if (seen.has(track.id)) {
      continue
    }
    seen.add(track.id)
    tracks.push(track)
  }
  return tracks
}

function buildSceneSlots(
  sceneId: string,
  categoryNames: readonly string[],
  soundscapeCategories: SoundscapeCategory[],
  bundledCategories: SoundscapeCategory[],
): SceneSoundscapeSlot[] {
  return categoryNames.flatMap((categoryName, order) => {
    const category = resolveSoundscapeCategory(
      categoryName,
      soundscapeCategories,
      bundledCategories,
    )
    if (!category) {
      return []
    }
    const intensity = defaultIntensity(category)
    return [
      {
        id: `soundscape-slot-${sceneId}-${order}`,
        sceneId,
        categoryId: category.id,
        order,
        volume: 80,
        intensity,
        currentTrackId: firstTrackAtLevel(category, intensity),
      },
    ]
  })
}

function sceneHasConfiguredSlots(
  sceneId: string,
  categoryNames: readonly string[],
  slots: SceneSoundscapeSlot[],
  categories: SoundscapeCategory[],
): boolean {
  const sceneSlots = slots.filter((slot) => slot.sceneId === sceneId)
  if (sceneSlots.length < categoryNames.length) {
    return false
  }

  for (const categoryName of categoryNames) {
    const category = categories.find(
      (entry) => !entry.deletedAt && entry.name.toLowerCase() === categoryName.toLowerCase(),
    )
    if (!category) {
      return false
    }
    const slot = sceneSlots.find((entry) => entry.categoryId === category.id)
    if (!slot?.currentTrackId) {
      return false
    }
  }

  return true
}

export type DemoCampaignSeed = Pick<
  AppData,
  | 'campaigns'
  | 'sessions'
  | 'scenes'
  | 'sessionSceneLinks'
  | 'sceneSoundscapeSlots'
  | 'sceneSoundboardEntries'
  | 'sceneSoundscapeSettings'
  | 'sceneSoundboardSettings'
  | 'lastActiveSessionByCampaign'
  | 'lastActiveSceneBySession'
>

export function createDemoCampaignData(
  library?: {
    soundscapeCategories?: SoundscapeCategory[]
    soundscapeTracks?: SoundscapeTrack[]
    fxTracks?: FxTrack[]
  },
  now = new Date().toISOString(),
): DemoCampaignSeed {
  const bundledSoundscapes = createBundledSoundscapeLibrary(now)
  const bundledFx = createBundledFxTracks(now)
  const soundscapeCategories = library?.soundscapeCategories ?? bundledSoundscapes.categories
  const fxTracks = library?.fxTracks ?? bundledFx

  const campaign: Campaign = {
    id: DEMO_CAMPAIGN_ID,
    name: DEMO_CAMPAIGN_NAME,
    description: 'A ready-to-play sample campaign with all bundled soundscapes and effects.',
    createdAt: now,
    lastPlayedAt: now,
  }

  const session: Session = {
    id: DEMO_SESSION_ID,
    campaignId: DEMO_CAMPAIGN_ID,
    name: DEMO_SESSION_NAME,
    number: 1,
    date: now.slice(0, 10),
    sceneCount: 2,
    lastOpenedAt: now,
  }

  const ancientGateScene: Scene = {
    id: DEMO_SCENE_ID,
    name: DEMO_SCENE_NAME,
    description: DEMO_SCENE_DESCRIPTION,
    tags: ['demo', 'forest', 'combat', 'mystery'],
    createdAt: now,
    lastUsedAt: now,
  }

  const bonfireTalkScene: Scene = {
    id: DEMO_SCENE_BONFIRE_ID,
    name: DEMO_SCENE_BONFIRE_NAME,
    description: DEMO_SCENE_BONFIRE_DESCRIPTION,
    tags: ['demo', 'forest', 'bonfire', 'rain'],
    createdAt: now,
    lastUsedAt: now,
  }

  const sessionSceneLinks: SessionSceneLink[] = [
    {
      id: 'link-demo-session-scene',
      sessionId: DEMO_SESSION_ID,
      sceneId: DEMO_SCENE_ID,
      linkedAt: now,
      lastPlayedAt: now,
    },
    {
      id: 'link-demo-session-bonfire-talk',
      sessionId: DEMO_SESSION_ID,
      sceneId: DEMO_SCENE_BONFIRE_ID,
      linkedAt: now,
      lastPlayedAt: now,
    },
  ]

  const sceneSoundscapeSlots: SceneSoundscapeSlot[] = [
    ...buildSceneSlots(
      DEMO_SCENE_ID,
      DEMO_SCENE_SOUNDSCAPE_CATEGORY_NAMES,
      soundscapeCategories,
      bundledSoundscapes.categories,
    ),
    ...buildSceneSlots(
      DEMO_SCENE_BONFIRE_ID,
      DEMO_SCENE_BONFIRE_SOUNDSCAPE_CATEGORY_NAMES,
      soundscapeCategories,
      bundledSoundscapes.categories,
    ),
  ]

  const selectedFx = orderedBundledFxTracks(fxTracks, now)

  const sceneSoundboardEntries: SceneSoundboardEntry[] = selectedFx.map((track, index) => ({
    id: `soundboard-${DEMO_SCENE_ID}-${track.id}`,
    sceneId: DEMO_SCENE_ID,
    fxTrackId: track.id,
    order: index + 1,
  }))

  return {
    campaigns: [campaign],
    sessions: [session],
    scenes: [ancientGateScene, bonfireTalkScene],
    sessionSceneLinks,
    sceneSoundscapeSlots,
    sceneSoundboardEntries,
    sceneSoundscapeSettings: [
      {
        sceneId: DEMO_SCENE_ID,
        masterVolume: 85,
        muted: false,
      },
      {
        sceneId: DEMO_SCENE_BONFIRE_ID,
        masterVolume: 85,
        muted: false,
      },
    ],
    sceneSoundboardSettings: [
      {
        sceneId: DEMO_SCENE_ID,
        masterVolume: 85,
      },
      {
        sceneId: DEMO_SCENE_BONFIRE_ID,
        masterVolume: 85,
      },
    ],
    lastActiveSessionByCampaign: {
      [DEMO_CAMPAIGN_ID]: DEMO_SESSION_ID,
    },
    lastActiveSceneBySession: {
      [DEMO_SESSION_ID]: DEMO_SCENE_ID,
    },
  }
}

export function isDemoSceneConfigured(
  slots: SceneSoundscapeSlot[],
  entries: SceneSoundboardEntry[],
  categories: SoundscapeCategory[],
  fxTracks: FxTrack[],
): boolean {
  if (
    !sceneHasConfiguredSlots(
      DEMO_SCENE_ID,
      DEMO_SCENE_SOUNDSCAPE_CATEGORY_NAMES,
      slots,
      categories,
    )
  ) {
    return false
  }

  if (
    !sceneHasConfiguredSlots(
      DEMO_SCENE_BONFIRE_ID,
      DEMO_SCENE_BONFIRE_SOUNDSCAPE_CATEGORY_NAMES,
      slots,
      categories,
    )
  ) {
    return false
  }

  const bundledFx = createBundledFxTracks()
  for (const bundled of bundledFx) {
    const libraryTrack = fxTracks.find(
      (track) => !track.deletedAt && track.name.toLowerCase() === bundled.name.toLowerCase(),
    )
    if (!libraryTrack) {
      return false
    }
    const onBoard = entries.some(
      (entry) => entry.sceneId === DEMO_SCENE_ID && entry.fxTrackId === libraryTrack.id,
    )
    if (!onBoard) {
      return false
    }
  }

  return true
}

export function mergeDemoCampaignInto(current: AppData, demo: DemoCampaignSeed): AppData {
  const existingCampaignIds = new Set(current.campaigns.map((campaign) => campaign.id))
  const existingSessionIds = new Set(current.sessions.map((session) => session.id))
  const demoSceneIds = new Set<string>(DEMO_SCENE_IDS)

  const sessions = [
    ...current.sessions.map((session) => {
      if (session.id !== DEMO_SESSION_ID) {
        return session
      }
      const repairedName = /^Session\s*1\s*[–—:-]+/i.test(session.name.trim())
        ? DEMO_SESSION_NAME
        : session.name
      return {
        ...session,
        name: repairedName,
        sceneCount: Math.max(session.sceneCount, demo.sessions[0]?.sceneCount ?? 2),
      }
    }),
    ...demo.sessions.filter((session) => !existingSessionIds.has(session.id)),
  ]

  return {
    ...current,
    campaigns: [
      ...current.campaigns,
      ...demo.campaigns.filter((campaign) => !existingCampaignIds.has(campaign.id)),
    ],
    sessions,
    scenes: [
      ...current.scenes.filter((scene) => !demoSceneIds.has(scene.id)),
      ...demo.scenes,
    ],
    sessionSceneLinks: [
      ...current.sessionSceneLinks.filter((link) => link.sessionId !== DEMO_SESSION_ID),
      ...demo.sessionSceneLinks,
    ],
    sceneSoundscapeSlots: [
      ...current.sceneSoundscapeSlots.filter((slot) => !demoSceneIds.has(slot.sceneId)),
      ...demo.sceneSoundscapeSlots,
    ],
    sceneSoundboardEntries: dedupeSoundboardEntries([
      ...current.sceneSoundboardEntries.filter((entry) => !demoSceneIds.has(entry.sceneId)),
      ...demo.sceneSoundboardEntries,
    ]),
    sceneSoundscapeSettings: mergeSettingsBySceneId(
      current.sceneSoundscapeSettings,
      demo.sceneSoundscapeSettings,
    ),
    sceneSoundboardSettings: mergeSettingsBySceneId(
      current.sceneSoundboardSettings,
      demo.sceneSoundboardSettings,
    ),
    lastActiveSessionByCampaign: {
      ...current.lastActiveSessionByCampaign,
      ...demo.lastActiveSessionByCampaign,
    },
    lastActiveSceneBySession: {
      ...current.lastActiveSceneBySession,
      ...demo.lastActiveSceneBySession,
    },
  }
}

function mergeSettingsBySceneId<T extends { sceneId: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map(existing.map((item) => [item.sceneId, item]))
  for (const item of incoming) {
    map.set(item.sceneId, item)
  }
  return Array.from(map.values())
}
