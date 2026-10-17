'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/language-context'
import { ArrowRight, CalendarCheck, Clock3, MapPin } from 'lucide-react'

const Hero = memo(function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Next.js Image optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg1.jpeg"
          alt={t.hero.imageAlt}
          fill
          priority
          quality={75}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4="
          className="object-cover object-[70%_center] brightness-[1.35] contrast-105 saturate-110"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/15" />
      </div>

      {/* Content Container - CSS animations instead of Framer Motion */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Title with gradient */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[1.05] tracking-tight drop-shadow-[0_3px_16px_rgba(0,0,0,0.75)] animate-fadeInUp"
            style={{ animationDelay: '0.1s' }}
          >
            {t.hero.title}
            <span className="block mt-2 bg-gradient-to-r from-orange-200 via-orange-400 to-accent bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {t.hero.titleAccent}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}
          >
            {t.hero.description}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}
          >
            <Link href="/booking" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-accent to-orange-300 text-white font-bold rounded-full transition-all duration-300 text-base sm:text-lg shadow-xl shadow-accent/25 hover:from-orange-300 hover:to-accent hover:shadow-2xl hover:shadow-accent/40 hover:scale-105 active:scale-98">
                {t.hero.btnBook}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/pricing" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-black/40 backdrop-blur-md text-white font-semibold rounded-full border border-white/40 transition-all duration-300 text-base sm:text-lg hover:bg-black/60 hover:scale-105 active:scale-98">
                {t.hero.btnLearn}
              </button>
            </Link>
          </div>

          <div
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto overflow-hidden rounded-2xl border border-white/20 bg-black/45 backdrop-blur-md text-left animate-fadeInUp"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/15">
              <MapPin className="w-5 h-5 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/55">{t.location.address}</p>
                <p className="text-sm font-semibold text-white">Rue Rogier 7A, Namur</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/15">
              <Clock3 className="w-5 h-5 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/55">{t.location.hours}</p>
                <p className="text-sm font-semibold text-white">{t.location.hoursValue}</p>
              </div>
            </div>
            <Link href="/booking" className="flex items-center gap-3 px-5 py-4 hover:bg-white/10 transition-colors">
              <CalendarCheck className="w-5 h-5 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/55">{t.hero.subtitle}</p>
                <p className="text-sm font-semibold text-white">{t.hero.btnBook}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - CSS animation */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block animate-fadeIn"
        style={{ animationDelay: '1.5s' }}
      >
        <div className="w-7 h-12 rounded-full border-2 border-white/60 flex items-start justify-center p-2">
          <div
            className="w-1.5 bg-accent rounded-full animate-bounce"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
      </div>
    </section>
  )
})

export default Hero