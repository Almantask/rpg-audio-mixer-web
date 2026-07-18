import { describe, expect, it } from 'vitest'
import { applyFxTagSuggestion, fxTagInputFragment, parseFxTags } from '@/lib/parseFxTags'

describe('parseFxTags', () => {
  it('splits comma-separated tags and trims whitespace', () => {
    expect(parseFxTags('Combat, Creature, Magic')).toEqual(['Combat', 'Creature', 'Magic'])
  })

  it('ignores empty segments and de-duplicates case-insensitively', () => {
    expect(parseFxTags(' Combat, , combat, Creature ')).toEqual(['Combat', 'Creature'])
  })
})

describe('fxTagInputFragment', () => {
  it('returns the last incomplete fragment', () => {
    expect(fxTagInputFragment('Combat, Cre')).toBe('Cre')
  })
})

describe('applyFxTagSuggestion', () => {
  it('appends a suggestion after completed tags', () => {
    expect(applyFxTagSuggestion('Creature, Com', 'Combat')).toBe('Creature, Combat')
  })
})
