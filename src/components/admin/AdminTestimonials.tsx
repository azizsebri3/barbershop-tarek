'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Trash2, CheckCircle, XCircle, RefreshCw, Mail, User, MessageSquare, Calendar } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Testimonial {
  id: string
  name: string
  email: string
  rating: number
  message: string
  service: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/testimonials/admin', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }
      
      const data = await response.json()
      setTestimonials(data)
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Erreur lors du chargement des avis')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_approved: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update testimonial')
      }

      toast.success(currentStatus ? 'Avis masqué' : 'Avis approuvé !')
      fetchTestimonials()
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return
    }

    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete testimonial')
      }

      toast.success('Avis supprimé')
      fetchTestimonials()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleteLoading(null)
    }
  }

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === 'approved') return t.is_approved
    if (filter === 'pending') return !t.is_approved
    return true
  })

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter((t) => t.is_approved).length,
    pending: testimonials.filter((t) => !t.is_approved).length,
    avgRating: testimonials.length > 0
      ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
      : '0',
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestion des Avis Clients</h2>
          <p className="text-gray-400 text-sm">
            Approuvez ou supprimez les feedbacks clients
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchTestimonials}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border border-green-500/20">
          <p className="text-gray-400 text-sm mb-1">Approuvés</p>
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl border border-yellow-500/20">
          <p className="text-gray-400 text-sm mb-1">En attente</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-accent/10 to-transparent rounded-xl border border-accent/20">
          <p className="text-gray-400 text-sm mb-1">Note moyenne</p>
          <p className="text-2xl font-bold text-accent">{stats.avgRating}/5</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-full sm:w-fit">
        {(['all', 'approved', 'pending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-accent text-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'approved' ? 'Approuvés' : 'En attente'}
          </button>
        ))}
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucun avis {filter === 'approved' ? 'approuvé' : filter === 'pending' ? 'en attente' : 'trouvé'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTestimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-6 rounded-2xl border transition-all ${
                  testimonial.is_approved
                    ? 'bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20'
                    : 'bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{testimonial.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <p className="text-sm text-gray-400">{testimonial.email}</p>
                          </div>
                          {testimonial.service && (
                            <p className="text-xs text-accent mt-1">Service: {testimonial.service}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        testimonial.is_approved
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {testimonial.is_approved ? (
                          <>
                            <CheckCircle size={12} />
                            Approuvé
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            En attente
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < testimonial.rating ? 'fill-accent text-accent' : 'text-gray-600'}
                        />
                      ))}
                    </div>

                    {/* Message */}
                    <p className="text-gray-300 leading-relaxed">&ldquo;{testimonial.message}&rdquo;</p>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} />
                      {new Date(testimonial.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:w-32">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(testimonial.id, testimonial.is_approved)}
                      className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        testimonial.is_approved
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                      }`}
                    >
                      {testimonial.is_approved ? (
                        <>
                          <XCircle size={16} />
                          <span className="hidden sm:inline">Masquer</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span className="hidden sm:inline">Approuver</span>
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(testimonial.id)}
                      disabled={deleteLoading === testimonial.id}
                      className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 disabled:bg-red-500/10 disabled:text-red-600 disabled:cursor-not-allowed border border-red-500/30 font-medium transition-all"
                    >
                      {deleteLoading === testimonial.id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      <span className="hidden sm:inline">
                        {deleteLoading === testimonial.id ? 'Suppression...' : 'Supprimer'}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
