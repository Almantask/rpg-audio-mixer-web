import { ScreenLandmark } from '@/components/layout/AppShell'

export function HomePage() {
  return (
    <ScreenLandmark screenName="Home screen">
      <section
        aria-label="Active campaign hero"
        data-testid="active-campaign-hero"
        className="rounded-lg border border-gold/30 bg-charcoal-elevated p-6"
      >
        <h3 className="font-serif text-2xl text-gold">Shadows of the Underdark</h3>
        <p className="mt-2 text-muted">Session 14: The Whispering Gallery awaits…</p>
      </section>
    </ScreenLandmark>
  )
}
