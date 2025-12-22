'use client'

import { motion } from 'framer-motion'
import ServiceCard from '@/components/ServiceCard'
import { services } from '@/lib/data'
import { Check } from 'lucide-react'

export default function PricingPage() {
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
      {/* Pricing Header */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-secondary to-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nos <span className="text-accent">Tarifs</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Des tarifs transparents pour tous nos services de coiffure. Réductions possibles pour forfaits.
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

      {/* FAQ Section */}
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
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-6"
          >
            {[
              {
                question: 'Puis-je modifier ma réservation ?',
                answer: 'Oui, vous pouvez modifier votre réservation jusqu\'à 24 heures avant le rendez-vous en contactant notre équipe.',
              },
              {
                question: 'Offrez-vous des réductions pour les forfaits ?',
                answer: 'Oui, nous proposons des réductions spéciales pour les services en forfait ou les abonnements annuels.',
              },
              {
                question: 'Quelle est votre politique d\'annulation ?',
                answer: 'Les annulations effectuées 48 heures avant le rendez-vous sont remboursées à 100%.',
              },
              {
                question: 'Acceptez-vous les cartes de crédit ?',
                answer: 'Oui, nous acceptons tous les types de cartes bancaires et les virements.',
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
