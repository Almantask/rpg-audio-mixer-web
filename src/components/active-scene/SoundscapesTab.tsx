import { Plus, Trash2 } from 'lucide-react'
import type { SceneSoundscapeSlot } from '@/types/scene'
import type { SoundscapeCategory } from '@/types/library'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SoundscapesTabProps {
  slots: Array<SceneSoundscapeSlot & { category?: SoundscapeCategory }>
  onRemoveSlot: (slotId: string) => void
  onAddSoundscape: () => void
}

export function SoundscapesTab({ slots, onRemoveSlot, onAddSoundscape }: SoundscapesTabProps) {
  return (
    <div data-soundscapes-tab>
      {slots.length === 0 ? (
        <p className="mb-6 text-center text-muted" data-soundscape-empty>
          No soundscape categories yet. Add one to begin layering ambience.
        </p>
      ) : (
        <div className="mb-6 space-y-4">
          {slots.map((slot) => (
            <Card
              key={slot.id}
              data-soundscape-category={slot.category?.name ?? slot.categoryId}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">
                    {slot.category?.name ?? slot.categoryId}
                  </p>
                  <p className="text-sm text-muted">
                    {slot.category?.trackCount ?? 0} tracks
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${slot.category?.name ?? 'soundscape'}`}
                  data-soundscape-delete={slot.category?.name ?? slot.categoryId}
                  onClick={() => onRemoveSlot(slot.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label="Add Soundscape"
        data-soundscape-add
        className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 p-6 text-gold hover:border-gold/70"
        onClick={onAddSoundscape}
      >
        <Plus className="mb-2 h-6 w-6" />
        Add Soundscape
      </button>
    </div>
  )
}
