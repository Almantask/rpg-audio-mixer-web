import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

export function CreditsPage() {
  return (
    <ScreenLandmark screenName="Credits screen">
      <PageHeader title="Credits" subtitle="App info, support links, and legal." />
      <p className="text-muted">Support and legal links will appear here.</p>
    </ScreenLandmark>
  )
}
