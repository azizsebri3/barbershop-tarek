import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { LanguageProvider } from '@/lib/language-context'

export const metadata: Metadata = {
  title: 'Style & Coupe - Salon de Coiffure Belgique',
  description: 'Salon de coiffure et barbershop à Belgique. Coupes modernes, coloration, rasage traditionnel. Réservez en ligne facilement.',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Elite Barbershop',
  },
}

export const viewport: Viewport = {
  themeColor: '#d4af37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-primary text-white">
        <LanguageProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
