import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { Dialog } from '../components/common/Dialog';
import { Trash2, RotateCcw, AlertTriangle, Clock, CheckSquare, Square } from 'lucide-react';
import type { EntityType } from '../types';

export const Trash: React.FC = () => {
  const { trashItems, restoreTrashItem, purgeTrashItem, emptyTrashTab, restoreAllTrashTab } = useApp();

  const [activeTab, setActiveTab] = useState<EntityType>('campaign');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEmptyConfirmOpen, setIsEmptyConfirmOpen] = useState<boolean>(false);

  const tabItems = trashItems.filter(i => i.type === activeTab);

  const tabs: { type: EntityType; label: string }[] = [
    { type: 'campaign', label: 'Campaigns' },
    { type: 'session', label: 'Sessions' },
    { type: 'scene', label: 'Scenes' },
    { type: 'soundscape', label: 'Soundscapes' },
    { type: 'fx', label: 'FX' }
  ];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === tabItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tabItems.map(i => i.id));
    }
  };

  const handleRestoreSelected = () => {
    selectedIds.forEach(id => restoreTrashItem(id));
    setSelectedIds([]);
  };

  const handleConfirmEmpty = () => {
    emptyTrashTab(activeTab);
    setSelectedIds([]);
    setIsEmptyConfirmOpen(false);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">Trash</h1>
            <p className="text-sm text-neutral-400 mt-1">Soft-deleted items are retained for 7 days before permanent cleanup.</p>
          </div>

          {tabItems.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => restoreAllTrashTab(activeTab)}
                className="px-4 py-2 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-white border border-[#333] text-sm font-semibold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                Restore All
              </button>

              <button
                onClick={() => setIsEmptyConfirmOpen(true)}
                className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-sm font-semibold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Empty {tabs.find(t => t.type === activeTab)?.label}
              </button>
            </div>
          )}
        </div>

        {/* Tab Strip (Campaigns, Sessions, Scenes, Soundscapes, FX) */}
        <div className="flex items-center gap-2 border-b border-[#252525] pb-2 overflow-x-auto">
          {tabs.map(t => {
            const count = trashItems.filter(i => i.type === t.type).length;
            const active = activeTab === t.type;

            return (
              <button
                key={t.type}
                onClick={() => {
                  setActiveTab(t.type);
                  setSelectedIds([]);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 shrink-0 ${
                  active
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#222222]'
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#252525] text-neutral-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Header for Selection */}
        {tabItems.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#141414] border border-[#222222]">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white"
            >
              {selectedIds.length === tabItems.length ? (
                <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <Square className="w-4 h-4 text-neutral-500" />
              )}
              Select All ({tabItems.length})
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleRestoreSelected}
                className="px-3 py-1 rounded bg-[#D4AF37] text-black font-semibold text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Restore Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* Tab Items List */}
        {tabItems.length === 0 ? (
          <div className="p-16 text-center rounded-xl bg-[#141414] border border-[#252525] space-y-3">
            <Trash2 className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-neutral-300">Trash is empty</h3>
            <p className="text-xs text-neutral-500">No soft-deleted {tabs.find(t => t.type === activeTab)?.label.toLowerCase()} found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tabItems.map(item => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50'
                      : 'bg-[#141414] border-[#252525] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-white text-base truncate">{item.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                        <span className="flex items-center gap-1 text-[#D4AF37]">
                          <Clock className="w-3 h-3" /> 7 days left
                        </span>
                        <span>•</span>
                        <span>Deleted {new Date(item.deletedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => restoreTrashItem(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-white border border-[#333] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Restore item"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Restore
                    </button>

                    <button
                      onClick={() => purgeTrashItem(item.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty Trash Confirmation Dialog */}
      <Dialog
        isOpen={isEmptyConfirmOpen}
        onClose={() => setIsEmptyConfirmOpen(false)}
        title={`Permanently Purge ${tabs.find(t => t.type === activeTab)?.label}?`}
        footer={
          <>
            <button
              onClick={() => setIsEmptyConfirmOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmEmpty}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors"
            >
              Empty Trash
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>This action cannot be undone. All items in the {tabs.find(t => t.type === activeTab)?.label} tab will be permanently removed.</p>
        </div>
      </Dialog>
    </AppShell>
  );
};
