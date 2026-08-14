import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'

export function TermsPage() {
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
        <h2 className="font-serif text-3xl font-bold text-amber-300">Terms of Service</h2>
        <p className="text-zinc-400 text-sm">Terms and conditions governing the use of Arcanum Audio.</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/80 p-6 text-sm text-zinc-300 space-y-4">
        <CardContent className="p-0 space-y-4">
          <p>
            Arcanum Audio is provided as-is for tabletop roleplaying game audio management and mixing.
          </p>
          <p>
            You retain all rights to your user-created campaigns, sessions, and audio configurations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function PrivacyPage() {
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
        <h2 className="font-serif text-3xl font-bold text-amber-300">Privacy Policy</h2>
        <p className="text-zinc-400 text-sm">How your data and audio assets are stored.</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/80 p-6 text-sm text-zinc-300 space-y-4">
        <CardContent className="p-0 space-y-4">
          <p>
            Arcanum Audio stores your campaigns, sessions, scenes, and audio library locally within your browser storage.
          </p>
          <p>
            No personal data or audio files are uploaded to external tracking servers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
