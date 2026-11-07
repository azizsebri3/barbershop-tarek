import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import '../globals.css'
import { LanguageProvider } from '@/lib/language-context'

const locales = ['en', 'fr', 'nl']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFrench = locale === 'fr'
  const isDutch = locale === 'nl'

  return {
    metadataBase: new URL('https://tareksalon.be'),
    title: isFrench
      ? 'Tarek Salon | Coiffeur et barbershop à Namur'
      : isDutch ? 'Tarek Salon | Barbershop in Namen' : 'Tarek Salon | Barber shop in Namur',
    description: isFrench
      ? 'Tarek Salon à Namur : coupes homme, dégradés, barbe et rendez-vous en ligne Rue Rogier 7A.'
      : isDutch
        ? 'Tarek Salon in Namen: herenkapsels, fades, baardverzorging en online afspraken aan Rue Rogier 7A.'
        : 'Tarek Salon in Namur: men’s haircuts, fades, beard grooming and online booking at Rue Rogier 7A.',
    alternates: {
      canonical: `https://tareksalon.be/${locale}`,
      languages: {
        'fr-BE': 'https://tareksalon.be/fr',
        'en-BE': 'https://tareksalon.be/en',
        'nl-BE': 'https://tareksalon.be/nl',
      },
    },
    openGraph: {
      title: isFrench
        ? 'Tarek Salon | Coiffeur et barbershop à Namur'
        : isDutch ? 'Tarek Salon | Barbershop in Namen' : 'Tarek Salon | Barber shop in Namur',
      description: isFrench
        ? 'Coupes homme, dégradés et barbe à Namur. Réservez votre rendez-vous chez Tarek Salon.'
        : isDutch
          ? 'Herenkapsels, fades en baardverzorging in Namen. Maak uw afspraak bij Tarek Salon.'
          : 'Men’s haircuts, fades and beard grooming in Namur. Book your appointment at Tarek Salon.',
      url: `https://tareksalon.be/${locale}`,
      locale: isFrench ? 'fr_BE' : isDutch ? 'nl_BE' : 'en_BE',
      type: 'website',
      images: ['/hero-bg1.jpeg'],
    },
    icons: {
      icon: '/favicon.ico',
    },
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = React.use(params)

  if (!locales.includes(locale as any)) {
    notFound()
  }

  return (
    <LanguageProvider initialLocale={locale}>
      {children}
    </LanguageProvider>
  )
}
