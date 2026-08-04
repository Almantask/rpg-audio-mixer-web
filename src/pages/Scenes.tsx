import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { Dialog } from '../components/common/Dialog';
import { Search, Plus, Edit2, Copy, Trash2, Music, Sparkles } from 'lucide-react';
import type { Scene } from '../types';

export const Scenes: React.FC = () => {
  const navigate = useNavigate();
  const { scenes, sceneSoundscapes, sceneFxTiles, createScene, updateScene, duplicateScene, deleteScene } = useApp();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const activeScenes = scenes.filter(s => !s.deletedAt);
  const filteredScenes = activeScenes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.tags && s.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    createScene({
      name: name.trim(),
      description: description.trim() || undefined,
      backgroundImage: backgroundImage.trim() || undefined,
      tags
    });
    setName('');
    setDescription('');
    setBackgroundImage('');
    setTagsInput('');
    setIsCreateOpen(false);
    // Stay on Scenes list per PW-31 recommendation
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScene || !name.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    updateScene(editingScene.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      backgroundImage: backgroundImage.trim() || undefined,
      tags
    });
    setEditingScene(null);
    setName('');
    setDescription('');
    setBackgroundImage('');
    setTagsInput('');
  };

  const openEdit = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingScene(scene);
    setName(scene.name);
    setDescription(scene.description || '');
    setBackgroundImage(scene.backgroundImage || '');
    setTagsInput((scene.tags || []).join(', '));
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateScene(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScene(id);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">Scenes</h1>
          <p className="text-sm text-neutral-400 mt-1">Curate and manage your immersive environments.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scenes..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#141414] border border-[#262626] text-white text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm"
          />
        </div>

        {/* Scenes List Stack */}
        <div className="space-y-4">
          {filteredScenes.map(scene => {
            const scCount = sceneSoundscapes.filter(ss => ss.sceneId === scene.id).length;
            const fxCount = sceneFxTiles.filter(tile => tile.sceneId === scene.id).length;

            return (
              <div
                key={scene.id}
                onClick={() => navigate(`/scenes/${scene.id}`)}
                className="relative flex items-center justify-between p-6 rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#D4AF37]/60 transition-all cursor-pointer group shadow-xl"
              >
                {/* Background Image with Dark Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={scene.backgroundImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800'}
                    alt={scene.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#0E0E0E]/90 to-[#0E0E0E]/60" />
                </div>

                {/* Content Left */}
                <div className="relative z-10 space-y-2 max-w-xl">
                  {scene.tags && scene.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      {scene.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-2xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                    {scene.name}
                  </h3>

                  {scene.description && (
                    <p className="text-xs text-neutral-300 line-clamp-1">
                      {scene.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {scCount} SC
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
                      {fxCount} FX
                    </span>
                  </div>
                </div>

                {/* Action Icons Right */}
                <div className="relative z-10 flex items-center gap-2">
                  <button
                    onClick={e => openEdit(scene, e)}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#252525] transition-colors"
                    title="Edit Scene"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={e => handleDuplicate(scene.id, e)}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#252525] transition-colors"
                    title="Duplicate Scene"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={e => handleDelete(scene.id, e)}
                    className="p-2 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Scene Dashed Row Card */}
          <div
            onClick={() => {
              setName('');
              setDescription('');
              setBackgroundImage('');
              setTagsInput('');
              setIsCreateOpen(true);
            }}
            className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[#333333] hover:border-[#D4AF37]/60 bg-[#121212]/50 hover:bg-[#161616] text-neutral-400 hover:text-[#D4AF37] transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#202020] group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-current transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">New Scene</span>
          </div>
        </div>
      </div>

      {/* New Scene Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Scene"
        footer={
          <>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSubmit}
              disabled={!name.trim()}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-50 text-black font-semibold text-sm transition-colors"
            >
              Create Scene
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Scene Location Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dragon's Lair"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the atmosphere..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Category Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. COMBAT, BOSS, CAVE"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Background Image URL (optional)
            </label>
            <input
              type="url"
              value={backgroundImage}
              onChange={e => setBackgroundImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </Dialog>

      {/* Edit Scene Dialog */}
      <Dialog
        isOpen={!!editingScene}
        onClose={() => setEditingScene(null)}
        title="Edit Scene"
        footer={
          <>
            <button
              onClick={() => setEditingScene(null)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={!name.trim()}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-50 text-black font-semibold text-sm transition-colors"
            >
              Save Changes
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Scene Location Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Category Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </Dialog>
    </AppShell>
  );
};
