import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FxPickerModal } from '@/components/active-scene/FxPickerModal'
import {
  MasterVolumeBar,
  SceneHeaderActions,
  SoundboardMasterBar,
} from '@/components/active-scene/MixerControls'
import { SceneNotesPanel } from '@/components/active-scene/SceneNotesPanel'
import { SoundboardGrid } from '@/components/active-scene/SoundboardGrid'
import { SoundscapeCategoryList } from '@/components/active-scene/SoundscapeCategoryCard'
import { SoundscapePickerModal } from '@/components/active-scene/SoundscapePickerModal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSessionLock } from '@/contexts/SessionLockContext'
import { useMediaSession } from '@/hooks/useMediaSession'
import { useSceneMixer } from '@/hooks/useSceneMixer'
import { audioEngine } from '@/lib/audio'
import {
  addEffectsToScene,
  addSoundscapesToScene,
  removeEffectFromScene,
  removeSoundscapeFromScene,
} from '@/lib/storage/sceneContentRepository'
import type { FxTrack, SoundscapeCategoryWithCounts } from '@/lib/storage/types'

export function ActiveScenePage() {
  const { sceneId } = useParams<{ sceneId: string }>()
  const [activeTab, setActiveTab] = useState('soundscapes')
  const [soundscapePickerOpen, setSoundscapePickerOpen] = useState(false)
  const [fxPickerOpen, setFxPickerOpen] = useState(false)
  const mixer = useSceneMixer(sceneId)

  const focusedCategory =
    mixer.snapshot.loops.find((loop) => loop.status === 'playing')?.categoryName ??
    mixer.soundscapes[0]?.categoryName

  useMediaSession(focusedCategory, (categoryName) => {
    void mixer.rollCategoryForMediaSession(categoryName)
  })
  const { setLocked, navigationBlocked } = useSessionLock()

  const scene = mixer.scene

  useEffect(() => {
    setLocked(scene?.sessionLocked ?? false)
    return () => setLocked(false)
  }, [scene?.sessionLocked, setLocked])
  if (!sceneId || !scene) {
    return (
      <section aria-labelledby="active-scene-heading">
        <h1 className="font-serif text-2xl text-gold" id="active-scene-heading">
          Active Scene
        </h1>
      </section>
    )
  }

  const sessionLocked = scene.sessionLocked ?? false

  const handleAddSoundscapes = async (categories: SoundscapeCategoryWithCounts[]) => {
    await addSoundscapesToScene(
      sceneId,
      categories.map((category) => ({
        categoryId: category.id,
        categoryName: category.name,
      })),
    )
  }

  const handleAddEffects = async (tracks: FxTrack[]) => {
    await addEffectsToScene(
      sceneId,
      tracks.map((track) => ({ name: track.name, fxTrackId: track.id })),
    )
  }

  const handleRoll = async (item: (typeof mixer.soundscapes)[number]) => {
    const track = await mixer.rollCategory(item)
    if (!track) return
    const status = audioEngine.getLoopStatus(item.id)
    if (status === 'playing') {
      await audioEngine.loadCategoryTrack({
        sceneSoundscapeId: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        trackId: track.id,
        trackName: track.name,
        intensityLevel: item.intensity,
        categoryVolumePercent: item.volume,
      })
      await audioEngine.playCategory(item.id)
    }
  }

  const handleRemoveSoundscape = async (item: (typeof mixer.soundscapes)[number]) => {
    audioEngine.removeCategory(item.id)
    await removeSoundscapeFromScene(sceneId, item.categoryId)
  }

  return (
    <section aria-labelledby="active-scene-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Scenes</p>
          <h1
            className="mt-2 font-serif text-2xl text-gold"
            data-scene-title={scene.name}
            id="active-scene-heading"
          >
            {scene.name}
          </h1>
        </div>
        <SceneHeaderActions
          onStopAll={mixer.stopAll}
          onToggleLock={() => void mixer.toggleSessionLock()}
          sessionLocked={sessionLocked}
        />
      </div>

      {scene.description ? (
        <p className="mt-2 text-zinc-400" data-testid="scene-description">
          {scene.description}
        </p>
      ) : null}

      <SceneNotesPanel notes={scene.notes} sceneId={sceneId} />

      {navigationBlocked ? (
        <p className="mt-2 text-sm text-amber-400" data-testid="session-lock-navigation-blocked" role="status">
          Navigation is blocked while the session is locked.
        </p>
      ) : null}
      <Tabs className="mt-6" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger data-testid="soundscapes-tab" value="soundscapes">
            Soundscapes
          </TabsTrigger>
          <TabsTrigger data-testid="soundboard-tab" value="soundboard">
            Soundboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="soundscapes">
          <div className="space-y-4">
            <Button
              data-testid="play-scene-button"
              disabled={sessionLocked}
              onClick={() => void mixer.playScene()}
              type="button"
            >
              Play Scene
            </Button>

            <MasterVolumeBar
              masterMuted={scene.masterMuted ?? false}
              masterVolume={scene.masterVolume ?? 100}
              onToggleMute={() => void mixer.toggleMasterMute()}
              onVolumeChange={(value) => void mixer.setMasterVolume(value)}
            />

            <SoundscapeCategoryList
              getPlayback={(name) => mixer.getCategoryState(name)}
              items={mixer.soundscapes}
              onIntensityChange={(item, level) => void mixer.setCategoryIntensity(item, level)}
              onPause={(item) => mixer.pauseCategory(item)}
              onRemove={(item) => void handleRemoveSoundscape(item)}
              onReorder={(ids) => void mixer.reorderSoundscapes(ids)}
              onRoll={(item) => void handleRoll(item)}
              onTogglePlayback={(item) => void mixer.toggleCategoryPlayback(item)}
              onVolumeChange={(item, volume) => void mixer.setCategoryVolume(item, volume)}
              sessionLocked={sessionLocked}
            />

            <Button
              data-testid="add-soundscape-button"
              disabled={sessionLocked}
              onClick={() => setSoundscapePickerOpen(true)}
              type="button"
              variant="outline"
            >
              ADD SOUNDSCAPE
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="soundboard">
          <div className="space-y-4">
            <SoundboardMasterBar
              onVolumeChange={(value) => void mixer.setSoundboardMaster(value)}
              soundboardMaster={scene.soundboardMaster ?? 100}
            />

            <SoundboardGrid
              effects={mixer.effects}
              isEffectPlaying={(name) => audioEngine.isEffectPlaying(name)}
              onRemove={(effect) => void removeEffectFromScene(sceneId, effect.name)}
              onReorder={(ids) => void mixer.reorderEffects(ids)}
              onStop={(name) => mixer.stopEffect(name)}
              onTrigger={(effect) => void mixer.triggerEffect(effect)}
              sessionLocked={sessionLocked}
            />

            <Button
              data-testid="add-sound-button"
              disabled={sessionLocked}
              onClick={() => setFxPickerOpen(true)}
              type="button"
              variant="outline"
            >
              Add Sound
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <SoundscapePickerModal
        excludedCategoryIds={mixer.soundscapes.map((item) => item.categoryId)}
        onAddSelected={handleAddSoundscapes}
        onOpenChange={setSoundscapePickerOpen}
        open={soundscapePickerOpen}
      />

      <FxPickerModal
        excludedFxTrackIds={mixer.effects
          .map((effect) => effect.fxTrackId)
          .filter((id): id is string => Boolean(id))}
        onAddSelected={handleAddEffects}
        onOpenChange={setFxPickerOpen}
        open={fxPickerOpen}
      />
    </section>
  )
}
