'use client'

import { lazy, Suspense } from 'react'
import Hero from '@/components/Hero'
import { useLanguage } from '@/lib/language-context'
import LazyMap from '@/components/LazyMap'
import BookingLink from '@/components/BookingLink'

// Lazy load non-critical components
const ServiceCarousel = lazy(() => import('@/components/ServiceCarousel'))
const ClientPortfolio = lazy(() => import('@/components/ClientPortfolio'))
const OpeningHours = lazy(() => import('@/components/OpeningHours'))
const Testimonials = lazy(() => import('@/components/Testimonials'))

// Loading skeleton
function SkeletonLoader() {
  return (
    <div className="w-full h-64 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 animate-pulse rounded-lg" />
  )
}

export default function LocalePage() {
  const { t } = useLanguage()
  return (
    <>
      <Hero />
      <section id="about" className="relative py-20 md:py-32 px-5 md:px-8 bg-ink">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            {t.about.label}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-bone mb-6 tracking-tight">
            {t.about.title}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-zinc-400">
            {t.about.description}
          </p>
        </div>
      </section>
      <section id="services">
        <Suspense fallback={<SkeletonLoader />}>
          <ServiceCarousel />
        </Suspense>
      </section>

      <Suspense fallback={<SkeletonLoader />}>
        <ClientPortfolio />
      </Suspense>

      <section id="contact" className="py-20 md:py-32 px-5 md:px-8 scroll-mt-24 bg-ink">
        <Suspense fallback={<SkeletonLoader />}>
          <OpeningHours />
        </Suspense>
      </section>

      <LazyMap />

      <Suspense fallback={<SkeletonLoader />}>
        <Testimonials />
      </Suspense>

      <section className="relative overflow-hidden bg-surface px-5 py-20 md:px-8 md:py-32">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-bone md:text-5xl">{t.cta.title}</h2>
          <p className="mb-8 text-lg leading-relaxed text-zinc-400">{t.cta.description}</p>
          <BookingLink className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-8 py-4 font-bold text-ink transition-colors hover:bg-accent-hover">
            {t.nav.booking}
          </BookingLink>
        </div>
      </section>
    </>
  )
}
