import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Dialog } from '../common/Dialog';
import { Search, Plus, Check } from 'lucide-react';

interface ComposerTrackPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  level: 'I' | 'II' | 'III';
}

export const ComposerTrackPickerModal: React.FC<ComposerTrackPickerModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  level
}) => {
  const { categoryTracks, assignTrackToLevel } = useApp();

  const [search, setSearch] = useState('');
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [isImportMode, setIsImportMode] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');

  // Level tracks already assigned to this level
  const existingLevelTrackNames = new Set(
    categoryTracks.filter(t => t.categoryId === categoryId && t.level === level).map(t => t.name.toLowerCase())
  );

  // Suggested library track candidates
  const sampleTracks = [
    { name: 'Gentle Rain Drizzle', format: 'MP3', duration: '3:42' },
    { name: 'Distant Rolling Thunder', format: 'WAV', duration: '2:15' },
    { name: 'Heavy Downpour & Gusts', format: 'MP3', duration: '4:10' },
    { name: 'Violent Tempest & Lightning Strike', format: 'WAV', duration: '5:01' },
    { name: 'Muffled Hearth & Low Chatter', format: 'MP3', duration: '2:50' },
    { name: 'Lively Crowd & Clinking Mugs', format: 'MP3', duration: '3:30' },
    { name: 'Ethereal Drone Resonance', format: 'WAV', duration: '4:45' }
  ];

  const filteredCandidates = sampleTracks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name: string) => {
    setSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleCommit = () => {
    selectedNames.forEach(name => {
      assignTrackToLevel({
        categoryId,
        level,
        name,
        duration: '3:15',
        fileFormat: 'MP3'
      });
    });
    setSelectedNames([]);
    onClose();
  };

  const handleImportNewTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;
    assignTrackToLevel({
      categoryId,
      level,
      name: newTrackName.trim(),
      duration: '3:00',
      fileFormat: 'WAV'
    });
    setNewTrackName('');
    setIsImportMode(false);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Track to Level ${level}`}
      maxWidth="lg"
      footer={
        <>
          <button
            onClick={() => setIsImportMode(prev => !prev)}
            className="px-3.5 py-2 rounded-lg text-sm bg-[#222] hover:bg-[#333] text-white border border-[#333] mr-auto flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            {isImportMode ? 'Browse Library' : 'Import New Track'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors"
          >
            Cancel
          </button>
          {!isImportMode && (
            <button
              onClick={handleCommit}
              disabled={selectedNames.length === 0}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] disabled:opacity-40 text-black font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Add Selected ({selectedNames.length})
            </button>
          )}
        </>
      }
    >
      {isImportMode ? (
        <form onSubmit={handleImportNewTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Track Name *
            </label>
            <input
              type="text"
              required
              value={newTrackName}
              onChange={e => setNewTrackName(e.target.value)}
              placeholder="e.g. Whispering Winds"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1C1C1C] border border-[#333] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <button
            type="submit"
            disabled={!newTrackName.trim()}
            className="w-full py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C14B] text-black font-semibold text-sm transition-colors"
          >
            Import Track to Level {level}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter track catalogue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2D2D2D] text-white text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredCandidates.map(track => {
              const isDuplicate = existingLevelTrackNames.has(track.name.toLowerCase());
              const isSelected = selectedNames.includes(track.name);

              return (
                <div
                  key={track.name}
                  onClick={() => !isDuplicate && toggleSelect(track.name)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isDuplicate
                      ? 'bg-[#121212] border-[#222222] opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                      : 'bg-[#161616] border-[#252525] text-neutral-300 hover:bg-[#1D1D1D]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      disabled={isDuplicate}
                      checked={isSelected || isDuplicate}
                      onChange={() => {}}
                      className="accent-[#D4AF37] w-4 h-4 rounded"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-sm truncate block">{track.name}</span>
                      <span className="text-xs text-neutral-500">{track.format} • {track.duration}</span>
                    </div>
                  </div>

                  {isDuplicate && (
                    <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                      In Level {level}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Dialog>
  );
};
