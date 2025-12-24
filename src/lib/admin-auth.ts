/**
 * Admin Authentication Helper
 * Gère la session admin avec expiration longue pour PWA/iPhone
 */

interface AdminSession {
  authenticated: boolean
  expiresAt: number // timestamp
  rememberMe: boolean
}

const SESSION_KEY = 'adminSession'
const SHORT_EXPIRY = 24 * 60 * 60 * 1000 // 24 heures
const LONG_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 jours

/**
 * Crée une nouvelle session admin
 */
export function createAdminSession(rememberMe: boolean = true): void {
  const expiry = rememberMe ? LONG_EXPIRY : SHORT_EXPIRY
  const session: AdminSession = {
    authenticated: true,
    expiresAt: Date.now() + expiry,
    rememberMe,
  }
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    // Backup dans sessionStorage pour iOS PWA
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Erreur sauvegarde session:', error)
  }
}

/**
 * Vérifie si la session admin est valide
 */
export function isAdminAuthenticated(): boolean {
  try {
    // Essayer localStorage d'abord
    let sessionData = localStorage.getItem(SESSION_KEY)
    
    // Fallback vers sessionStorage (utile pour iOS PWA)
    if (!sessionData) {
      sessionData = sessionStorage.getItem(SESSION_KEY)
      // Restaurer dans localStorage si trouvé
      if (sessionData) {
        localStorage.setItem(SESSION_KEY, sessionData)
      }
    }
    
    // Rétro-compatibilité avec l'ancien système
    if (!sessionData) {
      const oldAuth = localStorage.getItem('adminAuthenticated')
      if (oldAuth === 'true') {
        // Migrer vers le nouveau système avec session longue
        createAdminSession(true)
        localStorage.removeItem('adminAuthenticated')
        return true
      }
      return false
    }
    
    const session: AdminSession = JSON.parse(sessionData)
    
    // Vérifier si la session est expirée
    if (Date.now() > session.expiresAt) {
      clearAdminSession()
      return false
    }
    
    // Renouveler la session si elle expire dans moins de 7 jours et rememberMe est actif
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (session.rememberMe && (session.expiresAt - Date.now()) < sevenDays) {
      renewAdminSession()
    }
    
    return session.authenticated
  } catch (error) {
    console.error('Erreur vérification session:', error)
    return false
  }
}

/**
 * Renouvelle la session admin
 */
export function renewAdminSession(): void {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (sessionData) {
      const session: AdminSession = JSON.parse(sessionData)
      if (session.rememberMe) {
        session.expiresAt = Date.now() + LONG_EXPIRY
      } else {
        session.expiresAt = Date.now() + SHORT_EXPIRY
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
  } catch (error) {
    console.error('Erreur renouvellement session:', error)
  }
}

/**
 * Supprime la session admin
 */
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    // Nettoyer aussi l'ancien format
    localStorage.removeItem('adminAuthenticated')
  } catch (error) {
    console.error('Erreur suppression session:', error)
  }
}

/**
 * Récupère les infos de la session
 */
export function getSessionInfo(): { expiresIn: string; rememberMe: boolean } | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!sessionData) return null
    
    const session: AdminSession = JSON.parse(sessionData)
    const remainingMs = session.expiresAt - Date.now()
    
    if (remainingMs <= 0) return null
    
    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000))
    const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    
    let expiresIn: string
    if (days > 0) {
      expiresIn = `${days} jour${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      expiresIn = `${hours} heure${hours > 1 ? 's' : ''}`
    } else {
      expiresIn = 'moins d\'une heure'
    }
    
    return {
      expiresIn,
      rememberMe: session.rememberMe,
    }
  } catch {
    return null
  }
}
