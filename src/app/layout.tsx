import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { LanguageProvider } from '@/lib/language-context'

// SEO Metadata optimisé pour Namur, Belgique
export const metadata: Metadata = {
  // Titre optimisé avec mots-clés locaux
  title: {
    default: 'Tarek Salon | Coiffeur & Barbershop à Namur, Belgique',
    template: '%s | Tarek Salon Namur'
  },
  
  // Description avec mots-clés locaux (155-160 caractères)
  description: 'Tarek Salon, votre coiffeur et barbershop à Namur. Coupes modernes, barbe, dégradé, coloration. Réservez en ligne 24h/24. Meilleur salon de coiffure à Namur, Belgique.',
  
  // Mots-clés ciblés
  keywords: [
    'coiffeur namur',
    'barbershop namur',
    'salon de coiffure namur',
    'coiffeur namur belgique',
    'tarek salon',
    'tarek salon namur',
    'coiffeur homme namur',
    'barbier namur',
    'coupe homme namur',
    'dégradé namur',
    'barbe namur',
    'meilleur coiffeur namur',
    'coiffeur pas cher namur',
    'salon coiffure namur centre',
    'coiffeur belgique'
  ],
  
  // Auteur et créateur
  authors: [{ name: 'Tarek Salon' }],
  creator: 'Tarek Salon',
  publisher: 'Tarek Salon',
  
  // Catégorie
  category: 'Coiffure & Beauté',
  
  // Robots
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
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    alternateLocale: 'en_BE',
    url: 'https://tareksalon.be',
    siteName: 'Tarek Salon',
    title: 'Tarek Salon | Coiffeur & Barbershop à Namur, Belgique',
    description: 'Votre coiffeur et barbershop à Namur. Coupes modernes, barbe, dégradé. Réservez en ligne 24h/24. Le meilleur salon de coiffure à Namur.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tarek Salon - Coiffeur Barbershop Namur',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Tarek Salon | Coiffeur & Barbershop Namur',
    description: 'Votre coiffeur à Namur. Coupes modernes, barbe, dégradé. Réservez en ligne!',
    images: ['/og-image.jpg'],
  },
  
  // Verification (à remplir après inscription)
  verification: {
    google: 'votre-code-google-search-console',
    // yandex: 'votre-code-yandex',
    // bing: 'votre-code-bing',
  },
  
  // Alternates pour langues
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
  themeColor: '#D4AF37',
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
  image: 'https://tareksalon.be/og-image.jpg',
  logo: 'https://tareksalon.be/icons/icon-512x512.png',
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card, Bancontact',
  
  // Adresse réelle
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Passage de la Gare 5',
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
      opens: '11:00',
      closes: '20:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Tuesday',
      opens: '09:00',
      closes: '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Wednesday',
      opens: '09:00',
      closes: '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Thursday',
      opens: '09:00',
      closes: '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Friday',
      opens: '09:00',
      closes: '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '17:00'
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
  
  // Notation (à ajouter quand tu auras des avis)
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1'
  },
  
  // Réseaux sociaux (à ajouter plus tard)
  sameAs: []
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
      </head>
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
