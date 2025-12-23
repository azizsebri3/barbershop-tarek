import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Non Trouvée</h2>
        <p className="text-gray-400 text-lg mb-8">
          Désolé, la page que vous cherchez n&apos;existe pas.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-colors"
        >
          Retour à l&apos;Accueil
        </Link>
      </div>
    </div>
  )
}
