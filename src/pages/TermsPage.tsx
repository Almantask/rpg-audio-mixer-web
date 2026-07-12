import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

export function TermsPage() {
  return (
    <ScreenLandmark screenName="Terms of Service screen">
      <PageHeader title="Terms of Service" subtitle="Arcanum Audio usage terms." />
      <p className="text-muted">
        Terms of service content will be published here. By using Arcanum Audio you agree to use
        the app responsibly and respect bundled audio licensing.
      </p>
    </ScreenLandmark>
  )
}
