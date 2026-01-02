'use client'

import { useState, useEffect } from 'react'

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setIsAdmin(data.authenticated)
    } catch (error) {
      console.error('Erreur vérification admin:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

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