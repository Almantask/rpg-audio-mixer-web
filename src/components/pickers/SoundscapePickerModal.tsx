import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Dialog } from '../common/Dialog';
import { Search, Check } from 'lucide-react';

interface SoundscapePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneId: string;
}

export const SoundscapePickerModal: React.FC<SoundscapePickerModalProps> = ({ isOpen, onClose, sceneId }) => {
  const { soundscapeCategories, sceneSoundscapes, addSoundscapesToScene } = useApp();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeCategories = soundscapeCategories.filter(sc => !sc.deletedAt);
  const existingSceneCategoryIds = new Set(
    sceneSoundscapes.filter(ss => ss.sceneId === sceneId).map(ss => ss.categoryId)
  );

  const filteredCategories = activeCategories.filter(sc =>
    sc.name.toLowerCase().includes(search.toLowerCase()) ||
    (sc.description && sc.description.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCommit = () => {
    if (selectedIds.length === 0) return;
    addSoundscapesToScene(sceneId, selectedIds);
    setSelectedIds([]);
    // Modal STAYS OPEN after commit per PW-26
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Soundscape Category"
      maxWidth="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleCommit}
            disabled={selectedIds.length === 0}
            className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-40 text-black font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Add Selected ({selectedIds.length})
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter soundscape categories..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2D2D2D] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Multi-select List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredCategories.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">No compositions match your filters.</p>
          ) : (
            filteredCategories.map(sc => {
              const isAlreadyAdded = existingSceneCategoryIds.has(sc.id);
              const isSelected = selectedIds.includes(sc.id);

              return (
                <div
                  key={sc.id}
                  onClick={() => !isAlreadyAdded && toggleSelect(sc.id)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isAlreadyAdded
                      ? 'bg-[#121212] border-[#222222] opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                      : 'bg-[#161616] border-[#252525] text-neutral-300 hover:bg-[#1D1D1D]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      disabled={isAlreadyAdded}
                      checked={isSelected || isAlreadyAdded}
                      onChange={() => {}}
                      className="accent-[#D4AF37] w-4 h-4 rounded"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-sm truncate block text-white">{sc.name}</span>
                      {sc.description && <span className="text-xs text-neutral-400 line-clamp-1">{sc.description}</span>}
                    </div>
                  </div>

                  {isAlreadyAdded && (
                    <span className="text-xs font-semibold text-neutral-500 bg-[#222] px-2 py-0.5 rounded">
                      Added
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
};
