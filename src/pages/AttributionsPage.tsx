import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { openSourceLicensesContent, soundLibraryAttributionsContent } from '@/content/attributions'
import { useCampaignData } from '@/context/CampaignDataContext'

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <h2 className="shrink-0 font-serif text-xl text-white">{title}</h2>
      <div className="h-px flex-1 bg-white/10" aria-hidden="true" />
    </div>
  )
}

function AttributionsSkeleton() {
  return (
    <div className="space-y-10" data-attributions-skeleton>
      <section aria-label="Sound library attributions loading">
        <SectionHeading title="Sound library attributions" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </section>
      <section aria-label="Open-source licenses loading">
        <SectionHeading title="Open-source licenses" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/6" />
        </div>
      </section>
    </div>
  )
}

function AttributionsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      data-attributions-error
      className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center"
    >
      <p className="mb-4 text-white">Unable to load attributions.</p>
      <Button type="button" data-attributions-retry onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

export function AttributionsPage() {
  const { e2e, setE2EControls } = useCampaignData()
  const attributionsState = e2e.attributionsState ?? 'ready'

  return (
    <ScreenLandmark screenName="Attributions screen">
      <PageHeader
        title="Attributions"
        subtitle="Sound library credits and open-source licenses."
      />

      {attributionsState === 'loading' ? <AttributionsSkeleton /> : null}

      {attributionsState === 'error' ? (
        <AttributionsErrorState
          onRetry={() => {
            setE2EControls({ attributionsState: 'ready' })
          }}
        />
      ) : null}

      {attributionsState === 'ready' ? (
        <div className="space-y-10">
          <section data-sound-library-attributions>
            <SectionHeading title="Sound library attributions" />
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {soundLibraryAttributionsContent}
            </div>
          </section>

          <section data-open-source-licenses>
            <SectionHeading title="Open-source licenses" />
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {openSourceLicensesContent}
            </div>
          </section>
        </div>
      ) : null}
    </ScreenLandmark>
  )
}
