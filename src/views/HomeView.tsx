import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Pause, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/common/Badge'
import { audioEngine } from '../utils/audioEngine'

export const HomeView: React.FC = () => {
  const navigate = useNavigate()
  const { campaigns, categories, fxTracks, soundscapePlayCounts, fxPlayCounts, sessions } = useApp()

  const [previewingCategory, setPreviewingCategory] = useState<string | null>(null)
  const [previewingFX, setPreviewingFX] = useState<string | null>(null)

  // Determine active campaign (most recently played or created)
  const activeCampaign = campaigns.length
    ? [...campaigns].sort(
        (a, b) => (b.lastPlayedAt || b.createdAt) - (a.lastPlayedAt || a.createdAt),
      )[0]
    : null

  // Determine active campaign's sessions
  const activeCampaignSessions = activeCampaign
    ? sessions.filter((s) => s.campaignId === activeCampaign.id)
    : []

  // Top soundscape category
  const topCategoryId = Object.entries(soundscapePlayCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0]
  const topCategory = categories.find((c) => c.id === topCategoryId) || categories[0]
  const topCategoryPlays = topCategory ? soundscapePlayCounts[topCategory.id] || 0 : 0

  // Top FX track
  const topFXId = Object.entries(fxPlayCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topFX = fxTracks.find((f) => f.id === topFXId) || fxTracks[0]
  const topFXPlays = topFX ? fxPlayCounts[topFX.id] || 0 : 0

  const handleToggleSoundscapePreview = (catId: string) => {
    if (previewingCategory === catId) {
      audioEngine.stopSoundscape(catId)
      setPreviewingCategory(null)
    } else {
      audioEngine.stopAll()
      setPreviewingFX(null)
      const track =
        topCategory?.tracksByLevel.I[0] ||
        topCategory?.tracksByLevel.II[0] ||
        topCategory?.tracksByLevel.III[0]
      if (track) {
        audioEngine.playSoundscape(catId, track.url, 0.8, 1.0, 'I')
        setPreviewingCategory(catId)
      }
    }
  }

  const handleToggleFXPreview = (fxId: string) => {
    if (previewingFX === fxId) {
      audioEngine.stopFXTrack(fxId)
      setPreviewingFX(null)
    } else {
      audioEngine.stopAll()
      setPreviewingCategory(null)
      if (topFX) {
        audioEngine.playFX(topFX.id, topFX.url)
        setPreviewingFX(fxId)
      }
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Active Campaigns Section */}
      <section className="space-y-3">
        <h2 className="font-serif text-sm font-semibold tracking-wider text-amber-500 uppercase">
          Active Campaigns
        </h2>

        {activeCampaign ? (
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-900 shadow-xl p-6 lg:p-8 space-y-4">
            <div className="space-y-2">
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-neutral-100">
                {activeCampaign.name}
              </h3>
              {activeCampaignSessions.length > 0 ? (
                <p className="text-sm text-neutral-300">
                  Session {activeCampaignSessions[0].sessionNumber}:{' '}
                  {activeCampaignSessions[0].name}
                </p>
              ) : (
                <p className="text-sm text-neutral-400">
                  {activeCampaign.description || 'No sessions added yet'}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => navigate(`/campaigns/${activeCampaign.id}/sessions`)}
                className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition flex items-center space-x-2 shadow-lg"
              >
                <span>Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-amber-500/40 bg-neutral-900/50 p-8 text-center space-y-4">
            <h3 className="font-serif text-lg text-amber-400">Create your first campaign</h3>
            <Link
              to="/campaigns"
              className="inline-block px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition"
            >
              Go to Campaigns
            </Link>
          </div>
        )}
      </section>

      {/* Stats Section: Top Soundscape & Top FX */}
      {activeCampaign && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Soundscape Card */}
          <section className="space-y-3">
            <h2 className="font-serif text-sm font-semibold tracking-wider text-amber-500 uppercase">
              Top Soundscape
            </h2>
            {topCategory ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-100">
                      {topCategory.name}
                    </h3>
                    <div className="flex space-x-2 mt-1">
                      <Badge variant="gold">Soundscape</Badge>
                      <Badge variant="muted">Loopable</Badge>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-300">
                    {topCategoryPlays} PLAYS
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleToggleSoundscapePreview(topCategory.id)}
                    aria-label={`Preview ${topCategory.name}`}
                    className="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center hover:bg-amber-400 transition"
                  >
                    {previewingCategory === topCategory.id ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 text-sm text-neutral-400 text-center">
                No soundscapes played yet.{' '}
                <Link to="/library" className="text-amber-400 hover:underline">
                  Browse Library
                </Link>
              </div>
            )}
          </section>

          {/* Top FX Card */}
          <section className="space-y-3">
            <h2 className="font-serif text-sm font-semibold tracking-wider text-purple-400 uppercase">
              Top FX
            </h2>
            {topFX ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-100">{topFX.name}</h3>
                    <div className="flex space-x-2 mt-1">
                      <Badge variant="purple">FX</Badge>
                      <Badge variant="muted">Sudden</Badge>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-purple-500/40 text-purple-300">
                    {topFXPlays} PLAYS
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleToggleFXPreview(topFX.id)}
                    aria-label={`Preview ${topFX.name}`}
                    className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-400 transition"
                  >
                    {previewingFX === topFX.id ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 text-sm text-neutral-400 text-center">
                No sound effects played yet.{' '}
                <Link to="/library" className="text-amber-400 hover:underline">
                  Browse Library
                </Link>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
