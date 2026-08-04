import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Lock, Unlock, Square } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/common/Badge'
import { ActiveSceneSoundscapesTab } from '../components/active-scene/ActiveSceneSoundscapesTab'
import { ActiveSceneSoundboardTab } from '../components/active-scene/ActiveSceneSoundboardTab'
import { audioEngine } from '../utils/audioEngine'

export const ActiveSceneView: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>()
  const navigate = useNavigate()

  const { scenes, sessionLock, setSessionLock } = useApp()
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundscapes')

  const scene = scenes.find((s) => s.id === sceneId)
  if (!scene) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Scene not found.{' '}
        <button onClick={() => navigate('/scenes')} className="text-amber-400 underline">
          Go back to Scenes
        </button>
      </div>
    )
  }

  const handleStopAll = () => {
    audioEngine.stopAll()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Context Badge & Header Actions */}
      <div className="flex items-center justify-between">
        <Badge variant="gold">ACTIVE SCENE</Badge>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleStopAll}
            className="px-3.5 py-1.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 hover:bg-red-900 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop All</span>
          </button>

          <button
            onClick={() => setSessionLock(!sessionLock)}
            aria-label="Toggle Session Lock"
            className={`p-2 rounded-lg border transition ${
              sessionLock
                ? 'border-amber-400 bg-amber-950/50 text-amber-400'
                : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {sessionLock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Location Title */}
      <div>
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-amber-400">{scene.name}</h1>
        {scene.description && <p className="text-sm text-neutral-400">{scene.description}</p>}
      </div>

      {/* Tab Strip: Soundscapes | Soundboard (F-72) */}
      <div className="flex border-b border-neutral-800 space-x-8">
        <button
          onClick={() => setActiveTab('soundscapes')}
          className={`pb-3 font-serif font-bold text-lg transition border-b-2 ${
            activeTab === 'soundscapes'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundscapes
        </button>

        <button
          onClick={() => setActiveTab('soundboard')}
          className={`pb-3 font-serif font-bold text-lg transition border-b-2 ${
            activeTab === 'soundboard'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'soundscapes' ? (
        <ActiveSceneSoundscapesTab sceneId={scene.id} />
      ) : (
        <ActiveSceneSoundboardTab sceneId={scene.id} />
      )}
    </div>
  )
}
