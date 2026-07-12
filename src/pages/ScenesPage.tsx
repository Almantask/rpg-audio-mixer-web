import { Link } from 'react-router-dom'
import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'
import { E2E_TAVERN_SCENE_ID } from '@/lib/constants'

export function ScenesPage() {
  return (
    <ScreenLandmark screenName="Scenes screen">
      <PageHeader title="Scenes" subtitle="Curate and manage your immersive environments." />
      <ul className="space-y-3">
        <li>
          <Link
            to={`/scenes/${E2E_TAVERN_SCENE_ID}/active`}
            className="block rounded-lg border border-white/10 bg-charcoal-elevated p-4 hover:border-gold/40"
            data-scene-name="Tavern"
          >
            <span className="font-serif text-xl text-gold">Tavern</span>
          </Link>
        </li>
      </ul>
    </ScreenLandmark>
  )
}
