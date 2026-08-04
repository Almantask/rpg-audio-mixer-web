import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { Dialog } from '../components/common/Dialog';
import { Search, Plus, Play, Edit2, Trash2, Upload } from 'lucide-react';
import type { FxTrack } from '../types';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const {
    soundscapeCategories,
    categoryTracks,
    fxTracks,
    createSoundscapeCategory,
    deleteSoundscapeCategory,
    importFxTrack,
    updateFxTrack,
    deleteFxTrack,
    playFxPreview
  } = useApp();

  const [activeTab, setActiveTab] = useState<'soundscapes' | 'fx'>('soundscapes');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddSoundscapeOpen, setIsAddSoundscapeOpen] = useState(false);
  const [isImportFxOpen, setIsImportFxOpen] = useState(false);
  const [editingFx, setEditingFx] = useState<FxTrack | null>(null);

  // Form states
  const [scName, setScName] = useState('');
  const [scDesc, setScDesc] = useState('');
  const [scCover, setScCover] = useState('');

  const [fxName, setFxName] = useState('');
  const [fxCategory, setFxCategory] = useState('');

  const activeCategories = soundscapeCategories.filter(sc => !sc.deletedAt);
  const activeFx = fxTracks.filter(f => !f.deletedAt);

  const filteredCategories = activeCategories.filter(sc =>
    sc.name.toLowerCase().includes(search.toLowerCase()) ||
    (sc.description && sc.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredFx = activeFx.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSoundscapeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scName.trim()) return;
    const newCat = createSoundscapeCategory({
      name: scName.trim(),
      description: scDesc.trim() || undefined,
      coverImage: scCover.trim() || undefined
    });
    setScName('');
    setScDesc('');
    setScCover('');
    setIsAddSoundscapeOpen(false);
    navigate(`/library/soundscapes/${newCat.id}/compose`);
  };

  const handleImportFxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fxName.trim()) return;
    importFxTrack({
      name: fxName.trim(),
      category: fxCategory.trim() || 'General'
    });
    setFxName('');
    setFxCategory('');
    setIsImportFxOpen(false);
  };

  const handleEditFxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFx || !fxName.trim()) return;
    updateFxTrack(editingFx.id, {
      name: fxName.trim(),
      category: fxCategory.trim() || 'General'
    });
    setEditingFx(null);
    setFxName('');
    setFxCategory('');
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">Library</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {activeTab === 'soundscapes'
              ? 'Browse and manage your soundscape categories.'
              : 'Browse and manage one-shot sound effect tracks.'}
          </p>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center justify-between border-b border-[#252525]">
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setActiveTab('soundscapes');
                setSearch('');
              }}
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
              onClick={() => {
                setActiveTab('fx');
                setSearch('');
              }}
              className={`pb-3 text-lg font-serif font-bold transition-all relative ${
                activeTab === 'fx' ? 'text-[#A855F7]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sound Effects
              {activeTab === 'fx' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A855F7]" />
              )}
            </button>
          </div>

          {/* Tab Specific CTAs */}
          {activeTab === 'soundscapes' ? (
            <button
              onClick={() => setIsAddSoundscapeOpen(true)}
              className="mb-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] text-black font-semibold text-sm flex items-center gap-2 hover:from-[#E5C14B] hover:to-[#C4A030] shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Soundscape
            </button>
          ) : (
            <button
              onClick={() => setIsImportFxOpen(true)}
              className="mb-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#8B5CF6] text-white font-semibold text-sm flex items-center gap-2 hover:from-[#B56D5F7] shadow-md"
            >
              <Upload className="w-4 h-4" />
              Import FX
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={
              activeTab === 'soundscapes'
                ? 'Search compositions...'
                : 'Search sound effects by name or category...'
            }
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#141414] border border-[#262626] text-white text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm"
          />
        </div>

        {/* TAB CONTENT: SOUNDSCAPES */}
        {activeTab === 'soundscapes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCategories.map(sc => {
              const tracks = categoryTracks.filter(t => t.categoryId === sc.id);
              const countI = tracks.filter(t => t.level === 'I').length;
              const countII = tracks.filter(t => t.level === 'II').length;
              const countIII = tracks.filter(t => t.level === 'III').length;

              return (
                <div
                  key={sc.id}
                  onClick={() => navigate(`/library/soundscapes/${sc.id}/compose`)}
                  className="flex flex-col justify-between p-5 rounded-xl bg-[#141414] border border-[#252525] hover:border-[#D4AF37]/50 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="w-full h-36 rounded-lg overflow-hidden bg-[#202020] border border-[#333]">
                      <img
                        src={sc.coverImage || 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=400'}
                        alt={sc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                        {sc.name}
                      </h3>
                      {sc.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{sc.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#202020] mt-4">
                    <div className="text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded">
                      I:{countI} • II:{countII} • III:{countIII}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteSoundscapeCategory(sc.id);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB CONTENT: SOUND EFFECTS */}
        {activeTab === 'fx' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFx.map(fx => (
              <div
                key={fx.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-[#141414] border border-[#252525] hover:border-[#A855F7] transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#A855F7]/15 text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">
                      {fx.category}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">{fx.duration}</span>
                  </div>
                  <h4 className="font-serif font-bold text-white text-base group-hover:text-[#A855F7] transition-colors truncate">
                    {fx.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#202020] mt-3">
                  <span className="text-[10px] font-semibold text-neutral-500">
                    {fx.plays || 0} PLAYS
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => playFxPreview(fx.id)}
                      className="p-1.5 text-[#A855F7] hover:bg-[#A855F7]/20 rounded transition-colors"
                      title="Preview FX Audio"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFx(fx);
                        setFxName(fx.name);
                        setFxCategory(fx.category);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#252525] transition-colors"
                      title="Edit Track"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFxTrack(fx.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Soundscape Modal */}
      <Dialog
        isOpen={isAddSoundscapeOpen}
        onClose={() => setIsAddSoundscapeOpen(false)}
        title="Add Soundscape Category"
        footer={
          <>
            <button
              onClick={() => setIsAddSoundscapeOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSoundscapeSubmit}
              disabled={!scName.trim()}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-50 text-black font-semibold text-sm transition-colors"
            >
              Create Category
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSoundscapeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={scName}
              onChange={e => setScName(e.target.value)}
              placeholder="e.g. Meteorological"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={scDesc}
              onChange={e => setScDesc(e.target.value)}
              placeholder="Atmosphere description..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </Dialog>

      {/* Import FX Modal */}
      <Dialog
        isOpen={isImportFxOpen}
        onClose={() => setIsImportFxOpen(false)}
        title="Import FX Track"
        footer={
          <>
            <button
              onClick={() => setIsImportFxOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImportFxSubmit}
              disabled={!fxName.trim()}
              className="px-5 py-2 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              Import FX Track
            </button>
          </>
        }
      >
        <form onSubmit={handleImportFxSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Effect Name *
            </label>
            <input
              type="text"
              required
              value={fxName}
              onChange={e => setFxName(e.target.value)}
              placeholder="e.g. Spell Fireball Blast"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#A855F7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={fxCategory}
              onChange={e => setFxCategory(e.target.value)}
              placeholder="e.g. Magic"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#A855F7]"
            />
          </div>
        </form>
      </Dialog>

      {/* Edit FX Modal */}
      <Dialog
        isOpen={!!editingFx}
        onClose={() => setEditingFx(null)}
        title="Edit FX Track"
        footer={
          <>
            <button
              onClick={() => setEditingFx(null)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditFxSubmit}
              disabled={!fxName.trim()}
              className="px-5 py-2 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              Save Changes
            </button>
          </>
        }
      >
        <form onSubmit={handleEditFxSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Effect Name *
            </label>
            <input
              type="text"
              required
              value={fxName}
              onChange={e => setFxName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#A855F7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={fxCategory}
              onChange={e => setFxCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#A855F7]"
            />
          </div>
        </form>
      </Dialog>
    </AppShell>
  );
};
