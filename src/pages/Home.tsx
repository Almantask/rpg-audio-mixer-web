import React from 'react'
import { Play, Sparkles, Volume2 } from 'lucide-react'
import type { Campaign, Session } from '../types'

interface HomeProps {
  campaigns: Campaign[]
  sessions: Session[]
  onOpenCampaign: (campaignId: string) => void
  onOpenSession: (sessionId: string) => void
}

export const Home: React.FC<HomeProps> = ({
  campaigns,
  sessions,
  onOpenCampaign,
  onOpenSession,
}) => {
  const activeCampaign = campaigns.find((c) => !c.deletedAt)
  const campaignSessions = activeCampaign
    ? sessions.filter((s) => s.campaignId === activeCampaign.id && !s.deletedAt)
    : []
  const latestSession = campaignSessions[0]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-serif font-bold text-amber-400">Home</h1>
        <p className="text-gray-400 text-sm">Welcome back, Game Master.</p>
      </header>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#1A1813] to-[#121212] border border-amber-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Active Campaign
          </div>

          {activeCampaign ? (
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-100">{activeCampaign.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{activeCampaign.description || 'No description provided.'}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-100">No campaigns yet</h2>
              <p className="text-gray-400 text-sm mt-1">Create a campaign to begin your adventure.</p>
            </div>
          )}

          <div className="pt-2 flex items-center gap-4">
            {activeCampaign && (
              <button
                onClick={() => {
                  if (latestSession) {
                    onOpenSession(latestSession.id)
                  } else {
                    onOpenCampaign(activeCampaign.id)
                  }
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg shadow-lg flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#121212] border border-amber-900/20 rounded-lg p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Soundscape</div>
            <div className="text-lg font-serif font-semibold text-gray-200">Tavern Ambience</div>
            <div className="text-xs text-amber-400/80">42 PLAYS</div>
          </div>
        </div>

        <div className="bg-[#121212] border border-amber-900/20 rounded-lg p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top FX</div>
            <div className="text-lg font-serif font-semibold text-gray-200">Sword Clash</div>
            <div className="text-xs text-purple-400/80">89 PLAYS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
