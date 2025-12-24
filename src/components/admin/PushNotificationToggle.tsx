'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Smartphone, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSecureContext, setIsSecureContext] = useState(true)

  useEffect(() => {
    checkSupport()
  }, [])

  async function checkSupport() {
    try {
      // Vérifier si on est dans un contexte sécurisé (HTTPS ou localhost)
      const secure = window.isSecureContext || 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      setIsSecureContext(secure)

      // Vérifier si le navigateur supporte les notifications
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
      setIsSupported(supported)

      if (supported && secure) {
        // Enregistrer le SW d'abord
        await navigator.serviceWorker.register('/sw.js')
        // Vérifier si déjà abonné
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }
    } catch (error) {
      console.error('Erreur vérification support:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function subscribeToPush() {
    try {
      setIsLoading(true)

      // Demander la permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permission de notification refusée')
        return
      }

      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Utiliser la clé VAPID directement depuis l'environnement
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!publicKey) {
        toast.error('Clé VAPID non configurée')
        throw new Error('Clé VAPID non configurée')
      }

      console.log('🔑 VAPID Key:', publicKey)

      // Vérifier si déjà abonné
      let subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        // Désabonner l'ancienne subscription
        await subscription.unsubscribe()
      }

      // Créer la subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      console.log('✅ Subscription créée:', subscription)

      // Enregistrer sur le serveur
      const saveResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(error.error || 'Erreur enregistrement subscription')
      }

      setIsSubscribed(true)
      toast.success('🔔 Notifications activées!')
    } catch (error) {
      console.error('Erreur activation notifications:', error)
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Activation impossible'}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true)

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Supprimer du serveur
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })

        // Désabonner localement
        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      toast.success('Notifications désactivées')
    } catch (error) {
      console.error('Erreur désactivation:', error)
      toast.error('Erreur lors de la désactivation')
    } finally {
      setIsLoading(false)
    }
  }

  // Convertir la clé VAPID en Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Contexte non sécurisé (HTTP sur mobile)
  if (!isSecureContext) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">
              HTTPS Requis
            </h3>
            <p className="text-gray-400 mb-4">
              Les notifications push nécessitent une connexion sécurisée (HTTPS).
              Utilisez localhost sur PC ou déployez sur Vercel.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 text-sm">
              <p className="text-gray-300 mb-2"><strong>Pour tester :</strong></p>
              <ul className="text-gray-400 space-y-1 list-disc list-inside">
                <li>Sur PC : http://localhost:3000 ✅</li>
                <li>Sur mobile : Déployez sur Vercel (HTTPS auto)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 text-gray-400">
          <BellOff className="w-5 h-5" />
          <span className="text-sm">Notifications non supportées sur ce navigateur</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-secondary/30 rounded-lg p-4 border border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isSubscribed ? 'bg-green-500/20' : 'bg-gray-700'}`}>
              {isSubscribed ? (
                <Bell className="w-5 h-5 text-green-400" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-white">Notifications Push</h3>
              <p className="text-sm text-gray-400">
                {isSubscribed 
                  ? 'Vous recevrez une alerte pour chaque nouvelle réservation' 
                  : 'Activez pour recevoir des alertes de réservation'}
              </p>
            </div>
          </div>

          <button
            onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isSubscribed
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-accent text-black hover:bg-accent/80'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : isSubscribed ? (
              <>
                <BellOff className="w-4 h-4" />
                Désactiver
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Activer
              </>
            )}
          </button>
        </div>

        {isSubscribed && (
          <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 text-sm text-green-400">
            <Bell className="w-4 h-4" />
            <span>✅ Notifications activées ! Vous recevrez une alerte à chaque réservation.</span>
          </div>
        )}
      </div>

      {isSubscribed && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Smartphone className="w-4 h-4" />
            <span>Astuce : Installez l&apos;app sur votre téléphone pour recevoir les notifications même quand le site est fermé</span>
          </div>
        </div>
      )}
    </div>
  )
}
