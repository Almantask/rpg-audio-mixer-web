import { useEffect, useMemo, useState } from 'react'
import { ScreenLandmark } from '@/components/layout/AppShell'
import { ActiveCampaignHero } from '@/components/home/ActiveCampaignHero'
import { HomeErrorOverlay } from '@/components/home/HomeErrorOverlay'
import { HomeHeroSkeleton, HomeStatCardSkeleton } from '@/components/home/HomeSkeleton'
import {
  resolveTopSoundscapeTrack,
  TopSoundscapeCard,
  toggleTopSoundscapePreview,
} from '@/components/home/TopSoundscapeCard'
import { TopFxCard, toggleTopFxPreview } from '@/components/home/TopFxCard'
import { useCampaignData } from '@/context/CampaignDataContext'
import { homePreview, type HomePreviewState } from '@/lib/homePreview'
import { getTopFxTrack, getTopSoundscapeCategory } from '@/lib/playStats'

export function HomePage() {
  const { data, e2e, activeCampaigns } = useCampaignData()
  const [preview, setPreview] = useState<HomePreviewState>(() => homePreview.getState())

  useEffect(() => {
    return homePreview.subscribe(setPreview)
  }, [])

  const screenState = e2e.homeScreenState ?? 'ready'
  const hasCampaigns = activeCampaigns.length > 0
  const hasCachedData = e2e.homeHasCachedData ?? hasCampaigns

  const topCampaign = activeCampaigns[0]
  const lastSession = useMemo(() => {
    if (!topCampaign) {
      return undefined
    }
    const sessionId = data.lastActiveSessionByCampaign[topCampaign.id]
    if (!sessionId) {
      return undefined
    }
    return data.sessions.find((session) => session.id === sessionId && !session.deletedAt)
  }, [data.lastActiveSessionByCampaign, data.sessions, topCampaign])

  const topSoundscape = useMemo(
    () => getTopSoundscapeCategory(data.playStats, data.soundscapeCategories),
    [data.playStats, data.soundscapeCategories],
  )

  const topFx = useMemo(
    () => getTopFxTrack(data.playStats, data.fxTracks),
    [data.playStats, data.fxTracks],
  )

  const topSoundscapeTrack = useMemo(() => {
    if (!topSoundscape) {
      return undefined
    }
    return resolveTopSoundscapeTrack(topSoundscape.category, data.soundscapeTracks ?? [])
  }, [data.soundscapeTracks, topSoundscape])

  const [previewBlocked, setPreviewBlocked] = useState(() => homePreview.isBlocked())

  useEffect(() => {
    const syncBlocked = () => setPreviewBlocked(homePreview.isBlocked())
    syncBlocked()
    const intervalId = window.setInterval(syncBlocked, 200)
    return () => window.clearInterval(intervalId)
  }, [])
  const soundscapePreviewActive =
    preview.kind === 'soundscape' && preview.id === topSoundscape?.category.id
  const fxPreviewActive = preview.kind === 'fx' && preview.id === topFx?.track.id

  const showErrorOverlay = screenState === 'error'
  const hideContentOnError = showErrorOverlay && !hasCachedData
  const showOfflineIndicator = screenState === 'offline'

  if (screenState === 'loading') {
    return (
      <ScreenLandmark screenName="Home screen">
        <HomeHeroSkeleton />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <HomeStatCardSkeleton testId="soundscape" />
          <HomeStatCardSkeleton testId="fx" />
        </div>
      </ScreenLandmark>
    )
  }

  return (
    <ScreenLandmark
      screenName="Home screen"
      className={`relative space-y-8${hideContentOnError ? ' min-h-[50vh]' : ''}`}
    >
      {showErrorOverlay ? <HomeErrorOverlay /> : null}
      {showOfflineIndicator ? (
        <p
          data-home-offline-indicator
          className="rounded border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold"
        >
          Offline — showing cached data
        </p>
      ) : null}

      {!hideContentOnError ? (
        <>
          <ActiveCampaignHero
            campaign={hasCampaigns ? topCampaign : undefined}
            session={lastSession}
            empty={!hasCampaigns}
          />

          {hasCampaigns ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {topSoundscape ? (
                <TopSoundscapeCard
                  category={topSoundscape.category}
                  track={topSoundscapeTrack}
                  playCount={topSoundscape.count}
                  previewBlocked={previewBlocked}
                  previewPlaying={soundscapePreviewActive && preview.playing}
                  previewProgress={soundscapePreviewActive ? preview.progress : 0}
                  onPreviewToggle={() => {
                    if (topSoundscapeTrack) {
                      toggleTopSoundscapePreview(topSoundscape.category, topSoundscapeTrack)
                    }
                  }}
                />
              ) : (
                <TopSoundscapeCard empty />
              )}

              {topFx ? (
                <TopFxCard
                  track={topFx.track}
                  playCount={topFx.count}
                  previewBlocked={previewBlocked}
                  previewPlaying={fxPreviewActive && preview.playing}
                  previewProgress={fxPreviewActive ? preview.progress : 0}
                  onPreviewToggle={() => toggleTopFxPreview(topFx.track)}
                />
              ) : (
                <TopFxCard empty />
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </ScreenLandmark>
  )
}
