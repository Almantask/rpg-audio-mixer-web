import { useParams } from 'react-router-dom'
import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'

const SCENE_NAMES: Record<string, string> = {
  tavern: 'Tavern',
}

export function ActiveScenePage() {
  const { sceneId = '' } = useParams()
  const sceneName = SCENE_NAMES[sceneId] ?? sceneId

  return (
    <ScreenLandmark screenName="Active Scene screen">
      <PageHeader title={sceneName} subtitle="Soundscapes and soundboard controls." />
      <p className="text-muted" data-scene-name={sceneName}>
        Active Scene for {sceneName}
      </p>
    </ScreenLandmark>
  )
}
