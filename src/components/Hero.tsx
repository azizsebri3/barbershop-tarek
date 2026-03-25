'use client'

import { memo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/language-context'
import { Sparkles, ArrowRight } from 'lucide-react'

const Hero = memo(function Hero() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768)
  }, [])

  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Next.js Image optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing.png"
          alt="Tarek Salon Namur - Coiffeur et Barbershop"
          fill
          priority
          quality={isMobile ? 50 : 75}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwYTBhMGEiLz48L3N2Zz4="
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          loading="eager"
        />
        
        {/* Multi-layer gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        
        {/* Animated glassmorphism orbs - disabled on mobile for perf */}
        {!isMobile && (
          <>
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-20" />
            <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] opacity-15" />
          </>
        )}
      </div>

      {/* Content Container - CSS animations instead of Framer Motion */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
        <div className="max-w-5xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-lg shadow-black/20 animate-fadeInUp"
            style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white/90 tracking-wide">
              {t.hero.subtitle}
            </span>
          </div>

          {/* Main Title with gradient */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}>
            {t.hero.title}
            <span className="block mt-2 bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
              {t.hero.titleAccent}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}>
            {t.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fadeInUp"
            style={{ animationDelay: '0.4s' }}>
            <Link href="/booking" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-accent to-yellow-500 text-black font-bold rounded-full transition-all duration-300 text-base sm:text-lg shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/40 hover:scale-105 active:scale-98">
                {t.hero.btnBook}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            
            <Link href="/pricing" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border border-white/30 transition-all duration-300 text-base sm:text-lg hover:bg-white/20 hover:scale-105 active:scale-98">
                {t.hero.btnLearn}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - CSS animation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block animate-fadeIn"
        style={{ animationDelay: '1.5s' }}>
        <div className="w-7 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 bg-accent rounded-full animate-bounce" style={{ animationDuration: '1.5s' }} />
        </div>
      </div>
    </section>
  )
})

export default Hero
