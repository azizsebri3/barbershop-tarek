/**
 * 🚀 Configuration globale du cache pour optimiser les performances
 * 
 * Ce fichier contient les TTL (Time To Live) et fonctions utilitaires
 * pour gérer le cache des données de l'application
 */

// TTL en millisecondes
export const CACHE_TTL = {
  SERVICES: 5 * 60 * 1000,        // 5 minutes - services changent peu
  HOURS: 10 * 60 * 1000,          // 10 minutes - horaires changent rarement
  SETTINGS: 15 * 60 * 1000,       // 15 minutes - settings presque statiques
  GALLERY: 5 * 60 * 1000,         // 5 minutes - photos ajoutées occasionnellement
  TESTIMONIALS: 3 * 60 * 1000,    // 3 minutes - avis ajoutés plus fréquemment
} as const

// Interface pour le cache générique
export interface CacheEntry<T> {
  data: T
  timestamp: number
  promise?: Promise<T> | null
}

// Fonction utilitaire pour vérifier si le cache est valide
export function isCacheValid(timestamp: number | null, ttl: number): boolean {
  if (!timestamp) return false
  return Date.now() - timestamp < ttl
}

// Fonction utilitaire pour créer un hook de cache générique
export function createCachedHook<T>(
  fetchFn: () => Promise<T>,
  defaultValue: T,
  ttl: number
) {
  let cachedData: T | null = null
  let cacheTimestamp: number | null = null
  let pendingPromise: Promise<T> | null = null

  return {
    getCached: () => cachedData,
    getTimestamp: () => cacheTimestamp,
    getPending: () => pendingPromise,
    
    fetch: async (): Promise<T> => {
      if (isCacheValid(cacheTimestamp, ttl) && cachedData) {
        return cachedData
      }

      if (pendingPromise) {
        return pendingPromise
      }

      pendingPromise = fetchFn()
      try {
        const data = await pendingPromise
        cachedData = data
        cacheTimestamp = Date.now()
        pendingPromise = null
        return data
      } catch (error) {
        console.error('Cache fetch error:', error)
        cachedData = defaultValue
        cacheTimestamp = Date.now()
        pendingPromise = null
        return defaultValue
      }
    },

    invalidate: () => {
      cachedData = null
      cacheTimestamp = null
      pendingPromise = null
    },

    update: (data: T) => {
      cachedData = data
      cacheTimestamp = Date.now()
    }
  }
}

// Fonction pour invalider tous les caches (utile après modifications admin)
export function invalidateAllCaches() {
  if (typeof window !== 'undefined') {
    // Dispatch un événement personnalisé pour que tous les hooks puissent réagir
    window.dispatchEvent(new CustomEvent('cache:invalidate-all'))
  }
}

// Fonction pour invalider un cache spécifique
export function invalidateCache(cacheName: keyof typeof CACHE_TTL) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`cache:invalidate-${cacheName.toLowerCase()}`))
  }
}
