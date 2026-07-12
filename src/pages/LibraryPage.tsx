import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

export function LibraryPage() {
  return (
    <ScreenLandmark screenName="Library screen">
      <PageHeader title="Library" subtitle="Browse soundscapes and sound effects." />
      <p className="text-muted">Your audio catalogue will appear here.</p>
    </ScreenLandmark>
  )
}
