import { describe, expect, it } from 'vitest'
import { extractYoutubeIdFromAudioUrl, isYoutubeAudioUrl } from './youtubePlayer'

describe('youtubePlayer helpers', () => {
  it('detects YouTube audio URLs', () => {
    expect(isYoutubeAudioUrl('https://www.youtube.com/watch?v=abc123')).toBe(true)
    expect(isYoutubeAudioUrl('https://youtu.be/abc123')).toBe(true)
    expect(isYoutubeAudioUrl('youtube:abc123')).toBe(true)
    expect(isYoutubeAudioUrl('/assets/audio/soundscapes/Forest/I/Steps in the forest.ogg')).toBe(
      false,
    )
  })

  it('extracts video ids from watch URLs and youtube: prefixes', () => {
    expect(extractYoutubeIdFromAudioUrl('https://www.youtube.com/watch?v=abc123')).toBe('abc123')
    expect(extractYoutubeIdFromAudioUrl('youtube:playlistVid9')).toBe('playlistVid9')
    expect(extractYoutubeIdFromAudioUrl('https://youtu.be/shortId')).toBe('shortId')
  })
})
