import { useState, useEffect, useCallback } from 'react'
import { clearAdminSession } from '@/lib/admin-auth'

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkedOnce, setCheckedOnce] = useState(false)

  const checkAdminStatus = useCallback(async () => {
    if (checkedOnce && !loading) return
    
    try {
      const response = await fetch('/api/admin/check')
      if (!response.ok) throw new Error('Admin session verification failed')
      const data = await response.json()
      setIsAdmin(data.authenticated === true)
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
    logout,
    checkAdminStatus
  }
}