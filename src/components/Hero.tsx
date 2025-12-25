'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  }

  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Next.js Image optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing.png"
          alt="Elite Services - Landing"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
        
        {/* Multi-layer gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        
        {/* Animated glassmorphism orbs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1.1 }}
          transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]"
        />
      </div>

      {/* Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Premium Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-lg shadow-black/20"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white/90 tracking-wide">
              {t.hero.subtitle}
            </span>
          </motion.div>

          {/* Main Title with gradient */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            {t.hero.title}
            <span className="block mt-2 bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
              {t.hero.titleAccent}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {t.hero.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link href="/booking" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-accent to-yellow-500 text-black font-bold rounded-full transition-all duration-300 text-base sm:text-lg shadow-xl shadow-accent/25"
              >
                {t.hero.btnBook}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
            
            <Link href="/pricing" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border border-white/30 transition-all duration-300 text-base sm:text-lg"
              >
                {t.hero.btnLearn}
              </motion.button>
            </Link>
          </motion.div>


        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-7 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ height: ['20%', '60%', '20%'], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 bg-accent rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
