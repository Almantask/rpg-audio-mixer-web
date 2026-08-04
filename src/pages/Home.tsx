import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { Play, Sparkles, BookOpen, Music, Image, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, sessions, fxTracks, soundscapeCategories } = useApp();

  const activeCampaign = campaigns.find(c => !c.deletedAt) || campaigns[0];
  const totalSessions = sessions.filter(s => !s.deletedAt).length;

  const handleResume = () => {
    if (activeCampaign) {
      navigate(`/campaigns/${activeCampaign.id}/sessions`);
    } else {
      navigate('/campaigns');
    }
  };

  // Top stats calculations
  const topFx = [...fxTracks].sort((a, b) => (b.plays || 0) - (a.plays || 0))[0] || { name: 'Thunder Clap', plays: 42 };
  const topSoundscape = soundscapeCategories[0] || { name: 'Meteorological' };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Card */}
        <div className="relative rounded-2xl overflow-hidden border border-[#2D2D2D] bg-gradient-to-r from-[#1A1A1A] via-[#141414] to-[#0D0D0D] p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent opacity-60" />
          <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Game Master Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Craft Unforgettable Audio Landscapes
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed">
              Active Campaign:{' '}
              <span className="text-[#D4AF37] font-semibold">{activeCampaign?.title || 'No Campaign Selected'}</span>.
              Seamlessly trigger dynamic soundscapes and instant sound effect tiles for your tabletop sessions.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleResume}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C14B] hover:to-[#C4A030] text-black font-semibold text-sm shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-black" />
                Resume
              </button>
              <button
                onClick={() => navigate('/campaigns')}
                className="px-6 py-3.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white font-medium text-sm border border-[#333333] transition-all flex items-center gap-2"
              >
                View Campaigns
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Campaign Stat */}
          <div
            onClick={() => navigate('/campaigns')}
            className="p-6 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#D4AF37]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Active Campaign</span>
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
              {activeCampaign?.title || 'None'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">{totalSessions} total sessions registered</p>
          </div>

          {/* Top Soundscape Stat */}
          <div
            onClick={() => navigate('/library')}
            className="p-6 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#D4AF37]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Top Soundscape</span>
              <Music className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
              {topSoundscape.name}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">128 PLAYS across all scenes</p>
          </div>

          {/* Top FX Stat */}
          <div
            onClick={() => navigate('/library')}
            className="p-6 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#A855F7]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Top FX</span>
              <Sparkles className="w-5 h-5 text-[#A855F7]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#A855F7] transition-colors truncate">
              {topFx.name}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">{topFx.plays || 0} PLAYS</p>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#D4AF37]">Quick Shortcuts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/scenes')}
              className="p-5 rounded-xl bg-[#121212] border border-[#222] hover:bg-[#181818] transition-all cursor-pointer flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Image className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-white">Global Scenes Catalogue</h4>
                <p className="text-xs text-neutral-500">Curate and build environments</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/library')}
              className="p-5 rounded-xl bg-[#121212] border border-[#222] hover:bg-[#181818] transition-all cursor-pointer flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7]">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-white">Audio Library</h4>
                <p className="text-xs text-neutral-500">Manage soundscapes & FX</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/campaigns')}
              className="p-5 rounded-xl bg-[#121212] border border-[#222] hover:bg-[#181818] transition-all cursor-pointer flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-white">Campaign Sessions</h4>
                <p className="text-xs text-neutral-500">Manage campaign play logs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
