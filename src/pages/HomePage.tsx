import { useState } from 'react'
import { HomeCampaignHero } from '@/components/home/HomeCampaignHero'
import { TopFxCard } from '@/components/home/TopFxCard'
import { TopSoundscapeCard } from '@/components/home/TopSoundscapeCard'
import { ErrorOverlay } from '@/components/shared/ErrorOverlay'
import { useHome } from '@/hooks/useHome'
import { useHomePreview } from '@/hooks/useHomePreview'

export function HomePage() {
  const { data, isLoading, isFatalError, hasError, hasStatError, isOffline } = useHome()
  const preview = useHomePreview()
  const [errorDismissed, setErrorDismissed] = useState(false)
  const hasCampaigns = data?.hasCampaigns ?? false
  const showStats = hasCampaigns && !isLoading
  const showStatSkeletons = isLoading && !isFatalError

  return (
    <section aria-labelledby="home-active-campaigns-heading" className="mx-auto max-w-4xl space-y-8">
      {isOffline ? (
        <p className="text-sm text-amber-400" data-testid="home-offline-indicator">
          Offline — showing cached data
        </p>
      ) : null}

      <div>
        <h2 className="mb-4 font-serif text-xl text-gold" id="home-active-campaigns-heading">
          Active Campaigns
        </h2>
        {!isFatalError ? (
          <HomeCampaignHero
            campaign={data?.activeCampaign}
            isEmpty={!isLoading && !hasCampaigns}
            isLoading={isLoading}
            sessionSubtitle={data?.sessionSubtitle}
          />
        ) : null}
      </div>

      {showStatSkeletons ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-serif text-xl text-gold">Top Soundscape</h2>
            <TopSoundscapeCard isLoading />
          </div>
          <div>
            <h2 className="mb-4 font-serif text-xl text-gold">Top FX</h2>
            <TopFxCard isLoading />
          </div>
        </div>
      ) : null}

      {showStats ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-serif text-xl text-gold">Top Soundscape</h2>
            <TopSoundscapeCard
              category={data?.topSoundscape}
              isPaused={data?.topSoundscape ? preview.isSoundscapePaused(data.topSoundscape.name) : false}
              isPreviewing={data?.topSoundscape ? preview.isSoundscapePreviewing(data.topSoundscape.name) : false}
              previewDisabled={preview.blocked}
              progress={
                data?.topSoundscape
                  ? preview.getProgress('soundscape', data.topSoundscape.name)
                  : 0
              }
              showEmpty={!data?.topSoundscape}
              onTogglePreview={() => {
                if (!data?.topSoundscape) return
                void preview.toggleSoundscape(data.topSoundscape.id, data.topSoundscape.name)
              }}
            />
          </div>
          <div>
            <h2 className="mb-4 font-serif text-xl text-gold">Top FX</h2>
            <TopFxCard
              isPaused={data?.topFx ? preview.isFxPaused(data.topFx.name) : false}
              isPreviewing={data?.topFx ? preview.isFxPreviewing(data.topFx.name) : false}
              previewDisabled={preview.blocked}
              progress={data?.topFx ? preview.getProgress('fx', data.topFx.name) : 0}
              showEmpty={!data?.topFx}
              track={data?.topFx}
              onTogglePreview={() => {
                if (!data?.topFx) return
                void preview.toggleFx(data.topFx.name)
              }}
            />
          </div>
        </div>
      ) : null}

      {hasError && !errorDismissed ? (
        <ErrorOverlay
          message={
            isFatalError
              ? 'Unable to load Home screen data. Please try again later.'
              : hasStatError
                ? 'Failed to load Top Soundscape stat.'
                : 'Some Home data could not be refreshed. Cached content is shown below.'
          }
          onDismiss={() => setErrorDismissed(true)}
        />
      ) : null}
    </section>
  )
}
