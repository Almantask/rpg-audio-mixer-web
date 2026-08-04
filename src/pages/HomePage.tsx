import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Music, Sparkles, BookOpen, Layers } from 'lucide-react'
import { useApp } from '../context/AppContext'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { campaigns, scenes, soundscapeCategories, fxTracks } = useApp()

  const activeCampaign = campaigns[0]
  const resumePath = activeCampaign ? `/campaigns/${activeCampaign.id}/sessions` : '/campaigns'

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-neutral-900 border border-amber-500/30 p-8 md:p-12 shadow-2xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Game Master Control Deck</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-amber-200 tracking-wide">
            Welcome to Arcanum Audio
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Immerse your tabletop campaign with synchronized soundscapes, dynamic intensity levels, and real-time sound effects.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => navigate(resumePath)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg shadow-lg hover:shadow-amber-500/20 transition flex items-center space-x-2 text-base cursor-pointer"
            >
              <Play size={18} className="fill-current" />
              <span>Resume</span>
            </button>
            <Link
              to="/scenes"
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 font-semibold rounded-lg transition flex items-center space-x-2 text-base"
            >
              <Layers size={18} />
              <span>Browse Scenes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Dashboard Stat Cards (per platform-design PW-11: "PLAYS" labels) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#171717] border border-yellow-900/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Music size={20} />
              <span>Top Soundscape</span>
            </h2>
            <span className="text-xs font-mono px-2 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded">
              128 PLAYS
            </span>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-200">
                {soundscapeCategories[0]?.name || 'Weather & Storms'}
              </div>
              <div className="text-xs text-gray-400">
                {soundscapeCategories[0]?.description || 'Dynamic atmospheric background'}
              </div>
            </div>
            <Link
              to="/library"
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded border border-amber-500/30"
            >
              View in Library
            </Link>
          </div>
        </div>

        <div className="bg-[#171717] border border-purple-900/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-purple-400 flex items-center space-x-2">
              <Sparkles size={20} />
              <span>Top FX</span>
            </h2>
            <span className="text-xs font-mono px-2 py-1 bg-purple-950/60 text-purple-300 border border-purple-800/40 rounded">
              254 PLAYS
            </span>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-200">
                {fxTracks[0]?.name || 'Sword Clash'}
              </div>
              <div className="text-xs text-gray-400">
                {fxTracks[0]?.category || 'Combat'} • {fxTracks[0]?.durationSeconds || 2}s
              </div>
            </div>
            <Link
              to="/library?tab=fx"
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold rounded border border-purple-500/30"
            >
              View FX Library
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/campaigns"
          className="group bg-[#141414] hover:bg-[#1a1a1a] border border-yellow-900/20 hover:border-amber-500/50 p-6 rounded-xl transition duration-200"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <BookOpen size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold text-amber-300 mb-2">Campaigns</h3>
          <p className="text-sm text-gray-400">
            Manage your gaming campaigns ({campaigns.length} active) and sessions.
          </p>
        </Link>

        <Link
          to="/scenes"
          className="group bg-[#141414] hover:bg-[#1a1a1a] border border-yellow-900/20 hover:border-amber-500/50 p-6 rounded-xl transition duration-200"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Layers size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold text-amber-300 mb-2">Scenes Catalogue</h3>
          <p className="text-sm text-gray-400">
            Browse global audio scene presets ({scenes.length} available) or build custom scenes.
          </p>
        </Link>

        <Link
          to="/library"
          className="group bg-[#141414] hover:bg-[#1a1a1a] border border-yellow-900/20 hover:border-amber-500/50 p-6 rounded-xl transition duration-200"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Music size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold text-amber-300 mb-2">Audio Library</h3>
          <p className="text-sm text-gray-400">
            Compose soundscape categories ({soundscapeCategories.length}) and manage FX library tracks ({fxTracks.length}).
          </p>
        </Link>
      </div>
    </div>
  )
}
