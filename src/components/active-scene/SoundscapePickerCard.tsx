import { useEffect, useState } from 'react'
import type { SoundscapeCategory } from '@/types/library'
import { audioPreview } from '@/lib/audioPreview'
import { getCategoryLayerCount } from '@/lib/soundscapeStorage'
import { Card, CardContent } from '@/components/ui/card'

interface SoundscapePickerCardProps {
  category: SoundscapeCategory
  checked?: boolean
  onCheck?: (checked: boolean) => void
  onPreview?: () => void
}

export function SoundscapePickerCard({
  category,
  checked = false,
  onCheck,
  onPreview,
}: SoundscapePickerCardProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    return audioPreview.subscribe((trackId, _trackName, isPlaying) => {
      setPlaying(Boolean(trackId?.startsWith(`sc-${category.id}`)) && isPlaying)
    })
  }, [category.id])

  const layerCount = getCategoryLayerCount(category)

  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onCheck?.(!checked)
  }

  return (
    <Card
      data-sc-picker-item={category.name}
      className={playing ? 'border-gold ring-1 ring-gold/40' : 'border-white/10'}
    >
      <CardContent className="p-3">
        <button
          type="button"
          className="w-full text-left"
          data-sc-picker-body={category.name}
          onClick={onPreview}
        >
          <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-charcoal text-2xl">
            <span data-sc-picker-preview-state={category.name} data-state={playing ? 'playing' : 'idle'}>
              {playing ? '● PLAYING' : '♪'}
            </span>
          </div>
          <p className="font-medium text-white">{category.name}</p>
          <p className="text-sm text-muted">{category.trackCount} tracks</p>
          <p className="text-sm text-muted">{layerCount} layers</p>
        </button>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onCheck?.(!checked)}
            onClick={handleCheckboxClick}
            data-sc-picker-check={category.id}
            aria-label={`Select ${category.name}`}
          />
          Select
        </label>
      </CardContent>
    </Card>
  )
}

export function SoundscapePickerCardSkeleton() {
  return <div className="h-48 animate-pulse rounded-md bg-white/5" />
}
