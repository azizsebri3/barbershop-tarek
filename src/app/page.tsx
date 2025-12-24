'use client'

import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import ServiceCarousel from '@/components/ServiceCarousel'
import ClientPortfolio from '@/components/ClientPortfolio'
import Testimonials from '@/components/Testimonials'
import OpeningHours from '@/components/OpeningHours'
import { Star, Zap, Shield, MapPin, Phone, Clock, Scissors } from 'lucide-react'
import Link from 'next/link'

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

      {/* SEO Content Section - Invisible mais indexé */}
      <section className="sr-only">
        <h1>Tarek Salon - Coiffeur et Barbershop à Namur, Belgique</h1>
        <p>
          Bienvenue chez Tarek Salon, votre coiffeur professionnel à Namur. 
          Spécialisés dans les coupes hommes, dégradés, entretien de barbe et soins capillaires.
          Situé au cœur de Namur, nous offrons un service de qualité premium.
          Meilleur barbershop de la région namuroise. Réservation en ligne disponible 24h/24.
        </p>
      </section>

      {/* Local Info Banner - SEO + UX */}
      <section className="py-6 bg-accent/10 border-y border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-sm md:text-base">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-5 h-5 text-accent" />
              <span>Passage de la Gare 5, Namur</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-5 h-5 text-accent" />
              <a href="tel:+32465632205" className="hover:text-accent transition-colors">
                +32 465 63 22 05
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-5 h-5 text-accent" />
              <span>Lun-Sam: 9h-18h</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Scissors className="w-5 h-5 text-accent" />
              <span>Coiffeur • Barbier • Dégradé</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Carousel */}
      <section id="services">
        <ServiceCarousel />
      </section>

      {/* Client Portfolio */}
      <ClientPortfolio />

      {/* Features Section - SEO optimisé */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi Choisir <span className="text-accent">Tarek Salon</span> à Namur ?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Le meilleur salon de coiffure et barbershop de Namur, Belgique
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Star, title: 'Coiffeurs Experts à Namur', description: 'Nos coiffeurs namurois sont formés aux dernières tendances et techniques de coupe' },
              { icon: Zap, title: 'Service Rapide & Efficace', description: 'Résultats impeccables en respectant votre emploi du temps chargé' },
              { icon: Shield, title: 'Produits Professionnels', description: 'Produits de qualité premium et soins capillaires haut de gamme' },
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
          <p className="text-gray-400 text-lg">Votre coiffeur à Namur vous accueille du lundi au samedi</p>
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
            Réservez Votre Rendez-vous à Namur
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Prenez rendez-vous en ligne chez Tarek Salon, votre coiffeur et barbershop à Namur, Belgique.
            Service premium, résultat garanti.
          </p>

          <Link href="/booking">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-colors text-lg"
            >
              Réserver un Rendez-vous
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* SEO Footer Content - Visible et utile */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* À propos */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Tarek Salon Namur</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Votre coiffeur et barbershop de confiance à Namur, Belgique. 
                Spécialisés dans les coupes hommes, dégradés modernes, entretien de barbe 
                et soins capillaires professionnels. Plus de 10 ans d&apos;expérience au service 
                de la clientèle namuroise.
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Nos Services</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>✂️ Coupe homme à Namur</li>
                <li>✂️ Dégradé américain</li>
                <li>✂️ Taille de barbe</li>
                <li>✂️ Coloration</li>
                <li>✂️ Soins capillaires</li>
                <li>✂️ Coupe enfant Namur</li>
              </ul>
            </div>

            {/* Zone de service */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Zone de Service</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>📍 Namur Centre</li>
                <li>📍 Jambes</li>
                <li>📍 Salzinnes</li>
                <li>📍 Saint-Servais</li>
                <li>📍 Bouge</li>
                <li>📍 Province de Namur</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Contact</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>📍 Passage de la Gare 5, 5000 Namur</li>
                <li>📞 <a href="tel:+32465632205" className="hover:text-accent">+32 465 63 22 05</a></li>
                <li>📧 <a href="mailto:contact@tareksalon.be" className="hover:text-accent">contact@tareksalon.be</a></li>
                <li>🌐 <a href="https://tareksalon.be" className="hover:text-accent">tareksalon.be</a></li>
              </ul>
            </div>
          </div>

          {/* Keywords cloud for SEO */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-500 text-xs text-center">
              Coiffeur Namur • Barbershop Namur • Salon de coiffure Namur • Coiffeur homme Namur • 
              Dégradé Namur • Barbe Namur • Meilleur coiffeur Namur Belgique • Tarek Salon • 
              Coupe cheveux Namur • Barbier Namur Centre • Coiffeur pas cher Namur
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
