import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Pause, Compass } from 'lucide-react'
import { getDb, type Campaign, type FxTrack } from '../lib/storage/db'
import { playFxTrack, stopAllFx } from '../lib/audio/soundboardEngine'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [hasCampaigns, setHasCampaigns] = useState(true)
  const [topFx, setTopFx] = useState<FxTrack | null>(null)
  const [topSoundscape, setTopSoundscape] = useState<{ name: string; plays: number } | null>(null)
  const [previewingFx, setPreviewingFx] = useState<string | null>(null)
  const [previewingSoundscape, setPreviewingSoundscape] = useState<string | null>(null)

  useEffect(() => {
    const db = getDb()
    const validCampaigns = db.campaigns.filter((c) => !c.deletedAt)
    if (validCampaigns.length === 0) {
      setHasCampaigns(false)
      setActiveCampaign(null)
    } else {
      setHasCampaigns(true)
      const sorted = [...validCampaigns].sort(
        (a, b) => new Date(b.lastPlayedAt || 0).getTime() - new Date(a.lastPlayedAt || 0).getTime()
      )
      setActiveCampaign(sorted[0])
    }

    const validFx = db.fxTracks.filter((f) => !f.deletedAt)
    if (validFx.length > 0) {
      setTopFx(validFx[0])
    }

    setTopSoundscape({ name: 'Ominous Chant', plays: 42 })
  }, [])

  const handleResume = () => {
    if (activeCampaign) {
      navigate(`/campaigns/${activeCampaign.id}/sessions`)
    }
  }

  const toggleFxPreview = (trackName: string) => {
    if (previewingFx === trackName) {
      stopAllFx()
      setPreviewingFx(null)
    } else {
      stopAllFx()
      setPreviewingSoundscape(null)
      playFxTrack(trackName, 'home')
      setPreviewingFx(trackName)
    }
  }

  const toggleSoundscapePreview = (categoryName: string) => {
    if (previewingSoundscape === categoryName) {
      stopAllFx()
      setPreviewingSoundscape(null)
    } else {
      stopAllFx()
      setPreviewingFx(null)
      playFxTrack(categoryName, 'home')
      setPreviewingSoundscape(categoryName)
    }
  }

  return (
    <div className="space-y-8">
      {/* Active Campaign Section */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-serif text-amber-500 font-medium">
          Active Campaigns
        </h2>

        {!hasCampaigns ? (
          <div className="bg-[#141414] border border-neutral-800 rounded-xl p-8 text-center space-y-4">
            <Compass className="w-12 h-12 text-amber-500/60 mx-auto" />
            <div>
              <h3 className="font-serif text-lg text-neutral-200 font-semibold">
                Create your first campaign
              </h3>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto mt-1">
                Organise play nights, scenes, and soundscapes into epic story arcs.
              </p>
            </div>
            <Link
              to="/campaigns"
              className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          activeCampaign && (
            <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900 via-[#181510] to-neutral-900 border border-amber-900/30 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-amber-300 font-semibold">
                  {activeCampaign.name}
                </h3>
                {activeCampaign.description && (
                  <p className="text-sm text-neutral-400 max-w-xl">
                    {activeCampaign.description}
                  </p>
                )}
              </div>

              <button
                onClick={handleResume}
                aria-label="Resume campaign"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors self-start md:self-auto shrink-0 shadow-lg shadow-amber-950/40"
              >
                Resume
              </button>
            </div>
          )
        )}
      </section>

      {/* Stats Section */}
      {hasCampaigns && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Soundscape */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-serif text-amber-500 font-medium">
              Top Soundscape
            </h2>

            {topSoundscape ? (
              <div className="bg-[#121212] border border-amber-900/20 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg text-neutral-200">{topSoundscape.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 font-semibold uppercase">
                      Soundscape · Loopable
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 font-bold border border-amber-500/20">
                      {topSoundscape.plays} PLAYS
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleSoundscapePreview(topSoundscape.name)}
                  aria-label={`Preview ${topSoundscape.name}`}
                  className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 flex items-center justify-center transition-colors shrink-0"
                >
                  {previewingSoundscape === topSoundscape.name ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-[#121212] border border-neutral-800 rounded-xl p-5 text-sm text-neutral-400 flex items-center justify-between">
                <span>No soundscapes played yet</span>
                <Link to="/library" className="text-amber-400 hover:underline text-xs">
                  Library
                </Link>
              </div>
            )}
          </section>

          {/* Top FX */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-serif text-amber-500 font-medium">
              Top FX
            </h2>

            {topFx ? (
              <div className="bg-[#121212] border border-purple-900/20 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg text-neutral-200">{topFx.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-purple-500/30 text-purple-400 font-semibold uppercase">
                      FX · Sudden
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 font-bold border border-purple-500/20">
                      128 PLAYS
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFxPreview(topFx.name)}
                  aria-label={`Preview ${topFx.name}`}
                  className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/40 flex items-center justify-center transition-colors shrink-0"
                >
                  {previewingFx === topFx.name ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-[#121212] border border-neutral-800 rounded-xl p-5 text-sm text-neutral-400 flex items-center justify-between">
                <span>No sound effects played yet</span>
                <Link to="/library" className="text-amber-400 hover:underline text-xs">
                  Library
                </Link>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
