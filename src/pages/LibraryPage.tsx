import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Upload, ShoppingCart, Download, Search, Edit2, Play, Pause, Trash2, Check, X } from 'lucide-react'
import { useFxTracks } from '../lib/useStorage'
import { storage } from '../lib/storage'
import { sceneAudioManager } from '../lib/audio/sceneAudioManager'
import { subscribeAudioState } from '../lib/audio/audioState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Skeleton } from '../components/ui/skeleton'
import type { FxTrack } from '../lib/types'

const PREDEFINED_FX_TAGS = ['Combat', 'Creature', 'Impact', 'Magic', 'Nature', 'UI', 'Ambient', 'Ranged']

export function LibraryPage() {
  const [searchParams] = useSearchParams()
  const { fxTracks, refresh } = useFxTracks()

  const [activeTab, setActiveTab] = useState('fx')
  const [searchQuery, setSearchQuery] = useState('')

  // Preview & Mini player state
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<FxTrack | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Simulation flags for test scenarios
  const isLoading = searchParams.get('loading') === 'true'

  // Modals
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [freeTracksOpen, setFreeTracksOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inline Edit State
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftTagsInput, setDraftTagsInput] = useState('')

  useEffect(() => {
    return subscribeAudioState((state) => {
      if (!state.isPlaying || state.source !== 'library') {
        if (!isPaused) {
          setCurrentPlayingTrack(null)
        }
      }
    })
  }, [isPaused])

  // Stop playback when unmounting / navigating away
  useEffect(() => {
    return () => {
      sceneAudioManager.stopBySource('library')
    }
  }, [])

  // Stop playback when switching away from FX tab
  const handleTabChange = (val: string) => {
    setActiveTab(val)
    if (val !== 'fx') {
      sceneAudioManager.stopBySource('library')
      setCurrentPlayingTrack(null)
      setIsPaused(false)
    }
  }

  const handlePreview = (track: FxTrack) => {
    if (currentPlayingTrack?.id === track.id && !isPaused) {
      sceneAudioManager.stopBySource('library')
      setCurrentPlayingTrack(null)
      setIsPaused(false)
    } else {
      sceneAudioManager.playFx(track.id, track.name, track.url, {
        source: 'library',
        durationSeconds: track.durationSeconds || 4,
        defaultVolume: track.defaultVolume ?? 1,
      })
      setCurrentPlayingTrack(track)
      setIsPaused(false)
    }
  }

  const handleMiniPlayerToggle = () => {
    if (!currentPlayingTrack) return
    if (isPaused) {
      sceneAudioManager.playFx(currentPlayingTrack.id, currentPlayingTrack.name, currentPlayingTrack.url, {
        source: 'library',
        durationSeconds: currentPlayingTrack.durationSeconds || 4,
      })
      setIsPaused(false)
    } else {
      sceneAudioManager.stopBySource('library')
      setIsPaused(true)
    }
  }

  // Inline Edit handlers
  const handleStartInlineEdit = (track: FxTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTrackId(track.id)
    setDraftName(track.name)
    setDraftTagsInput(track.tags ? track.tags.join(', ') : '')
  }

  const handleSaveInlineEdit = (trackId: string) => {
    if (!draftName.trim()) return
    const parsedTags = draftTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => Boolean(t))

    storage.updateFxTrack(trackId, {
      name: draftName.trim(),
      tags: parsedTags,
    })
    setEditingTrackId(null)
    refresh()
  }

  const handleDeleteFx = (track: FxTrack) => {
    storage.deleteFxTrack(track.id)
    if (currentPlayingTrack?.id === track.id) {
      sceneAudioManager.stopBySource('library')
      setCurrentPlayingTrack(null)
    }
    setEditingTrackId(null)
    refresh()
  }

  const handleImportFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setImportError(null)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('audio/') && !file.name.endsWith('.ogg') && !file.name.endsWith('.mp3')) {
        setImportError(`The file "${file.name}" could not be read as audio.`)
        return
      }

      storage.createFxTrack({
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: URL.createObjectURL(file),
        duration: '0:03',
        durationSeconds: 3,
        tags: ['CUSTOM'],
        intensity: 'II',
      })
    }

    setImportModalOpen(false)
    refresh()
  }

  const filteredTracks = fxTracks.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const nameMatch = t.name.toLowerCase().includes(q)
    const tagMatch = t.tags?.some((tag) => tag.toLowerCase().includes(q))
    return nameMatch || tagMatch
  })

  // Parse draft tags dynamically for preview while typing
  const draftTagsPreview = draftTagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => Boolean(t))

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-amber-300">Audio Library</h2>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-zinc-950 border-zinc-800">
          <TabsTrigger value="soundscapes">Soundscapes</TabsTrigger>
          <TabsTrigger value="fx">Sound Effects</TabsTrigger>
        </TabsList>

        {/* SOUNDSCAPES TAB */}
        <TabsContent value="soundscapes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-zinc-100">Free Compositions</h3>
            <Button variant="gold" size="sm">
              + Add Soundscape
            </Button>
          </div>
          <p className="text-xs text-zinc-400">Manage composite looping background soundscapes.</p>
        </TabsContent>

        {/* SOUND EFFECTS TAB */}
        <TabsContent value="fx" className="space-y-4">
          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(true)}
              className="text-xs"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Import FX
            </Button>
            <Button
              variant="gold"
              onClick={() => setBuyModalOpen(true)}
              className="text-xs"
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Buy More
            </Button>
            <Button
              variant="outline"
              onClick={() => setFreeTracksOpen(true)}
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Free Tracks
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search effects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800"
            />
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {/* Populated Grid or Empty */}
          {!isLoading && fxTracks.length === 0 ? (
            <div className="text-center py-12 space-y-4 border border-dashed border-zinc-800 rounded-lg p-6">
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-zinc-200">No sounds in library</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Import or download FX tracks to build your sound effects catalogue.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
                  Import FX
                </Button>
                <Button variant="gold" size="sm" onClick={() => setBuyModalOpen(true)}>
                  Buy More
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFreeTracksOpen(true)}>
                  Free Tracks
                </Button>
              </div>
            </div>
          ) : !isLoading && filteredTracks.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-zinc-400">No effects match your filters</p>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear filters
              </Button>
            </div>
          ) : !isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
              {filteredTracks.map((track) => {
                const isPlaying = currentPlayingTrack?.id === track.id && !isPaused
                const isEditing = editingTrackId === track.id

                return (
                  <Card
                    key={track.id}
                    data-track-id={track.id}
                    onClick={() => !isEditing && handlePreview(track)}
                    className={`p-3 cursor-pointer relative flex flex-col justify-between transition-all border ${
                      isPlaying
                        ? 'border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.4)] bg-amber-950/20'
                        : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-700'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-semibold">Name</label>
                          <Input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="h-7 text-xs bg-zinc-950"
                            autoFocus
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-semibold">Tags (comma-separated)</label>
                          <Input
                            value={draftTagsInput}
                            onChange={(e) => setDraftTagsInput(e.target.value)}
                            placeholder="e.g. Combat, Creature"
                            className="h-7 text-xs bg-zinc-950"
                          />
                        </div>

                        {/* Predefined Suggestions */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {PREDEFINED_FX_TAGS.slice(0, 4).map((pt) => (
                            <button
                              key={pt}
                              type="button"
                              onClick={() => {
                                const current = draftTagsInput ? draftTagsInput.split(',').map((x) => x.trim()) : []
                                if (!current.includes(pt)) {
                                  setDraftTagsInput([...current, pt].join(', '))
                                }
                              }}
                              className="text-[9px] bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded hover:bg-zinc-700"
                            >
                              +{pt}
                            </button>
                          ))}
                        </div>

                        {/* Draft Tags display */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {draftTagsPreview.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0 uppercase">
                              {t}
                            </Badge>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:bg-red-950/30"
                            aria-label="Delete track"
                            onClick={() => handleDeleteFx(track)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setEditingTrackId(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="gold"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleSaveInlineEdit(track.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Top: Thumbnail area & Play / Edit icon */}
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-semibold text-zinc-400">
                            {track.duration} · <span className="font-serif">{track.intensity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-500 hover:text-amber-300"
                              aria-label="Edit track"
                              onClick={(e) => handleStartInlineEdit(track, e)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <div className="p-1">
                              {isPlaying ? (
                                <Pause className="h-3.5 w-3.5 text-amber-400 fill-current animate-pulse" />
                              ) : (
                                <Play className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-200" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="my-2 space-y-1">
                          <div className="font-serif font-bold text-sm text-zinc-100 line-clamp-1">
                            {track.name}
                          </div>
                          {isPlaying && (
                            <span className="text-[10px] font-bold text-amber-400 tracking-wider">
                              ● PLAYING
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {track.tags?.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0 uppercase">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sticky FX Mini Player */}
      {currentPlayingTrack && (
        <div
          role="region"
          aria-label="FX Mini Player"
          className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-amber-500/40 p-3 shadow-2xl backdrop-blur-md"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="gold"
                className="h-9 w-9 rounded-full shrink-0"
                aria-label={isPaused ? 'Play preview' : 'Pause preview'}
                onClick={handleMiniPlayerToggle}
              >
                {isPaused ? <Play className="h-4 w-4 fill-current ml-0.5" /> : <Pause className="h-4 w-4 fill-current" />}
              </Button>
              <div>
                <div className="font-serif font-bold text-sm text-amber-300">
                  {currentPlayingTrack.name}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {isPaused ? 'Paused' : 'Previewing FX track…'}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sceneAudioManager.stopBySource('library')
                setCurrentPlayingTrack(null)
                setIsPaused(false)
              }}
              className="text-xs text-zinc-400 hover:text-zinc-100"
            >
              Stop
            </Button>
          </div>
        </div>
      )}

      {/* Import FX Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogHeader>
          <DialogTitle>Import FX</DialogTitle>
          <DialogDescription>Upload audio tracks from your computer (.ogg, .mp3).</DialogDescription>
        </DialogHeader>

        {importError && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-md">
            {importError}
          </div>
        )}

        <div className="py-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-zinc-700 hover:border-amber-500 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-zinc-950/60 hover:bg-zinc-900/60 transition-colors"
          >
            <Upload className="h-8 w-8 text-zinc-500 mb-2" />
            <span className="text-sm font-semibold text-zinc-300">Choose Audio Files</span>
            <span className="text-xs text-zinc-500">Audio files only (.ogg, .mp3, .wav)</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.ogg,.mp3,.wav"
            multiple
            className="hidden"
            onChange={(e) => handleImportFiles(e.target.files)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setImportModalOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Buy More Storefront Modal */}
      <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
        <DialogHeader>
          <DialogTitle>Storefront</DialogTitle>
          <DialogDescription>Browse and acquire curated sound effect packs.</DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center text-sm text-zinc-400 space-y-2">
          <ShoppingCart className="h-10 w-10 text-amber-400 mx-auto opacity-80" />
          <p className="font-serif text-lg font-bold text-zinc-200">Arcanum Audio Store</p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Sound effect and soundscape packs will be available here soon.
          </p>
        </div>
        <DialogFooter>
          <Button variant="gold" onClick={() => setBuyModalOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Free Tracks Modal */}
      <Dialog open={freeTracksOpen} onOpenChange={setFreeTracksOpen}>
        <DialogHeader>
          <DialogTitle>Free Tracks</DialogTitle>
          <DialogDescription>Download sample packs for your game.</DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center text-sm text-zinc-400 space-y-2">
          <Download className="h-10 w-10 text-amber-400 mx-auto opacity-80" />
          <p className="font-serif text-lg font-bold text-zinc-200">Coming Soon</p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Free community audio expansions are being curated.
          </p>
        </div>
        <DialogFooter>
          <Button variant="gold" onClick={() => setFreeTracksOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
