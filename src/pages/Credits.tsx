import React from 'react'
import { Scroll } from 'lucide-react'

export const Credits: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-serif font-bold text-amber-400">Credits</h1>
        <p className="text-gray-400 text-sm">Arcanum Audio team and open-source licenses.</p>
      </header>

      <div className="bg-[#121212] border border-amber-900/30 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-amber-900/20 pb-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Scroll className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-100">Arcanum Audio Web</h2>
            <p className="text-xs text-amber-400/80">Version 1.0.0 — RPG Audio Experience</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-300">
          <h3 className="font-serif font-semibold text-amber-400 text-base">Created For</h3>
          <p>Tabletop RPG Game Masters seeking seamless soundscapes and soundboard control.</p>

          <h3 className="font-serif font-semibold text-amber-400 text-base pt-2">Audio Assets</h3>
          <p>Includes royalty-free audio effects and ambience compositions for tabletop gaming.</p>
        </div>
      </div>
    </div>
  )
}
