import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'
import { LanguageProvider } from '@/lib/language-context'

const locales = ['en', 'fr']

export const metadata: Metadata = {
  title: 'Elite Services - Barbershop',
  description: 'Premium barbershop experience. Book your appointment online.',
  icons: {
    icon: '/favicon.ico',
  },
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
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </LanguageProvider>
  )
}
