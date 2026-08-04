import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Music, Volume2, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { campaigns, sessions, scenes, soundscapeCategories, fxTracks } = useApp()

  // Determine active campaign as most recently played/updated
  const activeCampaign = campaigns.length > 0 ? campaigns[0] : null
  const activeSessions = activeCampaign
    ? sessions.filter((s) => s.campaignId === activeCampaign.id)
    : []

  const handleResumeHero = () => {
    if (activeCampaign) {
      navigate(`/campaigns/${activeCampaign.id}/sessions`)
    } else {
      navigate('/campaigns')
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden border border-yellow-900/40 bg-gradient-to-r from-[#1A150A] via-[#121212] to-[#0D0D0D] p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Active Session Context
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-yellow-500 leading-tight">
            {activeCampaign ? activeCampaign.name : 'Welcome to Arcanum Audio'}
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            {activeCampaign
              ? activeCampaign.description || 'Manage your active campaign sessions and scenes.'
              : 'Curate ambient soundscapes and trigger one-shot effects for your tabletop RPG campaigns.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={handleResumeHero}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-yellow-500 text-black font-bold text-base hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Play size={20} fill="currentColor" />
              <span>Resume Journey</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Soundscape Card */}
        <div className="p-6 rounded-xl bg-[#161616] border border-yellow-900/30 space-y-3">
          <div className="flex items-center justify-between text-yellow-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              Top Soundscape
            </span>
            <Music size={20} />
          </div>
          <h3 className="font-serif text-xl font-bold text-yellow-500">
            {soundscapeCategories[0]?.name || 'Weather & Storms'}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-yellow-900/20">
            <span>Most Frequent Ambience</span>
            <span className="font-bold text-yellow-400">142 PLAYS</span>
          </div>
        </div>

        {/* Top FX Card */}
        <div className="p-6 rounded-xl bg-[#161616] border border-purple-900/30 space-y-3">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              Top FX
            </span>
            <Volume2 size={20} />
          </div>
          <h3 className="font-serif text-xl font-bold text-purple-300">
            {fxTracks[0]?.title || 'Dragon Roar'}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-purple-900/20">
            <span>Most Retriggered FX</span>
            <span className="font-bold text-purple-400">89 PLAYS</span>
          </div>
        </div>

        {/* Quick Campaign Summary */}
        <div className="p-6 rounded-xl bg-[#161616] border border-yellow-900/30 space-y-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-yellow-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              Active Campaign
            </span>
            <BookOpen size={20} />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-200">
            {activeCampaign ? activeCampaign.name : 'No Campaigns Yet'}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-yellow-900/20">
            <span>Total Sessions</span>
            <span className="font-bold text-gray-200">{activeSessions.length} Sessions</span>
          </div>
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-yellow-500">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="p-5 rounded-xl bg-[#161616] border border-yellow-900/20 hover:border-yellow-500/50 text-left transition-all group flex items-center justify-between"
          >
            <div>
              <h4 className="font-serif text-lg font-bold text-yellow-500 group-hover:text-yellow-400">
                Campaigns
              </h4>
              <p className="text-xs text-gray-400 mt-1">{campaigns.length} campaigns</p>
            </div>
            <ArrowRight size={20} className="text-gray-500 group-hover:text-yellow-500" />
          </button>

          <button
            onClick={() => navigate('/scenes')}
            className="p-5 rounded-xl bg-[#161616] border border-yellow-900/20 hover:border-yellow-500/50 text-left transition-all group flex items-center justify-between"
          >
            <div>
              <h4 className="font-serif text-lg font-bold text-yellow-500 group-hover:text-yellow-400">
                Scenes Catalogue
              </h4>
              <p className="text-xs text-gray-400 mt-1">{scenes.length} global scenes</p>
            </div>
            <ArrowRight size={20} className="text-gray-500 group-hover:text-yellow-500" />
          </button>

          <button
            onClick={() => navigate('/library')}
            className="p-5 rounded-xl bg-[#161616] border border-yellow-900/20 hover:border-yellow-500/50 text-left transition-all group flex items-center justify-between"
          >
            <div>
              <h4 className="font-serif text-lg font-bold text-yellow-500 group-hover:text-yellow-400">
                Audio Library
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {soundscapeCategories.length} categories · {fxTracks.length} FX
              </p>
            </div>
            <ArrowRight size={20} className="text-gray-500 group-hover:text-yellow-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
