import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import '../globals.css'
import MobileBottomNav from '@/components/MobileBottomNav'
import { LanguageProvider } from '@/lib/language-context'

const locales = ['en', 'fr']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFrench = locale === 'fr'

  return {
    title: isFrench
      ? 'Tarek Salon | Coiffeur et barbershop à Namur'
      : 'Tarek Salon | Barber shop in Namur',
    description: isFrench
      ? 'Tarek Salon à Namur : coupes homme, dégradés, barbe et rendez-vous en ligne Rue Rogier 7A.'
      : 'Tarek Salon in Namur: men’s haircuts, fades, beard grooming and online booking at Rue Rogier 7A.',
    keywords: isFrench
      ? ['coiffeur Namur', 'barbershop Namur', 'coupe homme Namur', 'barbe Namur']
      : ['barber Namur', 'barbershop Namur', 'men haircut Namur', 'beard trim Namur'],
    alternates: {
      canonical: `https://tareksalon.be/${locale}`,
      languages: {
        'fr-BE': 'https://tareksalon.be/fr',
        'en-BE': 'https://tareksalon.be/en',
      },
    },
    openGraph: {
      title: isFrench
        ? 'Tarek Salon | Coiffeur et barbershop à Namur'
        : 'Tarek Salon | Barber shop in Namur',
      description: isFrench
        ? 'Coupes homme, dégradés et barbe à Namur. Réservez votre rendez-vous chez Tarek Salon.'
        : 'Men’s haircuts, fades and beard grooming in Namur. Book your appointment at Tarek Salon.',
      url: `https://tareksalon.be/${locale}`,
      locale: isFrench ? 'fr_BE' : 'en_BE',
      type: 'website',
    },
    icons: {
      icon: '/favicon.png',
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
      <MobileBottomNav />
    </LanguageProvider>
  )
}
