import { useCallback, useMemo, useState, useEffect } from 'react'

import { Link, useLocation, useParams, useSearchParams, useBlocker } from 'react-router-dom'


import { Lock } from 'lucide-react'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

import { SoundboardTab } from '@/components/active-scene/SoundboardTab'

import { SoundscapesTab } from '@/components/active-scene/SoundscapesTab'

import { FxPickerModal } from '@/components/active-scene/FxPickerModal'

import { SoundscapePickerModal } from '@/components/active-scene/SoundscapePickerModal'

import { useToast } from '@/components/shared/ToastProvider'

import { useCampaignData } from '@/context/CampaignDataContext'

import { SceneAudioProvider, useSceneAudio } from '@/context/SceneAudioContext'

import { useSoundboardHotkeys } from '@/hooks/useSoundboardHotkeys'

import { audioPreview } from '@/lib/audioPreview'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

import type { FxTrack } from '@/types/library'

import type { SceneSoundboardEntry } from '@/types/scene'



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

  return (

    <SceneAudioProvider sceneId={sceneId}>

      <ActiveScenePageContent />

    </SceneAudioProvider>

  )

}



function ActiveScenePageContent() {

  const { sceneId = '' } = useParams()

  const location = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()

  const [tab, setTab] = useState<ActiveSceneTab>(() => tabFromQueryParam(searchParams.get('tab')))

  const setActiveTab = (next: ActiveSceneTab) => {
    setTab(next)
    setSearchParams({ tab: next }, { replace: true })
  }

  const [pickerOpen, setPickerOpen] = useState(false)

  const [soundscapePickerOpen, setSoundscapePickerOpen] = useState(false)

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

    addSoundscapesToScene,
    setE2EControls,
  } = useCampaignData()

  const [sessionLocked, setSessionLockedState] = useState(() => {

    if (e2e.sessionLocked !== undefined) {

      return e2e.sessionLocked

    }

    const stored = localStorage.getItem('arcanum-session-locked')

    return stored === 'true'

  })



  const setSessionLocked = (locked: boolean | ((curr: boolean) => boolean)) => {

    setSessionLockedState((current) => {

      const next = typeof locked === 'function' ? locked(current) : locked

      localStorage.setItem('arcanum-session-locked', String(next))

      setE2EControls({ sessionLocked: next })

      return next

    })

  }



  useBlocker(() => {

    return sessionLocked

  })

  useEffect(() => {
    if (e2e.sessionLocked !== undefined) {
      setSessionLockedState(e2e.sessionLocked)
    }
  }, [e2e.sessionLocked])


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

  const { triggerSoundboard } = useSceneAudio()

  const playSoundboardEntry = useCallback(
    (entry: SceneSoundboardEntry & { track: FxTrack }) => {
      void triggerSoundboard(entry)
    },
    [triggerSoundboard],
  )

  useSoundboardHotkeys(soundboardEntries, playSoundboardEntry, !pickerOpen && !soundscapePickerOpen)



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

  const excludedCategoryIds = soundscapeSlots.map((slot) => slot.categoryId)



  const handleAddSelectedFx = (trackIds: string[]) => {

    addFxToSoundboard(sceneId, trackIds)

    const count = trackIds.length

    showToast(`${count} effect${count === 1 ? '' : 's'} added`)

  }



  const handleAddSelectedSoundscapes = (categoryIds: string[]) => {

    addSoundscapesToScene(sceneId, categoryIds)

    const count = categoryIds.length

    showToast(`${count} categor${count === 1 ? 'y' : 'ies'} added`)

  }



  const handleCloseFxPicker = () => {

    audioPreview.stop()

    setPickerOpen(false)

  }



  const handleCloseSoundscapePicker = () => {

    audioPreview.stop()

    setSoundscapePickerOpen(false)

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



      <PageHeader title={sceneName} />

      {scene?.description ? (
        <p className="mb-6 text-muted" data-scene-description>
          {scene.description}
        </p>
      ) : null}

      <div
        data-testid="active-scene-tabs-row"
        className="mb-6 flex items-center gap-2 border-b border-white/10"
      >
        <div role="tablist" aria-label="Active scene tabs" className="flex gap-6">
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={sessionLocked ? 'Unlock session' : 'Lock session'}
          aria-pressed={sessionLocked}
          data-session-lock
          className="-mt-1 shrink-0"
          onClick={() => setSessionLocked((current) => !current)}
        >
          <Lock className={cn('h-4 w-4', sessionLocked && 'text-gold')} />
        </Button>
      </div>



      {tab === 'soundscapes' ? (

        <SoundscapesTab

          sceneId={sceneId}

          slots={soundscapeSlots}

          onRemoveSlot={removeSoundscapeSlot}

          onAddSoundscape={() => setSoundscapePickerOpen(true)}

          locked={sessionLocked}

        />

      ) : (

        <SoundboardTab

          sceneId={sceneId}

          entries={soundboardEntries}

          onRemove={removeSoundboardEntry}

          onAddSound={() => setPickerOpen(true)}

          locked={sessionLocked}

        />

      )}



      <FxPickerModal

        open={pickerOpen}

        onOpenChange={(open) => {

          if (!open) {

            handleCloseFxPicker()

          } else {

            setPickerOpen(true)

          }

        }}

        tracks={data.fxTracks}

        excludedTrackIds={excludedTrackIds}

        loading={e2e.fxLibraryState === 'loading'}

        onAddSelected={handleAddSelectedFx}

      />



      <SoundscapePickerModal

        open={soundscapePickerOpen}

        onOpenChange={(open) => {

          if (!open) {

            handleCloseSoundscapePicker()

          } else {

            setSoundscapePickerOpen(true)

          }

        }}

        categories={data.soundscapeCategories}

        tracks={data.soundscapeTracks}

        excludedCategoryIds={excludedCategoryIds}

        loading={e2e.soundscapeLibraryState === 'loading'}

        onAddSelected={handleAddSelectedSoundscapes}

      />

    </ScreenLandmark>

  )

}

