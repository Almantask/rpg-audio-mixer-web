import React from 'react'

export const CreditsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Credits</h1>
        <p className="text-stone-400 text-sm mt-1">Arcanum Audio — RPG Audio Mixer for Game Masters.</p>
      </div>

      <div className="bg-[#121212] border border-amber-900/30 rounded-xl p-6 space-y-4 text-stone-300 text-sm leading-relaxed">
        <p>
          Designed for immersive tabletop roleplaying sessions with low glance, session-safe controls.
        </p>

        <div className="border-t border-stone-800 pt-4 space-y-2">
          <h2 className="font-serif text-lg font-bold text-amber-400">Audio & Sound Design</h2>
          <p className="text-stone-400 text-xs">
            Royalty-free soundscapes and one-shot sound effect samples crafted for fantasy, mystery, and combat scenarios.
          </p>
        </div>

        <div className="border-t border-stone-800 pt-4 space-y-2">
          <h2 className="font-serif text-lg font-bold text-amber-400">Version Information</h2>
          <p className="text-stone-400 text-xs font-mono">
            Arcanum Audio v1.0.0 (Release Build)
          </p>
        </div>
      </div>
    </div>
  )
}
