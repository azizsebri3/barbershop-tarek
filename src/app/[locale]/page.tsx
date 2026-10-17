'use client'

import { lazy, Suspense } from 'react'
import Hero from '@/components/Hero'
import { Star, Zap, Shield } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

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
  const features = [
    { icon: Star, title: t.features.feature1Title, desc: t.features.feature1Desc },
    { icon: Zap, title: t.features.feature2Title, desc: t.features.feature2Desc },
    { icon: Shield, title: t.features.feature3Title, desc: t.features.feature3Desc },
  ]

  return (
    <>
      <Hero />
      <section id="about" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            {t.about.label}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
            {t.about.title}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-gray-300">
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

      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-accent animate-fadeIn">
            {t.features.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-primary/50 rounded-lg p-6 border border-accent/20 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-2"
              >
                <feature.icon className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 scroll-mt-24">
        <Suspense fallback={<SkeletonLoader />}>
          <OpeningHours />
        </Suspense>
      </section>

      <Suspense fallback={<SkeletonLoader />}>
        <Testimonials />
      </Suspense>
    </>
  )
}
