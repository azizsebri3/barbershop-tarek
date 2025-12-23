'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-accent mb-4">Oups!</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Une erreur s'est produite</h2>
        <p className="text-gray-400 mb-8">
          {error.message || 'Quelque chose s&apos;est mal passé. Veuillez réessayer.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="px-6 py-2 border-2 border-accent text-accent font-bold rounded-lg hover:bg-accent/10 transition-colors"
          >
            Retour
          </a>
        </div>
      </div>
    </div>
  )
}
