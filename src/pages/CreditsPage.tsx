import React from 'react'
import { Scroll, Heart, Shield, Sparkles } from 'lucide-react'

export const CreditsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pb-6 border-b border-yellow-900/30">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Scroll size={32} />
        </div>
        <h1 className="font-serif text-4xl font-bold text-amber-300">Credits</h1>
        <p className="text-sm text-gray-400">Arcanum Audio — Tabletop RPG Soundscape Engine v1.0</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#171717] border border-yellow-900/30 rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-amber-400 flex items-center space-x-2">
            <Sparkles size={20} />
            <span>About Arcanum Audio</span>
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Arcanum Audio is built specifically for Game Masters who need low-glance, high-reliability audio mixing during live tabletop sessions. Designed with instant sound triggers, ducking ambience, and multi-tier intensity categories.
          </p>
        </div>

        <div className="bg-[#171717] border border-yellow-900/30 rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-amber-400 flex items-center space-x-2">
            <Shield size={20} />
            <span>Audio & Open Source Credits</span>
          </h2>
          <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
            <li>Built with React 19, TypeScript, and Vite</li>
            <li>Styled using Vanilla CSS & Tailwind v4 Design System</li>
            <li>Icons by Lucide React</li>
            <li>Ambient audio tracks and sound effects under Creative Commons Zero / CC-BY license</li>
          </ul>
        </div>

        <div className="bg-[#171717] border border-yellow-900/30 rounded-xl p-6 text-center space-y-2">
          <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
            <span>Crafted with</span>
            <Heart size={12} className="text-red-400 fill-current" />
            <span>for tabletop adventurers worldwide</span>
          </p>
        </div>
      </div>
    </div>
  )
}
