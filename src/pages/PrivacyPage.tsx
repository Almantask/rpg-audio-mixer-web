import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

export function PrivacyPage() {
  return (
    <ScreenLandmark screenName="Privacy Policy screen">
      <PageHeader title="Privacy Policy" subtitle="How Arcanum Audio handles your data." />
      <p className="text-muted">
        Privacy policy content will be published here. Campaign and library data is stored locally in
        your browser unless you choose to sync or export it.
      </p>
    </ScreenLandmark>
  )
}
