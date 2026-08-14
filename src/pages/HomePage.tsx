import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause } from 'lucide-react'
import { useCampaigns, useSessions, useFxTracks } from '../lib/useStorage'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { sceneAudioManager } from '../lib/audio/sceneAudioManager'
import { subscribeAudioState } from '../lib/audio/audioState'

export function HomePage() {
  const navigate = useNavigate()
  const { campaigns } = useCampaigns()
  const { fxTracks } = useFxTracks()

  const [activeAudioState, setActiveAudioState] = useState(() => sceneAudioManager.isTrackPlaying(''))
  const [currentPreview, setCurrentPreview] = useState<{ trackName: string; progress: number } | null>(null)

  useEffect(() => {
    return subscribeAudioState((state) => {
      setActiveAudioState(state.isPlaying)
      if (!state.isPlaying) {
        setCurrentPreview(null)
      }
    })
  }, [])

  // Sort campaigns by lastPlayedAt descending
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const timeA = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0
    const timeB = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0
    return timeB - timeA
  })

  const activeCampaign = sortedCampaigns[0]
  const { sessions } = useSessions(activeCampaign?.id)

  const handlePreviewFx = (track: { id: string; name: string; url: string; durationSeconds: number }) => {
    if (currentPreview?.trackName === track.name && activeAudioState) {
      sceneAudioManager.stopAll()
      setCurrentPreview(null)
      return
    }

    sceneAudioManager.stopAll()
    sceneAudioManager.playFx(track.id, track.name, track.url, {
      source: 'home',
      durationSeconds: track.durationSeconds || 4,
    })
    setCurrentPreview({ trackName: track.name, progress: 50 })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Active Campaign Section */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-amber-300">
          Active Campaigns
        </h2>

        {!activeCampaign ? (
          <Card className="border-dashed border-amber-500/40 bg-zinc-950/60 p-8 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <h3 className="font-serif text-xl font-bold text-amber-300">
                Create your first campaign
              </h3>
              <p className="text-sm text-zinc-400">
                Organise your sessions, scenes, and audio soundscapes under dedicated campaign storylines.
              </p>
              <Button
                variant="gold"
                onClick={() => navigate('/campaigns')}
                className="mt-2"
              >
                Create your first campaign
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 shadow-xl">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-amber-300">
                  {activeCampaign.name}
                </h3>
                <p className="text-zinc-400 text-sm max-w-xl">
                  {sessions.length > 0
                    ? `Session ${sessions[0].sessionNumber}: ${sessions[0].name} awaits your party's next move.`
                    : activeCampaign.description || 'Manage sessions and scenes for this campaign.'}
                </p>
              </div>
              <Button
                variant="gold"
                size="lg"
                onClick={() => navigate(`/campaigns/${activeCampaign.id}/sessions`)}
                className="shrink-0"
              >
                Resume
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Top Stats (Only shown when campaigns exist) */}
      {activeCampaign && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Soundscape */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-amber-300">
              Top Soundscape
            </h2>
            <Card className="border-zinc-800 bg-zinc-900/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base text-zinc-100">Ominous Chant</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="default" className="text-[10px]">SOUNDSCAPE</Badge>
                    <Badge variant="outline" className="text-[10px]">LOOPABLE</Badge>
                  </div>
                </div>
                <div className="text-xs font-semibold px-2 py-1 rounded-full border border-amber-500/40 text-amber-300">
                  42 PLAYS
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="gold"
                    className="h-9 w-9 rounded-full shrink-0"
                    aria-label="Preview Ominous Chant"
                    onClick={() =>
                      handlePreviewFx({
                        id: 'fx-ominous',
                        name: 'Ominous Chant',
                        url: '/assets/audio/soundboard/owl_hooting.ogg',
                        durationSeconds: 3,
                      })
                    }
                  >
                    {currentPreview?.trackName === 'Ominous Chant' ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <Progress value={currentPreview?.trackName === 'Ominous Chant' ? 60 : 0} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top FX */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-purple-300">
              Top FX
            </h2>
            <Card className="border-zinc-800 bg-zinc-900/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base text-zinc-100">
                    {fxTracks[2]?.name || 'Dragon Roar'}
                  </CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="purple" className="text-[10px]">FX</Badge>
                    <Badge variant="outline" className="text-[10px]">SUDDEN</Badge>
                  </div>
                </div>
                <div className="text-xs font-semibold px-2 py-1 rounded-full border border-purple-500/40 text-purple-300">
                  128 PLAYS
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-full shrink-0 bg-purple-600 hover:bg-purple-500 text-white"
                    aria-label={`Preview ${fxTracks[2]?.name || 'Dragon Roar'}`}
                    onClick={() =>
                      handlePreviewFx(
                        fxTracks[2] || {
                          id: 'fx-dragon-roar',
                          name: 'Dragon Roar',
                          url: '/assets/audio/soundboard/dragon_roar2.ogg',
                          durationSeconds: 4,
                        }
                      )
                    }
                  >
                    {currentPreview?.trackName === (fxTracks[2]?.name || 'Dragon Roar') ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <Progress value={currentPreview?.trackName === (fxTracks[2]?.name || 'Dragon Roar') ? 70 : 0} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
