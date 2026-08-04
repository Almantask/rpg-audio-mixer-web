import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export const LegalPage: React.FC = () => {
  const { docType } = useParams<{ docType: string }>()

  const titles: Record<string, string> = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    attributions: 'Attributions & Open Source Licenses',
  }

  const title = titles[docType || 'terms'] || 'Legal Notice'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          to="/credits"
          className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-500 hover:text-yellow-400 mb-2"
        >
          <ArrowLeft size={16} /> Back to Credits
        </Link>
        <h1 className="font-serif text-3xl font-bold text-yellow-500">{title}</h1>
      </div>

      <div className="p-6 rounded-xl bg-[#161616] border border-yellow-900/30 text-gray-300 space-y-4 text-sm leading-relaxed">
        {docType === 'terms' && (
          <>
            <p>Welcome to Arcanum Audio. By using our web application, you agree to these terms.</p>
            <h3 className="font-serif text-lg font-bold text-yellow-500">1. Usage</h3>
            <p>Arcanum Audio is intended for personal tabletop RPG soundscapes and ambience creation.</p>
            <h3 className="font-serif text-lg font-bold text-yellow-500">2. Audio Assets</h3>
            <p>Bundled audio assets are provided for personal tabletop session play.</p>
          </>
        )}

        {docType === 'privacy' && (
          <>
            <p>Your privacy is respected. Arcanum Audio stores your data locally in your browser.</p>
            <h3 className="font-serif text-lg font-bold text-yellow-500">1. Local Storage</h3>
            <p>All campaign, session, scene, and library custom data remain on your local device.</p>
          </>
        )}

        {docType === 'attributions' && (
          <>
            <h3 className="font-serif text-lg font-bold text-yellow-500">1. Audio Assets</h3>
            <p>Soundboard effects and soundscape loops provided under Creative Commons and Royalty-Free licenses.</p>
            <h3 className="font-serif text-lg font-bold text-yellow-500">2. Open Source Software</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
              <li>React 19 (MIT License)</li>
              <li>React Router 7 (MIT License)</li>
              <li>Lucide React (MIT License)</li>
              <li>TailwindCSS (MIT License)</li>
              <li>Vite (MIT License)</li>
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
