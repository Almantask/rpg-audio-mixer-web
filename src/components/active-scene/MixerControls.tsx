import { Lock, LockOpen, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface MasterVolumeBarProps {
  masterVolume: number
  masterMuted: boolean
  onVolumeChange: (value: number) => void
  onToggleMute: () => void
}

export function MasterVolumeBar({
  masterVolume,
  masterMuted,
  onVolumeChange,
  onToggleMute,
}: MasterVolumeBarProps) {
  return (
    <section
      aria-label="Master Volume controls"
      className="rounded-md border border-zinc-800 px-4 py-4"
      data-testid="master-volume-bar"
    >
      <div className="mb-3 flex items-center gap-3">
        <Button
          aria-label={masterMuted ? 'Unmute soundscapes' : 'Mute soundscapes'}
          aria-pressed={masterMuted}
          data-testid="master-mute-button"
          onClick={onToggleMute}
          size="icon"
          type="button"
          variant="outline"
        >
          {masterMuted ? <VolumeX aria-hidden className="h-4 w-4" /> : <Volume2 aria-hidden className="h-4 w-4" />}
        </Button>
        <Slider
          aria-label="Master Volume"
          aria-valuenow={masterVolume}
          className="flex-1"
          data-testid="master-volume-slider"
          label="Master Volume"
          max={100}
          min={0}
          onChange={(event) => onVolumeChange(Number.parseInt(event.currentTarget.value, 10))}
          value={masterVolume}
          valueLabel={`${masterVolume}%`}
        />
      </div>
    </section>
  )
}

interface SoundboardMasterBarProps {
  soundboardMaster: number
  onVolumeChange: (value: number) => void
}

export function SoundboardMasterBar({ soundboardMaster, onVolumeChange }: SoundboardMasterBarProps) {
  return (
    <section
      aria-label="Soundboard Master controls"
      className="rounded-md border border-zinc-800 px-4 py-4"
      data-testid="soundboard-master-bar"
    >
      <Slider
        aria-label="Soundboard Master"
        aria-valuenow={soundboardMaster}
        data-testid="soundboard-master-slider"
        label="Soundboard Master"
        max={100}
        min={0}
        onChange={(event) => onVolumeChange(Number.parseInt(event.currentTarget.value, 10))}
        value={soundboardMaster}
        valueLabel={`${soundboardMaster}%`}
      />
    </section>
  )
}

interface SceneHeaderActionsProps {
  sessionLocked: boolean
  onStopAll: () => void
  onToggleLock: () => void
}

export function SceneHeaderActions({
  sessionLocked,
  onStopAll,
  onToggleLock,
}: SceneHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button data-testid="stop-all-button" onClick={onStopAll} type="button" variant="outline">
        Stop All
      </Button>
      <Button
        aria-label={sessionLocked ? 'Unlock session' : 'Lock session'}
        aria-pressed={sessionLocked}
        data-testid="session-lock-button"
        onClick={onToggleLock}
        size="icon"
        type="button"
        variant="outline"
      >
        {sessionLocked ? <Lock aria-hidden className="h-4 w-4" /> : <LockOpen aria-hidden className="h-4 w-4" />}
      </Button>
    </div>
  )
}
