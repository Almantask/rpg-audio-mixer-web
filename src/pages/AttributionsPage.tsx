import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export function AttributionsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <Link
        to="/credits"
        className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Credits
      </Link>

      <div>
        <h2 className="font-serif text-3xl font-bold text-amber-300">Attributions & Licenses</h2>
        <p className="text-zinc-400 text-sm">Credits for bundled audio assets and open-source software.</p>
      </div>

      <div className="space-y-6">
        <Card className="border-zinc-800 bg-zinc-900/80 p-5">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base text-amber-300">Sound Library Attributions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs text-zinc-300">
            <p>
              • <strong>Dragon Roar</strong> — Studio Dragon Roar (Creative Commons / Royalty-Free)
            </p>
            <p>
              • <strong>Sword Clash & Arrow</strong> — Musicholder & Community Sound Design
            </p>
            <p>
              • <strong>Owl Hooting & Dog Bark</strong> — Creative Commons Sample Archive
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/80 p-5">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base text-amber-300">Open Source Libraries</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2 text-xs text-zinc-400 font-mono">
            <p>React 19 (MIT License)</p>
            <p>Tailwind CSS (MIT License)</p>
            <p>Lucide Icons (ISC License)</p>
            <p>Playwright & Playwright-BDD (Apache 2.0 / MIT)</p>
            <p>Vitest & Testing Library (MIT License)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
