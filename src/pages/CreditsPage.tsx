import React from 'react'
import { Scroll, Sparkles } from 'lucide-react'

export const CreditsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-amber-400">Credits</h1>
        <p className="text-sm text-neutral-400">
          Arcanum Audio — RPG Soundboard & Soundscape Mixer
        </p>
      </div>

      <div className="bg-[#121212] border border-amber-900/30 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Scroll className="w-8 h-8 text-amber-400" />
          <div>
            <h2 className="font-serif text-lg font-semibold text-neutral-100">Version 1.0.0</h2>
            <p className="text-xs text-neutral-400">Session-Safe Audio Companion for Game Masters</p>
          </div>
        </div>

        <hr className="border-neutral-800" />

        <div className="space-y-4 text-sm text-neutral-300">
          <h3 className="font-serif font-semibold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Crafted for Live Play
          </h3>
          <p>
            Arcanum Audio provides low-glance session-safe audio control, Web Audio API soundboard buffers, and ambient soundscapes.
          </p>
        </div>

        <div className="space-y-2 text-xs text-neutral-500 pt-2">
          <p>© 2026 Arcanum Audio. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
