import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { Dialog } from '../components/common/Dialog';
import { Plus, Edit2, Trash2, Calendar, Film, Sparkles } from 'lucide-react';
import type { Session } from '../types';

export const CampaignSessions: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { campaigns, sessions, sessionScenes, createSession, updateSession, deleteSession } = useApp();

  const campaign = campaigns.find(c => c.id === campaignId && !c.deletedAt);
  const activeSessions = sessions.filter(s => s.campaignId === campaignId && !s.deletedAt);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<Session | null>(null);

  const [sessionName, setSessionName] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');

  if (!campaign) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <h2 className="text-2xl font-serif font-bold text-rose-400">Campaign Not Found</h2>
          <button onClick={() => navigate('/campaigns')} className="mt-4 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg">
            Return to Campaigns
          </button>
        </div>
      </AppShell>
    );
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    createSession({
      campaignId: campaign.id,
      name: sessionName.trim(),
      description: sessionDesc.trim() || undefined
    });
    setSessionName('');
    setSessionDesc('');
    setIsCreateOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !sessionName.trim()) return;
    updateSession(editingSession.id, {
      name: sessionName.trim(),
      description: sessionDesc.trim() || undefined
    });
    setEditingSession(null);
    setSessionName('');
    setSessionDesc('');
  };

  const openEdit = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSession(session);
    setSessionName(session.name);
    setSessionDesc(session.description || '');
  };

  const openDeleteConfirm = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmSession(session);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmSession) {
      deleteSession(deleteConfirmSession.id);
      setDeleteConfirmSession(null);
    }
  };

  // Find most recent active session
  const lastActiveSessionId = [...activeSessions].sort((a, b) => (new Date(b.lastActive || 0).getTime()) - (new Date(a.lastActive || 0).getTime()))[0]?.id;

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Campaigns', path: '/campaigns' },
        { label: campaign.title }
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">{campaign.title}</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mt-1">Campaign Sessions</p>
        </div>

        {/* Campaign Hero Banner Card */}
        <div className="relative rounded-2xl overflow-hidden h-48 border border-[#2D2D2D] shadow-xl group">
          <img
            src={campaign.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200'}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-2xl font-serif font-bold text-white">{campaign.title}</h2>
            {campaign.description && (
              <p className="text-sm text-neutral-300 line-clamp-1 max-w-2xl mt-1">{campaign.description}</p>
            )}
          </div>
        </div>

        {/* Session Cards (2-column responsive grid) */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSessions.map(session => {
              const linkedScenesCount = sessionScenes.filter(ss => ss.sessionId === session.id).length;
              const isLastActive = session.id === lastActiveSessionId;

              return (
                <div
                  key={session.id}
                  onClick={() => navigate(`/campaigns/${campaign.id}/sessions/${session.id}/scenes`)}
                  className="relative flex flex-col justify-between p-5 rounded-xl bg-[#141414] border border-[#252525] hover:border-[#D4AF37]/50 transition-all cursor-pointer group shadow-lg"
                >
                  {/* Top row badge & controls */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#222222] border border-[#333] text-xs font-bold text-[#D4AF37]">
                        Session {session.sessionNumber}
                      </span>
                      {isLastActive && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] animate-pulse">
                          <Sparkles className="w-3 h-3" /> Last Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => openEdit(session, e)}
                        className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#252525] transition-colors"
                        title="Edit Session"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => openDeleteConfirm(session, e)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Session Title & Description */}
                  <div className="space-y-1.5 my-2">
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                      {session.name}
                    </h3>
                    {session.description && (
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {session.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 pt-3 border-t border-[#202020] mt-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {session.date || 'No date'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-neutral-400" />
                      {linkedScenesCount} {linkedScenesCount === 1 ? 'Scene' : 'Scenes'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Session Dashed Card */}
          <div
            onClick={() => {
              setSessionName('');
              setSessionDesc('');
              setIsCreateOpen(true);
            }}
            className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[#333333] hover:border-[#D4AF37]/60 bg-[#121212]/50 hover:bg-[#161616] text-neutral-400 hover:text-[#D4AF37] transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#202020] group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-current transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">Add New Session</span>
          </div>
        </div>
      </div>

      {/* Create Session Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Session"
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
              disabled={!sessionName.trim()}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-50 text-black font-semibold text-sm transition-colors"
            >
              Add Session
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Session Name *
            </label>
            <input
              type="text"
              required
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              placeholder="e.g. The Howling Crags"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={sessionDesc}
              onChange={e => setSessionDesc(e.target.value)}
              placeholder="Brief summary of session goals..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title="Edit Session"
        footer={
          <>
            <button
              onClick={() => setEditingSession(null)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={!sessionName.trim()}
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
              Session Name *
            </label>
            <input
              type="text"
              required
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={sessionDesc}
              onChange={e => setSessionDesc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteConfirmSession}
        onClose={() => setDeleteConfirmSession(null)}
        title="Move Session to Trash?"
        footer={
          <>
            <button
              onClick={() => setDeleteConfirmSession(null)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors"
            >
              Move to Trash
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-300">
          Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirmSession?.name}"</span>? It can be restored from the Trash within 7 days.
        </p>
      </Dialog>
    </AppShell>
  );
};
