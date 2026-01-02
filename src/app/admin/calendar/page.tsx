'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import AdminCalendarSimple from '@/components/admin/AdminCalendarSimple'
import { Calendar, Home } from 'lucide-react'

export default function AdminCalendarPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home size={20} />
              <span>Admin</span>
            </Link>
            <span className="text-gray-600">/</span>
            <div className="flex items-center space-x-2 text-white">
              <Calendar size={20} className="text-accent" />
              <span>Calendrier</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Elite Services Admin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Calendrier */}
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          }
        >
          <AdminCalendarSimple />
        </Suspense>
      </main>
    </div>
  )
}