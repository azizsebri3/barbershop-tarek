'use client'

import { motion } from 'framer-motion'
import ServiceCard from '@/components/ServiceCard'
import { useServices } from '@/lib/useServices'
import { Check } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import ClientPortfolio from '@/components/ClientPortfolio'

export default function PricingPageContent() {
  const { t } = useLanguage()
  const { services, loading } = useServices()
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

  if (loading) {
    return (
      <>
        <ClientPortfolio />
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="text-gray-400 mt-4">Chargement des tarifs...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* SEO Hidden Content */}
      <div className="sr-only">
        <h1>Tarifs Coiffeur Namur - Prix Tarek Salon Barbershop</h1>
        <p>
          Découvrez nos tarifs compétitifs pour tous nos services de coiffure à Namur.
          Coupe homme, dégradé, barbe, coloration. Meilleur rapport qualité-prix de Namur, Belgique.
        </p>
      </div>

      <ClientPortfolio />

      {/* Pricing Header */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-secondary to-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.pricing.title} <span className="text-accent">{t.pricing.titleAccent}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            {t.pricing.description} - Coiffeur à Namur, Belgique
          </p>
        </motion.div>
      </div>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={itemVariants}>
              <ServiceCard
                title={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ Section - SEO optimisé pour Namur */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Questions <span className="text-accent">Fréquentes</span>
            </h2>
            <p className="text-gray-400">Tout ce que vous devez savoir sur notre salon de coiffure à Namur</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-6"
          >
            {[
              {
                question: 'Où se trouve Tarek Salon à Namur ?',
                answer: 'Passage de la Gare 5, en plein centre. Bus, train et parking sont à deux pas, venez quand ça vous arrange.',
              },
              {
                question: 'Puis-je modifier ma réservation ?',
                answer: "Bien sûr. Prévenez-nous 24h à l'avance et on ajuste votre créneau en douceur.",
              },
              {
                question: 'Offrez-vous des réductions pour les forfaits ?',
                answer: 'Oui, on a des tarifs doux pour les forfaits barbe + coupe et pour vos visites régulières.',
              },
              {
                question: 'Quel est le meilleur coiffeur à Namur ?',
                answer: 'Nos clients nous classent parmi les meilleures adresses de Namur (4.9/5). On vous accueille comme un habitué.',
              },
              {
                question: 'Acceptez-vous les paiements par carte ?',
                answer: 'Carte, Bancontact ou cash : payez comme vous préférez.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-primary p-6 rounded-xl border border-primary hover:border-accent transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Comparaison des <span className="text-accent">Services</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-accent">
                <th className="py-4 px-4 font-bold text-white">Caractéristiques</th>
                {services.map(service => (
                  <th key={service.id} className="py-4 px-4 font-bold text-accent text-center">{service.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Durée', values: services.map(s => `${s.duration} min`) },
                { label: 'Support Client', values: services.map(() => '✓') },
                { label: 'Rapport Détaillé', values: services.map((_, i) => i >= 1 ? '✓' : '') },
                { label: 'Suivi Personnalisé', values: services.map((_, i) => i === 3 ? '✓' : '') },
              ].map((row, index) => (
                <tr key={index} className="border-b border-primary hover:bg-primary/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-300">{row.label}</td>
                  {row.values.map((value, idx) => (
                    <td key={idx} className="py-4 px-4 text-center text-gray-400">
                      {value ? (value === '✓' ? <Check className="text-accent mx-auto" size={20} /> : value) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>
    </>
  )
}
