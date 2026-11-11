import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'
import { LanguageProvider } from '@/lib/language-context'
import WhatsAppButton from '@/components/WhatsAppButton'
import MobileBottomNav from '@/components/MobileBottomNav'
import PageContent from '@/components/PageContent'
import { Analytics } from '@vercel/analytics/react'
import { Cormorant_Garamond, Inter } from 'next/font/google'

// Lazy load des composants lourds
const Header = dynamic(() => import('@/components/Header'), { ssr: true })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true })

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

// TODO(contenu): ajouter le vrai jeton Google Search Console lorsqu'il sera fourni.

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tareksalon.be'),
  title: {
    default: 'Tarek Salon | Barbershop à Namur',
    template: '%s | Tarek Salon'
  },
  description: 'Tarek Salon à Namur : coupes homme, barbe et soins précis dans un espace premium. Réservez votre rendez-vous en ligne.',
  authors: [{ name: 'Tarek Salon' }],
  creator: 'Tarek Salon',
  publisher: 'Tarek Salon',
  category: 'Coiffure & Beauté',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    alternateLocale: 'en_BE',
    url: 'https://tareksalon.be',
    siteName: 'Tarek Salon',
    title: 'Tarek Salon | Barbershop à Namur',
    description: 'Coupes homme, barbe et soins précis dans un espace premium à Namur. Réservez votre rendez-vous en ligne.',
    images: [
      {
        url: '/hero-bg1.jpeg',
        width: 1200,
        height: 630,
        alt: 'Tarek Salon - Coiffeur Barbershop Namur',
      }
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Tarek Salon | Barbershop à Namur',
    description: 'Coupes homme, barbe et soins précis à Namur. Réservez votre rendez-vous en ligne.',
    images: ['/hero-bg1.jpeg'],
  },
  
  alternates: {
    canonical: 'https://tareksalon.be',
    languages: {
      'fr-BE': 'https://tareksalon.be',
      'en-BE': 'https://tareksalon.be/en',
    },
  },
  
  // Autres métadonnées
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tarek Salon',
  },
  
  // Format detection
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0b0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
}

// Schema.org JSON-LD pour Local Business (SEO crucial!)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  '@id': 'https://tareksalon.be/#organization',
  name: 'Tarek Salon',
  alternateName: 'Tarek Barbershop Namur',
  description: 'Salon de coiffure et barbershop professionnel à Namur, Belgique. Spécialisé dans les coupes hommes, dégradés, barbes et soins capillaires. Situé près de la gare de Namur.',
  url: 'https://tareksalon.be',
  telephone: '+32465632205',
  email: 'contact@tareksalon.be',
  image: 'https://tareksalon.be/hero-bg1.jpeg',
  logo: 'https://tareksalon.be/icons/icon-512x512.png',
  hasMap: 'https://maps.app.goo.gl/YePu1ryxNkNZUgvZ8',
  potentialAction: {
    '@type': 'ReserveAction',
    target: 'https://tareksalon.be/fr/booking',
    result: {
      '@type': 'Reservation',
      name: 'Rendez-vous chez Tarek Salon',
    },
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+32465632205',
    contactType: 'customer service',
    areaServed: 'BE',
    availableLanguage: ['French', 'English']
  },
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card, Bancontact',
  
  // Adresse réelle
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rue Rogier 7A',
    addressLocality: 'Namur',
    addressRegion: 'Namur',
    postalCode: '5000',
    addressCountry: 'BE'
  },
  
  // Coordonnées GPS réelles
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 50.467900303318515,
    longitude: 4.8633730935488275
  },
  
  // Zone de service
  areaServed: [
    {
      '@type': 'City',
      name: 'Namur',
      '@id': 'https://www.wikidata.org/wiki/Q2221'
    },
    {
      '@type': 'State',
      name: 'Province de Namur'
    }
  ],
  
  // Horaires (À ajuster selon vrais horaires)
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Monday',
      opens: '09:30',
      closes: '19:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Tuesday',
      opens: '09:30',
      closes: '19:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Wednesday',
      opens: '09:30',
      closes: '19:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Thursday',
      opens: '09:30',
      closes: '19:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Friday',
      opens: '09:30',
      closes: '19:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:30',
      closes: '19:00'
    }
  ],
  
  // Services proposés
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services de coiffure',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Coupe Homme',
          description: 'Coupe de cheveux professionnelle pour homme'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Barbe',
          description: 'Taille et entretien de barbe'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Dégradé',
          description: 'Coupe dégradée moderne'
        }
      }
    ]
  },
  
  // Ajouter ici le profil Google Business et les réseaux sociaux officiels lorsqu'ils sont configurés.
  sameAs: ['https://maps.app.goo.gl/YePu1ryxNkNZUgvZ8']
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Geo meta tags pour SEO local */}
        <meta name="geo.region" content="BE-WNA" />
        <meta name="geo.placename" content="Namur" />
        <meta name="geo.position" content="50.467900;4.863373" />
        <meta name="ICBM" content="50.467900, 4.863373" />
        {/* PWA Service Worker Registration */}
        <script src="/register-sw.js" defer />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable} bg-ink text-bone`}>
        <LanguageProvider>
          <Header />
          <PageContent>
            {children}
          </PageContent>
          <Footer />
          <WhatsAppButton />
          <MobileBottomNav />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
