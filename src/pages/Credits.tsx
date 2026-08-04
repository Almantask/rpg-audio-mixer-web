import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Sparkles, Heart, Shield, Feather } from 'lucide-react';

export const Credits: React.FC = () => {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">Credits</h1>
          <p className="text-sm text-neutral-400 mt-1">App information, audio license acknowledgments, and development notes.</p>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl bg-[#141414] border border-[#252525] p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-4 border-b border-[#222222] pb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C7019] flex items-center justify-center text-black font-serif font-bold text-2xl shadow-lg">
              A
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">Arcanum Audio</h2>
              <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Version 1.0.0 (Shippable Prototype)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm">
                <Feather className="w-4 h-4" /> Design Philosophy
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Built specifically for Tabletop RPG Game Masters. Designed for rapid, low-glance session controls during live gameplay encounters.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#A855F7] font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> Audio Architecture
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Multi-channel web audio engine with maximum concurrency protection, automatic ducking for sound effects, and seamless intensity level transitions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Shield className="w-4 h-4" /> License & Assets
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Royalty-free ambient soundscapes and one-shot effects curated for fantasy, sci-fi, and tabletop RPG adventures.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <Heart className="w-4 h-4" /> Crafted with Care
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Created with React, TypeScript, Vite, Tailwind CSS, and Lucide React icons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
