'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function PageContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  return <main className={isAdmin ? '' : 'pb-20 pt-16 md:pb-0'}>{children}</main>
}
