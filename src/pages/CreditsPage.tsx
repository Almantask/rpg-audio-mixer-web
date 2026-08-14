import React from 'react'

export const CreditsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-100">Credits</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Arcanum Audio — Tabletop RPG Audio Mixer & Soundboard
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Built for GMs & Storytellers</h2>
        <p className="text-sm text-neutral-300">
          Designed for seamless immersion during RPG game sessions.
        </p>
      </div>
    </div>
  )
}
