import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { SoundscapePickerModal } from '../components/pickers/SoundscapePickerModal';
import { FxPickerModal } from '../components/pickers/FxPickerModal';
import {
  Play,
  Pause,
  Volume2,
  Lock,
  Unlock,
  Plus,
  Save,
  Trash2,
  Music,
  Sparkles,
  Dices
} from 'lucide-react';

export const ActiveScene: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>();
  const navigate = useNavigate();
  const {
    scenes,
    soundscapeCategories,
    fxTracks,
    sceneSoundscapes,
    sceneFxTiles,
    masterVolume,
    setMasterVolume,
    isMasterPlaying,
    toggleMasterPlay,
    setCategoryVolume,
    setCategoryLevel,
    toggleCategoryPlay,
    removeSoundscapeFromScene,
    rollD20,
    saveSceneState,
    removeFxFromScene,
    playSceneFxTile,
    isDucked
  } = useApp();

  const scene = scenes.find(s => s.id === sceneId && !s.deletedAt);
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundscapes');
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [isSoundscapePickerOpen, setIsSoundscapePickerOpen] = useState<boolean>(false);
  const [isFxPickerOpen, setIsFxPickerOpen] = useState<boolean>(false);

  if (!scene) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <h2 className="text-2xl font-serif font-bold text-rose-400">Scene Not Found</h2>
          <button onClick={() => navigate('/scenes')} className="mt-4 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg">
            Return to Scenes
          </button>
        </div>
      </AppShell>
    );
  }

  // Active scene soundscape categories
  const currentSceneSoundscapes = sceneSoundscapes.filter(ss => ss.sceneId === scene.id);
  // Active scene FX tiles
  const currentSceneFxTiles = sceneFxTiles.filter(tile => tile.sceneId === scene.id);

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Scenes', path: '/scenes' },
        { label: scene.name }
      ]}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 border border-[#2D2D2D] bg-[#141414] shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img
              src={scene.backgroundImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200'}
              alt={scene.name}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/95 to-[#141414]/70" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#D4AF37]">{scene.name}</h1>
                {isDucked && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#A855F7]/20 border border-[#A855F7]/40 text-xs font-bold text-[#A855F7] animate-pulse">
                    FX Ducked (40%)
                  </span>
                )}
              </div>
              {scene.description && (
                <p className="text-sm text-neutral-300 max-w-2xl">{scene.description}</p>
              )}
            </div>

            {/* Session Lock Toggle Switch */}
            <button
              onClick={() => setIsLocked(prev => !prev)}
              className={`px-4 py-2.5 rounded-xl border font-semibold text-xs flex items-center gap-2 transition-all ${
                isLocked
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  : 'bg-[#222222] border-[#333333] text-neutral-300 hover:text-white'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-[#D4AF37]" />}
              {isLocked ? 'Session Locked' : 'Lock Session'}
            </button>
          </div>
        </div>

        {/* Tab Strip (Soundscapes & Soundboard) */}
        <div className="flex items-center justify-between border-b border-[#252525] pb-1">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('soundscapes')}
              className={`pb-3 text-lg font-serif font-bold transition-all relative ${
                activeTab === 'soundscapes' ? 'text-[#D4AF37]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Soundscapes
              {activeTab === 'soundscapes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('soundboard')}
              className={`pb-3 text-lg font-serif font-bold transition-all relative ${
                activeTab === 'soundboard' ? 'text-[#A855F7]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Soundboard
              {activeTab === 'soundboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A855F7]" />
              )}
            </button>
          </div>

          {/* Master Play & Volume Controls */}
          {activeTab === 'soundscapes' && (
            <div className="flex items-center gap-4 bg-[#141414] p-2 rounded-xl border border-[#252525]">
              <div className="flex items-center gap-2 px-2">
                <Volume2 className="w-4 h-4 text-neutral-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={e => setMasterVolume(Number(e.target.value))}
                  className="w-24 accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-xs font-semibold text-neutral-400 w-8">{masterVolume}%</span>
              </div>

              <button
                onClick={toggleMasterPlay}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isMasterPlaying ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#D4AF37] text-black hover:bg-[#E5C14B]'
                }`}
              >
                {isMasterPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                {isMasterPlaying ? 'Pause All' : 'Play All'}
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: SOUNDSCAPES */}
        {activeTab === 'soundscapes' && (
          <div className="space-y-6">
            {/* Header Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => rollD20(scene.id)}
                  className="px-4 py-2 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Dices className="w-4 h-4 text-[#D4AF37]" />
                  d20 Randomize
                </button>

                <button
                  onClick={() => saveSceneState(scene.id)}
                  className="px-4 py-2 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  Save State
                </button>
              </div>

              {!isLocked && (
                <button
                  onClick={() => setIsSoundscapePickerOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C14B] hover:to-[#C4A030] text-black font-semibold text-sm shadow-md flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  ADD SOUNDSCAPE
                </button>
              )}
            </div>

            {/* Soundscape Categories Grid */}
            {currentSceneSoundscapes.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#141414] border border-[#252525] space-y-4">
                <Music className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-neutral-400 text-sm">No soundscape categories added to this scene yet.</p>
                {!isLocked && (
                  <button
                    onClick={() => setIsSoundscapePickerOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-semibold text-sm hover:bg-[#E5C14B]"
                  >
                    ADD SOUNDSCAPE
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {currentSceneSoundscapes.map(ss => {
                  const category = soundscapeCategories.find(sc => sc.id === ss.categoryId);
                  if (!category) return null;

                  return (
                    <div
                      key={ss.categoryId}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-[#141414] border border-[#252525] hover:border-[#383838] transition-all shadow-lg"
                    >
                      {/* Left: Thumbnail & Name */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#202020] border border-[#333]">
                          <img
                            src={category.coverImage || 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=400'}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-lg font-serif font-bold text-white truncate">{category.name}</h4>
                          <span className="text-xs text-neutral-400 line-clamp-1">{category.description}</span>
                        </div>
                      </div>

                      {/* Middle: Intensity Level Selector (Level I, II, III) */}
                      <div className="flex items-center gap-1.5 bg-[#1C1C1C] p-1 rounded-lg border border-[#2B2B2B]">
                        {(['I', 'II', 'III'] as const).map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setCategoryLevel(scene.id, category.id, lvl)}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              ss.activeLevel === lvl
                                ? 'bg-[#D4AF37] text-black shadow'
                                : 'text-neutral-400 hover:text-white hover:bg-[#282828]'
                            }`}
                          >
                            Level {lvl}
                          </button>
                        ))}
                      </div>

                      {/* Right: Volume Slider, Play Toggle, Delete */}
                      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-neutral-400" />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={ss.volume}
                            onChange={e => setCategoryVolume(scene.id, category.id, Number(e.target.value))}
                            className="w-24 accent-[#D4AF37] cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-neutral-400 w-8">{ss.volume}%</span>
                        </div>

                        <button
                          onClick={() => toggleCategoryPlay(scene.id, category.id)}
                          className={`p-2.5 rounded-lg font-semibold transition-all ${
                            ss.isPlaying
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-[#222222] text-white hover:bg-[#2A2A2A]'
                          }`}
                        >
                          {ss.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        {!isLocked && (
                          <button
                            onClick={() => removeSoundscapeFromScene(scene.id, category.id)}
                            className="p-2 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Remove Category from Scene"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SOUNDBOARD */}
        {activeTab === 'soundboard' && (
          <div className="space-y-6">
            {/* Soundboard Header Actions */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-400">
                Tap tile to trigger sound effect instance. Max 5 concurrent FX.
              </span>

              {!isLocked && (
                <button
                  onClick={() => setIsFxPickerOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#8B5CF6] hover:from-[#B56D5F7] hover:to-[#9333EA] text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Sound
                </button>
              )}
            </div>

            {/* Soundboard FX Tile Grid */}
            {currentSceneFxTiles.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#141414] border border-[#252525] space-y-4">
                <Sparkles className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-neutral-400 text-sm">No sound effect tiles added to soundboard yet.</p>
                {!isLocked && (
                  <button
                    onClick={() => setIsFxPickerOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#A855F7] text-white font-semibold text-sm hover:bg-[#9333EA]"
                  >
                    Add Sound
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {currentSceneFxTiles.map(tile => {
                  const fx = fxTracks.find(f => f.id === tile.fxTrackId);
                  if (!fx) return null;

                  return (
                    <div
                      key={tile.id}
                      onClick={() => playSceneFxTile(tile.id)}
                      className="relative p-5 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#A855F7] transition-all cursor-pointer group shadow-lg flex flex-col justify-between h-36 select-none active:scale-[0.98]"
                    >
                      {/* Top Row: Category & Delete */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[#A855F7]/15 text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">
                          {fx.category}
                        </span>
                        {!isLocked && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              removeFxFromScene(tile.id);
                            }}
                            className="p-1 text-neutral-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Tile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Middle Title */}
                      <div>
                        <h4 className="font-serif font-bold text-white text-base group-hover:text-[#A855F7] transition-colors line-clamp-2">
                          {fx.name}
                        </h4>
                        <span className="text-[11px] text-neutral-500">{fx.duration}</span>
                      </div>

                      {/* Bottom Play Indicator */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase">Tap to Play</span>
                        <div className="w-6 h-6 rounded-full bg-[#A855F7]/20 group-hover:bg-[#A855F7] flex items-center justify-center text-[#A855F7] group-hover:text-white transition-colors">
                          <Play className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pickers Modals */}
      <SoundscapePickerModal
        isOpen={isSoundscapePickerOpen}
        onClose={() => setIsSoundscapePickerOpen(false)}
        sceneId={scene.id}
      />

      <FxPickerModal
        isOpen={isFxPickerOpen}
        onClose={() => setIsFxPickerOpen(false)}
        sceneId={scene.id}
      />
    </AppShell>
  );
};
