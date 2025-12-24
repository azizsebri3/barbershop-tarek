'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Image, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    router.push('/admin')
  }

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/gallery',
      label: 'Galerie Photos',
      icon: Image,
    },
  ]

  return (
    <nav className="bg-secondary/80 backdrop-blur-md border-b border-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Admin Tarek Salon</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent text-primary'
                        : 'text-gray-300 hover:bg-accent/10 hover:text-accent'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline font-medium">Déconnexion</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex pb-3 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-primary'
                      : 'text-gray-400 hover:text-accent'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
