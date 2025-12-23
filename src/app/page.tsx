'use client'

import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import ServiceCard from '@/components/ServiceCard'
import ServiceCarousel from '@/components/ServiceCarousel'
import ClientPortfolio from '@/components/ClientPortfolio'
import Testimonials from '@/components/Testimonials'
import OpeningHours from '@/components/OpeningHours'
import { services } from '@/lib/data'
import { Star, Zap, Shield } from 'lucide-react'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <>
      <Hero />

      {/* Services Carousel */}
      <section id="services">
        <ServiceCarousel />
      </section>

      {/* Client Portfolio */}
      <ClientPortfolio />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi Nous Choisir ?
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Star, title: 'Coiffeurs Experts', description: 'Nos coiffeurs sont formés aux dernières tendances' },
              { icon: Zap, title: 'Rapide & Efficace', description: 'Résultats impeccables respectant vos délais' },
              { icon: Shield, title: 'Produits de Qualité', description: 'Produits professionnels et soins capillaires premium' },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="text-center p-8 rounded-xl bg-primary border border-primary hover:border-accent transition-colors"
                >
                  <Icon className="text-accent text-4xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Opening Hours Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Horaires <span className="text-accent">d&apos;Ouverture</span>
          </h2>
          <p className="text-gray-400 text-lg">Nous vous accueillons du lundi au samedi</p>
        </motion.div>

        <OpeningHours />
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent/20 to-accent/10 relative overflow-hidden">
        <motion.div
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Réservez Votre Rendez-vous
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Prenez rendez-vous en ligne et bénéficiez de notre service de coiffure premium en Belgique.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-colors text-lg"
          >
            Réserver un Rendez-vous
          </motion.button>
        </motion.div>
      </section>
    </>
  )
}
