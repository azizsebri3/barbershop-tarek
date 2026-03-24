'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function TermsPage() {
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
                <FileText size={24} className="text-black" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Conditions d&apos;Utilisation</h1>
            </div>
            <p className="text-gray-400 text-lg">Dernière mise à jour: 24 mars 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                1. Acceptation des Conditions
              </h2>
              <p className="text-gray-300 leading-relaxed">
                En accédant et en utilisant le site web de Tarek Salon (tareksalon.be), vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site. Nous nous réservons le droit de modifier ces conditions à tout moment, et votre utilisation continue du site constitue votre acceptation de toute modification.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                2. Utilisation Appropriée du Site
              </h2>
              <p className="text-gray-300 mb-4">Vous acceptez d&apos;utiliser ce site uniquement à des fins légales et de ne pas :</p>
              <ul className="space-y-2 ml-6 text-gray-300">
                <li>❌ Harasser, menacer ou intimider d&apos;autres utilisateurs</li>
                <li>❌ Poster du contenu illégal, diffamatoire ou obscène</li>
                <li>❌ Utiliser des bots ou scripts automatisés pour accéder au site</li>
                <li>❌ Tenter de contourner les mesures de sécurité</li>
                <li>❌ Collecter ou stocker des données personnelles sans autorisation</li>
                <li>❌ Spammer ou envoyer du contenu non sollicité</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                3. Processus de Réservation
              </h2>
              <p className="text-gray-300 mb-4">Lors de la réservation d&apos;un rendez-vous :</p>
              <ul className="space-y-2 ml-6 text-gray-300">
                <li>📅 <strong>Confirmation</strong>: Vous recevrez une confirmation par email</li>
                <li>⏰ <strong>Ponctualité</strong>: Veuillez arriver 5 à 10 minutes avant votre rendez-vous</li>
                <li>💳 <strong>Pas de Dépôt</strong>: Aucun paiement préalable n&apos;est requis pour réserver</li>
                <li>📞 <strong>Annulation</strong>: Annulez au moins 24 heures à l&apos;avance si possible</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                4. Politique d&apos;Annulation
              </h2>
              <p className="text-gray-300 mb-4">
                <strong>Cancellation Policy:</strong>
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 ml-6 text-gray-300">
                <p>✅ <strong>Gratuit</strong>: Annulation 24 heures avant le rendez-vous</p>
                <p>⚠️ <strong>Avertissement</strong>: Annulation moins de 24 heures = peut être facturé</p>
                <p>❌ <strong>Non-présentation</strong>: Sans préavis = 50% du prix du service</p>
              </div>
              <p className="text-gray-300 mt-4">
                Nous comprenons que les situations imprévues arrivent. Veuillez nous contacter dès que possible si vous devez annuler ou reprogrammer.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                5. Politique de Reprogrammation
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Vous pouvez reprogrammer votre rendez-vous gratuitement jusqu&apos;à <strong>48 heures avant l&apos;horaire</strong> via notre plateforme en ligne ou en nous contactant directement. Les reprogrammations tardives sont soumises à la disponibilité.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                6. Responsabilité Limitée
              </h2>
              <p className="text-gray-300 mb-4">
                Tarek Salon ne peut pas être tenu responsable de :
              </p>
              <ul className="space-y-2 ml-6 text-gray-300">
                <li>⚠️ Les résultats de coiffure suite à des instructions peu claires</li>
                <li>⚠️ Les réactions allergiques à des produits (veuillez déclarer les allergies)</li>
                <li>⚠️ Les dommages à vos vêtements (portez des vêtements appropriés)</li>
                <li>⚠️ L&apos;interruption du service due à des circonstances indépendantes de notre volonté</li>
                <li>⚠️ Les bugs ou erreurs techniques isolés du site</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                7. Propriété Intellectuelle
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Tout le contenu du site web (textes, images, logos, vidéos, designs) est la propriété de Tarek Salon ou de ses fournisseurs de contenu et est protégé par les lois sur les droits d&apos;auteur. Vous n&apos;êtes pas autorisé à reproduire, distribuer ou transmettre ce contenu sans permission préalable écrite.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                8. Liens Externes
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Notre site peut contenir des liens vers des sites tiers. Nous ne sommes pas responsables du contenu, de la précision ou des pratiques de confidentialité de ces sites externos. Utilisez-les à vos propres risques et consultez leurs conditions d&apos;utilisation.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                9. Limitation de Responsabilité
              </h2>
              <p className="text-gray-300 leading-relaxed">
                SAUF DISPOSITION CONTRAIRE DE LA LOI, TAREK SALON NE SERA RESPONSABLE D&apos;AUCUN DOMMAGE INDIRECT, ACCIDENTEL, SPÉCIAL, CONSÉCUTIF OU PUNITIF DÉCOULANT DE VOS UTILISATIONS DU SITE. NOTRE RESPONSABILITÉ TOTALE NE DÉPASSE PAS LE MONTANT QUE VOUS AVEZ VERSÉ POUR VOTRE RENDEZ-VOUS.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                10. Compensation pour Insatisfaction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Si vous n&apos;êtes pas satisfait de votre service, veuillez nous contacter <strong>dans les 24 heures</strong> de votre rendez-vous. Nous ferons de notre mieux pour résoudre le problème, qui peut inclure une re-coupe gratuite ou une compensation partielle si approprié.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                11. Conformité Légale
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Ces conditions d&apos;utilisation sont régies par les lois de Belgique. Tout litige découlant de votre utilisation du site ou de nos services sera soumis à la juridiction exclusive des tribunaux belges.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                12. Contact & Support
              </h2>
              <p className="text-gray-300 mb-4">Pour toute question ou réclamation :</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-gray-300">
                <p><strong>Tarek Salon</strong></p>
                <p>📍 Passage de la Gare 5, 5000 Namur, Belgique</p>
                <p>📞 +32 465 63 22 05</p>
                <p>📧 <a href="mailto:contact@tareksalon.be" className="text-accent hover:underline">contact@tareksalon.be</a></p>
                <p className="mt-4">Horaires: Lun-Sam 9h00-19h00 | Dimanche: Fermé</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                13. Modifications des Conditions
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Tarek Salon se réserve le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur immédiatement après leur publication sur le site. Votre utilisation continue du site après les modifications constitue votre acceptation des nouvelles conditions. Nous vous encourageons à consulter cette page régulièrement.
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
