import { useEffect, useMemo, useState } from 'react'

import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

import {

  FxCard,

  FxCardSkeleton,

  FxLibraryEmptyState,

  FxMiniPlayer,

  ImportFxButton,

} from '@/components/library/FxCard'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

import { useCampaignData } from '@/context/CampaignDataContext'

import { filterFxTracks } from '@/lib/libraryStorage'

import type { FxIntensity, FxType, SoundscapeCategory } from '@/types/library'

import { audioPreview } from '@/lib/audioPreview'

import { SwipeToDelete } from '@/components/shared/SwipeToDelete'

import { Pause, Play, Pencil, Trash2, ExternalLink, ShoppingCart, Plus } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'




type LibraryTab = 'fx' | 'soundscapes'



function libraryTabFromQuery(value: string | null): LibraryTab {

  if (value?.toLowerCase() === 'soundscapes') {

    return 'soundscapes'

  }

  return 'fx'

}



const FX_TYPES: Array<FxType | 'ALL'> = [

  'ALL',

  'IMPACT',

  'COMBAT',

  'CREATURE',

  'UI',

  'MAGIC',

  'AMBIENT',

  'OTHER',

]



const INTENSITIES: FxIntensity[] = ['I', 'II', 'III']

const SC_TYPES = ['ALL', 'WEATHER', 'INTERIOR', 'DUNGEON', 'NATURE', 'TOWN', 'COMBAT', 'OTHER']

interface SoundscapeCategoryCardProps {
  category: SoundscapeCategory
  onDelete: () => void
}

function SoundscapeCategoryCard({ category, onDelete }: SoundscapeCategoryCardProps) {
  const navigate = useNavigate()
  const { data } = useCampaignData()
  const [playing, setPlaying] = useState(false)

  const firstTrackId = category.levels?.I?.[0] || category.levels?.II?.[0] || category.levels?.III?.[0]

  useEffect(() => {
    return audioPreview.subscribe((trackId, _trackName, isPlaying) => {
      setPlaying(trackId === firstTrackId && isPlaying)
    })
  }, [firstTrackId])

  const handlePreview = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!firstTrackId) return
    const track = data.soundscapeTracks?.find((t) => t.id === firstTrackId)
    if (!track) return

    if (playing) {
      audioPreview.pause()
    } else {
      audioPreview.play(firstTrackId, track.audioUrl, track.name)
    }
  }

  const handleCardClick = () => {
    navigate(`/library/soundscapes/${category.id}/compose`)
  }

  const levels = category.levels ?? { I: [], II: [], III: [] }
  const countsText = `I: ${levels.I?.length ?? 0} · II: ${levels.II?.length ?? 0} · III: ${levels.III?.length ?? 0}`

  return (
    <SwipeToDelete onSwipeDelete={onDelete}>
      <Card
        data-sc-card={category.name}
        className={`group relative overflow-hidden transition-all duration-300 bg-charcoal border border-white/10 hover:border-gold/50 cursor-pointer ${
          playing ? 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]' : ''
        }`}
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* Thumbnail area */}
          <div className="relative aspect-video w-full bg-black/40 flex items-center justify-center overflow-hidden" data-sc-card-thumb={category.name}>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent z-10" />
            <div className="text-muted/20 text-4xl font-serif select-none group-hover:scale-105 transition-transform duration-500">
              {category.name.substring(0, 2).toUpperCase()}
            </div>

            {/* Preview state overlay */}
            <div
              data-sc-card-preview-state={category.name}
              data-state={playing ? 'playing' : 'idle'}
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100 data-[state=playing]:opacity-100"
            >
              {playing && (
                <span className="absolute top-2 left-2 bg-gold/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  ● PLAYING
                </span>
              )}
              {firstTrackId && (
                <button
                  type="button"
                  data-sc-preview={category.name}
                  onClick={handlePreview}
                  className="p-3 rounded-full bg-gold text-black hover:scale-110 transition-transform cursor-pointer"
                  aria-label={playing ? `Pause ${category.name}` : `Play ${category.name}`}
                >
                  {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </button>
              )}
            </div>
          </div>

          {/* Info area */}
          <div className="p-4" data-sc-card-body={category.name}>
            <h3 data-sc-card-title={category.name} className="text-lg font-serif font-bold text-white group-hover:text-gold transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-muted mt-1" data-sc-card-meta>
              {countsText}
            </p>
            
            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                data-sc-edit={category.name}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/library/soundscapes/${category.id}/compose`)
                }}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted hover:text-white"
                aria-label="Edit Composition"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                data-sc-delete={category.name}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                aria-label="Delete Composition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SwipeToDelete>
  )
}

export function LibraryPage() {

  const {
    data,
    activeFxTracks,
    e2e,
    importFx,
    updateFx,
    softDeleteFx,
    downloadFreeTracks,
    createSoundscapeCategory,
    softDeleteSoundscapeCategory,
    downloadFreeCompositions,
  } = useCampaignData()


  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()


  const [tab, setTab] = useState<LibraryTab>(() => libraryTabFromQuery(searchParams.get('tab')))

  const [search, setSearch] = useState('')

  const [type, setType] = useState<FxType | 'ALL'>('ALL')

  const [maxIntensity, setMaxIntensity] = useState<FxIntensity>('III')

  const [sort, setSort] = useState<'recent' | 'name' | 'duration'>('recent')

  const [downloading, setDownloading] = useState(false)

  const [importError, setImportError] = useState<string | null>(null)

  const [retentionNoticeVisible, setRetentionNoticeVisible] = useState(false)

  const [scSearch, setScSearch] = useState('')

  const [scType, setScType] = useState<string>('ALL')

  const [scSort, setScSort] = useState<'recent' | 'name'>('recent')

  const [scDownloading, setScDownloading] = useState(false)




  useEffect(() => {
    const queryTab = libraryTabFromQuery(searchParams.get('tab'))
    setTab(queryTab)
  }, [searchParams])

  useEffect(() => {

    return () => {

      audioPreview.stop()

    }

  }, [])



  const filteredTracks = useMemo(

    () => filterFxTracks(activeFxTracks, { search, type, maxIntensity, sort }),

    [activeFxTracks, search, type, maxIntensity, sort],

  )

  const filteredCategories = useMemo(() => {
    let list = (data.soundscapeCategories ?? []).filter((c) => !c.deletedAt)

    if (scSearch.trim()) {
      const q = scSearch.trim().toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }

    if (scType !== 'ALL') {
      list = list.filter((c) => c.type === scType)
    }

    if (scSort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [data.soundscapeCategories, scSearch, scType, scSort])

  const handleFreeCompositions = async () => {
    setScDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 100))
    downloadFreeCompositions()
    setScDownloading(false)
  }




  const handleFreeTracks = async () => {
    setDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 50))
    downloadFreeTracks()
    setDownloading(false)
  }

  const handleImportFx = (file: File) => {
    if (e2e.invalidAudioImport) {
      setImportError('The file could not be read as audio.')
      return
    }
    setImportError(null)
    importFx(file)
  }



  return (

    <ScreenLandmark screenName="Library screen" className="max-w-6xl">

      <PageHeader title="Library" subtitle="Browse soundscapes and sound effects." />



      <div role="tablist" aria-label="Library tabs" className="mb-6 flex gap-4 border-b border-white/10">

        <button

          type="button"

          role="tab"

          aria-selected={tab === 'fx'}

          data-library-tab="Sound Effects"

          className={tab === 'fx' ? 'border-b-2 border-gold px-2 pb-2 text-gold' : 'px-2 pb-2 text-muted'}

          onClick={() => setSearchParams({ tab: 'fx' })}

        >

          Sound Effects

        </button>

        <button

          type="button"

          role="tab"

          aria-selected={tab === 'soundscapes'}

          data-library-tab="Soundscapes"

          className={

            tab === 'soundscapes'

              ? 'border-b-2 border-gold px-2 pb-2 text-gold'

              : 'px-2 pb-2 text-muted'

          }

          onClick={() => setSearchParams({ tab: 'soundscapes' })}

        >

          Soundscapes

        </button>

      </div>



      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {tab === 'soundscapes' ? (
          <>
            <aside className="space-y-3" data-sc-sidebar-filters>
              <div>
                <Label htmlFor="library-sc-type">Category Type</Label>
                <select
                  id="library-sc-type"
                  className="h-10 w-full rounded-md border border-white/10 bg-charcoal px-3 text-sm"
                  value={scType}
                  onChange={(event) => setScType(event.target.value)}
                >
                  {SC_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option === 'ALL' ? 'All Types' : option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="library-sc-sort">Sort Order</Label>
                <select
                  id="library-sc-sort"
                  className="h-10 w-full rounded-md border border-white/10 bg-charcoal px-3 text-sm"
                  value={scSort}
                  onChange={(event) => setScSort(event.target.value as 'recent' | 'name')}
                >
                  <option value="recent">Recently Added</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </aside>

            <div>
              <p className="mb-4 text-muted">Browse and manage your soundscape categories.</p>

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
                    onClick={() => {
                      const name = window.prompt("Enter category name:")
                      if (name?.trim()) {
                        const category = createSoundscapeCategory(name.trim())
                        navigate(`/library/soundscapes/${category.id}/compose`)
                      }
                    }}
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
                      setScType('ALL')
                      setScSort('recent')
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
                    onClick={() => {
                      const name = window.prompt("Enter category name:")
                      if (name?.trim()) {
                        const category = createSoundscapeCategory(name.trim())
                        navigate(`/library/soundscapes/${category.id}/compose`)
                      }
                    }}
                    className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 p-6 text-gold hover:border-gold/70 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Plus className="mb-2 h-6 w-6" />
                    + Add Soundscape
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <aside className="space-y-3" data-fx-sidebar-filters>
              <div>
                <Label htmlFor="library-fx-type">FX Types</Label>
                <select
                  id="library-fx-type"
                  className="h-10 w-full rounded-md border border-white/10 bg-charcoal px-3 text-sm"
                  value={type}
                  onChange={(event) => setType(event.target.value as FxType | 'ALL')}
                >
                  {FX_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option === 'ALL' ? 'All Types' : option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="library-fx-intensity">Base Intensity</Label>
                <select
                  id="library-fx-intensity"
                  className="h-10 w-full rounded-md border border-white/10 bg-charcoal px-3 text-sm"
                  value={maxIntensity}
                  onChange={(event) => setMaxIntensity(event.target.value as FxIntensity)}
                >
                  {INTENSITIES.map((option) => (
                    <option key={option} value={option}>
                      Up to {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="library-fx-sort">Sort Order</Label>
                <select
                  id="library-fx-sort"
                  className="h-10 w-full rounded-md border border-white/10 bg-charcoal px-3 text-sm"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as 'recent' | 'name' | 'duration')
                  }
                >
                  <option value="recent">Recently Added</option>
                  <option value="name">Name</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </aside>

            <div>
              <p className="mb-4 text-muted">Browse, import, and manage your sound effects.</p>

              <div className="mb-4 flex flex-wrap gap-2">
                <ImportFxButton onImport={handleImportFx} />

                <Button type="button" variant="ghost" data-buy-more onClick={() => navigate('/storefront')}>
                  Buy More
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  data-free-tracks
                  disabled={downloading}
                  onClick={handleFreeTracks}
                >
                  {downloading ? 'Downloading…' : 'Free Tracks'}
                </Button>
                {downloading ? (
                  <p className="w-full text-sm text-muted" data-fx-download-progress>
                    Downloading demo FX pack…
                  </p>
                ) : null}
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
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" data-fx-library-loading>
                  <FxCardSkeleton />
                  <FxCardSkeleton />
                  <FxCardSkeleton />
                  <FxCardSkeleton />
                </div>
              ) : activeFxTracks.length === 0 ? (
                <FxLibraryEmptyState />
              ) : filteredTracks.length === 0 ? (
                <p className="py-8 text-center text-muted" data-fx-no-match>
                  No effects match your filters
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" data-fx-grid>
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
          </>
        )}
      </div>


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


