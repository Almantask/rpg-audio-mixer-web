import React from 'react'
import { Link } from 'react-router-dom'
import { getActiveCampaigns } from '../services/campaignService'
import { Play, Music, Sparkles } from 'lucide-react'

export const HomePage: React.FC = () => {
  const campaigns = getActiveCampaigns()
  const activeCampaign = campaigns[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Welcome back to Arcanum Audio.</p>
      </div>

      {/* Hero Section */}
      {activeCampaign ? (
        <div className="relative overflow-hidden rounded-xl border border-amber-900/40 bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/30 p-6 md:p-8 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold rounded bg-amber-900/40 text-amber-300 border border-amber-800/50">
              Active Campaign
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-100">
              {activeCampaign.name}
            </h2>
            <p className="text-stone-300 text-sm line-clamp-2">
              {activeCampaign.description || 'Continue your journey through the realms.'}
            </p>
            <div className="pt-2">
              <Link
                to={`/campaigns/${activeCampaign.id}/sessions`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-lg shadow-amber-950/50"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                Resume
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-900/40 p-8 text-center bg-stone-900/40 space-y-3">
          <h2 className="font-serif text-xl text-amber-400">No active campaigns</h2>
          <p className="text-stone-400 text-sm">Create a campaign to start managing your audio sessions.</p>
          <Link
            to="/campaigns"
            className="inline-block px-4 py-2 rounded-lg bg-amber-600 text-stone-950 font-medium text-sm hover:bg-amber-500"
          >
            Go to Campaigns
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="rounded-xl border border-stone-800 bg-[#121212] p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-900/30 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Top FX</h3>
            <p className="font-serif text-lg text-stone-200 mt-0.5">Thunder Strike</p>
            <span className="text-[11px] text-stone-500 font-sans">14 PLAYS</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-[#121212] p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/30 text-amber-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Top Soundscape</h3>
            <p className="font-serif text-lg text-stone-200 mt-0.5">Dungeon Ambience</p>
            <span className="text-[11px] text-stone-500 font-sans">28 PLAYS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
