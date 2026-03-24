'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-yellow-500 rounded-xl flex items-center justify-center">
            <Shield size={24} className="text-black" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white">Politique de Confidentialité</h1>
        </div>
        <p className="text-gray-400 text-lg">Dernière mise à jour: 24 mars 2026</p>
      </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                1. Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Tarek Salon (ci-après &quot;nous&quot;, &quot;notre&quot;) respecte votre vie privée et s&apos;engage à protéger vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, protégeons et divulguons vos données lorsque vous utilisez notre site web et nos services de réservation en ligne.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                2. Données Collectées
              </h2>
              <p className="text-gray-300 mb-4">Nous collectons les informations suivantes :</p>
              <ul className="space-y-2 ml-6 text-gray-300">
                <li>✓ <strong>Données de Réservation</strong>: Nom, prénom, adresse email, numéro de téléphone, date et heure de réservation, service demandé</li>
                <li>✓ <strong>Données Techniques</strong>: Adresse IP, type de navigateur, pages visitées, temps d&apos;accès</li>
                <li>✓ <strong>Données Optionnelles</strong>: Messages ou notes supplémentaires lors de la réservation</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                3. Utilisation de Vos Données
              </h2>
              <p className="text-gray-300 mb-4">Vos données personnelles sont utilisées pour :</p>
              <ul className="space-y-2 ml-6 text-gray-300">
                <li>📅 Gérer et confirmer vos réservations</li>
                <li>💬 Vous envoyer des confirmations et rappels de rendez-vous</li>
                <li>📞 Vous contacter si nous avons besoin de clarifications</li>
                <li>📊 Analyser comment notre site est utilisé pour l&apos;améliorer</li>
                <li>🛡️ Détecter et prévenir la fraude</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                4. Base Légale (RGPD)
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Nous traitons vos données en vertu des bases légales suivantes :
              </p>
              <ul className="space-y-2 ml-6 text-gray-300 mt-4">
                <li><strong>Contrat</strong>: Pour exécuter votre réservation</li>
                <li><strong>Consentement</strong>: Pour les communications marketing (si accepté)</li>
                <li><strong>Obligation Légale</strong>: Pour respecter les exigences légales applicables</li>
                <li><strong>Intérêt Légitime</strong>: Pour améliorer nos services et prévenir la fraude</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                5. Durée de Conservation
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Vos données de réservation sont conservées pendant <strong>5 ans</strong> à des fins de comptabilité légale. Si vous demandez l&apos;annulation de votre profil, nous supprimons toutes vos données personnelles le plus rapidement possible, sauf si nous devons les conserver pour des raisons légales.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                6. Sécurité des Données
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Nous utilisons <strong>Supabase</strong>, une plateforme sécurisée avec chiffrement de bout en bout et authentification multi-niveaux. Cependant, aucune transmission sur Internet n&apos;est 100% sécurisée. Nous ne guarantissons pas la sécurité absolue.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                7. Vos Droits (RGPD)
              </h2>
              <p className="text-gray-300 mb-4">Vous avez les droits suivants :</p>
              <ul className="space-y-2 ml-6 text-gray-300">
                <li>📄 <strong>Droit d&apos;accès</strong>: Recevoir une copie de vos données</li>
                <li>✏️ <strong>Droit de rectification</strong>: Corriger vos données inexactes</li>
                <li>🗑️ <strong>Droit à l&apos;oubli</strong>: Supprimer vos données</li>
                <li>⛔ <strong>Droit à la limitation</strong>: Limiter le traitement de vos données</li>
                <li>📤 <strong>Droit à la portabilité</strong>: Recevoir vos données dans un format portable</li>
                <li>🚫 <strong>Droit d&apos;opposition</strong>: Vous opposer au traitement de vos données</li>
              </ul>
              <p className="text-gray-300 mt-4">Pour exercer ces droits, contactez-nous à <strong>contact@tareksalon.be</strong></p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                8. Partage de Données
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Nous ne vendons pas vos données à des tiers. Nous pouvons partager vos données uniquement avec :
              </p>
              <ul className="space-y-2 ml-6 text-gray-300 mt-4">
                <li>🔐 <strong>Supabase</strong>: Notre plateforme de base de données (sécurisée)</li>
                <li>🛡️ <strong>Autorités légales</strong>: Si requis par la loi</li>
                <li>📧 <strong>Services d&apos;email</strong>: Pour envoyer vos confirmations (si applicable)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                9. Cookies
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Notre site utilise des cookies essentiels pour la fonctionnalité de base et l&apos;authentification. Nous ne pratiquons pas le suivi publicitaire intrusif. En utilisant notre site, vous consentez à l&apos;utilisation de ces cookies essentiels.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                10. Contact & Réclamations
              </h2>
              <p className="text-gray-300 mb-4">Pour toute question sur cette politique :</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-gray-300">
                <p><strong>Tarek Salon</strong></p>
                <p>📍 Passage de la Gare 5, 5000 Namur, Belgique</p>
                <p>📞 +32 465 63 22 05</p>
                <p>📧 <a href="mailto:contact@tareksalon.be" className="text-accent hover:underline">contact@tareksalon.be</a></p>
              </div>
              <p className="text-gray-300 mt-4">
                Si vous n&apos;êtes pas satisfait de notre réponse, vous avez le droit de déposer une plainte auprès de votre autorité de protection des données nationale.
              </p>
            </section>
          </div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 pt-8 border-t border-white/10 flex justify-center"
          >
            <Link
              href="/"
              className="px-8 py-4 bg-accent hover:bg-accent/90 text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
            >
              Retour à l&apos;accueil
            </Link>
          </motion.div>
    </motion.div>
  )
}
