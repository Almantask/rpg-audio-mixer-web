import { useEffect, useState } from 'react'

import { Pause, Play, Pencil, Trash2 } from 'lucide-react'

import type { FxTrack } from '@/types/library'

import { formatFxDuration } from '@/lib/sceneStorage'

import { audioPreview } from '@/lib/audioPreview'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'

import { Card, CardContent } from '@/components/ui/card'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'



const FX_TAG_SUGGESTIONS = ['Combat', 'Impact', 'Creature', 'UI', 'Magic', 'Ambient', 'Other']



interface FxCardProps {

  track: FxTrack

  mode?: 'browse' | 'picker'

  checked?: boolean

  onCheck?: (checked: boolean) => void

  onUpdate?: (input: { name: string; tags: string[] }) => void

  onDelete?: () => void

}



export function FxCard({

  track,

  mode = 'browse',

  checked = false,

  onCheck,

  onUpdate,

  onDelete,

}: FxCardProps) {

  const [editing, setEditing] = useState(false)

  const [name, setName] = useState(track.name)

  const [tagInput, setTagInput] = useState('')

  const [tags, setTags] = useState<string[]>(track.tags)

  const [playing, setPlaying] = useState(false)



  useEffect(() => {
    return audioPreview.subscribe((trackId, _trackName, isPlaying) => {
      setPlaying(trackId === track.id && isPlaying)
    })
  }, [track.id])

  const handlePreview = () => {
    if (playing) {
      audioPreview.pause()
      return
    }
    audioPreview.play(track.id, track.audioUrl, track.name)
  }



  const handleCheckboxClick = (event: React.MouseEvent) => {

    event.stopPropagation()

    onCheck?.(!checked)

  }



  const saveEdit = () => {

    onUpdate?.({

      name: name.trim() || track.name,

      tags,

    })

    setEditing(false)

  }



  const cardAttrs =

    mode === 'picker'

      ? { 'data-fx-picker-item': track.name }

      : { 'data-fx-card': track.name }



  const previewStateAttr =

    mode === 'picker' ? 'data-fx-picker-preview-state' : 'data-fx-card-preview-state'



  const tagSuggestions = FX_TAG_SUGGESTIONS.filter(

    (tag) =>

      tagInput.trim().length > 0 &&

      tag.toLowerCase().includes(tagInput.trim().toLowerCase()) &&

      !tags.includes(tag),

  )



  return (

    <Card
      {...cardAttrs}
      className={cn(
        'min-w-0 overflow-hidden',
        playing ? 'border-gold ring-1 ring-gold/40' : 'border-white/10',
      )}
    >

      <CardContent className="p-3">

        <button

          type="button"

          className="w-full text-left"

          data-fx-card-body={mode === 'browse' ? track.name : undefined}

          data-fx-picker-body={mode === 'picker' ? track.name : undefined}

          onClick={handlePreview}

        >

          <div

            className="mb-3 flex aspect-square items-center justify-center rounded-md bg-charcoal text-2xl"

            data-fx-card-thumb={mode === 'browse' ? track.name : undefined}

          >

            <span {...{ [previewStateAttr]: track.name }} data-state={playing ? 'playing' : 'idle'}>

              {playing ? '● PLAYING' : '♪'}

            </span>

          </div>

          <p
            className="truncate font-medium text-white"
            data-fx-card-title={mode === 'browse' ? track.name : undefined}
            title={track.name}
          >
            {track.name}
          </p>

          <p className="text-sm text-muted" data-fx-card-meta={mode === 'browse' ? true : undefined}>

            {formatFxDuration(track.durationSeconds)} · {track.baseIntensity}

          </p>

          <div className="mt-2 flex flex-wrap gap-1">

            {track.tags.map((tag) => (

              <Badge key={tag} data-fx-tag={tag}>

                {tag.toUpperCase()}

              </Badge>

            ))}

          </div>

        </button>



        {mode === 'picker' ? (

          <label className="mt-3 flex items-center gap-2 text-sm">

            <input

              type="checkbox"

              checked={checked}

              onChange={() => onCheck?.(!checked)}

              onClick={handleCheckboxClick}

              data-fx-picker-check={track.id}

            />

            Select

          </label>

        ) : (

          <Button

            type="button"

            variant="ghost"

            size="icon"

            className="mt-2"

            aria-label={`Edit ${track.name}`}

            data-fx-edit={track.name}

            onClick={() => setEditing((current) => !current)}

          >

            <Pencil className="h-4 w-4" />

          </Button>

        )}



        {editing ? (

          <div className="mt-3 space-y-2 border-t border-white/10 pt-3" data-fx-inline-edit={track.name}>

            <div>

              <Label htmlFor={`fx-name-${track.id}`}>Name</Label>

              <Input

                id={`fx-name-${track.id}`}

                value={name}

                onChange={(event) => setName(event.target.value)}

                data-fx-inline-name

              />

            </div>

            <div>

              <Label htmlFor={`fx-tags-${track.id}`}>Tags</Label>

              <div className="relative">

                <Input

                  id={`fx-tags-${track.id}`}

                  aria-label="FX tag"

                  value={tagInput}

                  onChange={(event) => setTagInput(event.target.value)}

                  data-fx-tag-input

                />

                {tagSuggestions.length > 0 ? (

                  <ul className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-white/10 bg-charcoal-elevated">

                    {tagSuggestions.map((tag) => (

                      <li key={tag}>

                        <button

                          type="button"

                          role="option"

                          className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"

                          onClick={() => {

                            setTags((current) => [...current, tag])

                            setTagInput('')

                          }}

                        >

                          {tag}

                        </button>

                      </li>

                    ))}

                  </ul>

                ) : null}

              </div>

            </div>

            <div className="flex gap-2">

              <Button type="button" onClick={saveEdit}>

                Save

              </Button>

              {onDelete ? (

                <Button

                  type="button"

                  variant="ghost"

                  data-fx-inline-delete={track.name}

                  onClick={onDelete}

                >

                  <Trash2 className="mr-1 h-4 w-4" />

                  Delete

                </Button>

              ) : null}

            </div>

          </div>

        ) : null}

      </CardContent>

    </Card>

  )

}



export function FxCardSkeleton() {

  return (

    <Card aria-label="Loading FX track" data-testid="fx-skeleton">

      <CardContent className="space-y-3 p-3">

        <div className="aspect-square animate-pulse rounded-md bg-white/10" />

        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />

        <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />

      </CardContent>

    </Card>

  )

}



export function FxLibraryEmptyState() {

  return (

    <div className="col-span-full py-8 text-center" data-fx-library-empty>

      <p className="font-serif text-xl text-gold">No sound effects yet</p>

      <p className="mt-2 text-sm text-muted">

        Import your own tracks or download the free demo pack to get started.

      </p>

    </div>

  )

}



export function FxMiniPlayer() {
  const [trackId, setTrackId] = useState<string | null>(null)
  const [trackName, setTrackName] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    return audioPreview.subscribe((id, name, isPlaying) => {
      setTrackId(id)
      setTrackName(name)
      setPlaying(isPlaying)
    })
  }, [])

  if (!trackName) {
    return null
  }



  return (

    <div

      className="sticky bottom-0 mt-6 flex items-center justify-between border-t border-white/10 bg-charcoal-elevated p-4"

      data-mini-player

    >

      <span data-mini-player-track>{trackName}</span>

      <Button

        type="button"

        variant="ghost"

        size="icon"

        aria-label={playing ? 'Pause preview' : 'Play preview'}

        data-mini-player-pause={playing ? true : undefined}

        data-mini-player-play={playing ? undefined : true}

        onClick={() => {
          if (playing) {
            audioPreview.pause()
            return
          }
          if (trackId && trackName) {
            audioPreview.play(trackId, '', trackName)
          }
        }}

      >

        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}

      </Button>

    </div>

  )

}



interface ImportFxButtonProps {

  onImport: (file: File) => void

}



export function ImportFxButton({ onImport }: ImportFxButtonProps) {

  return (

    <label className="inline-flex cursor-pointer">

      <input

        type="file"

        accept="audio/*"

        className="sr-only"

        data-fx-import-input

        onChange={(event) => {

          const file = event.target.files?.[0]

          if (file) {

            onImport(file)

            event.target.value = ''

          }

        }}

      />

      <span className="inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm text-white hover:bg-white/5">

        Import FX

      </span>

    </label>

  )

}

