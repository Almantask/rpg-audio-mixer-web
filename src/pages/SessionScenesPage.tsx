import { useParams } from 'react-router-dom'
import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

const CAMPAIGN_NAMES: Record<string, string> = {
  'curse-of-strahd': 'Curse of Strahd',
}

export function SessionScenesPage() {
  const { campaignId = '' } = useParams()

  const campaignName = CAMPAIGN_NAMES[campaignId] ?? campaignId

  return (
    <ScreenLandmark screenName="Session Scenes screen">
      <p className="mb-2 text-xs uppercase tracking-widest text-muted">
        Campaign &gt; {campaignName} &gt; Session 1
      </p>
      <PageHeader title="Session Scenes" subtitle={`Scenes linked to ${campaignName}.`} />
      <p className="text-muted" data-campaign-name={campaignName}>
        Session scenes for {campaignName}
      </p>
    </ScreenLandmark>
  )
}
