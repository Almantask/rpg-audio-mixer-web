import { useState } from 'react'

import { useSearchParams } from 'react-router-dom'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

import { useCampaignData } from '@/context/CampaignDataContext'

import { getTrashedCampaigns, getTrashedSessions } from '@/lib/campaignStorage'

import { getTrashedScenes } from '@/lib/sceneStorage'

import { getTrashedFxTracks } from '@/lib/libraryStorage'

import type { TrashTab } from '@/types/campaign'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'



const TABS: { id: TrashTab; label: string }[] = [

  { id: 'campaigns', label: 'Campaigns' },

  { id: 'sessions', label: 'Sessions' },

  { id: 'scenes', label: 'Scenes' },

  { id: 'soundscapes', label: 'Soundscapes' },

  { id: 'fx', label: 'FX' },

]



function trashTabFromQuery(value: string | null): TrashTab {

  if (value === 'sessions' || value === 'scenes' || value === 'fx' || value === 'campaigns' || value === 'soundscapes') {

    return value

  }

  return 'campaigns'

}



export function TrashPage() {

  const { data, restoreCampaign, restoreSession, restoreScene, restoreFx, restoreSoundscapeCategory } = useCampaignData()

  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState<TrashTab>(() => trashTabFromQuery(searchParams.get('tab')))



  const trashedCampaigns = getTrashedCampaigns(data.campaigns)

  const trashedSessions = getTrashedSessions(data.sessions)

  const trashedScenes = getTrashedScenes(data.scenes)

  const trashedSoundscapes = (data.soundscapeCategories ?? []).filter((c) => c.deletedAt)

  const trashedFx = getTrashedFxTracks(data.fxTracks)



  const isEmpty =

    trashedCampaigns.length === 0 &&

    trashedSessions.length === 0 &&

    trashedScenes.length === 0 &&

    trashedSoundscapes.length === 0 &&

    trashedFx.length === 0




  return (

    <ScreenLandmark screenName="Trash screen">

      <PageHeader title="Trash" subtitle="Recover recently deleted items." />



      <div role="tablist" aria-label="Trash tabs" className="mb-6 flex gap-4 border-b border-white/10">

        {TABS.map((tab) => (

          <button

            key={tab.id}

            type="button"

            role="tab"

            aria-selected={activeTab === tab.id}

            data-trash-tab={tab.id}

            className={cn(

              'px-2 pb-2',

              activeTab === tab.id ? 'border-b-2 border-gold text-gold' : 'text-muted',

            )}

            onClick={() => setActiveTab(tab.id)}

          >

            {tab.label}

          </button>

        ))}

      </div>



      {isEmpty ? <p className="text-muted">Nothing in Trash yet.</p> : null}



      {activeTab === 'campaigns' ? (

        <section aria-label="Trash Campaigns tab" data-trash-campaigns>

          {trashedCampaigns.length === 0 ? (

            <p className="text-muted">No trashed campaigns.</p>

          ) : (

            <ul className="space-y-2">

              {trashedCampaigns.map((campaign) => (

                <li

                  key={campaign.id}

                  className="flex items-center justify-between rounded-md border border-white/10 p-3"

                  data-trashed-campaign={campaign.name}

                >

                  <span>{campaign.name}</span>

                  <Button type="button" onClick={() => restoreCampaign(campaign.id)}>

                    Restore

                  </Button>

                </li>

              ))}

            </ul>

          )}

        </section>

      ) : null}



      {activeTab === 'sessions' ? (

        <section aria-label="Trash Sessions tab" data-trash-sessions>

          {trashedSessions.length === 0 ? (

            <p className="text-muted">No trashed sessions.</p>

          ) : (

            <ul className="space-y-2">

              {trashedSessions.map((session) => (

                <li

                  key={session.id}

                  className="flex items-center justify-between rounded-md border border-white/10 p-3"

                  data-trashed-session={`Session ${session.number}`}

                >

                  <span>

                    Session {session.number}: {session.name}

                  </span>

                  <Button type="button" onClick={() => restoreSession(session.id)}>

                    Restore

                  </Button>

                </li>

              ))}

            </ul>

          )}

        </section>

      ) : null}



      {activeTab === 'scenes' ? (

        <section aria-label="Trash Scenes tab" data-trash-scenes>

          {trashedScenes.length === 0 ? (

            <p className="text-muted">No trashed scenes.</p>

          ) : (

            <ul className="space-y-2">

              {trashedScenes.map((scene) => (

                <li

                  key={scene.id}

                  className="flex items-center justify-between rounded-md border border-white/10 p-3"

                  data-trashed-scene={scene.name}

                >

                  <span>{scene.name}</span>

                  <Button type="button" onClick={() => restoreScene(scene.id)}>

                    Restore

                  </Button>

                </li>

              ))}

            </ul>

          )}

        </section>

      ) : null}

      {activeTab === 'soundscapes' ? (
        <section aria-label="Trash Soundscapes tab" data-trash-soundscapes>
          {trashedSoundscapes.length === 0 ? (
            <p className="text-muted">No trashed soundscapes.</p>
          ) : (
            <ul className="space-y-2">
              {trashedSoundscapes.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between rounded-md border border-white/10 p-3"
                  data-trashed-soundscape={category.name}
                >
                  <span>{category.name}</span>
                  <Button type="button" onClick={() => restoreSoundscapeCategory(category.id)}>
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {activeTab === 'fx' ? (


        <section aria-label="Trash FX tab" data-trash-fx>

          {trashedFx.length === 0 ? (

            <p className="text-muted">No trashed FX tracks.</p>

          ) : (
            <>
              <ul className="space-y-2">
                {trashedFx.map((track) => (
                  <li
                    key={track.id}
                    className="flex items-center justify-between rounded-md border border-white/10 p-3"
                    data-trashed-fx={track.name}
                  >
                    <span>{track.name}</span>
                    <Button type="button" onClick={() => restoreFx(track.id)}>
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted" data-fx-retention-notice>
                The local copy of the audio file is retained for 7 days.
              </p>
            </>
          )}

        </section>

      ) : null}

    </ScreenLandmark>

  )

}


