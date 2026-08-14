import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Volume2, Plus, Lock, Unlock, Square, Trash2, GripVertical, Play, Flame, Shield, Zap, Sparkles } from 'lucide-react'
import { useScenes, useCampaigns, useSessions, useFxTracks } from '../lib/useStorage'
import { storage } from '../lib/storage'
import { sceneAudioManager } from '../lib/audio/sceneAudioManager'
import { subscribeAudioState } from '../lib/audio/audioState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Slider } from '../components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { FxPickerModal } from '../components/active-scene/FxPickerModal'
import type { SoundboardEffect } from '../lib/types'

const ICONS = [Flame, Zap, Shield, Sparkles]

export function ActiveScenePage() {
  const { sceneId = '' } = useParams<{ sceneId: string }>()
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaignId')
  const sessionId = searchParams.get('sessionId')

  const { scenes, refresh } = useScenes()
  const { campaigns } = useCampaigns()
  const { sessions } = useSessions(campaignId ?? undefined)
  const { fxTracks } = useFxTracks()

  const scene = scenes.find((s) => s.id === sceneId)
  const campaign = campaigns.find((c) => c.id === campaignId)
  const session = sessions.find((s) => s.id === sessionId)

  const [activeTab, setActiveTab] = useState('soundscapes')
  const [isLocked, setIsLocked] = useState(false)
  const [masterVolume, setMasterVolume] = useState(() => Math.round(sceneAudioManager.getSoundboardMasterVolume() * 100))
  const [fxPickerOpen, setFxPickerOpen] = useState(false)
  const [activeAudioSnapshot, setActiveAudioSnapshot] = useState(() => ({ isPlaying: false, playingTracks: [] as { trackName: string }[] }))

  useEffect(() => {
    return subscribeAudioState((state) => {
      setActiveAudioSnapshot({
        isPlaying: state.isPlaying,
        playingTracks: state.playingTracks || [],
      })
    })
  }, [])

  // Master Volume Handler
  const handleMasterVolumeChange = (val: number) => {
    setMasterVolume(val)
    sceneAudioManager.setSoundboardMasterVolume(val / 100)
    if (scene) {
      storage.updateScene(scene.id, { soundboardMasterVolume: val / 100 })
    }
  }

  // FX Trigger Handler
  const handleTriggerFx = useCallback((effect: SoundboardEffect) => {
    const fx = fxTracks.find((t) => t.id === effect.fxTrackId) || {
      id: effect.fxTrackId,
      name: effect.name,
      url: '/assets/audio/soundboard/sword.ogg',
      durationSeconds: 3,
      defaultVolume: 1,
    }

    sceneAudioManager.playFx(fx.id, fx.name, fx.url, {
      source: 'soundboard',
      durationSeconds: fx.durationSeconds || 3,
      defaultVolume: fx.defaultVolume ?? 1,
    })
  }, [fxTracks])

  const handleStopFx = (effect: SoundboardEffect, e: React.MouseEvent) => {
    e.stopPropagation()
    sceneAudioManager.stopTrackByName(effect.name)
  }

  const handleRemoveFx = (effectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLocked || !scene) return
    storage.removeFxFromSoundboard(scene.id, effectId)
    refresh()
  }

  const handleStopAll = () => {
    sceneAudioManager.stopAll()
  }

  // Hotkey listener for Num 1-9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'soundboard') return
      const effects = scene?.soundboardEffects || []
      const key = e.key
      const match = key.match(/^[1-9]$/)
      if (match) {
        const index = parseInt(match[0], 10) - 1
        if (effects[index]) {
          handleTriggerFx(effects[index])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, scene, handleTriggerFx])

  if (!scene) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-zinc-300">Scene not found</h2>
        <Button variant="gold" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  const soundboardEffects = scene.soundboardEffects || []
  const isFull = soundboardEffects.length >= 24

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            ACTIVE SCENE
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopAll}
              className="text-xs border-zinc-700 text-zinc-300 hover:text-white"
            >
              <Square className="h-3.5 w-3.5 mr-1.5 fill-current" />
              Stop All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isLocked ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`}
              aria-label={isLocked ? 'Unlock scene' : 'Lock scene'}
              onClick={() => setIsLocked((prev) => !prev)}
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-100">
            {scene.name}
          </h2>
          {campaign && (
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
              CAMPAIGN &gt; {campaign.name} {session ? `> SESSION ${session.sessionNumber}` : ''}
            </div>
          )}
          {scene.description && (
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{scene.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-950 border-zinc-800">
          <TabsTrigger value="soundscapes">Soundscapes</TabsTrigger>
          <TabsTrigger value="soundboard">SOUNDBOARD</TabsTrigger>
        </TabsList>

        {/* SOUNDSCAPES TAB */}
        <TabsContent value="soundscapes" className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Soundscapes Master
              </span>
              <span className="text-xs font-mono text-amber-400">100%</span>
            </div>
            <Slider value={100} onValueChange={() => {}} disabled={isLocked} />
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-zinc-200">Active Soundscapes</h3>
            </div>

            {scene.soundscapeCategoryIds?.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg p-6 space-y-3">
                <p className="text-sm text-zinc-400">The scene has no soundscape categories.</p>
                {!isLocked && (
                  <Button
                    variant="dashed"
                    onClick={() => {
                      const updated = [...(scene.soundscapeCategoryIds || []), 'cat_ambient']
                      storage.updateScene(scene.id, { soundscapeCategoryIds: updated })
                      refresh()
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Soundscape
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {scene.soundscapeCategoryIds.map((catId) => (
                  <Card key={catId} className="p-4 flex items-center justify-between border-zinc-800 bg-zinc-900">
                    <div>
                      <div className="font-serif font-bold text-amber-300">Weather Ambience</div>
                      <div className="text-xs text-zinc-400">Rain & Distant Thunder</div>
                    </div>
                    {!isLocked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove soundscape category"
                        onClick={() => {
                          const updated = scene.soundscapeCategoryIds.filter((id) => id !== catId)
                          storage.updateScene(scene.id, { soundscapeCategoryIds: updated })
                          refresh()
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-400" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* SOUNDBOARD TAB */}
        <TabsContent value="soundboard" className="space-y-6">
          {/* Master Volume */}
          <Card className="border-zinc-800 bg-zinc-950/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <Volume2 className="h-4 w-4" />
                Soundboard Master
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{masterVolume}%</span>
            </div>
            <Slider
              value={masterVolume}
              onValueChange={handleMasterVolumeChange}
              aria-label="Soundboard Master Volume"
            />
          </Card>

          {/* FX Tiles Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-200">Soundboard</h3>

            {soundboardEffects.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-500 italic">The soundboard has no effects.</p>
                {!isLocked && (
                  <Card
                    onClick={() => setFxPickerOpen(true)}
                    className="border-dashed border-amber-500/40 bg-zinc-950/40 hover:bg-amber-950/10 p-6 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 max-w-xs"
                  >
                    <Plus className="h-6 w-6 text-amber-400" />
                    <span className="font-serif font-semibold text-amber-300">Add Sound</span>
                  </Card>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {soundboardEffects.map((effect, idx) => {
                  const isPlaying = activeAudioSnapshot.playingTracks.some(
                    (t) => t.trackName === effect.name
                  )
                  const IconComp = ICONS[idx % ICONS.length]
                  const hotkey = idx < 9 ? `Num ${idx + 1}` : undefined

                  return (
                    <Card
                      key={effect.id}
                      data-effect-id={effect.id}
                      onClick={() => handleTriggerFx(effect)}
                      className={`relative p-3.5 cursor-pointer flex flex-col justify-between min-h-[110px] transition-all border ${
                        isPlaying
                          ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_16px_rgba(212,175,55,0.4)] animate-pulse'
                          : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      {/* Top Bar: Handle, Icon, and Stop / Delete */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {!isLocked && <GripVertical className="h-3.5 w-3.5 text-zinc-600 cursor-grab" />}
                          <IconComp className="h-4 w-4 text-purple-400" />
                        </div>

                        <div className="flex items-center gap-1">
                          {isPlaying && (
                            <button
                              type="button"
                              onClick={(e) => handleStopFx(effect, e)}
                              className="p-1 text-amber-400 hover:text-amber-200"
                              aria-label={`Stop ${effect.name}`}
                            >
                              <Square className="h-3.5 w-3.5 fill-current" />
                            </button>
                          )}
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveFx(effect.id, e)}
                              className="p-1 text-zinc-500 hover:text-red-400"
                              aria-label={`Remove ${effect.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Middle: FX Name */}
                      <div className="font-serif font-bold text-sm text-zinc-100 line-clamp-1 my-1">
                        {effect.name}
                      </div>

                      {/* Bottom: Hotkey Label & Play indicator */}
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>{hotkey || ''}</span>
                        {isPlaying ? (
                          <span className="text-amber-400 font-bold tracking-wider">PLAYING</span>
                        ) : (
                          <Play className="h-3 w-3 text-zinc-500 opacity-60" />
                        )}
                      </div>
                    </Card>
                  )
                })}

                {/* Add Sound Tile (Always last in grid) */}
                {!isLocked && !isFull && (
                  <Card
                    onClick={() => setFxPickerOpen(true)}
                    className="border-dashed border-amber-500/40 bg-zinc-950/40 hover:bg-amber-950/10 p-4 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 min-h-[110px]"
                  >
                    <Plus className="h-5 w-5 text-amber-400" />
                    <span className="font-serif font-semibold text-xs text-amber-300">Add Sound</span>
                  </Card>
                )}

                {isFull && (
                  <div className="col-span-full text-xs text-zinc-500 italic py-2">
                    Board full — remove an effect to add more.
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* FX Picker Modal */}
      <FxPickerModal
        open={fxPickerOpen}
        sceneId={scene.id}
        onClose={() => setFxPickerOpen(false)}
        onCommitted={() => refresh()}
      />
    </div>
  )
}
