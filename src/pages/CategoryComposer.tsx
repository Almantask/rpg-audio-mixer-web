import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { ComposerTrackPickerModal } from '../components/pickers/ComposerTrackPickerModal';
import { ArrowLeft, ChevronDown, ChevronRight, Plus, X, Save, Music } from 'lucide-react';

export const CategoryComposer: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { soundscapeCategories, categoryTracks, removeTrackFromLevel, showToast } = useApp();

  const category = soundscapeCategories.find(sc => sc.id === categoryId && !sc.deletedAt);

  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    'I': true,
    'II': true,
    'III': true
  });

  const [activePickerLevel, setActivePickerLevel] = useState<'I' | 'II' | 'III' | null>(null);

  if (!category) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <h2 className="text-2xl font-serif font-bold text-rose-400">Category Not Found</h2>
          <button onClick={() => navigate('/library')} className="mt-4 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg">
            Return to Library
          </button>
        </div>
      </AppShell>
    );
  }

  const toggleLevelExpand = (level: 'I' | 'II' | 'III') => {
    setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const handleSaveComposition = () => {
    showToast('Composition saved', 'success');
  };

  const levels: ('I' | 'II' | 'III')[] = ['I', 'II', 'III'];

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Library', path: '/library' },
        { label: category.name }
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/library')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> ← Library
            </button>
            <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">{category.name}</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mt-0.5">Category Composer</p>
            <p className="text-xs text-neutral-400 mt-1">Assign tracks to intensity levels for this category.</p>
          </div>

          <button
            onClick={handleSaveComposition}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C14B] hover:to-[#C4A030] text-black font-semibold text-sm shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <Save className="w-4 h-4" />
            Save Composition
          </button>
        </div>

        {/* Fixed Three Intensity Levels (Level I, Level II, Level III) */}
        <div className="space-y-4">
          {levels.map(level => {
            const levelTracks = categoryTracks.filter(t => t.categoryId === category.id && t.level === level);
            const isExpanded = expandedLevels[level];

            return (
              <div
                key={level}
                className="rounded-xl bg-[#141414] border border-[#252525] overflow-hidden shadow-lg transition-all"
              >
                {/* Level Header Bar */}
                <div
                  onClick={() => toggleLevelExpand(level)}
                  className="flex items-center justify-between p-5 bg-[#171717] border-b border-[#222222] cursor-pointer hover:bg-[#1E1E1E] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-serif font-bold text-[#D4AF37]">
                      Level {level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#222222] text-xs font-semibold text-neutral-400">
                      {levelTracks.length} {levelTracks.length === 1 ? 'track' : 'tracks'}
                    </span>
                  </div>

                  <div className="text-neutral-400 hover:text-white p-1">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>

                {/* Level Track List Body */}
                {isExpanded && (
                  <div className="p-5 space-y-3">
                    {/* Add Track Button */}
                    <button
                      onClick={() => setActivePickerLevel(level)}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-[#333333] hover:border-[#D4AF37]/60 bg-[#101010] hover:bg-[#181818] text-neutral-400 hover:text-[#D4AF37] font-semibold text-xs transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add track to Level {level}
                    </button>

                    {/* Assigned Tracks List */}
                    {levelTracks.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-2 text-center">No tracks assigned to Level {level}.</p>
                    ) : (
                      <div className="space-y-2">
                        {levelTracks.map(track => (
                          <div
                            key={track.id}
                            className="flex items-center justify-between p-3.5 rounded-lg bg-[#191919] border border-[#262626] hover:border-[#333333] transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Music className="w-4 h-4 text-[#D4AF37] shrink-0" />
                              <div className="min-w-0">
                                <span className="font-semibold text-sm text-white truncate block">{track.name}</span>
                                <span className="text-xs text-neutral-500">{track.fileFormat} • {track.duration}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => removeTrackFromLevel(track.id)}
                              className="p-1.5 text-neutral-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                              title="Detach track from level"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Composer Track Picker Modal */}
      {activePickerLevel && (
        <ComposerTrackPickerModal
          isOpen={!!activePickerLevel}
          onClose={() => setActivePickerLevel(null)}
          categoryId={category.id}
          level={activePickerLevel}
        />
      )}
    </AppShell>
  );
};
