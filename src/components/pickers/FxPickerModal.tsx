import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Dialog } from '../common/Dialog';
import { Search, Play, Check } from 'lucide-react';

interface FxPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneId: string;
}

export const FxPickerModal: React.FC<FxPickerModalProps> = ({ isOpen, onClose, sceneId }) => {
  const { fxTracks, addFxToScene, playFxPreview } = useApp();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter non-deleted FX
  const activeFx = fxTracks.filter(f => !f.deletedAt);
  const filteredFx = activeFx.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCommit = () => {
    if (selectedIds.length === 0) return;
    addFxToScene(sceneId, selectedIds);
    setSelectedIds([]);
    // Modal STAYS OPEN after commit per PW-26
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Sound Effect Tile"
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
            className="px-5 py-2 rounded-lg bg-[#A855F7] hover:bg-[#B56D5F7] disabled:opacity-40 text-white font-semibold text-sm transition-colors flex items-center gap-2"
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
            placeholder="Filter effects by name or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2D2D2D] text-white text-sm focus:outline-none focus:border-[#A855F7]"
          />
        </div>

        {/* Multi-select List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredFx.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">No effects match your filters.</p>
          ) : (
            filteredFx.map(fx => {
              const isSelected = selectedIds.includes(fx.id);

              return (
                <div
                  key={fx.id}
                  onClick={() => toggleSelect(fx.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#A855F7]/15 border-[#A855F7] text-white'
                      : 'bg-[#161616] border-[#252525] text-neutral-300 hover:bg-[#1D1D1D]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-[#A855F7] w-4 h-4 rounded"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-sm truncate block">{fx.name}</span>
                      <span className="text-xs text-neutral-500">{fx.category} • {fx.duration}</span>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      playFxPreview(fx.id);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#252525] transition-colors"
                    title="Preview FX Audio"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
};
