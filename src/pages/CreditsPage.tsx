import React from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Star, ExternalLink, Shield, FileText, Award } from 'lucide-react'

export const CreditsPage: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">Credits</h1>
        <p className="text-sm text-gray-400 mt-1">App info, support links, and legal.</p>
      </div>

      {/* Support Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-gray-200 border-b border-yellow-900/30 pb-2">
          Support
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buy Coffee Card */}
          <div className="p-6 rounded-xl border border-yellow-900/30 bg-[#161616] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center">
                <Coffee size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-yellow-500">Support Development</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Support ongoing development, server infrastructure, and new audio library additions.
              </p>
            </div>

            <a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors w-full"
            >
              <span>Buy the Devs a Coffee ☕</span>
              <ExternalLink size={16} />
            </a>
          </div>

          {/* Leave a Review Card */}
          <div className="p-6 rounded-xl border border-yellow-900/30 bg-[#161616] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Star size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-100">Leave a Review</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Share feedback with other GMs and help improve Arcanum Audio.
              </p>
            </div>

            <a
              href="https://arcanumaudio.com/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 font-bold text-sm hover:bg-gray-700 transition-colors w-full"
            >
              <span>Leave a Review ✍️</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Legal Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-gray-200 border-b border-yellow-900/30 pb-2">
          Legal & Info
        </h2>

        <div className="space-y-2">
          <Link
            to="/legal/terms"
            className="p-4 rounded-xl bg-[#161616] border border-yellow-900/20 hover:border-yellow-500/40 flex items-center justify-between text-gray-200 hover:text-yellow-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-yellow-500" />
              <span className="font-medium text-sm">Terms of Service</span>
            </div>
          </Link>

          <Link
            to="/legal/privacy"
            className="p-4 rounded-xl bg-[#161616] border border-yellow-900/20 hover:border-yellow-500/40 flex items-center justify-between text-gray-200 hover:text-yellow-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-yellow-500" />
              <span className="font-medium text-sm">Privacy Policy</span>
            </div>
          </Link>

          <Link
            to="/credits/attributions"
            className="p-4 rounded-xl bg-[#161616] border border-yellow-900/20 hover:border-yellow-500/40 flex items-center justify-between text-gray-200 hover:text-yellow-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award size={18} className="text-yellow-500" />
              <span className="font-medium text-sm">Attributions & Open Source Licenses</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-yellow-900/20 text-center text-xs text-gray-500">
        © {currentYear} Arcanum Audio. V 2.4.1.
      </div>
    </div>
  )
}
