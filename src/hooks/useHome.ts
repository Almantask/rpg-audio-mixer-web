import { useCallback, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/storage/db'
import { formatSessionSubtitle } from '@/lib/constants'
import { getE2EState, setE2EState } from '@/lib/storage/e2eState'
import { listActiveCampaigns } from '@/lib/storage/campaignRepository'
import { getFxTrack } from '@/lib/storage/fxTrackRepository'
import {
  getTopFxStat,
  getTopSoundscapeStat,
} from '@/lib/storage/playStatsRepository'
import { getCategoryWithCounts } from '@/lib/storage/soundscapeCategoryRepository'
import {
  getLastActiveSessionId,
  listActiveSessions,
} from '@/lib/storage/sessionRepository'
import type { CampaignWithSessionCount, FxTrack, SoundscapeCategoryWithCounts } from '@/lib/storage/types'

export interface HomeData {
  activeCampaign: CampaignWithSessionCount | null
  sessionSubtitle: string | null
  topSoundscape: (SoundscapeCategoryWithCounts & { playCount: number }) | null
  topFx: (FxTrack & { playCount: number }) | null
  hasCampaigns: boolean
}

async function loadHomeData(): Promise<HomeData> {
  const campaigns = await listActiveCampaigns()
  const activeCampaign = campaigns[0] ?? null
  let sessionSubtitle: string | null = null

  if (activeCampaign && activeCampaign.sessionCount > 0) {
    const sessions = await listActiveSessions(activeCampaign.id)
    const lastSessionId = getLastActiveSessionId(sessions)
    const session = lastSessionId
      ? sessions.find((item) => item.id === lastSessionId)
      : sessions.sort((left, right) => right.number - left.number)[0]
    if (session) {
      sessionSubtitle = formatSessionSubtitle(session)
    }
  }

  const topSoundscapeStat = await getTopSoundscapeStat()
  const topFxStat = await getTopFxStat()

  let topSoundscape: HomeData['topSoundscape'] = null
  if (topSoundscapeStat) {
    const category = await getCategoryWithCounts(topSoundscapeStat.entityId)
    if (category) {
      topSoundscape = { ...category, playCount: topSoundscapeStat.playCount }
    }
  }

  let topFx: HomeData['topFx'] = null
  if (topFxStat) {
    const track = await getFxTrack(topFxStat.entityId)
    if (track) {
      topFx = { ...track, playCount: topFxStat.playCount }
    }
  }

  return {
    activeCampaign,
    sessionSubtitle,
    topSoundscape,
    topFx,
    hasCampaigns: campaigns.length > 0,
  }
}

export function useHome() {
  const [retryCount, setRetryCount] = useState(0)
  const cachedRef = useRef<HomeData | null>(null)

  const result = useLiveQuery(async () => {
    void retryCount
    const flags = getE2EState()
    if (flags.homeLoading) return 'loading' as const
    if (flags.homeLoadFail) {
      if (flags.homeHasCachedData && cachedRef.current) {
        return { data: cachedRef.current, error: true, offline: flags.homeOffline } as const
      }
      return 'error' as const
    }
    try {
      const data = await loadHomeData()
      cachedRef.current = data
      if (flags.homeStatLoadFail) {
        return { data, error: true, statError: true, offline: flags.homeOffline } as const
      }
      return { data, error: false, offline: flags.homeOffline } as const
    } catch {
      if (cachedRef.current) {
        return { data: cachedRef.current, error: true, offline: flags.homeOffline } as const
      }
      return 'error' as const
    }
  }, [retryCount])

  const retry = useCallback(() => {
    setE2EState({ homeLoadFail: false })
    setRetryCount((count) => count + 1)
  }, [])

  const isLoading = result === 'loading' || result === undefined
  const isFatalError = result === 'error'
  const payload = result && typeof result === 'object' ? result : null

  return {
    data: payload?.data ?? null,
    isLoading,
    isFatalError,
    hasError: isFatalError || Boolean(payload?.error),
    hasStatError: Boolean(payload && 'statError' in payload && payload.statError),
    isOffline: Boolean(payload?.offline),
    retry,
  }
}

export async function getCategoryPreviewTrackId(
  category: SoundscapeCategoryWithCounts,
): Promise<string | undefined> {
  if (category.defaultTrackId) {
    const track = await db.tracks.get(category.defaultTrackId)
    if (track) return track.id
  }
  for (const level of [1, 2, 3] as const) {
    const levelRow = await db.intensityLevels
      .where('categoryId')
      .equals(category.id)
      .filter((item) => item.level === level)
      .first()
    const firstId = levelRow?.trackIds[0]
    if (firstId) return firstId
  }
  return undefined
}

export async function getCategoryPreviewTrackName(categoryId: string): Promise<string | undefined> {
  const category = await getCategoryWithCounts(categoryId)
  if (!category) return undefined
  const trackId = await getCategoryPreviewTrackId(category)
  if (!trackId) return undefined
  const track = await db.tracks.get(trackId)
  return track?.name
}
