import { useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'

import {

  AddSoundscapeCard,

  SoundscapeCategoryCard,

  SoundscapeGridSkeleton,

  SoundscapesEmptyState,

} from '@/components/library/SoundscapeCategoryCard'

import {

  FxEmptyState,

  FxGridSkeleton,

  FxTrackCard,

} from '@/components/library/FxTrackCard'

import { FxMiniPlayer } from '@/components/library/FxMiniPlayer'

import { CreateCategoryDialog } from '@/components/library/CreateCategoryDialog'

import { StorefrontDialog } from '@/components/shared/StorefrontDialog'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useFxTracks } from '@/hooks/useFxTracks'

import { useSoundscapeCategories } from '@/hooks/useSoundscapeCategories'
import { LibraryFilterSidebar, type LibrarySortOrder } from '@/components/library/LibraryFilterSidebar'
import { filterCategories } from '@/lib/storage/soundscapeCategoryRepository'

import { startPreview, stopPreview } from '@/lib/audio/preview'

import { filterFxTracks } from '@/lib/storage/fxTrackRepository'

import { getCategoryComposerPath } from '@/lib/storage/db'

import {

  createCategory,

  restoreCategory,

  seedDemoCategories,

  softDeleteCategory,

} from '@/lib/storage/soundscapeCategoryRepository'

import {

  createFxTrack,

  seedDemoFxTracks,

  softDeleteFxTrack,

  updateFxTrack,

} from '@/lib/storage/fxTrackRepository'

import type { FxTrack, SoundscapeCategoryWithCounts } from '@/lib/storage/types'



export function LibraryPage() {

  const navigate = useNavigate()

  const { categories, isLoading, isError } = useSoundscapeCategories()

  const { tracks: fxTracks, isLoading: fxLoading, isError: fxError } = useFxTracks()

  const [activeTab, setActiveTab] = useState('soundscapes')

  const [search, setSearch] = useState('')

  const [fxSearch, setFxSearch] = useState('')
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all')
  const [fxTypeFilter, setFxTypeFilter] = useState('all')
  const [maxFxIntensity, setMaxFxIntensity] = useState<1 | 2 | 3>(3)
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>('recently-added')

  const [createOpen, setCreateOpen] = useState(false)

  const [previewingCategoryId, setPreviewingCategoryId] = useState<string | null>(null)

  const [previewingFxId, setPreviewingFxId] = useState<string | null>(null)

  const [fxPlaying, setFxPlaying] = useState(false)

  const [downloading, setDownloading] = useState(false)

  const [fxDownloading, setFxDownloading] = useState(false)

  const [storefrontOpen, setStorefrontOpen] = useState(false)

  const [importError, setImportError] = useState<string | null>(null)

  const fxImportRef = useRef<HTMLInputElement>(null)



  const filteredCategories = filterCategories(categories, {
    search,
    categoryType: categoryTypeFilter,
    sortOrder,
  })

  const filteredFxTracks = filterFxTracks(fxTracks, {
    search: fxSearch,
    fxType: fxTypeFilter === 'all' ? 'all' : (fxTypeFilter as import('@/lib/storage/types').FxType),
    maxBaseIntensity: maxFxIntensity,
    sortOrder,
  })

  const categoryTypes = [
    ...new Set(categories.map((category) => category.categoryType).filter(Boolean)),
  ] as string[]

  const fxTypes = [...new Set(fxTracks.map((track) => track.fxType))]

  const clearFilters = () => {
    if (activeTab === 'soundscapes') {
      setSearch('')
      setCategoryTypeFilter('all')
      return
    }
    setFxSearch('')
    setFxTypeFilter('all')
    setMaxFxIntensity(3)
  }

  const previewingFx = fxTracks.find((track) => track.id === previewingFxId)



  const handleCreateCategory = async (name: string) => {

    const category = await createCategory(name)

    navigate(getCategoryComposerPath(category.id))

  }



  const handleDelete = async (category: SoundscapeCategoryWithCounts) => {

    await softDeleteCategory(category.id)

    toast(`${category.name} moved to Trash`, {

      action: {

        label: 'Undo',

        onClick: () => {

          void restoreCategory(category.id)

        },

      },

    })

  }



  const handleCategoryPreview = (category: SoundscapeCategoryWithCounts) => {

    setPreviewingCategoryId(category.id)

    startPreview()

  }



  const handleStopCategoryPreview = () => {

    setPreviewingCategoryId(null)

    stopPreview()

  }



  const handleFxPreview = (track: FxTrack) => {

    if (previewingFxId === track.id && fxPlaying) {

      setFxPlaying(false)

      stopPreview()

      return

    }

    setPreviewingFxId(track.id)

    setFxPlaying(true)

    startPreview()

  }



  const handleFxStop = () => {

    setFxPlaying(false)

    stopPreview()

  }



  const handleFxPlay = () => {

    setFxPlaying(true)

    startPreview()

  }



  const handleTabChange = (value: string) => {

    if (value !== 'effects') {

      setPreviewingFxId(null)

      setFxPlaying(false)

      stopPreview()

    }

    setActiveTab(value)

  }



  const handleFreeCompositions = async () => {

    setDownloading(true)

    try {

      await seedDemoCategories()

    } finally {

      setDownloading(false)

    }

  }



  const handleFreeTracks = async () => {

    setFxDownloading(true)

    try {

      await seedDemoFxTracks()

    } finally {

      setFxDownloading(false)

    }

  }



  const handleImportFx = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('audio/')) {

      setImportError('The file could not be read as audio.')

      return

    }

    setImportError(null)
    await createFxTrack({
      name: file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
    })
  }



  const handleDeleteFx = async (track: FxTrack) => {

    await softDeleteFxTrack(track.id)

    if (previewingFxId === track.id) {

      setPreviewingFxId(null)

      setFxPlaying(false)

      stopPreview()

    }

    toast(`${track.name} moved to Trash`)

  }



  return (

    <section aria-labelledby="library-heading">

      <h1 className="font-serif text-2xl text-gold" id="library-heading">

        Library

      </h1>



      <Tabs className="mt-6" onValueChange={handleTabChange} value={activeTab}>

        <TabsList>

          <TabsTrigger value="soundscapes">Soundscapes</TabsTrigger>

          <TabsTrigger value="effects">Sound Effects</TabsTrigger>

        </TabsList>



        <TabsContent value="soundscapes">

          <p className="text-zinc-400">Browse and manage your soundscape categories.</p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <LibraryFilterSidebar
              categoryType={categoryTypeFilter}
              categoryTypes={categoryTypes}
              mode="soundscapes"
              onCategoryTypeChange={setCategoryTypeFilter}
              onSortOrderChange={setSortOrder}
              sortOrder={sortOrder}
            />

            <div>



          <div className="mt-4 flex flex-wrap gap-2">

            <Button onClick={() => setStorefrontOpen(true)} type="button">

              Buy Composition

            </Button>

            <Button

              disabled={downloading}

              onClick={() => void handleFreeCompositions()}

              type="button"

              variant="outline"

            >

              Free Compositions

            </Button>

          </div>



          {downloading ? (

            <p className="mt-4 text-sm text-gold" data-testid="download-progress">

              Downloading demo pack…

            </p>

          ) : null}



          <div className="mt-4">

            <Input

              aria-label="Search compositions"

              onChange={(event) => setSearch(event.target.value)}

              placeholder="Search compositions…"

              value={search}

            />

          </div>



          {isError ? (

            <p className="mt-6 text-red-400" role="alert">

              Unable to load soundscape categories.

            </p>

          ) : null}



          {isLoading ? <SoundscapeGridSkeleton /> : null}



          {!isLoading && !isError && categories.length === 0 ? <SoundscapesEmptyState /> : null}

          {!isLoading && !isError && categories.length > 0 && filteredCategories.length === 0 ? (
            <div className="mt-6 text-center" data-testid="soundscapes-filter-empty">
              <p className="text-zinc-400">No compositions match your filters</p>
              <Button className="mt-3" onClick={clearFilters} type="button" variant="outline">
                Clear filters
              </Button>
            </div>
          ) : null}

          {!isLoading && !isError && filteredCategories.length > 0 ? (

            <div

              className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"

              data-testid="soundscape-categories-grid"

            >

              {filteredCategories.map((category) => (

                <SoundscapeCategoryCard

                  category={category}

                  isPreviewing={previewingCategoryId === category.id}

                  key={category.id}

                  onDelete={(target) => void handleDelete(target)}

                  onPreview={handleCategoryPreview}

                  onStopPreview={handleStopCategoryPreview}

                />

              ))}

              <AddSoundscapeCard onClick={() => setCreateOpen(true)} />

            </div>

          ) : null}

            </div>
          </div>

        </TabsContent>

        <TabsContent value="effects">
          <p className="text-zinc-400">Browse, import, and manage your sound effects.</p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <LibraryFilterSidebar
              fxType={fxTypeFilter}
              fxTypes={fxTypes}
              maxBaseIntensity={maxFxIntensity}
              mode="effects"
              onFxTypeChange={setFxTypeFilter}
              onMaxBaseIntensityChange={(value) => setMaxFxIntensity(value as 1 | 2 | 3)}
              onSortOrderChange={setSortOrder}
              sortOrder={sortOrder}
            />

            <div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fxImportRef.current?.click()} type="button" variant="outline">

              Import FX

            </Button>

            <input

              accept="audio/*"

              className="sr-only"

              data-testid="fx-import-input"

              onChange={(event) => void handleImportFx(event)}

              ref={fxImportRef}

              type="file"

            />

            <Button onClick={() => setStorefrontOpen(true)} type="button">

              Buy More

            </Button>

            <Button

              disabled={fxDownloading}

              onClick={() => void handleFreeTracks()}

              type="button"

              variant="outline"

            >

              Free Tracks

            </Button>

          </div>



          {fxDownloading ? (

            <p className="mt-4 text-sm text-gold" data-testid="fx-download-progress">

              Downloading demo FX pack…

            </p>

          ) : null}



          {importError ? (

            <p className="mt-4 text-red-400" role="alert">

              {importError}

              <button className="ml-2 underline" onClick={() => setImportError(null)} type="button">

                Dismiss

              </button>

            </p>

          ) : null}



          <div className="mt-4">

            <Input

              aria-label="Search effects"

              onChange={(event) => setFxSearch(event.target.value)}

              placeholder="Search effects…"

              value={fxSearch}

            />

          </div>



          {fxError ? (

            <p className="mt-6 text-red-400" role="alert">

              Unable to load FX tracks.

            </p>

          ) : null}



          {fxLoading ? <FxGridSkeleton /> : null}



          {!fxLoading && !fxError && fxTracks.length === 0 ? <FxEmptyState /> : null}

          {!fxLoading && !fxError && fxTracks.length > 0 && filteredFxTracks.length === 0 ? (
            <div className="mt-6 text-center" data-testid="fx-filter-empty">
              <p className="text-zinc-400">No effects match your filters</p>
              <Button className="mt-3" onClick={clearFilters} type="button" variant="outline">
                Clear filters
              </Button>
            </div>
          ) : null}

          {!fxLoading && !fxError && filteredFxTracks.length > 0 ? (

            <div

              className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"

              data-testid="fx-tracks-grid"

            >

              {filteredFxTracks.map((track) => (

                <FxTrackCard

                  isPreviewing={previewingFxId === track.id && fxPlaying}

                  key={track.id}

                  onDelete={handleDeleteFx}

                  onPreview={handleFxPreview}

                  onSave={updateFxTrack}

                  onStopPreview={handleFxStop}

                  track={track}

                />

              ))}

            </div>

          ) : null}



          {activeTab === 'effects' && previewingFx ? (
            <FxMiniPlayer
              isPlaying={fxPlaying}
              onClose={() => {
                setPreviewingFxId(null)
                setFxPlaying(false)
                stopPreview()
              }}
              onPause={handleFxStop}
              onPlay={handleFxPlay}
              trackName={previewingFx.name}
            />
          ) : null}

            </div>
          </div>
        </TabsContent>

      </Tabs>



      <CreateCategoryDialog

        onOpenChange={setCreateOpen}

        onSubmit={handleCreateCategory}

        open={createOpen}

      />

      <StorefrontDialog onOpenChange={setStorefrontOpen} open={storefrontOpen} />

    </section>

  )

}


