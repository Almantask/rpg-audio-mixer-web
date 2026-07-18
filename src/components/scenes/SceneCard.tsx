import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import type { Scene } from '@/types/scene'

import { formatSceneStats, getSceneStats } from '@/lib/sceneStorage'

import type { SceneSoundboardEntry, SceneSoundscapeSlot } from '@/types/scene'

import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'

import { Card, CardContent } from '@/components/ui/card'

import { SwipeToDelete } from '@/components/shared/SwipeToDelete'



interface SceneCardProps {

  scene: Scene

  soundscapeSlots: SceneSoundscapeSlot[]

  soundboardEntries: SceneSoundboardEntry[]

  variant?: 'global' | 'session'

  showLastActive?: boolean

  onEdit: () => void

  onDuplicate: () => void

  onDelete: () => void

  onOpen?: () => void

  navigateTo?: string

  navigateState?: Record<string, string>

}



export function SceneCard({

  scene,

  soundscapeSlots,

  soundboardEntries,

  variant = 'global',

  showLastActive = false,

  onEdit,

  onDuplicate,

  onDelete,

  onOpen,

  navigateTo,

  navigateState,

}: SceneCardProps) {

  const navigate = useNavigate()

  const stats = getSceneStats(scene.id, soundscapeSlots, soundboardEntries)

  const isSession = variant === 'session'



  const handleOpen = () => {

    onOpen?.()

    if (navigateTo) {

      navigate(navigateTo, { state: navigateState })

    } else {

      navigate(`/scenes/${scene.id}/active`, { state: navigateState })

    }

  }



  return (

    <SwipeToDelete onSwipeDelete={onDelete}>

      <Card

        data-scene-card={isSession ? undefined : scene.name}

        data-session-scene-card={isSession ? scene.name : undefined}

        data-scene-variant={isSession ? undefined : 'default'}

        className="overflow-hidden border-parchment/10 bg-charcoal-elevated transition-all duration-200 hover:-translate-y-px hover:border-gold/35"

      >

        <CardContent className="relative p-0">

          <div

            aria-hidden="true"

            className="absolute inset-0 bg-gradient-to-r from-charcoal/92 via-charcoal/72 to-charcoal/40"

          />

          {scene.coverArtUrl ? (

            <div

              className="absolute inset-0"

              data-scene-cover={scene.name}

            >

              <img

                src={scene.coverArtUrl}

                alt=""

                className="h-full w-full object-cover"

              />

            </div>

          ) : (

            <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-charcoal to-violet/10" />

          )}



          <div className="relative flex items-center gap-3 p-4">

            <button

              type="button"

              className="min-w-0 flex-1 text-left"

              data-scene-body={isSession ? undefined : scene.name}

              data-session-scene-body={isSession ? scene.name : undefined}

              onClick={handleOpen}

            >

              <div className="mb-2 flex flex-wrap items-center gap-2">

                {showLastActive ? (

                  <Badge data-last-active={scene.name}>Last Active</Badge>

                ) : null}

                {scene.tags.map((tag) => (

                  <Badge key={tag} data-scene-tag={tag}>

                    {tag.toUpperCase()}

                  </Badge>

                ))}

              </div>

              <h3

                className="font-serif text-2xl tracking-wide text-gold"

                data-scene-title={isSession ? undefined : scene.name}

                data-session-scene-title={isSession ? scene.name : undefined}

              >

                {scene.name}

              </h3>

              <p className="mt-1 text-sm text-muted" data-scene-stats={scene.name}>

                {formatSceneStats(stats.soundscapeCount, stats.fxCount)}

              </p>

              {scene.description?.trim() ? (

                <p

                  className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted sm:hidden"

                  {...(isSession
                    ? { 'data-session-scene-description-mobile': scene.name }
                    : { 'data-scene-description-mobile': scene.name })}

                >

                  {scene.description.trim()}

                </p>

              ) : null}

            </button>



            {scene.description?.trim() ? (

              <p

                className="hidden min-w-0 max-w-md flex-1 text-sm leading-relaxed text-muted sm:line-clamp-3 sm:block"

                {...(isSession
                  ? { 'data-session-scene-description': scene.name }
                  : { 'data-scene-description': scene.name })}

              >

                {scene.description.trim()}

              </p>

            ) : null}



            <div className="flex shrink-0 items-center gap-1">

              <Button

                type="button"

                variant="ghost"

                size="icon"

                aria-label={`Edit ${scene.name}`}

                data-edit-scene={scene.name}

                onClick={(event) => {

                  event.stopPropagation()

                  onEdit()

                }}

              >

                <Pencil className="h-4 w-4" aria-hidden="true" />

              </Button>

              <Button

                type="button"

                variant="ghost"

                size="icon"

                aria-label={`Duplicate ${scene.name}`}

                data-duplicate-scene={scene.name}

                onClick={(event) => {

                  event.stopPropagation()

                  onDuplicate()

                }}

              >

                <Copy className="h-4 w-4" aria-hidden="true" />

              </Button>

              <Button

                type="button"

                variant="ghost"

                size="icon"

                aria-label={isSession ? `Unlink ${scene.name}` : `Delete ${scene.name}`}

                data-delete-scene={isSession ? undefined : scene.name}

                data-unlink-scene={isSession ? scene.name : undefined}

                onClick={(event) => {

                  event.stopPropagation()

                  onDelete()

                }}

              >

                <Trash2 className="h-4 w-4" aria-hidden="true" />

              </Button>

            </div>

          </div>

        </CardContent>

      </Card>

    </SwipeToDelete>

  )

}



export function CreateSceneCard({

  onClick,

  label = 'New Scene',

}: {

  onClick: () => void

  label?: string

}) {

  const rowAttr = label === 'Import Scene' ? 'data-import-scene-row' : 'data-new-scene-row'



  return (

    <button

      type="button"

      aria-label={label}

      {...{ [rowAttr]: true }}

      className="w-full rounded-xl border border-dashed border-gold/35 bg-charcoal-elevated/40 p-6 text-center transition-colors hover:border-gold/60 hover:bg-gold/5"

      onClick={onClick}

    >

      <Plus className="mx-auto mb-2 h-6 w-6 text-gold" aria-hidden="true" />

      <span className="text-gold">{label}</span>

    </button>

  )

}



export function ScenesEmptyState() {

  return (

    <div className="mb-6 text-center" data-scenes-empty>

      <p className="font-serif text-xl text-gold">No scenes yet</p>

      <p className="mt-2 text-sm text-muted">Create your first immersive environment.</p>

    </div>

  )

}



export function SessionScenesEmptyState() {

  return (

    <div className="mb-6 text-center" data-session-scenes-empty>

      <p className="font-serif text-xl text-gold">No scenes in this session yet</p>

      <p className="mt-2 text-sm text-muted">
        Create a scene here, or import an existing global scene.
      </p>

    </div>

  )

}



export function SceneCardSkeleton() {

  return (

    <Card aria-label="Loading scene" data-testid="scene-skeleton">

      <CardContent className="space-y-3 p-4">

        <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />

        <div className="h-6 w-2/3 animate-pulse rounded bg-white/10" />

        <div className="h-4 w-1/4 animate-pulse rounded bg-white/10" />

      </CardContent>

    </Card>

  )

}



export function ScenesNoMatchMessage() {

  return (

    <p className="py-4 text-center text-muted" data-testid="scenes-no-match">

      No scenes match

    </p>

  )

}

