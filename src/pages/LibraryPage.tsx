import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

import { FxCard,
  FxCardSkeleton,
  FxLibraryEmptyState,
  FxMiniPlayer,
} from '@/components/library/FxCard'
import { CreateSoundscapeCategoryDialog } from '@/components/library/CreateSoundscapeCategoryDialog'
import { FreeTracksModal } from '@/components/library/FreeTracksModal'
import { ImportFxModal } from '@/components/library/ImportFxModal'
import { StoreModal } from '@/components/library/StoreModal'
import { SoundscapeCategoryCard } from '@/components/library/SoundscapeCategoryCard'
import {
  SoundscapeTrackCard,
  SoundscapeTrackCardSkeleton,
} from '@/components/library/SoundscapeTrackCard'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCampaignData } from '@/context/CampaignDataContext'
import { filterFxTracks } from '@/lib/libraryStorage'
import { filterSoundscapeCategoriesForBrowse } from '@/lib/soundscapeStorage'
import { findSoundscapeTrackUsage } from '@/lib/soundscapeTrackTrash'
import {
  extractYoutubePlaylistId,
  extractYoutubeVideoId,
  isYoutubePlaylistUrl,
  resolveYoutubePlaylist,
  resolveYoutubeVideo,
} from '@/lib/youtubeResolve'
import { audioPreview } from '@/lib/audioPreview'
import type { SoundscapeTrack } from '@/types/library'
import { ExternalLink, ShoppingCart, Plus, Upload } from 'lucide-react'




type LibraryTab = 'fx' | 'soundscapes' | 'tracks'

function libraryTabFromQuery(value: string | null): LibraryTab {
  const normalized = value?.toLowerCase()
  if (normalized === 'soundscapes') {
    return 'soundscapes'
  }
  if (normalized === 'tracks') {
    return 'tracks'
  }
  return 'fx'
}

function tabButtonClass(selected: boolean): string {
  return selected ? 'border-b-2 border-gold px-2 pb-2 text-gold' : 'px-2 pb-2 text-muted'
}



export function LibraryPage() {

  const {
    data,
    activeFxTracks,
    activeSoundscapeTracks,
    e2e,
    importFx,
    updateFx,
    softDeleteFx,
    createSoundscapeCategory,
    softDeleteSoundscapeCategory,
    softDeleteSoundscapeTrack,
    importSoundscapeTrack,
    importYoutubeTrack,
    downloadFreeCompositions,
  } = useCampaignData()

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const trackFileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<LibraryTab>(() => libraryTabFromQuery(searchParams.get('tab')))
  const [storeOpen, setStoreOpen] = useState(false)
  const [freeTracksOpen, setFreeTracksOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [retentionNoticeVisible, setRetentionNoticeVisible] = useState(false)
  const [scSearch, setScSearch] = useState('')
  const [scDownloading, setScDownloading] = useState(false)
  const [trackSearch, setTrackSearch] = useState('')
  const [trackImportOpen, setTrackImportOpen] = useState(false)
  const [trackImportError, setTrackImportError] = useState<string | null>(null)
  const [trackYoutubeUrl, setTrackYoutubeUrl] = useState('')
  const [pendingTrackDelete, setPendingTrackDelete] = useState<SoundscapeTrack | null>(null)

  useEffect(() => {
    const queryTab = libraryTabFromQuery(searchParams.get('tab'))
    setTab(queryTab)
  }, [searchParams])

  useEffect(() => {
    return () => {
      audioPreview.stop()
    }
  }, [])

  // Stop Tracks preview when leaving the Tracks tab (LIT-06 A)
  useEffect(() => {
    if (tab !== 'tracks') {
      return
    }
    return () => {
      audioPreview.stop()
    }
  }, [tab])

  const filteredTracks = useMemo(
    () => filterFxTracks(activeFxTracks, { search, sort: 'recent' }),
    [activeFxTracks, search],
  )

  const filteredCategories = useMemo(
    () =>
      filterSoundscapeCategoriesForBrowse(data.soundscapeCategories ?? [], {
        search: scSearch,
        sort: 'recent',
      }),
    [data.soundscapeCategories, scSearch],
  )

  const filteredSoundscapeTracks = useMemo(() => {
    const query = trackSearch.trim().toLowerCase()
    if (!query) {
      return activeSoundscapeTracks
    }
    return activeSoundscapeTracks.filter((track) => track.name.toLowerCase().includes(query))
  }, [activeSoundscapeTracks, trackSearch])

  const handleFreeCompositions = async () => {
    setScDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 100))
    downloadFreeCompositions()
    setScDownloading(false)
  }




  const handleImportFx = (files: File[]) => {
    if (files.length === 0) {
      return
    }
    if (e2e.invalidAudioImport) {
      setImportError('The file could not be read as audio.')
      return
    }
    setImportError(null)
    for (const file of files) {
      importFx(file)
    }
  }

  const pendingTrackUsage = useMemo(() => {
    if (!pendingTrackDelete) {
      return []
    }
    return findSoundscapeTrackUsage(
      pendingTrackDelete.id,
      data.soundscapeCategories ?? [],
      pendingTrackDelete,
    )
  }, [pendingTrackDelete, data.soundscapeCategories])

  const handleTrashTrack = (track: SoundscapeTrack) => {
    const usage = findSoundscapeTrackUsage(
      track.id,
      data.soundscapeCategories ?? [],
      track,
    )
    if (usage.length === 0) {
      softDeleteSoundscapeTrack(track.id)
      return
    }
    setPendingTrackDelete(track)
  }

  const handleConfirmInUseDelete = () => {
    if (!pendingTrackDelete) {
      return
    }
    softDeleteSoundscapeTrack(pendingTrackDelete.id)
    setPendingTrackDelete(null)
  }

  const handleImportLocalTrack = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) {
      return
    }
    if (e2e.invalidAudioImport) {
      setTrackImportError('The file could not be read as audio.')
      return
    }
    setTrackImportError(null)
    for (const file of files) {
      importSoundscapeTrack(file)
    }
  }

  const handleImportYoutubeTrack = async () => {
    const url = trackYoutubeUrl.trim()
    if (!url) {
      return
    }

    const isPlaylist = isYoutubePlaylistUrl(url)
    if (isPlaylist) {
      if (!extractYoutubePlaylistId(url)) {
        setTrackImportError('The YouTube URL could not be imported.')
        return
      }
      try {
        const resolved = await resolveYoutubePlaylist(url)
        importYoutubeTrack(resolved.name, url, true, resolved.videos)
        setTrackYoutubeUrl('')
        setTrackImportError(null)
      } catch {
        setTrackImportError('The YouTube URL could not be imported.')
      }
      return
    }

    if (!extractYoutubeVideoId(url)) {
      setTrackImportError('The YouTube URL could not be imported.')
      return
    }

    try {
      const resolved = await resolveYoutubeVideo(url)
      importYoutubeTrack(resolved.name, url, false, undefined, resolved.youtubeId)
      setTrackYoutubeUrl('')
      setTrackImportError(null)
    } catch {
      setTrackImportError('The YouTube URL could not be imported.')
    }
  }

  return (

    <ScreenLandmark screenName="Library screen">

      <PageHeader title="Library" />



      <div role="tablist" aria-label="Library tabs" className="mb-6 flex gap-4 border-b border-white/10">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'soundscapes'}
          data-library-tab="Soundscapes"
          className={tabButtonClass(tab === 'soundscapes')}
          onClick={() => setSearchParams({ tab: 'soundscapes' })}
        >
          Soundscapes
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'fx'}
          data-library-tab="Sound Effects"
          className={tabButtonClass(tab === 'fx')}
          onClick={() => setSearchParams({ tab: 'fx' })}
        >
          Sound Effects
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'tracks'}
          data-library-tab="Tracks"
          className={tabButtonClass(tab === 'tracks')}
          onClick={() => setSearchParams({ tab: 'tracks' })}
        >
          Tracks
        </button>
      </div>



      {tab === 'soundscapes' ? (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 text-gold hover:text-gold/80"
                  data-buy-composition
                  onClick={() => navigate('/storefront')}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy Composition
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  data-free-compositions
                  disabled={scDownloading}
                  onClick={handleFreeCompositions}
                >
                  <ExternalLink className="h-4 w-4" />
                  {scDownloading ? 'Downloading…' : 'Free Compositions'}
                </Button>

                {scDownloading && (
                  <p className="w-full text-sm text-muted" data-sc-download-progress>
                    Downloading demo pack…
                  </p>
                )}
              </div>

              <Input
                aria-label="Search compositions"
                placeholder="Search compositions…"
                className="mb-6"
                value={scSearch}
                onChange={(event) => setScSearch(event.target.value)}
                data-sc-search
              />

              {e2e.soundscapeLibraryState === 'loading' ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" data-sc-library-loading>
                  <div className="h-48 rounded bg-white/5 animate-pulse" />
                  <div className="h-48 rounded bg-white/5 animate-pulse" />
                  <div className="h-48 rounded bg-white/5 animate-pulse" />
                  <div className="h-48 rounded bg-white/5 animate-pulse" />
                </div>
              ) : (data.soundscapeCategories ?? []).filter((c) => !c.deletedAt).length === 0 ? (
                <div className="space-y-6">
                  <div className="py-12 text-center text-muted" data-sc-library-empty>
                    <p className="text-lg font-serif mb-2">No compositions yet.</p>
                    <p className="text-sm mb-4">Create a new soundscape category or download free compositions to begin.</p>
                  </div>
                  <button
                    type="button"
                    data-sc-add-tile
                    onClick={() => setCreateCategoryOpen(true)}
                    className="flex w-full h-32 flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 p-6 text-gold hover:border-gold/70 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Plus className="mb-2 h-6 w-6" />
                    + Add Soundscape
                  </button>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="py-8 text-center text-muted">
                  <p className="mb-4">No compositions match your filters</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setScSearch('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" data-sc-grid>
                  {filteredCategories.map((category) => (
                    <SoundscapeCategoryCard
                      key={category.id}
                      category={category}
                      onDelete={() => softDeleteSoundscapeCategory(category.id)}
                    />
                  ))}
                  <button
                    type="button"
                    data-sc-add-tile
                    onClick={() => setCreateCategoryOpen(true)}
                    className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 p-6 text-gold hover:border-gold/70 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Plus className="mb-2 h-6 w-6" />
                    + Add Soundscape
                  </button>
                </div>
              )}
            </div>
        ) : tab === 'tracks' ? (
            <div data-tracks-tab>
              <div className="mb-4 flex flex-wrap gap-2">
                <input
                  ref={trackFileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  data-tracks-import-file
                  onChange={handleImportLocalTrack}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  data-tracks-import
                  onClick={() => {
                    setTrackImportOpen((open) => !open)
                    setTrackImportError(null)
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>

              {trackImportOpen ? (
                <div
                  className="mb-4 space-y-3 rounded-md border border-white/10 bg-white/5 p-3"
                  data-tracks-import-panel
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => trackFileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Import local file
                    </Button>
                    <p className="text-sm text-muted">or paste a YouTube video / playlist URL</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      placeholder="Paste YouTube Video or Playlist URL…"
                      value={trackYoutubeUrl}
                      onChange={(event) => setTrackYoutubeUrl(event.target.value)}
                      data-tracks-youtube-url
                      className="min-w-[16rem] flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      data-tracks-import-youtube
                      onClick={() => {
                        void handleImportYoutubeTrack()
                      }}
                    >
                      Import YouTube
                    </Button>
                  </div>
                </div>
              ) : null}

              {trackImportError ? (
                <div
                  role="alert"
                  className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
                  data-tracks-import-error
                >
                  <p>{trackImportError}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => setTrackImportError(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              ) : null}

              <Input
                aria-label="Search tracks"
                placeholder="Search tracks…"
                className="mb-6"
                value={trackSearch}
                onChange={(event) => setTrackSearch(event.target.value)}
                data-tracks-search
              />

              {e2e.soundscapeLibraryState === 'loading' ? (
                <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  data-testid="tracks-library-loading"
                  data-tracks-library-loading
                >
                  <SoundscapeTrackCardSkeleton />
                  <SoundscapeTrackCardSkeleton />
                  <SoundscapeTrackCardSkeleton />
                </div>
              ) : activeSoundscapeTracks.length === 0 ? (
                <div
                  className="py-12 text-center text-muted"
                  data-testid="tracks-library-empty"
                  data-tracks-library-empty
                >
                  <p className="mb-2 font-serif text-lg text-gold">No soundscape tracks yet</p>
                  <p className="mb-4 text-sm">
                    Soundscape tracks will appear here once you import local audio or YouTube sources.
                    Use Import above to add tracks.
                  </p>
                </div>
              ) : filteredSoundscapeTracks.length === 0 ? (
                <div className="py-8 text-center text-muted">
                  <p className="mb-4" data-tracks-no-match>
                    No tracks match your filters
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setTrackSearch('')}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  data-testid="tracks-grid"
                  data-tracks-grid
                >
                  {filteredSoundscapeTracks.map((track) => (
                    <SoundscapeTrackCard
                      key={track.id}
                      track={track}
                      onDelete={() => handleTrashTrack(track)}
                    />
                  ))}
                </div>
              )}

              <AlertDialog
                open={pendingTrackDelete !== null}
                onOpenChange={(open) => {
                  if (!open) {
                    setPendingTrackDelete(null)
                  }
                }}
              >
                <AlertDialogContent
                  aria-labelledby="track-in-use-delete-title"
                  data-track-in-use-confirm
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle id="track-in-use-delete-title">
                      Delete “{pendingTrackDelete?.name}”?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <p className="text-sm text-muted">
                    This track is used in{' '}
                    {pendingTrackUsage.map((entry) => entry.categoryName).join(' and ')}.
                    Confirming will detach it from every intensity level that references it, then move
                    it to Trash.
                  </p>
                  {pendingTrackUsage.some((entry) => entry.playlistOccupiesLevel) ? (
                    <p className="mt-2 text-sm text-amber-300" data-track-playlist-level-warning>
                      This YouTube playlist occupies an intensity level. Detaching it will leave that
                      level empty.
                    </p>
                  ) : null}
                  <AlertDialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setPendingTrackDelete(null)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-600 text-white hover:bg-red-500"
                      onClick={handleConfirmInUseDelete}
                    >
                      Confirm
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
        ) : (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  data-fx-import
                  onClick={() => setImportOpen(true)}
                >
                  Import FX
                </Button>

                <Button type="button" variant="ghost" data-buy-more onClick={() => setStoreOpen(true)}>
                  Buy More
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  data-free-tracks
                  onClick={() => setFreeTracksOpen(true)}
                >
                  Free Tracks
                </Button>
              </div>

              {importError ? (
                <div role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                  <p>{importError}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => setImportError(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              ) : null}

              <Input
                aria-label="Search effects"
                placeholder="Search effects…"
                className="mb-6"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                data-fx-search
              />

              {e2e.fxLibraryState === 'loading' ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6" data-fx-library-loading>
                  <FxCardSkeleton />
                  <FxCardSkeleton />
                  <FxCardSkeleton />
                  <FxCardSkeleton />
                </div>
              ) : activeFxTracks.length === 0 ? (
                <FxLibraryEmptyState />
              ) : filteredTracks.length === 0 ? (
                <div className="py-8 text-center text-muted">
                  <p className="mb-4" data-fx-no-match>
                    No effects match your filters
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSearch('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6" data-fx-grid>
                  {filteredTracks.map((track) => (
                    <FxCard
                      key={track.id}
                      track={track}
                      onUpdate={(input) => updateFx(track.id, input)}
                      onDelete={() => {
                        softDeleteFx(track.id)
                        setRetentionNoticeVisible(true)
                      }}
                    />
                  ))}
                </div>
              )}

              <FxMiniPlayer />

              {retentionNoticeVisible ? (
                <p className="mt-4 text-sm text-muted" data-fx-retention-notice>
                  The local copy of the audio file is retained for 7 days.
                </p>
              ) : null}
            </div>
      )}

      <StoreModal open={storeOpen} onOpenChange={setStoreOpen} />
      <FreeTracksModal open={freeTracksOpen} onOpenChange={setFreeTracksOpen} />
      <ImportFxModal open={importOpen} onOpenChange={setImportOpen} onImport={handleImportFx} />
      <CreateSoundscapeCategoryDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
        onCreate={(name) => {
          const category = createSoundscapeCategory(name)
          navigate(`/library/soundscapes/${category.id}/compose`)
        }}
      />

    </ScreenLandmark>

  )

}



export function StorefrontPage() {

  return (

    <ScreenLandmark screenName="Storefront screen" data-storefront>

      <PageHeader title="Storefront" subtitle="Purchase additional sound packs." />

      <p className="text-muted">The storefront is coming soon.</p>

      <Link to="/library" className="mt-4 inline-block text-gold hover:underline">

        Back to Library

      </Link>

    </ScreenLandmark>

  )

}


