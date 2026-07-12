import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

export function CampaignsPage() {
  return (
    <ScreenLandmark screenName="Active Campaigns screen">
      <PageHeader title="Active Campaigns" subtitle="Manage your campaigns." />
      <p className="text-muted">No campaigns yet.</p>
    </ScreenLandmark>
  )
}
