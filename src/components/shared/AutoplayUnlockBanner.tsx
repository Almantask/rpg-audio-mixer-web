import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { audioEngine } from '@/lib/audio'

interface AutoplayUnlockBannerProps {
  visible: boolean
  onUnlock: () => void
}

export function AutoplayUnlockBanner({ visible, onUnlock }: AutoplayUnlockBannerProps) {
  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-gold/40 bg-zinc-950 px-4 py-3 shadow-lg"
      data-testid="autoplay-unlock-banner"
      role="status"
    >
      <Volume2 aria-hidden className="h-4 w-4 text-gold" />
      <p className="text-sm text-zinc-200">Tap to enable audio playback</p>
      <Button
        data-testid="autoplay-unlock-button"
        onClick={() => void onUnlock()}
        size="sm"
        type="button"
      >
        Enable Audio
      </Button>
    </div>
  )
}

export function needsAutoplayUnlock(): boolean {
  if (typeof window === 'undefined') return false
  const context = audioEngine.getContextState()
  return context === 'suspended'
}
