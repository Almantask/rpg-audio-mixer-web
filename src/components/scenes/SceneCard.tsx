import { Copy, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSwipeRight } from '@/hooks/useSwipeRight'
import { formatSceneStats } from '@/lib/storage/sceneRepository'
import { getActiveScenePath } from '@/lib/storage/db'
import type { Scene } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface SceneCardProps {
  scene: Scene
  isLastActive?: boolean
  onDelete: (scene: Scene) => void
  onDuplicate: (scene: Scene) => void
  onEdit: (scene: Scene) => void
  deleteAriaLabel?: string
}

export function SceneCard({
  scene,
  isLastActive = false,
  onDelete,
  onDuplicate,
  onEdit,
  deleteAriaLabel,
}: SceneCardProps) {
  const navigate = useNavigate()
  const { swipeHandlers } = useSwipeRight(() => onDelete(scene))
  const trashLabel = deleteAriaLabel ?? `Delete ${scene.name}`

  const openScene = () => {
    navigate(getActiveScenePath(scene.id))
  }

  return (
    <article
      aria-label={`${scene.name} scene card`}
      className={cn(
        'relative overflow-hidden rounded-lg border border-zinc-800 bg-surface',
        isLastActive ? 'ring-1 ring-gold/40' : undefined,
      )}
      data-scene-name={scene.name}
      data-testid="scene-card"
      {...swipeHandlers}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"
        style={
          scene.coverArtUrl
            ? {
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.55)), url(${scene.coverArtUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />
      <div className="relative flex items-center gap-4 p-4">
        <button
          className="min-w-0 flex-1 text-left"
          onClick={openScene}
          type="button"
        >
          <div className="flex flex-wrap items-center gap-2">
            {isLastActive ? (
              <Badge className="animate-pulse bg-gold/20 text-gold" data-testid="last-active-badge">
                Last Active
              </Badge>
            ) : null}
            {scene.tags.map((tag) => (
              <Badge className="uppercase" key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h2 className="mt-2 font-serif text-lg text-gold">{scene.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">{formatSceneStats(scene)}</p>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            aria-label={`Edit ${scene.name}`}
            onClick={() => onEdit(scene)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label={`Duplicate ${scene.name}`}
            onClick={() => onDuplicate(scene)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Copy aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label={trashLabel}
            className="text-zinc-400 hover:text-red-400"
            onClick={() => onDelete(scene)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export function SceneCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-24 animate-pulse rounded-lg bg-zinc-800"
      data-testid="scene-card-skeleton"
    />
  )
}

export function NewSceneCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-6 text-zinc-400 transition-colors hover:border-gold/40 hover:text-gold"
      data-testid="new-scene-card"
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true" className="text-xl">
        +
      </span>
      <span>{label}</span>
    </button>
  )
}

export function ScenesEmptyState({
  onCreate,
  ctaLabel = 'New Scene',
}: {
  onCreate: () => void
  ctaLabel?: string
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center" data-testid="scenes-empty-state">
      <div
        aria-hidden="true"
        className="mb-6 h-24 w-24 rounded-full bg-zinc-800/80"
        data-testid="scenes-empty-illustration"
      />
      <p className="text-zinc-500">No scenes yet. Create your first immersive environment.</p>
      <button
        className="mt-6 rounded-md bg-gold px-4 py-2 text-sm font-medium text-black"
        onClick={onCreate}
        type="button"
      >
        {ctaLabel}
      </button>
    </div>
  )
}
