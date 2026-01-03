'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Star, Zap, Shield, MapPin, Phone, Clock } from 'lucide-react'
import Link from 'next/link'

// Lazy load des composants lourds
const Hero = dynamic(() => import('@/components/Hero'), { ssr: true })
const ServiceCarousel = dynamic(() => import('@/components/ServiceCarousel'), { ssr: false })
const ClientPortfolio = dynamic(() => import('@/components/ClientPortfolio'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const OpeningHours = dynamic(() => import('@/components/OpeningHours'), { ssr: false })

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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Pourquoi <span className="text-accent">Tarek Salon</span> ?
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Star, title: 'Expertise', description: 'Plus de 10 ans d\'expérience en coiffure moderne' },
              { icon: Zap, title: 'Rapidité', description: 'Service efficace sans compromettre la qualité' },
              { icon: Shield, title: 'Qualité', description: 'Produits professionnels et techniques éprouvées' },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="text-center p-6 rounded-xl bg-primary border border-primary hover:border-accent transition-colors"
                >
                  <Icon className="text-accent text-3xl mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Opening Hours - Intégré avec contact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Horaires & <span className="text-accent">Contact</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OpeningHours />

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center lg:text-left">
                <h3 className="text-xl font-bold text-white mb-4">Nous Trouver</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>Passage de la Gare 5, Namur</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                    <a href="tel:+32465632205" className="hover:text-accent transition-colors">
                      +32 465 63 22 05
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section with Maps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trouvez-Nous à <span className="text-accent">Namur</span>
            </h2>
            <p className="text-gray-400 text-lg">Passage de la Gare 5, au cœur de Namur — parking et transports à proximité</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden shadow-2xl border border-primary/50 hover:border-accent/50 transition-colors mb-12"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5125.421648937018!2d4.860792076398837!3d50.46784768611116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c199676d2eb1d5%3A0x560fefdeeb40e96e!2sGolden%20Salon!5e1!3m2!1sen!2sbe!4v1767402185853!5m2!1sen!2sbe"
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
              <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Adresse</h3>
              <p className="text-gray-400">Passage de la Gare 5<br />5000 Namur, Belgique</p>
            </div>
            <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
              <Phone className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Téléphone</h3>
              <a href="tel:+32465632205" className="text-gray-400 hover:text-accent transition-colors">
                +32 465 63 22 05
              </a>
            </div>
            <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
              <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Horaires</h3>
              <p className="text-gray-400">Lun-Sam: 9h-18h<br />Dimanche: Fermé</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent/20 to-accent/10 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Réservez votre créneau à Namur
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Choisissez l&apos;heure qui vous arrange, on s&apos;occupe du reste avec un accueil chaleureux et des finitions impeccables.
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
    </>
  )
}
