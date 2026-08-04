import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { Dialog } from '../components/common/Dialog';
import { Plus, Trash2, Play } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, sessions, createCampaign, deleteCampaign } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const activeCampaigns = campaigns.filter(c => !c.deletedAt);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newCamp = createCampaign({
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage.trim() || undefined
    });
    setTitle('');
    setDescription('');
    setCoverImage('');
    setIsCreateOpen(false);
    navigate(`/campaigns/${newCamp.id}/sessions`);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">Active Campaigns</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage your campaigns.</p>
        </div>

        {/* Campaign Cards Stack */}
        <div className="space-y-4">
          {activeCampaigns.map(campaign => {
            const campSessions = sessions.filter(s => s.campaignId === campaign.id && !s.deletedAt);
            const sessionCount = campSessions.length;
            const ctaLabel = sessionCount > 0 ? 'Resume' : 'Start';

            return (
              <div
                key={campaign.id}
                className="flex items-center gap-6 p-5 rounded-xl bg-[#141414] border border-[#252525] hover:border-[#383838] transition-all group"
              >
                {/* Cover Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#202020] border border-[#333]">
                  <img
                    src={campaign.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400'}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xl font-serif font-bold text-[#D4AF37] truncate">
                    {campaign.title}
                  </h3>
                  {campaign.description && (
                    <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 font-medium">
                    {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => navigate(`/campaigns/${campaign.id}/sessions`)}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C14B] hover:to-[#C4A030] text-black font-semibold text-sm shadow-md flex items-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    {ctaLabel}
                  </button>

                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-2.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Create Campaign Card */}
          <div
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[#333333] hover:border-[#D4AF37]/60 bg-[#121212]/50 hover:bg-[#161616] text-neutral-400 hover:text-[#D4AF37] transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#202020] group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-current transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">Create Campaign</span>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Campaign"
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
              disabled={!title.trim()}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-50 text-black font-semibold text-sm transition-colors"
            >
              Create Campaign
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Shadows of the Underdark"
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
              placeholder="Brief summary of the campaign premise..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </Dialog>
    </AppShell>
  );
};
