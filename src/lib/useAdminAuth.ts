import { useState, useEffect, useCallback } from 'react'
import { createAdminSession, clearAdminSession } from '@/lib/admin-auth'

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkedOnce, setCheckedOnce] = useState(false)

  const checkAdminStatus = useCallback(async () => {
    if (checkedOnce && !loading) return
    
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setIsAdmin(data.authenticated)
    } catch (error) {
      console.error('Erreur vérification admin:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
      setCheckedOnce(true)
    }
  }, [checkedOnce, loading])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])



  const login = async (password: string) => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAdmin(true)
        createAdminSession(true) // Créer la session localStorage aussi
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Erreur connexion admin:', error)
      return { success: false, error: 'Erreur de connexion' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      setIsAdmin(false)
      clearAdminSession() // Effacer la session localStorage aussi
    } catch (error) {
      console.error('Erreur déconnexion admin:', error)
    }
  }

  return {
    isAdmin,
    loading,
    login,
    logout,
    checkAdminStatus
  }
}