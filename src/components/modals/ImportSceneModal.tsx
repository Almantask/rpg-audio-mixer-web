import React, { useState } from 'react'
import { Dialog } from '../common/Dialog'
import { useApp } from '../../context/AppContext'
import { Image as ImageIcon } from 'lucide-react'

interface ImportSceneModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
}

export const ImportSceneModal: React.FC<ImportSceneModalProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const { scenes, sessions, importScenesToSession } = useApp()
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([])

  if (!isOpen) return null

  const session = sessions.find((s) => s.id === sessionId)
  const currentLinkedIds = session?.sceneIds ?? []

  // Filter global scenes not in current session
  const availableScenes = scenes.filter((sc) => !currentLinkedIds.includes(sc.id))

  const toggleSelect = (id: string) => {
    setSelectedSceneIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleImport = () => {
    if (selectedSceneIds.length === 0) return
    importScenesToSession(sessionId, selectedSceneIds)
    setSelectedSceneIds([])
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import Scene"
      subtitle="Select existing global scenes to link to this session."
      maxWidth="max-w-2xl"
    >
      {availableScenes.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon size={40} className="mx-auto mb-2 text-gray-500" />
          <p className="font-semibold text-gray-300">All scenes are already in this session.</p>
          <p className="text-xs text-gray-500 mt-1">
            Create a new scene using the "New Scene" button on the Session Scenes page.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {availableScenes.map((sc) => {
            const isSelected = selectedSceneIds.includes(sc.id)
            return (
              <div
                key={sc.id}
                onClick={() => toggleSelect(sc.id)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-yellow-900/20 bg-[#1A1A1A] hover:border-yellow-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent div
                    className="w-5 h-5 accent-yellow-500"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-yellow-500">{sc.name}</h4>
                    <p className="text-xs text-gray-400">
                      {sc.soundscapeCategories.length} SC · {sc.soundboardTiles.length} FX
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {availableScenes.length > 0 && (
        <div className="flex justify-end gap-3 pt-4 border-t border-yellow-900/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={selectedSceneIds.length === 0}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            Import Selected ({selectedSceneIds.length})
          </button>
        </div>
      )}
    </Dialog>
  )
}
