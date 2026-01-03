import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Lazy load pour éviter les erreurs SSR
const AdminMobileNav = dynamic(() => import('@/components/admin/AdminMobileNav'))

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-primary">
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <AdminMobileNav />
    </div>
  )
}