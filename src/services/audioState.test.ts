import { describe, it, expect, beforeEach } from 'vitest'
import { getAudioState, publishAudioState, updateTrackState, stopAllTracks } from './audioState'

describe('audioState service', () => {
  beforeEach(() => {
    stopAllTracks()
  })

  it('publishes state to window.__ARCANUM_AUDIO_STATE__', () => {
    const state = publishAudioState({ isPlaying: true })
    expect(window.__ARCANUM_AUDIO_STATE__).toBeDefined()
    expect(window.__ARCANUM_AUDIO_STATE__?.isPlaying).toBe(true)
    expect(state.volumes?.soundboardMaster).toBe(85)
  })

  it('updates track state correctly', () => {
    updateTrackState('Thunder Crack', 'playing', 'soundboard')
    let state = getAudioState()
    expect(state.isPlaying).toBe(true)
    expect(state.trackName).toBe('Thunder Crack')

    updateTrackState('Thunder Crack', 'stopped', 'soundboard')
    state = getAudioState()
    expect(state.isPlaying).toBe(false)
  })
})
