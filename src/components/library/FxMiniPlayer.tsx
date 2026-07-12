import { Pause, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface FxMiniPlayerProps {
  trackName: string
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onClose?: () => void
}

export function FxMiniPlayer({ trackName, isPlaying, onPlay, onPause, onClose }: FxMiniPlayerProps) {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    setVisible(true)
    setExiting(false)
  }, [trackName])

  const handleClose = () => {
    setExiting(true)
    window.setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, 180)
  }

  if (!visible) return null

  return (
    <div
      className={`sticky bottom-0 border-t border-zinc-800 bg-surface px-4 py-3 ${exiting ? 'mini-player-exit' : 'mini-player-enter'}`}
      data-testid="fx-mini-player"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm text-zinc-100">{trackName}</p>
        <div className="flex items-center gap-2">
          <Button
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            onClick={isPlaying ? onPause : onPlay}
            size="icon"
            type="button"
            variant="outline"
          >
            {isPlaying ? (
              <Pause aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Play aria-hidden="true" className="h-4 w-4" />
            )}
          </Button>
          <Button
            aria-label="Close mini player"
            data-testid="mini-player-close"
            onClick={handleClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
