export function mapVolumeCubic(percent: number): number {
  const clamped = Math.max(0, Math.min(100, percent))
  const normalized = clamped / 100
  return normalized * normalized * normalized
}
