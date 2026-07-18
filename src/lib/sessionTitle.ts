/** Strip a leading "Session N —/–/-/:" prefix that duplicates the session number. */
export function stripRedundantSessionPrefix(name: string, sessionNumber: number): string {
  const trimmed = name.trim()
  if (!trimmed) {
    return trimmed
  }
  const pattern = new RegExp(`^Session\\s*${sessionNumber}\\s*[–—:\\-]+\\s*`, 'i')
  const stripped = trimmed.replace(pattern, '').trim()
  return stripped || trimmed
}

/** Page title: "Session N – Name", without duplicating an existing Session N prefix in the name. */
export function formatSessionPageTitle(session: { number: number; name: string }): string {
  const name = stripRedundantSessionPrefix(session.name, session.number)
  return name ? `Session ${session.number} – ${name}` : `Session ${session.number}`
}

/** Hero / trash label: "Session N: Name", without duplicating an existing Session N prefix. */
export function formatSessionContextLabel(session: { number: number; name: string }): string {
  const name = stripRedundantSessionPrefix(session.name, session.number)
  return name ? `Session ${session.number}: ${name}` : `Session ${session.number}`
}
