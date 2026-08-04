import React from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Star } from 'lucide-react'

export const CreditsView: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Credits</h1>
        <p className="text-sm text-neutral-400">App info, support links, and legal.</p>
      </div>

      {/* Support Section */}
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-neutral-200 border-b border-neutral-800 pb-2">
          Support
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-3">
            <h3 className="font-serif text-lg font-bold text-neutral-100 flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-amber-400" />
              <span>Support Development</span>
            </h3>
            <p className="text-sm text-neutral-400">
              Support ongoing server costs and the creation of new sound libraries.
            </p>
            <a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition"
            >
              <span>Buy the Devs a Coffee ☕</span>
            </a>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-3">
            <h3 className="font-serif text-lg font-bold text-neutral-100 flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-400" />
              <span>Leave a Review</span>
            </h3>
            <p className="text-sm text-neutral-400">
              Share feedback and let other GMs know about Arcanum Audio.
            </p>
            <a
              href="https://example.com/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm border border-neutral-700 transition"
            >
              <span>Leave a Review ✍️</span>
            </a>
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-neutral-200 border-b border-neutral-800 pb-2">
          Legal
        </h2>
        <div className="flex flex-col space-y-2 text-sm text-amber-400">
          <Link to="/credits" className="hover:underline">
            Terms of Service
          </Link>
          <Link to="/credits" className="hover:underline">
            Privacy Policy
          </Link>
          <Link to="/credits" className="hover:underline">
            Attributions
          </Link>
        </div>
      </section>

      <footer className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 text-center">
        © {currentYear} Arcanum Audio. V 1.0.0.
      </footer>
    </div>
  )
}
