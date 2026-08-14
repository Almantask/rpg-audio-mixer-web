import { Link } from 'react-router-dom'
import { Coffee, Star, ExternalLink, Shield, FileText, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'

export function CreditsPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-amber-300">Credits</h2>
        <p className="text-zinc-400 text-sm">App info, support links, and legal.</p>
      </div>

      {/* Support Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="font-serif text-lg font-semibold text-zinc-200">Support</h3>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Buy Coffee */}
          <Card className="border-zinc-800 bg-zinc-900/80 p-5 flex flex-col justify-between">
            <CardHeader className="p-0 space-y-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coffee className="h-5 w-5" />
              </div>
              <CardTitle className="text-base text-zinc-100">Support Development</CardTitle>
              <p className="text-xs text-zinc-400">
                Help cover server costs and ongoing development of new audio mixing tools.
              </p>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <Button
                variant="gold"
                className="w-full text-xs"
                onClick={() => window.open('https://ko-fi.com', '_blank', 'noopener,noreferrer')}
                aria-label="Buy the Devs a Coffee (opens in a new tab)"
              >
                Buy the Devs a Coffee ☕
                <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </CardContent>
          </Card>

          {/* Leave a Review */}
          <Card className="border-zinc-800 bg-zinc-900/80 p-5 flex flex-col justify-between">
            <CardHeader className="p-0 space-y-2">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Star className="h-5 w-5" />
              </div>
              <CardTitle className="text-base text-zinc-100">Leave a Review</CardTitle>
              <p className="text-xs text-zinc-400">
                Share feedback and rate Arcanum Audio to help other Game Masters discover the app.
              </p>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <Button
                variant="secondary"
                className="w-full text-xs border-zinc-700"
                onClick={() => window.open('https://github.com', '_blank', 'noopener,noreferrer')}
                aria-label="Leave a Review (opens in a new tab)"
              >
                Leave a Review ✍️
                <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Legal Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="font-serif text-lg font-semibold text-zinc-200">Legal</h3>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="space-y-2">
          <Link
            to="/legal/terms"
            className="flex items-center gap-3 p-3 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-200 hover:text-amber-300 transition-colors"
          >
            <FileText className="h-4 w-4 text-zinc-400" />
            <span>Terms of Service</span>
          </Link>

          <Link
            to="/legal/privacy"
            className="flex items-center gap-3 p-3 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-200 hover:text-amber-300 transition-colors"
          >
            <Shield className="h-4 w-4 text-zinc-400" />
            <span>Privacy Policy</span>
          </Link>

          <Link
            to="/credits/attributions"
            className="flex items-center gap-3 p-3 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-200 hover:text-amber-300 transition-colors"
          >
            <Award className="h-4 w-4 text-zinc-400" />
            <span>Attributions & Licenses</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-xs text-zinc-500 pt-4">
        © {currentYear} Arcanum Audio. V 1.0.0.
      </div>
    </div>
  )
}
