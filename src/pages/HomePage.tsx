import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Layers, Music, Play } from 'lucide-react'
import { db } from '../storage/db'

export const HomePage: React.FC = () => {
  const campaigns = db.getCampaigns()
  const activeCampaign = campaigns[0]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-100">Welcome to Arcanum Audio</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Your ambient audio mixer & soundboard for tabletop RPG sessions
        </p>
      </div>

      {/* Active Campaign Hero */}
      {activeCampaign ? (
        <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Active Campaign Hero
          </div>
          <h2 className="text-3xl font-black text-neutral-100">{activeCampaign.name}</h2>
          {activeCampaign.description && (
            <p className="text-neutral-300 max-w-xl text-sm">{activeCampaign.description}</p>
          )}
          <div className="pt-2">
            <Link
              to={`/campaigns/${activeCampaign.id}`}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" /> Resume Session
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-neutral-200">No Active Campaign</h2>
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-5 py-2.5 rounded-lg"
          >
            Create a Campaign
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/campaigns"
          className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl p-6 space-y-3 transition-colors group"
        >
          <Compass className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-neutral-100">Campaigns</h3>
          <p className="text-xs text-neutral-400">
            Organise play nights and sessions under distinct campaign story arcs.
          </p>
        </Link>

        <Link
          to="/scenes"
          className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl p-6 space-y-3 transition-colors group"
        >
          <Layers className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-neutral-100">Scenes</h3>
          <p className="text-xs text-neutral-400">
            Browse and build custom atmospheric audio scenes for your locations.
          </p>
        </Link>

        <Link
          to="/library"
          className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl p-6 space-y-3 transition-colors group"
        >
          <Music className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-neutral-100">Library</h3>
          <p className="text-xs text-neutral-400">
            Import, preview, and manage sound effect clips and soundscapes.
          </p>
        </Link>
      </div>
    </div>
  )
}
