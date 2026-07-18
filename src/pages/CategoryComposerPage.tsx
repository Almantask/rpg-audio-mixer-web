import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus, X, Pause, Play, Upload } from 'lucide-react'
import { ScreenLandmark } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCampaignData } from '@/context/CampaignDataContext'
import { useToast } from '@/components/shared/ToastProvider'
import { audioPreview } from '@/lib/audioPreview'
import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function CategoryComposerPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const {
    data,
    updateSoundscapeCategory,
  } = useCampaignData()

  const category = useMemo(() => {
    return data.soundscapeCategories.find((c) => c.id === categoryId)
  }, [data.soundscapeCategories, categoryId])

  // Intensity level expansions
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    I: true,
    II: false,
    III: false,
  })

  // Track Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerLevel, setPickerLevel] = useState<'I' | 'II' | 'III' | null>(null)

  useEffect(() => {
    // If it's a new category (e.g. no levels defined or empty), Level I is expanded, II and III collapsed
    if (category && (!category.levels || (!category.levels.I.length && !category.levels.II.length && !category.levels.III.length))) {
      setExpandedLevels({ I: true, II: false, III: false })
    }
  }, [category])

  useEffect(() => {
    return () => {
      audioPreview.stop()
    }
  }, [])

  if (!category) {
    return (
      <ScreenLandmark screenName="Category Composer screen">
        <p className="text-muted">Category not found.</p>
        <Button variant="ghost" onClick={() => navigate('/library?tab=soundscapes')}>
          ← Back to Library
        </Button>
      </ScreenLandmark>
    )
  }

  const handleToggleLevel = (level: 'I' | 'II' | 'III') => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }))
  }

  const handleRemoveTrack = (level: 'I' | 'II' | 'III', trackId: string) => {
    const currentLevels = category.levels ?? { I: [], II: [], III: [] }
    const updatedLevelTracks = currentLevels[level].filter((id) => id !== trackId)
    const updatedLevels = {
      ...currentLevels,
      [level]: updatedLevelTracks,
    }
    updateSoundscapeCategory(category.id, { levels: updatedLevels })
  }

  const handleOpenPicker = (level: 'I' | 'II' | 'III') => {
    setPickerLevel(level)
    setPickerOpen(true)
  }

  const handleClosePicker = () => {
    setPickerOpen(false)
    setPickerLevel(null)
    audioPreview.stop()
  }

  const handleSave = () => {
    showToast('Composition saved')
  }

  const handleBackToLibrary = () => {
    navigate('/library?tab=soundscapes')
  }

  const levels = category.levels ?? { I: [], II: [], III: [] }

  return (
    <ScreenLandmark screenName="Category Composer screen" className="max-w-4xl">
      <div className="flex flex-col space-y-6">
        {/* Header navigation & title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={handleBackToLibrary}
              className="text-sm text-gold hover:underline flex items-center gap-1 mb-2 cursor-pointer"
            >
              ← Library
            </button>
            <h1 className="text-3xl font-serif font-bold text-gold">{category.name}</h1>
            <p className="text-sm text-muted">Category Composer</p>
            <p className="text-xs text-muted/80 mt-1">Assign tracks to intensity levels for this category.</p>
          </div>
          <Button
            type="button"
            className="self-start md:self-center font-semibold bg-gold hover:bg-gold/80 text-black px-6"
            onClick={handleSave}
          >
            Save Composition
          </Button>
        </div>

        {/* Intensity Level Rows */}
        <div className="space-y-4">
          {(['I', 'II', 'III'] as const).map((level) => {
            const trackIds = levels[level] ?? []
            const isExpanded = expandedLevels[level]
            const trackCount = trackIds.length

            return (
              <Card key={level} className="bg-charcoal border border-white/10 overflow-hidden">
                <CardContent className="p-0">
                  {/* Collapsible level row header */}
                  <div
                    onClick={() => handleToggleLevel(level)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
                    data-sc-level-header={level}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gold" data-sc-level-chevron-down={level} />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gold" data-sc-level-chevron-right={level} />
                      )}
                      <span className="font-serif font-bold text-white text-lg">Level {level}</span>
                    </div>
                    <span className="text-sm text-muted" data-sc-level-count={level}>
                      {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                    </span>
                  </div>

                  {/* Expanded Level details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-white/10 bg-black/20 space-y-3" data-sc-level-content={level}>
                      {/* Add Track Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenPicker(level)}
                        className="w-full justify-center border-dashed border-gold/40 hover:border-gold/70 text-gold bg-transparent"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add track
                      </Button>

                      {/* Track list */}
                      {trackCount === 0 ? null : (
                        <div className="space-y-2 mt-2">
                          {trackIds.map((trackId) => {
                            const track = data.soundscapeTracks?.find((t) => t.id === trackId)
                            if (!track) return null

                            return (
                              <div
                                key={track.id}
                                className="flex items-center justify-between p-3 rounded-md bg-charcoal border border-white/5 hover:border-white/10 group"
                                data-sc-composer-track={track.name}
                              >
                                <div>
                                  <p className="font-medium text-white text-sm">{track.name}</p>
                                  <p className="text-xs text-muted mt-0.5">
                                    {track.format} · {track.channels} · {formatDuration(track.durationSeconds)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTrack(level, track.id)}
                                  className="p-1.5 rounded-full hover:bg-white/10 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label={`Remove ${track.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Track Picker Modal */}
      {pickerLevel && (
        <TrackPickerModal
          open={pickerOpen}
          onClose={handleClosePicker}
          level={pickerLevel}
          category={category}
          onAddTracks={(tracks) => {
            const currentLevels = category.levels ?? { I: [], II: [], III: [] }
            const currentIds = currentLevels[pickerLevel] ?? []
            const newIds = tracks.map((t) => t.id)
            const updatedLevels = {
              ...currentLevels,
              [pickerLevel]: [...currentIds, ...newIds],
            }
            updateSoundscapeCategory(category.id, { levels: updatedLevels })
            showToast(`${tracks.length} track${tracks.length === 1 ? '' : 's'} added`)
          }}
        />
      )}
    </ScreenLandmark>
  )
}

interface TrackPickerModalProps {
  open: boolean
  onClose: () => void
  level: 'I' | 'II' | 'III'
  category: SoundscapeCategory
  onAddTracks: (tracks: SoundscapeTrack[]) => void
}

function TrackPickerModal({ open, onClose, level, category, onAddTracks }: TrackPickerModalProps) {
  const { data, importSoundscapeTrack, e2e } = useCampaignData()
  const [search, setSearch] = useState('')
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({})
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentLevelTrackIds = useMemo(() => {
    return new Set(category.levels?.[level] ?? [])
  }, [category, level])

  // Filter soundscape tracks
  const availableTracks = useMemo(() => {
    const list = (data.soundscapeTracks ?? []).filter(
      (track) => !track.deletedAt && !currentLevelTrackIds.has(track.id)
    )

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return list.filter((track) => track.name.toLowerCase().includes(q))
    }

    return list
  }, [data.soundscapeTracks, currentLevelTrackIds, search])

  // Checkbox count
  const checkedCount = useMemo(() => {
    return Object.values(checkedIds).filter(Boolean).length
  }, [checkedIds])

  // Handle Play/Pause preview
  useEffect(() => {
    return audioPreview.subscribe((trackId, _trackName, isPlaying) => {
      setPreviewTrackId(isPlaying ? trackId : null)
    })
  }, [])

  const handleTogglePreview = (track: SoundscapeTrack, event: React.MouseEvent) => {
    event.stopPropagation()
    if (previewTrackId === track.id) {
      audioPreview.pause()
    } else {
      audioPreview.play(track.id, track.audioUrl, track.name)
    }
  }

  const handleToggleChecked = (trackId: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }))
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const track = importSoundscapeTrack(file)
    // auto-check the newly imported track
    setCheckedIds((prev) => ({
      ...prev,
      [track.id]: true,
    }))
  }

  const handleAddSelected = () => {
    const selectedTracks = (data.soundscapeTracks ?? []).filter((t) => checkedIds[t.id])
    onAddTracks(selectedTracks)
    setCheckedIds({}) // clear selections after addition
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl bg-charcoal border border-white/10 text-white max-h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
          <div>
            <button
              onClick={onClose}
              className="text-xs text-gold hover:underline flex items-center gap-1 mb-1 cursor-pointer"
            >
              ← Category Composer
            </button>
            <DialogTitle className="text-xl font-serif font-bold text-gold">Add track</DialogTitle>
            <p className="text-xs text-muted mt-0.5">Add tracks to Level {level}.</p>
          </div>
        </DialogHeader>

        {/* Action button (Import) */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
            accept="audio/*"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 border-white/10 hover:bg-white/5 bg-transparent text-white cursor-pointer"
          >
            <Upload className="h-4 w-4 text-gold" />
            Import
          </Button>

          <Input
            placeholder="Search tracks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            data-picker-search
          />
        </div>

        {/* Track Selection Grid */}
        <div className="flex-1 overflow-y-auto min-h-[250px] py-4">
          {e2e.fxLibraryState === 'loading' ? ( // Reuse fxLibraryState loading
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-picker-loading>
              <div className="h-20 rounded bg-white/5 animate-pulse" />
              <div className="h-20 rounded bg-white/5 animate-pulse" />
            </div>
          ) : (data.soundscapeTracks ?? []).filter((t) => !t.deletedAt).length === 0 ? (
            <div className="py-12 text-center text-muted" data-picker-empty>
              <p className="text-sm">No tracks in library yet. Use the Import button to upload audio files.</p>
            </div>
          ) : availableTracks.length === 0 ? (
            <div className="py-12 text-center text-muted" data-picker-no-match>
              <p className="text-sm mb-2">No tracks match your filters</p>
              <Button type="button" variant="ghost" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-picker-grid>
              {availableTracks.map((track) => {
                const isChecked = Boolean(checkedIds[track.id])
                const isPreviewing = previewTrackId === track.id

                return (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-md border transition-all select-none bg-black/20 ${
                      isChecked ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/10'
                    }`}
                    data-picker-track={track.name}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => handleToggleChecked(track.id)}
                      aria-label={`Select ${track.name}`}
                      className="rounded border-white/20 bg-charcoal text-gold focus:ring-gold h-4 w-4"
                      data-picker-checkbox={track.name}
                    />

                    <button
                      type="button"
                      onClick={(event) => handleTogglePreview(track, event)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-sm text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                      aria-label={isPreviewing ? `Pause preview ${track.name}` : `Preview ${track.name}`}
                      aria-pressed={isPreviewing}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm">{track.name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {track.format} · {track.channels} · {formatDuration(track.durationSeconds)}
                        </p>
                      </div>

                      <span
                        className={`p-2 rounded-full transition-colors ${
                          isPreviewing ? 'bg-gold text-black' : 'bg-white/5 hover:bg-white/10 text-gold'
                        }`}
                        aria-hidden="true"
                      >
                        {isPreviewing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Add Selected */}
        <div className="border-t border-white/10 pt-4 flex justify-end">
          <Button
            type="button"
            disabled={checkedCount === 0}
            onClick={handleAddSelected}
            className="bg-gold hover:bg-gold/80 text-black font-semibold min-w-[150px]"
            data-picker-commit
          >
            Add Selected ({checkedCount})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
