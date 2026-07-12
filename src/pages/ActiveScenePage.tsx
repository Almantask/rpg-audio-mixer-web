import { useMemo, useState } from 'react'

import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

import { SoundboardTab } from '@/components/active-scene/SoundboardTab'

import { SoundscapesTab } from '@/components/active-scene/SoundscapesTab'

import { FxPickerModal } from '@/components/active-scene/FxPickerModal'

import { useToast } from '@/components/shared/ToastProvider'

import { useCampaignData } from '@/context/CampaignDataContext'

import { audioPreview } from '@/lib/audioPreview'

import { cn } from '@/lib/utils'



type ActiveSceneTab = 'soundscapes' | 'soundboard'



interface SessionNavigationState {

  campaignId?: string

  sessionId?: string

}



function tabFromQueryParam(value: string | null): ActiveSceneTab {

  if (value?.toLowerCase() === 'soundboard') {

    return 'soundboard'

  }

  return 'soundscapes'

}



export function ActiveScenePage() {

  const { sceneId = '' } = useParams()

  const location = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()

  const [tab, setTab] = useState<ActiveSceneTab>(() => tabFromQueryParam(searchParams.get('tab')))

  const setActiveTab = (next: ActiveSceneTab) => {
    setTab(next)
    setSearchParams({ tab: next }, { replace: true })
  }

  const [pickerOpen, setPickerOpen] = useState(false)

  const sessionState = (location.state as SessionNavigationState | null) ?? {}

  const {

    data,

    e2e,

    getScene,

    getCampaign,

    getSoundboardEntries,

    getFxTrack,

    addFxToSoundboard,

    removeSoundboardEntry,

    removeSoundscapeSlot,

    createSoundscapeSlot,

  } = useCampaignData()

  const { showToast } = useToast()

  const scene = getScene(sceneId)

  const sceneName = scene?.name ?? sceneId

  const campaign = sessionState.campaignId ? getCampaign(sessionState.campaignId) : undefined

  const session = sessionState.sessionId

    ? data.sessions.find((item) => item.id === sessionState.sessionId)

    : undefined



  const soundboardEntries = useMemo(() => {

    return getSoundboardEntries(sceneId)

      .map((entry) => {

        const track = getFxTrack(entry.fxTrackId)

        return track ? { ...entry, track } : null

      })

      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  }, [sceneId, getSoundboardEntries, getFxTrack])



  const soundscapeSlots = useMemo(() => {

    return data.sceneSoundscapeSlots

      .filter((slot) => slot.sceneId === sceneId)

      .map((slot) => ({

        ...slot,

        category: data.soundscapeCategories.find((category) => category.id === slot.categoryId),

      }))

      .sort((a, b) => a.order - b.order)

  }, [data.sceneSoundscapeSlots, data.soundscapeCategories, sceneId])



  const excludedTrackIds = soundboardEntries.map((entry) => entry.fxTrackId)



  const handleAddSelected = (trackIds: string[]) => {

    addFxToSoundboard(sceneId, trackIds)

    const count = trackIds.length

    showToast(`${count} effect${count === 1 ? '' : 's'} added`)

  }



  const handleClosePicker = () => {

    audioPreview.stop()

    setPickerOpen(false)

  }



  return (

    <ScreenLandmark screenName="Active Scene screen" data-scene-name={sceneName}>

      {sessionState.sessionId ? (

        <p className="mb-2 text-xs uppercase tracking-widest text-gold" data-active-scene-badge>

          Active Scene

        </p>

      ) : null}



      {sessionState.campaignId ? (

        <nav className="mb-2 text-xs uppercase tracking-widest text-muted" data-active-scene-breadcrumb>

          <Link to={`/campaigns/${sessionState.campaignId}/sessions`}>

            Campaign &gt; {(campaign?.name ?? sessionState.campaignId).toUpperCase()}

          </Link>

          {session ? ` > Session ${session.number}` : null}

        </nav>

      ) : (

        <p className="mb-2 text-xs uppercase tracking-widest text-muted">Scenes</p>

      )}



      <PageHeader title={sceneName} subtitle="Soundscapes and soundboard controls." />



      {scene?.description ? (

        <p className="mb-6 text-muted" data-scene-description>

          {scene.description}

        </p>

      ) : null}



      <div role="tablist" aria-label="Active scene tabs" className="mb-6 flex gap-6 border-b border-white/10">

        <button

          type="button"

          role="tab"

          aria-selected={tab === 'soundscapes'}

          data-active-scene-tab="Soundscapes"

          data-active={tab === 'soundscapes' ? 'true' : undefined}

          className={cn(

            'px-2 pb-2 uppercase tracking-wide',

            tab === 'soundscapes' ? 'border-b-2 border-gold text-gold' : 'text-muted',

          )}

          onClick={() => setActiveTab('soundscapes')}

        >

          Soundscapes

        </button>

        <button

          type="button"

          role="tab"

          aria-selected={tab === 'soundboard'}

          data-active-scene-tab="Soundboard"

          data-active={tab === 'soundboard' ? 'true' : undefined}

          className={cn(

            'px-2 pb-2 uppercase tracking-wide',

            tab === 'soundboard' ? 'border-b-2 border-gold text-gold' : 'text-muted',

          )}

          onClick={() => setActiveTab('soundboard')}

        >

          Soundboard

        </button>

      </div>



      {tab === 'soundscapes' ? (

        <SoundscapesTab

          slots={soundscapeSlots}

          onRemoveSlot={removeSoundscapeSlot}

          onAddSoundscape={() => {

            const weatherCategory =

              data.soundscapeCategories.find((category) => category.name === 'Weather') ??

              data.soundscapeCategories[0]

            if (weatherCategory) {

              createSoundscapeSlot(sceneId, weatherCategory.id)

            }

          }}

        />

      ) : (

        <SoundboardTab

          entries={soundboardEntries}

          onRemove={removeSoundboardEntry}

          onAddSound={() => setPickerOpen(true)}

        />

      )}



      <FxPickerModal

        open={pickerOpen}

        onOpenChange={(open) => {

          if (!open) {

            handleClosePicker()

          } else {

            setPickerOpen(true)

          }

        }}

        tracks={data.fxTracks}

        excludedTrackIds={excludedTrackIds}

        loading={e2e.fxLibraryState === 'loading'}

        onAddSelected={handleAddSelected}

      />

    </ScreenLandmark>

  )

}

