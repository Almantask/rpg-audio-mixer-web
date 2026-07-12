export function HomeErrorOverlay() {
  return (
    <div
      data-home-error-overlay
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-6"
    >
      <div className="mt-16 max-w-md rounded-lg border border-red-500/40 bg-charcoal-elevated p-6 text-center">
        <h3 className="font-serif text-xl text-gold">Unable to load Home</h3>
        <p className="mt-2 text-muted">
          Something went wrong while loading your dashboard. Cached content may be shown below.
        </p>
      </div>
    </div>
  )
}
