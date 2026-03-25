'use client'

import { lazy, Suspense } from 'react'
import Hero from '@/components/Hero'
import { Star, Zap, Shield } from 'lucide-react'

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
  const features = [
    { icon: Star, title: 'Excellence', desc: 'Service de qualité supérieure' },
    { icon: Zap, title: 'Rapidité', desc: 'Rendez-vous pris en quelques minutes' },
    { icon: Shield, title: 'Confiance', desc: 'Votre satisfaction est garantie' },
  ]

  return (
    <>
      <Hero />
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
            Nos Avantages
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

      <section className="py-20 px-4">
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
