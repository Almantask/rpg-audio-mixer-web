import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { Dialog } from '../components/common/Dialog';
import { Plus, Download, Unlink, Sparkles, Music, Play } from 'lucide-react';

export const SessionScenes: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>();
  const navigate = useNavigate();
  const {
    campaigns,
    sessions,
    scenes,
    sessionScenes,
    sceneSoundscapes,
    sceneFxTiles,
    createScene,
    linkSceneToSession,
    unlinkSceneFromSession,
    touchSession
  } = useApp();

  const campaign = campaigns.find(c => c.id === campaignId && !c.deletedAt);
  const session = sessions.find(s => s.id === sessionId && !s.deletedAt);

  const [isNewSceneOpen, setIsNewSceneOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [sceneName, setSceneName] = useState('');
  const [sceneDesc, setSceneDesc] = useState('');
  const [selectedImportIds, setSelectedImportIds] = useState<string[]>([]);

  if (!campaign || !session) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <h2 className="text-2xl font-serif font-bold text-rose-400">Session Not Found</h2>
          <button onClick={() => navigate('/campaigns')} className="mt-4 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg">
            Return to Campaigns
          </button>
        </div>
      </AppShell>
    );
  }

  // Linked scenes
  const linkedSceneRecords = sessionScenes.filter(ss => ss.sessionId === session.id);
  const linkedSceneIds = new Set(linkedSceneRecords.map(ss => ss.sceneId));
  const linkedScenes = scenes.filter(s => linkedSceneIds.has(s.id) && !s.deletedAt);

  // Unlinked available scenes for import
  const unlinkedScenes = scenes.filter(s => !linkedSceneIds.has(s.id) && !s.deletedAt);

  // Most recent played linked scene (Last Active badge)
  const lastPlayedRecord = [...linkedSceneRecords].sort((a, b) => new Date(b.lastPlayedAt || 0).getTime() - new Date(a.lastPlayedAt || 0).getTime())[0];
  const lastActiveSceneId = lastPlayedRecord?.sceneId || linkedScenes[0]?.id;

  const handleCreateAndLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sceneName.trim()) return;
    const newScene = createScene({
      name: sceneName.trim(),
      description: sceneDesc.trim() || undefined
    });
    linkSceneToSession(session.id, newScene.id);
    setSceneName('');
    setSceneDesc('');
    setIsNewSceneOpen(false);
  };

  const handleImportSubmit = () => {
    selectedImportIds.forEach(id => linkSceneToSession(session.id, id));
    setSelectedImportIds([]);
    setIsImportOpen(false);
  };

  const handleOpenScene = (sceneId: string) => {
    touchSession(session.id);
    navigate(`/campaigns/${campaign.id}/sessions/${session.id}/scenes/${sceneId}`);
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Campaign', path: '/campaigns' },
        { label: campaign.title, path: `/campaigns/${campaign.id}/sessions` },
        { label: `Session ${session.sessionNumber}` }
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">{session.name}</h1>
            <p className="text-sm text-neutral-400 mt-1">Scenes associated with Session {session.sessionNumber}.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#222] hover:bg-[#2A2A2A] text-white border border-[#333] text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              Import Scene
            </button>

            <button
              onClick={() => setIsNewSceneOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] text-black font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Scene
            </button>
          </div>
        </div>

        {/* Linked Scenes Stack */}
        <div className="space-y-4">
          {linkedScenes.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#141414] border border-[#252525] space-y-4">
              <p className="text-neutral-400 text-sm">No scenes linked to this session yet.</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#222] text-white text-sm hover:bg-[#333]"
                >
                  Import Scene
                </button>
                <button
                  onClick={() => setIsNewSceneOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black text-sm font-semibold hover:bg-[#E5C14B]"
                >
                  New Scene
                </button>
              </div>
            </div>
          ) : (
            linkedScenes.map(scene => {
              const scCount = sceneSoundscapes.filter(ss => ss.sceneId === scene.id).length;
              const fxCount = sceneFxTiles.filter(tile => tile.sceneId === scene.id).length;
              const isLastActive = scene.id === lastActiveSceneId;

              return (
                <div
                  key={scene.id}
                  onClick={() => handleOpenScene(scene.id)}
                  className="relative flex items-center justify-between p-6 rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#D4AF37]/60 transition-all cursor-pointer group shadow-xl"
                >
                  {/* Cover Background */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={scene.backgroundImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800'}
                      alt={scene.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#0E0E0E]/90 to-[#0E0E0E]/60" />
                  </div>

                  {/* Info Left */}
                  <div className="relative z-10 space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      {isLastActive && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider animate-pulse">
                          <Sparkles className="w-3 h-3" /> Last Active
                        </span>
                      )}
                      {scene.tags && scene.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-bold text-neutral-300 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                      {scene.name}
                    </h3>

                    {scene.description && (
                      <p className="text-xs text-neutral-300 line-clamp-1">{scene.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400">
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

                  {/* Actions Right */}
                  <div className="relative z-10 flex items-center gap-3">
                    <button
                      onClick={() => handleOpenScene(scene.id)}
                      className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Open
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        unlinkSceneFromSession(session.id, scene.id);
                      }}
                      className="p-2 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Unlink from Session"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Scene Dialog */}
      <Dialog
        isOpen={isNewSceneOpen}
        onClose={() => setIsNewSceneOpen(false)}
        title="New Scene (Auto-link to Session)"
        footer={
          <>
            <button
              onClick={() => setIsNewSceneOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAndLink}
              disabled={!sceneName.trim()}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-50 text-black font-semibold text-sm transition-colors"
            >
              Create & Link Scene
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAndLink} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Scene Location Name *
            </label>
            <input
              type="text"
              required
              value={sceneName}
              onChange={e => setSceneName(e.target.value)}
              placeholder="e.g. Underdark Chasm"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={sceneDesc}
              onChange={e => setSceneDesc(e.target.value)}
              placeholder="Atmosphere and notes..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </Dialog>

      {/* Import Scene Dialog */}
      <Dialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import Existing Scene to Session"
        footer={
          <>
            <button
              onClick={() => setIsImportOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImportSubmit}
              disabled={selectedImportIds.length === 0}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-50 text-black font-semibold text-sm transition-colors"
            >
              Import Selected ({selectedImportIds.length})
            </button>
          </>
        }
      >
        {unlinkedScenes.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4">All available global scenes are already linked to this session.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {unlinkedScenes.map(sc => {
              const isChecked = selectedImportIds.includes(sc.id);
              return (
                <div
                  key={sc.id}
                  onClick={() => {
                    setSelectedImportIds(prev =>
                      isChecked ? prev.filter(id => id !== sc.id) : [...prev, sc.id]
                    );
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                      : 'bg-[#181818] border-[#2A2A2A] text-neutral-300 hover:bg-[#202020]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="accent-[#D4AF37] w-4 h-4 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-sm">{sc.name}</span>
                    {sc.description && <p className="text-xs text-neutral-500 truncate">{sc.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Dialog>
    </AppShell>
  );
};
