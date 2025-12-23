'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  const { t } = useLanguage()

  return (
    <section className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary pt-20 relative overflow-hidden flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-10 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-10 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative"
      >
        <motion.div variants={itemVariants} className="mb-2 sm:mb-4">
          <span className="text-accent font-semibold text-xs sm:text-sm md:text-base">{t.hero.subtitle}</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight"
        >
          {t.hero.title}<span className="text-accent">{t.hero.titleAccent}</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mb-6 sm:mb-8">
          {t.hero.description}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <Link href="/booking">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-colors text-sm sm:text-base md:text-lg"
            >
              {t.hero.btnBook}
            </motion.button>
          </Link>
          <Link href="/pricing">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-accent text-accent font-bold rounded-lg hover:bg-accent/10 transition-colors text-sm sm:text-base md:text-lg"
            >
              {t.hero.btnLearn}
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-16"
        >
          {[
            { label: t.hero.stat1, value: '800+' },
            { label: t.hero.stat2, value: '3000+' },
            { label: t.hero.stat3, value: '15+' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center p-4"
            >
              <p className="text-3xl md:text-4xl font-bold text-accent mb-2">{stat.value}</p>
              <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
