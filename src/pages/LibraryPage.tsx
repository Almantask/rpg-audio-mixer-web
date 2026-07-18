import { useEffect, useMemo, useState } from 'react'

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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCampaignData } from '@/context/CampaignDataContext'
import { filterFxTracks } from '@/lib/libraryStorage'
import { filterSoundscapeCategoriesForBrowse } from '@/lib/soundscapeStorage'
import { audioPreview } from '@/lib/audioPreview'
import { ExternalLink, ShoppingCart, Plus } from 'lucide-react'




type LibraryTab = 'fx' | 'soundscapes'



function libraryTabFromQuery(value: string | null): LibraryTab {

  if (value?.toLowerCase() === 'soundscapes') {

    return 'soundscapes'

  }

  return 'fx'

}



const SC_TYPES = ['ALL', 'Environmental', 'Creature']

export function LibraryPage() {

  const {
    data,
    activeFxTracks,
    e2e,
    importFx,
    updateFx,
    softDeleteFx,
    createSoundscapeCategory,
    softDeleteSoundscapeCategory,
    downloadFreeCompositions,
  } = useCampaignData()


  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()


  const [tab, setTab] = useState<LibraryTab>(() => libraryTabFromQuery(searchParams.get('tab')))

  const [storeOpen, setStoreOpen] = useState(false)

  const [freeTracksOpen, setFreeTracksOpen] = useState(false)

  const [importOpen, setImportOpen] = useState(false)

  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)

  const [search, setSearch] = useState('')

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

    () => filterFxTracks(activeFxTracks, { search, sort: 'recent' }),

    [activeFxTracks, search],

  )

  const filteredCategories = useMemo(
    () =>
      filterSoundscapeCategoriesForBrowse(data.soundscapeCategories ?? [], {
        search: scSearch,
        type: scType,
        sort: scSort,
      }),
    [data.soundscapeCategories, scSearch, scType, scSort],
  )

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



  return (

    <ScreenLandmark screenName="Library screen">

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



      <div
        className={
          tab === 'soundscapes' ? 'grid gap-6 lg:grid-cols-[220px_1fr]' : undefined
        }
      >
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
                    onClick={() => setCreateCategoryOpen(true)}
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
            <div>
              <p className="mb-4 text-muted">Browse, import, and manage your sound effects.</p>

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
          </>
        )}
      </div>

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


