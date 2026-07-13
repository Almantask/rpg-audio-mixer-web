import { describe, expect, it } from 'vitest'
import { resolveAudioUrl } from '@/lib/resolveAudioUrl'

describe('resolveAudioUrl', () => {
  it('returns blob and absolute URLs unchanged', () => {
    expect(resolveAudioUrl('blob:http://localhost/abc')).toBe('blob:http://localhost/abc')
    expect(resolveAudioUrl('https://cdn.example.com/track.ogg')).toBe(
      'https://cdn.example.com/track.ogg',
    )
  })

  it('encodes path segments with spaces', () => {
    expect(resolveAudioUrl('/assets/audio/soundscapes/Forest/I/Moonroots of the Feywood.ogg')).toBe(
      '/assets/audio/soundscapes/Forest/I/Moonroots%20of%20the%20Feywood.ogg',
    )
  })

  it('leaves already-encoded segments unchanged', () => {
    expect(resolveAudioUrl('/assets/audio/soundscapes/Forest/I/Moonroots%20of%20the%20Feywood.ogg')).toBe(
      '/assets/audio/soundscapes/Forest/I/Moonroots%20of%20the%20Feywood.ogg',
    )
  })
})
