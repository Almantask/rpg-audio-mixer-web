/** Split a comma-separated tag string into trimmed, de-duplicated tags. */
export function parseFxTags(value: string): string[] {
  const seen = new Set<string>()
  const tags: string[] = []

  for (const part of value.split(',')) {
    const tag = part.trim()
    if (!tag) {
      continue
    }
    const key = tag.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    tags.push(tag)
  }

  return tags
}

/** Text comma-separated fragment (what the user is currently typing). */
export function fxTagInputFragment(value: string): string {
  const parts = value.split(',')
  return (parts[parts.length - 1] ?? '').trim()
}

/** Tags already committed before the in-progress fragment (excludes current typing). */
export function fxCompletedTags(value: string): string[] {
  const parts = value.split(',')
  if (parts.length <= 1) {
    return []
  }
  return parseFxTags(parts.slice(0, -1).join(','))
}

/** Replace the in-progress fragment with a chosen suggestion. */
export function applyFxTagSuggestion(currentInput: string, suggestion: string): string {
  const complete = parseFxTags(currentInput.split(',').slice(0, -1).join(','))
  if (!complete.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())) {
    complete.push(suggestion)
  }
  return complete.join(', ')
}
