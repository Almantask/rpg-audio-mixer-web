import { describe, it, expect, beforeEach } from 'vitest'
import { sceneAudioManager } from './sceneAudioManager'
import { getAudioState } from './audioState'

describe('SceneAudioManager Engine', () => {
  beforeEach(() => {
    sceneAudioManager.stopAll()
  })

  it('triggers FX playback and updates audio state', () => {
    sceneAudioManager.playFx('fx-test-1', 'Test Roar', '/assets/audio/soundboard/sword.ogg', {
      source: 'soundboard',
      durationSeconds: 10,
    })

    const state = getAudioState()
    expect(state.isPlaying).toBe(true)
    expect(state.trackName).toBe('Test Roar')
    expect(sceneAudioManager.isTrackPlaying('Test Roar')).toBe(true)
  })

  it('stops all instances of a track by name', () => {
    sceneAudioManager.playFx('fx-1', 'Sword Clash', '/assets/audio/soundboard/sword.ogg', { durationSeconds: 10 })
    sceneAudioManager.playFx('fx-1', 'Sword Clash', '/assets/audio/soundboard/sword.ogg', { durationSeconds: 10 })

    expect(sceneAudioManager.isTrackPlaying('Sword Clash')).toBe(true)

    sceneAudioManager.stopTrackByName('Sword Clash')
    expect(sceneAudioManager.isTrackPlaying('Sword Clash')).toBe(false)
  })

  it('enforces maximum 5 global soundboard instances', () => {
    for (let i = 1; i <= 6; i++) {
      sceneAudioManager.playFx(`fx-${i}`, `FX ${i}`, '/assets/audio/soundboard/sword.ogg', {
        source: 'soundboard',
        durationSeconds: 10,
      })
    }

    const state = getAudioState()
    expect(state.playingTracks).toHaveLength(5)
    // Oldest (FX 1) was dropped
    expect(sceneAudioManager.isTrackPlaying('FX 1')).toBe(false)
    expect(sceneAudioManager.isTrackPlaying('FX 6')).toBe(true)
  })

  it('adjusts master volume with cubic curve mapping', () => {
    sceneAudioManager.setSoundboardMasterVolume(0.85)
    expect(sceneAudioManager.getSoundboardMasterVolume()).toBe(0.85)
    expect(getAudioState().volumes?.soundboardMaster).toBe(0.85)
  })
})
