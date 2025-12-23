'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, Plus, Trash2, Edit } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { services as defaultServices } from '@/lib/data'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>(defaultServices)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newService, setNewService] = useState<Partial<Service>>({})

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      console.log('📥 Chargement des services depuis API...')
      const response = await fetch('/api/services')
      const data = await response.json()

      if (data.error) {
        console.error('❌ Erreur API:', data.error)
        // Fallback to localStorage
        const saved = localStorage.getItem('admin_services')
        if (saved) {
          setServices(JSON.parse(saved))
        }
      } else if (data.services) {
        console.log('✅ Services chargés:', data.services)
        setServices(data.services)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des services:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('admin_services')
      if (saved) {
        setServices(JSON.parse(saved))
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      console.log('💾 Sauvegarde des services:', services)

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ services }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', data.error)
        // Fallback to localStorage
        localStorage.setItem('admin_services', JSON.stringify(services))
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      console.log('✅ Services sauvegardés avec succès')
      // Also save to localStorage as backup
      localStorage.setItem('admin_services', JSON.stringify(services))
      toast.success('Services sauvegardés avec succès !')
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      // Fallback to localStorage
      localStorage.setItem('admin_services', JSON.stringify(services))
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const addService = () => {
    if (!newService.name || !newService.description || !newService.price || !newService.duration) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const service: Service = {
      id: `service-${Date.now()}`,
      name: newService.name,
      description: newService.description,
      price: newService.price,
      duration: newService.duration,
    }

    setServices(prev => [...prev, service])
    setNewService({})
    toast.success('Service ajouté !')
  }

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(service =>
      service.id === id ? { ...service, ...updates } : service
    ))
  }

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id))
    toast.success('Service supprimé !')
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Gestion des Services</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 disabled:opacity-50 text-sm sm:text-base"
        >
          {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          Sauvegarder
        </motion.button>
      </div>

      {/* Add New Service */}
      <div className="bg-primary/50 rounded-lg p-3 sm:p-6 border border-accent/20 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Plus size={18} />
          Ajouter un nouveau service
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <input
            type="text"
            placeholder="Nom du service"
            value={newService.name || ''}
            onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
          />
          <input
            type="text"
            placeholder="Description"
            value={newService.description || ''}
            onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
          />
          <input
            type="number"
            placeholder="Prix (€)"
            value={newService.price || ''}
            onChange={(e) => setNewService(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
          />
          <input
            type="number"
            placeholder="Durée (minutes)"
            value={newService.duration || ''}
            onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
          />
        </div>

        <button
          onClick={addService}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors font-semibold text-sm sm:text-base"
        >
          Ajouter le service
        </button>
      </div>

      {/* Services List */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-white">Services existants</h3>

        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/50 rounded-lg p-3 sm:p-6 border border-accent/20"
          >
            {editingId === service.id ? (
              // Edit Mode
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(service.id, { name: e.target.value })}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white focus:outline-none focus:border-accent text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    value={service.description}
                    onChange={(e) => updateService(service.id, { description: e.target.value })}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white focus:outline-none focus:border-accent text-sm sm:text-base"
                  />
                  <input
                    type="number"
                    value={service.price}
                    onChange={(e) => updateService(service.id, { price: parseInt(e.target.value) || 0 })}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white focus:outline-none focus:border-accent text-sm sm:text-base"
                  />
                  <input
                    type="number"
                    value={service.duration}
                    onChange={(e) => updateService(service.id, { duration: parseInt(e.target.value) || 0 })}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-accent/20 rounded-lg text-white focus:outline-none focus:border-accent text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="w-full sm:w-auto px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors text-sm sm:text-base"
                  >
                    Terminer
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{service.name}</h4>
                  <p className="text-gray-400 mb-2 sm:mb-3 text-sm">{service.description}</p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
                    <span>Prix: {service.price}€</span>
                    <span>Durée: {service.duration} min</span>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <button
                    onClick={() => setEditingId(service.id)}
                    className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}