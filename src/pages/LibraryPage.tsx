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

import type { FxIntensity, FxType } from '@/types/library'

import { audioPreview } from '@/lib/audioPreview'



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



export function LibraryPage() {

  const {

    activeFxTracks,

    e2e,

    importFx,

    updateFx,

    softDeleteFx,

    downloadFreeTracks,

  } = useCampaignData()

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState<LibraryTab>(() => libraryTabFromQuery(searchParams.get('tab')))

  const [search, setSearch] = useState('')

  const [type, setType] = useState<FxType | 'ALL'>('ALL')

  const [maxIntensity, setMaxIntensity] = useState<FxIntensity>('III')

  const [sort, setSort] = useState<'recent' | 'name' | 'duration'>('recent')

  const [downloading, setDownloading] = useState(false)

  const [importError, setImportError] = useState<string | null>(null)

  const [retentionNoticeVisible, setRetentionNoticeVisible] = useState(false)



  useEffect(() => {

    return () => {

      audioPreview.stop()

    }

  }, [])



  const filteredTracks = useMemo(

    () => filterFxTracks(activeFxTracks, { search, type, maxIntensity, sort }),

    [activeFxTracks, search, type, maxIntensity, sort],

  )



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

          onClick={() => setTab('fx')}

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

          onClick={() => setTab('soundscapes')}

        >

          Soundscapes

        </button>

      </div>



      {tab === 'soundscapes' ? (

        <p className="text-muted" data-soundscapes-tab-stub>

          Soundscape library coming in a future update.

        </p>

      ) : (

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">

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

        </div>

      )}

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


