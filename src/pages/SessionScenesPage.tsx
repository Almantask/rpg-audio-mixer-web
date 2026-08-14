import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCampaignById } from '../services/campaignService'
import { getSessionById } from '../services/sessionService'
import {
  getScenesForSession,
  createScene,
  duplicateScene,
  updateScene,
  unlinkSceneFromSession,
  importScenesToSession,
  getActiveScenes,
} from '../services/sceneService'
import { getLastPlayedSceneId } from '../services/storageService'
import type { Campaign, Session } from '../types/campaign'
import type { Scene } from '../types/scene'
import { Plus, Download, Edit2, Copy, Trash2, Sparkles, X, ChevronRight } from 'lucide-react'

export const SessionScenesPage: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined)
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [sessionScenes, setSessionScenes] = useState<Scene[]>([])
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null)

  // Dialogs
  const [isNewSceneOpen, setIsNewSceneOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [unlinkingScene, setUnlinkingScene] = useState<Scene | null>(null)

  // Form states
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [bgInput, setBgInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Import selection
  const [selectedImportIds, setSelectedImportIds] = useState<string[]>([])

  const refreshData = () => {
    if (!campaignId || !sessionId) return
    setCampaign(getCampaignById(campaignId))
    setSession(getSessionById(sessionId))
    setSessionScenes(getScenesForSession(sessionId))
    setLastPlayedId(getLastPlayedSceneId())
  }

  useEffect(() => {
    refreshData()
  }, [campaignId, sessionId])

  if (!campaign || !session) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-8 text-center">
        <h1 className="text-2xl font-serif text-amber-400">Session not found</h1>
        <Link to="/campaigns" className="text-amber-500 hover:underline text-sm">
          Return to Campaigns
        </Link>
      </div>
    )
  }

  // Sort scenes: Last Active scene first, then remaining
  const sortedScenes = [...sessionScenes].sort((a, b) => {
    if (a.id === lastPlayedId) return -1
    if (b.id === lastPlayedId) return 1
    const timeA = a.lastPlayedAt || a.updatedAt || a.createdAt
    const timeB = b.lastPlayedAt || b.updatedAt || b.createdAt
    return new Date(timeB).getTime() - new Date(timeA).getTime()
  })

  // Global scenes available for import (excluding already linked)
  const allGlobalScenes = getActiveScenes()
  const availableImportScenes = allGlobalScenes.filter(
    (gSc) => !sessionScenes.some((sSc) => sSc.id === gSc.id)
  )

  const handleNewSceneCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim()) {
      setErrorMsg('Scene name is required')
      return
    }
    createScene({
      name: nameInput,
      description: descInput,
      backgroundUrl: bgInput,
      sessionId: session.id,
    })
    resetForm()
    setIsNewSceneOpen(false)
    refreshData()
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene || !nameInput.trim()) {
      setErrorMsg('Scene name is required')
      return
    }
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0)

    updateScene(editingScene.id, {
      name: nameInput,
      description: descInput,
      backgroundUrl: bgInput,
      tags: tagsArray,
    })
    resetForm()
    setIsEditOpen(false)
    setEditingScene(null)
    refreshData()
  }

  const handleDuplicate = (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateScene(sceneId, session.id)
    refreshData()
  }

  const confirmUnlink = () => {
    if (unlinkingScene) {
      unlinkSceneFromSession(unlinkingScene.id, session.id)
      setUnlinkingScene(null)
      refreshData()
    }
  }

  const handleImportSubmit = () => {
    if (selectedImportIds.length > 0) {
      importScenesToSession(selectedImportIds, session.id)
      setSelectedImportIds([])
      setIsImportOpen(false)
      refreshData()
    }
  }

  const toggleImportSelect = (sceneId: string) => {
    if (selectedImportIds.includes(sceneId)) {
      setSelectedImportIds(selectedImportIds.filter((id) => id !== sceneId))
    } else {
      setSelectedImportIds([...selectedImportIds, sceneId])
    }
  }

  const resetForm = () => {
    setNameInput('')
    setDescInput('')
    setBgInput('')
    setTagsInput('')
    setErrorMsg('')
  }

  const openEditModal = (sc: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingScene(sc)
    setNameInput(sc.name)
    setDescInput(sc.description || '')
    setBgInput(sc.backgroundUrl || '')
    setTagsInput(sc.tags ? sc.tags.join(', ') : '')
    setIsEditOpen(true)
  }

  const openUnlinkModal = (sc: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setUnlinkingScene(sc)
  }

  const handleRowClick = (scene: Scene) => {
    navigate(`/scenes/${scene.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-stone-400">
        <Link to="/campaigns" className="hover:text-amber-400 transition-colors">
          CAMPAIGN
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <Link to={`/campaigns/${campaign.id}/sessions`} className="hover:text-amber-400 transition-colors">
          {campaign.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <span className="text-amber-400">SESSION {session.sessionNumber}</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">
          Session {session.sessionNumber} – {session.name}
        </h1>
        <p className="text-stone-400 text-sm mt-1">Session Scenes</p>
      </div>

      {/* Scene Rows */}
      <div className="space-y-3">
        {sortedScenes.length === 0 ? (
          <div className="text-center py-10 space-y-2 bg-stone-900/30 rounded-xl border border-dashed border-stone-800">
            <h2 className="font-serif text-xl text-amber-400">No scenes in this session yet</h2>
            <p className="text-stone-400 text-sm">Create a new scene or import an existing scene below.</p>
          </div>
        ) : (
          sortedScenes.map((sc) => {
            const isLastActive = sc.id === lastPlayedId
            const soundscapeCount = sc.soundscapeCategories?.length || 0
            const fxCount = sc.soundboardEffects?.length || 0

            return (
              <div
                key={sc.id}
                onClick={() => handleRowClick(sc)}
                className="relative rounded-xl border border-amber-900/30 overflow-hidden bg-stone-900 p-4 cursor-pointer hover:border-amber-600/50 transition-all flex items-center justify-between gap-4 group"
              >
                {/* Background Image / Overlay */}
                {sc.backgroundUrl && (
                  <img
                    src={sc.backgroundUrl}
                    alt={sc.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/90 to-transparent z-0" />

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {isLastActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                        <Sparkles className="w-3 h-3" /> LAST ACTIVE
                      </span>
                    )}
                    {sc.tags &&
                      sc.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                  </div>

                  <h2 className="font-serif text-xl font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {sc.name}
                  </h2>

                  <div className="text-xs text-stone-400 font-sans font-medium flex items-center gap-2">
                    <span>{soundscapeCount} SC</span>
                    <span>·</span>
                    <span>{fxCount} FX</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative z-10 flex items-center gap-1 bg-[#121212]/80 backdrop-blur border border-stone-800 rounded-lg p-1">
                  <button
                    type="button"
                    aria-label={`Edit scene ${sc.name}`}
                    onClick={(e) => openEditModal(sc, e)}
                    className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Duplicate scene ${sc.name}`}
                    onClick={(e) => handleDuplicate(sc.id, e)}
                    className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-amber-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Unlink scene ${sc.name}`}
                    onClick={(e) => openUnlinkModal(sc, e)}
                    className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* Bottom Action CTAs: New Scene (left) + Import Scene (right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              resetForm()
              setIsNewSceneOpen(true)
            }}
            className="py-4 border-2 border-dashed border-amber-900/40 hover:border-amber-600/60 rounded-xl bg-stone-900/20 hover:bg-stone-900/40 text-amber-400 flex items-center justify-center gap-2 font-medium text-sm transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Scene</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedImportIds([])
              setIsImportOpen(true)
            }}
            className="py-4 border-2 border-dashed border-amber-900/40 hover:border-amber-600/60 rounded-xl bg-stone-900/20 hover:bg-stone-900/40 text-amber-400 flex items-center justify-center gap-2 font-medium text-sm transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Import Scene</span>
          </button>
        </div>
      </div>

      {/* New Scene Dialog Modal */}
      {isNewSceneOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="new-scene-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="new-scene-title" className="font-serif text-xl font-bold text-amber-400">New Scene</h2>
              <button type="button" onClick={() => setIsNewSceneOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewSceneCreate} className="space-y-4">
              {errorMsg && <div className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">{errorMsg}</div>}

              <div>
                <label htmlFor="session-scene-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Scene Name (Location) *
                </label>
                <input
                  id="session-scene-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Frostwind Pass"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="session-scene-desc" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="session-scene-desc"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Optional scene details..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="session-scene-bg" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Background Image URL
                </label>
                <input
                  id="session-scene-bg"
                  type="text"
                  value={bgInput}
                  onChange={(e) => setBgInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsNewSceneOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm">
                  Create Scene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Scene Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="import-scene-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="import-scene-title" className="font-serif text-xl font-bold text-amber-400">Import Scene</h2>
              <button type="button" onClick={() => setIsImportOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {availableImportScenes.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-stone-300 text-sm font-medium">All scenes are already in this session.</p>
                <p className="text-stone-500 text-xs">Create a new scene instead.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availableImportScenes.map((sc) => {
                  const isSelected = selectedImportIds.includes(sc.id)
                  return (
                    <div
                      key={sc.id}
                      onClick={() => toggleImportSelect(sc.id)}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 text-stone-100'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="font-medium text-sm">{sc.name}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by row click
                        className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800">
              <button type="button" onClick={() => setIsImportOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                Cancel
              </button>
              {availableImportScenes.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  disabled={selectedImportIds.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import Selected ({selectedImportIds.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Scene Dialog */}
      {isEditOpen && editingScene && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="edit-scene-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="edit-scene-title" className="font-serif text-xl font-bold text-amber-400">Edit Scene</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {errorMsg && <div className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">{errorMsg}</div>}

              <div>
                <label htmlFor="session-edit-scene-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Scene Name *
                </label>
                <input
                  id="session-edit-scene-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="session-edit-scene-tags" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  id="session-edit-scene-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. COMBAT, FOREST"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="session-edit-scene-desc" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="session-edit-scene-desc"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Unlink AlertDialog */}
      {unlinkingScene && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="alertdialog" aria-labelledby="unlink-dialog-title" aria-describedby="unlink-dialog-desc" className="bg-[#141414] border border-amber-900/50 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 id="unlink-dialog-title" className="font-serif text-xl font-bold text-amber-400">
              Unlink Scene?
            </h2>
            <p id="unlink-dialog-desc" className="text-stone-300 text-sm">
              Remove <strong>{unlinkingScene.name}</strong> from this session? The global scene will not be deleted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnlinkingScene(null)}
                className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnlink}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm"
              >
                Unlink Scene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
