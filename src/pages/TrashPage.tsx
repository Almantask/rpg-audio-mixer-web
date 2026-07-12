import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

export function TrashPage() {
  return (
    <ScreenLandmark screenName="Trash screen">
      <PageHeader title="Trash" subtitle="Recover recently deleted items." />
      <p className="text-muted">Nothing in Trash yet.</p>
    </ScreenLandmark>
  )
}
