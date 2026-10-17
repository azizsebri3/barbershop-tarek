'use client'

import dynamic from 'next/dynamic'
import { Star, Zap, Shield, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import LazyMap from '@/components/LazyMap'
import { useLanguage } from '@/lib/language-context'

// 🚀 Lazy load des composants lourds + loading states
const Hero = dynamic(() => import('@/components/Hero'), { ssr: true })
const ServiceCarousel = dynamic(() => import('@/components/ServiceCarousel'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gradient-to-b from-primary to-secondary animate-pulse rounded-lg" />,
})
const ClientPortfolio = dynamic(() => import('@/components/ClientPortfolio'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gradient-to-b from-secondary to-primary animate-pulse rounded-lg" />,
})

const OpeningHours = dynamic(() => import('@/components/OpeningHours'), {
  ssr: false,
  loading: () => <div className="h-48 bg-primary/50 animate-pulse rounded-lg" />,
})

const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  ssr: false,
  loading: () => <div className="h-64 bg-primary/50 animate-pulse rounded-lg" />,
})

export default function Home() {
  const { t } = useLanguage()
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

      {/* SEO Content Section - Invisible mais indexé */}
      <section className="sr-only">
        <h1>Tarek Salon — Maison de coiffure & barbershop signature à Namur</h1>
        <p>
          Rendez-vous dans notre salon signature à Namur pour des coupes modernes, des dégradés précis et une barbe entretenue avec soin.
          Nous travaillons des looks sur-mesure avec des produits professionnels et un accueil chaleureux, du premier clic à votre sortie du fauteuil.
          Réservation en ligne 24h/24.
        </p>
      </section>

      {/* SEO Content Section - Invisible mais indexé */}
      <section className="sr-only">
        <h1>Tarek Salon — Coiffure & Barbershop à Namur</h1>
        <p>
          Salon de coiffure moderne à Namur. Coupes tendance, dégradés professionnels, soins barbe.
          Réservation en ligne simple et rapide. Équipe passionnée, produits premium.
        </p>
      </section>

      {/* Services Carousel */}
      <section id="services">
        <ServiceCarousel />
      </section>

      {/* Client Portfolio */}
      <ClientPortfolio />

      {/* Why Choose Us - Concis */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fadeInUp">
            {t.features.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Star, title: t.features.feature1Title, description: t.features.feature1Desc },
              { icon: Zap, title: t.features.feature2Title, description: t.features.feature2Desc },
              { icon: Shield, title: t.features.feature3Title, description: t.features.feature3Desc },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-primary border border-primary hover:border-accent transition-all duration-300 hover:shadow-lg animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="text-accent text-3xl mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Opening Hours - Intégré avec contact */}
      <section id="contact" className="scroll-mt-24 py-16 px-4 sm:px-6 lg:px-8 bg-primary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.hours.title} & <span className="text-accent">{t.footer.contactTitle}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OpeningHours />

            {/* Contact Info */}
            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              <div className="text-center lg:text-left">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t.location.title} <span className="text-accent">{t.location.titleAccent}</span>
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>{t.location.addressValue}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                    <a href="tel:+32465632205" className="hover:text-accent transition-colors">
                      {t.hours.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <a
                      href="mailto:contact@tareksalon.be"
                      className="hover:text-accent transition-colors"
                    >
                      {t.location.email}: contact@tareksalon.be
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section with Maps */}
      <LazyMap />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent/20 to-accent/10 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            {t.cta.description}
          </p>

          <Link href="/booking">
            <button className="px-8 py-4 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 active:scale-95 transition-all text-lg">
              {t.hero.btnBook}
            </button>
          </Link>
        </div>
      </section>
    </>
  )
}
